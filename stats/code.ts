let nodeCount = 0
const nodeTypeCounts = new Map<NodeType, number>()

async function initialize() {
  await figma.loadAllPagesAsync()
}

function visit(node) {
  nodeTypeCounts.set(node.type, 1 + (nodeTypeCounts.get(node.type) | 0))
  nodeCount++
  if (node.children) node.children.forEach(visit)
}

initialize();
visit(figma.root)

let text = `Node count: ${nodeCount}\n`
const nodeTypes = Array.from(nodeTypeCounts.entries())
nodeTypes.sort((a, b) => b[1] - a[1])
text += `Node types:` + nodeTypes.map(([k,v]) => `\n  ${k}: ${v}`).join('')

figma.showUI(`
  <span style="white-space:pre-wrap;">${text}</span>
`, {width: 500, height: 500})
