export const ActionButton = ({ children, onClick, icon, variant = "primary", disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
        variant === "primary"
          ? "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
      }`}
    >
      {icon}
      {children}
    </button>
  );