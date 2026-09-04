import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateStandings,
  gameTotals,
  mergeCapturedResults
} from "../js/standings-calculator.js";

test("counts individual game scores and ranks a completed match", () => {
  const standings = calculateStandings([{
    division: "U15 Boys",
    a: "Christoff Kruger",
    b: "Christiaan Shaw",
    scoreA: "11 11 8 11",
    scoreB: "5 7 11 9",
    winner: "a",
    status: "Completed"
  }]);

  assert.equal(standings.length, 1);
  assert.equal(standings[0].name, "U15 Boys · Box 1");
  assert.deepEqual(
    standings[0].rows.slice(0, 2).map(row => [row.players[0], row.played, row.wins, row.losses, row.pointsFor, row.pointsAgainst]),
    [["Christoff Kruger", 1, 1, 0, 3, 1], ["Christiaan Krige", 0, 0, 0, 0, 0]]
  );
});

test("accepts a games tally and infers the winner", () => {
  assert.deepEqual(gameTotals({ scoreA: "1", scoreB: "3" }), { a: 1, b: 3 });
  const standings = calculateStandings([{
    a: "Christiaan Shaw",
    b: "Umar Tootla",
    scoreA: "1",
    scoreB: "3",
    status: "Completed"
  }]);
  assert.equal(standings[0].rows[0].players[0], "Umar Tootla");
  assert.equal(standings[0].rows[0].wins, 1);
});

test("ignores live matches until the result is completed", () => {
  assert.deepEqual(calculateStandings([{
    a: "Reuben Bekker",
    b: "Livia Roodt",
    scoreA: "11",
    scoreB: "7",
    status: "Live"
  }]), []);
});

test("captured results override matching feed fixtures", () => {
  const merged = mergeCapturedResults(
    [{ a: "Livia Roodt", b: "Reuben Bekker", status: "Starting Soon", court: "Court 3" }],
    [{ a: "Reuben Bekker", b: "Livia Roodt", status: "Completed", scoreA: "3", scoreB: "0", winner: "a" }]
  );
  assert.equal(merged.length, 1);
  assert.equal(merged[0].status, "Completed");
  assert.equal(merged[0].court, "Court 3");
  assert.equal(merged[0].a, "Reuben Bekker");
});
