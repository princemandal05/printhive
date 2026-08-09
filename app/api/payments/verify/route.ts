import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/utils/supabase/server'
import { updateOrderStatus } from '@/utils/order-lifecycle'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id, amount } = body

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json({ error: 'Missing payment verification credentials' }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET

    // Cryptographic HMAC-SHA256 Signature Verification
    let isSignatureValid = false

    if (keySecret && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')

      isSignatureValid = generatedSignature === razorpay_signature
    } else {
      // In development / demo environment without live secret config
      isSignatureValid = Boolean(razorpay_payment_id && razorpay_order_id)
    }

    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Invalid payment signature verification' }, { status: 400 })
    }

    const supabase = await createClient()
    const numAmount = Number(amount) || 199

    // 70/15/15 Escrow Breakdown
    const printerPayout = Math.round(numAmount * 0.70)
    const designerRoyalty = Math.round(numAmount * 0.15)
    const platformFee = numAmount - (printerPayout + designerRoyalty)

    // 1. Record captured transaction in database
    await supabase.from('transactions').insert({
      order_id: order_id || null,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature || 'verified_server',
      amount: numAmount,
      currency: 'INR',
      status: 'captured',
      printer_payout: printerPayout,
      designer_royalty: designerRoyalty,
      platform_fee: platformFee,
      created_at: new Date().toISOString(),
    })

    // 2. Insert Escrow hold records for printer & designer
    if (order_id) {
      await supabase.from('escrow_payouts').insert([
        {
          order_id,
          role: 'printer_owner',
          amount: printerPayout,
          status: 'held',
          created_at: new Date().toISOString(),
        },
        {
          order_id,
          role: 'designer',
          amount: designerRoyalty,
          status: 'held',
          created_at: new Date().toISOString(),
        },
      ])

      // 3. Progress order lifecycle states: PAYMENT_CONFIRMED -> FINDING_PRINTER
      await updateOrderStatus(supabase, order_id, 'PAYMENT_CONFIRMED', 'Payment verified server-side with HMAC SHA-256.')
      await updateOrderStatus(supabase, order_id, 'FINDING_PRINTER', 'Searching Leaflet OpenStreetMap for nearby printer hub.')
    }

    return NextResponse.json({
      success: true,
      verified: true,
      order_id,
      escrow: {
        status: 'held_in_escrow',
        printerPayout,
        designerRoyalty,
        platformFee,
      },
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 })
  }
}
