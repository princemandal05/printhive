'use client'

import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { detectModelFormat, type ModelFormat } from '@/utils/format-detector'

type CanvasTheme = 'dark' | 'slate' | 'pearl'
type MaterialFinish = 'standard' | 'matte' | 'silk' | 'metallic' | 'translucent'
type ViewAngle = 'iso' | 'front' | 'top' | 'side'

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

const SWATCH_COLORS = [
  { name: 'Terracotta Orange', hex: '#ea580c' },
  { name: 'Stealth Black', hex: '#1e293b' },
  { name: 'Arctic White', hex: '#f8fafc' },
  { name: 'Signal Red', hex: '#ef4444' },
  { name: 'Royal Blue', hex: '#3b82f6' },
  { name: 'Forest Green', hex: '#10b981' },
  { name: 'Silk Purple', hex: '#8b5cf6' },
  { name: 'Warm Gold', hex: '#f59e0b' },
]

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
        <div
          style={{
            height: 440,
            background: '#0F172A',
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F8FAFC',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 10 }}>🧊</div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#94A3B8' }}>Unable to preview this 3D model</p>
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
  color = '#ea580c',
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
  const [polyCount, setPolyCount] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [isGrabbing, setIsGrabbing] = useState(false)
  const [rotationStep, setRotationStep] = useState(0)

  // Advanced feature controls
  const [activeColor, setActiveColor] = useState(color)
  const [materialFinish, setMaterialFinish] = useState<MaterialFinish>('standard')
  const [showBed, setShowBed] = useState(true)
  const [isFloating, setIsFloating] = useState(false)
  const isFloatingRef = useRef(isFloating)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const sceneRef = useRef<THREE.Scene | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const shadowPlaneRef = useRef<THREE.Mesh | null>(null)
  const bedGridRef = useRef<THREE.GridHelper | null>(null)
  const matsRef = useRef<(THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial)[]>([])
  const initialCamPos = useRef<THREE.Vector3>(new THREE.Vector3())
  const initialTarget = useRef<THREE.Vector3>(new THREE.Vector3())
  const maxModelDim = useRef<number>(50)

  const detected = detectModelFormat({ format, fileName, mimeType, url: modelUrl })
  const fmt: ModelFormat = detected.format
  const safeColor = /^#[0-9A-Fa-f]{6}$/.test(activeColor || '') ? activeColor : '#ea580c'

  // Sync floating state
  useEffect(() => {
    isFloatingRef.current = isFloating
    if (groupRef.current) {
      const baseRotX = fmt === 'stl' || fmt === '3mf' ? -Math.PI / 2 : 0
      const tiltX = isFloating ? Math.PI / 5.5 : 0
      groupRef.current.rotation.x = baseRotX + (rotationStep % 2 === 1 ? Math.PI / 2 : 0) + tiltX
      groupRef.current.rotation.y = rotationStep >= 2 ? Math.PI : 0
    }
  }, [isFloating, rotationStep, fmt])

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
    matsRef.current.forEach((m) => {
      m.wireframe = wireframe
      m.needsUpdate = true
    })
  }, [wireframe])

  // Live material shader / finish / color update
  useEffect(() => {
    const c = new THREE.Color(safeColor)
    matsRef.current.forEach((m) => {
      if ((m as any)._isFilamentMat) {
        m.color.copy(c)

        if (m instanceof THREE.MeshPhysicalMaterial) {
          switch (materialFinish) {
            case 'matte':
              m.roughness = 0.85
              m.metalness = 0.0
              m.clearcoat = 0.0
              m.transmission = 0.0
              m.opacity = 1.0
              m.transparent = false
              break
            case 'silk':
              m.roughness = 0.18
              m.metalness = 0.25
              m.clearcoat = 0.6
              m.clearcoatRoughness = 0.1
              m.transmission = 0.0
              m.opacity = 1.0
              m.transparent = false
              break
            case 'metallic':
              m.roughness = 0.28
              m.metalness = 0.8
              m.clearcoat = 0.4
              m.transmission = 0.0
              m.opacity = 1.0
              m.transparent = false
              break
            case 'translucent':
              m.roughness = 0.15
              m.metalness = 0.05
              m.clearcoat = 0.8
              m.transmission = 0.65
              m.opacity = 0.85
              m.transparent = true
              break
            case 'standard':
            default:
              m.roughness = 0.32
              m.metalness = 0.08
              m.clearcoat = 0.35
              m.clearcoatRoughness = 0.2
              m.transmission = 0.0
              m.opacity = 1.0
              m.transparent = false
              break
          }
        }
        m.needsUpdate = true
      }
    })
  }, [safeColor, materialFinish])

  // Toggle 3D printer bed grid
  useEffect(() => {
    if (bedGridRef.current) {
      bedGridRef.current.visible = showBed
    }
  }, [showBed])

  // Dynamic canvas theme background update
  useEffect(() => {
    if (!sceneRef.current) return
    const bgHex = theme === 'dark' ? '#0F172A' : theme === 'slate' ? '#1E293B' : '#F1F5F9'
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

  // Refit camera helper
  const fitCameraToObject = (obj: THREE.Object3D, camera: THREE.PerspectiveCamera, controls: OrbitControls) => {
    obj.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(obj)
    if (box.isEmpty()) return

    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    // Center model in X and Z, and place base on Y = 0 (build plate)
    obj.position.x -= center.x
    obj.position.z -= center.z
    obj.position.y -= box.min.y

    setBounds({ x: Math.round(size.x), y: Math.round(size.y), z: Math.round(size.z) })

    // Auto-detect flat relief designs (e.g. pins, badges, keychains, coins) and enable floating showcase
    const isFlat = size.y <= Math.max(size.x, size.z) * 0.32 || size.y <= 15
    if (isFlat) {
      setIsFloating(true)
    }

    const maxDim = Math.max(size.x, size.y, size.z)
    maxModelDim.current = maxDim

    if (maxDim > 0) {
      if (shadowPlaneRef.current) {
        shadowPlaneRef.current.scale.set(maxDim / 25, maxDim / 25, 1)
        shadowPlaneRef.current.position.y = -0.1
      }

      if (bedGridRef.current) {
        const bedSize = Math.max(Math.ceil(maxDim * 1.5 / 10) * 10, 100)
        bedGridRef.current.scale.set(bedSize / 100, 1, bedSize / 100)
      }

      const fov = camera.fov * (Math.PI / 180)
      let dist = (maxDim / 2 / Math.tan(fov / 2)) * 1.45
      dist = Math.max(dist, 8)

      const targetY = size.y * 0.45
      controls.target.set(0, targetY, 0)
      initialTarget.current.set(0, targetY, 0)

      camera.position.set(dist * 0.65, targetY + dist * 0.35, dist * 0.85)
      initialCamPos.current.copy(camera.position)

      camera.near = Math.max(maxDim / 200, 0.05)
      camera.far = Math.max(maxDim * 60, 4000)
      camera.updateProjectionMatrix()

      controls.minDistance = Math.max(maxDim * 0.05, 0.5)
      controls.maxDistance = Math.max(dist * 8, maxDim * 15, 100)
      controls.update()
    }
  }

  // Snap to preset view angles (ISO, Front, Top, Side)
  const snapViewAngle = (angle: ViewAngle) => {
    if (!cameraRef.current || !controlsRef.current) return
    const camera = cameraRef.current
    const controls = controlsRef.current
    const targetY = initialTarget.current.y
    const maxDim = maxModelDim.current || 50
    const fov = camera.fov * (Math.PI / 180)
    const dist = Math.max((maxDim / 2 / Math.tan(fov / 2)) * 1.45, 10)

    controls.target.set(0, targetY, 0)

    switch (angle) {
      case 'front':
        camera.position.set(0, targetY, dist * 1.25)
        break
      case 'top':
        camera.position.set(0, targetY + dist * 1.35, 0.001)
        break
      case 'side':
        camera.position.set(dist * 1.25, targetY, 0)
        break
      case 'iso':
      default:
        camera.position.set(dist * 0.65, targetY + dist * 0.35, dist * 0.85)
        break
    }
    camera.lookAt(0, targetY, 0)
    controls.update()
  }

  // Rotate model orientation by 90 degrees
  const handleRotateOrientation = () => {
    if (!groupRef.current || !cameraRef.current || !controlsRef.current) return
    const nextStep = (rotationStep + 1) % 4
    setRotationStep(nextStep)

    const baseRotX = fmt === 'stl' || fmt === '3mf' ? -Math.PI / 2 : 0
    groupRef.current.rotation.x = baseRotX + (nextStep % 2 === 1 ? Math.PI / 2 : 0)
    groupRef.current.rotation.y = nextStep >= 2 ? Math.PI : 0
    groupRef.current.position.set(0, 0, 0)

    fitCameraToObject(groupRef.current, cameraRef.current, controlsRef.current)
  }

  // High-Resolution Snapshot Capture & Download
  const handleCaptureSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return
    rendererRef.current.render(sceneRef.current, cameraRef.current)
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_render.png`
    link.href = dataUrl
    link.click()
  }

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
    const bgHex = theme === 'dark' ? '#0F172A' : theme === 'slate' ? '#1E293B' : '#F1F5F9'
    scene.background = new THREE.Color(bgHex)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 5000)
    camera.position.set(0, 40, 120)
    cameraRef.current = camera
    scene.add(camera)

    // Renderer with Tone Mapping & Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
      preserveDrawingBuffer: true,
    })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Smooth Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.autoRotate = rotatingRef.current
    controls.autoRotateSpeed = 1.4
    controls.enableZoom = true
    controls.enablePan = true
    controlsRef.current = controls

    // ─── Studio 4-Point Illumination System ───────────────
    // 1. Camera-Mounted Follow Light
    const cameraKeyLight = new THREE.DirectionalLight(0xffffff, 1.4)
    cameraKeyLight.position.set(10, 20, 30)
    camera.add(cameraKeyLight)

    const cameraFillLight = new THREE.DirectionalLight(0xdbeafe, 0.9)
    cameraFillLight.position.set(-25, -10, 25)
    camera.add(cameraFillLight)

    // 2. Global Hemisphere Sky/Ground Ambient Light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.2)
    scene.add(hemiLight)

    // 3. Top-Down Key Light
    const topKey = new THREE.DirectionalLight(0xffffff, 1.1)
    topKey.position.set(60, 180, 80)
    topKey.castShadow = true
    topKey.shadow.bias = -0.0001
    scene.add(topKey)

    // 4. Back-Rim Light
    const rimLight = new THREE.DirectionalLight(0xffedd5, 0.9)
    rimLight.position.set(-50, 100, -120)
    scene.add(rimLight)

    // ─── 3D Printer Bed Grid ──────────────────────────────
    const bedGrid = new THREE.GridHelper(100, 20, 0xea580c, 0x334155)
    bedGrid.position.y = 0.01
    bedGridRef.current = bedGrid
    bedGrid.visible = showBed
    scene.add(bedGrid)

    // ─── Soft Circular Contact Shadow Plane ──────────────
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 256
    shadowCanvas.height = 256
    const ctx = shadowCanvas.getContext('2d')
    if (ctx) {
      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)')
      grad.addColorStop(0.4, 'rgba(0, 0, 0, 0.18)')
      grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.04)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 256, 256)
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
      })
    )
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.y = 0
    shadowPlaneRef.current = shadowPlane
    scene.add(shadowPlane)

    // ─── Model Group Container ───────────────────────────
    const group = new THREE.Group()
    groupRef.current = group
    scene.add(group)

    // Photorealistic Filament PBR Material Factory
    const makeFilamentMat = (): THREE.MeshPhysicalMaterial => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(safeColor),
        roughness: 0.32,
        metalness: 0.08,
        clearcoat: 0.35,
        clearcoatRoughness: 0.2,
        reflectivity: 0.6,
        wireframe,
        side: THREE.DoubleSide,
      })
      ;(mat as any)._isFilamentMat = true
      matsRef.current.push(mat)
      return mat
    }

    // Process & Style Loaded Meshes (Preserves original embedded materials & textures when present)
    const styleMeshes = (root: THREE.Object3D) => {
      let totalTris = 0
      root.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.computeVertexNormals()
          child.castShadow = true
          child.receiveShadow = true

          if (child.geometry?.attributes?.position) {
            const count = child.geometry.index
              ? child.geometry.index.count / 3
              : child.geometry.attributes.position.count / 3
            totalTris += Math.round(count)
          }

          const origMat = child.material
          const hasOriginalTexture = !!(origMat && (origMat.map || (origMat as any).normalMap))
          const hasVertexColors = !!child.geometry?.attributes?.color

          if (hasOriginalTexture || hasVertexColors) {
            if (origMat instanceof THREE.MeshStandardMaterial || origMat instanceof THREE.MeshPhysicalMaterial) {
              origMat.roughness = Math.min(origMat.roughness ?? 0.4, 0.5)
              origMat.metalness = Math.min(origMat.metalness ?? 0.1, 0.2)
              origMat.wireframe = wireframe
              origMat.side = THREE.DoubleSide
              origMat.needsUpdate = true
              matsRef.current.push(origMat)
            } else if (origMat) {
              const enhancedMat = new THREE.MeshStandardMaterial({
                color: (origMat as any).color ? (origMat as any).color : 0xffffff,
                map: (origMat as any).map || null,
                vertexColors: hasVertexColors,
                roughness: 0.4,
                metalness: 0.08,
                wireframe,
                side: THREE.DoubleSide,
              })
              child.material = enhancedMat
              matsRef.current.push(enhancedMat)
            }
          } else {
            child.material = makeFilamentMat()
          }
        }
      })
      if (totalTris > 0) setPolyCount(totalTris)
    }

    // Shared fetch helper with abort timeout and non-OK response handling
    const fetchModelData = async (url: string, asText = false) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 35000)
      try {
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch 3D model file`)
        }
        return asText ? await res.text() : await res.arrayBuffer()
      } finally {
        clearTimeout(timeoutId)
      }
    }

    // ─── Load Model ──────────────────────────────────────
    const load = async () => {
      if (!modelUrl) {
        setLoading(false)
        setError('No model file URL available.')
        return
      }

      try {
        if (fmt === 'stl') {
          const buf = (await fetchModelData(modelUrl)) as ArrayBuffer
          if (disposed) return
          const geo = new STLLoader().parse(buf)
          if (!geo?.attributes?.position?.count) throw new Error('Empty STL file')
          geo.computeVertexNormals()
          const mesh = new THREE.Mesh(geo, makeFilamentMat())
          mesh.castShadow = true
          mesh.receiveShadow = true

          const tris = Math.round(geo.attributes.position.count / 3)
          setPolyCount(tris)

          // Standard STL files from CAD/Slicers are Z-up; orient upright in Three.js Y-up world
          group.rotation.x = -Math.PI / 2
          group.add(mesh)

          fitCameraToObject(group, camera, controls)
          setLoading(false)

        } else if (fmt === '3mf') {
          const buf = (await fetchModelData(modelUrl)) as ArrayBuffer
          if (disposed) return
          const parsed = new ThreeMFLoader().parse(buf)
          if (!parsed?.children?.length) throw new Error('Empty 3MF file')
          styleMeshes(parsed)

          // Standard 3MF files are Z-up; orient upright in Three.js Y-up world
          group.rotation.x = -Math.PI / 2
          group.add(parsed)

          fitCameraToObject(group, camera, controls)
          setLoading(false)

        } else if (fmt === 'obj') {
          const txt = (await fetchModelData(modelUrl, true)) as string
          if (disposed) return
          const parsed = new OBJLoader().parse(txt)
          if (!parsed?.children?.length) throw new Error('Empty OBJ file')
          styleMeshes(parsed)
          group.add(parsed)

          fitCameraToObject(group, camera, controls)
          setLoading(false)

        } else if (fmt === 'glb' || fmt === 'gltf') {
          new GLTFLoader().load(
            modelUrl,
            (gltf) => {
              if (disposed) return
              const s = gltf.scene || gltf.scenes[0]
              if (!s) {
                setError('Empty GLTF file')
                setLoading(false)
                return
              }
              styleMeshes(s)
              group.add(s)
              fitCameraToObject(group, camera, controls)
              setLoading(false)
            },
            undefined,
            (e: any) => {
              if (!disposed) {
                setError(e?.message || 'GLTF loader error')
                setLoading(false)
              }
            }
          )
        } else {
          setUnsupported(fmt.toUpperCase())
          setLoading(false)
        }
      } catch (err: any) {
        console.error('Model load error:', err)
        if (!disposed) {
          setError(err.message || 'Model rendering failed')
          setLoading(false)
        }
      }
    }
    load()

    // ─── Interaction Listeners ───────────────────────────
    const onMouseDown = () => {
      setIsGrabbing(true)
      setShowHint(false)
    }
    const onMouseUp = () => setIsGrabbing(false)

    // Double-click to auto reset & re-center view
    const onDblClick = () => {
      if (controlsRef.current && cameraRef.current) {
        cameraRef.current.position.copy(initialCamPos.current)
        controlsRef.current.target.copy(initialTarget.current)
        controlsRef.current.update()
      }
    }

    const dom = renderer.domElement
    dom.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    dom.addEventListener('dblclick', onDblClick)

    // Render loop
    let animId: number
    const clock = new THREE.Clock()
    const tick = () => {
      animId = requestAnimationFrame(tick)
      const time = clock.getElapsedTime()

      if (groupRef.current && isFloatingRef.current) {
        const floatOffset = Math.sin(time * 2.2) * (maxModelDim.current * 0.025)
        groupRef.current.position.y = (maxModelDim.current * 0.15) + floatOffset
        if (shadowPlaneRef.current) {
          shadowPlaneRef.current.position.y = -0.05
          shadowPlaneRef.current.scale.setScalar((maxModelDim.current / 22) * (1 + Math.sin(time * 2.2) * 0.06))
        }
      } else if (groupRef.current) {
        groupRef.current.position.y = 0
        if (shadowPlaneRef.current) {
          shadowPlaneRef.current.scale.set(maxModelDim.current / 25, maxModelDim.current / 25, 1)
        }
      }

      controls.update()
      renderer.render(scene, camera)
    }
    tick()

    // Resize handler
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
      matsRef.current.forEach((m) => m.dispose())
    }
  }, [modelUrl, fmt, height, isFullscreen])

  const handleResetView = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.copy(initialCamPos.current)
      controlsRef.current.target.copy(initialTarget.current)
      controlsRef.current.update()
    }
  }

  const cycleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'slate' : prev === 'slate' ? 'pearl' : 'dark'))
  }

  // ─── Error / unsupported fallback ──────────────────────
  if (unsupported || error) {
    return (
      <div
        style={{
          height,
          background: '#0F172A',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          textAlign: 'center',
          color: '#F8FAFC',
          border: '1px solid #334155',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 10 }}>🧊</div>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px' }}>Unable to preview model</h3>
        <p style={{ fontSize: 13, color: '#94A3B8', maxWidth: 340, margin: '0 0 18px' }}>
          {unsupported ? `${unsupported} format preview is not supported. Download the file to view.` : error}
        </p>
        {modelUrl && (
          <a
            href={modelUrl}
            download={fileName || `model.${fmt}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#ea580c',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            📥 Download {fmt.toUpperCase()}
          </a>
        )}
      </div>
    )
  }

  const isLightMode = theme === 'pearl'

  // ─── Main Viewer ───────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 99999 : 1,
        width: '100%',
        height: isFullscreen ? '100vh' : height,
        background:
          theme === 'dark'
            ? 'radial-gradient(circle at 50% 35%, #1E293B 0%, #0F172A 100%)'
            : theme === 'slate'
              ? 'radial-gradient(circle at 50% 35%, #334155 0%, #1E293B 100%)'
              : '#F1F5F9',
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
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isLightMode ? 'rgba(241, 245, 249, 0.92)' : 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8, animation: 'spin 1.5s linear infinite' }}>⏳</div>
          <div style={{ color: isLightMode ? '#0F172A' : '#F8FAFC', fontWeight: 800, fontSize: 14 }}>
            Preparing {fmt.toUpperCase()} Studio Preview…
          </div>
        </div>
      )}

      {/* Top-left: Minimal Specs & Mesh Analytics Badge */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 5,
          background: isLightMode ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(10px)',
          border: isLightMode ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: isLightMode ? '#334155' : '#CBD5E1' }}>
          {bounds.x} × {bounds.y} × {bounds.z} mm
        </span>
        {polyCount !== null && (
          <span style={{ fontSize: 10, fontWeight: 700, color: isLightMode ? '#64748B' : '#94A3B8' }}>
            • {polyCount >= 1000 ? `${(polyCount / 1000).toFixed(1)}k` : polyCount} ▲
          </span>
        )}
        <span
          style={{
            background: '#8B5CF6',
            color: '#fff',
            fontSize: 9,
            fontWeight: 900,
            padding: '2px 7px',
            borderRadius: 5,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {fmt}
        </span>
      </div>

      {/* Top-right: Snap View Angles & Snapshot Button */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 5,
          display: 'flex',
          gap: 5,
          alignItems: 'center',
        }}
      >
        {(['iso', 'front', 'top', 'side'] as ViewAngle[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => snapViewAngle(v)}
            title={`View from ${v.toUpperCase()}`}
            style={{
              background: isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.8)',
              color: isLightMode ? '#334155' : '#CBD5E1',
              border: isLightMode ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 10.5,
              fontWeight: 800,
              cursor: 'pointer',
              textTransform: 'uppercase',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            }}
          >
            {v}
          </button>
        ))}

        <button
          type="button"
          onClick={handleCaptureSnapshot}
          title="Download High-Res Render Snapshot"
          style={{
            background: isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.8)',
            color: '#ea580c',
            border: isLightMode ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 10.5,
            fontWeight: 800,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          📸 Snap
        </button>
      </div>

      {/* Center Gesture Hint (fades away automatically) */}
      {showHint && !loading && (
        <div
          style={{
            position: 'absolute',
            top: 50,
            right: 12,
            zIndex: 4,
            background: isLightMode ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(8px)',
            border: isLightMode ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '4px 10px',
            color: isLightMode ? '#475569' : '#94A3B8',
            fontSize: 11,
            fontWeight: 600,
            pointerEvents: 'none',
            transition: 'opacity 0.5s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          🖱️ Drag to orbit • Double-click to center
        </div>
      )}

      {/* Bottom Color Swatches Bar (when color picker opened) */}
      {showColorPicker && (
        <div
          style={{
            position: 'absolute',
            bottom: 54,
            right: 12,
            zIndex: 6,
            background: isLightMode ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            backdropFilter: 'blur(12px)',
            border: isLightMode ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: '8px 10px',
            display: 'flex',
            gap: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          {SWATCH_COLORS.map((sw) => (
            <button
              key={sw.hex}
              type="button"
              onClick={() => {
                setActiveColor(sw.hex)
                setShowColorPicker(false)
              }}
              title={sw.name}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: sw.hex,
                border: activeColor.toLowerCase() === sw.hex.toLowerCase() ? '2px solid #ea580c' : '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            />
          ))}
        </div>
      )}

      {/* Bottom-right: Comprehensive Control Toolbar */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          zIndex: 5,
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        {/* Filament Finish Selector */}
        <select
          value={materialFinish}
          onChange={(e) => setMaterialFinish(e.target.value as MaterialFinish)}
          title="Material Finish"
          style={{
            background: isLightMode ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.8)',
            color: isLightMode ? '#1E293B' : '#CBD5E1',
            border: isLightMode ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '5px 8px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            outline: 'none',
            backdropFilter: 'blur(8px)',
          }}
        >
          <option value="standard">✨ Standard PLA</option>
          <option value="matte">🧱 Matte Finish</option>
          <option value="silk">🌟 Silk Gloss</option>
          <option value="metallic">🥇 Metallic</option>
          <option value="translucent">💎 Translucent</option>
        </select>

        <ViewerBtn
          active={showColorPicker}
          onClick={() => setShowColorPicker(!showColorPicker)}
          label="🎨 Color"
          title="Pick Filament Color"
          isLightMode={isLightMode}
        />

        <ViewerBtn
          active={isFloating}
          onClick={() => setIsFloating(!isFloating)}
          label={isFloating ? '🛸 Float ON' : '🛸 Float'}
          title="Toggle Floating Showcase View for flat / relief models"
          isLightMode={isLightMode}
        />

        <ViewerBtn
          active={showBed}
          onClick={() => setShowBed(!showBed)}
          label={showBed ? '🖨️ Bed ON' : '🖨️ Bed OFF'}
          title="Toggle 3D Printer Build Plate"
          isLightMode={isLightMode}
        />

        <ViewerBtn
          active={false}
          onClick={handleRotateOrientation}
          label="🔄 Orient"
          title="Rotate model orientation 90°"
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
          label={wireframe ? '◼ Solid' : '◻ Wire'}
          title="Toggle wireframe mode"
          isLightMode={isLightMode}
        />

        <ViewerBtn
          active={rotating}
          onClick={() => setRotating(!rotating)}
          label={rotating ? '⏸' : '🔄 Auto'}
          activeColor="#ea580c"
          title="Toggle auto rotation"
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
            : 'rgba(15,23,42,0.8)',
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
        padding: '5px 10px',
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
