'use client'

import { useState } from 'react'

interface ThreeViewerProps {
  title?: string
  color?: string
  wireframeDefault?: boolean
  height?: number | string
}

export default function ThreeViewer({
  title = '3D Model Viewport',
  color = '#ff6b35',
  height = 420,
}: ThreeViewerProps) {
  const [wireframe, setWireframe] = useState(false)
  const [rotating, setRotating] = useState(true)
  const [zoom, setZoom] = useState(100)

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 16,
        background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Grid Floor Graphic */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          pointerEvents: 'none',
        }}
      />

      {/* Interactive 3D Mesh Representation */}
      <div
        style={{
          transform: `scale(${zoom / 100})`,
          transition: 'transform 0.2s ease',
          animation: rotating ? 'spin3D 12s linear infinite' : 'none',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="180"
          height="180"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: `drop-shadow(0 15px 25px ${color}44)` }}
        >
          {/* Isometric 3D Cube / Polyline Geometry */}
          <polygon
            points="50,15 90,35 50,55 10,35"
            fill={wireframe ? 'transparent' : `${color}cc`}
            stroke={color}
            strokeWidth={wireframe ? '1.5' : '0.5'}
          />
          <polygon
            points="10,35 50,55 50,95 10,75"
            fill={wireframe ? 'transparent' : `${color}aa`}
            stroke={color}
            strokeWidth={wireframe ? '1.5' : '0.5'}
          />
          <polygon
            points="50,55 90,35 90,75 50,95"
            fill={wireframe ? 'transparent' : `${color}88`}
            stroke={color}
            strokeWidth={wireframe ? '1.5' : '0.5'}
          />

          {/* Internal Wireframe Geometry Lines */}
          <line x1="50" y1="15" x2="50" y2="55" stroke="#ffffff66" strokeWidth="1" />
          <line x1="10" y1="35" x2="90" y2="35" stroke="#ffffff33" strokeWidth="1" />
          <line x1="50" y1="55" x2="50" y2="95" stroke="#ffffff33" strokeWidth="1" />
        </svg>
      </div>

      <style jsx global>{`
        @keyframes spin3D {
          0% { transform: scale(${zoom / 100}) rotateY(0deg) rotateX(10deg); }
          100% { transform: scale(${zoom / 100}) rotateY(360deg) rotateX(10deg); }
        }
      `}</style>

      {/* Top Header overlay */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.8)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }}>
          🧊 3D WebGL Viewport · {title}
        </span>
        <span style={{ fontSize: 11, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: 6, fontWeight: 600 }}>
          ● Ready to Slice
        </span>
      </div>

      {/* Bottom Controls Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          display: 'flex',
          gap: 8,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <button
          type="button"
          onClick={() => setRotating(!rotating)}
          style={{ background: rotating ? '#334155' : 'transparent', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
        >
          {rotating ? '⏸ Pause Spin' : '▶ Auto Rotate'}
        </button>
        <button
          type="button"
          onClick={() => setWireframe(!wireframe)}
          style={{ background: wireframe ? color : 'transparent', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
        >
          {wireframe ? 'Solid Render' : 'Wireframe'}
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(60, z - 15))}
          style={{ background: 'transparent', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}
        >
          🔍−
        </button>
        <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center' }}>{zoom}%</span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(150, z + 15))}
          style={{ background: 'transparent', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}
        >
          🔍+
        </button>
      </div>
    </div>
  )
}
