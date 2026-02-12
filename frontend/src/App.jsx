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
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(false);

  const { status, puzzle, guess, solved, feedback, hintUsed, hintsRemaining, score, streak, totalPoints, progressMap, syncStatus } =
    useSelector((state) => state.game);

  useEffect(() => {
    dispatch(bootstrapGame());
    dispatch(syncQueue());
  }, [dispatch]);

  // Timer Logic
  useEffect(() => {
    if (!timerActive || !puzzle.timeLimit) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, puzzle.timeLimit - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        setTimerActive(false);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [timerActive, puzzle.timeLimit]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!solved) {
      dispatch(submitGuess());
      setTimerActive(false);
    }
  };

  const handleStartChallenge = () => {
    setTimerActive(true);
    setTimeLeft(puzzle.timeLimit);
  };

  const timerColor = 
    timeLeft === null ? "text-cyan-300" :
    timeLeft > puzzle.timeLimit * 0.5 ? "text-emerald-300" :
    timeLeft > puzzle.timeLimit * 0.25 ? "text-amber-300" :
    "text-red-300";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-5xl flex-col gap-6"
      >
        <motion.header variants={itemVariants} className="space-y-1">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs uppercase tracking-[0.3em] text-cyan-300"
          >
            ✨ Logic Looper ✨
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-bold"
          >
            Daily Logic Challenge
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300"
          >
            {dayjs().format("dddd, MMMM D")} • Puzzle #{Math.floor(dayjs().dayOfYear())}
          </motion.p>
        </motion.header>

        <motion.div variants={itemVariants}>
          <AuthPanel user={user} onChange={setUser} />
        </motion.div>

        <motion.section variants={itemVariants} className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Current Streak" value={`${streak} days`} accent="text-orange-300" />
          <StatCard label="Today's Score" value={score ? `${score} pts` : "--"} />
          <StatCard label="Total Points" value={`${totalPoints}`} accent="text-violet-300" />
        </motion.section>

        <MotionSection
          variants={itemVariants}
          className={`rounded-2xl border backdrop-blur transition-all ${
            solved
              ? "border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-slate-800/20"
              : "border-white/10 bg-gradient-to-br from-slate-900 to-slate-800"
          } p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs uppercase text-slate-400"
              >
                {puzzle.type}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xl font-semibold"
              >
                Difficulty {puzzle.difficulty}/5
              </motion.h2>
            </div>

            {timerActive && timeLeft !== null ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`rounded-full border-2 border-current px-4 py-2 text-center font-bold ${timerColor}`}
              >
                <div className="text-3xl">{timeLeft}s</div>
                <div className="text-xs uppercase">Timed Mode</div>
              </motion.div>
            ) : !solved && !timerActive ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartChallenge}
                className="rounded-full border border-cyan-500 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
              >
                Start {puzzle.timeLimit}s Challenge
              </motion.button>
            ) : null}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 mt-4 text-lg text-slate-100"
          >
            {puzzle.prompt}
          </motion.p>

          {solved ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="font-semibold text-emerald-300">{feedback}</p>
                  <p className="text-sm text-emerald-200">You earned {score} points!</p>
                </div>
              </div>
              {hintUsed && <p className="text-xs text-amber-300">-30 penalty for using hint</p>}
              <p className="text-xs text-slate-400">
                Come back tomorrow for a new puzzle! 🚀
              </p>
            </motion.div>
          ) : status === "loading" ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto h-8 w-8 rounded-full border-2 border-slate-600 border-t-cyan-400"
            />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input
                value={guess}
                onChange={(event) => dispatch(setGuess(event.target.value))}
                type="number"
                placeholder="Your answer..."
                autoFocus
                className="flex-1 rounded-lg border border-slate-600 bg-slate-950 px-4 py-2.5 outline-none ring-cyan-400 focus:ring-1"
                disabled={status === "loading"}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={status === "loading"}
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2.5 font-medium text-slate-900 transition disabled:opacity-50"
              >
                {status === "loading" ? "Checking..." : "Validate"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => dispatch(triggerHint())}
                disabled={hintsRemaining <= 0}
                className="rounded-lg border border-slate-500 px-4 py-2.5 font-medium transition hover:bg-slate-800 disabled:opacity-50"
              >
                💡 {hintsRemaining} left
              </motion.button>
            </form>
          )}

          {feedback && !solved && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 text-sm font-medium ${
                feedback.includes("Perfect") ? "text-emerald-300" : "text-amber-300"
              }`}
            >
              ⚡ {feedback}
            </motion.p>
          )}

          {syncStatus && syncStatus !== "idle" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-xs text-slate-400"
            >
              📡 Syncing: {syncStatus}
            </motion.p>
          )}
        </MotionSection>

        <motion.div variants={itemVariants}>
          <StreakHeatmap progressMap={progressMap} />
        </motion.div>

        <motion.footer
          variants={itemVariants}
          className="mt-8 space-y-3 border-t border-slate-800 pt-4 text-center text-xs text-slate-400"
        >
          <p>
            🔒 Local-first architecture • All puzzles solved offline • Progress synced when online
          </p>
          <p>
            Built with React, Tailwind, & Framer Motion
          </p>
        </motion.footer>
      </motion.div>
    </div>
  );
}

export default App;
