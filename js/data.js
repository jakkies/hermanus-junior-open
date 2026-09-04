import officialResultsSnapshot from "./official-results-snapshot.js?v=4";

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
  officialUrl: globalThis.TournamentFeedConfig?.get?.().scheduleUrl ||
    "https://sportyhq.com/tournament/tv_display/27429"
};

export const liveMatches = [];

export const fixtures = officialResultsSnapshot.fixtures;
export const standings = officialResultsSnapshot.standings;

export const results = [];
