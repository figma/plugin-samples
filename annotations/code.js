const selectionNodes = figma.currentPage.selection;
const nodes =
  selectionNodes.length === 0 ? [figma.currentPage] : selectionNodes;

nodes.forEach((node) => {
  if (node.type === "INSTANCE") {
    addAnnotation(node);
  } else {
    node.findAllWithCriteria({ types: ["INSTANCE"] }).forEach(addAnnotation);
  }
});

figma.closePlugin();

function addAnnotation(instance) {
  if (instance.annotations.length) {
    // IMPORTANT: This line deletes existing annotations
    // instance.annotations = [];
    console.log(instance.annotations);
    // IMPORTANT: The following appends to existing annotations,
    // but LOSES rich text formatting (currently unsupported in the plugin API)
    /*
    const current = instance.annotations[0];
    const currentProperties = current.properties || [];
    const existingMainComponent = currentProperties.find(
      (a) => a.type === "mainComponent"
    );
    if (!existingMainComponent) {
      instance.annotations = [
        {
          label: current.label,
          properties: [{ type: "mainComponent" }].concat(currentProperties),
        },
      ];
    }
    */
  } else {
    instance.annotations = [{ properties: [{ type: "mainComponent" }] }];
  }
}
