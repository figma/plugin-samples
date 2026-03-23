figma.showUI(__html__, { height: 600, width: 600 });

void initialize();

async function initialize() {
  if ("loadAllPagesAsync" in figma) {
    await figma.loadAllPagesAsync();
  }

  figma.on("documentchange", (event) => {
    const messages = event.documentChanges.map(documentChangeAsString);
    figma.ui.postMessage(messages);
  });
}

function documentChangeAsString(change: DocumentChange): string {
  const { origin, type } = change;
  const list: string[] = [origin, type];

  if (type === "PROPERTY_CHANGE") {
    list.push(change.node.type, change.properties.join(", "));
  } else if (type === "STYLE_PROPERTY_CHANGE") {
    if (change.style) {
      list.push(change.style.name, change.properties.join(", "));
    }
  } else if (type !== "STYLE_CREATE" && type !== "STYLE_DELETE") {
    list.push(change.node.type);
  }

  return list.join(" ");
}
