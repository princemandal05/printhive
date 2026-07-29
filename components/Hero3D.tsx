'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 450
    const height = container.clientHeight || 420
    const aspect = height > 0 ? width / height : 1.1

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100)
    camera.position.set(0, 0.4, 4.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 1.0)
    scene.add(ambient)

    // Key Light: Brand Terracotta Amber
    const keyLight = new THREE.PointLight(0xea580c, 3.2, 20)
    keyLight.position.set(3, 3, 4)
    scene.add(keyLight)

    // Rim Light: Emerald Cyber Glow
    const rimLight = new THREE.PointLight(0x10b981, 2.4, 20)
    rimLight.position.set(-4, -2, -2)
    scene.add(rimLight)

    const group = new THREE.Group()

    // Core solid geometry (PrintHive Brand Amber / Terracotta)
    const coreGeo = new THREE.IcosahedronGeometry(1.05, 1)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.2,
      metalness: 0.3,
      flatShading: true,
    })
    const core = new THREE.Mesh(coreGeo, coreMat)
    group.add(core)

    // Sleek Emerald Wireframe Outer Shell
    const wireGeo = new THREE.IcosahedronGeometry(1.32, 1)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    })
    const wire = new THREE.Mesh(wireGeo, wireMat)
    group.add(wire)

    // Orbiting nodes contained strictly inside the frame (radius 1.6)
    const nodeColors = [0xea580c, 0x10b981, 0x38bdf8]
    const nodes: THREE.Mesh[] = []
    nodeColors.forEach((color, i) => {
      const geo = new THREE.SphereGeometry(0.1, 16, 16)
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.4 })
      const node = new THREE.Mesh(geo, mat)
      const angle = (i / nodeColors.length) * Math.PI * 2
      node.position.set(Math.cos(angle) * 1.6, Math.sin(angle * 1.2) * 0.4, Math.sin(angle) * 1.6)
      nodes.push(node)
      group.add(node)
    })

    scene.add(group)

    let frameId: number
    const startTime = performance.now()

    const animate = () => {
      const t = (performance.now() - startTime) / 1000
      group.rotation.y = t * 0.35
      core.rotation.x = t * 0.18
      wire.rotation.y = -t * 0.2
      nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * Math.PI * 2 + t * 0.5
        node.position.x = Math.cos(angle) * 1.6
        node.position.z = Math.sin(angle) * 1.6
        node.position.y = Math.sin(t + i) * 0.35
      })
      group.position.y = Math.sin(t * 0.8) * 0.08

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || 450
      const h = container.clientHeight || 420
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="hero-3d-canvas"
      style={{
        width: '100%',
        height: 400,
        minHeight: 400,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 20,
      }}
    />
  )
}