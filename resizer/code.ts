// The 'input' event listens for text change in the Quick Actions box after a plugin is 'Tabbed' into.
figma.parameters.on('input', (parameters: ParameterValues, currentKey: string, result: SuggestionResults) => {
  const query = parameters[currentKey]
  switch (currentKey) {
    case 'width':
      const widthSizes = ['640', '800', '960', '1024', '1280']
      result.setSuggestions(widthSizes.filter(s => s.includes(query)))
      break
    case 'height':
      const heightSizes = ['480', '600', '720', '768', '960']
      result.setSuggestions(heightSizes.filter(s => s.includes(query)))
      break
    case 'scale': // We don't setSuggestions because we want the user to be able to input any value.
      break
    default:
      return
  }
})

// When the user presses Enter after inputting all parameters, the 'run' event is fired.
figma.on('run', ({parameters, command}: RunEvent) => {
  if (parameters) {
    startPluginWithParameters(parameters)
  } else {
    startPluginWithUI(command);
  }
})

// Starts the plugin in regular mode.
function startPluginWithUI(command: string) {
  figma.showUI(__html__);
  figma.ui.postMessage(command)
};

function startPluginWithParameters(parameters: ParameterValues) {
  const selection = figma.currentPage.selection

  // Check if we're doing relative or absolute resize.
  if (parameters['scale']) {
    const scale = parseFloat(parameters['scale'])

    for (let i = 0; i < selection.length; i++) {
      selection[i].rescale(scale)
    }
  } else if (parameters['width'] && parameters['height']) {
    const width = parseInt(parameters['width'])
    const height = parseInt(parameters['height'])

    for (let i = 0; i < selection.length; i++) {
      selection[i].resize(width, height)
    }
  }
  figma.closePlugin()
}
