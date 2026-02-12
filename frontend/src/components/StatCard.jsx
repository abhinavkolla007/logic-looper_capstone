export default function StatCard({ label, value, accent = "text-cyan-300" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
