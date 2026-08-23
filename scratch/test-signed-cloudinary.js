const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

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
const apiKey = process.env.CLOUDINARY_API_KEY || '769894611263915'
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'x1_w3QLL94hJFrt8xVkjJgMBuEs'

console.log('Testing Signed Cloudinary 3D Model Upload...')
console.log({ cloudName, apiKey, hasSecret: Boolean(apiSecret) })

// Create a valid STL file content
const stlContent = 'solid shark_stl_model\n  facet normal 0 0 1\n    outer loop\n      vertex 0 0 0\n      vertex 25 0 0\n      vertex 0 25 0\n    endloop\n  endfacet\nendsolid shark_stl_model'

async function testSignedModelUpload() {
  const timestamp = Math.round(Date.now() / 1000)
  const publicId = `shark_test_${Date.now()}`
  const folder = 'printhive/models'

  // Standard signed params for raw upload: folder, public_id, timestamp
  const strToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto.createHash('sha1').update(strToSign).digest('hex')

  const formData = new FormData()
  const blob = new Blob([Buffer.from(stlContent)], { type: 'application/octet-stream' })
  formData.append('file', blob, 'shark.stl')
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp.toString())
  formData.append('folder', folder)
  formData.append('public_id', publicId)
  formData.append('signature', signature)

  console.log('Sending Signed POST request to https://api.cloudinary.com/v1_1/' + cloudName + '/raw/upload...')

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    console.log(`Signed Response Status: ${res.status} ${res.statusText}`)
    console.log('CLOUDINARY SIGNED MODEL RESPONSE:', {
      status: res.status,
      ok: res.ok,
      secure_url: data.secure_url,
      public_id: data.public_id,
      resource_type: data.resource_type,
      format: data.format,
      bytes: data.bytes,
      error: data.error,
    })
    return { ok: res.ok, data }
  } catch (err) {
    console.error('Signed upload error:', err)
    return { ok: false, error: err }
  }
}

testSignedModelUpload()
