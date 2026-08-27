import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required to create an order' }, { status: 401 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 })
    }

    const {
      product_id,
      design_id,
      printer_id,
      quantity,
      shipping_address,
      notes,
      custom_total,
      initial_status,
    } = body

    const qty = Number.isInteger(Number(quantity)) && Number(quantity) > 0 ? Number(quantity) : 1

    let calculatedUnitPrice = 0
    let derivedSellerId: string | null = null
    let derivedDesignerId: string | null = null
    let derivedPrinterOwnerId: string | null = null

    const db = adminSupabase || supabase

    // 1. Fetch authoritative product price and seller if product_id is provided
    if (product_id) {
      const { data: product, error: productErr } = await db
        .from('products')
        .select('id, price, seller_id')
        .eq('id', product_id)
        .maybeSingle()

      if (productErr || !product) {
        return NextResponse.json({ error: 'Referenced product not found' }, { status: 404 })
      }
      calculatedUnitPrice += Number(product.price) || 0
      derivedSellerId = product.seller_id
    }

    // 2. Fetch authoritative design price and designer if design_id is provided
    if (design_id) {
      const { data: design, error: designErr } = await db
        .from('designs')
        .select('id, price, designer_id')
        .eq('id', design_id)
        .maybeSingle()

      if (designErr || !design) {
        return NextResponse.json({ error: 'Referenced design model not found' }, { status: 404 })
      }
      calculatedUnitPrice += Number(design.price) || 0
      derivedDesignerId = design.designer_id
    }

    // 3. Fetch authoritative printer base price and owner if printer_id is provided
    if (printer_id) {
      const { data: printer, error: printerErr } = await db
        .from('printers')
        .select('id, base_price, owner_id')
        .eq('id', printer_id)
        .maybeSingle()

      if (printerErr || !printer) {
        return NextResponse.json({ error: 'Referenced printer hub not found' }, { status: 404 })
      }
      calculatedUnitPrice += Number(printer.base_price) || 0
      derivedPrinterOwnerId = printer.owner_id
    }

    // Determine total amount (using custom_total if passed from instant slicer calculations)
    const computedTotal = Math.round(calculatedUnitPrice * qty * 100) / 100
    const total = (Number(custom_total) > 0) ? Math.round(Number(custom_total) * 100) / 100 : computedTotal

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: 'Order total amount must be a finite, positive number' }, { status: 400 })
    }

    // Exact Escrow breakdown math: two shares rounded, third calculated from total minus rounded values
    const printerPayout = Math.round(total * 0.70 * 100) / 100
    const designerRoyalty = Math.round(total * 0.15 * 100) / 100
    const platformFee = Math.round((total - printerPayout - designerRoyalty) * 100) / 100

    const orderStatus = initial_status || (printer_id ? 'PRINTER_ASSIGNED' : 'PENDING_PAYMENT')

    const insertPayload: Record<string, any> = {
      user_id: user.id,
      buyer_id: user.id,
      seller_id: derivedSellerId,
      designer_id: derivedDesignerId,
      printer_owner_id: derivedPrinterOwnerId,
      product_id: product_id || null,
      design_id: design_id || null,
      printer_id: printer_id || null,
      total_amount: total,
      total_price: total,
      total: total,
      price: total,
      amount: total,
      printer_payout: printerPayout,
      printer_share: printerPayout,
      designer_royalty: designerRoyalty,
      designer_share: designerRoyalty,
      platform_fee: platformFee,
      platform_share: platformFee,
      status: orderStatus,
      payment_status: 'pending',
      shipping_address: typeof shipping_address === 'string' ? shipping_address : JSON.stringify(shipping_address || {}),
      notes: notes || '',
      created_at: new Date().toISOString(),
    }

    const { data: order, error: insertError } = await db
      .from('orders')
      .insert(insertPayload)
      .select('*')
      .single()

    if (insertError) {
      console.error('Error inserting order record:', insertError)
      return NextResponse.json({ error: insertError.message || 'Failed to create order' }, { status: 500 })
    }

    // Write initial status record in order_status_history
    const historyNotes = orderStatus === 'PRINTER_ASSIGNED'
      ? 'Custom print request dispatched to printer hub. Awaiting operator acceptance before payment.'
      : 'Order created, awaiting Razorpay payment confirmation.'

    const { error: historyErr } = await db.from('order_status_history').insert({
      order_id: order.id,
      status: orderStatus,
      notes: historyNotes,
      updated_by: user.id,
      created_at: new Date().toISOString(),
    })

    if (historyErr) {
      console.warn('Initial order status history warning:', historyErr.message)
    }

    // Send real-time notification to printer owner if assigned
    if (derivedPrinterOwnerId) {
      await db.from('notifications').insert({
        user_id: derivedPrinterOwnerId,
        title: '🖨️ New Print Job Request',
        message: `New print request #${order.id.slice(0, 8)} for ₹${total} received. Review specs and accept the job.`,
        type: 'order',
        link: `/dashboard/printer-owner`,
        created_at: new Date().toISOString(),
      })
    }

    // Send real-time notification to buyer
    await db.from('notifications').insert({
      user_id: user.id,
      title: '📦 Print Request Dispatched',
      message: `Your request #${order.id.slice(0, 8)} has been sent to the printer hub for review.`,
      type: 'order',
      link: `/orders/${order.id}`,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error in order creation API:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
