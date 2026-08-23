import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Maximum file upload limits
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB for images
const MAX_MODEL_SIZE = 100 * 1024 * 1024 // 100MB for 3D models

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
const ALLOWED_MODEL_EXTENSIONS = ['stl', '3mf', 'glb', 'gltf', 'obj', 'ply', '3ds', 'fbx', 'usdz', 'gcode', 'step', 'stp']

async function validateModelContent(file: File, ext: string): Promise<boolean> {
  if (!ALLOWED_MODEL_EXTENSIONS.includes(ext)) return false

  try {
    const buffer = await file.slice(0, 512).arrayBuffer()
    const bytes = new Uint8Array(buffer)
    if (bytes.length === 0) return false

    const headerText = new TextDecoder('utf-8', { fatal: false }).decode(bytes)

    if (ext === '3mf') {
      return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04
    }

    if (ext === 'stl') {
      const trimmed = headerText.trim().toLowerCase()
      if (trimmed.startsWith('solid')) return true
      return file.size >= 84
    }

    if (ext === 'obj') {
      return headerText.includes('v ') || headerText.includes('f ') || headerText.includes('#') || headerText.includes('mtllib')
    }

    return file.size > 0
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const { createClient } = await import('@/utils/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const userId = user?.id || 'guest-demo'

    const formData = await request.formData()
    const entry = formData.get('file')

    if (!entry || !(entry instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const file = entry as File
    const ext = file.name.split('.').pop()?.toLowerCase() || ''

    const isImage = ALLOWED_IMAGE_EXTENSIONS.includes(ext)
    const isModel = ALLOWED_MODEL_EXTENSIONS.includes(ext)

    if (!isImage && !isModel) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type .${ext}. Allowed formats: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}, ${ALLOWED_MODEL_EXTENSIONS.join(', ')}`,
        },
        { status: 400 }
      )
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Image size exceeds maximum limit of 10MB' },
        { status: 400 }
      )
    }

    if (isModel && file.size > MAX_MODEL_SIZE) {
      return NextResponse.json(
        { success: false, error: '3D model size exceeds maximum limit of 100MB' },
        { status: 400 }
      )
    }

    if (isModel) {
      const isVerifiedModel = await validateModelContent(file, ext)
      if (!isVerifiedModel) {
        return NextResponse.json(
          { success: false, error: 'Invalid or corrupt 3D model file content' },
          { status: 400 }
        )
      }
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'r8wjszjm'
    const apiKey = process.env.CLOUDINARY_API_KEY || '769894611263915'
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'x1_w3QLL94hJFrt8xVkjJgMBuEs'
    const preset = isModel
      ? (process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_MODELS || 'printhive_models')
      : (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'printhive_uploads')

    const folder = `printhive/${userId}`
    const assetFolder = `printhive/${userId}`
    const publicId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
    const timestamp = Math.round(new Date().getTime() / 1000)

    // Generate signed upload parameters for Cloudinary server API call
    const strToSign = `asset_folder=${assetFolder}&folder=${folder}&public_id=${publicId}&timestamp=${timestamp}&upload_preset=${preset}${apiSecret}`
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex')

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('upload_preset', preset)
    uploadFormData.append('api_key', apiKey)
    uploadFormData.append('timestamp', timestamp.toString())
    uploadFormData.append('folder', folder)
    uploadFormData.append('asset_folder', assetFolder)
    uploadFormData.append('public_id', publicId)
    uploadFormData.append('signature', signature)

    const resourceType = isModel ? 'raw' : 'image'

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: uploadFormData,
    })

    const data = await cloudinaryRes.json()

    if (cloudinaryRes.ok && data.secure_url) {
      return NextResponse.json({
        success: true,
        url: data.secure_url,
        secure_url: data.secure_url,
        cloudinary_public_id: data.public_id,
        public_id: data.public_id,
        resource_type: data.resource_type || resourceType,
        format: data.format || ext,
        file_size: data.bytes || file.size,
        bytes: data.bytes || file.size,
      })
    }

    const errorMessage = data.error?.message || 'Cloudinary upload failed: secure URL not returned'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: cloudinaryRes.status || 400 }
    )
  } catch (err: unknown) {
    const error = err as Error
    console.error('Upload route failure:', error)
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 })
  }
}
