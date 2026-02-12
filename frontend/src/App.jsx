import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import AuthPanel from "./components/AuthPanel";
import { loadStoredUser } from "./utils/session";
import StatCard from "./components/StatCard";
import StreakHeatmap from "./components/StreakHeatmap";
import { bootstrapGame, setGuess, submitGuess, syncQueue, triggerHint } from "./store/gameSlice";

function App() {
  const MotionSection = motion.section;
  const dispatch = useDispatch();
  const [user, setUser] = useState(loadStoredUser);
  const { status, puzzle, guess, solved, feedback, hintUsed, hintsRemaining, score, streak, totalPoints, progressMap, syncStatus } =
    useSelector((state) => state.game);

  useEffect(() => {
    dispatch(bootstrapGame());
    dispatch(syncQueue());
  }, [dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!solved) dispatch(submitGuess());
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Logic Looper</p>
          <h1 className="text-3xl font-bold">Daily Logic Challenge</h1>
          <p className="text-slate-300">{dayjs().format("dddd, MMMM D")}</p>
        </header>

        <AuthPanel user={user} onChange={setUser} />

        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Current Streak" value={`${streak} days`} accent="text-orange-300" />
          <StatCard label="Today's Score" value={score || "--"} />
          <StatCard label="Total Points" value={totalPoints} accent="text-violet-300" />
        </section>

        <MotionSection
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-slate-400">{puzzle.type}</p>
              <h2 className="text-xl font-semibold">Difficulty {puzzle.difficulty}/5</h2>
            </div>
            <span className="rounded-full border border-cyan-500/30 px-3 py-1 text-sm text-cyan-300">Timed Mode: {puzzle.timeLimit}s</span>
          </div>

          <p className="mb-4 text-lg text-slate-100">{puzzle.prompt}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={guess}
              onChange={(event) => dispatch(setGuess(event.target.value))}
              type="number"
              placeholder="Your answer"
              className="flex-1 rounded-lg border border-slate-600 bg-slate-950 px-4 py-2 outline-none ring-cyan-400 focus:ring"
              disabled={solved || status === "loading"}
            />
            <button
              type="submit"
              disabled={solved || status === "loading"}
              className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Validate
            </button>
            <button
              type="button"
              onClick={() => dispatch(triggerHint())}
              disabled={hintsRemaining <= 0 || solved}
              className="rounded-lg border border-slate-500 px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Hint ({hintsRemaining})
            </button>
          </form>

          <p className={`mt-4 text-sm ${solved ? "text-emerald-300" : "text-slate-300"}`}>{feedback}</p>
          {hintUsed && !solved ? <p className="mt-1 text-xs text-amber-300">Hint used: -30 score penalty</p> : null}
          <p className="mt-2 text-xs text-slate-400">Sync status: {syncStatus}</p>
        </MotionSection>

        <StreakHeatmap progressMap={progressMap} />
      </div>
    </div>
  );
}

export default App;
