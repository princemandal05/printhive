import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 })
    }

    const { title, category, price, stock_quantity, images, materials, description } = body

    const { data: existingProduct, error: fetchErr } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr) {
      console.error('Error fetching product for PATCH:', fetchErr)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'

    if (existingProduct.seller_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not own this product' }, { status: 403 })
    }

    const updateData: Record<string, any> = {}

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return NextResponse.json({ error: 'title must be a non-empty string' }, { status: 400 })
      }
      updateData.title = title.trim()
    }

    if (category !== undefined) {
      updateData.category = String(category)
    }

    if (price !== undefined) {
      const p = Number(price)
      if (!Number.isFinite(p) || p < 0) {
        return NextResponse.json({ error: 'price must be a finite non-negative number' }, { status: 400 })
      }
      updateData.price = p
    }

    if (stock_quantity !== undefined) {
      const sq = Number(stock_quantity)
      if (!Number.isFinite(sq) || sq < 0 || !Number.isInteger(sq)) {
        return NextResponse.json({ error: 'stock_quantity must be a non-negative integer' }, { status: 400 })
      }
      updateData.stock_quantity = sq
    }

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return NextResponse.json({ error: 'images must be an array of image URLs' }, { status: 400 })
      }
      updateData.images = images
    }

    if (materials !== undefined) {
      if (!Array.isArray(materials)) {
        return NextResponse.json({ error: 'materials must be an array of strings' }, { status: 400 })
      }
      updateData.materials = materials
    }

    if (description !== undefined) {
      updateData.description = String(description)
    }

    // Early guard: Check if payload contains any valid updatable fields
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No updatable product fields provided in request' }, { status: 400 })
    }

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating product record:', updateError)
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error: any) {
    console.error('Unexpected error in product PATCH API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existingProduct, error: fetchErr } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr) {
      console.error('Error fetching product for DELETE:', fetchErr)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'

    if (existingProduct.seller_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not own this product' }, { status: 403 })
    }

    const { error: deleteError } = await supabase.from('products').delete().eq('id', id)

    if (deleteError) {
      console.error('Error deleting product record:', deleteError)
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error: any) {
    console.error('Unexpected error in product DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
