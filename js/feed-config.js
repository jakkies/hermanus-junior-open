(function initialiseFeedConfig(root) {
  "use strict";

  const STORAGE_KEY = "hermanus-junior-squash-open-feed-settings-v1";
  const CHANGE_EVENT = "tournament:feed-config-change";
  const defaults = Object.freeze({
    court1Url: "https://sportyhq.com/tournament/tv_scores/27429/10660",
    court2Url: "https://sportyhq.com/tournament/tv_scores/27429/10661",
    court3Url: "https://sportyhq.com/tournament/tv_scores/27429/10662",
    court4Url: "https://sportyhq.com/tournament/tv_scores/27429/10663",
    scheduleUrl: "https://sportyhq.com/tournament/tv_display/27429",
    standingsUrl: "https://sportyhq.com/tournament/tv_draws/27429"
  });

  function storage() {
    try {
      const candidate = root.localStorage;
      const probe = `${STORAGE_KEY}-probe`;
      candidate.setItem(probe, "1");
      candidate.removeItem(probe);
      return candidate;
    } catch {
      return null;
    }
  }

  function normaliseUrl(value) {
    const url = new URL(String(value || "").trim());
    if (!/(^|\.)sportyhq\.com$/i.test(url.hostname)) throw new Error("Use a sportyhq.com URL.");
    url.hash = "";
    return url.toString();
  }

  function parseCourtUrl(value) {
    try {
      const url = new URL(normaliseUrl(value));
      const match = url.pathname.match(/^\/tournament\/tv_scores\/(\d+)\/(\d+)\/?$/i);
      if (!match) return null;
      return {
        url: url.toString(),
        tournamentId: match[1],
        court: match[2]
      };
    } catch {
      return null;
    }
  }

  function parseTournamentUrl(value) {
    try {
      const url = new URL(normaliseUrl(value));
      const match = url.pathname.match(/^\/tournament\/(tv_display|tv_draws)\/(\d+)\/?$/i);
      if (!match) return null;
      return {
        url: url.toString(),
        view: match[1],
        tournamentId: match[2]
      };
    } catch {
      return null;
    }
  }

  function validate(values) {
    const supplied = values && typeof values === "object" ? values : {};
    const legacyCourtOneKey = "centre" + "CourtUrl";
    const candidate = {
      ...defaults,
      ...supplied,
      court1Url: supplied.court1Url || supplied[legacyCourtOneKey] || defaults.court1Url
    };
    const errors = {};
    const court1 = parseCourtUrl(candidate.court1Url);
    const court2 = parseCourtUrl(candidate.court2Url);
    const court3 = parseCourtUrl(candidate.court3Url);
    const court4 = parseCourtUrl(candidate.court4Url);
    const schedule = parseTournamentUrl(candidate.scheduleUrl);
    const standings = parseTournamentUrl(candidate.standingsUrl);

    if (!court1) errors.court1Url = "Enter a valid SportyHQ court URL.";
    if (!court2) errors.court2Url = "Enter a valid SportyHQ court URL.";
    if (!court3) errors.court3Url = "Enter a valid SportyHQ court URL.";
    if (!court4) errors.court4Url = "Enter a valid SportyHQ court URL.";
    if (!schedule) errors.scheduleUrl = "Enter a valid SportyHQ tournament display URL.";
    if (!standings) errors.standingsUrl = "Enter a valid SportyHQ tournament draws URL.";
    if (court1 && court2 && court1.tournamentId !== court2.tournamentId) {
      errors.court2Url = "Both court feeds must belong to the same SportyHQ tournament.";
    }
    if (court1 && court3 && court1.tournamentId !== court3.tournamentId) {
      errors.court3Url = "All court feeds must belong to the same SportyHQ tournament.";
    }
    if (court1 && court4 && court1.tournamentId !== court4.tournamentId) {
      errors.court4Url = "All court feeds must belong to the same SportyHQ tournament.";
    }
    if (court1 && court2 && String(court1.court).toLowerCase() === String(court2.court).toLowerCase()) {
      errors.court2Url = "Select a different court feed for Court 2.";
    }
    const configuredCourts = [court1, court2, court3, court4];
    configuredCourts.forEach((court, index) => {
      if (!court || index === 0) return;
      const duplicate = configuredCourts.slice(0, index).some(previous =>
        previous && String(previous.court).toLowerCase() === String(court.court).toLowerCase()
      );
      if (duplicate) errors[`court${index + 1}Url`] = `Select a different court feed for Court ${index + 1}.`;
    });

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      value: {
        court1Url: court1?.url || candidate.court1Url,
        court2Url: court2?.url || candidate.court2Url,
        court3Url: court3?.url || candidate.court3Url,
        court4Url: court4?.url || candidate.court4Url,
        scheduleUrl: schedule?.url || candidate.scheduleUrl,
        standingsUrl: standings?.url || candidate.standingsUrl
      },
      parsed: { court1, court2, court3, court4, schedule, standings }
    };
  }

  function get() {
    const store = storage();
    if (!store) return { ...defaults };
    try {
      const saved = JSON.parse(store.getItem(STORAGE_KEY) || "null");
      const result = validate(saved && typeof saved === "object" ? saved : defaults);
      return result.valid ? result.value : { ...defaults };
    } catch {
      return { ...defaults };
    }
  }

  function notify(value) {
    if (typeof root.dispatchEvent !== "function" || typeof root.CustomEvent !== "function") return;
    root.dispatchEvent(new root.CustomEvent(CHANGE_EVENT, { detail: value }));
  }

  function applyLinks(scope) {
    const documentRoot = scope || root.document;
    if (!documentRoot?.querySelectorAll) return;
    const config = get();
    documentRoot.querySelectorAll("[data-feed-url]").forEach(link => {
      const key = link.dataset.feedUrl;
      if (config[key]) link.href = config[key];
    });
  }

  function save(values) {
    const result = validate(values);
    if (!result.valid) {
      const error = new Error("Some feed URLs need attention.");
      error.name = "FeedConfigValidationError";
      error.errors = result.errors;
      throw error;
    }
    const store = storage();
    if (!store) throw new Error("Browser storage is unavailable for this page.");
    store.setItem(STORAGE_KEY, JSON.stringify(result.value));
    applyLinks();
    notify(result.value);
    return result.value;
  }

  function reset() {
    const store = storage();
    if (store) store.removeItem(STORAGE_KEY);
    const value = { ...defaults };
    applyLinks();
    notify(value);
    return value;
  }

  const api = {
    STORAGE_KEY,
    CHANGE_EVENT,
    defaults,
    get,
    save,
    reset,
    validate,
    parseCourtUrl,
    parseTournamentUrl,
    applyLinks
  };

  root.TournamentFeedConfig = api;
  if (typeof module === "object" && module.exports) module.exports = api;

  if (root.document) {
    if (root.document.readyState === "loading") {
      root.document.addEventListener("DOMContentLoaded", () => applyLinks(), { once: true });
    } else {
      applyLinks();
    }
  }
  if (typeof root.addEventListener === "function") {
    root.addEventListener("storage", event => {
      if (event.key !== STORAGE_KEY) return;
      const value = get();
      applyLinks();
      notify(value);
    });
  }
})(typeof window === "object" ? window : globalThis);
