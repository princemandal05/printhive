'use client'

import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { detectModelFormat, type ModelFormat } from '@/utils/format-detector'

type CanvasTheme = 'dark' | 'slate' | 'pearl'

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
  initialTheme?: CanvasTheme
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
          color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.08)',
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
  initialTheme = 'dark',
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
  const [theme, setTheme] = useState<CanvasTheme>(initialTheme)
  const [bounds, setBounds] = useState(dimensions)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [isGrabbing, setIsGrabbing] = useState(false)

  const sceneRef = useRef<THREE.Scene | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const matsRef = useRef<THREE.MeshPhysicalMaterial[]>([])
  const initialCamPos = useRef<THREE.Vector3>(new THREE.Vector3())

  const detected = detectModelFormat({ format, fileName, mimeType, url: modelUrl })
  const fmt: ModelFormat = detected.format
  const safeColor = /^#[0-9A-Fa-f]{6}$/.test(color || '') ? color! : '#FF6B35'

  // Hide gesture hint after 4 seconds
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

  // Dynamic canvas theme background update
  useEffect(() => {
    if (!sceneRef.current) return
    const bgHex = theme === 'dark' ? '#0F172A' : theme === 'slate' ? '#1E293B' : '#E2E8F0'
    sceneRef.current.background = new THREE.Color(bgHex)
  }, [theme])

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

    // Scene with Studio Background
    const scene = new THREE.Scene()
    const bgHex = theme === 'dark' ? '#0F172A' : theme === 'slate' ? '#1E293B' : '#E2E8F0'
    scene.background = new THREE.Color(bgHex)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 5000)
    camera.position.set(0, 30, 120)
    cameraRef.current = camera
    scene.add(camera)

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

    // ─── High-Definition HDR Studio Environment ──────────
    // Provides realistic micro-reflections & curvature depth on sculpts/creases
    const pmrem = new THREE.PMREMGenerator(renderer)
    pmrem.compileEquirectangularShader()
    const roomEnv = new RoomEnvironment()
    const envTexture = pmrem.fromScene(roomEnv, 0.04).texture
    scene.environment = envTexture
    roomEnv.dispose()
    pmrem.dispose()

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

    // ─── High-Contrast 6-Point Studio Lighting ───────────
    // 1. Ambient fill
    scene.add(new THREE.AmbientLight(0xffffff, 0.75))

    // 2. Soft sky/ground bounce
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 0.6))

    // 3. Camera Ring Light: directly follows view to highlight front details
    const cameraRingLight = new THREE.DirectionalLight(0xffffff, 0.85)
    cameraRingLight.position.set(0, 0, 1)
    camera.add(cameraRingLight)

    // 4. Primary Key Light (45° right-top for sculpted edge shadow contrast)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
    keyLight.position.set(60, 80, 90)
    keyLight.castShadow = true
    keyLight.shadow.bias = -0.0001
    scene.add(keyLight)

    // 5. Fill Light (Soft cool fill from left)
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.6)
    fillLight.position.set(-80, 50, 70)
    scene.add(fillLight)

    // 6. Silhouette Rim Light (Gives crisp edge separation from background)
    const rimLight = new THREE.DirectionalLight(0xffedd5, 0.95)
    rimLight.position.set(0, 90, -120)
    scene.add(rimLight)

    // ─── Soft Contact Shadow Plane ──────────────────────
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 128
    shadowCanvas.height = 128
    const ctx = shadowCanvas.getContext('2d')
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)')
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.12)')
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

    // High-Definition PBR Filament Material with Sheen & Micro-Contrast
    const makeMat = (): THREE.MeshPhysicalMaterial => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(safeColor),
        roughness: 0.36, // Balanced satin polymer sheen that brings out sculpt detail
        metalness: 0.04,
        clearcoat: 0.3, // Micro-clearcoat adds crisp edge specular definition
        clearcoatRoughness: 0.18,
        reflectivity: 0.65,
        sheen: 0.5, // Sheen accentuates creases, folds, hair, and edges
        sheenColor: new THREE.Color(0xffffff),
        sheenRoughness: 0.25,
        wireframe,
        side: THREE.DoubleSide,
      })
      matsRef.current.push(mat)
      return mat
    }

    const styleMeshes = (root: THREE.Object3D) => {
      root.traverse(child => {
        if (child instanceof THREE.Mesh) {
          if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals()
          }
          child.material = makeMat()
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }

    // Fit model to fill camera perfectly with natural 3/4 beauty angle
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

        // Balanced 3/4 perspective showing full facial details with depth
        camera.position.set(dist * 0.45, dist * 0.22, dist * 0.85)
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
          if (!geo.attributes.normal) geo.computeVertexNormals()
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
      envTexture?.dispose()
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

  const cycleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'slate' : prev === 'slate' ? 'pearl' : 'dark')
  }

  // ─── Error / unsupported fallback ─────────────────────
  if (unsupported || error) {
    const fallbackBg =
      theme === 'dark'
        ? '#0F172A'
        : theme === 'slate'
        ? '#1E293B'
        : '#E2E8F0'
    const fallbackText = theme === 'pearl' ? '#0F172A' : '#F8FAFC'
    const fallbackSubtext = theme === 'pearl' ? '#64748B' : '#94A3B8'
    const fallbackBorder = theme === 'pearl' ? '1px solid #CBD5E1' : '1px solid #334155'

    return (
      <div style={{
        height, background: fallbackBg, borderRadius: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 32, textAlign: 'center', color: fallbackText, border: fallbackBorder,
      }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🧊</div>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px', color: fallbackText }}>Unable to preview</h3>
        <p style={{ fontSize: 13, color: fallbackSubtext, maxWidth: 340, margin: '0 0 18px' }}>
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

  const isLightMode = theme === 'pearl'

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
        background: theme === 'dark'
          ? 'radial-gradient(circle at 50% 40%, #1E293B 0%, #0F172A 100%)'
          : theme === 'slate'
          ? '#1E293B'
          : '#E2E8F0',
        borderRadius: isFullscreen ? 0 : 20,
        overflow: 'hidden',
        border: isFullscreen ? 'none' : theme === 'pearl' ? '1px solid #CBD5E1' : '1px solid #334155',
        boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.12)',
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
          position: 'absolute', inset: 0,
          background: isLightMode ? 'rgba(226, 232, 240, 0.92)' : 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(6px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8, animation: 'spin 1.5s linear infinite' }}>⏳</div>
          <div style={{ color: isLightMode ? '#0F172A' : '#F8FAFC', fontWeight: 800, fontSize: 14 }}>
            Loading {fmt.toUpperCase()} Model…
          </div>
        </div>
      )}

      {/* Top-left: Minimal Specs Badge */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 5,
        background: isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.75)',
        backdropFilter: 'blur(10px)',
        border: isLightMode ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: isLightMode ? '#334155' : '#CBD5E1' }}>
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
          background: isLightMode ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(8px)',
          border: isLightMode ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8,
          padding: '4px 10px',
          color: isLightMode ? '#475569' : '#94A3B8',
          fontSize: 11, fontWeight: 600,
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
          isLightMode={isLightMode}
        />
        <ViewerBtn
          active={false}
          onClick={cycleTheme}
          label={theme === 'dark' ? '🌙 Dark' : theme === 'slate' ? '🏢 Slate' : '☁️ Pearl'}
          title="Switch Canvas Background Theme"
          isLightMode={isLightMode}
        />
        <ViewerBtn
          active={wireframe}
          onClick={() => setWireframe(!wireframe)}
          label={wireframe ? '◼ Solid' : '◻ Wireframe'}
          title="Toggle wireframe mode"
          isLightMode={isLightMode}
        />
        <ViewerBtn
          active={rotating}
          onClick={() => setRotating(!rotating)}
          label={rotating ? '⏸ Pause' : '🔄 Rotate'}
          activeColor="#FF6B35"
          title="Toggle auto rotation"
          isLightMode={isLightMode}
        />
        <ViewerBtn
          active={isFullscreen}
          onClick={() => setIsFullscreen(!isFullscreen)}
          label={isFullscreen ? '✖ Exit' : '⛶ Full'}
          title="Toggle fullscreen view"
          isLightMode={isLightMode}
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
  isLightMode = false,
}: {
  active: boolean
  onClick: () => void
  label: string
  activeColor?: string
  title?: string
  isLightMode?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        background: active
          ? activeColor
          : isLightMode
          ? 'rgba(255,255,255,0.92)'
          : 'rgba(15,23,42,0.75)',
        color: active
          ? '#FFFFFF'
          : isLightMode
          ? '#1E293B'
          : '#94A3B8',
        border: active
          ? `1px solid ${activeColor}`
          : isLightMode
          ? '1px solid rgba(0,0,0,0.1)'
          : '1px solid rgba(255,255,255,0.1)',
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
