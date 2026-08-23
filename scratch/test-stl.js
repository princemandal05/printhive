try {
  const { STLLoader } = require('three/examples/jsm/loaders/STLLoader.js')
  console.log('STLLoader loaded successfully!')
} catch (e) {
  console.error('STLLoader error:', e.message)
  process.exitCode = 1
}
