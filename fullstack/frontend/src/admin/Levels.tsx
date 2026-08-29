import { useState, useEffect } from 'react'
import { levelService, type Level } from '../services/level.service'

export default function Levels() {
  const [levels, setLevels] = useState<Level[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [name, setName] = useState('')
  const [nextLevelCode, setNextLevelCode] = useState<number | ''>('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchLevels()
  }, [])

  const fetchLevels = async () => {
    setIsLoading(true)
    try {
      const data = await levelService.getLevels()
      setLevels(data)
    } catch (error) {
      console.error(error)
      setErrorMsg('Error loading levels')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (level?: Level) => {
    if (level) {
      setEditingId(level.level_code!)
      setName(level.name)
      setNextLevelCode(level.next_level_code || '')
    } else {
      setEditingId(null)
      setName('')
      setNextLevelCode('')
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    
    setIsLoading(true)
    try {
      const dataToSave = {
        name,
        next_level_code: nextLevelCode ? Number(nextLevelCode) : null
      }

      if (editingId) {
        await levelService.updateLevel(editingId, dataToSave)
      } else {
        await levelService.createLevel(dataToSave)
      }
      setModalOpen(false)
      fetchLevels()
    } catch (error) {
      console.error(error)
      setErrorMsg('Error saving level')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Levels</h1>
          <p className="text-xs text-slate-500 mt-1">Academic levels management.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all cursor-pointer"
        >
          ➕ Register Level
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/50 border border-rose-800/80 rounded-lg p-3 text-xs text-rose-400">
          {errorMsg}
        </div>
      )}

      <div className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#17181e]">
          <div className="text-xs font-semibold text-slate-300">List of Registered Levels</div>
          <span className="text-2xs text-slate-400 bg-[#1c1d24] border border-slate-800 px-2 py-0.5 rounded font-mono">
            Total: {levels.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Level ID</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Level Name</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Next Level (ID)</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading && levels.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-xs text-slate-500">Loading levels...</td>
                </tr>
              ) : levels.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-xs text-slate-500">No levels registered.</td>
                </tr>
              ) : (
                levels.map((n) => (
                  <tr key={n.level_code} className="hover:bg-[#17181e] transition-colors">
                    <td className="p-3 text-xs font-mono text-slate-500">{n.level_code}</td>
                    <td className="p-3 text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <span className="text-sm">📈</span> {n.name}
                    </td>
                    <td className="p-3 text-xs text-slate-500">{n.next_level_code || '-'}</td>
                    <td className="p-3 text-xs text-right space-x-2">
                      <button 
                        onClick={() => handleOpenModal(n)}
                        className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        ✎ Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-200">
                {editingId ? '📈 Edit Level' : '📈 Register New Level'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form id="levelForm" onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Level Name *</label>
                <input 
                  type="text" required placeholder="e.g. Beginner" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Next Level (Optional ID)</label>
                <input 
                  type="number" placeholder="e.g. 2" min="1"
                  value={nextLevelCode}
                  onChange={(e) => setNextLevelCode(e.target.value ? Number(e.target.value) : '')}
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </form>

            <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 rounded-b-xl">
              <button 
                type="button" onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" form="levelForm" disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Saving...' : 'Save Level'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
