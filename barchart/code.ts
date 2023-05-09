figma.showUI(__html__)
figma.ui.onmessage = async (numbers) => {
  // Inter Regular is the font that objects will be created with by default in
  // Figma. We need to wait for fonts to load before creating text using them.
  await figma.loadFontAsync({ family: "Inter", style: "Regular" })

  const frameWidth = 800
  const frameHeight = 600
  const chartX = 25
  const chartY = 50
  const chartWidth = frameWidth - 50
  const chartHeight = frameHeight - 50

  const frame = figma.createFrame()
  frame.resizeWithoutConstraints(frameWidth, frameHeight)

  // Center the frame in our current viewport so we can see it.
  frame.x = figma.viewport.center.x - frameWidth / 2
  frame.y = figma.viewport.center.y - frameHeight / 2

  // Border for the chart
  const border = figma.createRectangle()
  frame.appendChild(border)
  border.resizeWithoutConstraints(frameWidth, frameHeight)
  border.strokeAlign = 'INSIDE'
  border.strokeWeight = 3
  border.fills = []
  border.strokes = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0} }]
  border.constraints = {horizontal: 'STRETCH', vertical: 'STRETCH'}

  // Line at the bottom of the chart
  const line = figma.createRectangle()
  frame.appendChild(line)
  line.x = chartX
  line.y = chartY + chartHeight
  line.resizeWithoutConstraints(chartWidth, 3)
  line.fills = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0} }]
  line.constraints = {horizontal: 'STRETCH', vertical: 'STRETCH'}

  const min = numbers.reduce((a, b) => Math.min(a, b), 0)
  const max = numbers.reduce((a, b) => Math.max(a, b), 0)

  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    const left = chartX + chartWidth * (i + 0.25) / numbers.length;
    const right = chartX + chartWidth * (i + 0.75) / numbers.length;
    const top = chartY + chartHeight - chartHeight * (Math.max(0, num) - min) / (max - min);
    const bottom = chartY + chartHeight - chartHeight * (Math.min(0, num) - min) / (max - min);

    // The column
    const column = figma.createRectangle()
    frame.appendChild(column)
    column.x = left
    column.y = top
    column.resizeWithoutConstraints(right - left, bottom - top)
    column.fills = [{ type: 'SOLID', color: {r: 1, g: 0, b: 0} }]
    column.constraints = {horizontal: 'STRETCH', vertical: 'STRETCH'}

    // The label
    const label = figma.createText()
    frame.appendChild(label)
    label.x = left - 50
    label.y = top - 50
    label.resizeWithoutConstraints(right - left + 100, 50)
    label.fills = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0} }]
    label.characters = num.toString()
    label.fontSize = 30
    label.textAlignHorizontal = 'CENTER'
    label.textAlignVertical = 'BOTTOM'
    label.constraints = {horizontal: 'STRETCH', vertical: 'STRETCH'}
  }

  figma.closePlugin()
}
