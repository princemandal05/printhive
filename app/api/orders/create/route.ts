import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
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
    } = body

    const qty = Number.isInteger(Number(quantity)) && Number(quantity) > 0 ? Number(quantity) : 1

    let calculatedUnitPrice = 0
    let derivedSellerId: string | null = null
    let derivedDesignerId: string | null = null
    let derivedPrinterOwnerId: string | null = null

    // 1. Fetch authoritative product price and seller if product_id is provided
    if (product_id) {
      const { data: product, error: productErr } = await supabase
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
      const { data: design, error: designErr } = await supabase
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
      const { data: printer, error: printerErr } = await supabase
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

    // If no target item was supplied, require valid price
    const total = Math.round(calculatedUnitPrice * qty * 100) / 100

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: 'Order total amount must be a finite, positive number' }, { status: 400 })
    }

    // Exact Escrow breakdown math: two shares rounded, third calculated from total minus rounded values
    const printerPayout = Math.round(total * 0.70 * 100) / 100
    const designerRoyalty = Math.round(total * 0.15 * 100) / 100
    const platformFee = Math.round((total - printerPayout - designerRoyalty) * 100) / 100

    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
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
        status: 'PENDING_PAYMENT',
        payment_status: 'pending',
        shipping_address: shipping_address || '',
        notes: notes || '',
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Error inserting order record:', insertError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Write initial status record in order_status_history
    const { error: historyErr } = await supabase.from('order_status_history').insert({
      order_id: order.id,
      status: 'PENDING_PAYMENT',
      notes: 'Order created, awaiting Razorpay payment confirmation.',
      updated_by: user.id,
    })

    if (historyErr) {
      console.error('Error inserting initial order status history:', historyErr)
      return NextResponse.json({ error: 'Order created, but failed to record initial history' }, { status: 500 })
    }

    // Send real-time notification to buyer
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: '📦 Order Placed',
      message: `Your order #${order.id.slice(0, 8)} for ₹${total} has been placed. Complete payment to initiate printing.`,
      type: 'order',
      link: `/orders/${order.id}`,
    })

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error in order creation API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
