const PLUGIN_DATA_KEY = "snippets";

if (figma.mode === "codegen") {
  figma.codegen.on("preferenceschange", (event) => {
    if (event.propertyName === "editor") {
      figma.showUI(__html__, {
        width: 300,
        height: 300,
      });
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
  figma.codegen.on("generate", async (event) => {
    handleCurrentSelection();
    const snippetData = await findAndGenerateSelectionSnippetData();
    const snippets = [];
    snippetData.forEach((pluginDataAndParams) => {
      const { codeArray, pluginDataArray, params } = pluginDataAndParams;
      if (event.language === "debug") {
        snippets.push({
          title: "Node Params",
          code: JSON.stringify(params, null, 2),
          language: "JSON",
        });
      }
      pluginDataArray.forEach(({ title, code: _code, language }, i) => {
        const code = codeArray[i];
        if (event.language === "debug") {
          snippets.push({
            title: `${title}: Template`,
            code: _code,
            language: "PLAINTEXT",
          });
        }
        snippets.push({ title, language, code });
      });
    });

    if (!snippets.length) {
      if (event.language === "debug") {
        snippets.push({
          title: "Node Params",
          code: JSON.stringify(
            await paramsFromNode(figma.currentPage.selection[0], {}),
            null,
            2
          ),
          language: "JSON",
        });
      }
      snippets.push({
        title: "Snippets",
        code: "No snippets found. Add snippets with the Snippet Editor in the Plugin's Inspect settings!",
        language: "PLAINTEXT",
      });
    }

    return snippets;
  });
} else if (figma.command === "description-to-plugin-data") {
  descriptionToPluginData();
}

function descriptionToPluginData() {
  let count = 0;
  figma.currentPage.selection.forEach((node) => {
    if (node.description) {
      count++;
      node.setPluginData(
        PLUGIN_DATA_KEY,
        JSON.stringify([
          {
            language: "JAVASCRIPT",
            code: node.description.replace(/\n/g, "\n"),
            title: node.name,
          },
        ])
      );
    }
  });
  figma.notify(`Updated snippet to description for ${count} nodes`);
  figma.closePlugin();
}

async function findAndGenerateSelectionSnippetData() {
  const data = [];
  const currentNode = figma.currentPage.selection[0];
  async function pluginDataForNode(node) {
    const pluginData = node.getPluginData(PLUGIN_DATA_KEY);
    // skipping duplicates. why?
    // component instances have same pluginData as mainComponent, unless they have override pluginData.
    if (pluginData && data.indexOf(pluginData) === -1) {
      const { params, pluginDataArray, codeArray } = await hydrateSnippets(
        pluginData,
        currentNode
      );
      data.push({ codeArray, pluginDataArray, params });
    }
  }

  if (currentNode.type === "INSTANCE") {
    await pluginDataForNode(currentNode.mainComponent);
    if (currentNode.mainComponent.parent.type === "COMPONENT_SET") {
      await pluginDataForNode(currentNode.mainComponent.parent);
    }
  } else if (currentNode.type === "COMPONENT") {
    await pluginDataForNode(currentNode);
    if (currentNode.parent.type === "COMPONENT_SET") {
      await pluginDataForNode(currentNode.parent);
    }
  } else {
    await pluginDataForNode(currentNode);
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

async function hydrateSnippets(pluginData, node) {
  const pluginDataArray = JSON.parse(pluginData);
  const codeArray = [];

  if (!["COMPONENT_SET", "COMPONENT", "INSTANCE"].includes(node.type)) {
    pluginDataArray.forEach(
      (pluginData, i) => (codeArray[i] = pluginData.code)
    );
    return { params: {}, pluginDataArray, codeArray };
  }

  const params = await paramsFromNode(node, {});
  pluginDataArray.forEach((pluginData, i) => {
    const lines = pluginData.code.split("\n");
    const code = [];
    lines.forEach((line) => {
      const qualifyingMatch = line.match(/\{\{\?([^=]+)=([^\}]+)\}\}/);
      const qualifies =
        !qualifyingMatch ||
        (qualifyingMatch[1] in params &&
          params[qualifyingMatch[1]] === qualifyingMatch[2]);
      if (qualifyingMatch) line = line.replace(qualifyingMatch[0], "");

      const symbolMatch = line.match(/\{\{([^\{\?\}]+)\}\}/);
      if (qualifies && symbolMatch) {
        const param = symbolMatch[1];
        if (param in params && params[param] !== "undefined") {
          code.push(line.replace(symbolMatch[0], params[param]));
        }
      } else if (qualifies) {
        code.push(line);
      }
    });
    codeArray.push(
      code
        .join("\n")
        .replace(/\\\n\\/g, "")
        .replace(/\\\n/g, " ")
    );
  });

  return { params, pluginDataArray, codeArray };
}

async function paramsFromNode(node, params) {
  const nodeToProcess =
    node.type === "COMPONENT"
      ? node.parent && node.parent.type === "COMPONENT_SET"
        ? node.parent
        : node
      : node;
  const valueObject =
    nodeToProcess.type === "INSTANCE"
      ? nodeToProcess.componentProperties
      : nodeToProcess.componentPropertyDefinitions;
  const object = {};
  const isDefinitions =
    valueObject[Object.keys(valueObject)[0]] &&
    "defaultValue" in valueObject[Object.keys(valueObject)[0]];
  for (let propertyName in valueObject) {
    const value = isDefinitions
      ? valueObject[propertyName].defaultValue
      : valueObject[propertyName].value;
    const type = valueObject[propertyName].type;
    const cleanName = sanitizePropertyName(propertyName);
    if (value !== undefined) {
      object[cleanName] = object[cleanName] || {};
      if (typeof value === "string") {
        if (type === "VARIANT") object[cleanName].VARIANT = value;
        if (type === "TEXT") object[cleanName].TEXT = value;
        if (type === "INSTANCE_SWAP") {
          const foundNode = await figma.getNodeById(value);
          object[cleanName].INSTANCE_SWAP = capitalizedNameFromName(
            foundNode ? foundNode.name : ""
          );
        }
      } else {
        object[cleanName].BOOLEAN = value;
      }
    }
  }
  const paramsValues = Object.assign({}, params);
  const types = ["TEXT", "VARIANT", "INSTANCE_SWAP"];
  for (let key in object) {
    const item = object[key];
    const hasBoolean = "BOOLEAN" in item;
    const booleanCheck = !hasBoolean || item.BOOLEAN;
    let value;
    types.forEach((type) => {
      if (type in item) {
        if (booleanCheck) {
          value =
            type === "VARIANT" ? optionNameFromVariant(item[type]) : item[type];
        } else {
          value = "undefined";
        }
      }
    });
    if (value === undefined && hasBoolean) {
      value = item.BOOLEAN;
    }
    paramsValues[key] = (value || "").toString() || "";
  }

  function optionNameFromVariant(name = "") {
    const clean = name.replace(/[^a-zA-Z\d-_ ]/g, "");
    if (clean.match("-")) {
      return clean.replace(/ +/g, "-").toLowerCase();
    } else if (clean.match("_")) {
      return clean.replace(/ +/g, "_").toLowerCase();
    } else if (clean.match(" ") || clean.match(/^[A-Z]/)) {
      return clean
        .split(/ +/)
        .map((a, i) => {
          let text =
            i > 0
              ? `${a.charAt(0).toUpperCase()}${a.substring(1).toLowerCase()}`
              : a.toLowerCase();
          return text;
        })
        .join("");
    } else return clean;
  }

  return paramsValues;
}

function capitalize(name) {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

function downcase(name) {
  return `${name.charAt(0).toLowerCase()}${name.slice(1)}`;
}
function numericGuard(name) {
  if (name.charAt(0).match(/\d/)) {
    name = `N${name}`;
  }
  return name;
}
function capitalizedNameFromName(name) {
  name = numericGuard(name);
  return name
    .split(/[^a-zA-Z\d]+/g)
    .map(capitalize)
    .join("");
}

function sanitizePropertyName(name) {
  name = name.replace(/#[^#]+$/g, "");
  return downcase(capitalizedNameFromName(name).replace(/^\d+/g, ""));
}
