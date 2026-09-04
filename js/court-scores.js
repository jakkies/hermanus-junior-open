(() => {
  "use strict";

  const API_BASE = "https://sportyhq.com";
  const REFRESH_INTERVAL = 15000;
  const REQUEST_TIMEOUT = 8000;
  const PLACEHOLDER_CLUB_ID = "hermanus-junior-squash-open";
  let refreshTimer = null;
  let clubStream = null;
  let clubStreamClubId = null;
  const matchStreams = new Map();

  const defaultCourts = {
    court1Url: { clubId: "hermanus-junior-squash-open", court: "1" },
    court2Url: { clubId: "hermanus-junior-squash-open", court: "2" },
    court3Url: { clubId: "hermanus-junior-squash-open", court: "3" },
    court4Url: { clubId: "hermanus-junior-squash-open", court: "4" }
  };

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  };

  function courtTarget(root) {
    const key = root.dataset.courtFeed || `court${root.dataset.courtScore || "1"}Url`;
    const url = window.TournamentFeedConfig?.get?.()[key];
    return window.TournamentFeedConfig?.parseCourtUrl?.(url) || defaultCourts[key] || {
      clubId: defaultCourts.court1Url.clubId,
      court: root.dataset.courtScore
    };
  }

  const courtLabel = (root, court) => root.dataset.courtName || `Court ${court}`;

  async function fetchJSON(url) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`Score request failed with ${response.status}`);
      const data = await response.json();
      if (!data || typeof data !== "object") throw new TypeError("Malformed score response");
      return data;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function renderEmpty(root, court) {
    root.classList.remove("court-score--error", "court-score--sets", "court-score--games", "court-score--points");
    root.replaceChildren();
    const empty = createElement("div", "court-score__empty");
    empty.append(
      createElement("p", "eyebrow", "Waiting for a match"),
      createElement("strong", "", `${courtLabel(root, court)} is ready for the next score.`)
    );
    root.append(empty);
    root.setAttribute("aria-busy", "false");
  }

  function renderError(root) {
    root.classList.remove("court-score--sets", "court-score--games", "court-score--points");
    root.classList.add("court-score--error");
    root.replaceChildren(createElement("p", "court-score__empty", "The live score is temporarily unavailable."));
    root.setAttribute("aria-busy", "false");
  }

  function createScoreNumber(value, points = false) {
    return createElement("strong", `court-score__number${points ? " court-score__number--points" : ""}`, value ?? "–");
  }

  function numericScore(score, side, field) {
    const value = score[`team${side}${field}`];
    const number = Number(value);
    return Number.isFinite(number) ? number : value ?? "–";
  }

  function formatPoints(score, side) {
    const own = Number(side === 1 ? score.team1Points : score.team2Points);
    const opponent = Number(side === 1 ? score.team2Points : score.team1Points);
    const fallback = side === 1 ? score.team1PointsDisplay : score.team2PointsDisplay;

    if (!Number.isFinite(own) || !Number.isFinite(opponent)) return fallback ?? "–";
    if (score.isInTiebreak) return String(own);

    if (own >= 3 && opponent >= 3) {
      if (own === opponent) return "40";
      if (own === opponent + 1) return "AD";
      if (opponent === own + 1) return "40";
    }

    return ["0", "15", "30", "40"][Math.min(own, 3)];
  }

  function setGames(score, side, setIndex) {
    const setScore = Array.isArray(score.setScores) ? score.setScores[setIndex] : null;
    if (setScore) return side === 1 ? setScore.team1 : setScore.team2;

    const completedSets = Number(score.team1Sets || 0) + Number(score.team2Sets || 0);
    if (completedSets === setIndex) {
      return side === 1 ? score.team1Games : score.team2Games;
    }
    return "–";
  }

  function createTeamRow(name, side, score, format, completed = false) {
    const row = createElement("div", "court-score__team");
    const teamName = createElement("div", "court-score__name", name || `Player ${side}`);
    if (!completed && !score.winner && score.servingTeam === side) {
      const serving = createElement("i", "court-score__serve");
      serving.setAttribute("title", "Serving");
      serving.setAttribute("aria-label", "serving");
      teamName.append(serving);
    }

    row.append(teamName);
    if (format.kind === "points") {
      row.append(createScoreNumber(numericScore(score, side, "Points"), true));
    } else if (format.kind === "games") {
      row.append(
        createScoreNumber(numericScore(score, side, "Games"), true),
        createScoreNumber(score.winner ? "–" : formatPoints(score, side))
      );
    } else {
      row.append(
        createScoreNumber(setGames(score, side, 0)),
        createScoreNumber(setGames(score, side, 1)),
        createScoreNumber(numericScore(score, side, "Sets")),
        createScoreNumber(numericScore(score, side, "Games")),
        createScoreNumber(formatPoints(score, side), true)
      );
    }
    return row;
  }

  function formatProgress(format, score, completed) {
    if (completed) return "Completed";
    if (format.kind === "points") {
      const team1 = Number(score.team1Points);
      const team2 = Number(score.team2Points);
      const played = Number.isFinite(team1) && Number.isFinite(team2) ? team1 + team2 : null;
      return played === null ? format.label : `${Math.min(played, format.target)} / ${format.target} points`;
    }
    if (format.kind === "games") {
      const team1 = Number(score.team1Games);
      const team2 = Number(score.team2Games);
      const leader = Number.isFinite(team1) && Number.isFinite(team2) ? Math.max(team1, team2) : null;
      return leader === null ? format.label : `${Math.min(leader, format.target)} / ${format.target} games`;
    }
    const currentSet = Math.max(1, Number(score.team1Sets || 0) + Number(score.team2Sets || 0) + 1);
    return `Set ${currentSet}`;
  }

  function renderMatch(root, courtMatch, payload, completed = false) {
    const match = payload.match || {};
    const score = payload.score || {};
    const format = window.TournamentScoreFormat?.describe?.(match, score) || {
      kind: "sets",
      columns: ["Player", "Set 1", "Set 2", "Sets", "Games", "Points"],
      label: match.ruleset?.name || "Live scoring"
    };

    root.classList.remove("court-score--error", "court-score--sets", "court-score--games", "court-score--points");
    root.classList.add(`court-score--${format.kind}`);
    root.replaceChildren();

    const status = createElement("div", "court-score__status");
    const state = createElement("span", completed ? "status-pill status-pill--completed" : "live-dot", completed ? "Final" : "Live");
    if (!completed) state.prepend(createElement("i"));
    status.append(state, createElement("span", "court-score__set", formatProgress(format, score, completed)));

    const columns = createElement("div", "court-score__columns");
    format.columns.forEach(label => columns.append(createElement("span", "", label)));

    const footer = createElement("div", "court-score__footer");
    const updated = new Date(match.lastActivityAt || courtMatch.lastActivityAt || Date.now());
    footer.append(
      createElement("span", "", `Updated ${updated.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}`),
      createElement("span", "", format.label)
    );

    root.append(
      status,
      columns,
      createTeamRow(match.teamAName || courtMatch.teamAName, 1, score, format, completed),
      createTeamRow(match.teamBName || courtMatch.teamBName, 2, score, format, completed),
      footer
    );
    root.setAttribute("aria-busy", "false");
  }

  function findCourtRoot(court) {
    return [...document.querySelectorAll("[data-court-score]")]
      .find(root => String(courtTarget(root).court).toLowerCase() === String(court).toLowerCase());
  }

  function closeMatchStream(matchId) {
    const entry = matchStreams.get(matchId);
    if (!entry) return;
    entry.source.close();
    matchStreams.delete(matchId);
  }

  function syncMatchStreams(liveCourts, payloads) {
    const activeMatchIds = new Set(liveCourts.map(court => court.matchId));

    [...matchStreams.keys()].forEach(matchId => {
      if (!activeMatchIds.has(matchId)) closeMatchStream(matchId);
    });

    liveCourts.forEach(courtMatch => {
      const initial = payloads.find(item => item.court.matchId === courtMatch.matchId)?.payload;
      const existing = matchStreams.get(courtMatch.matchId);
      if (existing) {
        existing.courtMatch = courtMatch;
        if (initial) existing.payload = initial;
        return;
      }

      const source = new EventSource(`${API_BASE}/match/${encodeURIComponent(courtMatch.matchId)}/stream`);
      const entry = { source, courtMatch, payload: initial || {} };
      matchStreams.set(courtMatch.matchId, entry);

      source.onmessage = event => {
        try {
          const update = JSON.parse(event.data);
          if (!update || typeof update !== "object") return;

          entry.payload = {
            match: { ...(entry.payload.match || {}), ...(update.match || {}) },
            score: update.score || entry.payload.score
          };

          if (entry.payload.score) {
            const root = findCourtRoot(entry.courtMatch.court);
            if (root) renderMatch(root, entry.courtMatch, entry.payload);
          }

          if (update.match?.status === "COMPLETED") {
            closeMatchStream(entry.courtMatch.matchId);
            refreshScores();
          }
        } catch (error) {
          console.error("Live point update failed:", error);
        }
      };

      // Polling remains active as a fallback if the real-time stream disconnects.
      source.onerror = () => {};
    });
  }

  function connectClubStream() {
    const root = document.querySelector("[data-court-score]");
    if (!root) return;
    const clubId = courtTarget(root).clubId;
    if (clubId === PLACEHOLDER_CLUB_ID) return;
    if (clubStream && clubStreamClubId === clubId) return;
    if (clubStream) clubStream.close();
    clubStream = new EventSource(`${API_BASE}/club/${encodeURIComponent(clubId)}/stream`);
    clubStreamClubId = clubId;
    clubStream.onmessage = event => {
      try {
        const update = JSON.parse(event.data);
        if (update?.type === "club_update") refreshScores();
      } catch (error) {
        console.error("Club score update failed:", error);
      }
    };
    clubStream.onerror = () => {};
  }

  async function completedMatchPayload(completed) {
    const summary = completed && typeof completed === "object" ? completed : {};
    const fallback = { match: summary, score: summary.score || {} };
    const matchId = summary.matchId || summary.id || summary.score?.matchId;
    if (!matchId || window.TournamentScoreFormat?.rulesetConfig?.(summary)) return fallback;

    try {
      const payload = await fetchJSON(`${API_BASE}/match/${encodeURIComponent(matchId)}`);
      return {
        match: { ...summary, ...(payload.match || {}) },
        score: payload.score || summary.score || {}
      };
    } catch (error) {
      console.warn(`Completed match details unavailable for ${matchId}:`, error);
      return fallback;
    }
  }

  function closeStreams() {
    if (clubStream) {
      clubStream.close();
      clubStream = null;
      clubStreamClubId = null;
    }
    [...matchStreams.keys()].forEach(closeMatchStream);
  }

  async function refreshScores() {
    const roots = [...document.querySelectorAll("[data-court-score]")];
    if (!roots.length) return;

    try {
      const targets = new Map(roots.map(root => [root, courtTarget(root)]));
      const clubId = targets.values().next().value.clubId;
      if (clubId === PLACEHOLDER_CLUB_ID) {
        roots.forEach(root => renderEmpty(root, targets.get(root).court));
        return;
      }
      const club = await fetchJSON(`${API_BASE}/club/${encodeURIComponent(clubId)}`);
      const liveCourts = Array.isArray(club.liveCourts) ? club.liveCourts : [];
      const completedCourts = club.completed && typeof club.completed === "object" ? club.completed : {};
      const payloads = await Promise.all(
        liveCourts.map(async court => ({
          court,
          payload: await fetchJSON(`${API_BASE}/match/${encodeURIComponent(court.matchId)}`)
        }))
      );
      const completedPayloads = await Promise.all(
        Object.entries(completedCourts).map(async ([court, completed]) => ({
          court,
          summary: completed,
          payload: await completedMatchPayload(completed)
        }))
      );
      syncMatchStreams(liveCourts, payloads);

      roots.forEach(root => {
        const courtName = targets.get(root).court;
        const live = payloads.find(item => String(item.court.court).toLowerCase() === String(courtName).toLowerCase());
        const completedEntry = completedPayloads.find(item => String(item.court).toLowerCase() === String(courtName).toLowerCase());
        if (live) {
          renderMatch(root, live.court, live.payload);
        } else if (completedEntry?.payload?.score) {
          renderMatch(root, completedEntry.summary, completedEntry.payload, true);
        } else {
          renderEmpty(root, courtName);
        }
      });
    } catch (error) {
      console.error("Court score refresh failed:", error);
      roots.forEach(root => renderError(root));
    }
  }

  function startPolling() {
    if (refreshTimer) window.clearInterval(refreshTimer);
    refreshTimer = window.setInterval(refreshScores, REFRESH_INTERVAL);
  }

  function initialise() {
    refreshScores();
    startPolling();
    connectClubStream();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (refreshTimer) window.clearInterval(refreshTimer);
        refreshTimer = null;
        closeStreams();
      } else {
        refreshScores();
        startPolling();
        connectClubStream();
      }
    });

    window.addEventListener("online", () => {
      refreshScores();
      connectClubStream();
    });
    window.addEventListener(window.TournamentFeedConfig?.CHANGE_EVENT || "tournament:feed-config-change", () => {
      closeStreams();
      refreshScores();
      connectClubStream();
    });
    window.addEventListener("beforeunload", closeStreams);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise, { once: true });
  } else {
    initialise();
  }
})();
