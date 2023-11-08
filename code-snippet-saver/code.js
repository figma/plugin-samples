const PLUGIN_DATA_KEY = "snippets";

if (figma.mode === "codegen") {
  figma.codegen.on("preferenceschange", (event) => {
    if (event.propertyName === "editor") {
      figma.showUI(__html__, { width: 400, height: 450 });
    }
  });
  figma.ui.on("message", (event) => {
    if (event.type === "INITIALIZE") {
      handleCurrentSelection();
    } else if (event.type === "SAVE") {
      figma.currentPage.selection[0].setPluginData(PLUGIN_DATA_KEY, event.data);
    } else {
      console.log("UNKNOWN EVENT", event);
    }
  });
  figma.on("selectionchange", () => {
    handleCurrentSelection();
  });
  figma.codegen.on("generate", async () => {
    handleCurrentSelection();
    const pluginDataArray = findPluginDataArrayForSelection();
    const snippets = [];
    pluginDataArray.forEach((pluginData) =>
      JSON.parse(pluginData).forEach((a) => snippets.push(a))
    );

    if (!snippets.length) {
      snippets.push({
        title: "Snippets",
        code: "No snippets found. Add snippets with the Snippet Editor in the Plugin's Inspect settings!",
        language: "PLAINTEXT",
      });
    }

    return snippets;
  });
}

function findPluginDataArrayForSelection() {
  const data = [];
  function pluginDataForNode(node) {
    const pluginData = node.getPluginData(PLUGIN_DATA_KEY);
    // skipping duplicates. why?
    // component instances have same pluginData as mainComponent, unless they have override pluginData.
    if (pluginData && data.indexOf(pluginData) === -1) {
      data.push(pluginData);
    }
  }
  const currentNode = figma.currentPage.selection[0];
  pluginDataForNode(currentNode);
  if (currentNode.type === "INSTANCE") {
    pluginDataForNode(currentNode.mainComponent);
    if (currentNode.mainComponent.parent.type === "COMPONENT_SET") {
      pluginDataForNode(currentNode.mainComponent.parent);
    }
  } else if (currentNode.type === "COMPONENT") {
    if (currentNode.parent.type === "COMPONENT_SET") {
      pluginDataForNode(currentNode.parent);
    }
  }
  return data;
}

function handleCurrentSelection() {
  const node = figma.currentPage.selection[0];
  try {
    const nodePluginData = node ? node.getPluginData(PLUGIN_DATA_KEY) : null;
    const nodeId = node ? node.id : null;
    const nodeType = node ? node.type : null;
    figma.ui.postMessage({
      type: "SELECTION",
      nodeId,
      nodeType,
      nodePluginData,
    });
    return nodePluginData;
  } catch (e) {
    // no ui open. ignore this.
  }
}
