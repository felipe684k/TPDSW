import { SIDEBAR_TABS } from "./Sidebar.const"
import SidebarButton from "./SidebarButton"

interface SidebarProps {
  activeTab: 'dashboard' | 'enrollments' | 'students' | 'professors' | 'courses' | 'sections' | 'payments' | 'classrooms' | 'academic-years' | 'levels'
  setActiveTab: (tab: 'dashboard' | 'enrollments' | 'students' | 'professors' | 'courses' | 'sections' | 'payments' | 'classrooms' | 'academic-years' | 'levels') => void
  onLogout: () => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (isOpen: boolean) => void
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Panel', icon: '🏠', section: 'General' },
    { id: 'divider', section: 'Académico' },
    { id: 'courses', label: 'Cursos', icon: '📚' },
    { id: SIDEBAR_TABS.SECTIONS, label: 'Comisiones', icon: '🏷️' },
    { id: 'classrooms', label: 'Aulas', icon: '🏫' },
    { id: 'academic-years', label: 'Ciclos Lectivos', icon: '📅' },
    { id: 'payments', label: 'Pagos', icon: '💳' },
    { id: 'enrollments', label: 'Inscripciones', icon: '📝' },
    { id: 'students', label: 'Alumnos', icon: '👥' },
    { id: 'professors', label: 'Profesores', icon: '👨‍🏫' },
  ] as const;

  return (
    <>
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

      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
        {tabs.map((tab, index) => {
          if (tab.id === 'divider') {
            return (
              <div key={`div-${index}`}>
                <div className="h-px bg-slate-900 my-2"></div>
                <span className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">{tab.section}</span>
              </div>
            );
          }

          if (tab.section && tab.id !== 'divider') {
            return (
              <div key={tab.id}>
                <span className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">{tab.section}</span>
                <SidebarButton 
                  icon={tab.icon} 
                  label={tab.label!} 
                  isActive={activeTab === tab.id} 
                  onClick={() => setActiveTab(tab.id as any)} 
                />
              </div>
            )
          }

          return (
            <SidebarButton 
              key={tab.id}
              icon={tab.icon} 
              label={tab.label!} 
              isActive={activeTab === tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
            />
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">SC</div>
          <div className="text-left">
            <strong className="block text-xs text-slate-200 font-semibold">Secretaría</strong>
            <span className="block text-[10px] text-slate-500">Administrador</span>
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
