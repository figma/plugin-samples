figma.showUI(__html__)
figma.ui.onmessage = numbers => {
  const width = 100
  const height = 100

  const frame = figma.createFrame()
  figma.currentPage.appendChild(frame)
  frame.resizeWithoutConstraints(width, height)

  numbers = numbers.map(x => Math.max(0, x))
  const total = numbers.reduce((a, b) => a + b, 0)
  let start = 0;

  for (const num of numbers) {
    const c = Math.sqrt(start / total)
    const ellipse = figma.createEllipse()
    frame.appendChild(ellipse)
    ellipse.resizeWithoutConstraints(width, height)
    ellipse.fills = [{ type: 'SOLID', color: {r: c, g: c, b: c} }]
    ellipse.constraints = {horizontal: 'STRETCH', vertical: 'STRETCH'}
    ellipse.arcData = {
      startingAngle: (start / total - 0.25) * 2 * Math.PI,
      endingAngle: ((start + num) / total - 0.25) * 2 * Math.PI,
      innerRadius: 0,
    }
    start += num
  }

  figma.closePlugin()
}
