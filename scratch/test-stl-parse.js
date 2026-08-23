const { OBJLoader } = require('three/examples/jsm/loaders/OBJLoader.js')

const sampleObjText = `v 0 0 0
v 10 0 0
v 10 10 0
f 1 2 3`

const loader = new OBJLoader()
const group = loader.parse(sampleObjText)
console.log('OBJLoader parsed group children count:', group.children.length)
