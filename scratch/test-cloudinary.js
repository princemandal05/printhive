const cloudName = 'r8wjszjm'
const presetModel = 'printhive_models'
const presetImage = 'printhive_uploads'

async function testUnsignedModelUpload() {
  console.log('Testing UNSIGNED model upload with printhive_models preset...')
  const folder = 'printhive/test-user'
  const publicId = `model-${Date.now()}`

  const formData = new FormData()
  const blob = new Blob(['solid test_stl\n  facet normal 0 0 1\n    outer loop\n      vertex 0 0 0\n      vertex 1 0 0\n      vertex 1 1 0\n    endloop\n  endfacet\nendsolid test_stl'], { type: 'application/octet-stream' })
  formData.append('file', blob, 'test.stl')
  formData.append('upload_preset', presetModel)
  formData.append('folder', folder)
  formData.append('public_id', publicId)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    })
    const json = await res.json()
    console.log('Unsigned Model Upload HTTP Status:', res.status)
    console.log('Unsigned Model Upload Response:', JSON.stringify(json, null, 2))

    if (!res.ok) {
      throw new Error(`Upload HTTP ${res.status}: ${json.error?.message || 'Upload failed'}`)
    }
  } catch (err) {
    console.error('Fetch error in model upload:', err)
    throw err
  }
}

async function testUnsignedImageUpload() {
  console.log('Testing UNSIGNED image upload with printhive_uploads preset...')
  const folder = 'printhive/test-user'
  const publicId = `img-${Date.now()}`

  const formData = new FormData()
  // Valid 1x1 minimal JPEG byte sequence
  const validJpgBytes = new Uint8Array([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
    0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
    0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
    0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
    0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xd2, 0xcf, 0x20, 0xff, 0xd9,
  ])
  const blob = new Blob([validJpgBytes], { type: 'image/jpeg' })
  formData.append('file', blob, 'test.jpg')
  formData.append('upload_preset', presetImage)
  formData.append('folder', folder)
  formData.append('public_id', publicId)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    })
    const json = await res.json()
    console.log('Unsigned Image Upload HTTP Status:', res.status)
    console.log('Unsigned Image Upload Response:', JSON.stringify(json, null, 2))

    if (!res.ok) {
      throw new Error(`Upload HTTP ${res.status}: ${json.error?.message || 'Upload failed'}`)
    }
  } catch (err) {
    console.error('Fetch error in image upload:', err)
    throw err
  }
}

async function run() {
  try {
    await testUnsignedModelUpload()
    await testUnsignedImageUpload()
  } catch (err) {
    console.error('Test suite failed:', err)
    process.exitCode = 1
  }
}

run()
