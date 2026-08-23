'use client'

import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
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
    return { hasError: true, errorMessage: error.message || 'Corrupt or incompatible 3D geometry file.' }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ThreeViewer rendering error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 380,
            borderRadius: 16,
            background: '#0F172A',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            textAlign: 'center',
            color: '#F8FAFC',
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#F8FAFC', marginBottom: 6 }}>
            Unable to preview this 3D model.
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', maxWidth: 420, lineHeight: 1.5 }}>
            {this.state.errorMessage || 'WebGL parsing failed or file geometry is corrupt.'}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function ThreeViewerInner({
  title = '3D Model Viewport',
  color = '#FF6B35',
  height = 440,
  modelUrl,
  format,
  fileName,
  mimeType,
  dimensions,
}: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [wireframe, setWireframe] = useState(false)
  const [rotating, setRotating] = useState(true)
  const [loadingModel, setLoadingModel] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [computedBounds, setComputedBounds] = useState<{ x: number; y: number; z: number } | null>(dimensions || null)

  const rotatingRef = useRef(rotating)
  useEffect(() => {
    rotatingRef.current = rotating
  }, [rotating])

  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)

  const validColor = /^#[0-9A-F]{6}$/i.test(color) ? color : '#FF6B35'
  const hasModel = Boolean(modelUrl && modelUrl.trim() !== '')

  // Format detection
  const detected = detectModelFormat({ format, fileName, mimeType, url: modelUrl })
  const modelFormatDisplay = (format || fileName?.split('.').pop() || detected.format).toUpperCase()

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (mountRef.current) {
        setIsFullscreen(document.fullscreenElement === mountRef.current)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    let isDisposed = false
    const container = mountRef.current
    if (!container) return

    setErrorMsg(null)

    // Check if model URL is completely missing
    if (!hasModel || !modelUrl) {
      setLoadingModel(false)
      setErrorMsg('No 3D model file URL provided.')
      return
    }

    // Check if format is unsupported for preview
    if (!detected.isPreviewable) {
      setLoadingModel(false)
      if (detected.format === '3mf') {
        setErrorMsg('3MF preview is not currently supported. You can download the original file.')
      } else {
        setErrorMsg(`${modelFormatDisplay} preview is not currently supported. You can download the original file.`)
      }
      return
    }

    setLoadingModel(true)

    const width = container.clientWidth || 500
    const heightPx = container.clientHeight || (typeof height === 'number' ? height : 440)
    const aspect = width / (heightPx || 1)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)

    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
    camera.position.set(0, 50, 150)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, heightPx)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    // Studio Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xff6b35, 2.5)
    keyLight.position.set(100, 150, 100)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4)
    fillLight.position.set(-100, 50, -100)
    scene.add(fillLight)

    // Build 3D Mesh Group
    const group = new THREE.Group()
    groupRef.current = group
    scene.add(group)

    const meshMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(validColor),
      roughness: 0.35,
      metalness: 0.55,
      wireframe: false,
    })
    materialRef.current = meshMaterial

    const fitObjectToCamera = (object: THREE.Object3D) => {
      const bbox = new THREE.Box3().setFromObject(object)
      if (bbox.isEmpty()) return

      const size = bbox.getSize(new THREE.Vector3())
      const center = bbox.getCenter(new THREE.Vector3())

      // Center object at (0,0,0)
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
        let cameraDist = Math.abs(maxDim / 2 / Math.tan(fovRad / 2)) * 1.5
        cameraDist = Math.max(cameraDist, 10)

        camera.position.set(0, maxDim * 0.3, cameraDist)
        camera.lookAt(0, 0, 0)

        camera.near = Math.max(maxDim / 100, 0.1)
        camera.far = Math.max(maxDim * 100, 1000)
        camera.updateProjectionMatrix()
      }
    }

    // Load actual model file based on detected format
    const loadActualModel = async () => {
      console.log('3D MODEL DEBUG', { modelUrl, modelFormat: format || fileName?.split('.').pop() || detected.format, modelFileName: fileName })
      console.log(`3D MODEL LOADER: ${detected.format.toUpperCase()}Loader`)

      try {
        if (detected.format === 'stl') {
          const res = await fetch(modelUrl)
          if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to download STL file`)
          const buffer = await res.arrayBuffer()
          if (isDisposed) return

          const loader = new STLLoader()
          const geometry = loader.parse(buffer)
          if (!geometry || geometry.attributes.position.count === 0) {
            throw new Error('STL geometry contains no vertex positions')
          }

          const mesh = new THREE.Mesh(geometry, meshMaterial)
          mesh.castShadow = true
          mesh.receiveShadow = true
          group.add(mesh)

          fitObjectToCamera(group)
          setLoadingModel(false)
        } else if (detected.format === 'obj') {
          const res = await fetch(modelUrl)
          if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to download OBJ file`)
          const text = await res.text()
          if (isDisposed) return

          const loader = new OBJLoader()
          const parsedGroup = loader.parse(text)
          if (!parsedGroup || parsedGroup.children.length === 0) {
            throw new Error('OBJ model contains no object meshes')
          }

          parsedGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (!child.material || (Array.isArray(child.material) && child.material.length === 0)) {
                child.material = meshMaterial
              }
              child.castShadow = true
              child.receiveShadow = true
            }
          })
          group.add(parsedGroup)

          fitObjectToCamera(group)
          setLoadingModel(false)
        } else if (detected.format === 'glb' || detected.format === 'gltf') {
          const loader = new GLTFLoader()
          loader.load(
            modelUrl,
            (gltf) => {
              if (isDisposed) return
              const gltfScene = gltf.scene || gltf.scenes[0]
              if (!gltfScene) {
                throw new Error('GLTF scene is empty')
              }
              gltfScene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true
                  child.receiveShadow = true
                }
              })
              group.add(gltfScene)

              fitObjectToCamera(group)
              setLoadingModel(false)
            },
            undefined,
            (err) => {
              if (isDisposed) return
              console.error('GLTFLoader error:', err)
              setErrorMsg('Unable to preview this 3D model.')
              setLoadingModel(false)
            }
          )
        } else {
          throw new Error(`Unsupported model format: ${detected.format}`)
        }
      } catch (err: any) {
        if (isDisposed) return
        console.error('3D model load error:', err)
        setErrorMsg('Unable to preview this 3D model.')
        setLoadingModel(false)
      }
    }

    loadActualModel()

    // Grid Floor
    const gridHelper = new THREE.GridHelper(300, 30, 0xff6b35, 0x334155)
    gridHelper.position.y = -40
    scene.add(gridHelper)

    // Mouse Drag Controls bound directly to canvas
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !groupRef.current) return
      const deltaX = e.clientX - prevMouseX
      const deltaY = e.clientY - prevMouseY
      groupRef.current.rotation.y += deltaX * 0.01
      groupRef.current.rotation.x += deltaY * 0.01
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseUp = () => {
      isDragging = false
    }

    const canvasElem = renderer.domElement
    canvasElem.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    // Animation Loop reading rotatingRef
    let animationFrameId: number
    const animate = () => {
      if (groupRef.current && rotatingRef.current && !isDragging) {
        groupRef.current.rotation.y += 0.008
      }
      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || 500
      const h = container.clientHeight || (typeof height === 'number' ? height : 440)
      camera.aspect = w / (h || 1)
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      isDisposed = true
      cancelAnimationFrame(animationFrameId)
      canvasElem.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('resize', handleResize)

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose()
        }
      })
      gridHelper.geometry.dispose()
      meshMaterial.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [modelUrl, height, detected.format, detected.isPreviewable, hasModel, modelFormatDisplay])

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.wireframe = wireframe
      materialRef.current.color.set(validColor)
    }
  }, [wireframe, validColor])

  const toggleFullscreen = () => {
    if (!mountRef.current) return
    if (!document.fullscreenElement) {
      mountRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  return (
    <div
      ref={mountRef}
      style={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : height,
        borderRadius: isFullscreen ? 0 : 16,
        background: '#0F172A',
        border: '1px solid rgba(255, 107, 53, 0.25)',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
      }}
    >
      {/* Loading Indicator */}
      {loadingModel && !errorMsg && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF6B35', fontSize: 13, fontWeight: 700 }}>
          ⚡ Loading 3D model...
        </div>
      )}

      {/* Error / Unsupported Format Banner Overlay */}
      {errorMsg && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            background: 'radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            textAlign: 'center',
            color: '#F8FAFC',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>🧊</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>
            Unable to preview this 3D model.
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', maxWidth: 440, lineHeight: 1.5, marginBottom: 20 }}>
            {errorMsg}
          </div>

          {modelUrl && (
            <a
              href={modelUrl}
              download={fileName || `model-${title.toLowerCase().replace(/\s+/g, '-')}.${detected.format}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #E0531F 100%)',
                color: '#FFFFFF',
                padding: '10px 22px',
                borderRadius: 99,
                fontWeight: 800,
                fontSize: 13,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(255,107,53,0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              📥 Download Original {modelFormatDisplay} File
            </a>
          )}
        </div>
      )}

      {/* Top Header Overlay */}
      <div style={{ position: 'absolute', top: 14, left: 16, right: 16, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', background: 'rgba(15,23,42,0.85)', padding: '5px 12px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
          🧊 WebGL 3D Viewport · {title}
        </span>
        {computedBounds && !errorMsg && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '5px 12px', borderRadius: 99, border: '1px solid rgba(16,185,129,0.3)' }}>
            📐 Bounds: {computedBounds.x} × {computedBounds.y} × {computedBounds.z} mm
          </span>
        )}
      </div>

      {/* Interactive Controls Bar */}
      {!errorMsg && (
        <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, zIndex: 10, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button
            type="button"
            aria-pressed={rotating}
            onClick={() => setRotating(!rotating)}
            style={{ background: rotating ? '#FF6B35' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
          >
            {rotating ? 'Pause Orbit' : 'Rotate Orbit'}
          </button>
          <button
            type="button"
            aria-pressed={wireframe}
            onClick={() => setWireframe(!wireframe)}
            style={{ background: wireframe ? '#FF6B35' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
          >
            {wireframe ? 'Solid View' : 'Wireframe'}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
          >
            ⛶ Fullscreen
          </button>
        </div>
      )}
    </div>
  )
}

export default function ThreeViewer(props: ThreeViewerProps) {
  return (
    <ThreeViewerErrorBoundary fallbackTitle={props.title}>
      <ThreeViewerInner {...props} />
    </ThreeViewerErrorBoundary>
  )
}
