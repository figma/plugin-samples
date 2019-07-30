let nodeCount = 0
const nodeTypeCounts: Map<NodeType, number> = new Map

function visit(node) {
  nodeTypeCounts.set(node.type, 1 + (nodeTypeCounts.get(node.type) | 0))
  nodeCount++
  if (node.children) node.children.forEach(visit)
}

visit(figma.root)

let text = `Node count: ${nodeCount}\n`
let nodeTypes = Array.from(nodeTypeCounts.entries())
nodeTypes.sort((a, b) => b[1] - a[1])
text += `Node types:` + nodeTypes.map(([k,v]) => `\n  ${k}: ${v}`).join('')

figma.showUI(`
  <span style="white-space:pre-wrap;">${text}</span>
`, {width: 500, height: 500})
