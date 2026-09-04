// Empty fallback used while the Hermanus tournament is waiting for new fixtures.
const resultsUrl = globalThis.PadeuceFeedConfig?.get?.().scheduleUrl ||
  "https://padeuce.com/club/hermanus-junior-squash-open/tournament/hermanus-junior-open-2026/results";

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
