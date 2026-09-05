const COURTS = ["Court 1", "Court 2", "Court 3", "Court 4"];

const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[character]));

const courtNumber = value => String(value || "").match(/\d+/)?.[0] || "";
const normaliseCourt = value => courtNumber(value) ? `Court ${courtNumber(value)}` : "";
const scoreGames = value => String(value || "")
  .split(",")
  .map(score => Number(score.trim()))
  .filter(Number.isFinite);

export function countGameWins(ownScores, opponentScores) {
  return ownScores.reduce((wins, score, index) => {
    const opponentScore = opponentScores[index];
    const gameIsComplete = Number.isFinite(opponentScore)
      && Math.max(score, opponentScore) >= 11
      && Math.abs(score - opponentScore) >= 2;
    return wins + (gameIsComplete && score > opponentScore ? 1 : 0);
  }, 0);
}

function scoreCells(scores) {
  if (!scores.length) return '<span class="live-court-match__score is-current">–</span>';
  return scores.map((score, index) => `<span class="live-court-match__score${index === scores.length - 1 ? " is-current" : ""}">${escapeHTML(score)}</span>`).join("");
}

function playerRow(name, scores, opponentScores) {
  return `<div class="live-court-match__player">
    <strong>${escapeHTML(name || "Player to be confirmed")}</strong>
    <span class="live-court-match__scores" aria-label="Game scores">${scoreCells(scores)}</span>
    <b class="live-court-match__games" aria-label="Games won">${countGameWins(scores, opponentScores)}</b>
  </div>`;
}

function renderMatch(match, capturedAt) {
  const scoresA = scoreGames(match.scoreA);
  const scoresB = scoreGames(match.scoreB);
  return `<article class="live-court-match" aria-label="${escapeHTML(match.a)} versus ${escapeHTML(match.b)} live score">
    <header class="live-court-match__meta">
      <span class="live-dot"><i></i>Live</span>
      <strong>${escapeHTML(match.division || "Open division")}</strong>
    </header>
    <div class="live-court-match__scoreboard">
      ${playerRow(match.a, scoresA, scoresB)}
      ${playerRow(match.b, scoresB, scoresA)}
    </div>
    <footer><span>Game scores</span>${capturedAt ? `<span>Synced ${escapeHTML(capturedAt)}</span>` : ""}</footer>
  </article>`;
}

function renderWaiting(court, capturedAt) {
  return `<div class="live-court-waiting">
    <span class="status-pill status-pill--soon">Court ready</span>
    <strong>No match is currently scoring</strong>
    <p>${escapeHTML(court)} will update when the next SportyHQ score is captured.</p>
    ${capturedAt ? `<small>Last synced ${escapeHTML(capturedAt)}</small>` : ""}
  </div>`;
}

export function liveMatchesByCourt(fixtures = []) {
  const matches = new Map(COURTS.map(court => [court, []]));
  fixtures.filter(fixture => fixture?.status === "Live").forEach(fixture => {
    const court = normaliseCourt(fixture.court);
    if (matches.has(court)) matches.get(court).push(fixture);
  });
  return matches;
}

export function updateLiveCourts(fixtures = [], snapshot = {}) {
  const matches = liveMatchesByCourt(fixtures);
  COURTS.forEach(court => {
    const root = document.querySelector(`[data-live-court="${court}"]`);
    const card = document.querySelector(`[data-live-court-card="${court}"]`);
    if (!root) return;
    const liveMatches = matches.get(court);
    card?.classList.toggle("has-live-match", liveMatches.length > 0);
    root.innerHTML = liveMatches.length
      ? `<div class="live-court-list">${liveMatches.map(match => renderMatch(match, snapshot.capturedAt)).join("")}</div>`
      : renderWaiting(court, snapshot.capturedAt);
    root.setAttribute("aria-busy", "false");
  });

  const status = document.querySelector("#live-result-status");
  if (!status) return;
  const liveCount = [...matches.values()].reduce((count, courtMatches) => count + courtMatches.length, 0);
  status.dataset.state = liveCount ? "live" : "waiting";
  status.lastChild.textContent = liveCount
    ? `${liveCount} live ${liveCount === 1 ? "match" : "matches"} from SportyHQ${snapshot.capturedAt ? ` · Synced ${snapshot.capturedAt}` : ""} · Refreshes every minute.`
    : `No matches are currently live${snapshot.capturedAt ? ` · Last synced ${snapshot.capturedAt}` : ""} · Refreshes every minute.`;
}
