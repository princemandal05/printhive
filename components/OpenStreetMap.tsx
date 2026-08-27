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
  center = [21.7679, 78.8718], // Geographical Center of India
  zoom = 5,
  isPicker = false,
  onLocationPicked,
  height = '400px',
}: OpenStreetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const markersMapRef = useRef<Record<string, any>>({})
  const pickerMarkerRef = useRef<any>(null)

  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [geoNotification, setGeoNotification] = useState<string | null>(null)
  const [geoNotificationType, setGeoNotificationType] = useState<'info' | 'error' | 'success'>('info')

  // Safe coordinates validator
  const validCenter: [number, number] = (
    Array.isArray(center) && center.length === 2 && isValidIndiaCoord(center[0], center[1])
  ) ? center : [21.7679, 78.8718]

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

    if ((window as unknown as { L?: unknown }).L) {
      Promise.resolve().then(() => setLoaded(true))
      return
    }

    const script = document.createElement('script')
    script.id = 'leaflet-js'
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setLoaded(true)
    script.onerror = () => setLoadError('Failed to load OpenStreetMap engine. Check internet connection.')
    document.head.appendChild(script)
  }, [])

  // 2. Initialize Leaflet Map locked to India bounds
  useEffect(() => {
    if (!loaded || !mapRef.current || mapInstanceRef.current) return
    const L = (window as any).L
    if (!L) return

    // Strict India Geographical Bounds (Kashmir to Kanyakumari, Gujarat to Arunachal)
    const indiaBounds = L.latLngBounds(
      L.latLng(6.5, 68.0),   // South-West
      L.latLng(37.5, 97.5)   // North-East
    )

    const map = L.map(mapRef.current, {
      maxBounds: indiaBounds,
      maxBoundsViscosity: 0.9,
      minZoom: 4,
      maxZoom: 18,
    })

    // Fit entire India map on initial mount
    map.fitBounds(indiaBounds, { padding: [15, 15] })

    mapInstanceRef.current = map

    // High-definition clean CartoDB Voyager cartography tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> | © <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a> | PrintHive India',
    }).addTo(map)

    // Force size recalculation so tiles align completely
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }, 150)

    // Click listener for location picker mode
    if (isPicker && onLocationPicked) {
      map.on('click', (e: any) => {
        if (e && e.latlng && isValidIndiaCoord(e.latlng.lat, e.latlng.lng)) {
          onLocationPicked(e.latlng.lat, e.latlng.lng)
          map.flyTo([e.latlng.lat, e.latlng.lng], Math.max(map.getZoom(), 15), { duration: 0.8 })
        }
      })
    }

    const onWindowResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }
    window.addEventListener('resize', onWindowResize)

    return () => {
      window.removeEventListener('resize', onWindowResize)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [loaded])

  // Sync center and zoom updates (e.g. Indian state navigation)
  useEffect(() => {
    if (mapInstanceRef.current && validCenter && !selectedId) {
      mapInstanceRef.current.flyTo(validCenter, zoom, { duration: 1.0 })
    }
  }, [validCenter[0], validCenter[1], zoom])

  // Invalidate size whenever height prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize()
      }, 100)
    }
  }, [height])

  // 3. Update Directory Markers or Draggable Picker Pin
  useEffect(() => {
    if (!loaded || !mapInstanceRef.current) return
    const L = (window as any).L
    if (!L) return

    const map = mapInstanceRef.current
    map.invalidateSize()

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    markersMapRef.current = {}

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
          background: #ea580c;
          color: #fff;
          border: 2px solid #fff;
          border-radius: 4px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 14px rgba(234,88,12,0.6);
          cursor: grab;
          transform: translate(-50%, -50%);
        ">📍</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
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

    // Sleek, Non-Overlapping Precision Marker Icons
    const createCustomIcon = (isSelected: boolean, loc: MapLocation) => {
      const cityName = (loc.location || '').split(',')[0].trim() || 'Hub'
      return L.divIcon({
        className: 'printhive-leaflet-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: ${isSelected ? '#ea580c' : 'rgba(15, 23, 42, 0.94)'};
            color: #fff;
            padding: 5px 12px 5px 8px;
            border-radius: 9999px;
            border: 2px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.4)'};
            box-shadow: ${isSelected ? '0 0 20px rgba(234,88,12,0.85)' : '0 4px 14px rgba(0,0,0,0.35)'};
            transform: translate(-50%, -50%);
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          ">
            <span style="font-size: 14px; line-height: 1;">🖨️</span>
            <span style="font-size: 12px; font-weight: 800; letter-spacing: 0.3px;">${cityName}</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      })
    }

    validLocations.forEach((loc) => {
      const isSelected = loc.id === selectedId
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createCustomIcon(isSelected, loc),
      }).addTo(map)

      // Rich Floating Glassmorphic Popup Card
      const popupHtml = `
        <div style="font-family: inherit; padding: 6px; color: #0F172A; min-width: 210px; border-radius: 16px;">
          <div style="font-weight: 900; font-size: 15px; margin-bottom: 4px; color: #0F172A; display: flex; align-items: center; gap: 6px;">
            <span>🖨️</span>
            <span>${loc.name || 'Printer Hub'}</span>
          </div>
          <div style="font-size: 12px; color: #64748B; margin-bottom: 8px;">📍 ${loc.location || 'India'}</div>
          ${loc.distance ? `<div style="font-size: 12px; font-weight: 800; color: #ea580c; margin-bottom: 4px;">🚀 ${loc.distance} from your location</div>` : ''}
          ${loc.machines ? `<div style="font-size: 12px; color: #475569; margin-bottom: 4px;">⚙️ ${loc.machines.join(', ')}</div>` : ''}
          ${loc.rating ? `<div style="font-size: 12px; font-weight: 800; color: #D97706;">⭐ ${loc.rating} Verified Rating</div>` : ''}
        </div>
      `
      marker.bindPopup(popupHtml)

      // Sleek Hover Tooltip
      marker.bindTooltip(`<strong>${loc.name}</strong><br/>${loc.location}`, {
        direction: 'top',
        offset: [0, -14],
        opacity: 0.95,
      })

      marker.on('click', () => {
        map.flyTo([loc.lat, loc.lng], 15, { duration: 1.0 })
        marker.openPopup()
        if (onSelectLocation) onSelectLocation(loc)
      })

      markersRef.current.push(marker)
      markersMapRef.current[loc.id] = marker
    })

    const activeMarker = selectedId ? markersMapRef.current[selectedId] : null
    const activeLoc = selectedId ? validLocations.find((l) => l.id === selectedId) : null

    if (activeMarker && activeLoc) {
      map.flyTo([activeLoc.lat, activeLoc.lng], 15, { duration: 1.0 })
      setTimeout(() => {
        activeMarker.openPopup()
      }, 500)
    } else if (validLocations.length > 1 && !selectedId) {
      const latLngs = validLocations.map((l) => [l.lat, l.lng])
      map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40], maxZoom: 11 })
    } else if (validLocations.length === 1) {
      map.flyTo([validLocations[0].lat, validLocations[0].lng], 14, { duration: 1.0 })
    }
  }, [loaded, locations, selectedId, isPicker])

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
          setGeoNotificationType('error')
          setGeoNotification(`Detected location (${userLat}, ${userLng}) is outside supported India region. Map centered over default India GPS bounds.`)
          return
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([userLat, userLng], 15, { duration: 1.2 })
        }

        if (onLocationPicked) {
          onLocationPicked(userLat, userLng)
        }

        setGeoNotificationType('success')
        setGeoNotification('✅ Map centered on your current location!')
        setTimeout(() => setGeoNotification(null), 4000)
      },
      (error) => {
        setIsLocating(false)
        setGeoNotificationType('error')
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoNotification('⚠️ Geolocation permission denied. Allow location access in browser.')
            break
          case error.POSITION_UNAVAILABLE:
            setGeoNotification('⚠️ Location information unavailable.')
            break
          case error.TIMEOUT:
            setGeoNotification('⚠️ Location request timed out.')
            break
          default:
            setGeoNotification('⚠️ Unable to retrieve your location.')
            break
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 24, overflow: 'hidden', isolation: 'isolate', zIndex: 1, border: '1px solid var(--border-color)', boxShadow: '0 12px 36px rgba(0,0,0,0.06)' }}>
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
        <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 1000, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9999, padding: '7px 16px', color: '#f8fafc', fontSize: 12, fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          📍 Nationwide India FabLab Network
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
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(10px)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 9999,
            padding: '8px 18px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            transition: 'all 0.2s ease',
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
          background: geoNotificationType === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(16,185,129,0.95)',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: 14,
          fontSize: 12,
          fontWeight: 700,
          boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{geoNotification}</span>
          <button
            type="button"
            onClick={() => setGeoNotification(null)}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', fontWeight: 800, paddingLeft: 12 }}
          >
            ✕
          </button>
        </div>
      )}

      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
