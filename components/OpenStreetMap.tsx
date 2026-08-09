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
  locations?: MapLocation[]
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
  const pickerMarkerRef = useRef<any>(null)

  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [geoNotification, setGeoNotification] = useState<string | null>(null)

  // Safe coordinates validator
  const validCenter: [number, number] = (
    Array.isArray(center) && center.length === 2 && isValidIndiaCoord(center[0], center[1])
  ) ? center : [28.6139, 77.2090]

  // Filter out any invalid location entries using shared validator
  const validLocations = Array.isArray(locations)
    ? locations.filter((loc) => loc && isValidIndiaCoord(loc.lat, loc.lng))
    : []

  // 1. Dynamically Load Leaflet CSS and JS cleanly
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if ((window as any).L) {
      setLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.id = 'leaflet-js'
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setLoaded(true)
    script.onerror = () => setLoadError('Failed to load OpenStreetMap engine. Check internet connection.')
    document.head.appendChild(script)
  }, [])

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!loaded || !mapRef.current || mapInstanceRef.current) return
    const L = (window as any).L
    if (!L) return

    const indiaBounds = L.latLngBounds(
      L.latLng(6.5, 68.0),   // South-West India
      L.latLng(35.5, 97.5)   // North-East India
    )

    const map = L.map(mapRef.current, {
      maxBounds: indiaBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 4,
      maxZoom: 18,
    }).setView(validCenter, zoom)

    mapInstanceRef.current = map

    // Real OpenStreetMap Tile Layer + Mandatory OpenStreetMap Attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors | PrintHive India GPS',
    }).addTo(map)

    // Click listener for location picker mode
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

  // 3. Update Directory Markers or Draggable Picker Pin
  useEffect(() => {
    if (!loaded || !mapInstanceRef.current) return
    const L = (window as any).L
    if (!L) return

    const map = mapInstanceRef.current

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove()
      pickerMarkerRef.current = null
    }

    // Single Draggable Picker Pin Mode
    if (isPicker && validLocations.length > 0) {
      const pickerLoc = validLocations[0]
      const pickerIcon = L.divIcon({
        className: 'custom-picker-marker',
        html: `<div style="
          background: #FF6B35;
          color: #fff;
          border: 3px solid #fff;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 16px rgba(255,107,53,0.5);
          cursor: grab;
        ">📍</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      })

      const draggableMarker = L.marker([pickerLoc.lat, pickerLoc.lng], {
        icon: pickerIcon,
        draggable: true,
        title: 'Drag pin to set exact hub location',
      }).addTo(map)

      draggableMarker.bindPopup('📍 <strong>Selected Hub Location</strong><br/>Drag pin or click map to move position')

      draggableMarker.on('dragend', () => {
        const position = draggableMarker.getLatLng()
        if (onLocationPicked && isValidIndiaCoord(position.lat, position.lng)) {
          onLocationPicked(position.lat, position.lng)
        }
      })

      pickerMarkerRef.current = draggableMarker
      return
    }

    if (validLocations.length === 0) return

    // Directory Multi-Marker Rendering
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
        map.setView([activeLoc.lat, activeLoc.lng], 12, { animate: true })
      }
    }
  }, [loaded, validLocations, selectedId, isPicker])

  // Browser Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoNotification('Browser geolocation is not supported on this device.')
      return
    }

    setIsLocating(true)
    setGeoNotification(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        const userLat = Number(position.coords.latitude.toFixed(5))
        const userLng = Number(position.coords.longitude.toFixed(5))

        if (!isValidIndiaCoord(userLat, userLng)) {
          setGeoNotification(`Detected location (${userLat}, ${userLng}) is outside supported India region. Map centered over default India GPS bounds.`)
          return
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([userLat, userLng], 13, { duration: 1.2 })
        }

        if (onLocationPicked) {
          onLocationPicked(userLat, userLng)
        }

        setGeoNotification('✅ Map centered on your current location!')
        setTimeout(() => setGeoNotification(null), 4000)
      },
      (error) => {
        setIsLocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoNotification('⚠️ Location access denied. Click anywhere on the map or drag the pin to set your location manually.')
            break
          case error.POSITION_UNAVAILABLE:
            setGeoNotification('⚠️ GPS position unavailable. Please click on the map to set location.')
            break
          case error.TIMEOUT:
            setGeoNotification('⚠️ GPS request timed out. Please click on the map to set location.')
            break
          default:
            setGeoNotification('⚠️ Could not fetch location. Please pick location manually.')
            break
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 20, overflow: 'hidden', isolation: 'isolate', zIndex: 1 }}>
      {/* Map Engine Loading State */}
      {!loaded && !loadError && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: 14, fontWeight: 700, zIndex: 10 }}>
          🇮🇳 Loading OpenStreetMap Engine...
        </div>
      )}

      {/* Map Engine Load Error */}
      {loadError && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontSize: 14, fontWeight: 700, zIndex: 10, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
          <div>{loadError}</div>
        </div>
      )}

      {/* Empty Location Notice */}
      {loaded && !isPicker && validLocations.length === 0 && (
        <div style={{ position: 'absolute', top: 14, left: 16, zIndex: 1000, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '8px 14px', color: '#f8fafc', fontSize: 12, fontWeight: 700 }}>
          📍 No active printer hubs pinned in this view yet.
        </div>
      )}

      {/* Browser Geolocation Control Button */}
      {loaded && (
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 12,
            padding: '8px 14px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          <span>{isLocating ? '⏳' : '🎯'}</span>
          <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
        </button>
      )}

      {/* Geolocation Notification Toast Banner */}
      {geoNotification && (
        <div style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          right: 14,
          zIndex: 1000,
          background: geoNotification.includes('⚠️') ? 'rgba(239,68,68,0.92)' : 'rgba(16,185,129,0.92)',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 700,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{geoNotification}</span>
          <button
            type="button"
            onClick={() => setGeoNotification(null)}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
