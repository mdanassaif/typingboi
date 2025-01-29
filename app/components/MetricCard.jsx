export const MetricCard = ({ icon, value, label, unit = "" }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-3xl font-semibold text-slate-800">
        {value}
        {unit}
      </div>
    </div>
  );