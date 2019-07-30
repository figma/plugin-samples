const page = figma.currentPage;
const depthLimit = 5;

function visit(x, y, radius, depth, dir) {
  if (depth < depthLimit) {
    if (dir !== 'E') visit(x - radius * 3 / 2, y, radius / 2, depth + 1, 'W');
    if (dir !== 'W') visit(x + radius * 3 / 2, y, radius / 2, depth + 1, 'E');
    if (dir !== 'S') visit(x, y - radius * 3 / 2, radius / 2, depth + 1, 'N');
    if (dir !== 'N') visit(x, y + radius * 3 / 2, radius / 2, depth + 1, 'S');
  }
  const node = figma.createEllipse()
  node.x = x - radius
  node.y = y - radius
  node.resizeWithoutConstraints(2 * radius, 2 * radius)
  let fills: SolidPaint[] = [{
    type: 'SOLID',
    color: { r: 0.5 + x / 600, g: 0.5 + y / 600, b: 1 - depth / depthLimit }
  }]

  node.fills = fills

  page.appendChild(node)
}

visit(0, 0, 100, 0, null);
figma.closePlugin();
