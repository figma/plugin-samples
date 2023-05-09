figma.showUI(__html__);

// Receive the drop event from the UI
figma.on('drop', (event) => {
  const { files, node, dropMetadata } = event;

  if (files.length > 0 && files[0].type === 'image/svg+xml') {
    files[0].getTextAsync().then((text) => {
      if (dropMetadata.parentingStrategy === 'page') {
        const newNode = figma.createNodeFromSvg(text);
        newNode.x = event.absoluteX;
        newNode.y = event.absoluteY;

        figma.currentPage.selection = [newNode];
      } else if (dropMetadata.parentingStrategy === 'immediate') {
        const newNode = figma.createNodeFromSvg(text);

        // We can only append page nodes to documents
        if ('appendChild' in node && node.type !== 'DOCUMENT') {
          node.appendChild(newNode);
        }

        newNode.x = event.x;
        newNode.y = event.y;

        figma.currentPage.selection = [newNode];
      }
    });

    return false;
  }
});
