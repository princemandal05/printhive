import { updateOrderStatus } from '@/utils/order-lifecycle'
import { sendNotification } from '@/utils/notifications'

export type SettlePaymentParams = {
  order_id?: string
  razorpay_order_id?: string
  razorpay_payment_id: string
  razorpay_signature?: string
  actor_id?: string
}

export async function settlePayment(adminSupabase: any, params: SettlePaymentParams) {
  const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, actor_id } = params

  // 1. Idempotency Check: Prevent duplicate payment settlement
  const { data: existingTxn } = await adminSupabase
    .from('transactions')
    .select('id, status, order_id')
    .eq('razorpay_payment_id', razorpay_payment_id)
    .eq('status', 'captured')
    .maybeSingle()

  if (existingTxn) {
    return {
      success: true,
      verified: true,
      idempotent: true,
      order_id: existingTxn.order_id || order_id,
      message: 'Payment already processed and settled.',
    }
  }

  // 2. Fetch Order record
  let orderQuery = adminSupabase.from('orders').select('*')
  if (order_id) {
    orderQuery = orderQuery.eq('id', order_id)
  } else if (razorpay_order_id) {
    orderQuery = orderQuery.eq('razorpay_order_id', razorpay_order_id)
  }

  const { data: order, error: orderErr } = await orderQuery.maybeSingle()
  if (orderErr || !order) {
    return { success: false, error: 'Order not found in database', status: 404 }
  }

  const targetOrderId = order.id

  // 3. Integer Paisa Arithmetic for 70/15/15 Escrow Split
  const orderAmount = Number(order.total_amount || order.total_price || order.total || order.price || order.amount)
  if (!orderAmount || isNaN(orderAmount) || orderAmount <= 0) {
    return { success: false, error: 'Invalid order total in database', status: 400 }
  }

  const amountInPaisa = Math.round(orderAmount * 100)
  const printerPayoutPaisa = Math.floor(amountInPaisa * 0.70)
  const designerRoyaltyPaisa = Math.floor(amountInPaisa * 0.15)
  const platformFeePaisa = amountInPaisa - (printerPayoutPaisa + designerRoyaltyPaisa)

  const printerPayout = printerPayoutPaisa / 100
  const designerRoyalty = designerRoyaltyPaisa / 100
  const platformFee = platformFeePaisa / 100

  // 4. Record Captured Transaction
  const { error: txnErr } = await adminSupabase.from('transactions').insert({
    order_id: targetOrderId,
    razorpay_order_id: razorpay_order_id || order.razorpay_order_id || null,
    razorpay_payment_id,
    razorpay_signature: razorpay_signature || 'webhook_verified',
    amount: orderAmount,
    currency: 'INR',
    status: 'captured',
    printer_payout: printerPayout,
    designer_royalty: designerRoyalty,
    platform_fee: platformFee,
    created_at: new Date().toISOString(),
  })

  if (txnErr && !txnErr.message.includes('duplicate')) {
    console.error('Failed to log captured transaction:', txnErr.message)
  }

  // 5. Create or reuse Escrow Payout records
  const { data: existingEscrow } = await adminSupabase
    .from('escrow_payouts')
    .select('id')
    .eq('order_id', targetOrderId)

  if (!existingEscrow || existingEscrow.length === 0) {
    const { error: escrowErr } = await adminSupabase.from('escrow_payouts').insert([
      {
        order_id: targetOrderId,
        role: 'printer_owner',
        amount: printerPayout,
        status: 'held',
        created_at: new Date().toISOString(),
      },
      {
        order_id: targetOrderId,
        role: 'designer',
        amount: designerRoyalty,
        status: 'held',
        created_at: new Date().toISOString(),
      },
    ])

    if (escrowErr) {
      console.error('Failed to record escrow payouts:', escrowErr.message)
    }
  }

  // 6. Update order escrow status and payment ID without overwriting advanced statuses
  await adminSupabase
    .from('orders')
    .update({
      escrow_status: 'held_in_escrow',
      razorpay_payment_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', targetOrderId)

  // 7. Transition order lifecycle safely (PENDING_PAYMENT -> PAYMENT_CONFIRMED -> FINDING_PRINTER)
  // Preserve advanced status if order is already IN_PRODUCTION, SHIPPED, or COMPLETED
  const nonRegressableStatuses = ['IN_PRODUCTION', 'SLICING', 'READY_FOR_PRINT', 'PRINTING', 'QUALITY_CHECK', 'SHIPPED', 'DELIVERED', 'COMPLETED']
  
  if (!nonRegressableStatuses.includes(order.status)) {
    if (order.status === 'PENDING_PAYMENT') {
      const step1 = await updateOrderStatus(
        adminSupabase,
        targetOrderId,
        'PAYMENT_CONFIRMED',
        'Payment verified server-side with HMAC SHA-256.',
        actor_id || 'system',
        'PENDING_PAYMENT'
      )
      if (step1.success) {
        await updateOrderStatus(
          adminSupabase,
          targetOrderId,
          'FINDING_PRINTER',
          'Searching Leaflet OpenStreetMap for nearby printer hub.',
          actor_id || 'system',
          'PAYMENT_CONFIRMED'
        )
      }
    } else if (order.status === 'PAYMENT_CONFIRMED') {
      await updateOrderStatus(
        adminSupabase,
        targetOrderId,
        'FINDING_PRINTER',
        'Searching Leaflet OpenStreetMap for nearby printer hub.',
        actor_id || 'system',
        'PAYMENT_CONFIRMED'
      )
    }
  }

  // 8. Dispatch Authoritative Real-Time Notification to Buyer
  const buyerId = order.buyer_id || order.user_id
  if (buyerId) {
    await sendNotification(adminSupabase, {
      userId: buyerId,
      title: `💳 Payment Confirmed for Order #${targetOrderId.slice(0, 8)}`,
      message: `Your payment of ₹${orderAmount} was verified with Razorpay Escrow. Your 3D print job is being routed.`,
      type: 'payment',
      link: `/orders/${targetOrderId}`,
    })
  }

  return {
    success: true,
    verified: true,
    order_id: targetOrderId,
    escrow: {
      status: 'held_in_escrow',
      printerPayout,
      designerRoyalty,
      platformFee,
    },
  }
}
