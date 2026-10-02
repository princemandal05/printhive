import { NextResponse } from 'next/server'
import crypto from 'crypto'

const ALLOWED_IMAGES = ['jpg', 'jpeg', 'png', 'webp']
const ALLOWED_MODELS = ['stl', '3mf', 'glb', 'gltf', 'obj', 'ply', '3ds', 'fbx', 'usdz', 'gcode', 'step', 'stp']
const MAX_IMAGE_SIZE = 15 * 1024 * 1024
const MAX_MODEL_SIZE = 100 * 1024 * 1024

async function processSignatureRequest(request: Request) {
  try {
    const { createClient } = await import('@/utils/supabase/server')
    const supabase = await createClient()

    let user = null
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim()
      if (token) {
        const { data } = await supabase.auth.getUser(token)
        if (data?.user) {
          user = data.user
        }
      }
    }

    if (!user) {
      const { data: { user: cookieUser } } = await supabase.auth.getUser()
      if (cookieUser) {
        user = cookieUser
      }
    }

    let isModel = false
    let fileName = ''
    let fileSize = 0
    let ext = ''

    if (request.method === 'POST') {
      try {
        const body = await request.json()
        isModel = body.isModel === true || body.isModel === 'true'
        fileName = body.fileName || ''
        fileSize = Number(body.fileSize || 0)
        ext = body.ext?.toLowerCase() || (fileName ? fileName.split('.').pop()?.toLowerCase() || '' : '')
      } catch {
        // Fallback to URL search params if body parsing fails
      }
    }

    if (!fileName && !ext) {
      const { searchParams } = new URL(request.url)
      isModel = isModel || searchParams.get('isModel') === 'true'
      fileName = fileName || searchParams.get('fileName') || ''
      fileSize = fileSize || Number(searchParams.get('fileSize') || 0)
      ext = ext || searchParams.get('ext')?.toLowerCase() || (fileName ? fileName.split('.').pop()?.toLowerCase() || '' : '')
    }

    if (ext) {
      const isImgExt = ALLOWED_IMAGES.includes(ext)
      const isModelExt = ALLOWED_MODELS.includes(ext)

      if (!isImgExt && !isModelExt) {
        return NextResponse.json(
          { success: false, error: `Invalid file extension .${ext}. Allowed formats: ${[...ALLOWED_IMAGES, ...ALLOWED_MODELS].join(', ')}` },
          { status: 400 }
        )
      }

      if (fileSize > 0) {
        const maxLimit = isModelExt ? MAX_MODEL_SIZE : MAX_IMAGE_SIZE
        if (fileSize > maxLimit) {
          return NextResponse.json(
            { success: false, error: `File size exceeds maximum allowed limit of ${isModelExt ? '100MB' : '15MB'}` },
            { status: 400 }
          )
        }
      }
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'r8wjszjm'
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'printhive_uploads'

    // If Cloudinary secrets are configured and user is authenticated, generate high-security signed credentials
    if (cloudName && apiKey && apiSecret && user) {
      const userId = user.id
      const timestamp = Math.round(new Date().getTime() / 1000)
      const folder = isModel ? `printhive/${userId}/models` : `printhive/${userId}/images`
      const assetFolder = folder
      const publicId = `${userId.slice(0, 8)}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
      const resourceType = isModel ? 'raw' : 'image'

      const strToSign = `asset_folder=${assetFolder}&folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
      const signature = crypto.createHash('sha1').update(strToSign).digest('hex')

      return NextResponse.json({
        success: true,
        timestamp,
        folder,
        asset_folder: assetFolder,
        public_id: publicId,
        signature,
        api_key: apiKey,
        cloud_name: cloudName,
        resource_type: resourceType,
        unsigned: false,
      })
    }

    // For images, provide direct unsigned preset routing for high availability
    if (!isModel && cloudName && uploadPreset) {
      return NextResponse.json({
        success: true,
        unsigned: true,
        upload_preset: uploadPreset,
        cloud_name: cloudName,
        resource_type: 'image',
      })
    }

    // If 3D model and user is unauthenticated
    if (isModel && !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required to generate 3D model upload signature' },
        { status: 401 }
      )
    }

    // If 3D model and secrets missing
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary storage service is not configured on server' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Unable to initialize upload credentials' },
      { status: 500 }
    )
  } catch (err: unknown) {
    const error = err as Error
    console.error('Error generating Cloudinary upload signature:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to generate upload signature' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return processSignatureRequest(request)
}

export async function POST(request: Request) {
  return processSignatureRequest(request)
}

