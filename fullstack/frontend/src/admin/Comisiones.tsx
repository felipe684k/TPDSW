import { useState, useEffect } from 'react'
import { comisionService, aulaService, type Comision, type Aula } from '../services/comision.service'
import { cicloLectivoService, type CicloLectivo } from '../services/cicloLectivo.service'
import { cursoService, type Curso } from '../services/curso.service'
import { profesorService, type Profesor as Usuario } from '../services/profesor.service'

export default function Comisiones() {
  const [modalOpen, setModalOpen] = useState(false)
  
  const [ciclos, setCiclos] = useState<CicloLectivo[]>([])
  const [comisiones, setComisiones] = useState<Comision[]>([])
  const [aulas, setAulas] = useState<Aula[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [profesores, setProfesores] = useState<Usuario[]>([])
  
  const [selectedCicloId, setSelectedCicloId] = useState<number | ''>('')
  
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{text: string, type: 'success' | 'danger'} | null>(null)
  
  const [expandedCurso, setExpandedCurso] = useState<number | null>(null)

  const [formData, setFormData] = useState<{
    id_curso: string,
    id_aula: string,
    id_profesor: string,
    horarios: {dia: string, hora_inicio: string, hora_fin: string}[]
  }>({
    id_curso: '', id_aula: '', id_profesor: '', horarios: [{dia: 'LUNES', hora_inicio: '08:00', hora_fin: '10:00'}]
  })

  const fetchData = async () => {
    try {
      const [ciclosData, aulasData, cursosData, profesData] = await Promise.all([
        cicloLectivoService.getCiclos(),
        aulaService.getAulas(),
        cursoService.getCursos(),
        profesorService.getProfesores()
      ])
      setCiclos(ciclosData)
      setAulas(aulasData)
      setCursos(cursosData)
      setProfesores(profesData)
      
      if (ciclosData.length > 0) {
        setSelectedCicloId(ciclosData[0].id_ciclo_lectivo!)
        fetchComisiones(ciclosData[0].id_ciclo_lectivo!)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchComisiones = async (id_ciclo: number) => {
    setLoading(true)
    try {
      const data = await comisionService.getComisiones(id_ciclo)
      setComisiones(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCicloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    setSelectedCicloId(id)
    fetchComisiones(id)
  }

  const handleAddHorario = () => {
    setFormData({
      ...formData,
      horarios: [...formData.horarios, { dia: 'LUNES', hora_inicio: '08:00', hora_fin: '10:00' }]
    })
  }

  const handleRemoveHorario = (index: number) => {
    setFormData({
      ...formData,
      horarios: formData.horarios.filter((_, i) => i !== index)
    })
  }

  const handleHorarioChange = (index: number, field: string, value: string) => {
    const newHorarios = [...formData.horarios]
    newHorarios[index] = { ...newHorarios[index], [field]: value }
    setFormData({ ...formData, horarios: newHorarios })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar horarios
    for (const h of formData.horarios) {
      if (h.hora_inicio >= h.hora_fin) {
        setToast({ text: `Horario inválido en ${h.dia}: La hora de fin debe ser posterior a la de inicio.`, type: 'danger' })
        setTimeout(() => setToast(null), 4000)
        return
      }
    }

    if (!selectedCicloId) {
      setToast({ text: "Seleccione un ciclo lectivo primero", type: 'danger' })
      return
    }
    
    try {
      await comisionService.createComision({
        id_curso: Number(formData.id_curso),
        id_aula: Number(formData.id_aula),
        id_ciclo_lectivo: selectedCicloId,
        id_profesor: formData.id_profesor ? Number(formData.id_profesor) : undefined,
        horarios: formData.horarios
      })
      
      setModalOpen(false)
      setToast({ text: "Comisión creada con éxito", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      fetchComisiones(selectedCicloId as number)
      
      // Reset form
      setFormData({ id_curso: '', id_aula: '', id_profesor: '', horarios: [{dia: 'LUNES', hora_inicio: '08:00', hora_fin: '10:00'}] })
    } catch (error: any) {
      setToast({ text: error.message || "Error al crear", type: 'danger' })
      setTimeout(() => setToast(null), 4000)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que desea eliminar esta comisión?')) return;
    try {
      await comisionService.deleteComision(id)
      setToast({ text: "Comisión eliminada", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      if (selectedCicloId) fetchComisiones(selectedCicloId as number)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Comisiones y Horarios</h1>
          <p className="text-xs text-slate-500 mt-1">Gestión de aulas, cruce de horarios y asignación de profesores.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={selectedCicloId} 
            onChange={handleCicloChange}
            className="border border-slate-700 bg-[#17181e] text-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 min-w-[200px]"
          >
            {ciclos.length === 0 && <option value="">Sin ciclos...</option>}
            {ciclos.map(c => (
              <option key={c.id_ciclo_lectivo} value={c.id_ciclo_lectivo}>{c.nombre}</option>
            ))}
          </select>
          <button 
            onClick={() => {
              if(!selectedCicloId) { setToast({text:'Debe seleccionar o crear un ciclo primero', type:'danger'}); return; }
              setModalOpen(true)
            }} 
            className="cursor-pointer whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
          >
            ➕ Crear Comisión
          </button>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] bg-[#1c1d24] border px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          toast.type === 'success' ? 'border-emerald-500/50 text-emerald-400' : 'border-rose-500/50 text-rose-400'
        }`}>
          <span className="text-lg">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="font-medium text-sm whitespace-pre-line">{toast.text}</span>
        </div>
      )}

      {/* Listado agrupado por Curso (Acordeón) */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-slate-400 text-sm">Cargando comisiones...</div>
        ) : cursos.length === 0 ? (
          <div className="text-slate-500 text-sm bg-[#1c1d24] p-8 rounded-xl border border-slate-800 text-center">
            No hay cursos para mostrar.
          </div>
        ) : (
          cursos.map(curso => {
            const comisionesDelCurso = (comisiones || []).filter(c => c.id_curso === curso.id_curso);
            const isExpanded = expandedCurso === curso.id_curso;

            return (
              <div key={curso.id_curso} className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden transition-all">
                {/* Botón Cabecera del Curso */}
                <button 
                  onClick={() => setExpandedCurso(isExpanded ? null : curso.id_curso!)}
                  className="w-full p-4 flex justify-between items-center bg-[#1c1d24] hover:bg-[#17181e] transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-950/50 flex items-center justify-center text-indigo-400 border border-indigo-900/30">
                      {isExpanded ? '📂' : '📁'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-100">{curso.nombre_curso}</h3>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-950/30 text-indigo-400 text-[10px] font-semibold">
                          {curso.nivel?.nombre || `Nivel ${curso.codigo_nivel}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {comisionesDelCurso.length} {comisionesDelCurso.length === 1 ? 'comisión registrada' : 'comisiones registradas'}
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-500 font-mono text-sm bg-slate-900 w-8 h-8 rounded flex items-center justify-center">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </button>

                {/* Contenido Expandible (Grilla de Comisiones) */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/60 bg-[#17181e]/30">
                    {comisionesDelCurso.length === 0 ? (
                      <div className="text-center p-6 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                        Aún no hay comisiones creadas para este curso en este ciclo lectivo.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {comisionesDelCurso.map((comision) => (
                          <div key={comision.id_comision} className="bg-[#1c1d24] p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col hover:border-indigo-500/30 transition-colors">
                            
                            <div className="flex justify-between items-start border-b border-slate-800/60 pb-3 mb-3">
                              <div>
                                <h3 className="text-sm font-bold text-slate-100">{comision.nombre}</h3>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <span className="text-[10px] text-slate-400 block">👨‍🏫 Docente Responsable</span>
                                <span className="text-xs font-semibold text-slate-300">
                                  {comision.profesores && comision.profesores.length > 0 
                                    ? `${comision.profesores[0].nombre} ${comision.profesores[0].apellido}` 
                                    : 'Sin asignar'}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] text-slate-400 block">🏫 Aula</span>
                                  <span className="text-xs font-semibold text-slate-300">{comision.aula?.nombre || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block">⏰ Horarios</span>
                                  <div className="flex flex-col gap-0.5 mt-0.5">
                                    {comision.horarios && comision.horarios.map(h => (
                                      <span key={h.id_horario} className="text-[10px] font-semibold text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded">
                                        {h.dia.substring(0,3)}: {h.hora_inicio.substring(0,5)} a {h.hora_fin.substring(0,5)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-end gap-3">
                              <button onClick={() => handleDelete(comision.id_comision!)} className="text-rose-500 hover:text-rose-400 font-semibold text-[10px] cursor-pointer">Eliminar</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modal Crear */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden my-auto border border-slate-800">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#17181e]">
              <h3 className="text-sm font-bold text-slate-100">Nueva Comisión</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Curso *</label>
                  <select required value={formData.id_curso} onChange={e => setFormData({...formData, id_curso: e.target.value})} className="w-full border border-slate-700 bg-[#17181e] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500">
                    <option value="">-- Seleccionar --</option>
                    {cursos.map(c => <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Aula *</label>
                  <select required value={formData.id_aula} onChange={e => setFormData({...formData, id_aula: e.target.value})} className="w-full border border-slate-700 bg-[#17181e] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500">
                    <option value="">-- Seleccionar --</option>
                    {aulas.map(a => <option key={a.id} value={a.id}>{a.nombre} (Cap: {a.capacidad})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Profesor Asignado *</label>
                <select required value={formData.id_profesor} onChange={e => setFormData({...formData, id_profesor: e.target.value})} className="w-full border border-slate-700 bg-[#17181e] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500">
                  <option value="">-- Seleccionar --</option>
                  {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                </select>
              </div>

              <div className="border border-slate-800 rounded-lg p-4 bg-[#17181e]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-300">Horarios</span>
                  <button type="button" onClick={handleAddHorario} className="text-[10px] cursor-pointer bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded hover:bg-indigo-500/30 transition-colors">
                    + Añadir Día
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.horarios.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={h.dia} onChange={e => handleHorarioChange(i, 'dia', e.target.value)} className="flex-1 border border-slate-700 bg-[#1c1d24] text-slate-200 rounded p-2 text-xs outline-none">
                        <option value="LUNES">Lunes</option>
                        <option value="MARTES">Martes</option>
                        <option value="MIERCOLES">Miércoles</option>
                        <option value="JUEVES">Jueves</option>
                        <option value="VIERNES">Viernes</option>
                        <option value="SABADO">Sábado</option>
                      </select>
                      <input type="time" required value={h.hora_inicio} onChange={e => handleHorarioChange(i, 'hora_inicio', e.target.value)} className="w-24 border border-slate-700 bg-[#1c1d24] text-slate-200 rounded p-2 text-xs outline-none" />
                      <span className="text-slate-500">a</span>
                      <input type="time" required value={h.hora_fin} onChange={e => handleHorarioChange(i, 'hora_fin', e.target.value)} className="w-24 border border-slate-700 bg-[#1c1d24] text-slate-200 rounded p-2 text-xs outline-none" />
                      
                      {formData.horarios.length > 1 && (
                        <button type="button" onClick={() => handleRemoveHorario(i)} className="cursor-pointer w-7 h-7 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 rounded ml-1">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-3 py-2 border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 rounded text-xs font-medium cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium cursor-pointer">Validar y Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
