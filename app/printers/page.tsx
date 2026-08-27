'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import type { MapLocation } from '@/components/OpenStreetMap'
import { createClient } from '@/utils/supabase/client'
import { calculateHaversineDistance, formatDistance } from '@/utils/location'

const OpenStreetMap = dynamic(() => import('@/components/OpenStreetMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', minHeight: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', color: 'var(--text-sub)', fontSize: 14, fontWeight: 800, borderRadius: 4, border: '1px solid var(--border-color)' }}>
      🗺️ Initializing India OpenStreetMap GPS Engine...
    </div>
  ),
})

export type PrinterHub = MapLocation & {
  state?: string
  model?: string
  technology?: string
  materials?: string[]
  status?: 'online' | 'busy' | 'offline' | string
  price?: number
  base_price?: number
  working_hours?: string
  max_resolution?: string
  completedOrders?: number
  city?: string
  calculatedDistanceKm?: number
  formattedDistance?: string
}

function PrinterDirectoryContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const preselectedPrinterId = searchParams?.get('printer_id')

  const [printers, setPrinters] = useState<PrinterHub[]>([])
  const [selectedHub, setSelectedHub] = useState<PrinterHub | null>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeChip, setActiveChip] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Filter States
  const [filterMaxDistance, setFilterMaxDistance] = useState<number | 'All'>('All')
  const [filterMaterial, setFilterMaterial] = useState('All')
  const [filterTechnology, setFilterTechnology] = useState('All')
  const [filterMaxPrice, setFilterMaxPrice] = useState<number | 'All'>('All')
  const [filterMinRating, setFilterMinRating] = useState<number | 'All'>('All')
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false)

  // Fetch real registered printers from Supabase database
  useEffect(() => {
    async function loadPrinters() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('printers').select('*')

        if (error) {
          console.error('Error fetching registered printers:', error.message)
        } else if (data && data.length > 0) {
          const mapped: PrinterHub[] = data
            .filter((item) => {
              const lat = Number(item.latitude)
              const lng = Number(item.longitude)
              return item.latitude !== null && item.longitude !== null && Number.isFinite(lat) && Number.isFinite(lng)
            })
            .map((item) => ({
              id: item.id || `printer-${Math.random()}`,
              name: item.printer_model || item.name || '3D Printer Hub',
              model: item.printer_model || 'FDM Precision',
              technology: item.technology || 'FDM Dual-Color Precision',
              location: item.address || 'India GPS Location',
              state: item.state || '',
              lat: Number(item.latitude),
              lng: Number(item.longitude),
              materials: item.materials || ['PLA', 'PETG'],
              base_price: item.base_price || 350,
              price: item.base_price || 350,
              status: item.status || (item.is_active ? 'online' : 'offline'),
              working_hours: item.working_hours || '09:00 AM - 09:00 PM',
              rating: item.rating || 5.0,
              completedOrders: item.completed_orders || 0,
              city: item.city || '',
            }))

          setPrinters(mapped)

          if (preselectedPrinterId) {
            const preselected = mapped.find((p) => p.id === preselectedPrinterId)
            if (preselected) {
              setSelectedHub(preselected)
            }
          }
        } else {
          setPrinters([])
        }
      } catch (err: unknown) {
        console.error('Printer loading exception:', err)
        setPrinters([])
      } finally {
        setLoading(false)
      }
    }

    loadPrinters()
  }, [preselectedPrinterId])

  // Distance calculation
  const processedPrinters = useMemo(() => {
    return printers.map((printer) => {
      if (userCoords) {
        const distKm = calculateHaversineDistance(userCoords.lat, userCoords.lng, printer.lat, printer.lng)
        return {
          ...printer,
          calculatedDistanceKm: distKm,
          formattedDistance: formatDistance(distKm),
          distance: formatDistance(distKm),
        }
      }
      return printer
    })
  }, [printers, userCoords])

  // Multi-Filter & Search Pipeline
  const filteredPrinters = useMemo(() => {
    return processedPrinters.filter((p) => {
      // 1. Text Search (city, name, model, material)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = p.name.toLowerCase().includes(q)
        const matchModel = (p.model || '').toLowerCase().includes(q)
        const matchLocation = p.location.toLowerCase().includes(q)
        const matchMaterial = p.materials?.some((m) => m.toLowerCase().includes(q))
        if (!matchName && !matchModel && !matchLocation && !matchMaterial) return false
      }

      // 2. Quick Chip Filters
      if (activeChip === 'online' && p.status !== 'online') return false
      if (activeChip === 'fdm' && !p.technology?.toLowerCase().includes('fdm')) return false
      if (activeChip === 'resin' && !p.technology?.toLowerCase().includes('sla') && !p.technology?.toLowerCase().includes('resin')) return false
      if (activeChip === 'near' && p.calculatedDistanceKm !== undefined && p.calculatedDistanceKm > 25) return false

      // 3. Dropdown Filters
      if (filterMaxDistance !== 'All' && p.calculatedDistanceKm !== undefined && p.calculatedDistanceKm > filterMaxDistance) {
        return false
      }
      if (filterMaterial !== 'All' && (!p.materials || !p.materials.some((m) => m.toLowerCase().includes(filterMaterial.toLowerCase())))) {
        return false
      }
      if (filterTechnology !== 'All' && (!p.technology || !p.technology.toLowerCase().includes(filterTechnology.toLowerCase()))) {
        return false
      }
      if (filterMaxPrice !== 'All' && (p.base_price || 0) > filterMaxPrice) {
        return false
      }
      if (filterMinRating !== 'All' && (p.rating || 0) < filterMinRating) {
        return false
      }

      return true
    })
  }, [processedPrinters, searchQuery, activeChip, filterMaxDistance, filterMaterial, filterTechnology, filterMaxPrice, filterMinRating])

  // Sorting
  const sortedPrinters = useMemo(() => {
    return [...filteredPrinters].sort((a, b) => {
      const availWeight = (status?: string) => (status === 'online' ? 1 : status === 'busy' ? 2 : 3)
      const statusDiff = availWeight(a.status) - availWeight(b.status)
      if (statusDiff !== 0) return statusDiff

      if (a.calculatedDistanceKm !== undefined && b.calculatedDistanceKm !== undefined) {
        const distDiff = a.calculatedDistanceKm - b.calculatedDistanceKm
        if (Math.abs(distDiff) > 0.01) return distDiff
      }

      return (b.rating || 0) - (a.rating || 0)
    })
  }, [filteredPrinters])

  const handleLocationPicked = (lat: number, lng: number) => {
    setUserCoords({ lat, lng })
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'online':
        return (
          <span style={{ background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800, border: '1px solid #A7F3D0', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
            Ready for Orders
          </span>
        )
      case 'busy':
        return (
          <span style={{ background: '#FEF3C7', color: '#D97706', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800, border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
            In Queue (~2h)
          </span>
        )
      default:
        return (
          <span style={{ background: '#FEF2F2', color: '#DC2626', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800, border: '1px solid #FCA5A5', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
            Offline
          </span>
        )
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', transition: 'background 0.3s ease' }}>
      <Navbar />

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 20px' }}>
        {/* HEADER BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(234,88,12,0.1)', color: '#ea580c', border: '1px solid rgba(234,88,12,0.2)', padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              ⚡ Real-Time FabLab Network
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              Nearby 3D Printer Hubs
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: 14, margin: 0 }}>
              Connect with nearby verified 3D printer owners. Upload your model or choose a machine for fast local dispatch.
            </p>
          </div>

          <Link
            href="/printers/register"
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: 4,
              fontWeight: 800,
              fontSize: 13,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 14px rgba(234,88,12,0.25)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            <span>🖨️</span>
            <span>+ Register Your Machine →</span>
          </Link>
        </div>

        {/* SEARCH & QUICK CHIPS BAR */}
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 4, border: '1px solid var(--border-color)', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Search by city, machine (Bambu, Prusa), or material (PLA, Resin)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 4,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: 'var(--text-main)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontWeight: 600,
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', fontWeight: 800 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFiltersDrawer((prev) => !prev)}
              style={{
                background: showFiltersDrawer ? '#ea580c' : 'var(--bg-card-hover)',
                color: showFiltersDrawer ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 4,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <span>⚙️ Filters</span>
              <span style={{ fontSize: 11, background: showFiltersDrawer ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)', padding: '1px 6px', borderRadius: 3 }}>
                {filterMaxDistance !== 'All' || filterMaterial !== 'All' || filterTechnology !== 'All' || filterMaxPrice !== 'All' ? 'Active' : 'All'}
              </span>
            </button>
          </div>

          {/* Quick Filter Chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {[
              { id: 'all', label: '🔥 All Hubs' },
              { id: 'online', label: '🟢 Online & Ready' },
              { id: 'fdm', label: '🎨 Multi-Color FDM' },
              { id: 'resin', label: '🔬 High-Detail Resin' },
              { id: 'near', label: '🚀 Near Me (<25 km)' },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveChip(chip.id)}
                style={{
                  background: activeChip === chip.id ? 'var(--text-main)' : 'var(--bg-card-hover)',
                  color: activeChip === chip.id ? 'var(--bg-canvas)' : 'var(--text-sub)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 4,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Expandable Advanced Filters Drawer */}
          {showFiltersDrawer && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 4 }}>
                  📍 Max Distance
                </label>
                <select
                  value={filterMaxDistance}
                  onChange={(e) => setFilterMaxDistance(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                  style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: 'var(--text-main)', fontWeight: 700 }}
                >
                  <option value="All">Any Distance</option>
                  <option value="5">&lt; 5 km</option>
                  <option value="15">&lt; 15 km</option>
                  <option value="50">&lt; 50 km</option>
                  <option value="100">&lt; 100 km</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 4 }}>
                  🧵 Material
                </label>
                <select
                  value={filterMaterial}
                  onChange={(e) => setFilterMaterial(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: 'var(--text-main)', fontWeight: 700 }}
                >
                  <option value="All">All Materials</option>
                  <option value="PLA">PLA</option>
                  <option value="PETG">PETG</option>
                  <option value="ABS">ABS</option>
                  <option value="TPU">TPU (Flexible)</option>
                  <option value="Resin">Resin</option>
                  <option value="Carbon">Carbon Fiber</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 4 }}>
                  🖨️ Technology
                </label>
                <select
                  value={filterTechnology}
                  onChange={(e) => setFilterTechnology(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: 'var(--text-main)', fontWeight: 700 }}
                >
                  <option value="All">All Technologies</option>
                  <option value="FDM">FDM Precision</option>
                  <option value="SLA">SLA Resin</option>
                  <option value="SLS">SLS Industrial</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 4 }}>
                  💰 Max Price
                </label>
                <select
                  value={filterMaxPrice}
                  onChange={(e) => setFilterMaxPrice(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                  style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: 'var(--text-main)', fontWeight: 700 }}
                >
                  <option value="All">Any Price</option>
                  <option value="300">&lt; ₹300 / job</option>
                  <option value="400">&lt; ₹400 / job</option>
                  <option value="600">&lt; ₹600 / job</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 4 }}>
                  ★ Min Rating
                </label>
                <select
                  value={filterMinRating}
                  onChange={(e) => setFilterMinRating(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                  style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: 'var(--text-main)', fontWeight: 700 }}
                >
                  <option value="All">Any Rating</option>
                  <option value="4.9">4.9+ ★</option>
                  <option value="4.5">4.5+ ★</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 🌟 2-COLUMN AIRBNB-STYLE SPLIT SCREEN LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
          
          {/* LEFT COLUMN: SCROLLABLE HUBS DIRECTORY FEED */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>
                {sortedPrinters.length} Verified Print Hubs Found
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600 }}>
                Auto-sorted by Availability & Distance
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', borderRadius: 4, border: '1px solid var(--border-color)', color: 'var(--text-sub)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>Loading Live 3D Printer Hubs…</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Connecting to PrintHive India GPS Network</div>
              </div>
            ) : sortedPrinters.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', borderRadius: 4, border: '1px dashed var(--border-color)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🖨️</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', marginBottom: 6 }}>
                  {printers.length === 0 ? 'No Registered Printer Hubs Yet' : 'No Hubs Match Your Search Filters'}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-sub)', maxWidth: 460, margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                  {printers.length === 0
                    ? 'Be the first print farm or maker in your area to list your machine on the India OpenStreetMap and receive local print jobs.'
                    : 'Try expanding your search query, adjusting your max distance, or resetting your filter criteria.'}
                </p>
                {printers.length === 0 ? (
                  <Link
                    href="/printers/register"
                    style={{
                      background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 22px',
                      borderRadius: 4,
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      boxShadow: '0 4px 14px rgba(234,88,12,0.3)',
                    }}
                  >
                    <span>🖨️</span>
                    <span>+ Register Your 3D Printer Now →</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setActiveChip('all')
                      setFilterMaxDistance('All')
                      setFilterMaterial('All')
                      setFilterTechnology('All')
                      setFilterMaxPrice('All')
                      setFilterMinRating('All')
                    }}
                    style={{ background: '#ea580c', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 4, fontWeight: 800, cursor: 'pointer', fontSize: 13 }}
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {sortedPrinters.map((printer) => {
                  const isSelected = selectedHub && printer.id === selectedHub.id

                  return (
                    <div
                      key={printer.id}
                      onClick={() => setSelectedHub(printer)}
                      style={{
                        background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                        borderRadius: 4,
                        border: isSelected ? '2px solid #ea580c' : '1px solid var(--border-color)',
                        padding: 18,
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 4px 20px rgba(234,88,12,0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Top Row: Name, City & Status Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', marginBottom: 2 }}>
                            {printer.name}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>📍 {printer.location}</span>
                            {printer.distance && (
                              <span style={{ color: '#ea580c', fontWeight: 800 }}>• 🚀 {printer.distance}</span>
                            )}
                          </div>
                        </div>

                        <div>
                          {getStatusBadge(printer.status)}
                        </div>
                      </div>

                      {/* Specs & Performance */}
                      <div style={{ display: 'flex', gap: 12, marginTop: 10, marginBottom: 12, fontSize: 12, color: 'var(--text-sub)', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, color: '#F59E0B' }}>★ {printer.rating || '4.9'} ({printer.completedOrders || 50}+ jobs)</span>
                        <span>•</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>⚙️ {printer.technology}</span>
                        <span>•</span>
                        <span>⏱️ {printer.working_hours || '09:00 AM - 09:00 PM'}</span>
                      </div>

                      {/* Material Tags */}
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                        {printer.materials?.map((m: string) => (
                          <span
                            key={m}
                            style={{
                              background: 'var(--bg-card-hover)',
                              border: '1px solid var(--border-color)',
                              padding: '2px 8px',
                              borderRadius: 3,
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--text-main)',
                            }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>

                      {/* Bottom Row: Starting Price & Order Button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                        <div>
                          <span style={{ fontSize: 11, color: 'var(--text-sub)', display: 'block' }}>Base Rate</span>
                          <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)' }}>
                            ₹{printer.base_price || 350} <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)' }}>/ job</span>
                          </span>
                        </div>

                        <Link
                          href={`/print-on-demand?printer_id=${printer.id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            background: isSelected ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' : '#ea580c',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: 4,
                            fontWeight: 800,
                            fontSize: 12,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 2px 10px rgba(234,88,12,0.25)',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          <span>⚡ Request Print →</span>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY INTERACTIVE OPENSTREETMAP PANE */}
          <div style={{ position: 'sticky', top: 90, height: 'calc(100vh - 120px)', minHeight: 560, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <OpenStreetMap
              locations={sortedPrinters}
              selectedId={selectedHub?.id}
              onSelectLocation={(loc) => setSelectedHub(loc as PrinterHub)}
              onLocationPicked={handleLocationPicked}
              center={userCoords ? [userCoords.lat, userCoords.lng] : [21.7679, 78.8718]}
              zoom={userCoords ? 14 : 5}
              height="100%"
            />
          </div>

        </div>
      </div>

      <Footer />
    </main>
  )
}

export default function PrinterDirectoryPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>🖨️ Loading 3D Printer Hub Directory…</div>
      </main>
    }>
      <PrinterDirectoryContent />
    </Suspense>
  )
}
