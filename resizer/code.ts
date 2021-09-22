// The 'input' event listens for text change in the Quick Actions box after a plugin is 'Tabbed' into.
figma.parameters.on('input', ({query, key, result}: ParameterInputEvent) => {
  switch (key) {
    case 'width':
      const widthSizes = ['640', '800', '960', '1024', '1280']
      result.setSuggestions(widthSizes.filter(s => s.includes(query)))
      break
    case 'height':
      const heightSizes = ['480', '600', '720', '768', '960']
      result.setSuggestions(heightSizes.filter(s => s.includes(query)))
      break
    case 'scale': // Freeform parameter that doesn't need suggestions.
      result.setSuggestions([])
      break
    default:
      return
  }
})

// When the user presses Enter after inputting all parameters, the 'run' event is fired.
figma.on('run', ({parameters}: RunEvent) => {
  if (parameters) {
    startPluginWithParameters(parameters)
  }
})

function startPluginWithParameters(parameters: ParameterValues) {
  const selection = figma.currentPage.selection

  // Check if we're doing relative or absolute resize.
  if (parameters['scale']) {
    const scale = parseFloat(parameters['scale'])

    for (let i = 0; i < selection.length; i++) {
      const node = selection[i]
      if ('rescale' in node) {
        node.rescale(scale)
      }
    }
  } else if (parameters['width'] && parameters['height']) {
    const width = parseInt(parameters['width'])
    const height = parseInt(parameters['height'])

    for (let i = 0; i < selection.length; i++) {
      const node = selection[i]
      if ('resize' in node) {
        node.resize(width, height)
      }
    }
  }
  figma.closePlugin()
}
