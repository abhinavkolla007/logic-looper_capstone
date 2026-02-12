import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import {
  clearQueuedScores,
  getDailyProgress,
  getProgressRange,
  getQueuedScores,
  getSetting,
  getStreakState,
  queueScoreForSync,
  saveDailyProgress,
  saveSetting,
  saveStreakState,
} from "../utils/db";
import { syncDailyScores } from "../utils/api";
import { calculateScore, getDailyPuzzle, validateSolution } from "../utils/puzzleEngine";

const TODAY = dayjs().format("YYYY-MM-DD");

const initialState = {
  status: "idle",
  puzzle: getDailyPuzzle(dayjs()),
  guess: "",
  solved: false,
  feedback: "",
  hintUsed: false,
  hintsRemaining: 2,
  startedAt: Date.now(),
  score: 0,
  streak: 0,
  lastPlayed: null,
  totalPoints: 0,
  progressMap: {},
  syncStatus: "idle",
};

const buildNextStreak = (lastPlayed, nowDate, solvedToday, currentStreak) => {
  if (!solvedToday) return currentStreak;
  if (!lastPlayed) return 1;

  const diff = nowDate.diff(dayjs(lastPlayed), "day");
  if (diff === 0) return currentStreak || 1;
  if (diff === 1) return currentStreak + 1;
  return 1;
};

export const syncQueue = createAsyncThunk("game/syncQueue", async () => {
  const queued = await getQueuedScores(20);
  if (!queued.length) return { synced: 0 };

  await syncDailyScores(
    queued.map((record) => ({
      userId: record.userId,
      puzzleId: record.puzzleId,
      score: record.score,
      timeTaken: record.timeTaken,
      solvedAt: record.solvedAt,
    })),
  );

  await clearQueuedScores(queued.map((row) => row.id));

  return { synced: queued.length };
});

export const bootstrapGame = createAsyncThunk("game/bootstrap", async () => {
  const date = dayjs();
  const today = date.format("YYYY-MM-DD");
  const puzzle = getDailyPuzzle(date);

  const [daily, streakData, progress] = await Promise.all([getDailyProgress(today), getStreakState(), getProgressRange()]);

  const progressMap = progress.reduce((acc, item) => {
    acc[item.date] = item;
    return acc;
  }, {});

  return {
    puzzle,
    daily,
    streakData,
    progressMap,
  };
});

export const submitGuess = createAsyncThunk("game/submitGuess", async (_, thunkApi) => {
  const state = thunkApi.getState().game;
  const result = validateSolution(state.puzzle, state.guess);

  if (!result.valid) {
    return { solved: false, feedback: result.reason };
  }

  const durationSec = Math.floor((Date.now() - state.startedAt) / 1000);
  const score = calculateScore({
    solved: true,
    hintUsed: state.hintUsed,
    durationSec,
    difficulty: state.puzzle.difficulty,
  });

  const now = dayjs();
  const nextStreak = buildNextStreak(state.lastPlayed, now, true, state.streak);
  const today = now.format("YYYY-MM-DD");
  const solvedCount = (await getSetting("solvedCount", 0)) + 1;

  const progress = {
    date: today,
    puzzleId: state.puzzle.id,
    solved: true,
    score,
    durationSec,
    hintUsed: state.hintUsed,
    completedAt: now.toISOString(),
  };

  await Promise.all([
    saveDailyProgress(progress),
    saveStreakState({
      streak: nextStreak,
      lastPlayed: now.toISOString(),
      totalPoints: state.totalPoints + score,
    }),
    saveSetting("solvedCount", solvedCount),
    queueScoreForSync({
      userId: "local-player",
      puzzleId: progress.puzzleId,
      score: progress.score,
      timeTaken: progress.durationSec,
      solvedAt: progress.completedAt,
    }),
  ]);

  if (solvedCount % 5 === 0) {
    thunkApi.dispatch(syncQueue());
  }

  return {
    solved: true,
    feedback: result.reason,
    score,
    streak: nextStreak,
    lastPlayed: now.toISOString(),
    totalPoints: state.totalPoints + score,
    progress,
  };
});

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGuess(state, action) {
      state.guess = action.payload;
    },
    triggerHint(state) {
      if (state.hintsRemaining <= 0 || state.solved) return;
      state.hintUsed = true;
      state.hintsRemaining -= 1;
      state.feedback = `Hint: the answer is between ${state.puzzle.answer - 4} and ${state.puzzle.answer + 4}.`;
    },
    resetDailyState(state) {
      state.puzzle = getDailyPuzzle(dayjs());
      state.guess = "";
      state.feedback = "";
      state.solved = false;
      state.hintUsed = false;
      state.hintsRemaining = 2;
      state.startedAt = Date.now();
      state.score = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapGame.pending, (state) => {
        state.status = "loading";
      })
      .addCase(bootstrapGame.fulfilled, (state, action) => {
        state.status = "ready";
        state.puzzle = action.payload.puzzle;
        state.progressMap = action.payload.progressMap;

        if (action.payload.daily?.solved) {
          state.solved = true;
          state.score = action.payload.daily.score;
          state.feedback = "Already solved today. Come back tomorrow for a fresh loop!";
          state.guess = String(action.payload.puzzle.answer);
        }

        if (action.payload.streakData) {
          state.streak = action.payload.streakData.streak ?? 0;
          state.lastPlayed = action.payload.streakData.lastPlayed ?? null;
          state.totalPoints = action.payload.streakData.totalPoints ?? 0;
        }
      })
      .addCase(submitGuess.fulfilled, (state, action) => {
        state.feedback = action.payload.feedback;
        state.solved = action.payload.solved;

        if (action.payload.solved) {
          state.score = action.payload.score;
          state.streak = action.payload.streak;
          state.lastPlayed = action.payload.lastPlayed;
          state.totalPoints = action.payload.totalPoints;
          state.progressMap[action.payload.progress.date] = action.payload.progress;
        }
      })
      .addCase(syncQueue.pending, (state) => {
        state.syncStatus = "syncing";
      })
      .addCase(syncQueue.fulfilled, (state) => {
        state.syncStatus = "idle";
      })
      .addCase(syncQueue.rejected, (state) => {
        state.syncStatus = "failed";
      });
  },
});

export const { setGuess, triggerHint, resetDailyState } = gameSlice.actions;
export default gameSlice.reducer;
export { TODAY };
