import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: Request) {
  try {
    const { createClient } = await import('@/utils/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isModel = searchParams.get('isModel') === 'true'

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'r8wjszjm'
    const apiKey = process.env.CLOUDINARY_API_KEY || '769894611263915'
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'x1_w3QLL94hJFrt8xVkjJgMBuEs'

    const timestamp = Math.round(new Date().getTime() / 1000)

    // Parameters to sign for Cloudinary
    // Cloudinary expects params sorted alphabetically: timestamp=...
    const strToSign = `timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex')

    return NextResponse.json({
      success: true,
      timestamp,
      signature,
      api_key: apiKey,
      cloud_name: cloudName,
      resource_type: isModel ? 'raw' : 'auto',
    })
  } catch (err: any) {
    console.error('Error generating Cloudinary upload signature:', err)
    return NextResponse.json({ success: false, error: 'Failed to generate upload signature' }, { status: 500 })
  }
}
