async function testSTLLoader() {
  try {
    const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js')
    if (typeof STLLoader !== 'function') {
      throw new Error('STLLoader export is not a valid constructor function')
    }
    console.log('STLLoader loaded and verified successfully!')
  } catch (e) {
    console.error('STLLoader error:', e.message || e)
    process.exitCode = 1
  }
}

testSTLLoader()
