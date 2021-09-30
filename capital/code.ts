let countries = [];

figma.showUI(
  `
  <script>
    (async (event) => {
      const res = await fetch("https://api.sampleapis.com/countries/countries");
      const json = await res.json();
      window.parent.postMessage({ pluginMessage: json }, "*");
    })();
  </script>
`,
  { visible: false }
);

figma.parameters.on("input", ({ key, query, result }: ParameterInputEvent) => {
  result.setLoadingMessage("Loading countries...");

  figma.ui.onmessage = (json) => {
    countries = json.map((country, index) => {
      return {
        name: country.name,
        data: {
          index: index,
          name: country.name,
          capital: country.capital,
        },
      };
    });
    result.setSuggestions(countries);
  };

  if (query !== "") {
    result.setSuggestions(
      countries.filter((country) =>
        country.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  }
});

figma.on("run", async ({ parameters }: RunEvent) => {
  const countryName = parameters.country.name;
  const capital = parameters.country.capital;
  figma.closePlugin(`The capital of ${countryName} is ${capital}`);
});
