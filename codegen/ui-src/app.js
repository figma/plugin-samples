import prettier from "prettier/esm/standalone.mjs";
import parserBabel from "prettier/esm/parser-babel.mjs";
import parserHTML from "prettier/esm/parser-html.mjs";
import parserCSS from "prettier/esm/parser-postcss.mjs";

const PRINT_WIDTH = 50;

function formatCode({ language, code, printWidth = PRINT_WIDTH }) {
  switch (language) {
    case "HTML":
      return prettier.format(code, {
        printWidth,
        parser: "html",
        plugins: [parserHTML],
        htmlWhitespaceSensitivity: "ignore",
        bracketSameLine: false,
      });
    case "CSS":
      return prettier.format(code, {
        printWidth,
        parser: "css",
        plugins: [parserCSS],
      });
    case "JSON":
      return JSON.stringify(JSON.parse(code), null, 2);
    case "JAVASCRIPT":
    case "TYPESCRIPT":
      return prettier.format(code, {
        printWidth,
        parser: "babel-ts",
        plugins: [parserBabel],
        semi: true,
      });
  }
}

window.onmessage = ({ data: { pluginMessage } }) => {
  if (pluginMessage.type === "FORMAT") {
    const result = formatCode(pluginMessage);
    parent.postMessage(
      {
        pluginMessage: {
          id: pluginMessage.id,
          result,
          type: "FORMAT_RESULT",
        },
      },
      "*"
    );
  }
};
