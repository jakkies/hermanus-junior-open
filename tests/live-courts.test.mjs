import test from "node:test";
import assert from "node:assert/strict";
import { countGameWins, liveMatchesByCourt } from "../js/live-courts.js";

test("groups only live matches into their court cards", () => {
  const matches = liveMatchesByCourt([
    { court: "Court 1", status: "Live", a: "Player One", b: "Player Two" },
    { court: "court-1", status: "Live", a: "Player Three", b: "Player Four" },
    { court: "Court 2", status: "Completed", a: "Player Five", b: "Player Six" },
    { court: "Court 4", status: "Live", a: "Player Seven", b: "Player Eight" }
  ]);

  assert.deepEqual(matches.get("Court 1").map(match => match.a), ["Player One", "Player Three"]);
  assert.equal(matches.get("Court 2").length, 0);
  assert.equal(matches.get("Court 3").length, 0);
  assert.equal(matches.get("Court 4")[0].a, "Player Seven");
});

test("counts completed games without treating the current score as a game win", () => {
  assert.equal(countGameWins([11, 6], [7, 7]), 1);
  assert.equal(countGameWins([7, 11], [11, 6]), 1);
  assert.equal(countGameWins([6], [7]), 0);
  assert.equal(countGameWins([13], [15]), 0);
  assert.equal(countGameWins([15], [13]), 1);
});
