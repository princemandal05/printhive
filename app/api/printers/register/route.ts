import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required to register a 3D printer hub' }, { status: 401 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const {
      name,
      printer_model,
      technology,
      build_volume,
      max_resolution,
      base_price,
      working_hours,
      materials,
      address,
      city,
      latitude,
      longitude,
      image_url,
    } = body

    if (!name || typeof name !== 'string' || !name.trim() || !printer_model || typeof printer_model !== 'string' || !printer_model.trim()) {
      return NextResponse.json({ error: 'Printer name and model are required non-empty strings' }, { status: 400 })
    }

    let parsedPrice = 350
    if (base_price !== undefined && base_price !== null && base_price !== '') {
      const p = Number(base_price)
      if (!Number.isFinite(p) || p < 0) {
        return NextResponse.json({ error: 'base_price must be a finite non-negative number' }, { status: 400 })
      }
      parsedPrice = p
    }

    let parsedLat = 28.6139
    if (latitude !== undefined && latitude !== null && latitude !== '') {
      const lat = Number(latitude)
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        return NextResponse.json({ error: 'latitude must be a finite number between -90 and 90' }, { status: 400 })
      }
      parsedLat = lat
    }

    let parsedLng = 77.2090
    if (longitude !== undefined && longitude !== null && longitude !== '') {
      const lng = Number(longitude)
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        return NextResponse.json({ error: 'longitude must be a finite number between -180 and 180' }, { status: 400 })
      }
      parsedLng = lng
    }

    const { data: printer, error: insertError } = await supabase
      .from('printers')
      .insert({
        owner_id: user.id,
        name: name.trim(),
        printer_model: printer_model.trim(),
        technology: technology || 'FDM Dual-Color Precision',
        build_volume: build_volume || '256 x 256 x 256 mm',
        max_resolution: max_resolution || '0.05 mm',
        base_price: parsedPrice,
        working_hours: working_hours || '09:00 AM - 09:00 PM',
        materials: Array.isArray(materials) ? materials : ['PLA', 'PETG'],
        address: address || '',
        city: city || 'New Delhi',
        latitude: parsedLat,
        longitude: parsedLng,
        image_url: image_url || '',
        status: 'online',
        is_active: true,
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Printer hub insertion error:', insertError)
      return NextResponse.json({ error: 'Failed to register printer hub' }, { status: 500 })
    }

    // Atomically ensure profile role is set to printer_owner via admin client
    try {
      const adminSupabase = await createAdminClient()
      const { error: profileErr } = await adminSupabase
        .from('profiles')
        .update({ role: 'printer_owner' })
        .eq('id', user.id)

      if (profileErr) {
        console.error('Failed to update user profile role on printer registration:', profileErr)
      }
    } catch (adminErr) {
      console.error('Admin client error on printer registration role update:', adminErr)
    }

    return NextResponse.json({ success: true, printer }, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error in printer registration handler:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
