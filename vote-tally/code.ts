// This plugin will find all stamps close to a sticky and generate a tally of 
// all the stamps (votes) next to a sticky on the page

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs such as the network by creating a UI which contains
// a full browser environment (see documentation).

// Declare an array of stickies
let stickies: SceneNode[] = [];

// Find all stamps on the page
let stamps: SceneNode[] = figma.currentPage.findAll(node => node.type === "STAMP");

// If there is a selection, use that
if(figma.currentPage.selection.length > 0){

  stickies = figma.currentPage.selection.filter(node => node.type === "STICKY");

// If there is no selection, use all stickies
} else {
  
  stickies = figma.currentPage.findChildren(node => node.type === "STICKY");

}

function isWithinProximity(node1, node2, tolerance = 40){

  let node1Center = {x: node1.x + node1.width/2, y: node1.y + node1.height/2};
  let node2Center = {x: node2.x + node2.width/2, y: node2.y + node2.height/2};
  let proximity = node1.width/2 + tolerance;

  return Math.abs(node1Center.x - node2Center.x) <= proximity && Math.abs(node1Center.y - node2Center.y) <= proximity;

}

// Find all votes (stamps) attributed to a sticky (by proximity)
function getStampsNearNode(sticky){
  
  let stampGroups = {};

  stamps.forEach(stamp => {
    if( isWithinProximity(sticky,stamp,60) ){
      if(!stampGroups[stamp.name]){
        stampGroups[stamp.name] = [];
      }
      stampGroups[stamp.name].push(stamp);
    }
  });

  return stampGroups;
}

// Tally all the votes and arrange them in a consumable way
async function tallyStickyVotes(sticky, removeStamps = false){

  let stampVotes = getStampsNearNode(sticky);

  // Before setting the characters of the tally's text, we need to load the default font
  await figma.loadFontAsync({family: "Inter", style: "Medium"});

  // Create an Auto Layout frame to hold the tally 
  let tallyFrame = figma.createFrame();
  tallyFrame.cornerRadius = 8;
  tallyFrame.resize(128,128);
  tallyFrame.layoutMode = "VERTICAL";
  tallyFrame.paddingLeft = tallyFrame.paddingRight = tallyFrame.paddingTop = tallyFrame.paddingBottom = 16;
  tallyFrame.itemSpacing = 8;
  tallyFrame.primaryAxisSizingMode = tallyFrame.counterAxisSizingMode = "AUTO";
  tallyFrame.fills = [{type : "SOLID", color: { r: 1, g: 1, b: 1 }}];
  tallyFrame.x = sticky.x + sticky.width + 20;
  tallyFrame.y = sticky.y;
  tallyFrame.strokes = [{type : "SOLID", color: { r: 0, g: 0, b: 0 }}];
  tallyFrame.strokeWeight = 2;
  tallyFrame.primaryAxisAlignItems = tallyFrame.counterAxisAlignItems = "CENTER";
  
  let tallyTitle = figma.createText();
  tallyFrame.appendChild(tallyTitle);
  tallyTitle.characters = "Votes";
  tallyTitle.textAutoResize = "HEIGHT";
  tallyTitle.layoutAlign = "INHERIT";
  tallyTitle.textAlignHorizontal = "CENTER";

  // Sort all votes to show the highest votes first
  let sortedVotes = Object.keys(stampVotes)
    .sort((a,b) => {
      return stampVotes[b].length - stampVotes[a].length;
    });
  
  // Render each stamp with the number of times it was used
  sortedVotes.forEach(stampName => {

    let tallyLine = figma.createFrame();
    tallyFrame.appendChild(tallyLine);
    tallyLine.layoutMode = "HORIZONTAL";
    tallyLine.itemSpacing = 8;
    tallyLine.layoutAlign = "STRETCH";
    tallyLine.primaryAxisAlignItems = "MIN";
    tallyLine.counterAxisAlignItems = "CENTER";
    tallyLine.counterAxisSizingMode = "AUTO";
    tallyLine.primaryAxisSizingMode = "AUTO";
    tallyLine.clipsContent = false;
    
    // If the vote was a profile, show each profile stamp...otherwise, just show a single stamp
    let stampsToShow = stampName === "Profile"? stampVotes[stampName] : [stampVotes[stampName][0]];
    let stampFrame = figma.createFrame();
    tallyLine.appendChild(stampFrame);
    stampFrame.layoutMode = "HORIZONTAL";
    stampFrame.itemSpacing = 0;
    stampFrame.layoutAlign = "MIN";
    stampFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
    stampFrame.counterAxisAlignItems = "CENTER";
    stampFrame.primaryAxisSizingMode = "FIXED";
    stampFrame.clipsContent = false;
    stampFrame.resize(stampsToShow.length * 32 * 0.66 ,32);
    stampsToShow.forEach(currentStamp => {
      let stamp = currentStamp.clone();
      stamp.rotation = 0;
      stamp.resize(32,32);
      stampFrame.appendChild(stamp);
    });

    let tally = figma.createText();
    tallyLine.appendChild(tally);
    tally.characters = `${stampVotes[stampName].length}`;
    tally.textAutoResize = "HEIGHT";
    tally.layoutAlign = "INHERIT";
    
    // Clear the stamps if removeStamps is set to true 
    if(removeStamps){
      stampVotes[stampName].forEach(stamp => stamp.remove())
    }

  });

}

if(stickies.length > 0){

  // Tally up each sticky's votes 
  Promise.all(stickies.map(sticky => tallyStickyVotes(sticky))).then(() => {
    // Notify the user 
    figma.notify(`Tallied ${stickies.length} ${stickies.length > 1? 'stickies' : 'sticky' }.`);
    figma.closePlugin();
  }).catch(error => {
    figma.closePlugin();
  });
} else {
  figma.notify(`No stickies found. Add some!`);
  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
}

