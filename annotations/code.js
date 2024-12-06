// a helper function to find nodes with image fills
// accepts either figma.currentPage or an array of nodes
function getImageNodes(selection) {
  let imageNodes = [];

  // if selection is currentPage
  if (selection == figma.currentPage) {
    figma.currentPage.findAll((node) => {
      if ("fills" in node) {
        node.fills.find((paint) => {
          if (paint.type === "IMAGE") {
            imageNodes.push(node);
          }
        });
      }
    });
    return imageNodes;
  }

  // otherwise, selection is an Array
  selection.forEach((element) => {
    // if our current element has an image fill, annotate it
    if ("fills" in element) {
      // ignore if fills is figma.mixed
      if (Array.isArray(element.fills)) {
        element.fills.find((paint) => {
          if (paint.type === "IMAGE") {
            imageNodes.push(element);
            return;
          }
        });
      }
    }

    // if our current element is a node that can be traversed further
    if ("findAll" in element) {
      element.findAll((node) => {
        if ("fills" in node) {
          node.fills.find((paint) => {
            if (paint.type === "IMAGE") {
              imageNodes.push(node);
            }
          });
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
      createAltTextAnnotations(figma.currentPage);
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
