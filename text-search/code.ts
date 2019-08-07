figma.showUI(__html__);

let timer = undefined;

figma.ui.onmessage = message => {
  if (message.query !== undefined) {
    if (timer) {
      clearTimeout(timer);
    }
    if (message.query) {
      searchFor(message.query);
    }
  } else if (message.show) {
    let node = figma.getNodeById(message.show);
    if (node.type === 'DOCUMENT' || node.type === 'PAGE') {
      // DOCUMENTs and PAGEs can't be put into the selection.
      return;
    }
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);
  } else if (message.quit) {
    figma.closePlugin();
  }
}

// This is a generator that recursively produces all the nodes in subtree
// starting at the given node
function* walkTree(node) {
  yield node;
  let children = node.children;
  if (children) {
    for (let child of children) {
      yield* walkTree(child)
    }
  }
}

function searchFor(query) {
  query = query.toLowerCase()
  let walker = walkTree(figma.currentPage)

  function processOnce() {
    let results = [];
    let count = 0;
    let done = true;
    let res
    while (!(res = walker.next()).done) {
      let node = res.value
      if (node.type === 'TEXT') {
        let characters = node.characters.toLowerCase()
        if (characters.includes(query)) {
          results.push(node.id);
        }
      }
      if (++count === 1000) {
        done = false
        timer = setTimeout(processOnce, 20)
        break
      }
    }

    figma.ui.postMessage({ query, results, done })
  }

  processOnce()
}
