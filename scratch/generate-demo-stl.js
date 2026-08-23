const fs = require('fs')
const path = require('path')

// Create public/models folder if it doesn't exist
const modelsDir = path.join(__dirname, '../public/models')
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true })
}

// Generate ASCII STL file for a 3D Polyhedron / Mechanical Cube / Bracket
function generateCubeStl() {
  const facets = [
    // Front face
    { normal: [0, 0, 1], v1: [-25, -25, 25], v2: [25, -25, 25], v3: [25, 25, 25] },
    { normal: [0, 0, 1], v1: [-25, -25, 25], v2: [25, 25, 25], v3: [-25, 25, 25] },
    // Back face
    { normal: [0, 0, -1], v1: [-25, -25, -25], v2: [-25, 25, -25], v3: [25, 25, -25] },
    { normal: [0, 0, -1], v1: [-25, -25, -25], v2: [25, 25, -25], v3: [25, -25, -25] },
    // Top face
    { normal: [0, 1, 0], v1: [-25, 25, -25], v2: [-25, 25, 25], v3: [25, 25, 25] },
    { normal: [0, 1, 0], v1: [-25, 25, -25], v2: [25, 25, 25], v3: [25, 25, -25] },
    // Bottom face
    { normal: [0, -1, 0], v1: [-25, -25, -25], v2: [25, -25, -25], v3: [25, -25, 25] },
    { normal: [0, -1, 0], v1: [-25, -25, -25], v2: [25, -25, 25], v3: [-25, -25, 25] },
    // Right face
    { normal: [1, 0, 0], v1: [25, -25, -25], v2: [25, 25, -25], v3: [25, 25, 25] },
    { normal: [1, 0, 0], v1: [25, -25, -25], v2: [25, 25, 25], v3: [25, -25, 25] },
    // Left face
    { normal: [-1, 0, 0], v1: [-25, -25, -25], v2: [-25, -25, 25], v3: [-25, 25, 25] },
    { normal: [-1, 0, 0], v1: [-25, -25, -25], v2: [-25, 25, 25], v3: [-25, 25, -25] },
  ]

  let lines = ['solid PrintHive_Demo_3D_Model']
  for (const f of facets) {
    lines.push(`  facet normal ${f.normal.join(' ')}`)
    lines.push('    outer loop')
    lines.push(`      vertex ${f.v1.join(' ')}`)
    lines.push(`      vertex ${f.v2.join(' ')}`)
    lines.push(`      vertex ${f.v3.join(' ')}`)
    lines.push('    endloop')
    lines.push('  endfacet')
  }
  lines.push('endsolid PrintHive_Demo_3D_Model')
  return lines.join('\n')
}

const stlContent = generateCubeStl()
const targetPath = path.join(modelsDir, 'demo.stl')
fs.writeFileSync(targetPath, stlContent, 'utf-8')
console.log('Successfully created valid 3D STL file at:', targetPath)
