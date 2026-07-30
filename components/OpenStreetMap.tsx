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

export default function OpenStreetMap({
  locations,
  selectedId,
  onSelectLocation,
  center = [20.5937, 78.9629], // Default India Center
  zoom = 5,
  isPicker = false,
  onLocationPicked,
  height = '360px',
}: OpenStreetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [loaded, setLoaded] = useState(false)

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

  // 2. Initialize Leaflet Map once loaded
  useEffect(() => {
    if (!loaded || !mapRef.current || mapInstanceRef.current) return
    const L = (window as any).L
    if (!L) return

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom)
    mapInstanceRef.current = map

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | PrintHive GPS',
    }).addTo(map)

    // Handle map click for picker mode
    if (isPicker && onLocationPicked) {
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        onLocationPicked(lat, lng)
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

    if (locations.length === 0) return

    const bounds = L.latLngBounds([])

    // Custom Icon Generator
    const createCustomIcon = (isSelected: boolean) =>
      L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="
          background: ${isSelected ? '#FF6B35' : '#1E293B'};
          color: #fff;
          border: 2px solid #fff;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          transform: scale(${isSelected ? 1.2 : 1});
          transition: transform 0.2s;
        ">🖨️</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

    locations.forEach((loc) => {
      const isSelected = loc.id === selectedId
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createCustomIcon(isSelected),
      }).addTo(map)

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; padding: 4px; color: #0F172A;">
          <div style="font-weight: 800; font-size: 14px; margin-bottom: 2px;">${loc.name}</div>
          <div style="font-size: 12px; color: #64748B; margin-bottom: 6px;">📍 ${loc.location}</div>
          ${loc.distance ? `<div style="font-size: 11px; font-weight: 700; color: #FF6B35;">🚀 ${loc.distance}</div>` : ''}
          ${loc.machines ? `<div style="font-size: 11px; color: #475569; margin-top: 4px;">🖨️ ${loc.machines.join(', ')}</div>` : ''}
        </div>
      `
      marker.bindPopup(popupHtml)

      marker.on('click', () => {
        if (onSelectLocation) onSelectLocation(loc)
      })

      markersRef.current.push(marker)
      bounds.extend([loc.lat, loc.lng])
    })

    // Fit map to bounds if multiple locations exist
    if (locations.length > 1 && !isPicker) {
      map.fitBounds(bounds, { padding: [40, 40] })
    } else if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 13)
    }
  }, [loaded, locations, selectedId])

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 20, overflow: 'hidden' }}>
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: 14, fontWeight: 700 }}>
          🗺️ Loading OpenStreetMap & Leaflet Engine...
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
