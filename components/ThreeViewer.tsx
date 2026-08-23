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
  height = 440,
  modelUrl,
  format,
  fileName,
  mimeType,
  dimensions = { x: 50, y: 50, z: 50 },
}: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  const [loadingModel, setLoadingModel] = useState(true)
  const [wireframe, setWireframe] = useState(wireframeDefault)
  const [rotating, setRotating] = useState(autoRotateDefault)
  const rotatingRef = useRef(rotating)
  const [showEdges, setShowEdges] = useState(true)
  const [computedBounds, setComputedBounds] = useState({ x: dimensions.x, y: dimensions.y, z: dimensions.z })
  const [unsupportedFormat, setUnsupportedFormat] = useState<string | null>(null)
  const [modelLoadError, setModelLoadError] = useState<string | null>(null)

  const controlsRef = useRef<OrbitControls | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const edgesGroupRef = useRef<THREE.Group | null>(null)
  const materialsRef = useRef<THREE.MeshPhysicalMaterial[]>([])

  const detectedInfo = detectModelFormat({
    format,
    fileName,
    mimeType,
    url: modelUrl,
  })
  const detectedFormat: ModelFormat = detectedInfo.format

  const validColor = /^#[0-9A-F]{6}$/i.test(color || '') ? color : '#FF6B35'

  // Update rotation ref and controls
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

  // Toggle feature edges
  useEffect(() => {
    if (edgesGroupRef.current) {
      edgesGroupRef.current.visible = showEdges && !wireframe
    }
  }, [showEdges, wireframe])

  // Dynamic Filament Color Update without reloading geometry
  useEffect(() => {
    if (!groupRef.current) return
    const threeColor = new THREE.Color(validColor)
    materialsRef.current.forEach((mat) => {
      mat.color.copy(threeColor)
      mat.needsUpdate = true
    })
  }, [validColor])

  useEffect(() => {
    if (!mountRef.current) return

    const width = mountRef.current.clientWidth || 600
    const heightPx = typeof height === 'number' ? height : mountRef.current.clientHeight || 440

    let isDisposed = false
    materialsRef.current = []

    // Setup Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0B0F19')

    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 3000)
    camera.position.set(0, 40, 140)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, heightPx)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    mountRef.current.innerHTML = ''
    mountRef.current.appendChild(renderer.domElement)

    // OrbitControls for professional CAD inspection
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.autoRotate = rotatingRef.current
    controls.autoRotateSpeed = 1.5
    controls.enableZoom = true
    controls.enablePan = true
    controlsRef.current = controls

    // Professional Studio Lighting for 3D Print CAD Definition
    // 1. Hemisphere light (sky / ground subtle gradient)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.85)
    scene.add(hemiLight)

    // 2. Main Key Light (Top-Right Front)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4)
    keyLight.position.set(120, 180, 140)
    keyLight.castShadow = true
    keyLight.shadow.bias = -0.0001
    scene.add(keyLight)

    // 3. Fill Light (Soft cool ambient)
    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 0.75)
    fillLight.position.set(-140, 60, 80)
    scene.add(fillLight)

    // 4. Studio Rim / Backlight (Creates crisp edge pop and depth contour)
    const rimLight = new THREE.DirectionalLight(0xffedd5, 1.1)
    rimLight.position.set(0, 120, -180)
    scene.add(rimLight)

    // 5. Bottom Bounce Light (Prevents muddy underside)
    const bounceLight = new THREE.DirectionalLight(0x334155, 0.5)
    bounceLight.position.set(0, -120, 0)
    scene.add(bounceLight)

    // Root Mesh Group & Edge Line Group
    const group = new THREE.Group()
    groupRef.current = group
    scene.add(group)

    const edgesGroup = new THREE.Group()
    edgesGroupRef.current = edgesGroup
    group.add(edgesGroup)

    // Create Premium 3D Printing Filament PBR Material
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
      })
      materialsRef.current.push(mat)
      return mat
    }

    // Helper: Add Crisp Feature Edge Lines for High-Definition CAD look
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
        // Fallback gracefully if geometry indexing fails
      }
    }

    // Helper: Apply Filament Material & Compute Smooth Normals
    const applyFilamentStyling = (targetGroup: THREE.Object3D) => {
      targetGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) {
            child.geometry.computeVertexNormals()
          }
          child.material = createFilamentMaterial()
          child.castShadow = true
          child.receiveShadow = true
          addCrispEdgesToMesh(child)
        }
      })
    }

    const fitObjectToCamera = (object: THREE.Object3D) => {
      const bbox = new THREE.Box3().setFromObject(object)
      if (bbox.isEmpty()) return

      const size = bbox.getSize(new THREE.Vector3())
      const center = bbox.getCenter(new THREE.Vector3())

      // Center model around (0,0,0)
      object.position.sub(center)

      const rawX = size.x
      const rawY = size.y
      const rawZ = size.z

      if (!isDisposed) {
        setComputedBounds({ x: Math.round(rawX), y: Math.round(rawY), z: Math.round(rawZ) })
      }

      const maxDim = Math.max(rawX, rawY, rawZ)
      if (maxDim > 0) {
        const fovRad = camera.fov * (Math.PI / 180)
        let cameraDist = Math.abs(maxDim / 2 / Math.tan(fovRad / 2)) * 1.55
        cameraDist = Math.max(cameraDist, 10)

        camera.position.set(0, maxDim * 0.3, cameraDist)
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
      const w = mountRef.current.clientWidth || 600
      const h = typeof height === 'number' ? height : mountRef.current.clientHeight || 440
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
  }, [modelUrl, detectedFormat, height])

  const handleResetView = () => {
    if (controlsRef.current && groupRef.current) {
      controlsRef.current.reset()
    }
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
      style={{
        position: 'relative',
        height,
        background: 'radial-gradient(circle at center, #1E293B 0%, #0B0F19 100%)',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

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
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8, animation: 'spin 2s linear infinite' }}>⏳</div>
          <div style={{ color: '#F8FAFC', fontWeight: 800, fontSize: 15 }}>
            Loading {detectedFormat.toUpperCase()} 3D Model…
          </div>
          <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>Rendering High-Definition PBR Meshes</div>
        </div>
      )}

      {/* Model Specs Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 5,
          background: 'rgba(11, 15, 25, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 800, color: '#F8FAFC' }}>
          📐 {computedBounds.x} × {computedBounds.y} × {computedBounds.z} mm
        </span>
        <span style={{ background: '#8B5CF6', color: '#fff', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
          {detectedFormat}
        </span>
      </div>

      {/* Quick Interactive Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          zIndex: 5,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={handleResetView}
          title="Reset Camera View"
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#94A3B8',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          🎯 Reset
        </button>

        <button
          type="button"
          onClick={() => setShowEdges(!showEdges)}
          title="Toggle High-Definition CAD Outline Lines"
          style={{
            background: showEdges ? '#8B5CF6' : 'rgba(15, 23, 42, 0.8)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          {showEdges ? '✨ Edges On' : 'Edges Off'}
        </button>

        <button
          type="button"
          onClick={() => setWireframe(!wireframe)}
          style={{
            background: wireframe ? '#8B5CF6' : 'rgba(15, 23, 42, 0.8)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          {wireframe ? 'Solid' : 'Wireframe'}
        </button>

        <button
          type="button"
          onClick={() => setRotating(!rotating)}
          style={{
            background: rotating ? '#FF6B35' : 'rgba(15, 23, 42, 0.8)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          {rotating ? '⏸ Pause' : '🔄 Auto Rotate'}
        </button>
      </div>
    </div>
  )
}
