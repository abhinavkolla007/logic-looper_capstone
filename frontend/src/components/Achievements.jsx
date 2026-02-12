const ACHIEVEMENTS = [
  { id: "first_solve", name: "First Logic", emoji: "🎯", description: "Solve your first puzzle" },
  { id: "streak_7", name: "Week Warrior", emoji: "🔥", description: "7-day streak" },
  { id: "streak_30", name: "Month Master", emoji: "⭐", description: "30-day streak" },
  { id: "streak_100", name: "Century Champion", emoji: "👑", description: "100-day streak" },
  { id: "points_1000", name: "Thousand Points", emoji: "💎", description: "Earn 1000 points" },
  { id: "perfect_10", name: "Flawless", emoji: "✨", description: "10 solves in a row" },
  { id: "speedrun", name: "Speedster", emoji: "⚡", description: "Solve under 10 seconds" },
  { id: "no_hints", name: "Pure Logic", emoji: "🧠", description: "10 solves without hints" },
];

export default function Achievements({ earnedAchievements = [] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
      <h3 className="mb-4 text-lg font-bold">🏅 Achievements</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACHIEVEMENTS.map((achievement) => {
          const isEarned = earnedAchievements.includes(achievement.id);

          return (
            <div
              key={achievement.id}
              className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition hover:scale-105 ${
                isEarned
                  ? "border-yellow-500/30 bg-yellow-900/20"
                  : "border-slate-700/30 bg-slate-800/20 opacity-50"
              }`}
            >
              <div className="mb-1 text-2xl">{achievement.emoji}</div>
              <p className="text-xs font-semibold">{achievement.name}</p>
              <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                {achievement.description}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Earned: {earnedAchievements.length}/{ACHIEVEMENTS.length}
      </p>
    </div>
  );
}
