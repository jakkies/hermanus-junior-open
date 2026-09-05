import test from "node:test";
import assert from "node:assert/strict";
import { capturedResults } from "../worker.js";

const snapshot = JSON.stringify({ capturedAt: "5 September 2026, 08:30 SAST", results: [] });

test("proxies the latest GitHub results snapshot without caching", async () => {
  const originalFetch = globalThis.fetch;
  let upstreamUrl = "";
  globalThis.fetch = async url => {
    upstreamUrl = String(url);
    return new Response(snapshot, { status: 200 });
  };

  try {
    const response = await capturedResults(
      new Request("https://example.com/api/captured-results?minute=123"),
      { ASSETS: { fetch: async () => assert.fail("Bundled snapshot should not be used") } }
    );
    assert.match(upstreamUrl, /minute=123$/);
    assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
    assert.deepEqual(await response.json(), JSON.parse(snapshot));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("falls back to the bundled snapshot when GitHub is unavailable", async () => {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  globalThis.fetch = async () => {
    throw new Error("offline");
  };
  console.warn = () => {};

  try {
    const response = await capturedResults(
      new Request("https://example.com/api/captured-results"),
      { ASSETS: { fetch: async () => new Response(snapshot, { status: 200 }) } }
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), JSON.parse(snapshot));
  } finally {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
  }
});
