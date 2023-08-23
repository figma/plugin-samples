figma.showUI(__html__, { height: 600, width: 600 });

figma.on("documentchange", (event) => {
  const messages = event.documentChanges.map(documentChangeAsString);
  figma.ui.postMessage(messages, { origin: "*" });
});

function documentChangeAsString(change: DocumentChange) {
  const { origin, type } = change;
  const list: string[] = [origin, type];
  if (type === "PROPERTY_CHANGE") {
    list.push(change.node.type, change.properties.join(", "));
  } else if (type === "STYLE_PROPERTY_CHANGE") {
    list.push(change.style?.name, change.properties.join(", "));
  } else if (type === "STYLE_CREATE" || type === "STYLE_DELETE") {
    // noop
  } else {
    list.push(change.node.type);
  }
  return list.join(" ");
}
