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

async function testQueries() {
  console.log('--- Step 1: Testing DB Insert ---')
  const { data: profiles } = await supabase.from('profiles').select('id, full_name').limit(1)
  const profileId = profiles?.[0]?.id || '53880347-3f58-417c-9fe1-0ba89be1aef5'

  const payload = {
    designer_id: profileId,
    title: 'Dragon STL Test Model ' + Date.now(),
    description: 'High detail test dragon 3D STL',
    file_url: 'https://res.cloudinary.com/demo/raw/upload/v1/dragon.stl',
    thumbnail_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
    price: 199,
    tags: ['Toys & Games', 'stl', 'dragon.stl'],
    is_public: true,
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('designs')
    .insert(payload)
    .select()
    .single()

  console.log('CREATED DESIGN ID:', inserted?.id)
  console.log('INSERT ERROR:', insertErr?.message || null)

  if (!inserted?.id) return

  const id = inserted.id

  console.log('\n--- Step 2: Query WITH Foreign Key Join ---')
  const { data: joinedData, error: joinedErr } = await supabase
    .from('designs')
    .select('*, designer:profiles!designs_designer_id_fkey(id, full_name)')
    .eq('id', id)
    .maybeSingle()

  console.log('JOINED QUERY RESULT:', Boolean(joinedData))
  console.log('JOINED QUERY ERROR:', joinedErr)

  console.log('\n--- Step 3: Query WITHOUT Foreign Key Join ---')
  const { data: simpleData, error: simpleErr } = await supabase
    .from('designs')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  console.log('SIMPLE QUERY RESULT:', Boolean(simpleData))
  console.log('SIMPLE QUERY ERROR:', simpleErr?.message || null)
  if (simpleData) {
    console.log('SIMPLE DATA:', simpleData)
  }

  console.log('\n--- Step 4: Separate Designer Query ---')
  if (simpleData?.designer_id) {
    const { data: designerData, error: designerErr } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', simpleData.designer_id)
      .maybeSingle()

    console.log('DESIGNER RESULT:', designerData)
    console.log('DESIGNER ERROR:', designerErr?.message || null)
  }

  // Cleanup test row
  await supabase.from('designs').delete().eq('id', id)
  console.log('\nCleaned up test row!')
}

testQueries().catch((err) => {
  console.error('Test execution error:', err)
  process.exitCode = 1
})
