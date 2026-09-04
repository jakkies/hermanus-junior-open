import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const TOURNAMENT_ID = "27429";
const COURTS = [
  { number: 1, feedId: "10660" },
  { number: 2, feedId: "10661" },
  { number: 3, feedId: "10662" },
  { number: 4, feedId: "10663" }
];
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RESULTS_PATH = path.join(PROJECT_ROOT, "js", "captured-results.json");

const normalisePlayer = value => String(value || "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();
const resultKey = result => [normalisePlayer(result.a), normalisePlayer(result.b)].sort().join("|");

function parseScores(value = "") {
  const games = String(value)
    .split(",")
    .map(game => game.trim().match(/^(\d+)\s*-\s*(\d+)$/))
    .filter(Boolean);
  return {
    scoreA: games.map(game => game[1]).join(", "),
    scoreB: games.map(game => game[2]).join(", ")
  };
}

export function parseCourtRow(text, court = "") {
  const lines = String(text || "").split("\n").map(line => line.trim()).filter(Boolean);
  const statusIndex = lines.findIndex(line => line === "Match Completed" || line === "In Progress");
  if (statusIndex < 1) return null;
  const tallyIndex = lines.findIndex((line, index) => index > statusIndex && /^\d+\s*-\s*\d+$/.test(line));
  if (tallyIndex < 0 || !lines[statusIndex + 1] || !lines.at(-1)) return null;

  const status = lines[statusIndex] === "Match Completed" ? "Completed" : "Live";
  const [gamesA, gamesB] = lines[tallyIndex].split("-").map(value => Number(value.trim()));
  const scoreLine = lines[tallyIndex + 1] && lines[tallyIndex + 1] !== lines.at(-1)
    ? lines[tallyIndex + 1]
    : "";
  const scores = parseScores(scoreLine);

  return {
    division: lines[0],
    a: lines[statusIndex + 1],
    b: lines.at(-1),
    ...scores,
    winner: status === "Completed" ? gamesA > gamesB ? "a" : gamesB > gamesA ? "b" : "" : "",
    status,
    ...(court ? { court } : {})
  };
}

export function mergeResults(existing = [], fresh = []) {
  const completed = [];
  const completedByKey = new Map();
  existing.filter(result => result?.status === "Completed").forEach(result => {
    const key = resultKey(result);
    if (!key || completedByKey.has(key)) return;
    completedByKey.set(key, completed.length);
    completed.push(result);
  });

  const liveByKey = new Map();
  fresh.forEach(result => {
    if (!result?.a || !result?.b) return;
    const key = resultKey(result);
    if (result.status === "Completed") {
      const existingIndex = completedByKey.get(key);
      if (existingIndex === undefined) {
        completedByKey.set(key, completed.length);
        completed.push(result);
      } else {
        completed[existingIndex] = { ...completed[existingIndex], ...result };
      }
      liveByKey.delete(key);
    } else if (!completedByKey.has(key)) {
      liveByKey.set(key, result);
    }
  });

  return [...completed, ...liveByKey.values()];
}

async function chromeExecutable() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next common Chrome location.
    }
  }
  throw new Error("Chrome was not found. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.");
}

export async function readCourtFeeds() {
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({
    executablePath: await chromeExecutable(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });
  const context = await browser.newContext({
    locale: "en-ZA",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 1200 }
  });

  try {
    const results = [];
    for (const court of COURTS) {
      const page = await context.newPage();
      const url = `https://sportyhq.com/tournament/tv_scores/${TOURNAMENT_ID}/${court.feedId}`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForSelector("table tr", { timeout: 60_000 });
      const rows = await page.locator("table tr").allInnerTexts();
      const parsed = rows.map(row => parseCourtRow(row, `Court ${court.number}`)).filter(Boolean);
      if (!parsed.length) throw new Error(`No match rows could be parsed for Court ${court.number}`);
      results.push(...parsed);
      await page.close();
    }
    return results;
  } finally {
    await browser.close();
  }
}

function capturedAt(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date).filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  return `${Number(parts.day)} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute} SAST`;
}

async function sync() {
  const previous = JSON.parse(await fs.readFile(RESULTS_PATH, "utf8"));
  const fresh = await readCourtFeeds();
  const results = mergeResults(previous.results, fresh);
  if (JSON.stringify(results) === JSON.stringify(previous.results)) {
    console.log(`SportyHQ is unchanged: ${results.filter(result => result.status === "Completed").length} final, ${results.filter(result => result.status === "Live").length} live.`);
    return;
  }
  const next = { capturedAt: capturedAt(), results };
  await fs.writeFile(RESULTS_PATH, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`SportyHQ synced: ${results.filter(result => result.status === "Completed").length} final, ${results.filter(result => result.status === "Live").length} live.`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  sync().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
