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
    { id: 1, nombre: 'Kids 1' },
    { id: 2, nombre: 'Teens 3' },
    { id: 3, nombre: 'First Certificate Prep' }
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

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Comisiones</h1>
          <p className="text-xs text-slate-500 mt-1">Gestión de comisiones, aulas y horarios asignados.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Registrar Comisión
        </button>
      </div>

      {/* Listado de Comisiones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comisionesEjemplo.map((comision) => (
          <div key={comision.id_comision} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">ID: {comision.id_comision}</span>
                <h3 className="text-sm font-bold text-slate-900">{comision.nombre_comision}</h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-2xs font-semibold">
                {comision.curso}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 block">👨‍🏫 Docente Responsable</span>
                <span className="text-xs font-semibold text-slate-700">{comision.docente}</span>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block">🏫 Aula</span>
                  <span className="text-xs font-semibold text-slate-700">{comision.aula}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">⏰ Horarios</span>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {comision.horarios.map((h, i) => (
                      <span key={i} className="text-xs font-semibold text-slate-700">{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button className="text-indigo-600 hover:text-indigo-800 font-semibold text-2xs">Editar</button>
              <button className="text-rose-600 hover:text-rose-800 font-semibold text-2xs">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: REGISTRAR COMISIÓN */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-800">📝 Registrar Nueva Comisión</h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form className="p-5 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Nombre / Identificador de la Comisión *</label>
                <input 
                  type="text" required placeholder="Ej. Kids 1 - A" 
                  className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Curso Asociado *</label>
                <select required className="border border-slate-200 rounded p-2 text-xs bg-white outline-none focus:border-indigo-500">
                  <option value="">— Seleccionar Curso —</option>
                  {cursosDisponibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Docente Responsable *</label>
                <select required className="border border-slate-200 rounded p-2 text-xs bg-white outline-none focus:border-indigo-500">
                  <option value="">— Seleccionar Docente —</option>
                  {docentesDisponibles.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Aula Asignada *</label>
                <select required className="border border-slate-200 rounded p-2 text-xs bg-white outline-none focus:border-indigo-500">
                  <option value="">— Seleccionar Aula —</option>
                  {aulas.map(a => <option key={a.id} value={a.id}>{a.nombre} (Cap: {a.capacidad})</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-600">Horarios Asignados (Seleccione múltiples) *</label>
                <div className="border border-slate-200 rounded p-2 text-xs bg-white flex flex-col gap-2 max-h-32 overflow-y-auto">
                  {horarios.map(h => (
                    <label key={h.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                      <input 
                        type="checkbox" 
                        value={h.id}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700">{h.descripcion}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 rounded-b-xl">
              <button 
                type="button" onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded text-xs font-medium transition-colors"
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
