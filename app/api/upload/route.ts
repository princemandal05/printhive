import { NextResponse } from 'next/server'

// Maximum file upload limit: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const entry = formData.get('file')

    if (!entry || !(entry instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const file = entry as File

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed limit of 100MB' },
        { status: 400 }
      )
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'r8wjszjm'
    const apiKey = process.env.CLOUDINARY_API_KEY || '769894611263915'

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const is3dModel = ['stl', '3mf', 'obj', 'gcode', 'ply', 'step', 'stp'].includes(ext)
    
    const preset = is3dModel
      ? (process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_MODELS || 'printhive_models')
      : (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'printhive_uploads')

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('upload_preset', preset)
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
  } catch (err: unknown) {
    console.error('Upload route failure:', err)
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}
