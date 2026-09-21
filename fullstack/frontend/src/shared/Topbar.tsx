import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config'
import { theme } from '../utils/theme'

export default function Topbar({ activeTab, setIsSidebarOpen }: { activeTab: string, setIsSidebarOpen: (isOpen: boolean) => void }) {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`)
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
    <header className={`h-16 ${theme.topbar.wrapper} px-6 flex items-center justify-between shrink-0`}>
      <div className="flex items-center gap-3 text-sm text-slate-100/70">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded border border-white/20 hover:bg-white/10 text-white mr-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <span className="hidden sm:inline">Inicio</span>
        <span className="hidden sm:inline opacity-50">/</span>
        <strong className="text-white font-semibold capitalize tracking-wide">{activeTab.replace('-', ' ')}</strong>
      </div>
      
      <div className="flex items-center gap-4">

        {/* Backend status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
          <span className={`w-2 h-2 rounded-full ${
            backendStatus === 'connected' ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' :
            backendStatus === 'disconnected' ? 'bg-rose-400' : 'bg-amber-400'
          }`} />
          <span className="hidden md:block text-white/90">
            {backendStatus === 'connected' ? 'API Conectada' :
             backendStatus === 'disconnected' ? 'API Desconectada' : 'Verificando...'}
          </span>
        </div>

        <button className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-white/10 text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-white/10">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm border border-white/20">
            SC
          </div>
          <span className="hidden md:block text-sm font-semibold text-white mr-1">Secretaría</span>
        </div>
      </div>
    </header>
  )
}
