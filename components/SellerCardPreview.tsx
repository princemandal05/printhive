'use client'

import React, { useState, useEffect } from 'react'

interface SellerCardPreviewProps {
  name: string
  category: string
  price: string
  stock: string
  description: string
  previewUrl: string
  cloudinaryUrl: string
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [scanPos, setScanPos] = useState(20)

  const imageSrc = previewUrl || cloudinaryUrl

  // Smooth ambient scanning line animation
  useEffect(() => {
    if (imageSrc) return
    const interval = setInterval(() => {
      setScanPos((prev) => (prev >= 85 ? 15 : prev + 2))
    }, 50)
    return () => clearInterval(interval)
  }, [imageSrc])

  // 3D Card Tilt Physics on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -10, y: x * 10 })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  const stockNum = parseInt(stock, 10)
  const isInStock = !isNaN(stockNum) ? stockNum > 0 : true
  const displayStock = !isNaN(stockNum) ? stockNum : 15

  return (
    <div style={{ position: 'sticky', top: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
        Live Marketplace Preview
      </div>

      {/* 3D PERSPECTIVE CONTAINER */}
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
              ? '0 20px 40px rgba(0,0,0,0.1), 0 0 24px rgba(255,107,53,0.12)'
              : '0 8px 30px rgba(0,0,0,0.05)',
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
            transition: 'transform 0.18s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease',
            position: 'relative',
          }}
        >
          {/* TOP SHOWCASE VIEWPORT */}
          <div
            style={{
              height: 220,
              position: 'relative',
              overflow: 'hidden',
              background: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Product Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              /* SINGLE SLEEK 3D LASER HOLOGRAM EFFECT */
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
                }}
              >
                {/* Cyber Grid Background */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                      'linear-gradient(rgba(255,107,53,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.12) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    opacity: 0.6,
                  }}
                />

                {/* Floating Glowing 3D Wireframe Icon */}
                <div
                  style={{
                    width: 72,
                    height: 72,
                    border: '2px solid rgba(255,107,53,0.8)',
                    borderRadius: 16,
                    transform: 'rotate(45deg)',
                    boxShadow: '0 0 25px rgba(255,107,53,0.35), inset 0 0 15px rgba(255,107,53,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF6B35',
                    fontSize: 28,
                    zIndex: 2,
                    animation: 'spin 8s linear infinite',
                  }}
                >
                  🧊
                </div>

                {/* Laser Scanning Line */}
                <div
                  style={{
                    position: 'absolute',
                    top: `${scanPos}%`,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, #FF6B35, #FFA07A, transparent)',
                    boxShadow: '0 0 14px #FF6B35',
                    zIndex: 3,
                    transition: 'top 0.05s linear',
                  }}
                />

                {/* Subtle Prompt Text */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#94A3B8',
                    letterSpacing: 0.3,
                    zIndex: 4,
                  }}
                >
                  Upload a photo to see live preview
                </div>
              </div>
            )}

            {/* IN-STOCK STATUS BADGE */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: isInStock ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 800,
                backdropFilter: 'blur(6px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                zIndex: 6,
              }}
            >
              {isInStock ? `In Stock (${displayStock})` : 'Out of Stock'}
            </div>
          </div>

          {/* CARD METADATA BODY */}
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 11, color: '#FF6B35', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 }}>
              {category || 'Home Décor'}
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
