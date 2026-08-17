import { SIDEBAR_TABS } from "./Sidebar.const"

interface SidebarProps {
  activeTab: 'dashboard' | 'inscripciones' | 'alumnos' | 'docentes' | 'cursos' | 'valorCuota' | 'comisiones' | 'pagos' | 'aulas'
  setActiveTab: (tab: 'dashboard' | 'inscripciones' | 'alumnos' | 'docentes' | 'cursos' | 'valorCuota' | 'comisiones' | 'pagos' | 'aulas') => void
  onLogout: () => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (isOpen: boolean) => void
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  return (
    <>
      {/* Overlay oscuro para cerrar el menú tocando afuera en mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 w-60 bg-slate-950 text-slate-400 flex flex-col border-r border-slate-800 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-5 flex items-center gap-3 border-b border-slate-900">
        <div className="w-9 h-9 rounded bg-indigo-600 flex items-center justify-center text-lg text-white font-bold">🎓</div>
        <div>
          <strong className="block text-sm text-slate-100 font-bold">Instituto de Inglés</strong>
          <span className="block text-xs text-slate-500">Gestión de Cursos</span>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        <span className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">General</span>
        
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>🏠</span> Dashboard
        </button>

        <div className="h-px bg-slate-900 my-2"></div>
        <span className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">Académico</span>

        <button 
          onClick={() => setActiveTab('cursos')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'cursos' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>📚</span> Cursos
        </button>

        <button 
          onClick={() => setActiveTab('comisiones')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === SIDEBAR_TABS.COMISIONES ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>🏷️</span> Comisiones
        </button>

        <button 
          onClick={() => setActiveTab('aulas')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'aulas' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>🏫</span> Aulas
        </button>

        <button 
          onClick={() => setActiveTab('valorCuota')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'valorCuota' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>💰</span> Valor Cuota
        </button>

        <button 
          onClick={() => setActiveTab('pagos')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'pagos' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>💳</span> Pagos
        </button>

        <button 
          onClick={() => setActiveTab('inscripciones')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'inscripciones' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>📝</span> Inscripciones
        </button>
        
        <button 
          onClick={() => setActiveTab('alumnos')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'alumnos' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>👥</span> Alumnos
        </button>
        
        <button 
          onClick={() => setActiveTab('docentes')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'docentes' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>👨‍🏫</span> Docentes
        </button>

      </nav>

      {/* Pie del Sidebar modificado para incluir el botón de Cerrar Sesión */}
      <div className="p-4 border-t border-slate-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">SC</div>
          <div className="text-left">
            <strong className="block text-xs text-slate-200 font-semibold">Secretaría</strong>
            <span className="block text-[10px] text-slate-500">Admin</span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          title="Cerrar Sesión" 
          className="cursor-pointer w-7 h-7 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded flex items-center justify-center text-xs transition-colors"
        >
          🚪
        </button>
      </div>
    </aside>
    </>
  )
}
