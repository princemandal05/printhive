'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 500
    const height = container.clientHeight || 440
    const aspect = height > 0 ? width / height : 1.15

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100)
    camera.position.set(2.4, 1.8, 4.2)
    camera.lookAt(0, 0.2, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Studio Lighting Environment
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    // Key Studio Light (Warm Warm White)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
    keyLight.position.set(5, 8, 5)
    keyLight.castShadow = true
    scene.add(keyLight)

    // Fill Light (Soft Cool Cyan-Blue)
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2)
    fillLight.position.set(-5, 2, -3)
    scene.add(fillLight)

    // Brand Accent Glow (Warm Terracotta Orange #FF6B35)
    const accentLight = new THREE.PointLight(0xff6b35, 3.5, 12)
    accentLight.position.set(0, 0.6, 1.2)
    scene.add(accentLight)

    const group = new THREE.Group()

    // 1. Precision Octagonal Print Bed Base
    const bedGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.12, 8)
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.8,
    })
    const bed = new THREE.Mesh(bedGeo, bedMat)
    bed.position.y = -0.75
    bed.receiveShadow = true
    group.add(bed)

    // Bed Surface Grid Ring
    const ringGeo = new THREE.RingGeometry(0.8, 1.5, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff6b35,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2
    ring.position.y = -0.68
    group.add(ring)

    // 2. High-Tech Precision Print Model (Dodecahedron Core)
    const modelGeo = new THREE.DodecahedronGeometry(0.85, 1)
    const modelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.15,
      metalness: 0.85,
      flatShading: true,
    })
    const modelMesh = new THREE.Mesh(modelGeo, modelMat)
    modelMesh.position.y = 0.2
    modelMesh.castShadow = true
    group.add(modelMesh)

    // Holographic Slicing Laser Ring around model
    const sliceRingGeo = new THREE.TorusGeometry(1.1, 0.015, 16, 64)
    const sliceRingMat = new THREE.MeshBasicMaterial({
      color: 0xff6b35,
      transparent: true,
      opacity: 0.85,
    })
    const sliceRing = new THREE.Mesh(sliceRingGeo, sliceRingMat)
    sliceRing.rotation.x = Math.PI / 2
    sliceRing.position.y = 0.2
    group.add(sliceRing)

    // 3. Sleek Metallic Extruder Nozzle Head Assembly
    const nozzleGroup = new THREE.Group()

    const heatBlockGeo = new THREE.BoxGeometry(0.45, 0.35, 0.45)
    const heatBlockMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    const heatBlock = new THREE.Mesh(heatBlockGeo, heatBlockMat)
    heatBlock.position.set(0, 1.45, 0)
    nozzleGroup.add(heatBlock)

    const tipGeo = new THREE.ConeGeometry(0.12, 0.35, 16)
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.1 })
    const tip = new THREE.Mesh(tipGeo, tipMat)
    tip.rotation.x = Math.PI
    tip.position.set(0, 1.15, 0)
    nozzleGroup.add(tip)

    group.add(nozzleGroup)
    scene.add(group)

    // Interactive Drag Controls
    let isDragging = false
    let previousMouseX = 0
    let targetRotationY = 0
    let currentRotationY = 0

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      previousMouseX = e.clientX
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - previousMouseX
      targetRotationY += deltaX * 0.008
      previousMouseX = e.clientX
    }

    const onMouseUp = () => {
      isDragging = false
    }

    const domEl = renderer.domElement
    domEl.style.cursor = 'grab'
    domEl.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    let frameId: number
    const startTime = performance.now()

    const animate = () => {
      const t = (performance.now() - startTime) / 1000

      // Smooth inertia rotation
      if (!isDragging) {
        targetRotationY += 0.005
      }
      currentRotationY += (targetRotationY - currentRotationY) * 0.08
      group.rotation.y = currentRotationY

      // Animated Slicing Ring movement
      sliceRing.position.y = 0.2 + Math.sin(t * 2.2) * 0.55
      sliceRing.scale.setScalar(1 + Math.sin(t * 3) * 0.04)

      // Subtly hover nozzle head
      nozzleGroup.position.y = Math.sin(t * 1.5) * 0.04

      // Gentle floating animation for entire assembly
      group.position.y = Math.sin(t * 0.8) * 0.06

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || 500
      const h = container.clientHeight || 440
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      domEl.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: 440, minHeight: 440 }}>
      {/* 3D Canvas Mount Point */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />

      {/* Floating Drag Hint Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          borderRadius: 99,
          padding: '6px 16px',
          color: '#F8FAFC',
          fontSize: 12,
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          pointerEvents: 'none',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
        <span>Drag to rotate 3D Studio Model</span>
      </div>
    </div>
  )
}