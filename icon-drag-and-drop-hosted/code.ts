figma.showUI(__html__, { themeColors: true });

figma.on('drop', (event: DropEvent) => {
  console.log('[plugin] drop received!!', event);
  const { items } = event;
  
  if (items.length > 0 && items[0].type === 'image/svg+xml') {
    const data = items[0].data

    const newNode = figma.createNodeFromSvg(data);
    newNode.x = event.absoluteX;
    newNode.y = event.absoluteY;

    figma.currentPage.selection = [newNode];
  }
  
  return false;
});