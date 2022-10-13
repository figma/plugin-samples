figma.showUI(__html__, { height: 600, width: 400 });

figma.on("documentchange", (event) => {
  figma.ui.postMessage(event, { origin: "*" });
});
