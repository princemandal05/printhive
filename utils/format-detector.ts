export type SupportedFormat = 'stl' | 'obj' | 'glb' | 'gltf'
export type UnsupportedFormat = '3mf' | 'step' | 'stp' | 'gcode' | 'fbx' | '3ds' | 'ply' | 'usdz' | 'unknown'
export type ModelFormat = SupportedFormat | UnsupportedFormat

export interface DetectFormatInput {
  format?: string | null
  fileName?: string | null
  mimeType?: string | null
  url?: string | null
}

const EXTENSION_MAP: Record<string, ModelFormat> = {
  stl: 'stl',
  obj: 'obj',
  glb: 'glb',
  gltf: 'gltf',
  '3mf': '3mf',
  step: 'step',
  stp: 'stp',
  gcode: 'gcode',
  fbx: 'fbx',
  '3ds': '3ds',
  ply: 'ply',
  usdz: 'usdz',
}

const MIME_MAP: Record<string, ModelFormat> = {
  'model/stl': 'stl',
  'application/sla': 'stl',
  'model/x.stl-binary': 'stl',
  'model/x.stl-ascii': 'stl',
  'model/obj': 'obj',
  'text/plain-wavefront-obj': 'obj',
  'model/gltf-binary': 'glb',
  'model/gltf+json': 'gltf',
  'application/octet-stream': 'glb', // Default check
  'application/vnd.ms-package.3dmanufacturing-3dmodel+xml': '3mf',
  'model/3mf': '3mf',
}

function extractExtension(str: string | null | undefined): string | null {
  if (!str) return null
  try {
    // Strip query parameters, hash fragments, and matrix params
    const cleanStr = str.split('?')[0].split('#')[0]
    const parts = cleanStr.split('/')
    const lastPart = parts[parts.length - 1]
    if (lastPart.includes('.')) {
      const ext = lastPart.split('.').pop()?.toLowerCase() || ''
      if (ext && EXTENSION_MAP[ext]) return ext
    }
  } catch {
    // Return raw fallback
  }
  return null
}

export function detectModelFormat(input: DetectFormatInput): { format: ModelFormat; isPreviewable: boolean } {
  // 1. Check explicit stored format parameter
  if (input.format) {
    const cleanFormat = input.format.toLowerCase().trim().replace(/^\./, '')
    if (EXTENSION_MAP[cleanFormat]) {
      const fmt = EXTENSION_MAP[cleanFormat]
      return { format: fmt, isPreviewable: ['stl', 'obj', 'glb', 'gltf'].includes(fmt) }
    }
  }

  // 2. Check original filename extension
  const fileExt = extractExtension(input.fileName)
  if (fileExt && EXTENSION_MAP[fileExt]) {
    const fmt = EXTENSION_MAP[fileExt]
    return { format: fmt, isPreviewable: ['stl', 'obj', 'glb', 'gltf'].includes(fmt) }
  }

  // 3. Check MIME type
  if (input.mimeType) {
    const cleanMime = input.mimeType.toLowerCase().trim()
    if (MIME_MAP[cleanMime]) {
      const fmt = MIME_MAP[cleanMime]
      return { format: fmt, isPreviewable: ['stl', 'obj', 'glb', 'gltf'].includes(fmt) }
    }
  }

  // 4. Check URL extension as fallback
  const urlExt = extractExtension(input.url)
  if (urlExt && EXTENSION_MAP[urlExt]) {
    const fmt = EXTENSION_MAP[urlExt]
    return { format: fmt, isPreviewable: ['stl', 'obj', 'glb', 'gltf'].includes(fmt) }
  }

  // Default fallback if unrecognised extension
  return { format: 'stl', isPreviewable: true }
}
