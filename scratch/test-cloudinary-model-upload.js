const fs = require('fs')
const path = require('path')

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

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'r8wjszjm'
const presetModels = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_MODELS || 'printhive_models'
const presetUploads = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'printhive_uploads'
const apiKey = process.env.CLOUDINARY_API_KEY || '769894611263915'
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'x1_w3QLL94hJFrt8xVkjJgMBuEs'

console.log('Testing Cloudinary Model Upload to Cloud:', cloudName)
console.log('Using Presets:', { presetModels, presetUploads })

// Create a dummy STL file buffer
const stlHeader = 'solid shark_test_model\n  facet normal 0 0 1\n    outer loop\n      vertex 0 0 0\n      vertex 10 0 0\n      vertex 0 10 0\n    endloop\n  endfacet\nendsolid shark_test_model'
const fileBlob = Buffer.from(stlHeader, 'utf-8')

async function testUploadEndpoint(endpoint, presetName) {
  console.log(`\n--- Testing Endpoint: ${endpoint} with Preset: ${presetName} ---`)
  const formData = new FormData()
  const blob = new Blob([fileBlob], { type: 'application/octet-stream' })
  formData.append('file', blob, 'shark_test.stl')
  formData.append('upload_preset', presetName)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}/upload`, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    console.log(`Response Status: ${res.status} ${res.statusText}`)
    console.log('Cloudinary Result:', data)
    return { ok: res.ok, data }
  } catch (err) {
    console.error('Fetch error:', err)
    return { ok: false, error: err }
  }
}

async function runTests() {
  // Test 1: auto endpoint with printhive_models
  await testUploadEndpoint('auto', presetModels)

  // Test 2: raw endpoint with printhive_models
  await testUploadEndpoint('raw', presetModels)

  // Test 3: auto endpoint with printhive_uploads
  await testUploadEndpoint('auto', presetUploads)

  // Test 4: raw endpoint with printhive_uploads
  await testUploadEndpoint('raw', presetUploads)
}

runTests()
