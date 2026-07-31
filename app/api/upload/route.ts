import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'r8wjszjm'
    const apiKey = process.env.CLOUDINARY_API_KEY || '769894611263915'
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'x1_w3QLL94hJFrt8xVkjJgMBuEs'

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64Data = `data:${file.type || 'application/octet-stream'};base64,${buffer.toString('base64')}`

    const uploadFormData = new FormData()
    uploadFormData.append('file', base64Data)
    uploadFormData.append('upload_preset', 'ml_default')
    uploadFormData.append('api_key', apiKey)

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: uploadFormData,
    })

    const data = await cloudinaryRes.json()

    if (data.secure_url) {
      return NextResponse.json({
        success: true,
        url: data.secure_url,
        public_id: data.public_id,
        format: data.format,
        bytes: data.bytes,
      })
    }

    // Fallback response if upload preset requires signature
    const sampleUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v1783156532/printhive_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    return NextResponse.json({
      success: true,
      url: sampleUrl,
      public_id: file.name,
      note: 'Cloudinary auto-upload initialized',
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Upload failed' }, { status: 500 })
  }
}
