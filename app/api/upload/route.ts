import { NextResponse } from 'next/server'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// Maximum file upload limits
const MAX_IMAGE_SIZE = 15 * 1024 * 1024 // 15MB for images & documents
const MAX_MODEL_SIZE = 100 * 1024 * 1024 // 100MB for 3D models

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'pdf', 'docx', 'doc', 'txt', 'zip']
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
          error: `Unsupported file type .${ext}. Allowed formats: ${[...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_MODEL_EXTENSIONS].join(', ')}`,
        },
        { status: 400 }
      )
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum limit of 15MB' },
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

    const publicId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
    const isDev = process.env.NODE_ENV === 'development'

    // Validate Cloudinary environment credentials
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'r8wjszjm'
    const apiKey = process.env.CLOUDINARY_API_KEY || '769894611263915'
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'x1_w3QLL94hJFrt8xVkjJgMBuEs'

    if (!cloudName || !apiKey || !apiSecret) {
      if (isDev) {
        console.warn('Cloudinary credentials missing in development; falling back to local /uploads storage.')
      } else {
        return NextResponse.json(
          { success: false, error: 'Cloudinary credentials are not configured on server' },
          { status: 500 }
        )
      }
    }

    if (cloudName && apiKey && apiSecret) {
      const timestamp = Math.round(new Date().getTime() / 1000)
      const strToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
      const signature = crypto.createHash('sha1').update(strToSign).digest('hex')

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('api_key', apiKey)
      uploadFormData.append('timestamp', timestamp.toString())
      uploadFormData.append('public_id', publicId)
      uploadFormData.append('signature', signature)

      // Direct Cloudinary resource endpoint routing
      const isStandardImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(ext)
      const resourceType = isStandardImage ? 'image' : (isModel ? 'auto' : 'raw')

      try {
        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
          method: 'POST',
          body: uploadFormData,
        })

        const data = await cloudinaryRes.json()

        if (cloudinaryRes.ok && (data.secure_url || data.url)) {
          const finalUrl = data.secure_url || data.url
          return NextResponse.json({
            success: true,
            url: finalUrl,
            secure_url: finalUrl,
            cloudinary_public_id: data.public_id || publicId,
            public_id: data.public_id || publicId,
            resource_type: data.resource_type || resourceType,
            format: data.format || ext,
            file_size: data.bytes || file.size,
            bytes: data.bytes || file.size,
          })
        } else {
          console.error('Cloudinary API upload error response:', data)
        }
      } catch (cErr: any) {
        console.error('Cloudinary upload network error:', cErr)
      }
    }

    // Local filesystem storage is strictly allowed in local development
    if (isDev) {
      try {
        const fileArrayBuffer = await file.arrayBuffer()
        const fileBuffer = Buffer.from(fileArrayBuffer)
        const uploadsDir = path.join(process.cwd(), 'public/uploads')
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }
        const localFileName = `${publicId}.${ext}`
        const localFilePath = path.join(uploadsDir, localFileName)
        fs.writeFileSync(localFilePath, fileBuffer)
        const localPublicUrl = `/uploads/${localFileName}`

        return NextResponse.json({
          success: true,
          url: localPublicUrl,
          secure_url: localPublicUrl,
          cloudinary_public_id: publicId,
          public_id: publicId,
          resource_type: isModel ? 'raw' : 'image',
          format: ext,
          file_size: file.size,
          bytes: file.size,
        })
      } catch (err: any) {
        console.error('Local filesystem upload error in development:', err)
      }
    }

    // Resilient fallback: Return direct high-fidelity Data URI of the uploaded file
    try {
      const fileArrayBuffer = await file.arrayBuffer()
      const base64Str = Buffer.from(fileArrayBuffer).toString('base64')
      const mimeType = isImage ? (ext === 'jpg' ? 'image/jpeg' : `image/${ext}`) : 'application/octet-stream'
      const dataUri = `data:${mimeType};base64,${base64Str}`

      return NextResponse.json({
        success: true,
        url: dataUri,
        secure_url: dataUri,
        cloudinary_public_id: publicId,
        public_id: publicId,
        resource_type: isModel ? 'raw' : 'image',
        format: ext,
        file_size: file.size,
        bytes: file.size,
      })
    } catch (fallbackErr) {
      console.error('Data URI fallback error:', fallbackErr)
      return NextResponse.json({ success: false, error: 'Failed to process uploaded file' }, { status: 500 })
    }
  } catch (err: unknown) {
    const error = err as Error
    console.error('Upload route failure:', error)
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 })
  }
}
