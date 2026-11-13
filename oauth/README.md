# OAuth with Figma Plugins

This sample demonstrates the OAuth flow required by Figma plugins. The plugin UI runs on a hostname you control, opens the provider's authorization page in a separate browser window, polls your server for the one-time result, and passes the access token to the main plugin code for storage in `figma.clientStorage`.

Figma plugins cannot rely on `window.opener.postMessage()`, custom URL schemes, or a local callback server. The OAuth callback must reach a publicly available HTTPS server that you control. See the [official OAuth with Plugins guide](https://developers.figma.com/docs/plugins/oauth-with-plugins/) before adapting this sample.

## Architecture

1. The plugin redirects its UI iframe to your HTTPS server. The server returns a page on an origin controlled by you.
2. The UI requests a one-time read/write key pair from the server.
3. When the user clicks **Connect account**, the UI opens a top-level browser window to your server. The server sets an HTTP-only, SameSite=Lax cookie and redirects to the OAuth provider with the write key as the `state` value.
4. The provider redirects to your server's callback. The server verifies that the returned state matches both the cookie and the pending session, then exchanges the authorization code.
5. The plugin iframe polls with the read key. The server returns the token once and deletes the session.
6. The UI sends the token to the main plugin code using a message restricted to Figma's origin and the configured plugin ID. The main code stores it with `figma.clientStorage`.

The sample uses PKCE by default. The verifier remains on the server and is used during code exchange. The OAuth client secret is never included in plugin code or the browser UI.

## Configure the plugin

1. Deploy the server described below to a publicly reachable HTTPS origin, for example `https://oauth.example.com`.
2. Replace `https://your-server.example.com` in `code.ts`, `ui.html`, and `manifest.json` with your server origin. Keep the origin identical in all three files.
3. Set the plugin ID in `manifest.json`. Use that exact ID for `FIGMA_PLUGIN_ID` in the server environment.
4. Keep the server origin in `networkAccess.allowedDomains` in the manifest.
5. Import the manifest as a development plugin in Figma.

## Configure and run the server

Register an OAuth application with your provider. Configure its redirect/callback URL to exactly match:

```
https://oauth.example.com/oauth/callback
```

Copy the server configuration and set the provider-specific values:

```sh
cd oauth/server
cp .env.example .env
npm install
npm test
npm start
```

Required environment variables:

- `APP_ORIGIN`: the server's public origin, without a path.
- `FIGMA_PLUGIN_ID`: the exact plugin ID from `manifest.json`.
- `OAUTH_AUTHORIZE_URL` and `OAUTH_TOKEN_URL`: the provider's authorization and token endpoints.
- `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, and `OAUTH_REDIRECT_URI`: the registered OAuth application's credentials and callback URL.

Optional values include `OAUTH_SCOPE`, `OAUTH_USE_PKCE` (defaults to `true`), `OAUTH_CLIENT_AUTH_METHOD` (defaults to `client_secret_basic`; also supports `client_secret_post`), and `PORT`.

The server accepts HTTPS endpoints. Plain HTTP is allowed only for localhost development. The sample expects a provider that supports the OAuth 2.0 authorization-code flow. Keep PKCE enabled whenever the provider supports it.

## Security notes

- Read and write keys are generated from 256 bits of randomness, are separate, expire after five minutes, and can be used only once.
- The write key is set as an HTTP-only, Secure (outside localhost), SameSite=Lax cookie during a top-level navigation. The callback compares the cookie and returned `state` using a timing-safe comparison.
- PKCE protects the authorization code if it is intercepted. The verifier is kept on the server and is not sent to the plugin iframe.
- The polling endpoint rejects a mismatched Origin when one is supplied, does not enable cross-origin access, sends no-store headers, and deletes a result after it is read.
- Access tokens are held only in server memory until the plugin reads the result or the session expires. They are not written to disk or logged. The plugin stores the token locally with `figma.clientStorage`.
- The UI-to-plugin message specifies both the expected Figma origin and the plugin ID. The main plugin code also checks the message origin before accepting a token.

This is an educational, single-process sample, not a complete production identity platform. Its in-memory session store will not work across multiple server instances or survive restarts. Before production use, add provider-specific validation, rate limiting, monitoring that never records credentials, and an encrypted short-lived shared store if you deploy multiple instances. Always test in both the Figma browser experience and the Figma desktop app.

## Run the plugin type check

From the repository root:

```sh
npm install
npx tsc -p oauth/tsconfig.json
```
