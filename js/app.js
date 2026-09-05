import { fixtures, standings } from "./data.js?v=7";
import { initialiseNavigation } from "./navigation.js";
import { initialiseSharing } from "./share.js?v=3";
import { loadOfficialResults } from "./official-results.js?v=11";
import { initialiseDraws } from "./draws.js?v=2";
import { initialiseSchedule, updateScheduleResults } from "./schedule.js?v=4";

const OFFICIAL_RESULTS_REFRESH_INTERVAL = 60 * 1000;
let officialResultsRefreshActive = false;
let publicStandingsPhase = "round-robin";

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[character]));
const publicStageMatches = stage => Array.isArray(stage.fixtures)
  ? stage.fixtures
  : (stage.rounds || []).flatMap(round => round.matches || []);
const publicTeamLines = name => String(name || "Player to be confirmed")
  .split(" / ")
  .map(player => `<span>${escapeHTML(player)}</span>`)
  .join("");

function renderPublicKnockoutMatch(match) {
  const team = (side, name, score) => `
    <span class="public-knockout-match__team${match.winner === side ? " is-winner" : ""}">
      <span class="public-knockout-match__players">${publicTeamLines(name)}</span>
      ${score ? `<strong>${escapeHTML(score)}</strong>` : ""}
    </span>`;
  return `
    <article class="public-knockout-match" aria-label="${escapeHTML(match.a)} versus ${escapeHTML(match.b)} result">
      <span class="public-knockout-match__meta"><b>${escapeHTML(match.court)}</b><span>${escapeHTML(match.status)}</span></span>
      ${team("a", match.a, match.scoreA)}
      <small>${match.status === "Completed" ? "Final" : "versus"}</small>
      ${team("b", match.b, match.scoreB)}
    </article>`;
}

function updateStandingsStatus(groups, snapshot = {}) {
  const status = document.querySelector("#standings-result-status");
  if (!status) return;
  const completed = Number(snapshot.fixtures?.filter(match => match.status === "Completed").length || 0);
  status.dataset.state = completed ? "success" : "waiting";
  status.lastChild.textContent = completed
    ? `Calculated from ${completed} completed ${completed === 1 ? "result" : "results"}${snapshot.capturedAt ? ` · Synced ${snapshot.capturedAt}` : ""}.`
    : "Standings will calculate automatically after results are captured.";
}

function renderStandings(groups, stages = [], snapshot = {}) {
  const grid = document.querySelector("#standings-grid");
  if (!grid) return;
  updateStandingsStatus(groups, snapshot);
  if (!groups.length && !stages.some(stage => stage.phase === "knockout")) {
    grid.innerHTML = '<p class="empty-state">The standings will appear once the tournament begins.</p>';
    return;
  }
  const roundRobinCards = groups.map(group => {
    const rows = group.rows.map(entry => `
      <tr>
        <td class="standings-table__rank"><span>${escapeHTML(entry.position)}</span></td>
        <td><span class="standings-table__team">${entry.players.map(player => `<strong>${escapeHTML(player)}</strong>`).join("")}</span></td>
        <td class="standings-table__number">${escapeHTML(entry.played ?? Number(entry.wins || 0) + Number(entry.losses || 0))}</td>
        <td class="standings-table__number">${escapeHTML(entry.wins)}</td>
        <td class="standings-table__number">${escapeHTML(entry.losses)}</td>
        <td class="standings-table__points">${escapeHTML(entry.pointsFor)}–${escapeHTML(entry.pointsAgainst)}</td>
      </tr>`).join("");
    return `<article class="standings-card">
      <div class="standings-card__heading">
        <p class="eyebrow">Round-robin table</p>
        <h4>${escapeHTML(group.name)}</h4>
      </div>
      <div class="table-scroll">
        <table class="standings-table">
          <caption class="sr-only">${escapeHTML(group.name)} standings</caption>
          <thead><tr><th scope="col">#</th><th scope="col">Player</th><th scope="col">P</th><th scope="col">W</th><th scope="col">L</th><th scope="col">Points</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </article>`;
  }).join("");
  const knockout = stages.filter(stage => stage.phase === "knockout");
  const knockoutDraws = [
    { key: "championship", label: "Championship Draw" },
    { key: "back-draw", label: "Back Draw" }
  ].map(draw => {
    const drawStages = knockout.filter(stage => stage.draw === draw.key);
    if (!drawStages.length) return "";
    return `<article class="public-knockout-draw"><header class="public-knockout-draw__heading"><p class="eyebrow">Knock-out</p><h4>${draw.label}</h4></header><div class="public-knockout-stage-grid">${drawStages.map(stage => `<section class="public-knockout-stage"><div class="public-knockout-stage__heading"><h5>${escapeHTML(stage.name)}</h5><span>${escapeHTML(stage.status || "Scheduled")}</span></div>${publicStageMatches(stage).map(renderPublicKnockoutMatch).join("")}</section>`).join("")}</div></article>`;
  }).join("");

  grid.innerHTML = `
    <section class="public-standings-phase" data-public-standings-phase="round-robin" aria-labelledby="public-round-robin-title">
      <header class="public-standings-phase__heading"><div><p class="eyebrow">Phase 1</p><h3 id="public-round-robin-title">Round Robin</h3></div><span>${groups.length} groups</span></header>
      <div class="public-standings-phase__grid">${roundRobinCards}</div>
    </section>
    ${knockout.length ? `<section class="public-standings-phase" data-public-standings-phase="knockout" aria-labelledby="public-knockout-title"><header class="public-standings-phase__heading"><div><p class="eyebrow">Phase 2</p><h3 id="public-knockout-title">Knock-out Results</h3></div><span>${knockout.reduce((total, stage) => total + publicStageMatches(stage).length, 0)} matches</span></header><div class="public-knockout-draw-grid">${knockoutDraws}</div></section>` : ""}`;
  applyPublicStandingsPhase();
}

function applyPublicStandingsPhase() {
  document.querySelectorAll("[data-public-standings-phase]").forEach(section => {
    section.hidden = section.dataset.publicStandingsPhase !== publicStandingsPhase;
  });
}

function initialisePublicStandingsFilter() {
  const switcher = document.querySelector("[data-public-standings-filter]");
  if (!switcher) return;
  switcher.addEventListener("click", event => {
    const button = event.target.closest("button[data-phase]");
    if (!button) return;
    publicStandingsPhase = button.dataset.phase;
    switcher.querySelectorAll("button[data-phase]").forEach(item => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    applyPublicStandingsPhase();
  });
}

async function refreshOfficialResults() {
  if (officialResultsRefreshActive) return;
  officialResultsRefreshActive = true;
  try {
    const snapshot = await loadOfficialResults();
    updateScheduleResults(snapshot.fixtures || [], snapshot);
    renderStandings(snapshot.standings || [], snapshot.standingsStages || snapshot.stages || [], snapshot);
  } catch (error) {
    console.warn("Could not refresh official results:", error);
  } finally {
    officialResultsRefreshActive = false;
  }
}

function initialiseOfficialResults() {
  refreshOfficialResults();
  window.setInterval(() => {
    if (!document.hidden) refreshOfficialResults();
  }, OFFICIAL_RESULTS_REFRESH_INTERVAL);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshOfficialResults();
  });
  window.addEventListener(globalThis.TournamentFeedConfig?.CHANGE_EVENT || "tournament:feed-config-change", () => {
    refreshOfficialResults();
  });
}

function initialiseEnvironment() {
  const time = document.querySelector("[data-local-time]");
  const updateTime = () => {
    if (time) time.textContent = `${new Intl.DateTimeFormat("en-ZA", { timeZone: "Africa/Johannesburg", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())} SAST`;
  };
  updateTime(); window.setInterval(updateTime, 30000);
  const banner = document.querySelector(".offline-banner");
  const sync = () => { if (banner) banner.hidden = navigator.onLine; };
  window.addEventListener("online", sync); window.addEventListener("offline", sync); sync();
}

function initialise() {
  renderStandings(standings);
  initialisePublicStandingsFilter();
  initialiseDraws();
  initialiseSchedule();
  updateScheduleResults(fixtures, { isBundledSnapshot: true });
  initialiseOfficialResults();
  initialiseNavigation();
  initialiseSharing();
  initialiseEnvironment();
}

initialise();
