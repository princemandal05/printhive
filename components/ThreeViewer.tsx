'use client'

import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { detectModelFormat, type ModelFormat } from '@/utils/format-detector'

export type FilamentFinish = 'silky' | 'matte' | 'glossy' | 'metallic'

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
  errorMessage: string
}

class ThreeViewerErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message || '3D WebGL Rendering Error' }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ThreeViewer Error Boundary caught failure:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: 440,
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            textAlign: 'center',
            color: '#F8FAFC',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>🧊</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px 0', color: '#F8FAFC' }}>
            Unable to preview this 3D model.
          </h3>
          <p style={{ fontSize: 13, color: '#94A3B8', maxWidth: 360, margin: '0 0 20px 0' }}>
            Download the original file to view or slice it in your 3D printing software.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

export default function ThreeViewer(props: ThreeViewerProps) {
  return (
    <ThreeViewerErrorBoundary fallbackTitle={props.title}>
      <ThreeViewerContent {...props} />
    </ThreeViewerErrorBoundary>
  )
}

function ThreeViewerContent({
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

  // Loading & Error States
  const [loadingModel, setLoadingModel] = useState(true)
  const [unsupportedFormat, setUnsupportedFormat] = useState<string | null>(null)
  const [modelLoadError, setModelLoadError] = useState<string | null>(null)

  // Interactive Viewport Controls
  const [wireframe, setWireframe] = useState(wireframeDefault)
  const [rotating, setRotating] = useState(autoRotateDefault)
  const rotatingRef = useRef(rotating)
  const [showEdges, setShowEdges] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [finish, setFinish] = useState<FilamentFinish>('silky')
  const [sliceProgress, setSliceProgress] = useState(100)
  const [isSlicingActive, setIsSlicingActive] = useState(false)

  // Geometry Diagnostics
  const [computedBounds, setComputedBounds] = useState({ x: dimensions.x, y: dimensions.y, z: dimensions.z })
  const [stats, setStats] = useState({ triangles: 0, vertices: 0 })

  // Three.js References
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const edgesGroupRef = useRef<THREE.Group | null>(null)
  const gridHelperRef = useRef<THREE.GridHelper | null>(null)
  const materialsRef = useRef<THREE.MeshPhysicalMaterial[]>([])
  const clippingPlaneRef = useRef<THREE.Plane | null>(null)
  const modelHeightRef = useRef<number>(50)

  const detectedInfo = detectModelFormat({
    format,
    fileName,
    mimeType,
    url: modelUrl,
  })
  const detectedFormat: ModelFormat = detectedInfo.format

  const validColor = /^#[0-9A-F]{6}$/i.test(color || '') ? color : '#FF6B35'

  // Update rotation state and OrbitControls
  useEffect(() => {
    rotatingRef.current = rotating
    if (controlsRef.current) {
      controlsRef.current.autoRotate = rotating
    }
  }, [rotating])

  // Update wireframe mode
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      mat.wireframe = wireframe
    })
  }, [wireframe])

  // Toggle CAD feature contour lines
  useEffect(() => {
    if (edgesGroupRef.current) {
      edgesGroupRef.current.visible = showEdges && !wireframe
    }
  }, [showEdges, wireframe])

  // Toggle 3D printer build plate grid
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid
    }
  }, [showGrid])

  // Update Filament Finish Shading (Silky, Matte, Glossy, Metallic)
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      switch (finish) {
        case 'matte':
          mat.roughness = 0.75
          mat.metalness = 0.02
          mat.clearcoat = 0.0
          mat.clearcoatRoughness = 0.0
          break
        case 'glossy':
          mat.roughness = 0.12
          mat.metalness = 0.05
          mat.clearcoat = 0.85
          mat.clearcoatRoughness = 0.05
          break
        case 'metallic':
          mat.roughness = 0.32
          mat.metalness = 0.75
          mat.clearcoat = 0.2
          mat.clearcoatRoughness = 0.1
          break
        case 'silky':
        default:
          mat.roughness = 0.28
          mat.metalness = 0.08
          mat.clearcoat = 0.35
          mat.clearcoatRoughness = 0.15
          break
      }
      mat.needsUpdate = true
    })
  }, [finish])

  // Real-time Slicing Layer Height Simulation
  useEffect(() => {
    if (!clippingPlaneRef.current || !rendererRef.current) return

    if (isSlicingActive && sliceProgress < 100) {
      rendererRef.current.clippingPlanes = [clippingPlaneRef.current]
      const halfH = modelHeightRef.current / 2
      const cutoff = -halfH + (sliceProgress / 100) * modelHeightRef.current
      clippingPlaneRef.current.constant = cutoff
    } else {
      rendererRef.current.clippingPlanes = []
    }
  }, [sliceProgress, isSlicingActive])

  // Dynamic Filament Color Sync
  useEffect(() => {
    if (!groupRef.current) return
    const threeColor = new THREE.Color(validColor)
    materialsRef.current.forEach((mat) => {
      mat.color.copy(threeColor)
      mat.needsUpdate = true
    })
  }, [validColor])

  // Escape key exits fullscreen
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isFullscreen])

  // Main Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return

    const width = mountRef.current.clientWidth || 600
    const heightPx = isFullscreen
      ? window.innerHeight
      : typeof height === 'number'
      ? height
      : mountRef.current.clientHeight || 460

    let isDisposed = false
    materialsRef.current = []

    // Scene & Deep Slate Radial Gradient
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0B0F19')
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 3000)
    camera.position.set(0, 45, 140)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // Allows clean snapshots
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, heightPx)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.localClippingEnabled = true
    rendererRef.current = renderer

    mountRef.current.innerHTML = ''
    mountRef.current.appendChild(renderer.domElement)

    // OrbitControls for CAD navigation
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.autoRotate = rotatingRef.current
    controls.autoRotateSpeed = 1.5
    controls.enableZoom = true
    controls.enablePan = true
    controlsRef.current = controls

    // Slicing Clipping Plane
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1000)
    clippingPlaneRef.current = clippingPlane

    // 3D Printer Build Plate Grid Helper (220mm x 220mm standard bed)
    const grid = new THREE.GridHelper(220, 22, 0xff6b35, 0x1e293b)
    grid.position.y = -0.5
    grid.visible = showGrid
    gridHelperRef.current = grid
    scene.add(grid)

    // Studio Multi-Point CAD Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.9)
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.45)
    keyLight.position.set(120, 180, 140)
    keyLight.castShadow = true
    keyLight.shadow.bias = -0.0001
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 0.8)
    fillLight.position.set(-140, 60, 80)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffedd5, 1.2)
    rimLight.position.set(0, 120, -180)
    scene.add(rimLight)

    const bounceLight = new THREE.DirectionalLight(0x334155, 0.5)
    bounceLight.position.set(0, -120, 0)
    scene.add(bounceLight)

    // Mesh Groups
    const group = new THREE.Group()
    groupRef.current = group
    scene.add(group)

    const edgesGroup = new THREE.Group()
    edgesGroupRef.current = edgesGroup
    group.add(edgesGroup)

    const createFilamentMaterial = () => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(validColor),
        roughness: 0.28,
        metalness: 0.08,
        clearcoat: 0.35,
        clearcoatRoughness: 0.15,
        reflectivity: 0.6,
        wireframe: wireframe,
        side: THREE.DoubleSide,
        clippingPlanes: isSlicingActive ? [clippingPlane] : [],
        clipShadows: true,
      })
      materialsRef.current.push(mat)
      return mat
    }

    const addCrispEdgesToMesh = (mesh: THREE.Mesh) => {
      if (!mesh.geometry) return
      try {
        const edgeGeom = new THREE.EdgesGeometry(mesh.geometry, 28)
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0x05070c,
          transparent: true,
          opacity: 0.35,
          linewidth: 1,
        })
        const line = new THREE.LineSegments(edgeGeom, edgeMat)
        line.position.copy(mesh.position)
        line.rotation.copy(mesh.rotation)
        line.scale.copy(mesh.scale)
        edgesGroup.add(line)
      } catch {
        // Fallback
      }
    }

    const applyFilamentStyling = (targetGroup: THREE.Object3D) => {
      let totalTriangles = 0
      let totalVertices = 0

      targetGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) {
            child.geometry.computeVertexNormals()
            const pos = child.geometry.attributes.position
            if (pos) {
              totalVertices += pos.count
              totalTriangles += child.geometry.index ? child.geometry.index.count / 3 : pos.count / 3
            }
          }
          child.material = createFilamentMaterial()
          child.castShadow = true
          child.receiveShadow = true
          addCrispEdgesToMesh(child)
        }
      })

      if (!isDisposed) {
        setStats({ triangles: Math.round(totalTriangles), vertices: Math.round(totalVertices) })
      }
    }

    const fitObjectToCamera = (object: THREE.Object3D) => {
      const bbox = new THREE.Box3().setFromObject(object)
      if (bbox.isEmpty()) return

      const size = bbox.getSize(new THREE.Vector3())
      const center = bbox.getCenter(new THREE.Vector3())

      // Center model on top of build plate
      object.position.sub(center)

      const rawX = size.x
      const rawY = size.y
      const rawZ = size.z

      modelHeightRef.current = rawY || 50

      if (!isDisposed) {
        setComputedBounds({ x: Math.round(rawX), y: Math.round(rawY), z: Math.round(rawZ) })
      }

      const maxDim = Math.max(rawX, rawY, rawZ)
      if (maxDim > 0) {
        const fovRad = camera.fov * (Math.PI / 180)
        let cameraDist = Math.abs(maxDim / 2 / Math.tan(fovRad / 2)) * 1.55
        cameraDist = Math.max(cameraDist, 10)

        camera.position.set(0, maxDim * 0.35, cameraDist)
        camera.lookAt(0, 0, 0)
        controls.target.set(0, 0, 0)

        camera.near = Math.max(maxDim / 100, 0.1)
        camera.far = Math.max(maxDim * 100, 3000)
        camera.updateProjectionMatrix()
        controls.update()
      }
    }

    const loadActualModel = async () => {
      console.log('3D MODEL DEBUG', { modelUrl, modelFormat: format || fileName?.split('.').pop() || detectedFormat, modelFileName: fileName })
      console.log(`3D MODEL LOADER: ${detectedFormat.toUpperCase()}Loader`)

      if (!modelUrl) {
        setLoadingModel(false)
        setModelLoadError('No 3D model file URL available.')
        return
      }

      try {
        if (detectedFormat === 'stl') {
          const res = await fetch(modelUrl)
          if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to download STL file`)
          const buffer = await res.arrayBuffer()
          if (isDisposed) return

          const loader = new STLLoader()
          const geometry = loader.parse(buffer)
          if (!geometry || geometry.attributes.position.count === 0) {
            throw new Error('STL geometry contains no vertex positions')
          }

          geometry.computeVertexNormals()
          const pos = geometry.attributes.position
          if (pos) {
            setStats({
              triangles: Math.round(pos.count / 3),
              vertices: pos.count,
            })
          }

          const mesh = new THREE.Mesh(geometry, createFilamentMaterial())
          mesh.castShadow = true
          mesh.receiveShadow = true
          group.add(mesh)
          addCrispEdgesToMesh(mesh)

          fitObjectToCamera(group)
          setLoadingModel(false)
        } else if (detectedFormat === '3mf') {
          const res = await fetch(modelUrl)
          if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to download 3MF file`)
          const buffer = await res.arrayBuffer()
          if (isDisposed) return

          const loader = new ThreeMFLoader()
          const parsedGroup = loader.parse(buffer)
          if (!parsedGroup || parsedGroup.children.length === 0) {
            throw new Error('3MF model contains no object meshes')
          }

          applyFilamentStyling(parsedGroup)
          group.add(parsedGroup)

          fitObjectToCamera(group)
          setLoadingModel(false)
        } else if (detectedFormat === 'obj') {
          const res = await fetch(modelUrl)
          if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to download OBJ file`)
          const text = await res.text()
          if (isDisposed) return

          const loader = new OBJLoader()
          const parsedGroup = loader.parse(text)
          if (!parsedGroup || parsedGroup.children.length === 0) {
            throw new Error('OBJ model contains no object meshes')
          }

          applyFilamentStyling(parsedGroup)
          group.add(parsedGroup)

          fitObjectToCamera(group)
          setLoadingModel(false)
        } else if (detectedFormat === 'glb' || detectedFormat === 'gltf') {
          const loader = new GLTFLoader()
          loader.load(
            modelUrl,
            (gltf) => {
              if (isDisposed) return
              const gltfScene = gltf.scene || gltf.scenes[0]
              if (!gltfScene) {
                throw new Error('GLTF scene is empty')
              }
              applyFilamentStyling(gltfScene)
              group.add(gltfScene)

              fitObjectToCamera(group)
              setLoadingModel(false)
            },
            undefined,
            (error: any) => {
              if (isDisposed) return
              console.error('GLTF Load Error:', error)
              setModelLoadError(error?.message || 'Failed to parse GLTF model.')
              setLoadingModel(false)
            }
          )
        } else {
          setLoadingModel(false)
          setUnsupportedFormat(detectedFormat.toUpperCase())
        }
      } catch (err: any) {
        console.error('3D Model Loading Exception:', err)
        if (!isDisposed) {
          setLoadingModel(false)
          setModelLoadError(err.message || 'Failed to render 3D model.')
        }
      }
    }

    loadActualModel()

    // Animation Loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!mountRef.current) return
      const w = isFullscreen ? window.innerWidth : mountRef.current.clientWidth || 600
      const h = isFullscreen
        ? window.innerHeight
        : typeof height === 'number'
        ? height
        : mountRef.current.clientHeight || 460
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      isDisposed = true
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      scene.clear()
      renderer.dispose()
      materialsRef.current.forEach((m) => m.dispose())
    }
  }, [modelUrl, detectedFormat, height, isFullscreen])

  // Camera Angle Switcher (Isometric, Front, Top, Side)
  const setCameraView = (view: 'iso' | 'front' | 'top' | 'side' | 'reset') => {
    if (!cameraRef.current || !controlsRef.current) return
    const maxDim = Math.max(computedBounds.x, computedBounds.y, computedBounds.z) || 50
    const fovRad = cameraRef.current.fov * (Math.PI / 180)
    const dist = Math.max(Math.abs(maxDim / 2 / Math.tan(fovRad / 2)) * 1.55, 15)

    switch (view) {
      case 'front':
        cameraRef.current.position.set(0, 0, dist)
        break
      case 'top':
        cameraRef.current.position.set(0, dist, 0.001)
        break
      case 'side':
        cameraRef.current.position.set(dist, 0, 0)
        break
      case 'iso':
      case 'reset':
      default:
        cameraRef.current.position.set(dist * 0.7, dist * 0.5, dist * 0.7)
        break
    }
    controlsRef.current.target.set(0, 0, 0)
    controlsRef.current.update()
  }

  // Snapshot PNG Generator
  const handleDownloadSnapshot = () => {
    if (!rendererRef.current) return
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_snapshot.png`
    link.href = dataUrl
    link.click()
  }

  if (unsupportedFormat || modelLoadError) {
    return (
      <div
        style={{
          height,
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          textAlign: 'center',
          color: '#F8FAFC',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 12 }}>🧊</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px 0', color: '#F8FAFC' }}>
          Unable to preview this 3D model.
        </h3>
        <p style={{ fontSize: 13, color: '#94A3B8', maxWidth: 380, margin: '0 0 20px 0' }}>
          {unsupportedFormat
            ? `${unsupportedFormat} preview is not currently supported in the browser. You can download the original file.`
            : modelLoadError}
        </p>

        {modelUrl && (
          <a
            href={modelUrl}
            download={fileName || `model.${detectedFormat}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #E0531F 100%)',
              color: '#FFFFFF',
              padding: '10px 22px',
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(255,107,53,0.4)',
            }}
          >
            📥 Download Original {detectedFormat.toUpperCase()} File
          </a>
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 99999 : 1,
        width: '100%',
        height: isFullscreen ? '100vh' : height,
        background: 'radial-gradient(circle at center, #1E293B 0%, #0B0F19 100%)',
        borderRadius: isFullscreen ? 0 : 20,
        overflow: 'hidden',
        border: isFullscreen ? 'none' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isFullscreen ? 'none' : '0 20px 50px rgba(0,0,0,0.5)',
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Loading Overlay */}
      {loadingModel && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(11, 15, 25, 0.88)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
        >
          <div style={{ fontSize: 38, marginBottom: 10, animation: 'spin 2s linear infinite' }}>⏳</div>
          <div style={{ color: '#F8FAFC', fontWeight: 900, fontSize: 16, letterSpacing: '-0.3px' }}>
            Loading {detectedFormat.toUpperCase()} 3D Studio…
          </div>
          <div style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>Rendering High-Definition PBR Geometry</div>
        </div>
      )}

      {/* TOP-LEFT: Dimensions, Triangles & Format HUD */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 10,
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 800, color: '#F8FAFC' }}>
          📐 {computedBounds.x} × {computedBounds.y} × {computedBounds.z} mm
        </span>
        {stats.triangles > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>
            🔺 {(stats.triangles / 1000).toFixed(1)}k Tris
          </span>
        )}
        <span
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 900,
            padding: '2px 8px',
            borderRadius: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {detectedFormat}
        </span>
      </div>

      {/* TOP-RIGHT: Fullscreen, Snapshot & Camera Angles */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          zIndex: 10,
          display: 'flex',
          gap: 6,
        }}
      >
        <button
          type="button"
          onClick={() => setCameraView('iso')}
          title="Isometric Angle"
          style={btnStyle}
        >
          🧊 Iso
        </button>
        <button
          type="button"
          onClick={() => setCameraView('top')}
          title="Top Down View"
          style={btnStyle}
        >
          ⬆️ Top
        </button>
        <button
          type="button"
          onClick={() => setCameraView('front')}
          title="Front View"
          style={btnStyle}
        >
          👁️ Front
        </button>
        <button
          type="button"
          onClick={handleDownloadSnapshot}
          title="Download High-Res 3D Snapshot PNG"
          style={btnStyle}
        >
          📸 Snapshot
        </button>
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Mode'}
          style={{ ...btnStyle, background: isFullscreen ? '#FF6B35' : 'rgba(15, 23, 42, 0.85)', color: '#fff' }}
        >
          {isFullscreen ? '✖ Exit' : '⛶ Fullscreen'}
        </button>
      </div>

      {/* BOTTOM-LEFT: Slicing Height Layer Slider (Optional Inspection) */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 10,
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <button
          type="button"
          onClick={() => setIsSlicingActive(!isSlicingActive)}
          style={{
            background: isSlicingActive ? '#FF6B35' : 'transparent',
            color: isSlicingActive ? '#fff' : '#94A3B8',
            border: 'none',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: 6,
          }}
        >
          🔪 Slicer {isSlicingActive ? 'On' : 'Off'}
        </button>
        {isSlicingActive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="range"
              min="0"
              max="100"
              value={sliceProgress}
              onChange={(e) => setSliceProgress(Number(e.target.value))}
              style={{ width: 80, cursor: 'pointer', accentColor: '#FF6B35' }}
            />
            <span style={{ fontSize: 11, color: '#F8FAFC', fontWeight: 800 }}>{sliceProgress}%</span>
          </div>
        )}
      </div>

      {/* BOTTOM-RIGHT: Viewport Controls & Material Finishes */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          zIndex: 10,
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setCameraView('reset')}
          title="Reset Camera View"
          style={btnStyle}
        >
          🎯 Center
        </button>

        <button
          type="button"
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Build Plate Grid"
          style={{ ...btnStyle, background: showGrid ? 'rgba(255, 107, 53, 0.2)' : btnStyle.background, color: showGrid ? '#FF6B35' : '#94A3B8' }}
        >
          ▦ Bed Grid
        </button>

        <button
          type="button"
          onClick={() => setShowEdges(!showEdges)}
          title="Toggle CAD Outlines"
          style={{ ...btnStyle, background: showEdges ? 'rgba(139, 92, 246, 0.25)' : btnStyle.background, color: showEdges ? '#A78BFA' : '#94A3B8' }}
        >
          ✨ CAD Edges
        </button>

        {/* Filament Finish Selector */}
        <select
          value={finish}
          onChange={(e) => setFinish(e.target.value as FilamentFinish)}
          style={{
            ...btnStyle,
            outline: 'none',
            cursor: 'pointer',
            padding: '6px 10px',
            color: '#F8FAFC',
          }}
          title="Filament Finish Texture"
        >
          <option value="silky" style={{ background: '#0F172A', color: '#fff' }}>✨ Silk PLA</option>
          <option value="matte" style={{ background: '#0F172A', color: '#fff' }}>🧱 Matte PETG</option>
          <option value="glossy" style={{ background: '#0F172A', color: '#fff' }}>💎 Glossy Resin</option>
          <option value="metallic" style={{ background: '#0F172A', color: '#fff' }}>⚙️ Metallic</option>
        </select>

        <button
          type="button"
          onClick={() => setWireframe(!wireframe)}
          style={{ ...btnStyle, background: wireframe ? '#8B5CF6' : btnStyle.background, color: wireframe ? '#fff' : '#94A3B8' }}
        >
          {wireframe ? 'Solid' : 'Wireframe'}
        </button>

        <button
          type="button"
          onClick={() => setRotating(!rotating)}
          style={{ ...btnStyle, background: rotating ? '#FF6B35' : btnStyle.background, color: rotating ? '#fff' : '#94A3B8' }}
        >
          {rotating ? '⏸ Pause' : '🔄 Auto Rotate'}
        </button>
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.85)',
  color: '#94A3B8',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 800,
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.15s ease',
  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
}
