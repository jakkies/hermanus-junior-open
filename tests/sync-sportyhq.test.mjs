import test from "node:test";
import assert from "node:assert/strict";
import { mergeResults, parseCourtRow } from "../scripts/sync-sportyhq.mjs";

test("parses a completed SportyHQ court row", () => {
  assert.deepEqual(parseCourtRow(`U17 Boys\nMatch Completed\nJanno Kruger\n3 - 2\n9-11 , 11-9 , 11-5 , 6-11 , 11-7\nJamaine Saaiman`, "Court 2"), {
    division: "U17 Boys",
    a: "Janno Kruger",
    b: "Jamaine Saaiman",
    scoreA: "9, 11, 11, 6, 11",
    scoreB: "11, 9, 5, 11, 7",
    winner: "a",
    status: "Completed",
    court: "Court 2"
  });
});

test("parses an in-progress SportyHQ court row", () => {
  const result = parseCourtRow(`U15 Boys\nIn Progress\nJohan Pretorius\n1 - 0\n11-5 , 3-3\nSa-ad Tootla`, "Court 1");
  assert.equal(result.status, "Live");
  assert.equal(result.scoreA, "11, 3");
  assert.equal(result.scoreB, "5, 3");
  assert.equal(result.winner, "");
});

test("keeps historical finals and replaces stale live rows", () => {
  const merged = mergeResults(
    [
      { a: "Player One", b: "Player Two", status: "Completed", scoreA: "11", scoreB: "5" },
      { a: "Player Three", b: "Player Four", status: "Live", scoreA: "4", scoreB: "3" }
    ],
    [
      { a: "Player Three", b: "Player Four", status: "Completed", scoreA: "11, 11, 11", scoreB: "5, 7, 8", winner: "a" },
      { a: "Player Five", b: "Player Six", status: "Live", scoreA: "6", scoreB: "5" }
    ]
  );
  assert.deepEqual(merged.map(result => [result.a, result.status]), [
    ["Player One", "Completed"],
    ["Player Three", "Completed"],
    ["Player Five", "Live"]
  ]);
});
