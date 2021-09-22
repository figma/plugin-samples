const types = [{name: 'multiple choice', data: 'multiple'}, {name: 'true/false', data: 'boolean'}]
const difficulties
 = ['easy', 'medium', 'hard']

const numbers = ['5', '10', '15', '20', '25', '30']

interface Category {
  name: string, 
  data: string, 
}

let categories: Category[] = []

loadCategories()

// The 'input' event listens for text change in the Quick Actions box after a plugin is 'Tabbed' into.
figma.parameters.on('input', ({key, query, result}: ParameterInputEvent) => {
  switch (key) {
    case 'number':
      result.setSuggestions(numbers.filter(s => s.includes(query)))
      break
    case 'category':
      result.setSuggestions(categories.filter(s => s.name.includes(query)))
      break
    case 'difficulty':
      result.setSuggestions(difficulties.filter(s => s.includes(query)))
      break
    case 'type':
      result.setSuggestions(types.filter(s => s.name.includes(query)))
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

// Start the plugin with parameters
function startPluginWithParameters(parameters: ParameterValues) {
  figma.closePlugin()
};

async function loadCategories() {
  figma.showUI(__html__, { visible: false })
  figma.ui.postMessage({ type: 'category' })
  
  figma.ui.onmessage = async (msg) => {
    console.log(msg.type)
    if (msg.type === 'category') {
      console.log(msg.response.trivia_categories)
      categories = msg.response.trivia_categories.map(c => ({name: c.name, data: c.id}))
    }
  }
}