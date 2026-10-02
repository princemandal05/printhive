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

    // Client-side extension validation
    if (!acceptedExtensions.includes(ext)) {
      const err = `Invalid file format .${ext}. Allowed formats: ${acceptedExtensions.join(', ')}`
      setErrorMsg(err)
      if (onUploadError) onUploadError(err)
      return
    }

    const isImg = ALLOWED_IMAGES.includes(ext)
    const maxSize = isImg ? 15 * 1024 * 1024 : 100 * 1024 * 1024
    if (file.size > maxSize) {
      const err = `File size exceeds limit of ${isImg ? '15MB' : '100MB'}`
      setErrorMsg(err)
      if (onUploadError) onUploadError(err)
      return
    }

    startUpload(file)
  }

  // Upload helper using XMLHttpRequest with progress tracking
  const uploadViaXhr = (
    url: string,
    formData: FormData,
    onProgress: (pct: number) => void
  ): Promise<{ status: number; data: any }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhrRef.current = xhr
      xhr.timeout = 90000 // 90s timeout

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const pct = Math.round((event.loaded / event.total) * 100)
          onProgress(pct)
        }
      }

      xhr.onload = () => {
        let parsed: any = null
        try {
          parsed = JSON.parse(xhr.responseText)
        } catch {
          parsed = null
        }
        resolve({ status: xhr.status, data: parsed })
      }

      xhr.onerror = () => {
        reject(new Error('Network error connecting to Cloudinary endpoint'))
      }

      xhr.ontimeout = () => {
        reject(new Error('Upload connection timed out'))
      }

      xhr.onabort = () => {
        reject(new Error('Upload aborted'))
      }

      xhr.open('POST', url, true)
      xhr.send(formData)
    })
  }

  const startUpload = async (file: File) => {
    setUploading(true)
    setProgress(10)
    setErrorMsg(null)
    if (onUploadStart) onUploadStart()

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const isModel = ALLOWED_MODELS.includes(ext) || activeType === 'model'
    const fallbackMime = isModel ? `model/${ext}` : `image/${ext}`

    let authHeaderValue: string | null = null
    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        authHeaderValue = `Bearer ${session.access_token}`
      }
    } catch {
      // Non-blocking
    }

    const defaultCloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'r8wjszjm'
    const defaultPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'printhive_uploads'

    let successMeta: CloudinaryMetadata | null = null
    let lastError: string | null = null

    // ─────────────────────────────────────────────────────────────
    // STRATEGY 1: Signature Route -> Cloudinary Direct Upload
    // ─────────────────────────────────────────────────────────────
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (authHeaderValue) {
        headers['Authorization'] = authHeaderValue
      }

      const sigRes = await fetch('/api/upload/signature', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          isModel,
          fileName: file.name,
          fileSize: file.size,
          ext,
        }),
      }).catch(async () => {
        // Fallback to GET if POST failed
        const authParam = authHeaderValue ? { headers: { Authorization: authHeaderValue } } : {}
        return fetch(`/api/upload/signature?isModel=${isModel}&fileName=${encodeURIComponent(file.name)}&fileSize=${file.size}&ext=${ext}`, authParam)
      })

      if (sigRes && sigRes.ok) {
        const sigData = await sigRes.json().catch(() => null)

        if (sigData?.success) {
          const cloudName = sigData.cloud_name || defaultCloud
          const resourceType = isModel ? 'raw' : (sigData.resource_type || 'image')
          const directUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`

          const formData = new FormData()
          formData.append('file', file)

          if (sigData.unsigned && sigData.upload_preset) {
            formData.append('upload_preset', sigData.upload_preset)
          } else {
            if (sigData.api_key) formData.append('api_key', sigData.api_key)
            if (sigData.timestamp) formData.append('timestamp', sigData.timestamp.toString())
            if (sigData.folder) formData.append('folder', sigData.folder)
            if (sigData.asset_folder) formData.append('asset_folder', sigData.asset_folder)
            if (sigData.public_id) formData.append('public_id', sigData.public_id)
            if (sigData.signature) formData.append('signature', sigData.signature)
          }

          const { status, data } = await uploadViaXhr(directUrl, formData, (pct) => {
            setProgress(Math.max(15, Math.min(95, pct)))
          })

          if (status >= 200 && status < 300 && data?.secure_url) {
            successMeta = {
              secure_url: data.secure_url,
              cloudinary_public_id: data.public_id,
              public_id: data.public_id,
              resource_type: data.resource_type || (isModel ? 'raw' : 'image'),
              format: data.format || ext,
              bytes: data.bytes || file.size,
              file_size: data.bytes || file.size,
              original_filename: file.name,
              file_name: file.name,
              extension: ext,
              file_format: ext,
              mime_type: file.type || fallbackMime,
            }
          } else {
            lastError = data?.error?.message || `Direct upload failed with status ${status}`
          }
        } else if (sigData?.error) {
          lastError = sigData.error
        }
      } else if (sigRes) {
        const errJson = await sigRes.json().catch(() => null)
        lastError = errJson?.error || `Upload signature error (${sigRes.status})`
      }
    } catch (sErr: any) {
      lastError = sErr?.message || 'Failed direct signed upload'
    }

    // ─────────────────────────────────────────────────────────────
    // STRATEGY 2: Direct Unsigned Preset (Images only)
    // ─────────────────────────────────────────────────────────────
    if (!successMeta && !isModel) {
      try {
        const directUrl = `https://api.cloudinary.com/v1_1/${defaultCloud}/image/upload`
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', defaultPreset)

        const { status, data } = await uploadViaXhr(directUrl, formData, (pct) => {
          setProgress(Math.max(20, Math.min(95, pct)))
        })

        if (status >= 200 && status < 300 && data?.secure_url) {
          successMeta = {
            secure_url: data.secure_url,
            cloudinary_public_id: data.public_id,
            public_id: data.public_id,
            resource_type: data.resource_type || 'image',
            format: data.format || ext,
            bytes: data.bytes || file.size,
            file_size: data.bytes || file.size,
            original_filename: file.name,
            file_name: file.name,
            extension: ext,
            file_format: ext,
            mime_type: file.type || fallbackMime,
          }
        } else if (data?.error?.message) {
          lastError = data.error.message
        }
      } catch (presetErr: any) {
        lastError = presetErr?.message || 'Preset direct upload failed'
      }
    }

    // ─────────────────────────────────────────────────────────────
    // STRATEGY 3: Internal Server Route /api/upload
    // (Bypasses adblockers or browser CORS blocking cloudinary.com)
    // ─────────────────────────────────────────────────────────────
    if (!successMeta) {
      try {
        const srvFormData = new FormData()
        srvFormData.append('file', file)

        const headers: Record<string, string> = {}
        if (authHeaderValue) {
          headers['Authorization'] = authHeaderValue
        }

        const srvRes = await fetch('/api/upload', {
          method: 'POST',
          headers,
          body: srvFormData,
        })

        const srvData = await srvRes.json().catch(() => null)

        if (srvRes.ok && srvData?.success && (srvData.secure_url || srvData.url)) {
          const finalUrl = srvData.secure_url || srvData.url
          successMeta = {
            secure_url: finalUrl,
            cloudinary_public_id: srvData.public_id || srvData.cloudinary_public_id || file.name,
            public_id: srvData.public_id || srvData.cloudinary_public_id || file.name,
            resource_type: srvData.resource_type || (isModel ? 'raw' : 'image'),
            format: srvData.format || ext,
            bytes: srvData.bytes || srvData.file_size || file.size,
            file_size: srvData.file_size || srvData.bytes || file.size,
            original_filename: file.name,
            file_name: file.name,
            extension: ext,
            file_format: ext,
            mime_type: file.type || fallbackMime,
          }
        } else if (srvData?.error) {
          lastError = srvData.error
        }
      } catch (srvErr: any) {
        lastError = srvErr?.message || 'Server upload route failed'
      }
    }

    // ─────────────────────────────────────────────────────────────
    // FINAL DISPOSITION
    // ─────────────────────────────────────────────────────────────
    setUploading(false)

    if (successMeta) {
      setProgress(100)
      setUploadedUrl(successMeta.secure_url)
      setUploadedMeta(successMeta)
      setErrorMsg(null)
      if (onUploadSuccess) onUploadSuccess(successMeta)
    } else {
      setProgress(0)
      const errDisplay = lastError || 'Upload could not be completed. Please check your connection and try again.'
      setErrorMsg(errDisplay)
      if (onUploadError) onUploadError(errDisplay)
    }
  }

  const isImageFile = activeType === 'image' || (uploadedUrl && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(uploadedUrl))

  return (
    <div
      style={{
        background: 'var(--bg-card-hover, rgba(0,0,0,0.02))',
        border: '2px dashed var(--border-color, #E2E8F0)',
        borderRadius: 20,
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
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main, #1E293B)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </span>
      </div>

      {uploadedUrl ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {/* Visual Preview */}
          {isImageFile ? (
            <div style={{ position: 'relative', width: 90, height: 90, borderRadius: 14, overflow: 'hidden', border: '2px solid #10B981', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedUrl}
                alt="Uploaded machine photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div style={{ width: 60, height: 60, borderRadius: 12, background: 'rgba(234,88,12,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              🧊
            </div>
          )}

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '6px 16px', borderRadius: 9999, fontSize: 12, fontWeight: 800, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <span>✅ {activeType === 'model' ? '3D Model' : 'Photo'} Uploaded Successfully</span>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-sub, #64748B)', maxWidth: 360, wordBreak: 'break-all' }}>
            <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#ea580c', fontWeight: 600 }}>
              {uploadedUrl}
            </a>
          </div>

          {uploadedMeta && (
            <div style={{ fontSize: 11, color: 'var(--text-sub, #64748B)' }}>
              Format: {(uploadedMeta.extension || uploadedMeta.format || '').toUpperCase()} · Size: {(uploadedMeta.file_size / 1024).toFixed(1)} KB · File: {uploadedMeta.original_filename}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              marginTop: 6,
              background: 'var(--bg-card, #FFFFFF)',
              border: '1px solid var(--border-color, #E2E8F0)',
              borderRadius: 9999,
              padding: '6px 18px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              color: 'var(--text-main, #1E293B)',
            }}
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
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 9999,
              padding: '12px 28px',
              fontSize: 14,
              fontWeight: 800,
              cursor: uploading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(234,88,12,0.35)',
              opacity: uploading ? 0.7 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {uploading ? `Uploading (${progress}%)` : `Select & ${label}`}
          </button>

          {/* Animated Progress Bar */}
          {uploading && (
            <div style={{ width: '100%', maxWidth: 260, height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 9999, overflow: 'hidden', margin: '12px auto 0' }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #ea580c, #f97316)',
                  borderRadius: 9999,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div style={{ marginTop: 14, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div>⚠️ {errorMsg}</div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 9999,
              padding: '4px 14px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
