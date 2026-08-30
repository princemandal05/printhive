'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface RoleLive3DProps {
  role: 'buyer' | 'designer' | 'printer' | 'seller'
}

export default function RoleLive3DViewer({ role }: RoleLive3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = 200
    const height = 200

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0.2, 4.2)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch (err) {
      console.warn('WebGL context creation failed:', err)
      return
    }
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambient)

    // Role-specific colors and geometries
    let coreColor = 0xea580c // Buyer orange
    let wireColor = 0x38bdf8 // Sky blue
    let nodeColors = [0x10b981, 0xea580c, 0x38bdf8]
    let coreGeo: THREE.BufferGeometry
    let wireGeo: THREE.BufferGeometry

    if (role === 'buyer') {
      // Buyer: Faceted Chair / Icosahedron
      coreColor = 0xea580c
      wireColor = 0x38bdf8
      nodeColors = [0x10b981, 0xea580c, 0x38bdf8]
      coreGeo = new THREE.IcosahedronGeometry(0.95, 1)
      wireGeo = new THREE.IcosahedronGeometry(1.28, 1)
    } else if (role === 'designer') {
      // Creator / Designer: Parametric Torus Knot / Spiral Vase
      coreColor = 0x8b5cf6
      wireColor = 0x38bdf8
      nodeColors = [0x8b5cf6, 0xc084fc, 0x38bdf8]
      coreGeo = new THREE.TorusKnotGeometry(0.65, 0.22, 64, 16)
      wireGeo = new THREE.SphereGeometry(1.28, 14, 14)
    } else if (role === 'printer') {
      // Printer Hub: Octahedron / Mechanical Gantry
      coreColor = 0x10b981
      wireColor = 0x34d399
      nodeColors = [0x059669, 0x10b981, 0x6ee7b7]
      coreGeo = new THREE.OctahedronGeometry(0.95, 1)
      wireGeo = new THREE.OctahedronGeometry(1.3, 1)
    } else {
      // Seller: Dodecahedron / Honeycomb
      coreColor = 0x2563eb
      wireColor = 0x38bdf8
      nodeColors = [0x1d4ed8, 0x2563eb, 0x60a5fa]
      coreGeo = new THREE.DodecahedronGeometry(0.95, 1)
      wireGeo = new THREE.DodecahedronGeometry(1.28, 1)
    }

    const keyLight = new THREE.PointLight(coreColor, 3.5, 20)
    keyLight.position.set(3, 3, 4)
    scene.add(keyLight)

    const rimLight = new THREE.PointLight(wireColor, 2.5, 20)
    rimLight.position.set(-3, -2, -2)
    scene.add(rimLight)

    const group = new THREE.Group()

    // 1. Core Solid Mesh
    const coreMat = new THREE.MeshStandardMaterial({
      color: coreColor,
      roughness: 0.25,
      metalness: 0.35,
      flatShading: true,
    })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    group.add(coreMesh)

    // 2. Wireframe Geometric Outer Cage
    const wireMat = new THREE.MeshBasicMaterial({
      color: wireColor,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    })
    const wireMesh = new THREE.Mesh(wireGeo, wireMat)
    group.add(wireMesh)

    // 3. Orbiting Satellite Nodes
    const nodes: THREE.Mesh[] = []
    nodeColors.forEach((color, i) => {
      const geo = new THREE.SphereGeometry(0.09, 16, 16)
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.5 })
      const node = new THREE.Mesh(geo, mat)
      const angle = (i / nodeColors.length) * Math.PI * 2
      node.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 0.3, Math.sin(angle) * 1.5)
      nodes.push(node)
      group.add(node)
    })

    scene.add(group)

    let frameId: number
    const startTime = performance.now()

    const animate = () => {
      const t = (performance.now() - startTime) / 1000
      group.rotation.y = t * 0.4
      coreMesh.rotation.x = t * 0.25
      wireMesh.rotation.y = -t * 0.25
      wireMesh.rotation.z = t * 0.15

      nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * Math.PI * 2 + t * 0.6
        node.position.x = Math.cos(angle) * 1.5
        node.position.z = Math.sin(angle) * 1.5
        node.position.y = Math.sin(t * 1.2 + i) * 0.35
      })

      group.position.y = Math.sin(t * 0.9) * 0.06

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(frameId)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [role])

  return (
    <div
      ref={containerRef}
      style={{
        width: 200,
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    />
  )
}
