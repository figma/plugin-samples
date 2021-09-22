// The 'input' event listens for text change in the Quick Actions box after a plugin is 'Tabbed' into.
figma.parameters.on('input', ({query, key, result}: ParameterInputEvent) => {
  if (figma.currentPage.selection.length === 0) {
    result.setError('Please select one or mode nodes first')
    return
  }

  switch (key) {
    case 'width':
      const widthSizes = ['640', '800', '960', '1024', '1280']
      result.setSuggestions(widthSizes.filter(s => s.includes(query)))
      break
    case 'height':
      const heightSizes = ['480', '600', '720', '768', '960']
      result.setSuggestions(heightSizes.filter(s => s.includes(query)))
      break
    case 'scale':
      // Check that the input is a valid number
      if (query === '') {
        result.setSuggestions([])
      } else if (!Number.isFinite(Number(query))) {
        result.setError("Please enter a numberic value")
      } else if (Number(query) <= 0) {
        result.setError("Must be larger than 0")
      } else {
        result.setSuggestions([query])
      }
      break
    default:
      return
  }
})

// When the user presses Enter after inputting all parameters, the 'run' event is fired.
figma.on('run', ({command, parameters}: RunEvent) => {
  if (command == 'relative') {
    resizeRelative(parameters)
  } else {
    resizeAbsolute(parameters)
  }
  figma.closePlugin()
})

function resizeRelative(parameters: ParameterValues) {
  const scale = parseFloat(parameters.scale)

  for (const node of figma.currentPage.selection) {
    if ('rescale' in node) {
      node.rescale(scale)
    }
  }
}

function resizeAbsolute(parameters: ParameterValues) {
  const width = parseInt(parameters.width)
  const height = parseInt(parameters.height)

  for (const node of figma.currentPage.selection) {
    if ('resize' in node) {
      node.resize(width, height)
    }
  }
}
