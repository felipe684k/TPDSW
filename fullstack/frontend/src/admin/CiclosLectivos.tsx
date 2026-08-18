import { useState, useEffect } from 'react'
import { cicloLectivoService, type CicloLectivo } from '../services/cicloLectivo.service'

export default function CiclosLectivos() {
  const [modalOpen, setModalOpen] = useState(false)
  const [ciclos, setCiclos] = useState<CicloLectivo[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{text: string, type: 'success' | 'danger'} | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    fecha_desde: '',
    fecha_hasta: ''
  })

  const fetchCiclos = async () => {
    try {
      const data = await cicloLectivoService.getCiclos()
      setCiclos(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCiclos()
  }, [])

  const handleOpenModalCreate = () => {
    setEditingId(null)
    setFormData({ nombre: '', fecha_desde: '', fecha_hasta: '' })
    setModalOpen(true)
    setToast(null)
  }

  const handleEdit = (ciclo: CicloLectivo) => {
    setEditingId(ciclo.id_ciclo_lectivo || null)
    setFormData({ 
      nombre: ciclo.nombre, 
      fecha_desde: ciclo.fecha_desde, 
      fecha_hasta: ciclo.fecha_hasta
    })
    setModalOpen(true)
    setToast(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await cicloLectivoService.updateCiclo(editingId, formData)
      } else {
        await cicloLectivoService.createCiclo(formData)
      }
      
      setModalOpen(false)
      setToast({ text: editingId ? "Ciclo actualizado" : "Ciclo creado", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      fetchCiclos()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Ciclos Lectivos</h1>
          <p className="text-xs text-slate-500 mt-1">Administración de periodos académicos anuales o cuatrimestrales.</p>
        </div>
        <button onClick={handleOpenModalCreate} className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all">
          ➕ Nuevo Ciclo 
        </button>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 bg-[#1c1d24] border px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          toast.type === 'success' ? 'border-emerald-500/50 text-emerald-400' : 'border-rose-500/50 text-rose-400'
        }`}>
          <span className="text-lg">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="font-medium text-sm">{toast.text}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-4xl">
        {loading ? (
          <div className="text-slate-400 text-sm">Cargando...</div>
        ) : ciclos.length === 0 ? (
          <div className="text-slate-500 text-sm">No hay ciclos lectivos registrados.</div>
        ) : (
          ciclos.map(ciclo => (
            <div key={ciclo.id_ciclo_lectivo} className="bg-[#1c1d24] p-5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{ciclo.nombre}</h3>
                <p className="text-xs text-slate-400 mt-1">Del {ciclo.fecha_desde} al {ciclo.fecha_hasta}</p>
              </div>
              <button onClick={() => handleEdit(ciclo)} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm cursor-pointer">
                Editar
              </button>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#17181e]">
              <h3 className="text-sm font-bold text-slate-100">{editingId ? 'Editar Ciclo' : 'Nuevo Ciclo'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Nombre *</label>
                <input 
                  type="text" required placeholder="Ej. Primer Cuatrimestre 2026"
                  value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                  className="w-full border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Fecha Desde *</label>
                <input 
                  type="date" required
                  value={formData.fecha_desde} onChange={e => setFormData({...formData, fecha_desde: e.target.value})}
                  className="w-full border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Fecha Hasta *</label>
                <input 
                  type="date" required
                  value={formData.fecha_hasta} onChange={e => setFormData({...formData, fecha_hasta: e.target.value})}
                  className="w-full border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium cursor-pointer">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
