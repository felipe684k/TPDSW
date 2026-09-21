export const theme = {
  layout: {
    // Rich Bitrix24-style gradient background
    appBackground: "bg-gradient-to-br from-[#0b1b36] via-[#1a365d] to-[#2563eb]",
    mainContainer: "bg-slate-50/95 backdrop-blur-md shadow-inner", // Light frosted glass effect
    pageHeader: "text-slate-800",
    pageSubheader: "text-slate-500",
  },
  sidebar: {
    wrapper: "bg-[#111827]/85 backdrop-blur-md text-slate-300 border-r border-slate-700/50",
    header: "border-slate-700/50",
    activeItem: "bg-blue-500/20 text-blue-400 border-l-2 border-blue-400",
    inactiveItem: "hover:bg-slate-800/50 hover:text-slate-200 text-slate-400",
  },
  topbar: {
    wrapper: "bg-[#111827]/85 backdrop-blur-md text-slate-300 border-b border-slate-700/50",
  },
  card: {
    wrapper: "bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow",
    header: "text-slate-800 font-bold",
    text: "text-slate-600",
    innerBackground: "bg-slate-50",
  },
  table: {
    wrapper: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden",
    header: "bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold",
    row: "border-b border-slate-100 hover:bg-blue-50/50 text-slate-700 transition-colors",
    cellText: "text-slate-700 font-medium",
    cellSubtext: "text-slate-500 font-mono",
    empty: "text-slate-500 text-center py-8",
  },
  button: {
    base: "inline-flex items-center justify-center rounded text-xs font-medium transition-all focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
    primary: "bg-blue-500 hover:bg-blue-600 text-white shadow-sm px-4 py-2",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2",
    danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-sm px-4 py-2",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 px-4 py-2",
    action: "text-blue-500 hover:text-blue-700 font-semibold px-2 py-1 hover:bg-blue-50 rounded",
    actionDanger: "text-rose-500 hover:text-rose-700 font-semibold px-2 py-1 hover:bg-rose-50 rounded",
    actionSuccess: "text-emerald-500 hover:text-emerald-700 font-semibold px-2 py-1 hover:bg-emerald-50 rounded"
  },
  input: {
    base: "w-full border rounded p-2.5 text-xs outline-none transition-colors",
    default: "bg-white border-slate-300 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20",
    disabled: "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
    label: "text-xs font-semibold text-slate-600 block mb-1"
  },
  modal: {
    overlay: "bg-slate-900/40 backdrop-blur-sm",
    content: "bg-white rounded-xl shadow-2xl border border-slate-200",
    header: "border-b border-slate-100 text-slate-800",
    footer: "border-t border-slate-100 bg-slate-50"
  },
  badge: {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    successDot: "bg-emerald-500",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    warningDot: "bg-amber-500",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    dangerDot: "bg-rose-500",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    infoDot: "bg-blue-500",
  }
}
