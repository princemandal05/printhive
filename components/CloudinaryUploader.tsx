'use client'

import { useState, useRef } from 'react'

export type CloudinaryMetadata = {
  secure_url: string
  cloudinary_public_id: string
  resource_type: string
  format: string
  file_size: number
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

    // Client-side extension validation
    if (!acceptedExtensions.includes(ext)) {
      const err = `Invalid file format .${ext}. Allowed formats: ${acceptedExtensions.join(', ')}`
      setErrorMsg(err)
      if (onUploadError) onUploadError(err)
      return
    }

    // Client-side size validation
    const isImg = ALLOWED_IMAGES.includes(ext)
    const maxSize = isImg ? 10 * 1024 * 1024 : 100 * 1024 * 1024
    if (file.size > maxSize) {
      const err = `File size exceeds limit of ${isImg ? '10MB' : '100MB'}`
      setErrorMsg(err)
      if (onUploadError) onUploadError(err)
      return
    }

    // Start upload via XMLHttpRequest for progress & cancel support
    startUpload(file)
  }

  const startUpload = (file: File) => {
    setUploading(true)
    setProgress(0)
    if (onUploadStart) onUploadStart()

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'r8wjszjm'
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const isModel = ALLOWED_MODELS.includes(ext)
    const preset = isModel
      ? (process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_MODELS || 'printhive_models')
      : (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'printhive_uploads')
    const resourceType = isModel ? 'raw' : 'auto'

    // Try direct client-side upload to Cloudinary to bypass Vercel 4.5MB payload limit
    const directUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', preset)

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
            }
            setUploadedUrl(data.secure_url)
            setUploadedMeta(meta)
            if (onUploadSuccess) onUploadSuccess(meta)
            return
          }
        } catch {
          // fallback to server upload
        }
      }

      // Fallback to server route /api/upload
      uploadViaServerRoute(file)
    }

    xhr.onerror = () => {
      uploadViaServerRoute(file)
    }

    xhr.onabort = () => {
      setUploading(false)
      setProgress(0)
      setErrorMsg('Upload canceled by user.')
    }

    xhr.open('POST', directUrl, true)
    xhr.send(formData)
  }

  const uploadViaServerRoute = (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

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
              format: data.format || 'unknown',
              file_size: data.file_size || file.size,
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

    xhr.onabort = () => {
      setUploading(false)
      setProgress(0)
      setErrorMsg('Upload canceled by user.')
    }

    xhr.open('POST', '/api/upload', true)
    xhr.send(formData)
  }

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort()
      xhrRef.current = null
    }
  }

  return (
    <div style={{ background: 'var(--bg-card)', padding: 18, borderRadius: 16, border: '1px solid var(--border-color)' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
        ☁️ {label}
      </label>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttribute}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Action Buttons */}
      {!uploading && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'linear-gradient(135deg, #FF6B35 0%, #EA580C 100%)',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255,107,53,0.3)',
          }}
        >
          Select & Upload {acceptType === 'model' ? '3D Model' : acceptType === 'image' ? 'Image' : 'File'}
        </button>
      )}

      {/* Uploading Progress & Cancel */}
      {uploading && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>
              ⚡ Uploading to Cloudinary... ({progress}%)
            </span>
            <button
              type="button"
              onClick={cancelUpload}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ✕ Cancel
            </button>
          </div>
          <div style={{ width: '100%', height: 8, background: 'var(--bg-card-hover)', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #FF6B35 0%, #10B981 100%)',
                transition: 'width 0.2s linear',
              }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div style={{ marginTop: 10, background: '#FEF2F2', color: '#DC2626', padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: '1px solid #FCA5A5' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Live Media Preview */}
      {uploadedUrl && !uploading && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
          {uploadedUrl.match(/\.(jpeg|jpg|png|webp)/i) ? (
            <img
              src={uploadedUrl}
              alt="Uploaded preview"
              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border-color)' }}
            />
          ) : (
            <div style={{ width: 48, height: 48, background: 'rgba(255,107,53,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              🧊
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#10B981', marginBottom: 2 }}>
              ✅ Media Uploaded Successfully
            </div>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 11, color: 'var(--text-sub)', textDecoration: 'underline', wordBreak: 'break-all' }}
            >
              {uploadedUrl}
            </a>
            {uploadedMeta && (
              <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 2 }}>
                Format: {uploadedMeta.format} · Size: {(uploadedMeta.file_size / 1024).toFixed(1)} KB · Public ID: {uploadedMeta.cloudinary_public_id}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
