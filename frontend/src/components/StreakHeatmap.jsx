import dayjs from "dayjs";
import { motion } from "framer-motion";
import { useState } from "react";

const squares = 365;

export default function StreakHeatmap({ progressMap = {} }) {
  const today = dayjs();
  const start = today.subtract(squares - 1, "day");
  const [hoveredDate, setHoveredDate] = useState(null);

  const days = Array.from({ length: squares }, (_, index) => {
    const date = start.add(index, "day").format("YYYY-MM-DD");
    const progress = progressMap[date];

    return {
      date,
      solved: Boolean(progress?.solved),
      score: progress?.score || 0,
      durationSec: progress?.durationSec || 0,
    };
  });

  const solvedCount = days.filter((d) => d.solved).length;
  const currentStreak = calculateStreak(days);
  const longestStreak = calculateLongestStreak(days);

  function calculateStreak(daysList) {
    let streak = 0;
    for (let i = daysList.length - 1; i >= 0; i--) {
      if (daysList[i].solved) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  function calculateLongestStreak(daysList) {
    let maxStreak = 0;
    let currentStreak = 0;
    for (const day of daysList) {
      if (day.solved) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    return maxStreak;
  }

  function getIntensityColor(solved) {
    if (!solved) return "bg-slate-700/40 hover:bg-slate-700/60";
    return "bg-emerald-400 hover:bg-emerald-300";
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur"
    >
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">🔥 365-Day Logic Heatmap</h3>
            <p className="mt-1 text-xs text-slate-400">
              Your year-long puzzle journey at a glance
            </p>
          </div>

          <div className="hidden grid-cols-3 gap-4 sm:grid">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-lg border border-emerald-500/20 bg-emerald-900/20 px-4 py-2 text-center"
            >
              <p className="text-2xl font-bold text-emerald-300">{currentStreak}</p>
              <p className="text-xs text-emerald-300/70">Current Streak</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-lg border border-orange-500/20 bg-orange-900/20 px-4 py-2 text-center"
            >
              <p className="text-2xl font-bold text-orange-300">{longestStreak}</p>
              <p className="text-xs text-orange-300/70">Longest Streak</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-lg border border-violet-500/20 bg-violet-900/20 px-4 py-2 text-center"
            >
              <p className="text-2xl font-bold text-violet-300">{solvedCount}</p>
              <p className="text-xs text-violet-300/70">Days Solved</p>
            </motion.div>
          </div>
        </div>

        {/* Mobile stats */}
        <div className="grid grid-cols-3 gap-2 sm:hidden">
          <div className="rounded-lg bg-emerald-900/20 px-2 py-1 text-center">
            <p className="text-lg font-bold text-emerald-300">{currentStreak}</p>
            <p className="text-xs text-emerald-300/70">Current</p>
          </div>
          <div className="rounded-lg bg-orange-900/20 px-2 py-1 text-center">
            <p className="text-lg font-bold text-orange-300">{longestStreak}</p>
            <p className="text-xs text-orange-300/70">Longest</p>
          </div>
          <div className="rounded-lg bg-violet-900/20 px-2 py-1 text-center">
            <p className="text-lg font-bold text-violet-300">{solvedCount}</p>
            <p className="text-xs text-violet-300/70">Total</p>
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="overflow-x-auto"
      >
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: "repeat(53, minmax(0, 1fr))" }}>
          {days.map((day) => (
            <motion.div
              key={day.date}
              variants={itemVariants}
              onMouseEnter={() => setHoveredDate(day.date)}
              onMouseLeave={() => setHoveredDate(null)}
              title={
                day.solved
                  ? `${day.date}: ${day.score} pts (${day.durationSec}s)`
                  : `${day.date}: Not solved`
              }
              className={`group relative h-3 w-3 cursor-pointer rounded-[3px] transition ${getIntensityColor(
                day.solved
              )}`}
            >
              {hoveredDate === day.date && day.solved && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-600 bg-slate-950 px-2 py-1 text-xs text-slate-200 shadow-lg"
                >
                  {day.date}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 translate-y-0 border-4 border-transparent border-t-slate-950" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-[2px] bg-slate-700/40" />
            <div className="h-3 w-3 rounded-[2px] bg-slate-700/60" />
            <div className="h-3 w-3 rounded-[2px] bg-emerald-500/60" />
            <div className="h-3 w-3 rounded-[2px] bg-emerald-400" />
          </div>
          <span>More</span>
        </div>
        <p>
          {solvedCount} day{solvedCount !== 1 ? "s" : ""} completed
        </p>
      </div>

      {longestStreak >= 100 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-900/20 px-3 py-2 text-center text-sm text-yellow-300"
        >
          🏆 Amazing! You've reached {longestStreak} consecutive days!
        </motion.div>
      )}
    </motion.div>
  );
}
