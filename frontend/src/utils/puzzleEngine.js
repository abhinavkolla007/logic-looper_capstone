import CryptoJS from "crypto-js";
import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear.js";

dayjs.extend(dayOfYear);

export const PUZZLE_TYPES = [
  "Number Matrix",
  "Pattern Matching",
  "Sequence Solver",
  "Deduction Grid",
  "Binary Logic",
];

const getHash = (seed) => CryptoJS.SHA256(seed).toString();

const hashToNumber = (hash, start = 0, length = 8) => parseInt(hash.slice(start, start + length), 16);

const createPuzzlePayload = (type, seedHash, difficulty) => {
  switch (type) {
    case "Pattern Matching": {
      const items = Array.from({ length: 4 + difficulty }, (_, index) => (hashToNumber(seedHash, index * 3, 3) % 9) + 1);
      const answer = items.filter((item) => item % 2 === 0).length;
      return {
        prompt: `Count how many even numbers appear: ${items.join(", ")}`,
        answer,
      };
    }
    case "Sequence Solver": {
      const base = (hashToNumber(seedHash, 7, 3) % 5) + 2;
      const diff = (hashToNumber(seedHash, 11, 3) % 4) + 1;
      const sequence = Array.from({ length: 3 + difficulty }, (_, index) => base + index * diff);
      const answer = sequence.at(-1) + diff;
      return {
        prompt: `Find the next number in the sequence: ${sequence.join(", ")}, ?`,
        answer,
      };
    }
    case "Deduction Grid": {
      const people = ["Ava", "Noah", "Mia"];
      const pets = ["Cat", "Dog", "Bird"];
      const shift = hashToNumber(seedHash, 9, 2) % pets.length;
      const mapping = people.map((person, index) => `${person}→${pets[(index + shift) % pets.length]}`);
      const answer = shift + 1;
      return {
        prompt: `If mapping is ${mapping.join(", ")}, what is Ava's pet position in [Cat,Dog,Bird]?`,
        answer,
      };
    }
    case "Binary Logic": {
      const a = hashToNumber(seedHash, 4, 2) % 2;
      const b = hashToNumber(seedHash, 6, 2) % 2;
      const c = hashToNumber(seedHash, 8, 2) % 2;
      const answer = (a & b) | c;
      return {
        prompt: `Evaluate (A AND B) OR C for A=${a}, B=${b}, C=${c}.`,
        answer,
      };
    }
    case "Number Matrix":
    default: {
      const sequence = Array.from({ length: 4 + difficulty }, (_, index) => (hashToNumber(seedHash, index * 2, 6) % 9) + 1);
      const answer = sequence.reduce((acc, val) => acc + val, 0);
      return {
        prompt: `Add the sequence values to unlock today's loop: ${sequence.join(" + ")}`,
        answer,
      };
    }
  }
};

export const getDailyPuzzle = (date = dayjs()) => {
  const daySeed = date.format("YYYY-MM-DD");
  const seedHash = getHash(daySeed);
  const difficulty = Math.min(5, Math.floor(date.dayOfYear() / 73) + 1);
  const type = PUZZLE_TYPES[hashToNumber(seedHash, 0, 4) % PUZZLE_TYPES.length];
  const payload = createPuzzlePayload(type, seedHash, difficulty);

  return {
    id: `p-${daySeed}`,
    date: daySeed,
    type,
    difficulty,
    answer: payload.answer,
    prompt: payload.prompt,
    timeLimit: 45 + difficulty * 20,
  };
};

export const validateSolution = (puzzle, guess) => {
  const normalized = Number(guess);

  if (Number.isNaN(normalized)) {
    return { valid: false, reason: "Please enter a valid number." };
  }

  if (normalized === puzzle.answer) {
    return { valid: true, reason: "Perfect logic!" };
  }

  return { valid: false, reason: "Not quite—try another path." };
};

export const calculateScore = ({ solved, hintUsed, durationSec, difficulty }) => {
  if (!solved) return 0;

  const base = difficulty * 100;
  const speedBonus = Math.max(0, 80 - durationSec);
  const hintPenalty = hintUsed ? 30 : 0;

  return Math.max(25, base + speedBonus - hintPenalty);
};
