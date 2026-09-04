import officialResultsSnapshot from "./official-results-snapshot.js?v=3";

// Static event content with a bundled fallback for the live tournament feed.
export const API_CONFIG = {
  liveScoreEndpoint: "",
  refreshInterval: 15000,
  useMockData: true,
  timeout: 8000
};

export const eventData = {
  id: "hermanus-junior-squash-open-2026", name: "Hermanus Junior Squash Open 2026", competition: "Junior Squash",
  city: "Hermanus", country: "South Africa", status: "upcoming",
  officialUrl: globalThis.PadeuceFeedConfig?.get?.().scheduleUrl ||
    "https://padeuce.com/club/hermanus-junior-squash-open/tournament/hermanus-junior-open-2026/results"
};

export const liveMatches = [];

export const fixtures = officialResultsSnapshot.fixtures;
export const standings = officialResultsSnapshot.standings;

export const results = [];
