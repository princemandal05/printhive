import { NextResponse } from 'next/server'
import crypto from 'crypto'

const ALLOWED_IMAGES = ['jpg', 'jpeg', 'png', 'webp']
const ALLOWED_MODELS = ['stl', '3mf', 'glb', 'gltf', 'obj', 'ply', '3ds', 'fbx', 'usdz', 'gcode', 'step', 'stp']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_MODEL_SIZE = 100 * 1024 * 1024

export async function GET(request: Request) {
  try {
    const { createClient } = await import('@/utils/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const userId = user?.id || 'guest-demo'

    const { searchParams } = new URL(request.url)
    const isModel = searchParams.get('isModel') === 'true'
    const fileName = searchParams.get('fileName') || ''
    const fileSize = Number(searchParams.get('fileSize') || 0)
    const ext = searchParams.get('ext')?.toLowerCase() || (fileName ? fileName.split('.').pop()?.toLowerCase() || '' : '')

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
            { success: false, error: `File size exceeds maximum allowed limit of ${isModelExt ? '100MB' : '10MB'}` },
            { status: 400 }
          )
        }
      }
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'r8wjszjm'
    const apiKey = process.env.CLOUDINARY_API_KEY || '769894611263915'
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'x1_w3QLL94hJFrt8xVkjJgMBuEs'

    const timestamp = Math.round(new Date().getTime() / 1000)
    const folder = isModel ? `printhive/${userId}/models` : `printhive/${userId}/images`
    const assetFolder = folder
    const publicId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
    const resourceType = isModel ? 'raw' : 'image'

    // Signed parameters for raw and image Cloudinary uploads
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
  } catch (err: unknown) {
    const error = err as Error
    console.error('Error generating Cloudinary upload signature:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to generate upload signature' }, { status: 500 })
  }
}
