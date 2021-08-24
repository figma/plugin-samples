// This plugin will find links within a text node and create on canvas meta cards
// of an image, title, description and link based on the <meta> tags in the head 
// of a webpage at the relative links

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {visible: false});

let hyperlinksProcessed = 0;
let hyperlinkErrors = 0;
let cardsToCreate = 0;

// Find text nodes within selection
const selectedTextNodes = figma.currentPage.selection.filter(node => node.type === "TEXT") as TextNode[];
if(selectedTextNodes.length){

  let textNode = selectedTextNodes[0];

  let hyperLinks = getHyperlinksFromTextNode(textNode);

  cardsToCreate = hyperLinks.length;
  if(cardsToCreate > 0){
    hyperLinks.forEach(link => {
      figma.ui.postMessage({
        function: "fetchMetaTags", 
        data: link,
        nodeId: textNode.id
      });
    });  
  } else {
    figma.closePlugin("Select text with a link and re-run this plugin.");
  }
} else {
  figma.closePlugin("Select text with a link and re-run this plugin.")
}

// Extracts all hyperlinks from a text node and returns them as a
// deduped array 
function getHyperlinksFromTextNode(textNode){

  let links = Array.from(textNode.characters).map((char, i) => {
    let link = textNode.getRangeHyperlink(i,i+1);
    return link.type === "URL"? link.value : null;
  });

  //Dedupe the array 
  return [...new Set(links)].filter(link => link !== null);
}


// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if(msg.function === 'fetchError') {

    hyperlinkErrors++;

  } else if (msg.function === 'createMetaCard') {

    const metaTags = msg.data; 
    const nodeId = msg.nodeId;
    const imageWidth = 320;
    const cardPadding = 16;

    // Create Metacard Frame
    let cardFrame = figma.createFrame();
    cardFrame.cornerRadius = cardPadding/2;
    cardFrame.resize(imageWidth + cardPadding*2,imageWidth);
    cardFrame.layoutMode = "VERTICAL";
    cardFrame.paddingLeft = cardFrame.paddingRight = cardFrame.paddingTop = cardFrame.paddingBottom = cardPadding;
    cardFrame.itemSpacing = cardPadding/2;
    cardFrame.primaryAxisSizingMode = "AUTO";
    cardFrame.counterAxisSizingMode = "FIXED";
    cardFrame.fills = [{type : "SOLID", color: { r: 1, g: 1, b: 1 }}];
    cardFrame.strokes = [{type : "SOLID", color: { r: 0, g: 0, b: 0 }}];
    cardFrame.strokeWeight = 2;

    // Create Image
    let img = figma.createImage(metaTags.image.data);
		let rect = figma.createRectangle();
    rect.cornerRadius = cardPadding/4;
    rect.resize(imageWidth, imageWidth / (metaTags.image.width / metaTags.image.height));
		rect.fills = [{
			imageHash: img.hash,
			scaleMode: "FILL",
			scalingFactor: 0.5,
			type: "IMAGE",
		}];
    cardFrame.appendChild(rect);

    // Create title
    let metaTitle = figma.createText();
    let boldFont = {family: "Inter", style: "Bold"};
    await figma.loadFontAsync(boldFont);
    metaTitle.fontName = boldFont;
    cardFrame.appendChild(metaTitle);
    metaTitle.characters = metaTags.title;
    metaTitle.textAutoResize = "HEIGHT";
    metaTitle.layoutAlign = "STRETCH";
    metaTitle.hyperlink = {
      type: "URL",
      value: metaTags.hyperlink
    };
    metaTitle.textDecoration = "UNDERLINE";

    // Create description
    let metaDesc = figma.createText();
    await figma.loadFontAsync({family: "Inter", style: "Medium"});
    cardFrame.appendChild(metaDesc);
    metaDesc.characters = metaTags.description;
    metaDesc.textAutoResize = "HEIGHT";
    metaDesc.layoutAlign = "STRETCH";

    // Append the Meta card and place next to the node
    let node = figma.getNodeById(nodeId) as SceneNode;
    cardFrame.x = node.x + node.width + hyperlinksProcessed * cardFrame.width + ((hyperlinksProcessed + 1) * 32); 
    cardFrame.y = node.y;
    figma.currentPage.appendChild(cardFrame);

    hyperlinksProcessed++;
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  if(hyperlinksProcessed + hyperlinkErrors === cardsToCreate){
    let closeMessage = ``;
    if(hyperlinksProcessed > 0){
      closeMessage = `Created ${hyperlinksProcessed} meta cards.`;
    }
    if(hyperlinkErrors > 0){
      closeMessage = `Error processing ${hyperlinkErrors} meta cards.`;
    }
    figma.closePlugin(closeMessage);
  }
};
