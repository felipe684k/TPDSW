import { useState, useEffect } from 'react'
import { cursoService, type Curso } from '../services/curso.service'
import { nivelService, type Nivel } from '../services/nivel.service'
import { valorCuotaService } from '../services/valorCuota.service'

export default function Cursos() {
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [updateCuotaModalOpen, setUpdateCuotaModalOpen] = useState(false)
  
  const [cursos, setCursos] = useState<Curso[]>([])
  const [niveles, setNiveles] = useState<Nivel[]>([])
  const [loading, setLoading] = useState(true)
  
  const [editingId, setEditingId] = useState<number | null>(null)
  const [cursoToDelete, setCursoToDelete] = useState<number | null>(null)
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null)
  const [newCuotaAmount, setNewCuotaAmount] = useState('')
  
  const [toast, setToast] = useState<{text: string, type: 'success' | 'danger'} | null>(null)

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Verificar si es una fecha inválida
    if (isNaN(date.getTime())) return isoString; 
    return date.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  }

  const [formData, setFormData] = useState({
    nombre_curso: '',
    codigo_nivel: '',
    horas_semanales: '',
    dias_por_semana: '',
    matricula: '',
    valor_cuota_inicial: ''
  })

  const fetchCursos = async () => {
    try {
      const data = await cursoService.getCursos()
      setCursos(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNiveles = async () => {
    try {
      const data = await nivelService.getNiveles()
      setNiveles(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchCursos()
    fetchNiveles()
  }, [])

  const handleOpenModalCreate = () => {
    setEditingId(null)
    setFormData({ nombre_curso: '', codigo_nivel: '', horas_semanales: '', dias_por_semana: '', matricula: '', valor_cuota_inicial: '' })
    setModalOpen(true)
    setToast(null)
  }

  const handleEdit = (curso: Curso) => {
    setEditingId(curso.id_curso || null)
    const ultimaCuota = curso.valores_cuota && curso.valores_cuota.length > 0 
      ? curso.valores_cuota[curso.valores_cuota.length - 1].costo_mensual 
      : ''
      
    setFormData({ 
      nombre_curso: curso.nombre_curso, 
      codigo_nivel: curso.codigo_nivel.toString(), 
      horas_semanales: curso.horas_semanales.toString(), 
      dias_por_semana: curso.dias_por_semana.toString(), 
      matricula: curso.matricula.toString(), 
      valor_cuota_inicial: ultimaCuota.toString() // Only relevant when creating, but keep it for UX consistency
    })
    setModalOpen(true)
    setToast(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dataToSave = {
        nombre_curso: formData.nombre_curso,
        codigo_nivel: Number(formData.codigo_nivel),
        horas_semanales: Number(formData.horas_semanales),
        dias_por_semana: Number(formData.dias_por_semana),
        matricula: Number(formData.matricula),
        valor_cuota_inicial: Number(formData.valor_cuota_inicial)
      }

      if (editingId) {
        await cursoService.updateCurso(editingId, dataToSave)
      } else {
        await cursoService.createCurso(dataToSave)
      }
      
      setModalOpen(false)
      setToast({ text: editingId ? "Curso actualizado con éxito" : "Curso registrado con éxito", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      
      fetchCursos()
    } catch (error) {
      console.error('Error guardando curso', error)
    }
  }

  const promptDelete = (id: number) => {
    setCursoToDelete(id)
    setDeleteModalOpen(true)
    setToast(null)
  }

  const executeDelete = async () => {
    if (!cursoToDelete) return
    try {
      await cursoService.deleteCurso(cursoToDelete)
      setToast({ text: "Curso dado de baja con éxito", type: 'danger' })
      setTimeout(() => setToast(null), 3000)
      fetchCursos()
      setDeleteModalOpen(false)
      setCursoToDelete(null)
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateCuota = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCurso || !selectedCurso.id_curso) return
    try {
      const today = new Date().toISOString()
      await valorCuotaService.createValorCuota({
        id_curso: selectedCurso.id_curso,
        costo_mensual: Number(newCuotaAmount),
        fecha_desde: today
      })
      setUpdateCuotaModalOpen(false)
      setToast({ text: "Valor de cuota actualizado", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      fetchCursos()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Cursos</h1>
          <p className="text-xs text-slate-500 mt-1">Gestión del catálogo de cursos y sus tarifas.</p>
        </div>
        <button 
          onClick={handleOpenModalCreate} 
          className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Registrar Curso 
        </button>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 bg-[#1c1d24] border px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          toast.type === 'success' 
            ? 'border-emerald-500/50 text-emerald-400 shadow-emerald-900/20' 
            : 'border-rose-500/50 text-rose-400 shadow-rose-900/20'
        }`}>
          <span className="text-lg">{toast.type === 'success' ? '✅' : '🗑️'}</span>
          <span className="font-medium text-sm tracking-wide">{toast.text}</span>
        </div>
      )}

      {/* Listado de Cursos Agrupados por Nivel */}
      <div className="flex flex-col max-w-6xl mx-auto gap-8 w-full">
        {loading ? (
          <div className="text-slate-400 text-sm">Cargando cursos...</div>
        ) : cursos.length === 0 ? (
          <div className="text-slate-500 text-sm">No hay cursos registrados.</div>
        ) : (
          (() => {
            // Ordenar niveles por su lista enlazada (codigo_nivel_siguiente)
            const isSiguiente = new Set(niveles.map(n => n.codigo_nivel_siguiente).filter(Boolean));
            let current = niveles.find(n => !isSiguiente.has(n.codigo_nivel));
            if (!current) current = niveles[0]; // fallback
            
            const sortedNiveles = [];
            while (current) {
              sortedNiveles.push(current);
              const nextId: number | undefined | null = current.codigo_nivel_siguiente;
              const nextCurrent: Nivel | undefined = niveles.find(n => n.codigo_nivel === nextId);
              if (!nextCurrent || sortedNiveles.some(n => n.codigo_nivel === nextCurrent.codigo_nivel)) break;
              current = nextCurrent;
            }
            
            const sortedIds = new Set(sortedNiveles.map(n => n.codigo_nivel));
            const disconnected = niveles.filter(n => !sortedIds.has(n.codigo_nivel));
            const allSortedNiveles = [...sortedNiveles, ...disconnected];

            return allSortedNiveles.map(nivel => {
              const cursosDelNivel = cursos.filter(c => c.codigo_nivel === nivel.codigo_nivel);
              if (cursosDelNivel.length === 0) return null;

              return (
                <div key={nivel.codigo_nivel} className="space-y-4">
                  {/* Encabezado del Nivel */}
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                    <span className="w-8 h-8 rounded bg-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold text-sm">
                      {nivel.nombre.charAt(0).toUpperCase()}
                    </span>
                    <h2 className="text-lg font-bold text-slate-200">{nivel.nombre}</h2>
                  </div>

                  {/* Tarjetas de Cursos del Nivel */}
                  <div className="space-y-3">
                    {cursosDelNivel.map((curso) => {
                      const sortedCuotas = curso.valores_cuota ? [...curso.valores_cuota].sort((a, b) => new Date(a.fecha_desde).getTime() - new Date(b.fecha_desde).getTime()) : []
                      const cuotaActiva = sortedCuotas.length > 0 ? sortedCuotas[sortedCuotas.length - 1] : null;
                      
                      return (
                        <div key={curso.id_curso} className="bg-[#1c1d24] p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                          {/* Cabecera de la Tarjeta */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full md:w-1/4">
                            <div>
                              <h3 className="text-base font-bold text-slate-100">{curso.nombre_curso}</h3>
                            </div>
                          </div>

                          {/* Atributos propios del Curso */}
                          <div className="flex flex-row justify-around items-center w-full md:w-2/4 bg-[#17181e] p-3 rounded-lg border border-slate-800/60">
                            <div className="text-center">
                              <span className="text-[10px] text-slate-400 block mb-1">Horas Sem.</span>
                              <span className="text-sm font-semibold text-slate-300 font-mono">{curso.horas_semanales} hs</span>
                            </div>
                            <div className="text-center px-4 border-l border-r border-slate-800/60">
                              <span className="text-[10px] text-slate-400 block mb-1">Días x Sem.</span>
                              <span className="text-sm font-semibold text-slate-300 font-mono">{curso.dias_por_semana}</span>
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] text-slate-400 block mb-1">Matrícula</span>
                              <span className="text-sm font-semibold text-slate-300">${Number(curso.matricula).toLocaleString('es-AR')}</span>
                            </div>
                          </div>

                          {/* Relación seleccionada de ValorCuota y Acciones */}
                          <div className="flex flex-row justify-between items-center w-full md:w-1/4">
                            <div>
                              {cuotaActiva ? (
                                <>
                                  <span className="text-[10px] text-slate-400 block">Cuota Actual</span>
                                  <span className="text-base font-bold text-emerald-400">${Number(cuotaActiva.costo_mensual).toLocaleString('es-AR')}</span>
                                  <div className="flex gap-2 mt-1">
                                    <button 
                                      onClick={() => { setSelectedCurso(curso); setNewCuotaAmount(''); setUpdateCuotaModalOpen(true); }}
                                      className="cursor-pointer text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded"
                                    >
                                      Actualizar
                                    </button>
                                    <button 
                                      onClick={() => { setSelectedCurso(curso); setHistoryModalOpen(true); }}
                                      className="cursor-pointer text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded"
                                    >
                                      Historial
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-500 block">Sin cuota</span>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 border-l border-slate-800/60 pl-4 ml-2">
                              <button onClick={() => handleEdit(curso)} className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs cursor-pointer text-left">Editar</button>
                              <button onClick={() => promptDelete(curso.id_curso!)} className="text-rose-500 hover:text-rose-400 font-semibold text-xs cursor-pointer text-left">Desactivar</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          })()
        )}
      </div>

      {/* ==========================================
           MODAL: REGISTRAR/EDITAR CURSO
           ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-semibold text-slate-200">🏫 {editingId ? 'Editar Curso' : 'Registrar Nuevo Curso'}</h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="cursor-pointer w-7 h-7 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Nombre del Curso *</label>
                <input 
                  type="text" required placeholder="Ej. Kids 1" 
                  value={formData.nombre_curso}
                  onChange={e => setFormData({...formData, nombre_curso: e.target.value})}
                  className="border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Nivel *</label>
                <select 
                  required 
                  value={formData.codigo_nivel}
                  onChange={e => setFormData({...formData, codigo_nivel: e.target.value})}
                  className="border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="">— Elegir Nivel —</option>
                  {niveles.map(n => (
                    <option key={n.codigo_nivel} value={n.codigo_nivel}>{n.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Horas Semanales *</label>
                <input 
                  type="number" required placeholder="4" min="1"
                  value={formData.horas_semanales}
                  onChange={e => setFormData({...formData, horas_semanales: e.target.value})}
                  className="border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Días por Semana *</label>
                <input 
                  type="number" required placeholder="2" min="1" max="7"
                  value={formData.dias_por_semana}
                  onChange={e => setFormData({...formData, dias_por_semana: e.target.value})}
                  className="border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Matrícula ($) *</label>
                <input 
                  type="number" required placeholder="10000" min="0" step="0.01"
                  value={formData.matricula}
                  onChange={e => setFormData({...formData, matricula: e.target.value})}
                  className="border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              {!editingId && (
                <div className="flex flex-col gap-1.5 pt-3 mt-2 border-t border-slate-800/60">
                  <label className="text-xs font-semibold text-indigo-400">Valor Cuota Mensual Inicial ($) *</label>
                  <input 
                    type="number" required placeholder="15000" min="0" step="0.01"
                    value={formData.valor_cuota_inicial}
                    onChange={e => setFormData({...formData, valor_cuota_inicial: e.target.value})}
                    className="border border-indigo-500/30 bg-[#1c1d24] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">
                    Este valor será la tarifa vigente al crear el curso. Modificaciones futuras de precios se harán desde las opciones del curso.
                  </span>
                </div>
              )}

              {/* Contenedor invisible para que el botón submit del form funcione */}
              <button type="submit" className="hidden"></button>
            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 shrink-0">
              <button 
                type="button" onClick={() => setModalOpen(false)}
                className="cursor-pointer px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button" onClick={handleSubmit}
                className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all"
              >
                {editingId ? 'Guardar Cambios' : 'Guardar Curso'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-sm p-5 border border-slate-800 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-xl mx-auto mb-3">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Desactivar Curso</h3>
            <p className="text-xs text-slate-400 mb-6">¿Estás seguro que deseas dar de baja este curso? Se ocultará de los listados activos.</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium transition-colors cursor-pointer"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ACTUALIZAR CUOTA */}
      {updateCuotaModalOpen && selectedCurso && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#17181e]">
              <h3 className="text-sm font-bold text-slate-100">Actualizar Cuota</h3>
              <button onClick={() => setUpdateCuotaModalOpen(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>
            <form onSubmit={handleUpdateCuota} className="p-5 flex flex-col gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Curso</p>
                <p className="text-sm font-medium text-slate-200">{selectedCurso.nombre_curso}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Nuevo Costo Mensual ($)</label>
                <input 
                  type="number" required placeholder="Ej. 18000" min="0" step="0.01"
                  value={newCuotaAmount} onChange={e => setNewCuotaAmount(e.target.value)}
                  className="w-full border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2 text-sm outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">La fecha de inicio se registrará automáticamente con la fecha y hora actual.</p>
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setUpdateCuotaModalOpen(false)} className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium">Cancelar</button>
                <button type="submit" className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium">Guardar Cuota</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HISTORIAL DE CUOTAS */}
      {historyModalOpen && selectedCurso && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 pt-20 z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden max-h-[80vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#17181e] shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Historial de Cuotas</h3>
                <p className="text-xs text-slate-400">{selectedCurso.nombre_curso}</p>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>
            <div className="overflow-y-auto p-4">
              {(!selectedCurso.valores_cuota || selectedCurso.valores_cuota.length === 0) ? (
                <p className="text-sm text-slate-500 text-center py-4">No hay historial de cuotas para este curso.</p>
              ) : (
                <div className="space-y-3">
                  {[...selectedCurso.valores_cuota]
                    .sort((a, b) => new Date(b.fecha_desde).getTime() - new Date(a.fecha_desde).getTime())
                    .map((cuota, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-slate-800 bg-[#17181e]">
                        <div>
                          <p className="text-sm font-bold text-emerald-400">${Number(cuota.costo_mensual).toLocaleString('es-AR')}</p>
                          <p className="text-xs text-slate-500">Desde: {formatDate(cuota.fecha_desde)}</p>
                        </div>
                        {idx === 0 && <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Vigente</span>}
                      </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-800 bg-[#17181e] shrink-0 text-right">
              <button onClick={() => setHistoryModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium">Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
