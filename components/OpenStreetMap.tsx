'use client'

import { useEffect, useRef, useState } from 'react'

export type MapLocation = {
  id: string
  name: string
  location: string
  distance?: string
  rating?: number
  machines?: string[]
  materials?: string[]
  lat: number
  lng: number
}

type OpenStreetMapProps = {
  locations: MapLocation[]
  selectedId?: string
  onSelectLocation?: (location: MapLocation) => void
  center?: [number, number]
  zoom?: number
  isPicker?: boolean
  onLocationPicked?: (lat: number, lng: number) => void
  height?: string | number
}

// Shared validator function for India coordinates
function isValidIndiaCoord(lat: any, lng: any): boolean {
  return (
    typeof lat === 'number' && Number.isFinite(lat) && lat >= 6.5 && lat <= 35.5 &&
    typeof lng === 'number' && Number.isFinite(lng) && lng >= 68.0 && lng <= 97.5
  )
}

export default function OpenStreetMap({
  locations = [],
  selectedId,
  onSelectLocation,
  center = [28.6139, 77.2090], // Default Center: New Delhi, India
  zoom = 6,
  isPicker = false,
  onLocationPicked,
  height = '420px',
}: OpenStreetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [loaded, setLoaded] = useState(false)

  // Safe coordinates validator
  const validCenter: [number, number] = (
    Array.isArray(center) && center.length === 2 && isValidIndiaCoord(center[0], center[1])
  ) ? center : [28.6139, 77.2090]

  // Filter out any invalid location entries using shared validator
  const validLocations = Array.isArray(locations)
    ? locations.filter((loc) => loc && isValidIndiaCoord(loc.lat, loc.lng))
    : []

  // 1. Dynamically Load Leaflet CSS and JS
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if Leaflet CSS already loaded
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Check if Leaflet JS already loaded
    if ((window as any).L) {
      setLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.id = 'leaflet-js'
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)
  }, [])

  // 2. Initialize Leaflet Map restricted strictly to India
  useEffect(() => {
    if (!loaded || !mapRef.current || mapInstanceRef.current) return
    const L = (window as any).L
    if (!L) return

    // Define Strict India Geographic Bounds
    const indiaBounds = L.latLngBounds(
      L.latLng(6.5, 68.0),   // South-West India
      L.latLng(35.5, 97.5)   // North-East India
    )

    // Initialize map bounded strictly to India
    const map = L.map(mapRef.current, {
      maxBounds: indiaBounds,
      maxBoundsViscosity: 1.0, // Prevents panning outside India
      minZoom: 4,
      maxZoom: 18,
    }).setView(validCenter, zoom)

    mapInstanceRef.current = map

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | PrintHive India GPS',
    }).addTo(map)

    // Handle map click for picker mode using shared coordinate validator
    if (isPicker && onLocationPicked) {
      map.on('click', (e: any) => {
        if (e && e.latlng && isValidIndiaCoord(e.latlng.lat, e.latlng.lng)) {
          onLocationPicked(e.latlng.lat, e.latlng.lng)
        }
      })
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [loaded])

  // 3. Update Markers when locations or selectedId changes
  useEffect(() => {
    if (!loaded || !mapInstanceRef.current) return
    const L = (window as any).L
    if (!L) return

    const map = mapInstanceRef.current

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (validLocations.length === 0) return

    // Custom India Marker Icon Generator
    const createCustomIcon = (isSelected: boolean) =>
      L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="
          background: ${isSelected ? '#FF6B35' : '#0F172A'};
          color: #fff;
          border: 2px solid #fff;
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.4);
          transform: scale(${isSelected ? 1.25 : 1});
          transition: transform 0.2s;
        ">🖨️</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      })

    validLocations.forEach((loc) => {
      const isSelected = loc.id === selectedId
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createCustomIcon(isSelected),
      }).addTo(map)

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; padding: 4px; color: #0F172A;">
          <div style="font-weight: 800; font-size: 14px; margin-bottom: 2px;">${loc.name || 'Printer Hub'}</div>
          <div style="font-size: 12px; color: #64748B; margin-bottom: 6px;">📍 ${loc.location || 'India'}</div>
          ${loc.distance ? `<div style="font-size: 11px; font-weight: 700; color: #FF6B35;">🚀 ${loc.distance}</div>` : ''}
          ${loc.machines ? `<div style="font-size: 11px; color: #475569; margin-top: 4px;">🖨️ ${loc.machines.join(', ')}</div>` : ''}
        </div>
      `
      marker.bindPopup(popupHtml)

      marker.on('click', () => {
        if (onSelectLocation) onSelectLocation(loc)
      })

      markersRef.current.push(marker)
    })

    if (selectedId) {
      const activeLoc = validLocations.find((l) => l.id === selectedId)
      if (activeLoc) {
        map.setView([activeLoc.lat, activeLoc.lng], 11, { animate: true })
      }
    }
  }, [loaded, validLocations, selectedId])

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 20, overflow: 'hidden', isolation: 'isolate', zIndex: 1 }}>
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: 14, fontWeight: 700, zIndex: 10 }}>
          🇮🇳 Loading India OpenStreetMap Engine...
        </div>
      )}
      {loaded && validLocations.length === 0 && (
        <div style={{ position: 'absolute', top: 14, left: 16, zIndex: 1000, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '8px 14px', color: '#f8fafc', fontSize: 12, fontWeight: 700 }}>
          📍 No active printer hubs pinned in this view yet.
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
