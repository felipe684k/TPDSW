import { useState, useEffect } from 'react'

export default function Topbar({ activeTab, setIsSidebarOpen }: { activeTab: string, setIsSidebarOpen: (isOpen: boolean) => void }) {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/health')
        if (res.ok) {
          setBackendStatus('connected')
        } else {
          setBackendStatus('disconnected')
        }
      } catch {
        setBackendStatus('disconnected')
      }
    }
    checkBackend()
    const interval = setInterval(checkBackend, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-14 bg-[#1c1d24] border-b border-slate-800 px-6 flex items-center justify-between shadow-sm shrink-0">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded border border-slate-800 hover:bg-[#17181e] text-slate-300 mr-2"
        >
          ☰
        </button>
        <span>Inicio</span>
        <span>›</span>
        <strong className="text-slate-300 font-semibold capitalize">{activeTab}</strong>
      </div>
      <div className="flex items-center gap-4">
        {/* Indicador de Estado Backend */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-900 border border-slate-800">
          <span className={`w-2 h-2 rounded-full ${
            backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
            backendStatus === 'disconnected' ? 'bg-rose-500' : 'bg-amber-500'
          }`} />
          <span className="hidden md:block text-slate-400">
            {backendStatus === 'connected' ? 'API Conectada' :
             backendStatus === 'disconnected' ? 'API Desconectada' : 'Verificando...'}
          </span>
        </div>

        <button className="w-8 h-8 border border-slate-800 rounded flex items-center justify-center text-sm hover:bg-[#17181e] text-slate-300">🔔</button>
        <div className="flex items-center gap-2 px-2 py-1 border border-slate-800 rounded hover:bg-[#17181e] cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">SC</div>
          <span className="hidden md:block text-xs font-semibold text-slate-300">Secretaría</span>
        </div>
      </div>
    </header>
  )
}
