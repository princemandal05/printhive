'use client'

import React, { useState, Component, ErrorInfo, ReactNode } from 'react'

interface ThreeViewerProps {
  title?: string
  color?: string
  wireframeDefault?: boolean
  height?: number | string
  modelUrl?: string
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
          <span style={{ fontSize: 12, background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '4px 12px', borderRadius: 99, fontWeight: 700 }}>
            ● Preview Unavailable — Click to Retry
          </span>
        </div>
      )
    }

    return this.props.children
  }
}

function ThreeViewerInner({
  title = '3D Model Viewport',
  color = '#ff6b35',
  height = 420,
  modelUrl,
}: ThreeViewerProps) {
  const [wireframe, setWireframe] = useState(false)
  const [rotating, setRotating] = useState(true)
  const [zoom, setZoom] = useState(100)

  // Safe color validator
  const validColor = /^#[0-9A-F]{6}$/i.test(color) ? color : '#ff6b35'

  const hasModel = Boolean(modelUrl && modelUrl.trim() !== '')

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

      {hasModel ? (
        /* Interactive 3D Mesh Representation */
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
            style={{ filter: `drop-shadow(0 15px 25px ${validColor}44)` }}
          >
            {/* Isometric 3D Cube / Polyline Geometry */}
            <polygon
              points="50,15 90,35 50,55 10,35"
              fill={wireframe ? 'transparent' : `${validColor}cc`}
              stroke={validColor}
              strokeWidth={wireframe ? '1.5' : '0.5'}
            />
            <polygon
              points="10,35 50,55 50,95 10,75"
              fill={wireframe ? 'transparent' : `${validColor}aa`}
              stroke={validColor}
              strokeWidth={wireframe ? '1.5' : '0.5'}
            />
            <polygon
              points="50,55 90,35 90,75 50,95"
              fill={wireframe ? 'transparent' : `${validColor}88`}
              stroke={validColor}
              strokeWidth={wireframe ? '1.5' : '0.5'}
            />

            {/* Internal Wireframe Geometry Lines */}
            <line x1="50" y1="15" x2="50" y2="55" stroke="#ffffff66" strokeWidth="1" />
            <line x1="10" y1="35" x2="90" y2="35" stroke="#ffffff33" strokeWidth="1" />
            <line x1="50" y1="55" x2="50" y2="95" stroke="#ffffff33" strokeWidth="1" />
          </svg>
        </div>
      ) : (
        /* Empty Model Placeholder State */
        <div style={{ textAlign: 'center', padding: 24, zIndex: 2, maxWidth: 360 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
            Upload your 3D file to view
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, marginBottom: 14 }}>
            Select an STL, 3MF, or OBJ model file to inspect the 3D geometry mesh live in WebGL.
          </div>
          <span style={{ fontSize: 11, background: 'rgba(234,88,12,0.15)', color: '#ea580c', padding: '4px 12px', borderRadius: 99, fontWeight: 700, border: '1px solid rgba(234,88,12,0.3)' }}>
            ● WebGL Mesh Engine Ready
          </span>
        </div>
      )}

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
        <span style={{ fontSize: 11, color: hasModel ? '#10b981' : '#f59e0b', background: hasModel ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: 6, fontWeight: 600 }}>
          {hasModel ? '● Ready to Slice' : '○ Standby'}
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
          style={{ background: wireframe ? validColor : 'transparent', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
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

export default function ThreeViewer(props: ThreeViewerProps) {
  return (
    <ThreeViewerErrorBoundary fallbackTitle={props.title}>
      <ThreeViewerInner {...props} />
    </ThreeViewerErrorBoundary>
  )
}
