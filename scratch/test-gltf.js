async function testGLTFLoader() {
  try {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    if (typeof GLTFLoader !== 'function') {
      throw new Error('GLTFLoader export is not a function')
    }
    console.log('GLTFLoader imported and verified successfully!')
  } catch (err) {
    console.error('GLTFLoader error:', err)
    process.exitCode = 1
  }
}

testGLTFLoader()
