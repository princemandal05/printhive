import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Role Authorization Check: Require seller or admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .maybeSingle()

    const userRole = profile?.role || 'buyer'
    if (userRole !== 'seller' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Only verified sellers or admins can create product listings' }, { status: 403 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 })
    }

    const { title, category, price, stock_quantity, images, materials, description } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required and must be a non-empty string' }, { status: 400 })
    }

    const parsedPrice = Number(price)
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'price must be a finite non-negative number' }, { status: 400 })
    }

    const parsedStock = Number(stock_quantity !== undefined ? stock_quantity : 0)
    if (!Number.isFinite(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
      return NextResponse.json({ error: 'stock_quantity must be a finite non-negative integer' }, { status: 400 })
    }

    const sellerName = profile?.full_name || user.email?.split('@')[0] || 'Seller'

    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        seller_id: user.id,
        seller_name: sellerName,
        title: title.trim(),
        category: category ? String(category) : 'General',
        price: parsedPrice,
        stock_quantity: parsedStock,
        images: Array.isArray(images) ? images : [],
        materials: Array.isArray(materials) ? materials : ['PLA'],
        description: description ? String(description) : '',
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Error creating product listing:', insertError)
      return NextResponse.json({ error: 'Failed to create product listing' }, { status: 500 })
    }

    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error in product create API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
