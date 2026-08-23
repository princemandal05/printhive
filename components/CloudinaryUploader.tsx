'use client'

import { useState, useRef } from 'react'

export type CloudinaryMetadata = {
  secure_url: string
  cloudinary_public_id: string
  public_id: string
  resource_type: string
  format: string
  bytes: number
  file_size: number
  original_filename: string
  file_name: string
  extension: string
  file_format: string
  mime_type: string
}

type CloudinaryUploaderProps = {
  acceptType?: 'image' | 'model' | 'any'
  uploadType?: 'image' | 'model' | 'any'
  onUploadStart?: () => void
  onUploadSuccess?: (metadata: CloudinaryMetadata) => void
  onUploadError?: (error: string) => void
  label?: string
  currentUrl?: string
}

const ALLOWED_IMAGES = ['jpg', 'jpeg', 'png', 'webp']
const ALLOWED_MODELS = ['stl', '3mf', 'glb', 'gltf', 'obj', 'ply', '3ds', 'fbx', 'usdz', 'gcode', 'step', 'stp']

export default function CloudinaryUploader({
  acceptType = 'any',
  uploadType,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  label = 'Upload File to Cloudinary',
  currentUrl,
}: CloudinaryUploaderProps) {
  const activeType = uploadType || acceptType
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentUrl || null)
  const [uploadedMeta, setUploadedMeta] = useState<CloudinaryMetadata | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const acceptedExtensions =
    activeType === 'image'
      ? ALLOWED_IMAGES
      : activeType === 'model'
      ? ALLOWED_MODELS
      : [...ALLOWED_IMAGES, ...ALLOWED_MODELS]

  const acceptAttribute =
    activeType === 'image'
      ? 'image/jpeg,image/png,image/webp'
      : activeType === 'model'
      ? '.stl,.3mf,.glb,.gltf,.obj,.ply,.3ds,.fbx,.usdz,.gcode,.step,.stp'
      : 'image/*,.stl,.3mf,.glb,.gltf,.obj,.ply,.3ds,.fbx,.usdz,.gcode,.step,.stp'

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMsg(null)
    const ext = file.name.split('.').pop()?.toLowerCase() || ''

    if (activeType === 'model') {
      console.log('SELECTED 3D FILE:', {
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        extension: ext,
      })
    }

    // Client-side extension validation (not MIME type based)
    if (!acceptedExtensions.includes(ext)) {
      const err = `Invalid file format .${ext}. Allowed formats: ${acceptedExtensions.join(', ')}`
      console.error('File validation error:', err)
      setErrorMsg(err)
      if (onUploadError) onUploadError(err)
      return
    }

    const isImg = ALLOWED_IMAGES.includes(ext)
    const maxSize = isImg ? 10 * 1024 * 1024 : 100 * 1024 * 1024
    if (file.size > maxSize) {
      const err = `File size exceeds limit of ${isImg ? '10MB' : '100MB'}`
      console.error('File size error:', err)
      setErrorMsg(err)
      if (onUploadError) onUploadError(err)
      return
    }

    startUpload(file)
  }

  const startUpload = async (file: File) => {
    setUploading(true)
    setProgress(0)
    if (onUploadStart) onUploadStart()

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const isModel = ALLOWED_MODELS.includes(ext) || activeType === 'model'
    const fallbackMime = isModel ? `model/${ext}` : `image/${ext}`

    if (isModel) {
      console.log('STARTING 3D MODEL CLOUDINARY UPLOAD')
    }

    try {
      // 1. Fetch signed parameters from backend signature route with file metadata
      const sigRes = await fetch(`/api/upload/signature?isModel=${isModel}&fileName=${encodeURIComponent(file.name)}&fileSize=${file.size}&ext=${ext}`)
      const sigData = await sigRes.json()

      if (sigData.success) {
        const cloudName = sigData.cloud_name || 'r8wjszjm'
        const resourceType = isModel ? 'raw' : (sigData.resource_type || 'image')
        const directUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`

        if (isModel) {
          console.log('CLOUDINARY MODEL UPLOAD REQUEST', {
            cloudName,
            uploadPreset: sigData.upload_preset,
            resourceType,
            fileName: file.name,
            directUrl,
          })
        }

        const formData = new FormData()
        formData.append('file', file)
        if (sigData.api_key) formData.append('api_key', sigData.api_key)
        if (sigData.timestamp) formData.append('timestamp', sigData.timestamp.toString())
        if (sigData.folder) formData.append('folder', sigData.folder)
        if (sigData.asset_folder) formData.append('asset_folder', sigData.asset_folder)
        if (sigData.public_id) formData.append('public_id', sigData.public_id)
        if (sigData.signature) formData.append('signature', sigData.signature)

        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            setProgress(percent)
          }
        }

        xhr.onload = () => {
          setUploading(false)
          let resultData: any = null
          try {
            resultData = JSON.parse(xhr.responseText)
          } catch {
            resultData = null
          }

          if (isModel) {
            console.log('CLOUDINARY MODEL RESPONSE:', {
              status: xhr.status,
              ok: xhr.status >= 200 && xhr.status < 300,
              secure_url: resultData?.secure_url,
              public_id: resultData?.public_id,
              resource_type: resultData?.resource_type,
              format: resultData?.format || ext,
              bytes: resultData?.bytes || file.size,
              error: resultData?.error,
            })
          }

          if (xhr.status >= 200 && xhr.status < 300 && resultData?.secure_url) {
            const meta: CloudinaryMetadata = {
              secure_url: resultData.secure_url,
              cloudinary_public_id: resultData.public_id,
              public_id: resultData.public_id,
              resource_type: resultData.resource_type || (isModel ? 'raw' : 'image'),
              format: resultData.format || ext,
              bytes: resultData.bytes || file.size,
              file_size: resultData.bytes || file.size,
              original_filename: file.name,
              file_name: file.name,
              extension: ext,
              file_format: ext,
              mime_type: file.type || fallbackMime,
            }
            setUploadedUrl(resultData.secure_url)
            setUploadedMeta(meta)
            if (onUploadSuccess) onUploadSuccess(meta)
            return
          }

          // Handle upload error without swallowing
          const err = resultData?.error?.message || `Cloudinary upload failed with status ${xhr.status}`
          console.error('Cloudinary Model Upload Error:', err)
          setErrorMsg(err)
          if (onUploadError) onUploadError(err)
        }

        xhr.onerror = () => {
          setUploading(false)
          const err = 'Network error during Cloudinary upload'
          console.error('Cloudinary Model Upload Error:', err)
          setErrorMsg(err)
          if (onUploadError) onUploadError(err)
        }

        xhr.onabort = () => {
          setUploading(false)
          setProgress(0)
          setErrorMsg('Upload canceled by user.')
        }

        xhr.open('POST', directUrl, true)
        xhr.send(formData)
        return
      }
    } catch (err: any) {
      console.error('Direct signed upload failure:', err)
      setUploading(false)
      const errorStr = err?.message || 'Failed to initialize Cloudinary upload'
      setErrorMsg(errorStr)
      if (onUploadError) onUploadError(errorStr)
    }
  }

  return (
    <div
      style={{
        background: '#F8FAFC',
        border: '2px dashed #CBD5E1',
        borderRadius: 16,
        padding: 24,
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={acceptAttribute}
        style={{ display: 'none' }}
      />

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </span>
      </div>

      {uploadedUrl ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ECFDF5', color: '#065F46', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800, border: '1px solid #A7F3D0' }}>
            <span>✅ {activeType === 'model' ? '3D Model' : 'Media'} Uploaded to Cloudinary</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748B', maxWidth: 360, wordBreak: 'break-all' }}>
            <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', fontWeight: 600 }}>
              {uploadedUrl}
            </a>
          </div>
          {uploadedMeta && (
            <div style={{ fontSize: 10, color: '#94A3B8' }}>
              Format: {uploadedMeta.extension || uploadedMeta.format} · Size: {(uploadedMeta.file_size / 1024).toFixed(1)} KB · File: {uploadedMeta.original_filename}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ marginTop: 8, background: '#E2E8F0', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#334155' }}
          >
            Change File
          </button>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #E0531F 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 800,
              cursor: uploading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(255,107,53,0.35)',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? `Uploading (${progress}%)` : `Select & ${label}`}
          </button>
        </div>
      )}

      {errorMsg && (
        <div style={{ marginTop: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
          ⚠️ {errorMsg}
        </div>
      )}
    </div>
  )
}
