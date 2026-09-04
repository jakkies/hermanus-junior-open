(function initialiseScoreFormat(root) {
  "use strict";

  const STANDARD_FORMAT = Object.freeze({
    kind: "sets",
    target: null,
    columns: Object.freeze(["Player", "Set 1", "Set 2", "Sets", "Games", "Points"]),
    label: "Live scoring"
  });

  function objectValue(value) {
    if (value && typeof value === "object") return value;
    if (typeof value !== "string") return null;
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  function positiveNumber(...values) {
    for (const value of values) {
      const number = Number(value);
      if (Number.isFinite(number) && number > 0) return number;
    }
    return null;
  }

  function rulesetConfig(match) {
    const ruleset = objectValue(match?.ruleset) || {};
    const candidates = [
      ruleset.config,
      ruleset.customRuleset,
      match?.rulesetConfig,
      match?.ruleset_config,
      match?.customRuleset,
      match?.custom_ruleset
    ];

    for (const candidate of candidates) {
      const config = objectValue(candidate);
      if (config?.match && typeof config.match === "object") return config;
    }
    return null;
  }

  function rulesetIdentity(match) {
    const ruleset = objectValue(match?.ruleset) || {};
    return [
      ruleset.name,
      ruleset.nanoid,
      ruleset.id,
      match?.rulesetId,
      match?.ruleset_id,
      match?.rulesetName,
      match?.rulesetLabel
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function targetFrom(winCondition, fallback) {
    const condition = objectValue(winCondition) || {};
    return positiveNumber(condition.target, condition.count, fallback);
  }

  function formatForPoints(target = 24) {
    return {
      kind: "points",
      target,
      columns: ["Player", "Points"],
      label: `Best of ${target} points`
    };
  }

  function formatForGames(target = 5) {
    return {
      kind: "games",
      target,
      columns: ["Player", "Games", "Point"],
      label: `Race to ${target} games`
    };
  }

  function completedScoreFormat(score) {
    if (!score || (!score.matchComplete && !score.winner)) return null;
    const team1Points = Number(score.team1Points);
    const team2Points = Number(score.team2Points);
    const team1Games = Number(score.team1Games);
    const team2Games = Number(score.team2Games);
    const totalPoints = team1Points + team2Points;
    const totalGames = team1Games + team2Games;
    const cumulativeGames = Number(score.cumulativeTotalGames);

    if (Number.isFinite(totalPoints) && totalPoints >= 24 &&
        (!Number.isFinite(totalGames) || totalGames <= 1) &&
        (!Number.isFinite(cumulativeGames) || cumulativeGames <= 1)) {
      return formatForPoints(24);
    }

    if ((Number.isFinite(totalGames) && totalGames >= 5) ||
        (Number.isFinite(cumulativeGames) && cumulativeGames >= 5)) {
      return formatForGames(5);
    }
    return null;
  }

  function describe(match, score) {
    const config = rulesetConfig(match);
    const matchRules = config?.match;

    if (matchRules) {
      if (matchRules.sets && typeof matchRules.sets === "object") {
        return { ...STANDARD_FORMAT, label: config.name || match?.ruleset?.name || STANDARD_FORMAT.label };
      }

      const target = targetFrom(matchRules.win_condition);
      if (matchRules.games && typeof matchRules.games === "object") {
        return formatForGames(target || 5);
      }

      return formatForPoints(target || 24);
    }

    const identity = rulesetIdentity(match);
    if (/padel[-\s]?pong|fast\s*5/.test(identity)) {
      return formatForGames(5);
    }

    const pointTarget = identity.match(/(?:best\s+of\s+|fixed\s+)?(\d+)\s*(?:point|punt)/)?.[1];
    if (pointTarget) {
      return formatForPoints(Number(pointTarget));
    }

    const completedFormat = completedScoreFormat(score);
    if (completedFormat) return completedFormat;

    return { ...STANDARD_FORMAT, columns: [...STANDARD_FORMAT.columns] };
  }

  const api = { describe, rulesetConfig, completedScoreFormat };
  root.TournamentScoreFormat = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window === "object" ? window : globalThis);
