import assert from "node:assert/strict";
import test from "node:test";
import dayjs from "dayjs";
import { calculateScore, getDailyPuzzle, validateSolution, PUZZLE_TYPES } from "./puzzleEngine.js";

test("Puzzle Generation", async (t) => {
  await t.test("builds deterministic puzzle for the same date", () => {
    const a = getDailyPuzzle(dayjs("2026-02-10"));
    const b = getDailyPuzzle(dayjs("2026-02-10"));
    assert.deepEqual(a, b);
  });

  await t.test("generates different puzzles for different dates", () => {
    const a = getDailyPuzzle(dayjs("2026-02-10"));
    const b = getDailyPuzzle(dayjs("2026-02-11"));
    assert.notEqual(a.id, b.id);
  });

  await t.test("includes all required puzzle fields", () => {
    const puzzle = getDailyPuzzle();
    assert.equal(typeof puzzle.id, "string");
    assert.equal(typeof puzzle.date, "string");
    assert.equal(typeof puzzle.type, "string");
    assert.equal(typeof puzzle.difficulty, "number");
    assert.equal(typeof puzzle.answer, "number");
    assert.equal(typeof puzzle.prompt, "string");
    assert.equal(typeof puzzle.timeLimit, "number");
  });

  await t.test("difficulty scales with day of year", () => {
    const jan = getDailyPuzzle(dayjs("2026-01-01"));
    const dec = getDailyPuzzle(dayjs("2026-12-31"));
    assert.equal(jan.difficulty <= dec.difficulty, true);
  });

  await t.test("puzzle type is from valid list", () => {
    const puzzle = getDailyPuzzle();
    assert.equal(PUZZLE_TYPES.includes(puzzle.type), true);
  });

  await t.test("time limit increases with difficulty", () => {
    const easy = getDailyPuzzle(dayjs("2026-01-01"));
    const hard = getDailyPuzzle(dayjs("2026-12-31"));
    assert.equal(hard.timeLimit >= easy.timeLimit, true);
  });
});

test("Solution Validation", async (t) => {
  await t.test("validates correct answer", () => {
    const puzzle = getDailyPuzzle(dayjs("2026-02-11"));
    const result = validateSolution(puzzle, puzzle.answer);
    assert.equal(result.valid, true);
  });

  await t.test("rejects incorrect answer", () => {
    const puzzle = getDailyPuzzle(dayjs("2026-02-11"));
    const result = validateSolution(puzzle, puzzle.answer + 1);
    assert.equal(result.valid, false);
  });

  await t.test("handles non-numeric input", () => {
    const puzzle = getDailyPuzzle(dayjs("2026-02-11"));
    const result = validateSolution(puzzle, "not a number");
    assert.equal(result.valid, false);
  });

  await t.test("handles string numbers correctly", () => {
    const puzzle = getDailyPuzzle(dayjs("2026-02-11"));
    const result = validateSolution(puzzle, String(puzzle.answer));
    assert.equal(result.valid, true);
  });

  await t.test("provides feedback message", () => {
    const puzzle = getDailyPuzzle(dayjs("2026-02-11"));
    const result = validateSolution(puzzle, puzzle.answer);
    assert.equal(typeof result.reason, "string");
    assert.equal(result.reason.length > 0, true);
  });
});

test("Score Calculation", async (t) => {
  await t.test("awards points for solved puzzles", () => {
    const score = calculateScore({ solved: true, hintUsed: false, durationSec: 10, difficulty: 1 });
    assert.equal(score > 0, true);
  });

  await t.test("applies hint penalty", () => {
    const withoutHint = calculateScore({ solved: true, hintUsed: false, durationSec: 10, difficulty: 1 });
    const withHint = calculateScore({ solved: true, hintUsed: true, durationSec: 10, difficulty: 1 });
    assert.equal(withoutHint > withHint, true);
  });

  await t.test("awards bonus for quick solves", () => {
    const quick = calculateScore({ solved: true, hintUsed: false, durationSec: 5, difficulty: 1 });
    const slow = calculateScore({ solved: true, hintUsed: false, durationSec: 40, difficulty: 1 });
    assert.equal(quick > slow, true);
  });

  await t.test("increases score with difficulty", () => {
    const easy = calculateScore({ solved: true, hintUsed: false, durationSec: 10, difficulty: 1 });
    const hard = calculateScore({ solved: true, hintUsed: false, durationSec: 10, difficulty: 5 });
    assert.equal(hard > easy, true);
  });

  await t.test("returns 0 for unsolved puzzles", () => {
    const score = calculateScore({ solved: false, hintUsed: false, durationSec: 10, difficulty: 1 });
    assert.equal(score, 0);
  });

  await t.test("score is always finite", () => {
    const score = calculateScore({ solved: true, hintUsed: false, durationSec: 10, difficulty: 3 });
    assert.equal(Number.isFinite(score), true);
  });
});

test("Edge Cases", async (t) => {
  await t.test("handles zero duration", () => {
    const score = calculateScore({ solved: true, hintUsed: false, durationSec: 0, difficulty: 1 });
    assert.equal(Number.isFinite(score), true);
  });

  await t.test("handles extreme difficulty", () => {
    const puzzle = {
      answer: 42,
      prompt: "Test",
      difficulty: 10,
    };
    const result = validateSolution(puzzle, 42);
    assert.equal(result.valid, true);
  });

  await t.test("handles float answers (converted to int)", () => {
    const puzzle = getDailyPuzzle(dayjs("2026-02-11"));
    const result = validateSolution(puzzle, puzzle.answer + 0.5);
    assert.equal(result.valid, false);
  });
});
