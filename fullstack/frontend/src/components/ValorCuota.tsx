import { useState } from 'react'

export default function ValorCuota() {
  const [modalOpen, setModalOpen] = useState(false)

  // Listado de valores de cuota pre-registrados en el sistema
  const cuotasRegistradas = [
    { id_cuota: 1, costo_mensual: 12000, fecha_desde: '01/03/2026', descripcion: 'Tarifa Básica Kids' },
    { id_cuota: 2, costo_mensual: 14500, fecha_desde: '01/03/2026', descripcion: 'Tarifa Teens/Adultos standard' },
    { id_cuota: 3, costo_mensual: 16000, fecha_desde: '01/03/2026', descripcion: 'Tarifa Business / Especiales' },
    { id_cuota: 4, costo_mensual: 18000, fecha_desde: '01/03/2026', descripcion: 'Tarifa Preparación Cambridge (FCE)' },
    { id_cuota: 5, costo_mensual: 15000, fecha_desde: '01/08/2026', descripcion: 'Ajuste Teens Segundo Semestre' }
  ]

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Valores de Cuota</h1>
          <p className="text-xs text-slate-500 mt-1">Registrar y administrar tarifas globales disponibles para asociar a los cursos.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Registrar Valor Cuota
        </button>
      </div>

      {/* Tabla de Valores Registrados */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div className="text-xs font-semibold text-slate-700">Tarifas del Sistema</div>
          <span className="text-2xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
            Total: {cuotasRegistradas.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">ID Cuota</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Descripción</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Costo Mensual</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vigente Desde (Fecha Desde)</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cuotasRegistradas.map((cuota) => (
                <tr key={cuota.id_cuota} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-xs font-mono font-bold text-slate-400">#{cuota.id_cuota}</td>
                  <td className="p-3 text-xs text-slate-700 font-semibold">{cuota.descripcion}</td>
                  <td className="p-3 text-xs font-bold text-slate-900">
                    ${cuota.costo_mensual.toLocaleString('es-AR')}
                  </td>
                  <td className="p-3 text-xs font-mono text-slate-500">{cuota.fecha_desde}</td>
                  <td className="p-3 text-xs">
                    <button className="text-indigo-600 hover:text-indigo-800 font-semibold text-2xs mr-2">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
           MODAL: REGISTRAR VALOR CUOTA
           ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-semibold text-slate-800">💰 Registrar Valor Cuota</h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <form className="p-5 space-y-4">
              
              {/* Descripción */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Descripción / Identificador *</label>
                <input 
                  type="text" required placeholder="Ej. Tarifa Kids 2026" 
                  className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              {/* Costo Mensual */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Costo Mensual ($) *</label>
                <input 
                  type="number" required placeholder="Ej. 14500" 
                  className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              {/* Fecha Desde */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Válido Desde (Fecha Desde) *</label>
                <input 
                  type="date" required 
                  className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500"
                />
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
                Guardar Valor Cuota
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
