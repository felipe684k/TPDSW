import { useState } from 'react'

export default function Cursos() {
  // Estado para controlar el modal de registrar curso
  const [modalOpen, setModalOpen] = useState(false)

  // Datos de ejemplo para simular la relación con una Cuota pre-registrada
  const cursosEjemplo = [
    { 
      id_curso: 1, 
      nombre_curso: 'Kids 1', 
      horas_mensuales: 12, 
      matricula: 8000, 
      nivel: 'A1 — Principiante',
      cuota_asociada: { id_cuota: 1, costo_mensual: 12000, fecha_desde: '01/03/2026' }
    },
    { 
      id_curso: 2, 
      nombre_curso: 'Teens 3', 
      horas_mensuales: 16, 
      matricula: 10000, 
      nivel: 'A2 — Elemental',
      cuota_asociada: { id_cuota: 2, costo_mensual: 14500, fecha_desde: '01/03/2026' }
    },
    { 
      id_curso: 3, 
      nombre_curso: 'First Certificate Prep', 
      horas_mensuales: 24, 
      matricula: 15000, 
      nivel: 'B2 — Intermedio Alto',
      cuota_asociada: { id_cuota: 4, costo_mensual: 18000, fecha_desde: '01/03/2026' }
    }
  ]

  // Valores de cuota simulados para el selector
  const cuotasDisponibles = [
    { 
      id_cuota: 1, 
      costo_mensual: 12000, 
      fecha_desde: '01/03/2026', 
      descripcion: 'Tarifa Básica Kids ($12.000)' 
    },

    { 
      id_cuota: 2, 
      costo_mensual: 14500, 
      fecha_desde: '01/03/2026', 
      descripcion: 'Tarifa Teens/Adultos ($14.500)' 
    },

    { 
      id_cuota: 3, 
      costo_mensual: 16000, 
      fecha_desde: '01/03/2026', 
      descripcion: 'Tarifa Business ($16.000)' 
    },

    { 
      id_cuota: 4, 
      costo_mensual: 18000, 
      fecha_desde: '01/03/2026', 
      descripcion: 'Tarifa FCE Cambridge ($18.000)' 
    }
  ]

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Cursos</h1>
          <p className="text-xs text-slate-500 mt-1">Configuración de cursos relacionándolos a valores de cuota existentes.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Registrar Curso 
        </button>
      </div>

      {/* Listado de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cursosEjemplo.map((curso) => (
          <div key={curso.id_curso} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            
            {/* Cabecera de la Tarjeta */}
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">ID: {curso.id_curso}</span>
                  <h3 className="text-sm font-bold text-slate-900">{curso.nombre_curso}</h3>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-2xs font-semibold">
                  {curso.nivel}
                </span>
              </div>

              {/* Atributos propios del Curso */}
              <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">Horas Mensuales</span>
                  <span className="text-xs font-semibold text-slate-700 font-mono">{curso.horas_mensuales} hs</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Valor Matrícula</span>
                  <span className="text-xs font-semibold text-slate-700">${curso.matricula.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>

            {/* Relación seleccionada de ValorCuota */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
              <div>
                <span className="text-[10px] text-slate-400 block">Valor Cuota Vinculado (ID #{curso.cuota_asociada.id_cuota})</span>
                <span className="text-sm font-bold text-slate-950">${curso.cuota_asociada.costo_mensual.toLocaleString('es-AR')}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Válido desde: {curso.cuota_asociada.fecha_desde}</span>
              </div>
              <div className="flex gap-2 pb-1">
                <button className="text-indigo-600 hover:text-indigo-800 font-semibold text-2xs">Editar</button>
                <span className="text-slate-300">|</span>
                <button className="text-rose-600 hover:text-rose-800 font-semibold text-2xs">Desactivar</button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* ==========================================
           MODAL: REGISTRAR CURSO (Vinculando Cuota pre-registrada)
           ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-semibold text-slate-800">🏫 Registrar Nuevo Curso</h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="cursor-pointer w-7 h-7 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Formulario (Scrollable) */}
            <form className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Sección Curso */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Entidad: Curso</div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Nombre del Curso *</label>
                  <input 
                    type="text" required placeholder="Ej. Kids 1" 
                    className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Horas Mensuales *</label>
                    <input 
                      type="number" required placeholder="16" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Matrícula ($) *</label>
                    <input 
                      type="number" required placeholder="10000" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Nivel *</label>
                    <select 
                      required 
                      className="border border-slate-200 rounded p-2 text-xs bg-white outline-none focus:border-indigo-500"
                    >
                      <option value="">— Elegir —</option>
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Relación con ValorCuota existente */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Relación: Seleccionar Valor Cuota Vigente</div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Seleccione la Cuota Pre-registrada *</label>
                  <select 
                    required 
                    className="border border-slate-200 rounded p-2 text-xs bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="">— Seleccionar Tarifa de Cuota Existente —</option>
                    {cuotasDisponibles.map(cuota => (
                      <option key={cuota.id_cuota} value={cuota.id_cuota}>
                        {cuota.descripcion} (vigente desde {cuota.fecha_desde})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1">
                    ⚠️ Debe haber registrado el valor de cuota previamente en el módulo "Valor Cuota" para poder asociarlo aquí.
                  </span>
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 shrink-0">
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
                Guardar Curso
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
