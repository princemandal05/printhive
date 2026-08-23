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

async function inspectColumns() {
  // Test basic insert without 'category' column
  const testPayload = {
    title: 'Test Dragon Model ' + Date.now(),
    description: 'Test dragon 3D model for verification',
    price: 150,
    file_url: 'https://res.cloudinary.com/demo/raw/upload/v1/dragon.stl',
    file_name: 'dragon.stl',
    file_format: 'stl',
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('designs')
    .insert(testPayload)
    .select()
    .single()

  console.log('INSERT RESULT (No category):', {
    success: Boolean(inserted),
    insertedRow: inserted,
    error: insertErr,
  })

  if (inserted?.id) {
    console.log('Columns in designs table:', Object.keys(inserted))
    // Clean up test row
    await supabase.from('designs').delete().eq('id', inserted.id)
    console.log('Test row deleted!')
  }
}

inspectColumns()
