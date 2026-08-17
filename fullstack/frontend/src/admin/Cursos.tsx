import { useState, useEffect } from 'react'
import { cursoService, type Curso } from '../services/curso.service'
import { nivelService, type Nivel } from '../services/nivel.service'

export default function Cursos() {
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  
  const [cursos, setCursos] = useState<Curso[]>([])
  const [niveles, setNiveles] = useState<Nivel[]>([])
  const [loading, setLoading] = useState(true)
  
  const [editingId, setEditingId] = useState<number | null>(null)
  const [cursoToDelete, setCursoToDelete] = useState<number | null>(null)
  
  const [toast, setToast] = useState<{text: string, type: 'success' | 'danger'} | null>(null)

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
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
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

      {/* Listado de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="text-slate-400 text-sm">Cargando cursos...</div>
        ) : cursos.length === 0 ? (
          <div className="text-slate-500 text-sm">No hay cursos registrados.</div>
        ) : (
          cursos.map((curso) => {
            const cuotaActiva = curso.valores_cuota && curso.valores_cuota.length > 0 
              ? curso.valores_cuota[curso.valores_cuota.length - 1] 
              : null;
            
            return (
              <div key={curso.id_curso} className="bg-[#1c1d24] p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                {/* Cabecera de la Tarjeta */}
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">ID: {curso.id_curso}</span>
                      <h3 className="text-sm font-bold text-slate-100">{curso.nombre_curso}</h3>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-950/30 text-indigo-400 text-2xs font-semibold">
                      {curso.nivel?.nombre || 'Nivel ' + curso.codigo_nivel}
                    </span>
                  </div>

                  {/* Atributos propios del Curso */}
                  <div className="grid grid-cols-3 gap-2 mt-4 bg-[#17181e] p-3 rounded-lg border border-slate-800/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Horas Sem.</span>
                      <span className="text-xs font-semibold text-slate-300 font-mono">{curso.horas_semanales} hs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Días x Sem.</span>
                      <span className="text-xs font-semibold text-slate-300 font-mono">{curso.dias_por_semana}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Matrícula</span>
                      <span className="text-xs font-semibold text-slate-300">${Number(curso.matricula).toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>

                {/* Relación seleccionada de ValorCuota */}
                <div className="pt-3 border-t border-slate-800/60 flex justify-between items-end">
                  <div>
                    {cuotaActiva ? (
                      <>
                        <span className="text-[10px] text-slate-400 block">Valor Cuota Vinculado (ID #{cuotaActiva.id_valor_cuota})</span>
                        <span className="text-sm font-bold text-slate-100">${Number(cuotaActiva.costo_mensual).toLocaleString('es-AR')}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Válido desde: {cuotaActiva.fecha_desde}</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-500 block">Sin cuota vinculada</span>
                    )}
                  </div>
                  <div className="flex gap-2 pb-1">
                    <button onClick={() => handleEdit(curso)} className="text-indigo-400 hover:text-indigo-300 font-semibold text-2xs cursor-pointer">Editar</button>
                    <span className="text-slate-700">|</span>
                    <button onClick={() => promptDelete(curso.id_curso!)} className="text-rose-500 hover:text-rose-400 font-semibold text-2xs cursor-pointer">Desactivar</button>
                  </div>
                </div>
              </div>
            )
          })
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
                    Este valor será la tarifa vigente al crear el curso. Modificaciones futuras de precios se harán desde la sección "Valor Cuota".
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
    </div>
  )
}
