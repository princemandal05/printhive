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
          height: 440, background: '#FFFFFF', borderRadius: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#0F172A', border: '1px solid #E2E8F0',
        }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🧊</div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#64748B' }}>Unable to preview this model</p>
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
  const containerRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unsupported, setUnsupported] = useState<string | null>(null)
  const [wireframe, setWireframe] = useState(wireframeDefault)
  const [rotating, setRotating] = useState(autoRotateDefault)
  const rotatingRef = useRef(rotating)
  const [bounds, setBounds] = useState(dimensions)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [isGrabbing, setIsGrabbing] = useState(false)

  const controlsRef = useRef<OrbitControls | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const matsRef = useRef<THREE.MeshPhysicalMaterial[]>([])
  const initialCamPos = useRef<THREE.Vector3>(new THREE.Vector3())

  const detected = detectModelFormat({ format, fileName, mimeType, url: modelUrl })
  const fmt: ModelFormat = detected.format
  const safeColor = /^#[0-9A-Fa-f]{6}$/.test(color || '') ? color! : '#FF6B35'

  // Hide gesture hint after 4 seconds or interaction
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4000)
    return () => clearTimeout(timer)
  }, [])

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

  // Escape key exits fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFullscreen])

  // Main Three.js setup
  useEffect(() => {
    if (!mountRef.current) return

    const container = mountRef.current
    const w = isFullscreen ? window.innerWidth : container.clientWidth || 600
    const h = isFullscreen ? window.innerHeight : typeof height === 'number' ? height : container.clientHeight || 460
    let disposed = false
    matsRef.current = []

    // Scene with clean white studio background
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#FFFFFF')

    // Camera
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 5000)
    camera.position.set(0, 40, 120)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Smooth orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.autoRotate = rotatingRef.current
    controls.autoRotateSpeed = 1.2
    controls.enableZoom = true
    controls.enablePan = true
    controls.minDistance = 2
    controlsRef.current = controls

    // ─── Studio Lighting Setup (White Studio Calibrated) ──
    // Soft Ambient / Hemisphere
    scene.add(new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.85))

    // Main Key light (Top-right front)
    const key = new THREE.DirectionalLight(0xffffff, 1.25)
    key.position.set(100, 160, 120)
    key.castShadow = true
    key.shadow.bias = -0.0001
    scene.add(key)

    // Fill light (Soft gentle fill from left)
    const fill = new THREE.DirectionalLight(0xf1f5f9, 0.7)
    fill.position.set(-120, 60, 80)
    scene.add(fill)

    // Rim / backlight
    const rim = new THREE.DirectionalLight(0xffffff, 0.5)
    rim.position.set(-20, 120, -160)
    scene.add(rim)

    // Subtle Under-bounce
    const bounce = new THREE.DirectionalLight(0xe2e8f0, 0.3)
    bounce.position.set(0, -100, 40)
    scene.add(bounce)

    // ─── Clean Soft Contact Shadow on White Ground ───────
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 128
    shadowCanvas.height = 128
    const ctx = shadowCanvas.getContext('2d')
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.22)')
      grad.addColorStop(0.4, 'rgba(0, 0, 0, 0.08)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 128, 128)
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
      })
    )
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.y = -0.5
    scene.add(shadowPlane)

    // ─── Model group ────────────────────────────────────
    const group = new THREE.Group()
    groupRef.current = group
    scene.add(group)

    // PBR filament material factory
    const makeMat = (): THREE.MeshPhysicalMaterial => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(safeColor),
        roughness: 0.3,
        metalness: 0.08,
        clearcoat: 0.3,
        clearcoatRoughness: 0.18,
        reflectivity: 0.55,
        wireframe,
        side: THREE.DoubleSide,
      })
      matsRef.current.push(mat)
      return mat
    }

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

    // Fit model to fill camera perfectly
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
        shadowPlane.scale.set(maxDim / 35, maxDim / 35, 1)
        shadowPlane.position.y = -size.y / 2 - 0.2

        const fov = camera.fov * (Math.PI / 180)
        let dist = (maxDim / 2 / Math.tan(fov / 2)) * 1.35
        dist = Math.max(dist, 10)

        camera.position.set(dist * 0.6, dist * 0.35, dist * 0.75)
        initialCamPos.current.copy(camera.position)
        camera.lookAt(0, 0, 0)
        controls.target.set(0, 0, 0)
        camera.near = Math.max(maxDim / 200, 0.05)
        camera.far = Math.max(maxDim * 50, 3000)
        camera.updateProjectionMatrix()

        // Derive OrbitControls limits dynamically from maxDim and computed fit distance
        controls.minDistance = Math.max(maxDim * 0.05, 0.5)
        controls.maxDistance = Math.max(dist * 8, maxDim * 15, 100)
        controls.update()
      }
    }

    // Shared fetch helper with abort timeout and non-OK response handling
    const fetchModelData = async (url: string, asText = false) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      try {
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch model file`)
        }
        return asText ? await res.text() : await res.arrayBuffer()
      } finally {
        clearTimeout(timeoutId)
      }
    }

    // ─── Load model ─────────────────────────────────────
    const load = async () => {
      if (!modelUrl) { setLoading(false); setError('No model file URL.'); return }

      try {
        if (fmt === 'stl') {
          const buf = (await fetchModelData(modelUrl)) as ArrayBuffer
          if (disposed) return
          const geo = new STLLoader().parse(buf)
          if (!geo?.attributes?.position?.count) throw new Error('Empty STL')
          geo.computeVertexNormals()
          const mesh = new THREE.Mesh(geo, makeMat())
          mesh.castShadow = true; mesh.receiveShadow = true
          group.add(mesh)
          fitCamera(group); setLoading(false)

        } else if (fmt === '3mf') {
          const buf = (await fetchModelData(modelUrl)) as ArrayBuffer
          if (disposed) return
          const parsed = new ThreeMFLoader().parse(buf)
          if (!parsed?.children?.length) throw new Error('Empty 3MF')
          styleMeshes(parsed)
          group.add(parsed)
          fitCamera(group); setLoading(false)

        } else if (fmt === 'obj') {
          const txt = (await fetchModelData(modelUrl, true)) as string
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
              if (!s) {
                setError('Empty GLTF')
                setLoading(false)
                return
              }
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

    // ─── Interaction Listeners ──────────────────────────
    const onMouseDown = () => {
      setIsGrabbing(true)
      setShowHint(false)
    }
    const onMouseUp = () => setIsGrabbing(false)

    // Double-click to auto reset & re-center view
    const onDblClick = () => {
      if (controlsRef.current && cameraRef.current) {
        cameraRef.current.position.copy(initialCamPos.current)
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.update()
      }
    }

    const dom = renderer.domElement
    dom.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    dom.addEventListener('dblclick', onDblClick)

    // Render loop
    let animId: number
    const tick = () => {
      animId = requestAnimationFrame(tick)
      controls.update()
      renderer.render(scene, camera)
    }
    tick()

    // Resize
    const onResize = () => {
      if (!container) return
      const nw = isFullscreen ? window.innerWidth : container.clientWidth || 600
      const nh = isFullscreen ? window.innerHeight : typeof height === 'number' ? height : container.clientHeight || 460
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      dom.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      dom.removeEventListener('dblclick', onDblClick)
      controls.dispose()
      scene.clear()
      renderer.dispose()
      matsRef.current.forEach(m => m.dispose())
    }
  }, [modelUrl, fmt, height, isFullscreen])

  const handleResetView = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.copy(initialCamPos.current)
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }
  }

  // ─── Error / unsupported fallback ─────────────────────
  if (unsupported || error) {
    return (
      <div style={{
        height, background: '#FFFFFF', borderRadius: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 32, textAlign: 'center', color: '#0F172A', border: '1px solid #E2E8F0',
      }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🧊</div>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px' }}>Unable to preview</h3>
        <p style={{ fontSize: 13, color: '#64748B', maxWidth: 340, margin: '0 0 18px' }}>
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
    <div
      ref={containerRef}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 99999 : 1,
        width: '100%',
        height: isFullscreen ? '100vh' : height,
        background: '#FFFFFF',
        borderRadius: isFullscreen ? 0 : 20,
        overflow: 'hidden',
        border: isFullscreen ? 'none' : '1px solid #E2E8F0',
        boxShadow: isFullscreen ? 'none' : '0 4px 24px rgba(0,0,0,0.06)',
      }}
    >
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: isGrabbing ? 'grabbing' : 'grab',
        }}
      />

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8, animation: 'spin 1.5s linear infinite' }}>⏳</div>
          <div style={{ color: '#0F172A', fontWeight: 800, fontSize: 14 }}>Loading {fmt.toUpperCase()} Model…</div>
        </div>
      )}

      {/* Top-left: Minimal Specs Badge */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 5,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10,
        padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>
          {bounds.x} × {bounds.y} × {bounds.z} mm
        </span>
        <span style={{
          background: '#8B5CF6', color: '#fff', fontSize: 9, fontWeight: 900,
          padding: '2px 7px', borderRadius: 5, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {fmt}
        </span>
      </div>

      {/* Center Subtle Gesture Hint (fades away automatically) */}
      {showHint && !loading && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 4,
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,0,0,0.06)', borderRadius: 8,
          padding: '4px 10px', color: '#64748B', fontSize: 11, fontWeight: 600,
          pointerEvents: 'none', transition: 'opacity 0.5s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          🖱️ Drag to rotate • Double-click to center
        </div>
      )}

      {/* Bottom-right: Clean Minimal Control Pills */}
      <div style={{
        position: 'absolute', bottom: 12, right: 12, zIndex: 5,
        display: 'flex', gap: 6,
      }}>
        <ViewerBtn
          active={false}
          onClick={handleResetView}
          label="🎯 Center"
          title="Reset camera angle (or double-click)"
        />
        <ViewerBtn
          active={wireframe}
          onClick={() => setWireframe(!wireframe)}
          label={wireframe ? '◼ Solid' : '◻ Wireframe'}
          title="Toggle wireframe mode"
        />
        <ViewerBtn
          active={rotating}
          onClick={() => setRotating(!rotating)}
          label={rotating ? '⏸ Pause' : '🔄 Rotate'}
          activeColor="#FF6B35"
          title="Toggle auto rotation"
        />
        <ViewerBtn
          active={isFullscreen}
          onClick={() => setIsFullscreen(!isFullscreen)}
          label={isFullscreen ? '✖ Exit' : '⛶ Full'}
          title="Toggle fullscreen view"
        />
      </div>
    </div>
  )
}

function ViewerBtn({
  active,
  onClick,
  label,
  activeColor = '#8B5CF6',
  title,
}: {
  active: boolean
  onClick: () => void
  label: string
  activeColor?: string
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        background: active ? activeColor : 'rgba(255,255,255,0.92)',
        color: active ? '#FFFFFF' : '#334155',
        border: active ? `1px solid ${activeColor}` : '1px solid rgba(0,0,0,0.1)',
        borderRadius: 8,
        padding: '5px 11px',
        fontSize: 11,
        fontWeight: 800,
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        transition: 'all 0.18s ease',
      }}
    >
      {label}
    </button>
  )
}
