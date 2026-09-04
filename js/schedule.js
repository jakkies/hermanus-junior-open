const schedule = [
  ["friday", "4:00pm", "Court 3", "U15 Boys", "Reuben Bekker", "Livia Roodt"],
  ["friday", "4:00pm", "Court 2", "U15 Boys", "Christiaan Krige", "Umar Tootla"],
  ["friday", "4:00pm", "Court 4", "U15 Boys", "Christoff Kruger", "Christiaan Shaw"],
  ["friday", "4:00pm", "Court 1", "U19 Boys", "Sahil Khalfey", "Ethan Joubert"],
  ["friday", "4:30pm", "Court 4", "U17 Boys", "Denwill May", "Jade Plaatjies"],
  ["friday", "4:30pm", "Court 3", "U17 Boys", "Omri Beets", "Jamaine Saaiman"],
  ["friday", "4:30pm", "Court 2", "U17 Boys", "Oliver Moyo", "Evan Potgieter"],
  ["friday", "4:30pm", "Court 1", "U17 Boys", "Milton Posthumus", "Likhanye Mayile"],
  ["friday", "5:00pm", "Court 3", "U19 Boys", "Albrezain Pietersen", "Sahil Khalfey"],
  ["friday", "5:00pm", "Court 2", "U17 Boys", "Janno Kruger", "Nicolaas van Zyl"],
  ["friday", "5:00pm", "Court 1", "U17 Boys", "NicolaasW Rust", "Molibeli Mathibeli"],
  ["friday", "5:00pm", "Court 4", "U19 Boys", "Yanu Koorts", "Tamara Werneyer"],
  ["friday", "5:30pm", "Court 4", "U15 Boys", "Livia Roodt", "Sa-ad Tootla"],
  ["friday", "5:30pm", "Court 3", "U15 Boys", "Reuben Bekker", "Johan Pretorius"],
  ["friday", "5:30pm", "Court 2", "U15 Boys", "Christiaan Shaw", "Umar Tootla"],
  ["friday", "5:30pm", "Court 1", "U19 Boys", "Jesse Swart", "Owen Scholtz"],
  ["friday", "6:00pm", "Court 3", "U15 Boys", "Christoff Kruger", "Christiaan Krige"],
  ["friday", "6:00pm", "Court 4", "U17 Boys", "Omri Beets", "Stephanus Kruger"],
  ["friday", "6:00pm", "Court 2", "U17 Boys", "Likhanye Mayile", "Evan Potgieter"],
  ["friday", "6:30pm", "Court 3", "U19 Boys", "Albrezain Pietersen", "Ethan Joubert"],
  ["friday", "6:30pm", "Court 2", "U17 Boys", "Janno Kruger", "Jamaine Saaiman"],
  ["friday", "6:30pm", "Court 4", "U17 Boys", "NicolaasW Rust", "Denwill May"],
  ["friday", "6:30pm", "Court 1", "U17 Boys", "Milton Posthumus", "Oliver Moyo"],
  ["friday", "7:00pm", "Court 1", "U15 Boys", "Johan Pretorius", "Sa-ad Tootla"],
  ["friday", "7:00pm", "Court 2", "U19 Boys", "Yanu Koorts", "Jesse Swart"],
  ["friday", "7:00pm", "Court 3", "U19 Boys", "Tamara Werneyer", "Owen Scholtz"],
  ["friday", "7:00pm", "Court 4", "U17 Boys", "Molibeli Mathibeli", "Jade Plaatjies"],
  ["saturday", "8:00am", "Court 4", "U15 Boys", "Livia Roodt", "Johan Pretorius"],
  ["saturday", "8:00am", "Court 3", "U15 Boys", "Reuben Bekker", "Sa-ad Tootla"],
  ["saturday", "8:00am", "Court 2", "U15 Boys", "Christiaan Shaw", "Christiaan Krige"],
  ["saturday", "8:00am", "Court 1", "U15 Boys", "Christoff Kruger", "Umar Tootla"],
  ["saturday", "8:30am", "Court 3", "U17 Boys", "NicolaasW Rust", "Jade Plaatjies"],
  ["saturday", "8:30am", "Court 4", "U17 Boys", "Molibeli Mathibeli", "Denwill May"],
  ["saturday", "8:30am", "Court 2", "U17 Boys", "Jamaine Saaiman", "Nicolaas van Zyl"],
  ["saturday", "8:30am", "Court 1", "U17 Boys", "Stephanus Kruger", "Janno Kruger"],
  ["saturday", "9:00am", "Court 1", "U17 Boys", "Milton Posthumus", "Evan Potgieter"],
  ["saturday", "9:00am", "Court 3", "U19 Boys", "Albrezain Pietersen", "Jesse Swart"],
  ["saturday", "9:00am", "Court 2", "U17 Boys", "Likhanye Mayile", "Oliver Moyo"],
  ["saturday", "9:00am", "Court 4", "U19 Boys", "Yanu Koorts", "Ethan Joubert"],
  ["saturday", "9:30am", "Court 1", "U19 Boys", "Sahil Khalfey", "Owen Scholtz"],
  ["saturday", "10:30am", "Court 2", "U17 Boys", "Stephanus Kruger", "Jamaine Saaiman"],
  ["saturday", "10:30am", "Court 1", "U17 Boys", "Omri Beets", "Nicolaas van Zyl"],
  ["saturday", "10:30am", "Court 3", "U19 Boys", "Jesse Swart", "Ethan Joubert"],
  ["saturday", "11:00am", "Court 2", "U19 Boys", "Sahil Khalfey", "Tamara Werneyer"],
  ["saturday", "11:00am", "Court 1", "U19 Boys", "Yanu Koorts", "Owen Scholtz"],
  ["saturday", "12:30pm", "Court 1", "U19 Boys", "Tamara Werneyer", "Jesse Swart"],
  ["saturday", "12:30pm", "Court 2", "U19 Boys", "Albrezain Pietersen", "Yanu Koorts"],
  ["saturday", "12:30pm", "Court 3", "U17 Boys", "Omri Beets", "Janno Kruger"],
  ["saturday", "12:30pm", "Court 4", "U17 Boys", "Stephanus Kruger", "Nicolaas van Zyl"],
  ["saturday", "1:30pm", "Court 1", "U19 Boys", "Ethan Joubert", "Owen Scholtz"],
  ["saturday", "2:00pm", "Court 1", "U19 Boys", "Yanu Koorts", "Sahil Khalfey"],
  ["saturday", "2:00pm", "Court 2", "U19 Boys", "Albrezain Pietersen", "Tamara Werneyer"],
  ["saturday", "3:30pm", "Court 2", "U19 Boys", "Tamara Werneyer", "Ethan Joubert"],
  ["saturday", "3:30pm", "Court 3", "U19 Boys", "Albrezain Pietersen", "Owen Scholtz"],
  ["saturday", "3:30pm", "Court 1", "U19 Boys", "Sahil Khalfey", "Jesse Swart"]
];

const dayDetails = {
  friday: { label: "Friday", date: "4 September" },
  saturday: { label: "Saturday", date: "5 September" }
};

let activeDay = "friday";
let activeDivision = "all";
let resultLookup = new Map();

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[character]));
const displayTime = value => String(value).replace(/(am|pm)$/i, " $1").toUpperCase();
const courtOrder = value => Number(String(value).match(/\d+/)?.[0]) || Number.MAX_SAFE_INTEGER;
const normalisePlayer = value => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const resultKey = (playerA, playerB) => [normalisePlayer(playerA), normalisePlayer(playerB)].sort().join("|");
const cleanScore = value => String(value || "").trim().replace(/\s+/g, " ");

function alignedResult(match) {
  const [, , , , playerA, playerB] = match;
  const result = resultLookup.get(resultKey(playerA, playerB));
  if (!result) return null;
  const sameOrder = normalisePlayer(result.a) === normalisePlayer(playerA);
  return {
    status: result.status || "Scheduled",
    scoreA: cleanScore(sameOrder ? result.scoreA : result.scoreB),
    scoreB: cleanScore(sameOrder ? result.scoreB : result.scoreA),
    winner: result.winner ? (sameOrder ? result.winner : result.winner === "a" ? "b" : "a") : ""
  };
}

function renderMatch(match) {
  const [, , court, division, playerA, playerB] = match;
  const result = alignedResult(match);
  const status = result?.status === "Completed" ? "Final" : result?.status === "Live" ? "Live" : "Scheduled";
  const statusClass = status === "Final" ? " is-final" : status === "Live" ? " is-live" : "";
  const player = (side, name, score) => `<span class="schedule-match__player${result?.winner === side ? " is-winner" : ""}"><strong>${escapeHTML(name)}</strong>${score ? `<b>${escapeHTML(score)}</b>` : ""}</span>`;
  return `<article class="schedule-match${statusClass}" data-division="${escapeHTML(division)}">
    <header class="schedule-match__meta"><span>${escapeHTML(division)}</span><span class="schedule-match__status${statusClass}">${status}</span><strong>${escapeHTML(court)}</strong></header>
    <div class="schedule-match__players">
      ${player("a", playerA, result?.scoreA)}
      <small>${status === "Final" ? "Final score" : status === "Live" ? "Live score" : "versus"}</small>
      ${player("b", playerB, result?.scoreB)}
    </div>
  </article>`;
}

function renderSchedule(day, division) {
  const feed = document.querySelector("#schedule-feed");
  const summary = document.querySelector("#schedule-summary");
  if (!feed || !summary) return;
  const visibleMatches = schedule.filter(match => match[0] === day && (division === "all" || match[3] === division));
  const groups = new Map();
  visibleMatches.forEach(match => {
    const time = match[1];
    if (!groups.has(time)) groups.set(time, []);
    groups.get(time).push(match);
  });
  const detail = dayDetails[day];
  const visibleResults = visibleMatches.map(alignedResult).filter(Boolean);
  const liveCount = visibleResults.filter(result => result.status === "Live").length;
  const finalCount = visibleResults.filter(result => result.status === "Completed").length;
  const resultSummary = `${liveCount ? ` · ${liveCount} live` : ""}${finalCount ? ` · ${finalCount} final` : ""}`;
  summary.innerHTML = `<strong>${visibleMatches.length} ${visibleMatches.length === 1 ? "match" : "matches"}</strong><span>${escapeHTML(detail.label)}, ${escapeHTML(detail.date)}${division === "all" ? " · All divisions" : ` · ${escapeHTML(division)}`}${resultSummary}</span>`;
  if (!visibleMatches.length) {
    feed.innerHTML = '<p class="empty-state">No matches are published for this day and division.</p>';
    return;
  }
  feed.innerHTML = [...groups.entries()].map(([time, matches]) => `<section class="schedule-slot" aria-label="${escapeHTML(displayTime(time))}">
    <time class="schedule-slot__time">${escapeHTML(displayTime(time))}</time>
    <div class="schedule-slot__matches">${[...matches].sort((a, b) => courtOrder(a[2]) - courtOrder(b[2])).map(renderMatch).join("")}</div>
  </section>`).join("");
}

export function initialiseSchedule() {
  const dayButtons = [...document.querySelectorAll("[data-schedule-days] button[data-day]")];
  const divisionButtons = [...document.querySelectorAll("[data-schedule-divisions] button[data-division]")];
  if (!dayButtons.length || !divisionButtons.length) return;
  const setPressed = (buttons, active) => buttons.forEach(button => button.setAttribute("aria-pressed", String(button === active)));
  dayButtons.forEach(button => button.addEventListener("click", () => {
    activeDay = button.dataset.day;
    setPressed(dayButtons, button);
    renderSchedule(activeDay, activeDivision);
  }));
  divisionButtons.forEach(button => button.addEventListener("click", () => {
    activeDivision = button.dataset.division;
    setPressed(divisionButtons, button);
    renderSchedule(activeDay, activeDivision);
  }));
  renderSchedule(activeDay, activeDivision);
}

export function updateScheduleResults(fixtures = [], options = {}) {
  resultLookup = new Map();
  fixtures
    .filter(fixture => !fixture.phase || fixture.phase === "round-robin")
    .forEach(fixture => {
      if (!fixture.a || !fixture.b) return;
      resultLookup.set(resultKey(fixture.a, fixture.b), fixture);
    });

  const status = document.querySelector("#schedule-result-status");
  if (status) {
    const hasResults = [...resultLookup.values()].some(fixture => fixture.status === "Live" || fixture.status === "Completed");
    const completed = [...resultLookup.values()].filter(fixture => fixture.status === "Completed").length;
    const live = [...resultLookup.values()].filter(fixture => fixture.status === "Live").length;
    status.dataset.state = live ? "live" : hasResults ? "success" : "waiting";
    if (live) {
      status.lastChild.textContent = `Schedule from SportyHQ · ${live} live ${live === 1 ? "match" : "matches"}${completed ? ` · ${completed} final` : ""}${options.capturedAt ? ` · Synced ${options.capturedAt}` : ""}.`;
    } else if (completed) {
      status.lastChild.textContent = `Schedule from SportyHQ · ${completed} final ${completed === 1 ? "result" : "results"}${options.capturedAt ? ` · Synced ${options.capturedAt}` : ""}.`;
    } else {
      status.lastChild.textContent = options.isBundledSnapshot
        ? "Schedule from SportyHQ · Waiting for live results."
        : "Schedule from SportyHQ · Results refresh every minute.";
    }
  }
  renderSchedule(activeDay, activeDivision);
}
