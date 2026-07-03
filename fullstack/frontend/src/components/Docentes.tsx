import { useState } from 'react'

export default function Docentes() {
  // Estado para abrir/cerrar el modal de nuevo profesor
  const [modalOpen, setModalOpen] = useState(false)

  // Datos de ejemplo para el listado de docentes
  const docentesEjemplo = [
    { dni: '32.123.456', apellido: 'Smith', nombre: 'John', telefono: '2219998877', email: 'john.smith@instituto.com', especialidad: 'First Certificate (FCE)', ingreso: '01/03/2020', estado: 'Activo' },
    { dni: '35.901.234', apellido: 'Pérez', nombre: 'María Laura', telefono: '2214443322', email: 'laura.perez@instituto.com', especialidad: 'Kids & Teens', ingreso: '15/02/2021', estado: 'Activo' },
    { dni: '30.567.890', apellido: 'Taylor', nombre: 'Robert', telefono: '2215556677', email: 'robert.taylor@instituto.com', especialidad: 'Business English / Cae', ingreso: '01/08/2018', estado: 'Licencia' },
    { dni: '34.234.567', apellido: 'Díaz', nombre: 'Florencia', telefono: '2217778899', email: 'florencia.diaz@instituto.com', especialidad: 'Preparación Exámenes', ingreso: '10/03/2022', estado: 'Activo' }
  ]

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Docentes</h1>
          <p className="text-xs text-slate-500 mt-1">Administración del cuerpo docente del instituto.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Registrar Docente
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar docente por nombre o DNI..." 
            className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded text-xs outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="border border-slate-200 rounded p-2 text-xs bg-white outline-none w-full md:w-36">
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Licencia">En Licencia</option>
          </select>
        </div>
      </div>

      {/* Tabla de Docentes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div className="text-xs font-semibold text-slate-700">Cuerpo Docente</div>
          <span className="text-2xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
            Total: {docentesEjemplo.length}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Docente</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">DNI</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teléfono</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Especialidad</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fecha Ingreso</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estado</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docentesEjemplo.map((docente) => (
                <tr key={docente.dni} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-xs font-semibold text-slate-800">{docente.apellido}, {docente.nombre}</td>
                  <td className="p-3 text-xs font-mono text-slate-400">{docente.dni}</td>
                  <td className="p-3 text-xs text-slate-600">{docente.telefono}</td>
                  <td className="p-3 text-xs text-slate-600">{docente.email}</td>
                  <td className="p-3 text-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-medium">
                      {docente.especialidad}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-400">{docente.ingreso}</td>
                  <td className="p-3 text-xs">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold ${
                      docente.estado === 'Activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        docente.estado === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}></span>
                      {docente.estado}
                    </span>
                  </td>
                  <td className="p-3 text-xs flex gap-2">
                    <button className="text-indigo-600 hover:text-indigo-800 font-semibold text-2xs">Editar</button>
                    <span className="text-slate-300">|</span>
                    <button className="text-rose-600 hover:text-rose-800 font-semibold text-2xs">Dar de Baja</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
           MODAL: REGISTRAR DOCENTE
           ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-semibold text-slate-800">👨‍🏫 Registrar Nuevo Docente</h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Formulario (Scrollable) */}
            <form className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Sección Datos Personales */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Datos Personales</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Apellido *</label>
                    <input 
                      type="text" required placeholder="Smith" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Nombre *</label>
                    <input 
                      type="text" required placeholder="John" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">DNI *</label>
                    <input 
                      type="text" required maxLength={8} placeholder="30123456" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Título / Especialidad *</label>
                    <input 
                      type="text" required placeholder="Ej. Traductor Público / FCE" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Datos de Contacto */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Contacto</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Teléfono *</label>
                    <input 
                      type="tel" required placeholder="2219998877" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Email *</label>
                    <input 
                      type="email" required placeholder="john.smith@instituto.com" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
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
                Guardar Docente
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
