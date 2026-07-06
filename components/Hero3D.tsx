'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0.6, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)

    const keyLight = new THREE.PointLight(0xff6b35, 2.2, 20)
    keyLight.position.set(3, 3, 4)
    scene.add(keyLight)

    const rimLight = new THREE.PointLight(0x3b82f6, 1.2, 20)
    rimLight.position.set(-4, -2, -2)
    scene.add(rimLight)

    const group = new THREE.Group()

    const coreGeo = new THREE.IcosahedronGeometry(1.1, 1)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xff6b35,
      roughness: 0.25,
      metalness: 0.35,
      flatShading: true,
    })
    const core = new THREE.Mesh(coreGeo, coreMat)
    group.add(core)

    const wireGeo = new THREE.IcosahedronGeometry(1.35, 1)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    })
    const wire = new THREE.Mesh(wireGeo, wireMat)
    group.add(wire)

    const nodeColors = [0xff6b35, 0x3b82f6, 0x10b981]
    const nodes: THREE.Mesh[] = []
    nodeColors.forEach((color, i) => {
      const geo = new THREE.SphereGeometry(0.12, 16, 16)
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
      const node = new THREE.Mesh(geo, mat)
      const angle = (i / nodeColors.length) * Math.PI * 2
      node.position.set(Math.cos(angle) * 2.2, Math.sin(angle * 1.3) * 0.6, Math.sin(angle) * 2.2)
      nodes.push(node)
      group.add(node)
    })

    scene.add(group)

    let frameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      const t = clock.getElapsedTime()
      group.rotation.y = t * 0.35
      core.rotation.x = t * 0.15
      wire.rotation.y = -t * 0.2
      nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * Math.PI * 2 + t * 0.5
        node.position.x = Math.cos(angle) * 2.2
        node.position.z = Math.sin(angle) * 2.2
        node.position.y = Math.sin(t + i) * 0.5
      })
      group.position.y = Math.sin(t * 0.8) * 0.08

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
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

  return <div ref={containerRef} className="hero-3d-canvas" />
}