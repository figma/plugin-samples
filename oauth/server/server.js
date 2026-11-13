import express from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createOpaqueKey, createPkcePair, safeEqual } from "./security.js";

const DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const SESSION_TTL_MS = 5 * 60 * 1000;
const COOKIE_NAME = "oauth_write_key";

function requiredValue(env, key) {
  const value = env[key];
  if (!value) {
    throw new Error("Missing required environment variable: " + key);
  }
  return value;
}

function parseUrl(value, key, allowLocalHttp = false) {
  const parsed = new URL(value);
  const isLocalHost =
    parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

  if (parsed.protocol !== "https:" && !(allowLocalHttp && isLocalHost && parsed.protocol === "http:")) {
    throw new Error(key + " must use HTTPS (HTTP is allowed for localhost development only).");
  }

  return parsed;
}

function loadConfig(env) {
  const appUrl = parseUrl(requiredValue(env, "APP_ORIGIN"), "APP_ORIGIN", true);
  if (appUrl.pathname !== "/" || appUrl.search || appUrl.hash) {
    throw new Error("APP_ORIGIN must be an origin without a path, query, or fragment.");
  }

  const authorizationUrl = parseUrl(
    requiredValue(env, "OAUTH_AUTHORIZE_URL"),
    "OAUTH_AUTHORIZE_URL",
    true
  );
  const tokenUrl = parseUrl(
    requiredValue(env, "OAUTH_TOKEN_URL"),
    "OAUTH_TOKEN_URL",
    true
  );
  const redirectUrl = parseUrl(
    requiredValue(env, "OAUTH_REDIRECT_URI"),
    "OAUTH_REDIRECT_URI",
    true
  );

  if (redirectUrl.origin !== appUrl.origin || redirectUrl.pathname !== "/oauth/callback") {
    throw new Error("OAUTH_REDIRECT_URI must be APP_ORIGIN + /oauth/callback.");
  }

  const authMethod = env.OAUTH_CLIENT_AUTH_METHOD || "client_secret_basic";
  if (!["client_secret_basic", "client_secret_post"].includes(authMethod)) {
    throw new Error("OAUTH_CLIENT_AUTH_METHOD must be client_secret_basic or client_secret_post.");
  }

  return {
    appOrigin: appUrl.origin,
    cookieSecure: appUrl.protocol === "https:",
    pluginId: requiredValue(env, "FIGMA_PLUGIN_ID"),
    authorizationUrl: authorizationUrl.toString(),
    tokenUrl: tokenUrl.toString(),
    clientId: requiredValue(env, "OAUTH_CLIENT_ID"),
    clientSecret: requiredValue(env, "OAUTH_CLIENT_SECRET"),
    redirectUri: redirectUrl.toString(),
    scope: env.OAUTH_SCOPE || "",
    usePkce: env.OAUTH_USE_PKCE !== "false",
    clientAuthMethod: authMethod
  };
}

function readCookie(request, name) {
  const cookieHeader = request.headers.cookie || "";
  const prefix = name + "=";

  for (const part of cookieHeader.split(";")) {
    const cookie = part.trim();
    if (cookie.startsWith(prefix)) {
      return cookie.slice(prefix.length);
    }
  }

  return "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function callbackPage(message) {
  return (
    "<!doctype html><html><head><meta charset=\"utf-8\">" +
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
    "<title>OAuth complete</title></head><body>" +
    "<main><h1>" + escapeHtml(message) + "</h1>" +
    "<p>Return to the Figma plugin to finish connecting your account.</p></main>" +
    "</body></html>"
  );
}

async function exchangeAuthorizationCode(config, session, code) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri
  });

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  if (config.clientAuthMethod === "client_secret_basic") {
    const credentials = Buffer.from(config.clientId + ":" + config.clientSecret).toString("base64");
    headers.Authorization = "Basic " + credentials;
  } else {
    body.set("client_id", config.clientId);
    body.set("client_secret", config.clientSecret);
  }

  if (config.usePkce) {
    body.set("code_verifier", session.verifier);
  }

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers,
    body
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The OAuth token endpoint did not return JSON.");
  }

  if (!response.ok || typeof payload.access_token !== "string" || !payload.access_token) {
    throw new Error("The OAuth token exchange failed.");
  }

  return {
    accessToken: payload.access_token,
    tokenType: typeof payload.token_type === "string" ? payload.token_type : "Bearer",
    expiresIn: Number.isFinite(Number(payload.expires_in)) ? Number(payload.expires_in) : null,
    scope: typeof payload.scope === "string" ? payload.scope : null
  };
}

export function createApp(env = process.env) {
  const config = loadConfig(env);
  const app = express();
  const sessionsByReadKey = new Map();
  const sessionsByWriteKey = new Map();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1kb" }));
  app.use((request, response, next) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Pragma", "no-cache");
    next();
  });

  function removeSession(session) {
    sessionsByReadKey.delete(session.readKey);
    sessionsByWriteKey.delete(session.writeKey);
  }

  function findActiveSession(map, key) {
    const session = map.get(key);
    if (!session) {
      return null;
    }
    if (Date.now() >= session.expiresAt) {
      removeSession(session);
      return null;
    }
    return session;
  }

  function rejectForeignOrigin(request, response, next) {
    const origin = request.get("origin");
    if (origin && origin !== config.appOrigin) {
      return response.sendStatus(403);
    }
    return next();
  }

  const cookieOptions = {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: "lax",
    path: "/oauth/callback",
    maxAge: SESSION_TTL_MS
  };

  app.get("/plugin", async (request, response, next) => {
    try {
      const html = await readFile(path.join(DIRECTORY, "public", "plugin.html"), "utf8");
      response.setHeader(
        "Content-Security-Policy",
        "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; " +
          "connect-src 'self'; frame-ancestors https://www.figma.com; base-uri 'none'; object-src 'none'"
      );
      response.setHeader("Referrer-Policy", "no-referrer");
      response.type("html").send(html.replace("__PLUGIN_ID__", escapeHtml(config.pluginId)));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/sessions", (request, response) => {
    if (request.get("origin") !== config.appOrigin) {
      return response.sendStatus(403);
    }

    const readKey = createOpaqueKey();
    const writeKey = createOpaqueKey();
    const pkce = config.usePkce ? createPkcePair() : { verifier: null, challenge: null };

    const session = {
      readKey,
      writeKey,
      verifier: pkce.verifier,
      challenge: pkce.challenge,
      expiresAt: Date.now() + SESSION_TTL_MS,
      authorizationStarted: false,
      completed: false,
      result: null
    };

    sessionsByReadKey.set(readKey, session);
    sessionsByWriteKey.set(writeKey, session);

    return response.status(201).json({ readKey, writeKey });
  });

  app.get("/oauth/start", (request, response) => {
    const writeKey = typeof request.query.write_key === "string" ? request.query.write_key : "";
    const session = findActiveSession(sessionsByWriteKey, writeKey);

    if (!session || session.authorizationStarted || session.completed) {
      return response.status(400).send(callbackPage("This sign-in request is invalid or expired."));
    }

    session.authorizationStarted = true;
    response.cookie(COOKIE_NAME, writeKey, cookieOptions);

    const authorizationUrl = new URL(config.authorizationUrl);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("client_id", config.clientId);
    authorizationUrl.searchParams.set("redirect_uri", config.redirectUri);
    authorizationUrl.searchParams.set("state", writeKey);

    if (config.scope) {
      authorizationUrl.searchParams.set("scope", config.scope);
    }
    if (config.usePkce) {
      authorizationUrl.searchParams.set("code_challenge", session.challenge);
      authorizationUrl.searchParams.set("code_challenge_method", "S256");
    }

    return response.redirect(302, authorizationUrl.toString());
  });

  app.get("/oauth/callback", async (request, response) => {
    const state = typeof request.query.state === "string" ? request.query.state : "";
    const cookieValue = readCookie(request, COOKIE_NAME);
    const session = findActiveSession(sessionsByWriteKey, state);

    if (
      !session ||
      !session.authorizationStarted ||
      session.completed ||
      !cookieValue ||
      !safeEqual(state, cookieValue)
    ) {
      return response.status(400).send(callbackPage("The sign-in request could not be verified."));
    }

    session.completed = true;
    response.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: "lax",
      path: "/oauth/callback"
    });

    if (request.query.error) {
      session.result = { error: "The OAuth provider did not authorize this request." };
      return response.send(callbackPage("Authorization was not completed."));
    }

    const code = typeof request.query.code === "string" ? request.query.code : "";
    if (!code) {
      session.result = { error: "The OAuth provider did not return an authorization code." };
      return response.status(400).send(callbackPage("The provider did not return an authorization code."));
    }

    try {
      session.result = await exchangeAuthorizationCode(config, session, code);
      return response.send(callbackPage("Authentication complete."));
    } catch {
      // Never log tokens, authorization codes, client credentials, or provider response bodies.
      session.result = { error: "The OAuth token exchange failed. Check the server configuration." };
      return response.status(502).send(callbackPage("Authentication failed. Return to the plugin and try again."));
    }
  });

  app.get("/api/results/:readKey", rejectForeignOrigin, (request, response) => {
    const session = findActiveSession(sessionsByReadKey, request.params.readKey);

    if (!session) {
      return response.status(404).json({ error: "This sign-in session is invalid or expired." });
    }
    if (!session.result) {
      return response.sendStatus(202);
    }

    const result = session.result;
    removeSession(session);
    return response.json(result);
  });

  app.use((error, request, response, next) => {
    // Keep internal errors and credentials out of HTTP responses.
    response.status(500).send("The OAuth sample server encountered an error.");
  });

  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const session of sessionsByReadKey.values()) {
      if (now >= session.expiresAt) {
        removeSession(session);
      }
    }
  }, 60 * 1000);
  cleanupTimer.unref();

  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = createApp();
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log("OAuth sample server listening on port " + port);
  });
}
