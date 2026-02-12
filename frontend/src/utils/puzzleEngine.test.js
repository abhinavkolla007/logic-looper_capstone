import assert from "node:assert/strict";
import test from "node:test";
import dayjs from "dayjs";
import { calculateScore, getDailyPuzzle, validateSolution } from "./puzzleEngine.js";

test("builds deterministic puzzle for the same date", () => {
  const a = getDailyPuzzle(dayjs("2026-02-10"));
  const b = getDailyPuzzle(dayjs("2026-02-10"));
  assert.deepEqual(a, b);
});

test("validates correct answer", () => {
  const puzzle = getDailyPuzzle(dayjs("2026-02-11"));
  const result = validateSolution(puzzle, puzzle.answer);
  assert.equal(result.valid, true);
});

test("applies scoring penalties and bonuses", () => {
  const score = calculateScore({ solved: true, hintUsed: true, durationSec: 10, difficulty: 2 });
  assert.equal(score >= 25, true);
  assert.equal(score < 300, true);
});
