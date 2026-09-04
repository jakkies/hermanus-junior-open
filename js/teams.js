export function teamsFromFixtures(items = []) {
  const teams = new Map();
  items.forEach(fixture => {
    [fixture.a, fixture.b].forEach(name => {
      const players = String(name || "")
        .split(/\s*\/\s*/)
        .map(player => player.trim())
        .filter(Boolean);
      if (!players.length || players.some(player => /^(tbc|bye|team to be confirmed|winner\b|loser\b)/i.test(player))) return;
      const key = players.map(player => player.toLocaleLowerCase("en-ZA")).sort().join("|");
      if (!teams.has(key)) teams.set(key, { players });
    });
  });
  return [...teams.values()].sort((a, b) =>
    a.players.join(" / ").localeCompare(b.players.join(" / "), "en-ZA")
  );
}
