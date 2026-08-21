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

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ success: false, error: 'Cloudinary upload signature parameters not configured in environment variables.' }, { status: 500 })
    }

    const timestamp = Math.round(new Date().getTime() / 1000)
    const folder = `printhive/${user.id}`
    const publicId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`

    // Parameters to sign for Cloudinary (alphabetically sorted)
    // Cloudinary expects: folder=...&public_id=...&timestamp=...<API_SECRET>
    const strToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex')

    return NextResponse.json({
      success: true,
      timestamp,
      folder,
      public_id: publicId,
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
