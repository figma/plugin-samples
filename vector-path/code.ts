const node = figma.createVector()

// This creates a triangle
node.vectorPaths = [{
  windingRule: 'EVENODD',
  data: 'M 0 100 L 100 100 L 50 0 Z',
}]

// Put the node in the center of the viewport so we can see it
node.x = figma.viewport.center.x - node.width / 2
node.y = figma.viewport.center.y - node.height / 2

figma.closePlugin()
