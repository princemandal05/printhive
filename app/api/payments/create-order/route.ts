import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { updateOrderStatus } from '@/utils/order-lifecycle'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // 1. Authenticate caller
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Log in required to initiate payment' }, { status: 401 })
    }

    let body: Record<string, any>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    let { orderId, items, shippingAddress, paymentMethod, isCod, notes } = body
    let targetOrderId = (typeof orderId === 'string' && orderId.trim()) ? orderId.trim() : null

    // 2. If client supplied items directly, establish order atomically server-side using adminSupabase (bypassing client RLS zeroing)
    if (!targetOrderId && Array.isArray(items) && items.length > 0) {
      targetOrderId = crypto.randomUUID()

      let serverCalculatedSubtotal = 0
      for (const item of items) {
        const rawId = String(item?.id || '')
        const cleanId = rawId.startsWith('design-') ? rawId.split('-')[1] : rawId
        const qty = Math.max(1, Number(item?.quantity) || 1)
        let itemPrice = Number(item?.price) || 0

        // Check if database catalog price exists
        if (cleanId) {
          const { data: dbDesign } = await adminSupabase
            .from('designs')
            .select('price')
            .eq('id', cleanId)
            .maybeSingle()

          if (dbDesign && typeof dbDesign.price === 'number' && dbDesign.price > 0) {
            itemPrice = dbDesign.price
          } else {
            const { data: dbProduct } = await adminSupabase
              .from('products')
              .select('price')
              .eq('id', cleanId)
              .maybeSingle()

            if (dbProduct && typeof dbProduct.price === 'number' && dbProduct.price > 0) {
              itemPrice = dbProduct.price
            }
          }
        }

        serverCalculatedSubtotal += (itemPrice > 0 ? itemPrice : 150) * qty
      }

      const shippingFee = serverCalculatedSubtotal === 0 || serverCalculatedSubtotal > 1500 ? 0 : 99
      const gstFee = Math.round(serverCalculatedSubtotal * 0.18)
      const orderAmount = serverCalculatedSubtotal + shippingFee + gstFee

      const amountInPaisa = Math.round(orderAmount * 100)
      const printerPayoutPaisa = Math.floor(amountInPaisa * 0.70)
      const designerRoyaltyPaisa = Math.floor(amountInPaisa * 0.15)
      const platformFeePaisa = amountInPaisa - (printerPayoutPaisa + designerRoyaltyPaisa)

      const initialStatus = isCod ? 'FINDING_PRINTER' : 'PENDING_PAYMENT'
      const initialPaymentStatus = isCod ? 'cod_pending' : 'pending'

      const { error: createOrderErr } = await adminSupabase.from('orders').insert({
        id: targetOrderId,
        buyer_id: user.id,
        buyer_email: user.email,
        status: initialStatus,
        payment_status: initialPaymentStatus,
        payment_method: paymentMethod || (isCod ? 'cod' : 'upi'),
        total_amount: orderAmount,
        total_price: orderAmount,
        total: orderAmount,
        price: orderAmount,
        amount: orderAmount,
        items,
        shipping_address: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress || {}),
        printer_payout: printerPayoutPaisa / 100,
        printer_share: printerPayoutPaisa / 100,
        designer_royalty: designerRoyaltyPaisa / 100,
        designer_share: designerRoyaltyPaisa / 100,
        platform_fee: platformFeePaisa / 100,
        platform_share: platformFeePaisa / 100,
        created_at: new Date().toISOString(),
      })

      if (createOrderErr) {
        console.error('Failed to create order record server-side:', createOrderErr.message)
        return NextResponse.json({ error: `Order creation failed: ${createOrderErr.message}` }, { status: 500 })
      }

      await updateOrderStatus(
        adminSupabase,
        targetOrderId,
        initialStatus,
        isCod ? 'Order placed with Pay on Delivery. Routing to nearby verified 3D printer hub.' : 'Order established, awaiting payment confirmation.',
        user.id
      )

      // If Cash on Delivery, return early
      if (isCod) {
        return NextResponse.json({
          success: true,
          isCod: true,
          orderId: targetOrderId,
          amount: orderAmount,
        })
      }
    }

    if (!targetOrderId) {
      return NextResponse.json({ error: 'Valid orderId or items array is required' }, { status: 400 })
    }

    // 3. Fetch order record from database
    const { data: order, error: fetchErr } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('id', targetOrderId)
      .maybeSingle()

    if (fetchErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 4. Verify caller owns the order or is Admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'
    const orderBuyerId = order.buyer_id || order.user_id

    if (!isAdmin && (!orderBuyerId || orderBuyerId !== user.id)) {
      return NextResponse.json({ error: 'Forbidden: You do not own this order' }, { status: 403 })
    }

    // 5. Calculate authoritative order amount server-side from database records & items
    let serverCalculatedSubtotal = 0
    const orderItems = Array.isArray(order.items) ? order.items : []

    if (orderItems.length > 0) {
      for (const item of orderItems) {
        const rawId = String(item?.id || '')
        const cleanId = rawId.startsWith('design-') ? rawId.split('-')[1] : rawId
        const qty = Math.max(1, Number(item?.quantity) || 1)
        let itemPrice = Number(item?.price) || 0

        if (cleanId) {
          const { data: dbDesign } = await adminSupabase
            .from('designs')
            .select('price')
            .eq('id', cleanId)
            .maybeSingle()

          if (dbDesign && typeof dbDesign.price === 'number' && dbDesign.price > 0) {
            itemPrice = dbDesign.price
          } else {
            const { data: dbProduct } = await adminSupabase
              .from('products')
              .select('price')
              .eq('id', cleanId)
              .maybeSingle()

            if (dbProduct && typeof dbProduct.price === 'number' && dbProduct.price > 0) {
              itemPrice = dbProduct.price
            }
          }
        }

        serverCalculatedSubtotal += (itemPrice > 0 ? itemPrice : 150) * qty
      }
    }

    const dbStoredAmount = Number(order.total_amount || order.total_price || order.total || order.price || order.amount)
    const baseSubtotal = serverCalculatedSubtotal > 0 ? serverCalculatedSubtotal : (dbStoredAmount > 0 ? dbStoredAmount : 250)

    const shippingFee = baseSubtotal === 0 || baseSubtotal > 1500 ? 0 : 99
    const gstFee = Math.round(baseSubtotal * 0.18)
    const orderAmount = baseSubtotal + shippingFee + gstFee

    // 6. Precise Integer Paisa Arithmetic (70/15/15 Escrow Split)
    const amountInPaisa = Math.round(orderAmount * 100)
    const printerPayoutPaisa = Math.floor(amountInPaisa * 0.70)
    const designerRoyaltyPaisa = Math.floor(amountInPaisa * 0.15)
    const platformFeePaisa = amountInPaisa - (printerPayoutPaisa + designerRoyaltyPaisa)

    const printerPayout = printerPayoutPaisa / 100
    const designerRoyalty = designerRoyaltyPaisa / 100
    const platformFee = platformFeePaisa / 100

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const hasLiveKeys = Boolean(keyId && keySecret && !keyId.startsWith('rzp_test_mock') && !keyId.includes('your_key'))

    let razorpayOrderId: string | null = null
    let isMock = false

    // 7. Call Razorpay API server-side if live credentials exist
    if (hasLiveKeys) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: amountInPaisa,
            currency: 'INR',
            receipt: `rcpt_${targetOrderId.slice(0, 10)}`,
            notes: (typeof notes === 'object' && notes ? notes : { app: 'PrintHive', order_id: targetOrderId }),
          }),
        })

        if (rzpResponse.ok) {
          const rzpData = await rzpResponse.json()
          razorpayOrderId = rzpData.id
        } else {
          console.warn('Razorpay live order API failed, falling back to mock sandbox')
          isMock = true
          razorpayOrderId = `order_${Math.random().toString(36).substring(2, 14)}`
        }
      } catch (e) {
        console.warn('Razorpay live network error, falling back to mock sandbox:', e)
        isMock = true
        razorpayOrderId = `order_${Math.random().toString(36).substring(2, 14)}`
      }
    } else {
      isMock = true
      razorpayOrderId = `order_${Math.random().toString(36).substring(2, 14)}`
    }

    // 8. Record transaction and update order in database
    await adminSupabase.from('transactions').insert({
      order_id: targetOrderId,
      razorpay_order_id: razorpayOrderId,
      amount: orderAmount,
      currency: 'INR',
      status: 'created',
      printer_payout: printerPayout,
      designer_royalty: designerRoyalty,
      platform_fee: platformFee,
      created_at: new Date().toISOString(),
    })

    await adminSupabase
      .from('orders')
      .update({
        razorpay_order_id: razorpayOrderId,
        status: 'PENDING_PAYMENT',
        total_amount: orderAmount,
        total_price: orderAmount,
        total: orderAmount,
        price: orderAmount,
        amount: orderAmount,
        printer_payout: printerPayout,
        printer_share: printerPayout,
        designer_royalty: designerRoyalty,
        designer_share: designerRoyalty,
        platform_fee: platformFee,
        platform_share: platformFee,
      })
      .eq('id', targetOrderId)

    return NextResponse.json({
      success: true,
      orderId: targetOrderId,
      razorpayOrderId,
      keyId: hasLiveKeys ? keyId : 'rzp_test_mock',
      isMock,
      amount: amountInPaisa,
      currency: 'INR',
      breakdown: {
        total: orderAmount,
        printerPayout,
        designerRoyalty,
        platformFee,
      },
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Payment order creation exception:', error)
    return NextResponse.json({ error: error.message || 'Payment order creation failed' }, { status: 500 })
  }
}

