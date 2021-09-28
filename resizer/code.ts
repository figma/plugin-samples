// Check that the input is a valid number
function setSuggestionsForNumberInput(query: string, result: SuggestionResults, completions?: string[]) {
  if (query === '') {
    result.setSuggestions(completions ?? [])
  } else if (!Number.isFinite(Number(query))) {
    result.setError("Please enter a numeric value")
  } else if (Number(query) <= 0) {
    result.setError("Must be larger than 0")
  } else {
    const filteredCompletions = completions ? completions.filter(s => s.includes(query) && s !== query) : []
    result.setSuggestions([query, ...filteredCompletions])
  }
}

// The 'input' event listens for text change in the Quick Actions box after a plugin is 'Tabbed' into.
figma.parameters.on('input', ({query, key, result}: ParameterInputEvent) => {
  if (figma.currentPage.selection.length === 0) {
    result.setError('Please select one or mode nodes first')
    return
  }

  switch (key) {
    case 'width':
      const widthSizes = ['640', '800', '960', '1024', '1280']
      setSuggestionsForNumberInput(query, result, widthSizes)
      break
    case 'height':
      const heightSizes = ['480', '600', '720', '768', '960']
      setSuggestionsForNumberInput(query, result, heightSizes)
      break
    case 'scale':
      setSuggestionsForNumberInput(query, result)
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
