/* eslint-disable no-case-declarations */

// The 'input' event listens for text change in the Quick Actions box after a plugin is 'Tabbed' into.
figma.parameters.on('input', ({ key, query, result }) => {
  switch (key) {
      case 'name':
          const filter = node => node.name.toLowerCase().startsWith(query.toLowerCase());

          // Always suggest all of the pages in the file 
          const pages = figma.root
            .findChildren(node => query.length === 0 ? true : filter(node))
            .map(node => ({ name: `${node.name} (page)`, data: { name: node.name, id: node.id } }));

          // Only show layers when the user types a query 
          const nodes = query.length > 0 ? figma.currentPage
              .findAll(node => filter(node)) : [];

          const formattedNodes = nodes.map((node) => {
              const name = `${node.name} [${node.id}]`;
              return ({ name, data: { name: node.name, id: node.id } });
          });
          const suggestions = [...pages, ...formattedNodes];
          result.setSuggestions(suggestions);
          break;
      default:
          return;
  }
});

// When the user presses Enter after inputting all parameters, the 'run' event is fired.
figma.on('run', ({ parameters }) => {
  startPluginWithParameters(parameters);
});

// Start the plugin with parameters
async function startPluginWithParameters(parameters) {
  const { name, id } = parameters['name'];
  const node = await figma.getNodeByIdAsync(id);
  if (node) {
      // Node found, so we need to go to that node
      if (node.type === "PAGE") {
          await figma.setCurrentPageAsync(node);
      } else {
          // Figure out if the node is on the right page, 
          // otherwise, we need to switch to that page before zooming into the view
          let currentParent = node.parent;
          while (currentParent.type !== "PAGE") {
              currentParent = currentParent.parent;
          }
          await figma.setCurrentPageAsync(currentParent);
          figma.viewport.scrollAndZoomIntoView([node]);
          figma.currentPage.selection = [node as SceneNode];
      }
  } else {
      // Could not find node
      figma.notify(`Could not find node with name=${name}`);
  }
  figma.closePlugin();
}
