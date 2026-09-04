import { tournamentDraws } from "./draws.js?v=2";

const normalisePlayer = value => String(value || "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const fixtureKey = fixture => [normalisePlayer(fixture.a), normalisePlayer(fixture.b)]
  .sort()
  .join("|");

const scoreValues = value => String(value ?? "")
  .match(/\d+/g)
  ?.map(Number)
  .filter(Number.isFinite) || [];

export function gameTotals(fixture) {
  const explicitA = Number(fixture.gamesA);
  const explicitB = Number(fixture.gamesB);
  if (Number.isFinite(explicitA) && Number.isFinite(explicitB)) {
    return { a: explicitA, b: explicitB };
  }

  const scoresA = scoreValues(fixture.scoreA);
  const scoresB = scoreValues(fixture.scoreB);
  if (scoresA.length === 1 && scoresB.length === 1 && Math.max(scoresA[0], scoresB[0]) <= 5) {
    return { a: scoresA[0], b: scoresB[0] };
  }

  const games = Math.min(scoresA.length, scoresB.length);
  let a = 0;
  let b = 0;
  for (let index = 0; index < games; index += 1) {
    if (scoresA[index] > scoresB[index]) a += 1;
    if (scoresB[index] > scoresA[index]) b += 1;
  }
  return { a, b };
}

export function pointTotals(fixture) {
  const scoresA = scoreValues(fixture.scoreA);
  const scoresB = scoreValues(fixture.scoreB);
  if (scoresA.length > 1 || scoresB.length > 1) {
    return {
      a: scoresA.reduce((total, score) => total + score, 0),
      b: scoresB.reduce((total, score) => total + score, 0)
    };
  }
  return gameTotals(fixture);
}

function winnerSide(fixture, games) {
  if (fixture.winner === "a" || fixture.winner === "b") return fixture.winner;
  if (games.a > games.b) return "a";
  if (games.b > games.a) return "b";
  return "";
}

export function mergeCapturedResults(fixtures = [], captured = []) {
  const merged = new Map();
  fixtures.forEach(fixture => {
    if (fixture?.a && fixture?.b) merged.set(fixtureKey(fixture), { ...fixture });
  });
  captured.forEach(result => {
    if (!result?.a || !result?.b) return;
    const key = fixtureKey(result);
    merged.set(key, { ...(merged.get(key) || {}), ...result, status: result.status || "Completed" });
  });
  return [...merged.values()];
}

export function calculateStandings(fixtures = []) {
  const completed = fixtures.filter(fixture => fixture.status === "Completed" &&
    (!fixture.phase || fixture.phase === "round-robin"));
  if (!completed.length) return [];

  return tournamentDraws.flatMap(draw => (draw.groups || []).flatMap(group => {
    const rows = group.players.map(player => ({
      key: normalisePlayer(player.name),
      players: [player.name],
      seed: Number(player.seed || 0),
      initialPosition: Number(player.position || 0),
      played: 0,
      wins: 0,
      losses: 0,
      gamesFor: 0,
      gamesAgainst: 0,
      pointsFor: 0,
      pointsAgainst: 0
    }));
    const players = new Map(rows.map(row => [row.key, row]));
    let completedMatches = 0;

    completed.forEach(fixture => {
      const playerA = players.get(normalisePlayer(fixture.a));
      const playerB = players.get(normalisePlayer(fixture.b));
      if (!playerA || !playerB) return;
      const games = gameTotals(fixture);
      const winner = winnerSide(fixture, games);
      if (!winner) return;

      completedMatches += 1;
      playerA.played += 1;
      playerB.played += 1;
      const points = pointTotals(fixture);
      playerA.gamesFor += games.a;
      playerA.gamesAgainst += games.b;
      playerB.gamesFor += games.b;
      playerB.gamesAgainst += games.a;
      playerA.pointsFor += points.a;
      playerA.pointsAgainst += points.b;
      playerB.pointsFor += points.b;
      playerB.pointsAgainst += points.a;
      if (winner === "a") {
        playerA.wins += 1;
        playerB.losses += 1;
      } else {
        playerB.wins += 1;
        playerA.losses += 1;
      }
    });

    if (!completedMatches) return [];
    const ranked = rows
      .sort((a, b) => b.wins - a.wins ||
        (b.gamesFor / Math.max(1, b.gamesFor + b.gamesAgainst)) -
          (a.gamesFor / Math.max(1, a.gamesFor + a.gamesAgainst)) ||
        (b.pointsFor / Math.max(1, b.pointsFor + b.pointsAgainst)) -
          (a.pointsFor / Math.max(1, a.pointsFor + a.pointsAgainst)) ||
        b.gamesFor - a.gamesFor ||
        b.pointsFor - a.pointsFor ||
        a.initialPosition - b.initialPosition ||
        a.players[0].localeCompare(b.players[0]))
      .map((row, index) => ({ ...row, position: index + 1 }));

    return [{
      name: `${draw.name} · ${group.name}`,
      division: draw.name,
      completedMatches,
      rows: ranked
    }];
  }));
}
