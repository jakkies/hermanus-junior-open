const SOURCE_URL = "https://sportyhq.com/tournament/tv_draws/27429";

export const tournamentDraws = [
  {
    key: "u15-boys",
    name: "U15 Boys",
    drawId: "135370",
    format: "Two boxes · positional playoffs",
    groups: [
      {
        name: "Box 1",
        players: [
          { position: 1, seed: 7, name: "Christoff Kruger" },
          { position: 2, seed: 5, name: "Christiaan Shaw" },
          { position: 3, seed: 6, name: "Christiaan Krige" },
          { position: 4, seed: 2, name: "Umar Tootla" }
        ]
      },
      {
        name: "Box 2",
        players: [
          { position: 1, seed: 1, name: "Reuben Bekker" },
          { position: 2, seed: 8, name: "Livia Roodt" },
          { position: 3, seed: 4, name: "Johan Pretorius" },
          { position: 4, seed: 3, name: "Sa-ad Tootla" }
        ]
      }
    ],
    brackets: [
      {
        name: "Playoff Bracket 1",
        note: "Top playoff",
        rounds: [
          { name: "Round 1", matches: [
            { id: "A1", a: "TBD", b: "TBD", court: "Court 1", time: "Sat 5 Sep · 10:00" },
            { id: "A2", a: "TBD", b: "TBD", court: "Court 2", time: "Sat 5 Sep · 10:00" }
          ] },
          { name: "Final", matches: [
            { id: "A3", a: "TBD", b: "TBD", court: "Court 1", time: "Sat 5 Sep · 12:00" }
          ] }
        ]
      },
      {
        name: "Playoff Bracket 2",
        note: "Position playoff",
        rounds: [
          { name: "Round 1", matches: [
            { id: "B1", a: "Loser A1", b: "Loser A2", court: "Court 2", time: "Sat 5 Sep · 12:00" }
          ] }
        ]
      },
      {
        name: "Playoff Bracket 3",
        note: "Second playoff",
        rounds: [
          { name: "Round 1", matches: [
            { id: "C1", a: "TBD", b: "TBD", court: "Court 3", time: "Sat 5 Sep · 10:00" },
            { id: "C2", a: "TBD", b: "TBD", court: "Court 4", time: "Sat 5 Sep · 10:00" }
          ] },
          { name: "Round 2", matches: [
            { id: "C3", a: "TBD", b: "TBD", court: "Court 3", time: "Sat 5 Sep · 12:00" }
          ] }
        ]
      },
      {
        name: "Playoff Bracket 4",
        note: "Position playoff",
        rounds: [
          { name: "Round 1", matches: [
            { id: "D1", a: "Loser C1", b: "Loser C2", court: "Court 4", time: "Sat 5 Sep · 12:00" }
          ] }
        ]
      }
    ]
  },
  {
    key: "u17-boys",
    name: "U17 Boys",
    drawId: "135338",
    format: "Three boxes · playoff pools",
    groups: [
      {
        name: "Box 1",
        players: [
          { position: 1, seed: 1, name: "Milton Posthumus" },
          { position: 2, seed: 4, name: "Likhanye Mayile" },
          { position: 3, seed: 7, name: "Oliver Moyo" },
          { position: 4, seed: 10, name: "Evan Potgieter" }
        ]
      },
      {
        name: "Box 2",
        players: [
          { position: 1, seed: 2, name: "NicolaasW Rust" },
          { position: 2, seed: 5, name: "Molibeli Mathibeli" },
          { position: 3, seed: 8, name: "Denwill May" },
          { position: 4, seed: 11, name: "Jade Plaatjies" }
        ]
      },
      {
        name: "Box 3",
        players: [
          { position: 1, seed: 3, name: "Omri Beets" },
          { position: 2, seed: 6, name: "Stephanus Kruger" },
          { position: 3, seed: 9, name: "Janno Kruger" },
          { position: 4, seed: 13, name: "Jamaine Saaiman" },
          { position: 5, seed: 14, name: "Nicolaas van Zyl" }
        ]
      }
    ],
    playoffPools: [
      { name: "Playoff Box 1", description: "Seeds 1–3", players: ["Milton Posthumus", "NicolaasW Rust", "Omri Beets"] },
      { name: "Playoff Box 2", description: "Seeds 4–6", players: ["Likhanye Mayile", "Molibeli Mathibeli", "Stephanus Kruger"] },
      { name: "Playoff Box 3", description: "Seeds 7–9", players: ["Oliver Moyo", "Denwill May", "Janno Kruger"] }
    ]
  },
  {
    key: "u17-playoff",
    name: "U17 Boys Play-off (Positions 10–12)",
    drawId: "136128",
    format: "Separate position playoff",
    status: "The position 10–12 draw is listed on SportyHQ, but its players and matches have not yet been published."
  },
  {
    key: "u19-boys",
    name: "U19 Boys",
    drawId: "134493",
    format: "Single seven-player box",
    groups: [
      {
        name: "Box 1",
        players: [
          { position: 1, seed: 5, name: "Albrezain Pietersen" },
          { position: 2, seed: 4, name: "Yanu Koorts" },
          { position: 3, seed: 1, name: "Sahil Khalfey" },
          { position: 4, seed: 3, name: "Tamara Werneyer" },
          { position: 5, seed: 7, name: "Jesse Swart" },
          { position: 6, seed: 6, name: "Ethan Joubert" },
          { position: 7, seed: 2, name: "Owen Scholtz" }
        ]
      }
    ]
  }
];

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[character]));

function renderPlayers(group) {
  return `<article class="draw-group">
    <header class="draw-group__heading">
      <div><p class="eyebrow">Round robin</p><h4>${escapeHTML(group.name)}</h4></div>
      <span>${group.players.length} players</span>
    </header>
    <ol class="draw-player-list">
      ${group.players.map(player => `<li class="draw-player">
        <span class="draw-player__position">${escapeHTML(player.position)}</span>
        <strong>${escapeHTML(player.name)}</strong>
        <span class="draw-player__seed">Seed ${escapeHTML(player.seed)}</span>
      </li>`).join("")}
    </ol>
  </article>`;
}

function renderBracket(bracket) {
  return `<article class="draw-bracket">
    <header class="draw-bracket__heading">
      <div><p class="eyebrow">${escapeHTML(bracket.note)}</p><h4>${escapeHTML(bracket.name)}</h4></div>
      <span>${bracket.rounds.length} ${bracket.rounds.length === 1 ? "round" : "rounds"}</span>
    </header>
    <div class="draw-bracket__rounds">
      ${bracket.rounds.map(round => `<section class="draw-round">
        <h5>${escapeHTML(round.name)}</h5>
        ${round.matches.map(match => `<article class="draw-match">
          <span class="draw-match__id">${escapeHTML(match.id)}</span>
          <strong>${escapeHTML(match.a)}</strong>
          <small>versus</small>
          <strong>${escapeHTML(match.b)}</strong>
          <span class="draw-match__schedule">${escapeHTML(match.court)} · ${escapeHTML(match.time)}</span>
        </article>`).join("")}
      </section>`).join("")}
    </div>
  </article>`;
}

function renderPlayoffPool(pool) {
  return `<article class="draw-group draw-group--playoff">
    <header class="draw-group__heading">
      <div><p class="eyebrow">${escapeHTML(pool.description)}</p><h4>${escapeHTML(pool.name)}</h4></div>
      <span>3 players</span>
    </header>
    <ol class="draw-player-list">
      ${pool.players.map((player, index) => `<li class="draw-player">
        <span class="draw-player__position">${index + 1}</span>
        <strong>${escapeHTML(player)}</strong>
        <span class="draw-player__seed">Qualifies</span>
      </li>`).join("")}
    </ol>
  </article>`;
}

function renderDraw(draw) {
  const container = document.querySelector("#draw-content");
  if (!container) return;
  const sourceLink = `${SOURCE_URL}#${draw.drawId}`;
  container.innerHTML = `
    <article class="draw-overview">
      <header class="draw-overview__heading">
        <div><p class="eyebrow">Division draw</p><h3>${escapeHTML(draw.name)}</h3></div>
        <span>${escapeHTML(draw.format)}</span>
      </header>
      ${draw.status ? `<div class="draw-unpublished"><span aria-hidden="true">!</span><div><h4>Awaiting publication</h4><p>${escapeHTML(draw.status)}</p></div></div>` : `
        <section class="draw-block" aria-labelledby="${escapeHTML(draw.key)}-boxes">
          <div class="draw-block__heading"><div><p class="eyebrow">Opening phase</p><h3 id="${escapeHTML(draw.key)}-boxes">Box assignments</h3></div><span>${draw.groups.length} ${draw.groups.length === 1 ? "box" : "boxes"}</span></div>
          <div class="draw-groups">${draw.groups.map(renderPlayers).join("")}</div>
        </section>
        ${draw.brackets ? `<section class="draw-block" aria-labelledby="${escapeHTML(draw.key)}-playoffs"><div class="draw-block__heading"><div><p class="eyebrow">Knock-out phase</p><h3 id="${escapeHTML(draw.key)}-playoffs">Playoff brackets</h3></div><span>${draw.brackets.length} brackets</span></div><div class="draw-brackets">${draw.brackets.map(renderBracket).join("")}</div></section>` : ""}
        ${draw.playoffPools ? `<section class="draw-block" aria-labelledby="${escapeHTML(draw.key)}-playoffs"><div class="draw-block__heading"><div><p class="eyebrow">Second phase</p><h3 id="${escapeHTML(draw.key)}-playoffs">Playoff pools</h3></div><span>${draw.playoffPools.length} pools</span></div><div class="draw-groups">${draw.playoffPools.map(renderPlayoffPool).join("")}</div></section>` : ""}
      `}
      <footer class="draw-overview__footer"><span>SportyHQ draw ID ${escapeHTML(draw.drawId)}</span><a href="${sourceLink}" target="_blank" rel="noopener noreferrer">Open source draw ↗</a></footer>
    </article>`;
}

export function initialiseDraws() {
  const tabs = [...document.querySelectorAll("[data-draw-key]")];
  if (!tabs.length) return;
  const activate = tab => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    renderDraw(tournamentDraws.find(draw => draw.key === tab.dataset.drawKey) || tournamentDraws[0]);
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", event => {
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(tabs[next]);
      tabs[next].focus();
    });
  });
  activate(tabs.find(tab => tab.getAttribute("aria-selected") === "true") || tabs[0]);
}
