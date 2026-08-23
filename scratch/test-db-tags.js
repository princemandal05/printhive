const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const envPath = path.join(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      const key = match[1]
      let value = match[2] || ''
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
      process.env[key] = value
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, serviceKey)

async function testWithTags() {
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1)
  const designerId = profiles && profiles.length > 0 ? profiles[0].id : '53880347-3f58-417c-9fe1-0ba89be1aef5'

  const payload = {
    designer_id: designerId,
    title: 'Flexi Articulated Dragon 3D STL',
    description: 'High resolution articulated flexi dragon 3D STL model for FDM printing.',
    file_url: 'https://res.cloudinary.com/r8wjszjm/raw/upload/v1/printhive/dragon.stl',
    thumbnail_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
    price: 250,
    tags: ['Toys & Games', 'stl', 'dragon.stl'],
    is_public: true,
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('designs')
    .insert(payload)
    .select()
    .single()

  console.log('INSERT WITH TAGS RESULT:', {
    success: Boolean(inserted),
    insertedId: inserted?.id,
    error: insertErr?.message || null,
  })

  if (inserted?.id) {
    console.log('Inserted Row:', inserted)

    // Test querying the inserted row back
    const { data: fetched, error: fetchErr } = await supabase
      .from('designs')
      .select('*, designer:profiles!designs_designer_id_fkey(id, full_name)')
      .eq('id', inserted.id)
      .single()

    console.log('FETCH BACK RESULT:', {
      success: Boolean(fetched),
      fetchedId: fetched?.id,
      title: fetched?.title,
      file_url: fetched?.file_url,
      tags: fetched?.tags,
      designerName: fetched?.designer?.full_name,
      error: fetchErr?.message || null,
    })

    // Clean up test row
    await supabase.from('designs').delete().eq('id', inserted.id)
    console.log('Test row cleaned up!')
  }
}

testWithTags()
