if (figma.mode === "codegen") {
  figma.codegen.on("preferenceschange", (event) => {
    if (event.propertyName === "example") {
      figma.showUI(
        "<style>body { font-family: system-ui, -apple-system, sans-serif; }</style><p>An iframe for external requests or custom settings!</p>",
        {
          width: 300,
          height: 300,
        }
      );
    }
  });

  figma.showUI(__html__, { visible: false });

  figma.codegen.on("generate", (event) => {
    const { node, language } = event;
    const showAll = !language || language === "all";
    return new Promise(async (resolve) => {
      const { unit, scaleFactor } = figma.codegen.preferences;
      const formatUnit = (number) =>
        unit === "SCALED"
          ? `${(number * scaleFactor).toFixed(3)}su`
          : `${number}px`;
      const nodeObject = {
        type: node.type,
        name: node.name,
        width: formatUnit(node.width),
        height: formatUnit(node.height),
      };

      const blocks =
        language === "weather"
          ? await weatherResult()
          : [
              showAll || language === "html"
                ? {
                    title: `Custom HTML`,
                    code: `<p>${node.name} is a node! Isn't that great??? I really really think so. This is a long line.</p>`,
                    language: "HTML",
                  }
                : null,
              showAll || language === "css"
                ? {
                    title: `Custom CSS`,
                    code: `div { width: ${nodeObject.width}; height: ${nodeObject.height} }`,
                    language: "CSS",
                  }
                : null,
              showAll || language === "js"
                ? {
                    title: `Custom JS`,
                    code: `function log() { console.log(${JSON.stringify(
                      nodeObject
                    )}); }`,
                    language: "JAVASCRIPT",
                  }
                : null,
              showAll || language === "json"
                ? {
                    title: `Custom JSON`,
                    code: JSON.stringify(nodeObject),
                    language: "JSON",
                  }
                : null,
            ].filter(Boolean);

      async function weatherResult() {
        const weather = await (
          await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=37.77&longitude=-122.42&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&forecast_days=1&timezone=America%2FLos_Angeles"
          )
        ).json();
        return [
          {
            title: "Weather 🌦",
            code: JSON.stringify(weather, null, 2),
            language: "JSON",
          },
        ];
      }

      blocks.forEach(({ language, code }, id) => {
        const message = { type: "FORMAT", code, language, id };
        figma.ui.postMessage(message);
      });

      let promiseCount = blocks.length;
      const results = [];
      figma.ui.onmessage = (message) => {
        if (message.type === "FORMAT_RESULT") {
          const item = blocks[message.id];
          results[message.id] = Object.assign(item, {
            code: message.result,
          });
          promiseCount--;
          if (promiseCount <= 0) {
            resolve(results);
          }
        }
      };
    });
  });
}
