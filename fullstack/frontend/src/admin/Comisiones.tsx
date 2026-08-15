import { useState } from 'react'
import aulas from '../data/aulas.json'
import horarios from '../data/horarios.json'

export default function Comisiones() {
  const [modalOpen, setModalOpen] = useState(false)

  // Datos simulados (mock)
  const docentesDisponibles = [
    { id: 1, nombre: 'Juan Pérez' },
    { id: 2, nombre: 'Ana Gómez' },
    { id: 3, nombre: 'Carlos López' }
  ]

  const cursosDisponibles = [
    { id: 1, nombre: 'Kids 1', nivel: 'A1', dias_por_semana: 2, horas_semanales: 4 },
    { id: 2, nombre: 'Teens 3', nivel: 'A2', dias_por_semana: 2, horas_semanales: 4 },
    { id: 3, nombre: 'First Certificate Prep', nivel: 'B2', dias_por_semana: 3, horas_semanales: 6 }
  ]

  const comisionesEjemplo = [
    { 
      id_comision: 1, 
      nombre_comision: 'Kids 1 - A', 
      curso: 'Kids 1', 
      docente: 'Ana Gómez',
      aula: 'Aula A',
      horarios: ['Lunes 08:00 - 10:00', 'Miércoles 08:00 - 10:00']
    },
    { 
      id_comision: 2, 
      nombre_comision: 'Teens 3 - Noche', 
      curso: 'Teens 3', 
      docente: 'Carlos López',
      aula: 'Aula C',
      horarios: ['Jueves 18:00 - 20:00']
    }
  ]

  const [expandedCurso, setExpandedCurso] = useState<string | null>(null)
  
  const [selectedCursoId, setSelectedCursoId] = useState<string>("")
  const [generatedName, setGeneratedName] = useState<string>("")

  const handleCursoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setSelectedCursoId(cid);
    if (!cid) {
      setGeneratedName("");
      return;
    }

    const cursoSelected = cursosDisponibles.find(c => c.id === Number(cid));
    if (cursoSelected) {
      // Contar cuántas comisiones ya tiene este curso
      const count = comisionesEjemplo.filter(c => c.curso === cursoSelected.nombre).length;
      const nnn = String(count + 1).padStart(3, '0');
      const aa = new Date().getFullYear().toString().slice(-2);
      
      const newName = `${cursoSelected.nombre} - COM - ${nnn} - ${aa}`;
      setGeneratedName(newName);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Comisiones</h1>
          <p className="text-xs text-slate-500 mt-1">Gestión de comisiones, aulas y horarios asignados.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Registrar Comisión
        </button>
      </div>

      {/* Listado de Cursos Expandibles (Acordeón) */}
      <div className="space-y-3">
        {cursosDisponibles.map(curso => {
          const comisionesDelCurso = comisionesEjemplo.filter(c => c.curso === curso.nombre);
          const isExpanded = expandedCurso === curso.nombre;

          return (
            <div key={curso.id} className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden transition-all">
              
              {/* Botón Cabecera del Curso */}
              <button 
                onClick={() => setExpandedCurso(isExpanded ? null : curso.nombre)}
                className="w-full p-4 flex justify-between items-center bg-[#1c1d24] hover:bg-[#17181e] transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-950/50 flex items-center justify-center text-indigo-400 border border-indigo-900/30">
                    {isExpanded ? '📂' : '📁'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100">{curso.nombre}</h3>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-950/30 text-indigo-400 text-2xs font-semibold">{curso.nivel}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {comisionesDelCurso.length} {comisionesDelCurso.length === 1 ? 'comisión disponible' : 'comisiones registradas'}
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
                      Aún no hay comisiones creadas para este curso. Podés registrar una nueva con el botón de arriba.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {comisionesDelCurso.map((comision) => (
                        <div key={comision.id_comision} className="bg-[#1c1d24] p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col hover:border-indigo-500/30 transition-colors">
                          
                          <div className="flex justify-between items-start border-b border-slate-800/60 pb-3 mb-3">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-mono">ID: {comision.id_comision}</span>
                              <h3 className="text-sm font-bold text-slate-100">{comision.nombre_comision}</h3>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-950/30 text-indigo-400 text-2xs font-semibold">
                              {comision.curso}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <span className="text-[10px] text-slate-400 block">👨‍🏫 Docente Responsable</span>
                              <span className="text-xs font-semibold text-slate-300">{comision.docente}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] text-slate-400 block">🏫 Aula</span>
                                <span className="text-xs font-semibold text-slate-300">{comision.aula}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">⏰ Horarios</span>
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                  {comision.horarios.map((h, i) => (
                                    <span key={i} className="text-2xs font-semibold text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded">{h}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-end gap-3">
                            <button className="text-indigo-400 hover:text-indigo-300 font-semibold text-2xs">Editar</button>
                            <span className="text-slate-800">|</span>
                            <button className="text-rose-500 hover:text-rose-400 font-semibold text-2xs">Eliminar</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* MODAL: REGISTRAR COMISIÓN */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-200">📝 Registrar Nueva Comisión</h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form className="p-5 space-y-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Curso Asociado *</label>
                <select 
                  required 
                  value={selectedCursoId}
                  onChange={handleCursoChange}
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] outline-none focus:border-indigo-500"
                >
                  <option value="">— Seleccionar Curso —</option>
                  {cursosDisponibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Nombre de la Comisión (Autogenerado) *</label>
                <input 
                  type="text" 
                  readOnly 
                  value={generatedName}
                  placeholder="Seleccione un curso primero" 
                  className="border border-slate-800 bg-[#17181e] text-slate-400 rounded p-2 text-xs outline-none opacity-80 cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Docente Responsable *</label>
                <select required className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] outline-none focus:border-indigo-500">
                  <option value="">— Seleccionar Docente —</option>
                  {docentesDisponibles.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Aula Asignada *</label>
                <select required className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] outline-none focus:border-indigo-500">
                  <option value="">— Seleccionar Aula —</option>
                  {aulas.map(a => <option key={a.id} value={a.id}>{a.nombre} (Cap: {a.capacidad})</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/60">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-400">Horarios de Cursada *</label>
                  {selectedCursoId ? (
                    <span className="text-[10px] text-indigo-400 mt-1">
                      ⚠️ Según el curso, debe seleccionar exactamente <b>{cursosDisponibles.find(c => c.id === Number(selectedCursoId))?.dias_por_semana} días</b> asegurando que compartan la misma franja horaria.
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 mt-1">Seleccione un curso para ver los requisitos de horario.</span>
                  )}
                </div>
                
                <div className={`border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] flex flex-col gap-2 max-h-32 overflow-y-auto ${!selectedCursoId ? 'opacity-50 pointer-events-none' : ''}`}>
                  {horarios.map(h => (
                    <label key={h.id} className="flex items-center gap-2 cursor-pointer hover:bg-[#17181e] p-1 rounded transition-colors">
                      <input 
                        type="checkbox" 
                        value={h.id}
                        className="rounded border-slate-300 text-indigo-400 focus:ring-indigo-500"
                      />
                      <span className="text-slate-300">{h.descripcion}</span>
                    </label>
                  ))}
                </div>
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
                type="button" onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all"
              >
                Guardar Comisión
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
