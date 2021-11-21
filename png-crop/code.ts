figma.notify('Drop a PNG image', { timeout: Infinity });

figma.on('drop', (event) => {
  if (event.files && event.files.length > 0) {
    const file = event.files[0];

    if (file.type === 'image/png') {
      file.getBytesAsync().then(bytes => {
        const image = figma.createImage(bytes)

        const ellipse = figma.createEllipse();
        ellipse.x = event.x
        ellipse.y = event.y
        ellipse.resize(320, 320);
        ellipse.fills = [{
          imageHash: image.hash,
          scaleMode: "FILL",
          scalingFactor: 1,
          type: "IMAGE",
        }];
      });

      return false;
    }
  }
});
