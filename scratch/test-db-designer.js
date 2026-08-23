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

async function testWithDesigner() {
  // Fetch sample profile
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, role').limit(1)
  console.log('PROFILES FOUND:', profiles)

  const designerId = profiles && profiles.length > 0 ? profiles[0].id : '00000000-0000-0000-0000-000000000000'

  const payload = {
    designer_id: designerId,
    title: 'Test Articulated Dragon ' + Date.now(),
    description: 'High detail test dragon 3D STL',
    price: 150,
    file_url: 'https://res.cloudinary.com/demo/raw/upload/v1/dragon.stl',
    preview_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
    status: 'approved',
    is_public: true,
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('designs')
    .insert(payload)
    .select()
    .single()

  console.log('INSERT WITH DESIGNER RESULT:', {
    success: Boolean(inserted),
    inserted,
    error: insertErr,
  })

  if (inserted?.id) {
    console.log('✅ SUCCESS! EXACT COLUMNS IN DESIGNS TABLE:', Object.keys(inserted))
    console.log('INSERTED ROW:', inserted)

    // Cleanup test row
    await supabase.from('designs').delete().eq('id', inserted.id)
    console.log('Cleaned up test row!')
  }
}

testWithDesigner()
