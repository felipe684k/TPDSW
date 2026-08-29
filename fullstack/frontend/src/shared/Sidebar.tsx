import { SIDEBAR_TABS } from "./Sidebar.const"

interface SidebarProps {
  activeTab: 'dashboard' | 'enrollments' | 'students' | 'professors' | 'courses' | 'sections' | 'payments' | 'classrooms' | 'academic-years' | 'levels'
  setActiveTab: (tab: 'dashboard' | 'enrollments' | 'students' | 'professors' | 'courses' | 'sections' | 'payments' | 'classrooms' | 'academic-years' | 'levels') => void
  onLogout: () => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (isOpen: boolean) => void
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  return (
    <>
      {/* Dark overlay to close menu by tapping outside on mobile */}
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
          <strong className="block text-sm text-slate-100 font-bold">English Institute</strong>
          <span className="block text-xs text-slate-500">Course Management</span>
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
        <span className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">Academic</span>

        <button 
          onClick={() => setActiveTab('courses')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'courses' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>📚</span> Courses
        </button>

        <button 
          onClick={() => setActiveTab('sections')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === SIDEBAR_TABS.SECTIONS ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>🏷️</span> Sections
        </button>

        <button 
          onClick={() => setActiveTab('classrooms')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'classrooms' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>🏫</span> Classrooms
        </button>

        <button 
          onClick={() => setActiveTab('levels')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'levels' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>📈</span> Levels
        </button>

        <button 
          onClick={() => setActiveTab('academic-years')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'academic-years' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>📅</span> Academic Years
        </button>

        <button 
          onClick={() => setActiveTab('payments')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'payments' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>💳</span> Payments
        </button>

        <button 
          onClick={() => setActiveTab('enrollments')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'enrollments' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>📝</span> Enrollments
        </button>
        
        <button 
          onClick={() => setActiveTab('students')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'students' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>👥</span> Students
        </button>
        
        <button 
          onClick={() => setActiveTab('professors')}
          className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${activeTab === 'professors' ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' : 'hover:bg-slate-900 hover:text-slate-200'}`}
        >
          <span>👨‍🏫</span> Professors
        </button>

      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">SC</div>
          <div className="text-left">
            <strong className="block text-xs text-slate-200 font-semibold">Secretariat</strong>
            <span className="block text-[10px] text-slate-500">Admin</span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          title="Logout" 
          className="cursor-pointer w-7 h-7 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded flex items-center justify-center text-xs transition-colors"
        >
          🚪
        </button>
      </div>
    </aside>
    </>
  )
}
