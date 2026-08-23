const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Parse .env.local manually
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

console.log('Supabase URL:', supabaseUrl)
console.log('Using Service Key:', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY))

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function testInsert() {
  console.log('Testing Supabase designs table query and insert...')
  
  // 1. Query existing designs table structure
  const { data: existing, error: selectErr } = await supabase.from('designs').select('*').limit(3)
  console.log('SELECT RESULT:', { count: existing?.length, error: selectErr?.message })
  if (existing && existing.length > 0) {
    console.log('Sample existing design row keys:', Object.keys(existing[0]))
    console.log('Sample existing design row:', existing[0])
  }

  // 2. Test inserting a design
  const testPayload = {
    title: 'Test STL Model ' + Date.now(),
    description: 'Test model for verification',
    category: 'Toys & Games',
    price: 100,
    file_url: 'https://res.cloudinary.com/demo/raw/upload/v1/sample.stl',
    file_name: 'sample.stl',
    file_format: 'stl',
    status: 'published',
    is_public: true,
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('designs')
    .insert(testPayload)
    .select()
    .single()

  console.log('INSERT RESULT:', {
    success: Boolean(inserted),
    id: inserted?.id,
    error: insertErr?.message || null,
    details: insertErr || null,
  })

  if (inserted?.id) {
    // Cleanup test row
    await supabase.from('designs').delete().eq('id', inserted.id)
    console.log('Test row cleaned up successfully!')
  }
}

testInsert().catch((err) => {
  console.error('Test execution error:', err)
  process.exitCode = 1
})
