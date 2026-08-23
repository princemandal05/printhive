'use client'

import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
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
  color = '#8B5CF6',
  wireframeDefault = false,
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
  const [rotating, setRotating] = useState(true)
  const rotatingRef = useRef(rotating)
  const [computedBounds, setComputedBounds] = useState({ x: dimensions.x, y: dimensions.y, z: dimensions.z })
  const [unsupportedFormat, setUnsupportedFormat] = useState<string | null>(null)
  const [modelLoadError, setModelLoadError] = useState<string | null>(null)

  useEffect(() => {
    rotatingRef.current = rotating
  }, [rotating])

  const groupRef = useRef<THREE.Group | null>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null)

  const detectedInfo = detectModelFormat({
    format,
    fileName,
    mimeType,
    url: modelUrl,
  })
  const detectedFormat: ModelFormat = detectedInfo.format

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.wireframe = wireframe
    }
  }, [wireframe])

  const validColor = /^#[0-9A-F]{6}$/i.test(color) ? color : '#8B5CF6'

  useEffect(() => {
    if (!mountRef.current) return

    const width = mountRef.current.clientWidth || 600
    const heightPx = typeof height === 'number' ? height : mountRef.current.clientHeight || 440

    let isDisposed = false

    // Setup Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0F172A')

    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 2000)
    camera.position.set(0, 50, 150)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setSize(width, heightPx)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    mountRef.current.innerHTML = ''
    mountRef.current.appendChild(renderer.domElement)

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2)
    mainLight.position.set(100, 150, 100)
    mainLight.castShadow = true
    scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.6)
    fillLight.position.set(-100, -50, -100)
    scene.add(fillLight)

    const group = new THREE.Group()
    groupRef.current = group
    scene.add(group)

    const meshMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(validColor),
      roughness: 0.35,
      metalness: 0.55,
      wireframe: wireframe,
    })
    materialRef.current = meshMaterial

    const fitObjectToCamera = (object: THREE.Object3D) => {
      const bbox = new THREE.Box3().setFromObject(object)
      if (bbox.isEmpty()) return

      const size = bbox.getSize(new THREE.Vector3())
      const center = bbox.getCenter(new THREE.Vector3())

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

          const mesh = new THREE.Mesh(geometry, meshMaterial)
          mesh.castShadow = true
          mesh.receiveShadow = true
          group.add(mesh)

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

    // Orbit Drag Controls
    let isDragging = false
    let previousMousePosition = { x: 0, y: 0 }

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      previousMousePosition = { x: e.clientX, y: e.clientY }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !groupRef.current) return

      const deltaX = e.clientX - previousMousePosition.x
      const deltaY = e.clientY - previousMousePosition.y

      groupRef.current.rotation.y += deltaX * 0.01
      groupRef.current.rotation.x += deltaY * 0.01

      previousMousePosition = { x: e.clientX, y: e.clientY }
    }

    const onMouseUp = () => {
      isDragging = false
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      camera.position.z += e.deltaY * 0.1
      camera.position.z = Math.max(10, Math.min(camera.position.z, 1000))
    }

    const domElement = renderer.domElement
    domElement.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    domElement.addEventListener('wheel', onWheel, { passive: false })

    // Animation Loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)

      if (groupRef.current && rotatingRef.current && !isDragging) {
        groupRef.current.rotation.y += 0.005
      }

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
      domElement.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      domElement.removeEventListener('wheel', onWheel)

      scene.clear()
      renderer.dispose()
      meshMaterial.dispose()
    }
  }, [modelUrl, detectedFormat, validColor, height])

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
        background: '#0F172A',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {loadingModel && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8, animation: 'spin 2s linear infinite' }}>⏳</div>
          <div style={{ color: '#F8FAFC', fontWeight: 800, fontSize: 14 }}>
            Loading {detectedFormat.toUpperCase()} 3D Model…
          </div>
          <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>Parsing WebGL Mesh Data</div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 5,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 800, color: '#F8FAFC' }}>
          📐 {computedBounds.x} × {computedBounds.y} × {computedBounds.z} mm
        </span>
        <span style={{ background: '#8B5CF6', color: '#fff', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
          {detectedFormat}
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          zIndex: 5,
          display: 'flex',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => setWireframe(!wireframe)}
          style={{
            background: wireframe ? '#8B5CF6' : 'rgba(15, 23, 42, 0.75)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: '6px 14px',
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
            background: rotating ? '#FF6B35' : 'rgba(15, 23, 42, 0.75)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          {rotating ? 'Pause Orbit' : 'Rotate Orbit'}
        </button>
      </div>
    </div>
  )
}
