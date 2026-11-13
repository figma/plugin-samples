import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { createOpaqueKey, createPkcePair, safeEqual } from "./security.js";

test("opaque keys contain 256 bits of URL-safe randomness", () => {
  const first = createOpaqueKey();
  const second = createOpaqueKey();

  assert.match(first, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first, second);
});

test("PKCE pair uses an S256 challenge derived from its verifier", () => {
  const pair = createPkcePair();
  const expected = createHash("sha256")
    .update(pair.verifier)
    .digest("base64url");

  assert.match(pair.verifier, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(pair.challenge, expected);
  assert.notEqual(pair.verifier, pair.challenge);
});

test("safeEqual compares equal-length values without accepting different keys", () => {
  assert.equal(safeEqual("same-key", "same-key"), true);
  assert.equal(safeEqual("same-key", "other-key"), false);
  assert.equal(safeEqual("short", "longer"), false);
});
