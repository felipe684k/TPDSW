import { useState, useEffect } from 'react'
import { aulaService, type Aula } from '../services/aula.service'

export default function Aulas() {
  const [aulas, setAulas] = useState<Aula[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // Formularios
  const [nombre, setNombre] = useState('')
  const [capacidad, setCapacidad] = useState<number | ''>('')
  
  // Estado de carga y errores
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchAulas()
  }, [])

  const fetchAulas = async () => {
    setIsLoading(true)
    try {
      const data = await aulaService.getAulas()
      setAulas(data)
    } catch (error) {
      console.error(error)
      setErrorMsg('Error al cargar las aulas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (aula?: Aula) => {
    if (aula) {
      setEditingId(aula.id!)
      setNombre(aula.nombre)
      setCapacidad(aula.capacidad)
    } else {
      setEditingId(null)
      setNombre('')
      setCapacidad('')
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || !capacidad) return
    
    setIsLoading(true)
    try {
      if (editingId) {
        await aulaService.updateAula(editingId, { nombre, capacidad: Number(capacidad) })
      } else {
        await aulaService.createAula({ nombre, capacidad: Number(capacidad) })
      }
      setModalOpen(false)
      fetchAulas()
    } catch (error) {
      console.error(error)
      setErrorMsg('Error al guardar el aula')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Aulas y Espacios</h1>
          <p className="text-xs text-slate-500 mt-1">Consulta de la infraestructura física del instituto.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Registrar Aula
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/50 border border-rose-800/80 rounded-lg p-3 text-xs text-rose-400">
          {errorMsg}
        </div>
      )}

      <div className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#17181e]">
          <div className="text-xs font-semibold text-slate-300">Listado de Espacios Disponibles</div>
          <span className="text-2xs text-slate-400 bg-[#1c1d24] border border-slate-800 px-2 py-0.5 rounded font-mono">
            Total: {aulas.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nombre del Espacio</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Capacidad Máxima</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading && aulas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-xs text-slate-500">Cargando aulas...</td>
                </tr>
              ) : aulas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-xs text-slate-500">No hay aulas registradas.</td>
                </tr>
              ) : (
                aulas.map((a) => (
                  <tr key={a.id} className="hover:bg-[#17181e] transition-colors">
                    <td className="p-3 text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <span className="text-sm">🏫</span> {a.nombre}
                    </td>
                    <td className="p-3 text-xs font-mono text-slate-500">{a.capacidad} alumnos</td>
                    <td className="p-3 text-xs text-right space-x-2">
                      <button 
                        onClick={() => handleOpenModal(a)}
                        className="text-slate-400 hover:text-indigo-400 transition-colors"
                      >
                        ✎ Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTRAR/EDITAR AULA */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-200">
                {editingId ? '🏫 Editar Aula' : '🏫 Registrar Nueva Aula'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form id="aulaForm" onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Nombre del Aula *</label>
                <input 
                  type="text" required placeholder="Ej. Aula 6" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Capacidad (Cantidad de Alumnos) *</label>
                <input 
                  type="number" required placeholder="Ej. 30" min="1"
                  value={capacidad}
                  onChange={(e) => setCapacidad(e.target.value ? Number(e.target.value) : '')}
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </form>

            <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 rounded-b-xl">
              <button 
                type="button" onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" form="aulaForm" disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar Aula'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
