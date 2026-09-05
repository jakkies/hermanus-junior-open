import bundledSnapshot from "./official-results-snapshot.js?v=3";
import { calculateStandings, mergeCapturedResults } from "./standings-calculator.js?v=2";

const DEFAULT_RESULTS_URL =
  "https://sportyhq.com/tournament/tv_display/27429";
const LOCAL_CAPTURED_RESULTS_URL = new URL("./captured-results.json", import.meta.url);
const WORKER_CAPTURED_RESULTS_URL = new URL("/api/captured-results", import.meta.url);
const REMOTE_CAPTURED_RESULTS_URL =
  "https://raw.githubusercontent.com/jakkies/hermanus-junior-open/main/js/captured-results.json";

function configuredUrl(key) {
  return globalThis.TournamentFeedConfig?.get?.()[key] || DEFAULT_RESULTS_URL;
}

function tournamentTarget(key) {
  const value = configuredUrl(key);
  const configured = globalThis.TournamentFeedConfig?.parseTournamentUrl?.(value);
  if (configured) return configured;
  const url = new URL(value);
  const match = url.pathname.match(/^\/tournament\/(tv_display|tv_draws)\/(\d+)\/?$/i);
  if (!match) throw new Error(`Invalid ${key} tournament URL`);
  return { url: url.toString(), view: match[1], tournamentId: match[2] };
}

const teamName = team => [team?.player1Name, team?.player2Name].filter(Boolean).join(" / ");
const scoreText = sets => Array.isArray(sets) && sets.length ? sets.join("  ") : "";
const groupLabel = (...teams) => {
  const groupName = teams.map(team => team?.groupName).find(Boolean);
  if (!groupName) return "Group";
  return /^group\b/i.test(groupName) ? groupName : `Group ${groupName}`;
};
const stagePhase = stage => String(stage?.format).toUpperCase() === "ROUND_ROBIN" ? "round-robin" : "knockout";
const stageDraw = stage => stagePhase(stage) === "round-robin"
  ? "round-robin"
  : /back\s*draw/i.test(stage?.name || "") ? "back-draw" : "championship";
const stageRank = stage => {
  if (stagePhase(stage) === "round-robin") return 0;
  const draw = stageDraw(stage) === "back-draw" ? 20 : 10;
  const round = /semi/i.test(stage?.name || "") ? 1 : /final/i.test(stage?.name || "") ? 2 : Number(stage?.stageOrder || 9);
  return draw + round;
};
const titleStatus = status => String(status || "")
  .toLowerCase()
  .replace(/(^|_)\w/g, character => character.replace("_", " ").toUpperCase());

function matchStatus(match, liveShareCodes) {
  if (match.status === "COMPLETED") return "Completed";
  if (liveShareCodes.has(match.scorerShareCode)) return "Live";
  if (["CANCELLED", "VOIDED"].includes(match.status)) return "Cancelled";
  return "Starting Soon";
}

function mapStandings(stages, teams) {
  const groups = new Map();
  stages.filter(stage => stagePhase(stage) === "round-robin").forEach(stage => {
    (stage.standings || []).forEach(entry => {
      const team = teams.get(entry.teamId);
      if (!team) return;
      const groupName = team.groupName || "Group";
      if (!groups.has(groupName)) groups.set(groupName, []);
      groups.get(groupName).push({
        teamId: team.id,
        players: [team.player1Name, team.player2Name].filter(Boolean),
        wins: Number(entry.wins || 0),
        losses: Number(entry.losses || 0),
        pointsFor: Number(entry.pointsFor ?? entry.setsFor ?? 0),
        pointsAgainst: Number(entry.pointsAgainst ?? entry.setsAgainst ?? 0),
        position: Number(entry.position || 0),
        seed: Number(team.seed || 0)
      });
    });
  });

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, rows]) => ({
      name,
      rows: rows
        .sort((a, b) =>
          (a.position || Number.MAX_SAFE_INTEGER) - (b.position || Number.MAX_SAFE_INTEGER) ||
          b.wins - a.wins ||
          (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst) ||
          a.seed - b.seed
        )
        .map((row, index) => ({ ...row, position: row.position || index + 1 }))
    }));
}

function mapStage(stage, teams, liveShareCodes, resultsUrl) {
  const phase = stagePhase(stage);
  const rounds = (stage.rounds || []).map(round => {
    const matches = (round.matches || []).map(match => {
      const teamA = teams.get(match.teamAId);
      const teamB = teams.get(match.teamBId);
      const status = matchStatus(match, liveShareCodes);
      return {
        id: match.id,
        stageId: stage.id,
        stage: stage.name || "Tournament Stage",
        phase,
        draw: stageDraw(stage),
        matchNumber: Number(match.matchNumber || 0),
        court: `Court ${match.court}`,
        division: stage.name || "Tournament Stage",
        group: phase === "round-robin" ? groupLabel(teamA, teamB) : stage.name || "Knock-out",
        round: `Round ${round.roundNumber}`,
        a: teamName(teamA),
        b: teamName(teamB),
        status,
        scoreA: scoreText(match.teamASets),
        scoreB: scoreText(match.teamBSets),
        winner: match.winnerTeamId === match.teamAId ? "a" : match.winnerTeamId === match.teamBId ? "b" : "",
        url: resultsUrl
      };
    });
    return {
      id: round.id,
      number: Number(round.roundNumber || 0),
      name: phase === "round-robin" ? `Round ${round.roundNumber}` : stage.name || `Round ${round.roundNumber}`,
      matches
    };
  });
  const fixtures = rounds.flatMap(round => round.matches);
  const completed = fixtures.length > 0 && fixtures.every(match => match.status === "Completed");
  return {
    id: stage.id,
    name: stage.name || "Tournament Stage",
    format: stage.format || "",
    phase,
    draw: stageDraw(stage),
    order: Number(stage.stageOrder || 0),
    status: completed ? "Completed" : titleStatus(stage.status),
    rounds,
    fixtures
  };
}

export function mapTournamentProgress(progress, club = {}, resultsUrl = DEFAULT_RESULTS_URL) {
  const teams = new Map((progress.teams || []).map(team => [team.id, team]));
  const liveShareCodes = new Set(
    (club.liveCourts || []).map(court => court.shareCode).filter(Boolean)
  );
  const stages = Array.isArray(progress.stages) ? progress.stages : [];
  const mappedStages = stages
    .map(stage => mapStage(stage, teams, liveShareCodes, resultsUrl))
    .filter(stage => stage.fixtures.length)
    .sort((a, b) => stageRank(a) - stageRank(b) || a.order - b.order || a.name.localeCompare(b.name));
  const fixtures = mappedStages.flatMap(stage => stage.fixtures);
  const standings = mapStandings(stages, teams);

  return {
    source: resultsUrl,
    generatedAt: new Date().toISOString(),
    date: progress.tournament?.eventDate || bundledSnapshot.date,
    stage: mappedStages.some(stage => stage.phase === "knockout") ? "Round Robin & Knock-out" : mappedStages[0]?.name || "Tournament setup",
    stages: mappedStages,
    standingsStages: mappedStages,
    fixtures,
    standings,
    isTournamentEmpty: fixtures.length === 0 && standings.length === 0,
    isBundledSnapshot: false
  };
}

async function loadCapturedResults() {
  const minute = Math.floor(Date.now() / 60_000);
  const sources = [
    `${WORKER_CAPTURED_RESULTS_URL}?minute=${minute}`,
    `${REMOTE_CAPTURED_RESULTS_URL}?minute=${minute}`,
    LOCAL_CAPTURED_RESULTS_URL
  ];
  for (const source of sources) {
    try {
      const response = await fetch(source, { cache: "no-store" });
      if (!response.ok) throw new Error(`Captured results returned ${response.status}`);
      const capture = await response.json();
      return {
        capturedAt: String(capture?.capturedAt || ""),
        results: Array.isArray(capture?.results) ? capture.results : []
      };
    } catch (error) {
      console.warn(`Captured results are unavailable from ${source}:`, error);
    }
  }
  return { capturedAt: "", results: [] };
}

function withCapturedResults(snapshot, capture) {
  const capturedResults = capture.results;
  const fixtures = mergeCapturedResults(snapshot.fixtures || [], capturedResults);
  const calculatedStandings = calculateStandings(fixtures);
  const hasCapturedResults = capturedResults.some(result => result.status === "Completed");
  const standings = calculatedStandings.length && (hasCapturedResults || !(snapshot.standings || []).length)
    ? calculatedStandings
    : snapshot.standings || [];
  return {
    ...snapshot,
    fixtures,
    standings,
    capturedAt: capture.capturedAt,
    capturedResultCount: capturedResults.filter(result => result.status === "Completed").length,
    isTournamentEmpty: fixtures.length === 0 && standings.length === 0
  };
}

export async function loadOfficialResults() {
  const capture = await loadCapturedResults();
  const scheduleTarget = tournamentTarget("scheduleUrl");
  const standingsTarget = tournamentTarget("standingsUrl");
  const retargetStages = (stages, url) => (stages || []).map(stage => ({
    ...stage,
    fixtures: (stage.fixtures || []).map(fixture => ({ ...fixture, url })),
    rounds: (stage.rounds || []).map(round => ({
      ...round,
      matches: (round.matches || []).map(fixture => ({ ...fixture, url }))
    }))
  }));
  const scheduleStages = retargetStages(bundledSnapshot.stages, scheduleTarget.url);
  const standingsStages = retargetStages(bundledSnapshot.standingsStages || bundledSnapshot.stages, standingsTarget.url);
  return withCapturedResults({
    ...bundledSnapshot,
    source: scheduleTarget.url,
    standingsSource: standingsTarget.url,
    stages: scheduleStages,
    standingsStages,
    fixtures: scheduleStages.length
      ? scheduleStages.flatMap(stage => stage.fixtures)
      : bundledSnapshot.fixtures.map(fixture => ({ ...fixture, url: scheduleTarget.url })),
    isTournamentEmpty: true,
    isBundledSnapshot: true
  }, capture);
}
