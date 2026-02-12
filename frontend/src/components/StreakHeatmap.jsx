import dayjs from "dayjs";

const squares = 365;

export default function StreakHeatmap({ progressMap }) {
  const today = dayjs();
  const start = today.subtract(squares - 1, "day");

  const days = Array.from({ length: squares }, (_, index) => {
    const date = start.add(index, "day").format("YYYY-MM-DD");
    const progress = progressMap[date];

    return {
      date,
      solved: Boolean(progress?.solved),
    };
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
      <p className="mb-3 text-sm font-medium text-slate-300">365-day Logic Heatmap</p>
      <div className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-1">
        {days.map((day) => (
          <div
            key={day.date}
            title={day.date}
            className={`h-2.5 w-2.5 rounded-[2px] ${day.solved ? "bg-emerald-400" : "bg-slate-700"}`}
          />
        ))}
      </div>
    </div>
  );
}
