// This plugin fetches a list of countries from an external API and shows the capital of the selected country

let countries = [];

// Create an invisible iframe UI to use network API's
figma.showUI(
  `<script>
    (async (event) => {
      const res = await fetch("https://api.sampleapis.com/countries/countries");
      const json = await res.json();
      window.parent.postMessage({ pluginMessage: json }, "*");
    })();
  </script>`,
  { visible: false }
);

figma.parameters.on('input', ({ key, query, result }: ParameterInputEvent) => {
  // When fetching data from an external source, it is recommended to show a relevant loading message
  result.setLoadingMessage('Loading countries...');

  // Set the suggestions after the a message has been received from the iframe
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

  // Perform filtering on the suggestions if necessary
  if (query !== '') {
    result.setSuggestions(
      countries.filter((country) =>
        country.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  }
});

figma.on('run', async ({ parameters }: RunEvent) => {
  const countryName = parameters.country.name;
  const capital = parameters.country.capital;
  figma.closePlugin(`The capital of ${countryName} is ${capital}`);
});
