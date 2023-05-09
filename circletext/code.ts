// Circular text sample code
// Turns a selected text node into a set of letters on a circular arc.


// Combines two transforms by doing a matrix multiplication.
// The first transform applied is a, followed by b, which
// is normally written b * a.
function multiply(a, b) {
  return [
    [ a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1], a[0][0] * b[0][2] + a[0][1] * b[1][2] + a[0][2] ],
    [ a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1] + 0, a[1][0] * b[0][2] + a[1][1] * b[1][2] + a[1][2] ]
  ]
}

// Creates a "move" transform.
function move(x, y) {
  return [
    [1, 0, x],
    [0, 1, y]
  ]
}

// Creates a "rotate" transform.
function rotate(theta) {
  return [
    [Math.cos(theta), Math.sin(theta), 0],
    [-Math.sin(theta), Math.cos(theta), 0]
  ]
}

// MAIN PLUGIN CODE

async function main(): Promise<string | undefined> {
  // Inter Regular is the font that objects will be created with by default in
  // Figma. We need to wait for fonts to load before creating text using them.
  await figma.loadFontAsync({ family: "Inter", style: "Regular" })

  // Make sure the selection is a single piece of text before proceeding.
  if (figma.currentPage.selection.length !== 1) {
    return "Select a single node."
  }

  const node = figma.currentPage.selection[0]
  if (node.type !== 'TEXT') {
    return "Select a single text node."
  }

  // Replace spaces with nonbreaking spaces.
  const text = node.characters.replace(/ /g, " ")
  let gap = 5

  // Create a new text node for each character, and
  // measure the total width.
  const nodes = []
  let width = 0
  for (let i = 0; i < text.length; i++) {
    const letterNode = figma.createText()
    letterNode.fontSize = node.fontSize
    letterNode.fontName = node.fontName

    letterNode.characters = text.charAt(i)
    width += letterNode.width
    if (i !== 0) {
      width += gap
    }
    node.parent.appendChild(letterNode)
    nodes.push(letterNode)
  }

  // Make the radius half the width of the original text, minus a bit.
  const r = node.width / 2 - 30
  const pi = 3.1415926

  // The arclength should be equal to the total desired width of the text,
  // => theta * r = width
  // => theta = width / r
  //
  // We define this angle such that 0 means pointing to the right, and pi/2 means
  // pointing straight up.
  //
  // Using these conventions, the starting angle for our curved text is
  // pi/2 + theta/2, and the ending angle is pi/2 - theta/2.

  let angle = pi / 2 + width / (2*r)
  const gapAngle = gap / r

  const centerX = node.x + node.width / 2
  const centerY = node.y + node.height / 2

  // Walk through each letter and position it on a circle of radius r.
  nodes.forEach(function (letterNode) {
    const stepAngle = letterNode.width / r

    // Move forward in our arc half a letter width.
    angle -= stepAngle / 2

    let width = letterNode.width
    let height = letterNode.height

    // Move the letter so that the center of its baseline is on the origin.
    // (estimate the baseline as being 70% down from the top of the box).
    //
    // We accomplish this by moving the letter so its top left is at (0, 0),
    // then moving the letter to the left and up by the appopriate amount.
    letterNode.x = 0
    letterNode.y = 0
    letterNode.relativeTransform = multiply(move(-width/2, -0.7 * height), letterNode.relativeTransform)

    // Rotate the letter. Because we want to have the rotation angle be 0 at the top of the circle,
    // we need to subtract pi/2 before applying the rotation to the text.
    letterNode.relativeTransform = multiply(rotate(angle - pi/2), letterNode.relativeTransform)

    // Move the letter to its position on the arc.
    let desiredX = centerX + r * Math.cos(angle)
    let desiredY = centerY - r * Math.sin(angle)
    letterNode.relativeTransform = multiply(move(desiredX, desiredY), letterNode.relativeTransform)

    // Move forward in our arc half a letter width + the gap
    angle -= stepAngle / 2 + gapAngle
  })

  // Put all nodes in a group!
  figma.group(nodes, node.parent)
}

main().then((message: string | undefined) => {
  figma.closePlugin(message)
})
