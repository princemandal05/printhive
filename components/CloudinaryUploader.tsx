'use client'

import { useState, useRef } from 'react'

export type CloudinaryMetadata = {
  secure_url: string
  cloudinary_public_id: string
  resource_type: string
  format: string
  file_size: number
  original_filename: string
  extension: string
  mime_type: string
}

type CloudinaryUploaderProps = {
  acceptType?: 'image' | 'model' | 'any'
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
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  label = 'Upload File to Cloudinary',
  currentUrl,
}: CloudinaryUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentUrl || null)
  const [uploadedMeta, setUploadedMeta] = useState<CloudinaryMetadata | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const acceptedExtensions =
    acceptType === 'image'
      ? ALLOWED_IMAGES
      : acceptType === 'model'
      ? ALLOWED_MODELS
      : [...ALLOWED_IMAGES, ...ALLOWED_MODELS]

  const acceptAttribute =
    acceptType === 'image'
      ? 'image/jpeg,image/png,image/webp'
      : acceptType === 'model'
      ? '.stl,.3mf,.glb,.gltf,.obj,.ply,.3ds,.fbx,.usdz,.gcode,.step,.stp'
      : 'image/*,.stl,.3mf,.glb,.gltf,.obj,.ply,.3ds,.fbx,.usdz,.gcode,.step,.stp'

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMsg(null)
    const ext = file.name.split('.').pop()?.toLowerCase() || ''

    if (!acceptedExtensions.includes(ext)) {
      const err = `Invalid file format .${ext}. Allowed formats: ${acceptedExtensions.join(', ')}`
      setErrorMsg(err)
      if (onUploadError) onUploadError(err)
      return
    }

    const isImg = ALLOWED_IMAGES.includes(ext)
    const maxSize = isImg ? 10 * 1024 * 1024 : 100 * 1024 * 1024
    if (file.size > maxSize) {
      const err = `File size exceeds limit of ${isImg ? '10MB' : '100MB'}`
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
    const isModel = ALLOWED_MODELS.includes(ext)
    const fallbackMime = isModel ? `model/${ext}` : `image/${ext}`

    try {
      const sigRes = await fetch(`/api/upload/signature?isModel=${isModel}&fileName=${encodeURIComponent(file.name)}&fileSize=${file.size}&ext=${ext}`)
      const sigData = await sigRes.json()

      if (sigData.success && (sigData.signature || sigData.unsigned)) {
        const resourceEndpoint = isModel ? 'auto' : (sigData.resource_type || 'auto')
        const directUrl = `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/${resourceEndpoint}/upload`
        const formData = new FormData()
        formData.append('file', file)
        if (sigData.upload_preset) formData.append('upload_preset', sigData.upload_preset)
        if (sigData.folder) formData.append('folder', sigData.folder)
        if (sigData.public_id) formData.append('public_id', sigData.public_id)
        if (!sigData.unsigned) {
          formData.append('api_key', sigData.api_key)
          formData.append('timestamp', sigData.timestamp.toString())
          if (sigData.asset_folder) formData.append('asset_folder', sigData.asset_folder)
          if (sigData.signature) formData.append('signature', sigData.signature)
        }

        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            setProgress(percent)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploading(false)
            try {
              const data = JSON.parse(xhr.responseText)
              if (data.secure_url) {
                const meta: CloudinaryMetadata = {
                  secure_url: data.secure_url,
                  cloudinary_public_id: data.public_id,
                  resource_type: data.resource_type || (isModel ? 'raw' : 'image'),
                  format: data.format || ext,
                  file_size: data.bytes || file.size,
                  original_filename: file.name,
                  extension: ext,
                  mime_type: file.type || fallbackMime,
                }
                setUploadedUrl(data.secure_url)
                setUploadedMeta(meta)
                if (onUploadSuccess) onUploadSuccess(meta)
                return
              }
            } catch {
              // fallback below
            }
          }
          uploadViaServerRoute(file)
        }

        xhr.onerror = () => uploadViaServerRoute(file)
        xhr.onabort = () => {
          setUploading(false)
          setProgress(0)
          setErrorMsg('Upload canceled by user.')
        }

        xhr.open('POST', directUrl, true)
        xhr.send(formData)
        return
      }
    } catch (err) {
      console.warn('Signed direct upload fallback:', err)
    }

    uploadViaServerRoute(file)
  }

  const uploadViaServerRoute = (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const isModel = ALLOWED_MODELS.includes(ext)
    const fallbackMime = isModel ? `model/${ext}` : `image/${ext}`

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
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          if (data.success && data.secure_url) {
            const meta: CloudinaryMetadata = {
              secure_url: data.secure_url,
              cloudinary_public_id: data.cloudinary_public_id || data.public_id,
              resource_type: data.resource_type || 'auto',
              format: data.format || ext,
              file_size: data.file_size || file.size,
              original_filename: file.name,
              extension: ext,
              mime_type: file.type || fallbackMime,
            }
            setUploadedUrl(data.secure_url)
            setUploadedMeta(meta)
            if (onUploadSuccess) onUploadSuccess(meta)
          } else {
            const err = data.error || 'Upload failed'
            setErrorMsg(err)
            if (onUploadError) onUploadError(err)
          }
        } catch {
          const err = 'Failed to parse upload response'
          setErrorMsg(err)
          if (onUploadError) onUploadError(err)
        }
      } else {
        const err = `Upload failed with status code ${xhr.status}. File may exceed server limit.`
        setErrorMsg(err)
        if (onUploadError) onUploadError(err)
      }
    }

    xhr.onerror = () => {
      setUploading(false)
      const err = 'Network error during upload'
      setErrorMsg(err)
      if (onUploadError) onUploadError(err)
    }

    xhr.open('POST', '/api/upload', true)
    xhr.send(formData)
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
            <span>✅ Media Uploaded Successfully</span>
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
