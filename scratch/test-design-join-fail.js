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
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const adminSupabase = createClient(supabaseUrl, serviceKey)
const anonSupabase = createClient(supabaseUrl, anonKey)

async function testJoinBehavior() {
  const payload = {
    designer_id: '53880347-3f58-417c-9fe1-0ba89be1aef5',
    title: 'Dragon STL Join Test ' + Date.now(),
    file_url: 'https://res.cloudinary.com/demo/raw/upload/v1/dragon.stl',
  }

  const { data: inserted } = await adminSupabase.from('designs').insert(payload).select().single()
  const id = inserted.id

  console.log('Inserted ID:', id)

  // Test anon client query WITH join
  const { data: anonJoined, error: anonJoinedErr } = await anonSupabase
    .from('designs')
    .select('*, designer:profiles!designs_designer_id_fkey(id, full_name)')
    .eq('id', id)
    .maybeSingle()

  console.log('ANON JOINED RESULT:', Boolean(anonJoined), anonJoinedErr)

  // Test admin client query WITHOUT join
  const { data: adminSimple, error: adminSimpleErr } = await adminSupabase
    .from('designs')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  console.log('ADMIN SIMPLE RESULT:', Boolean(adminSimple), adminSimpleErr)

  await adminSupabase.from('designs').delete().eq('id', id)
}

testJoinBehavior()
