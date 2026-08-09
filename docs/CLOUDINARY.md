# ☁️ PrintHive Cloudinary Media & 3D Model Integration

## Overview

PrintHive uses Cloudinary to securely store and deliver high-resolution product photos, designer avatars, printer machine pictures, and complex 3D model geometry files (`.stl`, `.3mf`, `.obj`, `.glb`, `.gltf`).

---

## 🛠️ Upload Presets & Format Routing

PrintHive routes files dynamically based on file extensions:

### 1. `printhive_uploads` (Images & General Media)
* **Supported Formats**: `jpg`, `jpeg`, `png`, `webp`
* **File Size Limit**: Max 10MB
* **Target Preset**: `process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (`printhive_uploads`)
* **Use Cases**: Product cover images, printer hub machine photos, designer profile avatars.

### 2. `printhive_models` (3D Model Geometry & Slicing Files)
* **Supported Formats**: `stl`, `3mf`, `glb`, `gltf`, `obj`, `ply`, `3ds`, `fbx`, `usdz`, `gcode`, `step`, `stp`
* **File Size Limit**: Max 100MB
* **Target Preset**: `process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_MODELS` (`printhive_models`)
* **Use Cases**: 3D design models, custom print-on-demand files.

---

## 🔒 Security Architecture

1. **No API Secrets on Client**: `CLOUDINARY_API_SECRET` is stored strictly on the server-side environment variables (`.env.local`).
2. **Unsigned Upload Presets**: Pre-provisioned `printhive_uploads` and `printhive_models` enable secure client/server uploads.
3. **Database Efficiency**: PostgreSQL / Supabase stores media metadata only (`cloudinary_public_id`, `secure_url`, `resource_type`, `format`, `file_size`). Heavy binary files are served via Cloudinary CDN.

---

## ⚡ Client Features & Progress Tracking

The [`CloudinaryUploader`](../components/CloudinaryUploader.tsx) component provides:

1. **Live Upload Progress Bar (%)**: Uses `XMLHttpRequest.upload.onprogress` to display real-time upload progress percentage.
2. **Upload Cancellation**: Users can cancel in-flight uploads (`xhr.abort()`).
3. **Validation**: Client and server file size & extension validation.
4. **Live Preview**: Displays image thumbnails or 3D file metadata cards upon upload completion.

---

## 📂 Key Source Code Locations

* [app/api/upload/route.ts](../app/api/upload/route.ts) — Server-side upload handler with preset routing and format validation.
* [components/CloudinaryUploader.tsx](../components/CloudinaryUploader.tsx) — Reusable React uploader component with progress & cancel support.
* [UploadDesignForm.tsx](../app/dashboard/designer/upload/UploadDesignForm.tsx) — Designer 3D model & preview image publishing form.
* [RegisterPrinterForm.tsx](../app/dashboard/printer-owner/register/RegisterPrinterForm.tsx) — Printer hub machine photo uploader.
