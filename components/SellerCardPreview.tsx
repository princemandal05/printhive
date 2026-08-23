'use client'

import React, { useState, useEffect, useRef } from 'react'

interface SellerCardPreviewProps {
  name: string
  category: string
  price: string
  stock: string
  description: string
  previewUrl: string
  cloudinaryUrl: string
}

type PreviewMode = 'photo' | 'hologram' | 'game'

interface FilamentGem {
  id: number
  x: number
  y: number
  speed: number
  emoji: string
  points: number
  color: string
}

export default function SellerCardPreview({
  name,
  category,
  price,
  stock,
  description,
  previewUrl,
  cloudinaryUrl,
}: SellerCardPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>(previewUrl || cloudinaryUrl ? 'photo' : 'hologram')
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // Mini-Game State
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(1)
  const [gems, setGems] = useState<FilamentGem[]>([])
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; text: string }[]>([])
  const nextGemId = useRef(1)
  const animFrameRef = useRef<number | null>(null)

  // Slicer Laser Animation State
  const [slicerLayer, setSlicerLayer] = useState(42)
  const [laserX, setLaserX] = useState(50)

  // Auto-switch to photo mode when an image is selected
  useEffect(() => {
    if (previewUrl || cloudinaryUrl) {
      setMode('photo')
    }
  }, [previewUrl, cloudinaryUrl])

  // Laser slicer scanning loop
  useEffect(() => {
    if (mode !== 'hologram') return
    const interval = setInterval(() => {
      setSlicerLayer(prev => (prev >= 250 ? 1 : prev + 1))
      setLaserX(prev => (prev >= 85 ? 15 : prev + 7))
    }, 120)
    return () => clearInterval(interval)
  }, [mode])

  // Mini-Game Loop
  useEffect(() => {
    if (mode !== 'game') {
      setGems([])
      return
    }

    const spawnInterval = setInterval(() => {
      if (gems.length < 5) {
        const types = [
          { emoji: '🧵', points: 10, color: '#FF6B35' },
          { emoji: '🧊', points: 25, color: '#8B5CF6' },
          { emoji: '💎', points: 50, color: '#38BDF8' },
          { emoji: '⚡', points: 30, color: '#FACC15' },
        ]
        const choice = types[Math.floor(Math.random() * types.length)]
        setGems(prev => [
          ...prev,
          {
            id: nextGemId.current++,
            x: Math.random() * 80 + 10,
            y: 0,
            speed: Math.random() * 1.5 + 1.2,
            ...choice,
          },
        ])
      }
    }, 900)

    let lastTime = performance.now()
    const updateGems = (time: number) => {
      const delta = (time - lastTime) / 16
      lastTime = time

      setGems(prev =>
        prev
          .map(g => ({ ...g, y: g.y + g.speed * delta }))
          .filter(g => g.y < 100)
      )

      animFrameRef.current = requestAnimationFrame(updateGems)
    }

    animFrameRef.current = requestAnimationFrame(updateGems)

    return () => {
      clearInterval(spawnInterval)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [mode, gems.length])

  const handleCatchGem = (gemId: number, points: number, x: number, y: number) => {
    setGems(prev => prev.filter(g => g.id !== gemId))
    const earned = points * combo
    setScore(s => s + earned)
    setCombo(c => Math.min(c + 1, 8))

    const pId = Date.now() + Math.random()
    setParticles(prev => [...prev, { id: pId, x, y, text: `+${earned}` }])
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== pId))
    }, 800)
  }

  // 3D Card Tilt on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -15, y: x * 15 })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  const hasPhoto = Boolean(previewUrl || cloudinaryUrl)

  return (
    <div style={{ position: 'sticky', top: 24 }}>
      {/* PREVIEW MODE SELECTOR PILLS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Live Marketplace Preview
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#E2E8F0', padding: '3px 4px', borderRadius: 99 }}>
          {hasPhoto && (
            <button
              type="button"
              onClick={() => setMode('photo')}
              style={{
                background: mode === 'photo' ? '#FF6B35' : 'transparent',
                color: mode === 'photo' ? '#fff' : '#475569',
                border: 'none',
                borderRadius: 99,
                padding: '3px 10px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🖼️ Photo
            </button>
          )}
          <button
            type="button"
            onClick={() => setMode('hologram')}
            style={{
              background: mode === 'hologram' ? '#8B5CF6' : 'transparent',
              color: mode === 'hologram' ? '#fff' : '#475569',
              border: 'none',
              borderRadius: 99,
              padding: '3px 10px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ✨ Hologram
          </button>
          <button
            type="button"
            onClick={() => setMode('game')}
            style={{
              background: mode === 'game' ? '#10B981' : 'transparent',
              color: mode === 'game' ? '#fff' : '#475569',
              border: 'none',
              borderRadius: 99,
              padding: '3px 10px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🎮 Game
          </button>
        </div>
      </div>

      {/* 3D INTERACTIVE TILT CONTAINER */}
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          perspective: 1000,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: isHovered
              ? '0 20px 40px rgba(0,0,0,0.12), 0 0 20px rgba(255,107,53,0.15)'
              : '0 8px 30px rgba(0,0,0,0.06)',
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
            transition: 'transform 0.18s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease',
            position: 'relative',
          }}
        >
          {/* TOP SHOWCASE VIEWPORT */}
          <div style={{ height: 210, position: 'relative', overflow: 'hidden', background: '#0F172A' }}>
            {/* 1. PHOTO MODE */}
            {mode === 'photo' && hasPhoto && (
              <img
                src={previewUrl || cloudinaryUrl}
                alt="Product Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}

            {/* 2. HOLOGRAPHIC 3D SLICER MODE */}
            {mode === 'hologram' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at 50% 50%, #1E293B 0%, #0F172A 100%)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'crosshair',
                }}
              >
                {/* Cyber Grid Floor */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(139,92,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.15) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    perspective: 200,
                    transform: 'rotateX(50deg) translateY(40px)',
                    opacity: 0.7,
                  }}
                />

                {/* Holographic Glowing 3D Cube / Polyhedron */}
                <div
                  style={{
                    width: 70,
                    height: 70,
                    border: '2px solid #8B5CF6',
                    boxShadow: '0 0 25px rgba(139,92,246,0.6), inset 0 0 15px rgba(255,107,53,0.4)',
                    borderRadius: 14,
                    transform: 'rotate(45deg)',
                    animation: 'spin 6s linear infinite',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF6B35',
                    fontSize: 24,
                    zIndex: 2,
                  }}
                >
                  ⚡
                </div>

                {/* Laser Scanning Beam */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${slicerLayer % 90 + 5}%`,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, #FF6B35, #8B5CF6, transparent)',
                    boxShadow: '0 0 12px #FF6B35',
                    transition: 'top 0.12s linear',
                    zIndex: 3,
                  }}
                />

                {/* Extruder Nozzle Indicator */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${slicerLayer % 90 + 2}%`,
                    left: `${laserX}%`,
                    width: 10,
                    height: 10,
                    background: '#FF6B35',
                    borderRadius: '50%',
                    boxShadow: '0 0 15px #FF6B35',
                    transition: 'all 0.12s ease',
                    zIndex: 4,
                  }}
                />

                {/* Live Slicing Telemetry */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 10,
                    zIndex: 5,
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#94A3B8',
                    fontFamily: 'monospace',
                    background: 'rgba(15,23,42,0.85)',
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  Layer: #{slicerLayer}/300 • Extruding PLA
                </div>
              </div>
            )}

            {/* 3. MINI-GAME MODE: CATCH THE FILAMENT */}
            {mode === 'game' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  userSelect: 'none',
                }}
              >
                {/* Score & Combo HUD */}
                <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ background: '#FF6B35', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 900 }}>
                    🏆 {score} pts
                  </div>
                  {combo > 1 && (
                    <div style={{ background: '#8B5CF6', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 10, fontWeight: 900, animation: 'pulse 1s infinite' }}>
                      {combo}x Combo!
                    </div>
                  )}
                </div>

                <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>
                  Tap falling gems! 🎯
                </div>

                {/* Floating Gems to Click */}
                {gems.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCatchGem(g.id, g.points, g.x, g.y)
                    }}
                    style={{
                      position: 'absolute',
                      left: `${g.x}%`,
                      top: `${g.y}%`,
                      background: 'rgba(255,255,255,0.12)',
                      border: `1px solid ${g.color}`,
                      boxShadow: `0 0 12px ${g.color}`,
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      cursor: 'pointer',
                      transform: 'translate(-50%, -50%)',
                      transition: 'transform 0.1s',
                      zIndex: 8,
                    }}
                  >
                    {g.emoji}
                  </button>
                ))}

                {/* Floating Score Particles */}
                {particles.map(p => (
                  <div
                    key={p.id}
                    style={{
                      position: 'absolute',
                      left: `${p.x}%`,
                      top: `${p.y - 15}%`,
                      color: '#FACC15',
                      fontSize: 12,
                      fontWeight: 900,
                      pointerEvents: 'none',
                      animation: 'fadeUp 0.8s ease-out forwards',
                      zIndex: 15,
                    }}
                  >
                    {p.text}
                  </div>
                ))}
              </div>
            )}

            {/* In-Stock Badge */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: parseInt(stock, 10) > 0 ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 900,
                backdropFilter: 'blur(6px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                zIndex: 6,
              }}
            >
              {parseInt(stock, 10) > 0 ? `In Stock (${stock})` : 'Out of Stock'}
            </div>
          </div>

          {/* CARD METADATA BODY */}
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 11, color: '#FF6B35', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 }}>
              {category}
            </div>

            <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name.trim() || 'Product Title Preview'}
            </div>

            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 14, height: 36, overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4 }}>
              {description.trim() || 'Product description preview will appear here as you type...'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                ₹{price || '799'}
              </div>
              <span
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)',
                  color: '#fff',
                  padding: '7px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(255,107,53,0.3)',
                }}
              >
                Add to Cart
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
