import { NextResponse } from 'next/server'

// Maximum file upload limit: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024

const ALLOWED_MODEL_EXTENSIONS = ['stl', '3mf', 'obj', 'gcode', 'ply', 'step', 'stp']

async function validateModelContent(file: File, ext: string): Promise<boolean> {
  if (!ALLOWED_MODEL_EXTENSIONS.includes(ext)) return false

  try {
    const buffer = await file.slice(0, 512).arrayBuffer()
    const bytes = new Uint8Array(buffer)
    if (bytes.length === 0) return false

    const headerText = new TextDecoder('utf-8', { fatal: false }).decode(bytes)

    if (ext === '3mf') {
      // 3MF is a ZIP container with magic header PK\x03\x04
      return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04
    }

    if (ext === 'stl') {
      // ASCII STL starts with "solid", binary STL requires at least 84 bytes header
      const trimmed = headerText.trim().toLowerCase()
      if (trimmed.startsWith('solid')) return true
      return file.size >= 84
    }

    if (ext === 'obj') {
      return headerText.includes('v ') || headerText.includes('f ') || headerText.includes('#') || headerText.includes('mtllib')
    }

    if (ext === 'gcode') {
      return headerText.includes('G') || headerText.includes('M') || headerText.includes(';')
    }

    return file.size > 0
  } catch {
    return false
  }
}

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

    if (!cloudName) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary configuration missing: cloudName required' },
        { status: 500 }
      )
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const looksLikeModel = ALLOWED_MODEL_EXTENSIONS.includes(ext)
    const isVerifiedModel = looksLikeModel ? await validateModelContent(file, ext) : false

    const preset = isVerifiedModel
      ? (process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_MODELS || 'printhive_models')
      : (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'printhive_uploads')

    if (!preset) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary upload preset configuration missing' },
        { status: 500 }
      )
    }

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('upload_preset', preset)
    uploadFormData.append('api_key', apiKey)

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: uploadFormData,
    })

    const data = await cloudinaryRes.json()

    if (cloudinaryRes.ok && data.secure_url) {
      return NextResponse.json({
        success: true,
        url: data.secure_url,
        public_id: data.public_id,
        format: data.format,
        bytes: data.bytes,
      })
    }

    // Require secure_url from Cloudinary - do NOT report success with dummy fallbacks
    const errorMessage = data.error?.message || 'Cloudinary upload failed: secure URL not returned'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: cloudinaryRes.status || 400 }
    )
  } catch (err: unknown) {
    console.error('Upload route failure:', err)
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}
