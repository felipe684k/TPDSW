export default function Topbar({ activeTab }: { activeTab: string }) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Inicio</span>
        <span>›</span>
        <strong className="text-slate-700 font-semibold capitalize">{activeTab}</strong>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center text-sm hover:bg-slate-50">🔔</button>
        <div className="flex items-center gap-2 px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">SC</div>
          <span className="text-xs font-semibold text-slate-700">Secretaría</span>
        </div>
      </div>
    </header>
  )
}
