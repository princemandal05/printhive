'use client'

import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { detectModelFormat, type ModelFormat } from '@/utils/format-detector'

interface ThreeViewerProps {
  title?: string
  color?: string
  wireframeDefault?: boolean
  height?: number | string
  modelUrl?: string
  format?: string | null
  fileName?: string | null
  mimeType?: string | null
  dimensions?: { x: number; y: number; z: number }
  autoRotateDefault?: boolean
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallbackTitle?: string
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ThreeViewerErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ThreeViewer Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: 440, background: '#0F172A', borderRadius: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🧊</div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#94A3B8' }}>Unable to preview this model</p>
        </div>
      )
    }
    return this.props.children
  }
}

export default function ThreeViewer(props: ThreeViewerProps) {
  return (
    <ThreeViewerErrorBoundary fallbackTitle={props.title}>
      <ThreeViewerInner {...props} />
    </ThreeViewerErrorBoundary>
  )
}

function ThreeViewerInner({
  title = '3D Model',
  color = '#FF6B35',
  wireframeDefault = false,
  autoRotateDefault = false,
  height = 460,
  modelUrl,
  format,
  fileName,
  mimeType,
  dimensions = { x: 50, y: 50, z: 50 },
}: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unsupported, setUnsupported] = useState<string | null>(null)
  const [wireframe, setWireframe] = useState(wireframeDefault)
  const [rotating, setRotating] = useState(autoRotateDefault)
  const rotatingRef = useRef(rotating)
  const [bounds, setBounds] = useState(dimensions)

  const controlsRef = useRef<OrbitControls | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const matsRef = useRef<THREE.MeshPhysicalMaterial[]>([])

  const detected = detectModelFormat({ format, fileName, mimeType, url: modelUrl })
  const fmt: ModelFormat = detected.format
  const safeColor = /^#[0-9A-Fa-f]{6}$/.test(color || '') ? color! : '#FF6B35'

  // Sync rotation
  useEffect(() => {
    rotatingRef.current = rotating
    if (controlsRef.current) controlsRef.current.autoRotate = rotating
  }, [rotating])

  // Sync wireframe
  useEffect(() => {
    matsRef.current.forEach(m => { m.wireframe = wireframe; m.needsUpdate = true })
  }, [wireframe])

  // Live filament color update (no reload)
  useEffect(() => {
    const c = new THREE.Color(safeColor)
    matsRef.current.forEach(m => { m.color.copy(c); m.needsUpdate = true })
  }, [safeColor])

  // Main Three.js setup
  useEffect(() => {
    if (!mountRef.current) return

    const container = mountRef.current
    const w = container.clientWidth || 600
    const h = typeof height === 'number' ? height : container.clientHeight || 460
    let disposed = false
    matsRef.current = []

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0F172A')

    // Camera
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 5000)
    camera.position.set(0, 40, 120)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Smooth orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.autoRotate = rotatingRef.current
    controls.autoRotateSpeed = 1.0
    controls.enableZoom = true
    controls.enablePan = true
    controls.minDistance = 5
    controls.maxDistance = 800
    controlsRef.current = controls

    // ─── Studio Lighting ────────────────────────────────
    // Hemisphere (sky + ground bounce)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1f2e, 0.7))

    // Key light — warm white, top-right, cast shadows
    const key = new THREE.DirectionalLight(0xffffff, 1.3)
    key.position.set(100, 160, 120)
    key.castShadow = true
    scene.add(key)

    // Fill light — soft cool blue from the left
    const fill = new THREE.DirectionalLight(0xb4c6fc, 0.65)
    fill.position.set(-120, 50, 80)
    scene.add(fill)

    // Rim / backlight — warm edge highlight for silhouette definition
    const rim = new THREE.DirectionalLight(0xffd6a5, 0.95)
    rim.position.set(-20, 100, -160)
    scene.add(rim)

    // Under-bounce
    const bounce = new THREE.DirectionalLight(0x475569, 0.35)
    bounce.position.set(0, -100, 40)
    scene.add(bounce)

    // ─── Model group ────────────────────────────────────
    const group = new THREE.Group()
    groupRef.current = group
    scene.add(group)

    // PBR filament material factory
    const makeMat = (): THREE.MeshPhysicalMaterial => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(safeColor),
        roughness: 0.32,
        metalness: 0.06,
        clearcoat: 0.25,
        clearcoatRoughness: 0.2,
        reflectivity: 0.5,
        wireframe,
        side: THREE.DoubleSide,
      })
      matsRef.current.push(mat)
      return mat
    }

    // Apply styling helper
    const styleMeshes = (root: THREE.Object3D) => {
      root.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.computeVertexNormals()
          child.material = makeMat()
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }

    // Fit model to fill camera nicely
    const fitCamera = (obj: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(obj)
      if (box.isEmpty()) return

      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      obj.position.sub(center)

      if (!disposed) {
        setBounds({ x: Math.round(size.x), y: Math.round(size.y), z: Math.round(size.z) })
      }

      const maxDim = Math.max(size.x, size.y, size.z)
      if (maxDim > 0) {
        const fov = camera.fov * (Math.PI / 180)
        let dist = (maxDim / 2 / Math.tan(fov / 2)) * 1.35
        dist = Math.max(dist, 10)

        // Position camera at a nice 3/4 angle so the model looks premium
        camera.position.set(dist * 0.6, dist * 0.35, dist * 0.75)
        camera.lookAt(0, 0, 0)
        controls.target.set(0, 0, 0)
        camera.near = Math.max(maxDim / 200, 0.05)
        camera.far = Math.max(maxDim * 50, 2000)
        camera.updateProjectionMatrix()
        controls.update()
      }
    }

    // ─── Load model ─────────────────────────────────────
    const load = async () => {
      if (!modelUrl) { setLoading(false); setError('No model file URL.'); return }

      try {
        if (fmt === 'stl') {
          const buf = await (await fetch(modelUrl)).arrayBuffer()
          if (disposed) return
          const geo = new STLLoader().parse(buf)
          if (!geo?.attributes?.position?.count) throw new Error('Empty STL')
          geo.computeVertexNormals()
          const mesh = new THREE.Mesh(geo, makeMat())
          mesh.castShadow = true; mesh.receiveShadow = true
          group.add(mesh)
          fitCamera(group); setLoading(false)

        } else if (fmt === '3mf') {
          const buf = await (await fetch(modelUrl)).arrayBuffer()
          if (disposed) return
          const parsed = new ThreeMFLoader().parse(buf)
          if (!parsed?.children?.length) throw new Error('Empty 3MF')
          styleMeshes(parsed)
          group.add(parsed)
          fitCamera(group); setLoading(false)

        } else if (fmt === 'obj') {
          const txt = await (await fetch(modelUrl)).text()
          if (disposed) return
          const parsed = new OBJLoader().parse(txt)
          if (!parsed?.children?.length) throw new Error('Empty OBJ')
          styleMeshes(parsed)
          group.add(parsed)
          fitCamera(group); setLoading(false)

        } else if (fmt === 'glb' || fmt === 'gltf') {
          new GLTFLoader().load(modelUrl,
            (gltf) => {
              if (disposed) return
              const s = gltf.scene || gltf.scenes[0]
              if (!s) throw new Error('Empty GLTF')
              styleMeshes(s)
              group.add(s)
              fitCamera(group); setLoading(false)
            },
            undefined,
            (e: any) => { if (!disposed) { setError(e?.message || 'GLTF error'); setLoading(false) } }
          )
        } else {
          setUnsupported(fmt.toUpperCase()); setLoading(false)
        }
      } catch (err: any) {
        console.error('Model load error:', err)
        if (!disposed) { setError(err.message || 'Load failed'); setLoading(false) }
      }
    }
    load()

    // Render loop
    let animId: number
    const tick = () => { animId = requestAnimationFrame(tick); controls.update(); renderer.render(scene, camera) }
    tick()

    // Resize
    const onResize = () => {
      if (!container) return
      const nw = container.clientWidth || 600
      const nh = typeof height === 'number' ? height : container.clientHeight || 460
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true; cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      controls.dispose(); scene.clear(); renderer.dispose()
      matsRef.current.forEach(m => m.dispose())
    }
  }, [modelUrl, fmt, height])

  // ─── Error / unsupported fallback ─────────────────────
  if (unsupported || error) {
    return (
      <div style={{
        height, background: '#0F172A', borderRadius: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 32, textAlign: 'center', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🧊</div>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px' }}>Unable to preview</h3>
        <p style={{ fontSize: 13, color: '#94A3B8', maxWidth: 340, margin: '0 0 18px' }}>
          {unsupported ? `${unsupported} preview is not supported. Download the file to view.` : error}
        </p>
        {modelUrl && (
          <a href={modelUrl} download={fileName || `model.${fmt}`} target="_blank" rel="noopener noreferrer"
            style={{
              background: '#FF6B35', color: '#fff', padding: '8px 20px', borderRadius: 99,
              fontSize: 13, fontWeight: 800, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
            📥 Download {fmt.toUpperCase()}
          </a>
        )}
      </div>
    )
  }

  // ─── Main Viewer ──────────────────────────────────────
  return (
    <div style={{
      position: 'relative', height, background: '#0F172A', borderRadius: 20,
      overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Loading */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(6px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8, animation: 'spin 1.5s linear infinite' }}>⏳</div>
          <div style={{ color: '#F8FAFC', fontWeight: 800, fontSize: 14 }}>Loading {fmt.toUpperCase()} Model…</div>
        </div>
      )}

      {/* Top-left: minimal specs badge */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 5,
        background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
        padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#CBD5E1' }}>
          {bounds.x} × {bounds.y} × {bounds.z} mm
        </span>
        <span style={{
          background: '#8B5CF6', color: '#fff', fontSize: 9, fontWeight: 900,
          padding: '2px 7px', borderRadius: 5, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {fmt}
        </span>
      </div>

      {/* Bottom-right: minimal controls */}
      <div style={{
        position: 'absolute', bottom: 12, right: 12, zIndex: 5,
        display: 'flex', gap: 6,
      }}>
        <ViewerBtn
          active={wireframe}
          onClick={() => setWireframe(!wireframe)}
          label={wireframe ? '◼ Solid' : '◻ Wireframe'}
        />
        <ViewerBtn
          active={rotating}
          onClick={() => setRotating(!rotating)}
          label={rotating ? '⏸ Pause' : '🔄 Rotate'}
          activeColor="#FF6B35"
        />
      </div>
    </div>
  )
}

function ViewerBtn({ active, onClick, label, activeColor = '#8B5CF6' }: {
  active: boolean; onClick: () => void; label: string; activeColor?: string
}) {
  return (
    <button type="button" onClick={onClick} style={{
      background: active ? activeColor : 'rgba(15,23,42,0.7)',
      color: active ? '#fff' : '#94A3B8',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 800,
      cursor: 'pointer', backdropFilter: 'blur(8px)',
      transition: 'all 0.2s ease',
    }}>
      {label}
    </button>
  )
}
