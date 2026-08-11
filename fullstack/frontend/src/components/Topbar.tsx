import { useState, useEffect } from 'react'

export default function Topbar({ activeTab }: { activeTab: string }) {
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
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Inicio</span>
        <span>›</span>
        <strong className="text-slate-700 font-semibold capitalize">{activeTab}</strong>
      </div>
      <div className="flex items-center gap-4">
        {/* Indicador de Estado Backend */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 border border-slate-200">
          <span className={`w-2 h-2 rounded-full ${
            backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
            backendStatus === 'disconnected' ? 'bg-rose-500' : 'bg-amber-500'
          }`} />
          <span className="text-slate-600">
            {backendStatus === 'connected' ? 'API Conectada' :
             backendStatus === 'disconnected' ? 'API Desconectada' : 'Verificando...'}
          </span>
        </div>

        <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center text-sm hover:bg-slate-50">🔔</button>
        <div className="flex items-center gap-2 px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">SC</div>
          <span className="text-xs font-semibold text-slate-700">Secretaría</span>
        </div>
      </div>
    </header>
  )
}
