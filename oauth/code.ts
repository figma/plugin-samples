const SERVER_ORIGIN = "https://your-server.example.com";
const TOKEN_STORAGE_KEY = "oauth-access-token";

figma.showUI(__html__, { width: 360, height: 220 });

figma.ui.onmessage = async (message, properties) => {
  // The UI is redirected to a server-controlled origin. Ignore messages from
  // any other origin before reading or writing authentication data.
  if (properties.origin !== SERVER_ORIGIN) {
    return;
  }

  if (message?.type === "ready") {
    const token = await figma.clientStorage.getAsync(TOKEN_STORAGE_KEY);

    // Restrict delivery to the origin hosting this plugin's UI.
    figma.ui.postMessage(
      { type: "token", token: typeof token === "string" ? token : null },
      { origin: SERVER_ORIGIN }
    );
    return;
  }

  if (
    message?.type === "store-token" &&
    typeof message.token === "string" &&
    message.token.length > 0 &&
    message.token.length <= 16384
  ) {
    await figma.clientStorage.setAsync(TOKEN_STORAGE_KEY, message.token);
    figma.ui.postMessage({ type: "token-stored" }, { origin: SERVER_ORIGIN });
  }
};
