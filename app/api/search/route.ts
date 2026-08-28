import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()

    if (!q || q.length < 2) {
      return NextResponse.json({
        success: true,
        query: q,
        results: {
          products: [],
          designs: [],
          printers: [],
        },
      })
    }

    const supabase = await createClient()

    // 1. Search products
    const { data: products } = await supabase
      .from('products')
      .select('id, title, name, price, image_url, category, seller, rating')
      .or(`title.ilike.%${q}%,name.ilike.%${q}%,category.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(6)

    // 2. Search 3D designs
    const { data: designs } = await supabase
      .from('designs')
      .select('id, title, price, thumbnail_url, preview_url, category, tags, rating')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(6)

    // 3. Search verified 3D print hubs
    const { data: printers } = await supabase
      .from('printers')
      .select('id, printer_model, name, address, base_price, rating')
      .or(`printer_model.ilike.%${q}%,address.ilike.%${q}%`)
      .limit(4)

    return NextResponse.json({
      success: true,
      query: q,
      results: {
        products: (products || []).map((p: any) => ({
          id: p.id,
          title: p.title || p.name || '3D Product',
          price: p.price,
          image: p.image_url,
          category: p.category,
          seller: p.seller,
          rating: p.rating,
          type: 'product',
          url: `/shop/${p.id}`,
        })),
        designs: (designs || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          price: d.price,
          image: d.thumbnail_url || d.preview_url,
          category: d.category || (Array.isArray(d.tags) ? d.tags[0] : '3D Design'),
          rating: d.rating,
          type: 'design',
          url: `/designs/${d.id}`,
        })),
        printers: (printers || []).map((pr: any) => ({
          id: pr.id,
          title: pr.printer_model || pr.name || 'Print Hub',
          basePrice: pr.base_price,
          address: pr.address,
          rating: pr.rating,
          type: 'printer',
          url: `/printers`,
        })),
      },
    })
  } catch (error: any) {
    console.error('Universal search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
