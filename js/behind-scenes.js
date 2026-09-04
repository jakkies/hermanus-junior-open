import bundledSnapshot from "./behind-scenes-snapshot.js";

const EVENT_ACCOUNT = "https://sportyhq.com/tournament/tv_display/27429";

function snapshotUrls() {
  const sources = [];
  if (window.location.protocol !== "file:") sources.push(new URL("data/behind-scenes.json", window.location.href).href);
  return sources.map(source => {
    const url = new URL(source);
    url.searchParams.set("refresh", Date.now());
    return url.href;
  });
}

export async function loadBehindScenes() {
  let lastError;
  for (const url of snapshotUrls()) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`Behind-the-scenes snapshot returned ${response.status}`);
      const payload = await response.json();
      const posts = Array.isArray(payload?.posts) ? payload.posts.slice(0, 5) : [];
      if (!posts.length) throw new Error("Tournament updates snapshot is invalid");
      return { ...payload, sourceAccounts: [EVENT_ACCOUNT], posts, isBundledSnapshot: false };
    } catch (error) {
      lastError = error;
    }
  }

  if (!Array.isArray(bundledSnapshot.posts) || !bundledSnapshot.posts.length) throw lastError;
  console.warn("Using the bundled tournament-updates snapshot:", lastError);
  return { ...bundledSnapshot, isBundledSnapshot: true };
}
