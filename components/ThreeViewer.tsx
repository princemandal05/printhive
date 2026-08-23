'use client'

import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

interface ThreeViewerProps {
  title?: string
  color?: string
  wireframeDefault?: boolean
  height?: number | string
  modelUrl?: string
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
            background: 'radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%)',
            border: '1px solid #4338ca',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 12 }}>🧊</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
            Fallback Viewport Loaded
          </div>
          <div style={{ fontSize: 13, color: '#a5b4fc', maxWidth: 400, lineHeight: 1.5, marginBottom: 16 }}>
            {this.state.errorMessage || 'Standard 3D mesh preview active.'}
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
  dimensions,
}: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [wireframe, setWireframe] = useState(false)
  const [rotating, setRotating] = useState(true)
  const [loadingModel, setLoadingModel] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [computedBounds, setComputedBounds] = useState<{ x: number; y: number; z: number } | null>(dimensions || null)

  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)

  const validColor = /^#[0-9A-F]{6}$/i.test(color) ? color : '#FF6B35'
  const hasModel = Boolean(modelUrl && modelUrl.trim() !== '')

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 500
    const heightPx = typeof height === 'number' ? height : container.clientHeight || 440
    const aspect = width / heightPx

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)

    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000)
    camera.position.set(0, 80, 200)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, heightPx)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    // Studio Lighting
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
      roughness: 0.3,
      metalness: 0.65,
      wireframe: false,
    })
    materialRef.current = meshMaterial

    let activeMesh: THREE.Mesh | null = null

    if (hasModel && modelUrl && modelUrl.toLowerCase().includes('.stl')) {
      setLoadingModel(true)
      const loader = new STLLoader()
      loader.load(
        modelUrl,
        (geometry) => {
          geometry.center()
          geometry.computeBoundingBox()
          const bbox = geometry.boundingBox
          if (bbox) {
            const sizeX = Math.round(bbox.max.x - bbox.min.x)
            const sizeY = Math.round(bbox.max.y - bbox.min.y)
            const sizeZ = Math.round(bbox.max.z - bbox.min.z)
            setComputedBounds({ x: sizeX, y: sizeY, z: sizeZ })

            const maxDim = Math.max(sizeX, sizeY, sizeZ)
            const scaleFactor = 100 / maxDim
            geometry.scale(scaleFactor, scaleFactor, scaleFactor)
          }

          activeMesh = new THREE.Mesh(geometry, meshMaterial)
          activeMesh.castShadow = true
          activeMesh.receiveShadow = true
          group.add(activeMesh)
          setLoadingModel(false)
        },
        undefined,
        (err) => {
          console.warn('STLLoader fallback:', err)
          // Fallback procedural geometry if STL file load is restricted
          const fallbackGeo = new THREE.TorusKnotGeometry(40, 12, 128, 16)
          activeMesh = new THREE.Mesh(fallbackGeo, meshMaterial)
          group.add(activeMesh)
          setLoadingModel(false)
        }
      )
    } else {
      // Default procedural high-detail 3D geometry mesh
      const geo = new THREE.IcosahedronGeometry(45, 2)
      activeMesh = new THREE.Mesh(geo, meshMaterial)
      group.add(activeMesh)
      setLoadingModel(false)
    }

    // Grid Floor
    const gridHelper = new THREE.GridHelper(300, 30, 0xff6b35, 0x334155)
    gridHelper.position.y = -60
    scene.add(gridHelper)

    // Mouse Drag Rotation Controls
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

    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    // Animation Loop
    let animationFrameId: number
    const animate = () => {
      if (groupRef.current && rotating && !isDragging) {
        groupRef.current.rotation.y += 0.008
      }
      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || 500
      const h = typeof height === 'number' ? height : container.clientHeight || 440
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [modelUrl, height, validColor])

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
      {loadingModel && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF6B35', fontSize: 13, fontWeight: 700 }}>
          ⚡ Loading 3D Mesh Geometry...
        </div>
      )}

      {/* Top Header Overlay */}
      <div style={{ position: 'absolute', top: 14, left: 16, right: 16, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', background: 'rgba(15,23,42,0.85)', padding: '5px 12px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
          🧊 WebGL 3D Viewport · {title}
        </span>
        {computedBounds && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '5px 12px', borderRadius: 99, border: '1px solid rgba(16,185,129,0.3)' }}>
            📐 Bounds: {computedBounds.x} × {computedBounds.y} × {computedBounds.z} mm
          </span>
        )}
      </div>

      {/* Interactive Controls Bar */}
      <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, zIndex: 10, display: 'flex', justifyContent: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={() => setRotating(!rotating)}
          style={{ background: rotating ? '#FF6B35' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
        >
          {rotating ? 'Pause Orbit' : 'Rotate Orbit'}
        </button>
        <button
          type="button"
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
