export const StatPanel = ({ value, label, icon, color, unit = "" }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className={`${color} mb-4`}>{icon}</div>
      <div className="text-4xl font-bold text-slate-800 mb-1">
        {value}
        {unit}
      </div>
      <div className="text-sm text-slate-500 font-medium">{label}</div>
    </div>
  );