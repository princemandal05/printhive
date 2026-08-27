import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const query = searchParams.get('q')
  const type = searchParams.get('type') // 'reverse' | 'search' | 'ip'

  try {
    // 1. IP-Based Auto Geolocation
    if (type === 'ip' || (!lat && !lng && !query)) {
      const forwarded = request.headers.get('x-forwarded-for')
      const clientIp = forwarded ? forwarded.split(',')[0].trim() : ''

      // Fetch IP Geo location
      const ipRes = await fetch(`https://ipapi.co/${clientIp && clientIp !== '::1' && clientIp !== '127.0.0.1' ? `${clientIp}/` : ''}json/`, {
        headers: { 'User-Agent': 'PrintHive-GeoLocation/1.0' },
        next: { revalidate: 3600 },
      })

      if (ipRes.ok) {
        const ipData = await ipRes.json()
        return NextResponse.json({
          success: true,
          type: 'ip',
          lat: ipData.latitude || 28.6139,
          lng: ipData.longitude || 77.2090,
          city: ipData.city || 'New Delhi',
          region: ipData.region || 'Delhi',
          country: ipData.country_name || 'India',
          postal: ipData.postal || '110001',
        })
      }
    }

    // 2. Reverse Geocoding (Lat/Lng -> Formatted Indian Address)
    if (lat && lng) {
      const parsedLat = parseFloat(lat)
      const parsedLng = parseFloat(lng)

      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
      }

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${parsedLat}&lon=${parsedLng}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PrintHive-3DPrintingPlatform/1.0 (contact@printhive.app)',
            'Accept-Language': 'en-IN,en;q=0.9',
          },
          next: { revalidate: 86400 },
        }
      )

      if (res.ok) {
        const data = await res.json()
        const address = data.address || {}
        const city = address.city || address.town || address.village || address.suburb || address.county || ''
        const state = address.state || ''
        const postcode = address.postcode || ''
        const formatted = data.display_name || ''

        return NextResponse.json({
          success: true,
          type: 'reverse',
          lat: parsedLat,
          lng: parsedLng,
          formattedAddress: formatted,
          city,
          state,
          postcode,
          country: address.country || 'India',
        })
      }
    }

    // 3. Forward Geocoding (Address/City -> Lat/Lng)
    if (query) {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=5`,
        {
          headers: {
            'User-Agent': 'PrintHive-3DPrintingPlatform/1.0 (contact@printhive.app)',
            'Accept-Language': 'en-IN,en;q=0.9',
          },
          next: { revalidate: 86400 },
        }
      )

      if (res.ok) {
        const data = await res.json()
        return NextResponse.json({
          success: true,
          type: 'search',
          results: data.map((item: any) => ({
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          })),
        })
      }
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ error: error.message || 'Geocoding failed' }, { status: 500 })
  }
}
