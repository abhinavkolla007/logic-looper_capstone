import { useState } from "react";

export default function Leaderboard({ leaders = [] }) {
  const [copied, setCopied] = useState(false);

  const shareURL = () => {
    const url = `${window.location.origin}?challenge=${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock leaderboard if none provided
  const mockLeaders = [
    { rank: 1, name: "Logic Master", points: 2850, streak: 45 },
    { rank: 2, name: "Pattern Pro", points: 2720, streak: 38 },
    { rank: 3, name: "Sequence Solver", points: 2640, streak: 35 },
    { rank: 4, name: "Puzzle Master", points: 2510, streak: 31 },
    { rank: 5, name: "Brain Genius", points: 2390, streak: 28 },
  ];

  const displayLeaders = leaders.length > 0 ? leaders : mockLeaders;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">🏆 Daily Leaderboard</h3>
        <button
          onClick={shareURL}
          className="rounded-lg bg-blue-600/20 px-3 py-1 text-xs font-medium text-blue-300 transition hover:bg-blue-600/30"
        >
          {copied ? "✓ Copied!" : "📤 Share"}
        </button>
      </div>

      <div className="space-y-2">
        {displayLeaders.map((leader, idx) => (
          <motion.div
            key={leader.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-3 hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 font-bold text-sm">
                {leader.rank === 1 ? "🥇" : leader.rank === 2 ? "🥈" : leader.rank === 3 ? "🥉" : leader.rank}
              </div>
              <div>
                <p className="font-semibold">{leader.name}</p>
                <p className="text-xs text-slate-400">{leader.streak} day streak</p>
              </div>
            </div>
            <p className="font-bold text-cyan-300">{leader.points}</p>
          </motion.div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-500">🔄 Syncs daily at midnight UTC</p>
    </div>
  );
}
