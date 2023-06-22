console.clear();

const styles = figma.getLocalPaintStyles();
const tokenDataMap = styles.reduce(styleToTokenDataMap, {});
const tokenData = Object.values(tokenDataMap);
createTokens(tokenData);

function createTokens(tokenData) {
  if (tokenData.length <= 0) {
    figma.notify("No convertible styles found. :(");
    return;
  }
  const collection = figma.variables.createVariableCollection(`Style Tokens`);
  let aliasCollection;
  const modeId = collection.modes[0].modeId;
  collection.renameMode(modeId, "Style");
  console.log(tokenData);
  tokenData.forEach(({ color, hex, opacity, tokens }) => {
    if (tokens.length > 1) {
      aliasCollection =
        aliasCollection ||
        figma.variables.createVariableCollection(`Style Tokens: Aliased`);
      aliasCollection.renameMode(aliasCollection.modes[0].modeId, "Style");
      const opacityName =
        opacity === 1 ? "" : ` (${Math.round(opacity * 100)}%)`;
      const parentToken = figma.variables.createVariable(
        `${hex.toUpperCase()}${opacityName}`,
        aliasCollection.id,
        "COLOR"
      );
      parentToken.setValueForMode(aliasCollection.modes[0].modeId, {
        r: color.r,
        g: color.g,
        b: color.b,
        a: opacity,
      });
      tokens.forEach((name) => {
        const token = figma.variables.createVariable(
          name,
          collection.id,
          "COLOR"
        );
        token.setValueForMode(modeId, {
          type: "VARIABLE_ALIAS",
          id: parentToken.id,
        });
      });
    } else {
      const token = figma.variables.createVariable(
        tokens[0],
        collection.id,
        "COLOR"
      );
      token.setValueForMode(modeId, {
        r: color.r,
        g: color.g,
        b: color.b,
        a: opacity,
      });
    }
  });
}

function styleToTokenDataMap(into, current) {
  const paints = current.paints.filter(
    ({ visible, type }) => visible && type === "SOLID"
  );
  if (paints.length === 1) {
    const {
      blendMode,
      color: { r, g, b },
      opacity,
      type,
    } = paints[0];
    const hex = rgbToHex({ r, g, b });
    if (blendMode === "NORMAL") {
      const uniqueId = [hex, opacity].join("-");
      into[uniqueId] = into[uniqueId] || {
        color: { r, g, b },
        hex,
        opacity,
        tokens: [],
      };
      into[uniqueId].tokens.push(current.name);
    } else {
      // do something different i guess
    }
  }
  return into;
}

figma.closePlugin();

function rgbToHex({ r, g, b }) {
  const toHex = (value) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)].join("");
  return `#${hex}`;
}
