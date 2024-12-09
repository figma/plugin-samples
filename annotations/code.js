// Whether or not a node has a visible image fill on it.
// Ignores "figma.mixed" fill values.
function nodeHasImageFill(node) {
  return (
    "fills" in node &&
    Array.isArray(node.fills) &&
    Boolean(node.fills.find((paint) => paint.visible && paint.type === "IMAGE"))
  );
}

// Returns all Figma nodes and descendants with image fills for an array of nodes
function getImageNodes(nodes) {
  const imageNodes = [];
  nodes.forEach((node) => {
    if (nodeHasImageFills(node)) {
      imageNodes.push(node);
    }

    // Checking node descendants
    if ("findAll" in node) {
      node.findAll((descendant) => {
        if (nodeHasImageFill(descendant)) {
          imageNodes.push(descendant);
        }
      });
    }
  });

  return imageNodes;
}

// helper function for creating an annotation
function createImageAnnotation(node, customLabel) {
  let DEFAULT_TEMPLATE = `🔵 **ALT TEXT**\n${node.name}`;
  let markdown = customLabel || DEFAULT_TEMPLATE;
  node.annotations = [
    {
      labelMarkdown: markdown,
      properties: [{ type: "fills" }],
    },
  ];
}

// helper function for notifying after annotations are created
function showAnnotationNotification(count, skipped) {
  let msg = "";
  if (count > 0) {
    msg += `Created ${count} annotation${count > 1 ? "s" : ""}.`;
  }
  if (skipped > 0) {
    msg += ` Skipped ${skipped} annotation${skipped > 1 ? "s" : ""}.`;
  }
  figma.notify(msg);
}

// function to create annotations in selection
// selection => selection can be figma.currentPage.selection or figma.currentPage
// label (optional) => custom label to be annotated,
//    if not provided will be labeled using image name
function createAltTextAnnotations(selection, label) {
  let imageNodes = getImageNodes(selection);

  let count = 0; // number of annotations we'll create
  let skipped = 0; // number of annotations we'll skip

  imageNodes.forEach((node) => {
    // if an annotations already exists, we don't want to overwrite it
    if (node.annotations.length > 0) {
      skipped++;
      return;
    }

    createImageAnnotation(node, label);
    count++;
  });

  showAnnotationNotification(count, skipped);
}

// runs plugin from menu commands
figma.on("run", ({ command }) => {
  switch (command) {
    case "all-images":
      createAltTextAnnotations([figma.currentPage]);
      figma.closePlugin();
      break;
    case "selection":
      createAltTextAnnotations(figma.currentPage.selection);
      figma.closePlugin();
    default:
      // do nothing
      break;
  }
});
