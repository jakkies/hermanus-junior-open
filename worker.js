const RESULTS_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/jakkies/hermanus-junior-open/main/js/captured-results.json";

function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store, max-age=0");
  return new Response(body, { ...init, headers });
}

async function bundledResults(request, env) {
  const url = new URL(request.url);
  url.pathname = "/js/captured-results.json";
  url.search = "";
  const fallback = await env.ASSETS.fetch(new Request(url, request));
  return jsonResponse(fallback.body, {
    status: fallback.status,
    statusText: fallback.statusText,
    headers: fallback.headers
  });
}

export async function capturedResults(request, env) {
  if (!["GET", "HEAD"].includes(request.method)) {
    return jsonResponse(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { allow: "GET, HEAD" }
    });
  }

  const minute = new URL(request.url).searchParams.get("minute") || String(Math.floor(Date.now() / 60_000));
  try {
    const response = await fetch(`${RESULTS_SNAPSHOT_URL}?minute=${encodeURIComponent(minute)}`, {
      cache: "no-store",
      headers: { accept: "application/json" }
    });
    if (!response.ok) throw new Error(`GitHub snapshot returned ${response.status}`);
    const body = await response.text();
    JSON.parse(body);
    return jsonResponse(request.method === "HEAD" ? null : body);
  } catch (error) {
    console.warn("Using bundled SportyHQ results snapshot:", error);
    return bundledResults(request, env);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/captured-results") return capturedResults(request, env);
    return env.ASSETS.fetch(request);
  }
};
