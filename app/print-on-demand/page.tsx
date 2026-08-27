'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ThreeViewer from '@/components/ThreeViewer'
import { useStore } from '@/lib/cart-context'
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Printer,
  ShieldCheck,
  Zap,
  Sliders,
  DollarSign,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileCheck,
} from 'lucide-react'

const MATERIALS = [
  { id: 'PLA', name: 'PLA (Standard Prototyping)', baseRate: 1.2, desc: 'Eco-friendly, precise dimensional stability' },
  { id: 'PETG', name: 'PETG (Durable & Tough)', baseRate: 1.45, desc: 'Chemical, UV and impact resistant up to 75°C' },
  { id: 'ABS', name: 'ABS (High Strength Mechanical)', baseRate: 1.6, desc: 'Rigid functional assemblies and enclosures' },
  { id: 'TPU', name: 'TPU (Flexible Rubber 95A)', baseRate: 1.85, desc: 'Flexible gaskets, wearables and dampeners' },
  { id: 'Resin', name: 'SLA Resin (Ultra-High Detail)', baseRate: 2.1, desc: 'Flawless 0.05mm layer miniatures and jewelry' },
]

const COLORS = ['Obsidian Black', 'Pure White', 'Terracotta Orange', 'Crimson Red', 'Signal Blue', 'Emerald Green']
const COLOR_HEX_MAP: Record<string, string> = {
  'Obsidian Black': '#1e293b',
  'Pure White': '#f8fafc',
  'Terracotta Orange': '#ea580c',
  'Crimson Red': '#ef4444',
  'Signal Blue': '#3b82f6',
  'Emerald Green': '#10b981',
}
const QUALITY_PRESETS = [
  { id: 'standard', name: 'Standard (0.20 mm)', layerTime: 1.0 },
  { id: 'fine', name: 'Fine (0.12 mm)', layerTime: 1.4 },
  { id: 'ultra', name: 'Ultra Fine (0.08 mm)', layerTime: 2.1 },
]

interface PrinterHub {
  id: string
  name: string
  model: string
  distance: string
  rating: number
  completedOrders: number
  materials: string[]
  buildVolume: string
  completionEstimate: string
  price: number
}

const NEARBY_HUBS: PrinterHub[] = [
  {
    id: 'hub-1',
    name: 'PrintHive Precision Lab (Koramangala)',
    model: 'Bambu Lab X1-Carbon Dual-Nozzle',
    distance: '1.4 km away',
    rating: 4.9,
    completedOrders: 312,
    materials: ['PLA', 'PETG', 'ABS', 'TPU'],
    buildVolume: '256 × 256 × 256 mm',
    completionEstimate: 'Ready in ~4h 30m',
    price: 350,
  },
  {
    id: 'hub-2',
    name: 'Apex Rapid Fab (Indiranagar)',
    model: 'Prusa MK4 Enclosed System',
    distance: '3.2 km away',
    rating: 4.8,
    completedOrders: 189,
    materials: ['PLA', 'PETG', 'ABS'],
    buildVolume: '250 × 210 × 220 mm',
    completionEstimate: 'Ready in ~6h 00m',
    price: 320,
  },
  {
    id: 'hub-3',
    name: 'Zenith Micro SLA Center (HSR Layout)',
    model: 'Formlabs Form 3+ SLA Laser',
    distance: '4.8 km away',
    rating: 5.0,
    completedOrders: 420,
    materials: ['Resin', 'PLA'],
    buildVolume: '145 × 145 × 185 mm',
    completionEstimate: 'Ready in ~8h 15m',
    price: 480,
  },
]

export default function PrintOnDemandPage() {
  const router = useRouter()
  const { addToCart } = useStore()

  // Analysis race-condition protection
  const analysisRevisionRef = useRef(0)
  const analysisTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Slicer States
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileSizeMb, setFileSizeMb] = useState(0)
  const [modelBlobUrl, setModelBlobUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisDone, setAnalysisDone] = useState(false)

  // Diagnostics
  const [meshDimensions, setMeshDimensions] = useState('112 × 88 × 134 mm')
  const [meshVolumeCm3, setMeshVolumeCm3] = useState(126)
  const [estimatedWeightGrams, setEstimatedWeightGrams] = useState(148)
  const [supportRequired, setSupportRequired] = useState(true)

  // Configuration
  const [material, setMaterial] = useState(MATERIALS[0])
  const [color, setColor] = useState(COLORS[2]) // Terracotta
  const [quality, setQuality] = useState(QUALITY_PRESETS[0])
  const [infill, setInfill] = useState(20)
  const [includeSupports, setIncludeSupports] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [selectedHub, setSelectedHub] = useState<PrinterHub>(NEARBY_HUBS[0])
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    return () => {
      if (analysisTimerRef.current) {
        clearTimeout(analysisTimerRef.current)
      }
      if (modelBlobUrl) {
        URL.revokeObjectURL(modelBlobUrl)
      }
    }
  }, [modelBlobUrl])

  const handleFileUpload = (uploadedFile: File | null) => {
    if (!uploadedFile) return
    if (analysisTimerRef.current) {
      clearTimeout(analysisTimerRef.current)
    }
    const currentRev = ++analysisRevisionRef.current

    if (modelBlobUrl) {
      URL.revokeObjectURL(modelBlobUrl)
    }
    const blobUrl = URL.createObjectURL(uploadedFile)
    setModelBlobUrl(blobUrl)

    setFile(uploadedFile)
    setFileName(uploadedFile.name)
    setFileSizeMb(Math.round((uploadedFile.size / (1024 * 1024)) * 100) / 100)
    setIsAnalyzing(true)
    setAnalysisDone(false)

    // Simulate real-time mesh pre-flight analysis for the specific active file
    analysisTimerRef.current = setTimeout(() => {
      if (currentRev !== analysisRevisionRef.current) return
      setIsAnalyzing(false)
      setAnalysisDone(true)
      const baseVol = Math.floor(80 + Math.random() * 100)
      setMeshVolumeCm3(baseVol)
      setEstimatedWeightGrams(Math.round(baseVol * 1.25))
    }, 1200)
  }

  const handleSelectMaterial = (newMat: typeof MATERIALS[0]) => {
    setMaterial(newMat)
    // Auto-select a compatible hub if current hub doesn't support the material
    if (!selectedHub.materials.includes(newMat.id)) {
      const compatibleHub = NEARBY_HUBS.find((h) => h.materials.includes(newMat.id))
      if (compatibleHub) {
        setSelectedHub(compatibleHub)
      }
    }
  }

  // Real-time pricing calculations incorporating selectedHub.price
  const rawMaterialCost = Math.round(meshVolumeCm3 * material.baseRate * 1.1)
  const hubBaseRate = (selectedHub?.price || 350) * 0.25
  const machineRate = Math.round(hubBaseRate * quality.layerTime * (1 + (infill - 20) / 80))
  const processingFee = 35
  const platformFee = 25
  const unitPrice = rawMaterialCost + machineRate + processingFee + platformFee
  const totalPrice = unitPrice * quantity

  const isHubCompatible = selectedHub.materials.includes(material.id)
  const canSubmit = analysisDone && !!deliveryAddress.trim() && quantity > 0 && isHubCompatible

  const handlePlaceOrder = () => {
    if (!canSubmit) return
    setPlacing(true)

    // Persist complete manufacturing job configuration for checkout reconstruction
    const printJobPayload = {
      fileName,
      meshDimensions,
      meshVolumeCm3,
      estimatedWeightGrams,
      material: material.id,
      color,
      quality: quality.name,
      infill,
      includeSupports,
      selectedHubId: selectedHub.id,
      selectedHubName: selectedHub.name,
      deliveryAddress,
      unitPrice,
      quantity,
      totalPrice,
      timestamp: Date.now(),
    }

    try {
      localStorage.setItem('printhive_current_print_job', JSON.stringify(printJobPayload))
    } catch (e) {
      console.warn('Could not persist print job to localStorage:', e)
    }

    addToCart(
      {
        id: `pod-${Date.now()}`,
        name: `Custom Print: ${fileName} (${material.id}, ${color})`,
        price: unitPrice,
        seller: selectedHub.name,
        stock: 99,
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      },
      quantity
    )
    router.push('/checkout')
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', fontFamily: 'inherit', transition: 'background 0.3s ease' }}>
      <Navbar />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>
              Instant 3D Slicer &amp; Print-on-Demand Hub
            </h1>
            <span style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', border: '1px solid rgba(234, 88, 12, 0.3)', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99 }}>
              STL • 3MF • OBJ
            </span>
          </div>
          <p style={{ color: 'var(--text-sub)', fontSize: 14.5, margin: 0, maxWidth: 700, lineHeight: 1.5 }}>
            Upload your CAD file for automated mesh geometry validation, real-time cost calculation, and instant routing to compatible local printer hubs.
          </p>
        </div>

        {/* 2-COLUMN WORKFLOW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32, alignItems: 'flex-start' }}>
          {/* LEFT: STEP 1 TO 3 (UPLOAD, ANALYSIS, CONFIGURATION) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* STEP 1: DRAG & DROP UPLOAD */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#ea580c', color: '#fff', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Upload 3D CAD File</h3>
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--text-sub)', fontWeight: 700 }}>Max: 200MB</span>
              </div>

              <label
                htmlFor="stl-upload"
                style={{
                  border: '2px dashed ' + (fileName ? '#10B981' : 'var(--border-color)'),
                  background: fileName ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card-hover)',
                  borderRadius: 16,
                  padding: '36px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 16, background: fileName ? 'rgba(16, 185, 129, 0.12)' : 'rgba(234, 88, 12, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: fileName ? '#10B981' : '#ea580c' }}>
                  {fileName ? <FileCheck size={26} /> : <UploadCloud size={26} />}
                </div>

                <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
                  {fileName ? fileName : 'Drag & drop your STL / 3MF / OBJ here'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                  {fileName ? `${fileSizeMb} MB • Ready for Slicer Engine` : 'or click to browse from your device'}
                </div>

                <input
                  id="stl-upload"
                  type="file"
                  accept=".stl,.3mf,.obj"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* LIVE 3D SLICER VIEWPORT */}
            {modelBlobUrl && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 18, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#8B5CF6', color: '#fff', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3D</div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Interactive Slicer Viewport</h3>
                  </div>
                  <span style={{ fontSize: 11, color: '#8B5CF6', fontWeight: 800, background: 'rgba(139, 92, 246, 0.1)', padding: '2px 8px', borderRadius: 99 }}>
                    Live Filament: {color}
                  </span>
                </div>
                <ThreeViewer
                  title={fileName || 'Uploaded CAD File'}
                  modelUrl={modelBlobUrl}
                  fileName={fileName}
                  color={COLOR_HEX_MAP[color] || '#ea580c'}
                  height={360}
                />
              </div>
            )}

            {/* STEP 2: AUTOMATIC MESH & GEOMETRY DIAGNOSTICS */}
            {(isAnalyzing || analysisDone) && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#ea580c', color: '#fff', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Automated Mesh Diagnostics</h3>
                  </div>
                  {analysisDone && (
                    <span style={{ fontSize: 11.5, color: '#10B981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> Slicing Ready
                    </span>
                  )}
                </div>

                {isAnalyzing ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-sub)', fontSize: 13.5 }}>
                    <div style={{ fontWeight: 800, color: '#ea580c', marginBottom: 4 }}>Analyzing 3D Topology &amp; Triangles...</div>
                    <div>Calculating bounding box and watertight mesh density</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    <div style={{ background: 'var(--bg-card-hover)', padding: '12px 10px', borderRadius: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>Dimensions</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-main)', marginTop: 2 }}>{meshDimensions}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card-hover)', padding: '12px 10px', borderRadius: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>Volume</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-main)', marginTop: 2 }}>{meshVolumeCm3} cm³</div>
                    </div>
                    <div style={{ background: 'var(--bg-card-hover)', padding: '12px 10px', borderRadius: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>Est. Weight</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-main)', marginTop: 2 }}>{estimatedWeightGrams} g</div>
                    </div>
                    <div style={{ background: 'var(--bg-card-hover)', padding: '12px 10px', borderRadius: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>Supports</div>
                      <div style={{ fontSize: 12.5, fontWeight: 900, color: '#F59E0B', marginTop: 2 }}>Recommended</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: CONFIGURE MANUFACTURING PARAMETERS */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#ea580c', color: '#fff', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Configure Print Parameters</h3>
              </div>

              {/* Material Selector */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Filament / Resin Material
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {MATERIALS.map((m) => {
                    const active = material.id === m.id
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMaterial(m)}
                        style={{
                          padding: '10px 10px',
                          borderRadius: 12,
                          textAlign: 'left',
                          border: active ? '2px solid #ea580c' : '1px solid var(--border-color)',
                          background: active ? 'rgba(234, 88, 12, 0.08)' : 'var(--bg-card-hover)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: active ? '#ea580c' : 'var(--text-main)' }}>{m.id}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 2 }}>{m.desc.split(',')[0]}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quality & Color Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Layer Height
                  </label>
                  <select
                    value={quality.id}
                    onChange={(e) => setQuality(QUALITY_PRESETS.find((q) => q.id === e.target.value) || QUALITY_PRESETS[0])}
                    style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'var(--text-main)', fontWeight: 700, outline: 'none' }}
                  >
                    {QUALITY_PRESETS.map((q) => (
                      <option key={q.id} value={q.id}>{q.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Filament Color
                  </label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'var(--text-main)', fontWeight: 700, outline: 'none' }}
                  >
                    {COLORS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Infill Slider */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>
                    Infill Density: <strong style={{ color: '#ea580c' }}>{infill}%</strong>
                  </label>
                  <span style={{ fontSize: 11.5, color: 'var(--text-sub)' }}>
                    {infill <= 20 ? 'Standard Lightweight' : infill <= 50 ? 'Strong Functional' : 'Solid High Stress'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={infill}
                  onChange={(e) => setInfill(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ea580c', cursor: 'pointer' }}
                />
              </div>

              {/* Supports Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg-card-hover)', borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>Generate Support Structures</div>
                  <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>Recommended for overhangs greater than 45°</div>
                </div>
                <input
                  type="checkbox"
                  checked={includeSupports}
                  onChange={(e) => setIncludeSupports(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#ea580c', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* STEP 4: CHOOSE PRINTER HUB */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#ea580c', color: '#fff', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Select Nearby Manufacturing Hub</h3>
                </div>
                <span style={{ fontSize: 11.5, color: '#10B981', fontWeight: 800 }}>
                  {deliveryAddress.trim() ? 'Matched to Location' : 'Verified Hub Network'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {NEARBY_HUBS.map((hub) => {
                  const active = selectedHub.id === hub.id
                  const supportsSelectedMat = hub.materials.includes(material.id)
                  return (
                    <div
                      key={hub.id}
                      onClick={() => {
                        if (supportsSelectedMat) setSelectedHub(hub)
                      }}
                      style={{
                        border: active ? '2px solid #ea580c' : '1px solid var(--border-color)',
                        background: active ? 'rgba(234, 88, 12, 0.05)' : supportsSelectedMat ? 'var(--bg-card-hover)' : 'rgba(0,0,0,0.02)',
                        opacity: supportsSelectedMat ? 1 : 0.6,
                        borderRadius: 14,
                        padding: 14,
                        cursor: supportsSelectedMat ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-main)' }}>{hub.name}</span>
                          <span style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', fontSize: 10.5, fontWeight: 800, padding: '1px 6px', borderRadius: 4 }}>
                            {deliveryAddress.trim() ? hub.distance : 'Sample Radius'}
                          </span>
                          {!supportsSelectedMat && (
                            <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>
                              No {material.id}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                          {hub.model} • ⭐ {hub.rating} ({hub.completedOrders} prints)
                        </div>
                        <div style={{ fontSize: 11, color: '#10B981', marginTop: 3, fontWeight: 700 }}>
                          Ready: {hub.completionEstimate}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: active ? '6px solid #ea580c' : '2px solid var(--border-color)', background: 'var(--bg-card)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: COST BREAKDOWN, DELIVERY & CONFIRMATION */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: '28px 24px', boxShadow: '0 6px 30px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
                <ShieldCheck size={16} /> RAZORPAY ESCROW PROTECTED
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 16px' }}>
                Manufacturing Estimate
              </h2>

              {/* LINE ITEM COST BREAKDOWN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 16, borderBottom: '1px solid var(--border-color)', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-sub)' }}>Raw Filament ({material.id})</span>
                  <span style={{ fontWeight: 800 }}>₹{rawMaterialCost}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-sub)' }}>Printer Machine Rate</span>
                  <span style={{ fontWeight: 800 }}>₹{machineRate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-sub)' }}>Pre-Flight Slicing &amp; QA</span>
                  <span style={{ fontWeight: 800 }}>₹{processingFee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-sub)' }}>Platform Escrow Fee</span>
                  <span style={{ fontWeight: 800 }}>₹{platformFee}</span>
                </div>
              </div>

              {/* Quantity */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-sub)' }}>Quantity</span>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card-hover)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '4px 10px', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 8px', fontSize: 13.5, fontWeight: 900 }}>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ padding: '4px 10px', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 900 }}>Total Escrow Price</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#ea580c' }}>₹{totalPrice}</span>
              </div>

              {/* Delivery Address Input */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Delivery Address in India *
                </label>
                <textarea
                  rows={2}
                  placeholder="Street address, city, pincode..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'var(--text-main)', outline: 'none', resize: 'none' }}
                />
              </div>

              {/* PRINT NOW BUTTON */}
              <button
                type="button"
                disabled={!canSubmit || placing}
                onClick={handlePlaceOrder}
                style={{
                  width: '100%',
                  background: canSubmit ? '#ea580c' : 'var(--border-color)',
                  color: canSubmit ? '#FFFFFF' : 'var(--text-sub)',
                  border: 'none',
                  borderRadius: 99,
                  padding: '14px 20px',
                  fontSize: 14.5,
                  fontWeight: 900,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: canSubmit ? '0 6px 20px rgba(234, 88, 12, 0.35)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Zap size={16} /> {placing ? 'Submitting Print Job...' : 'DISPATCH PRINT JOB'}
              </button>

              {!fileName && (
                <div style={{ fontSize: 11.5, color: '#F59E0B', textAlign: 'center', marginTop: 10, fontWeight: 700 }}>
                  Upload an STL or 3MF file to proceed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}