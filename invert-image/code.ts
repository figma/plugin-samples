async function invertPaint(paint: Paint) {
  // Only invert the color for images (but you could do it
  // for solid paints and gradients if you wanted)
  if (paint.type === 'IMAGE') {
    // Paints reference images by their hash.
    const image = figma.getImageByHash(paint.imageHash)

    // Get the bytes for this image. However, the "bytes" in this
    // context refers to the bytes of file stored in PNG format. It
    // needs to be decoded into RGBA so that we can easily operate
    // on it.
    const bytes = await image.getBytesAsync()

    // Decoding to RGBA requires browser APIs that are only available
    // within an iframe. So we create an invisible iframe to act as
    // a "worker" which will do the task of decoding and send us a
    // message when it's done. This worker lives in `decoder.html`
    figma.showUI(__html__, { visible: false })

    // Send the raw bytes of the file to the worker
    figma.ui.postMessage(bytes)

    // Wait for the worker's response
    const newBytes: Uint8Array = await new Promise((resolve) => {
      figma.ui.onmessage = value => resolve(value as Uint8Array)
    })

    // Create a new paint for the new image. Uploading the image will give us
    // an image hash.
    const newPaint = {...paint}
    newPaint.imageHash = figma.createImage(newBytes).hash
    return newPaint
  }
  return paint
}

async function invertIfApplicable(node: SceneNode) {
  // Look for fills on node types that have fills.
  // An alternative would be to do `if ('fills' in node) { ... }
  if ('fills' in node) {
    // Create a new array of fills, because we can't directly modify the old one
    const newFills = []
    for (const paint of node.fills as Paint[]) {
      newFills.push(await invertPaint(paint))
    }
    node.fills = newFills
  }
}

// This plugin looks at all the currently selected nodes and inverts the colors
// in their image, if they use an image paint.
Promise.all(
  figma.currentPage.selection.map(selected => invertIfApplicable(selected))
).then(() => figma.closePlugin()).catch(() => {console.log("This operation failed")});