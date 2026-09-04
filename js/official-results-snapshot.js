// Empty fallback used while the Hermanus tournament is waiting for new fixtures.
const resultsUrl = globalThis.TournamentFeedConfig?.get?.().scheduleUrl ||
  "https://sportyhq.com/tournament/tv_display/27429";

export default {
  source: resultsUrl,
  generatedAt: "2026-08-14T00:00:00.000Z",
  date: "",
  stage: "Tournament setup",
  stages: [],
  standingsStages: [],
  standings: [],
  fixtures: [],
  isTournamentEmpty: true
};
