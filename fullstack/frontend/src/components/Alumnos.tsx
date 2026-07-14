import { useState } from 'react'

export default function Alumnos() {
  // Un único estado simple para abrir/cerrar el formulario de registro
  const [modalOpen, setModalOpen] = useState(false)

  // Datos estáticos (hardcodeados) de ejemplo para la tabla de alumnos
  const alumnosEjemplo = [
    { dni: '43.123.456', 
      apellido: 'González', 
      nombre: 'Lucía', 
      telefono: '2216789012', 
      email: 'lucia.gonzalez@email.com', 
      nivel: 'B1', 
      ingreso: '15/03/2024' },
    
    { dni: '41.901.234', 
      apellido: 'Ramírez', 
      nombre: 'Tomás', 
      telefono: '2215432109', 
      email: 'tomas.ramirez@email.com', 
      nivel: 'A2', 
      ingreso: '10/04/2024' },

    { dni: '44.567.890', 
      apellido: 'Fernández', 
      nombre: 'Valentina', 
      telefono: '2219876543', 
      email: 'valen.f@email.com', 
      nivel: 'A1', 
      ingreso: '02/06/2025' },

    { dni: '42.234.567', 
      apellido: 'López', 
      nombre: 'Mateo', 
      telefono: '2213456789', 
      email: 'mateo.lopez@email.com', 
      nivel: 'B2', 
      ingreso: '20/11/2023' },

    { dni: '40.876.543', 
      apellido: 'Perez', 
      nombre: 'Antonella', 
      telefono: '2216549870', 
      email: 'anto.perez@email.com', 
      nivel: 'A2', 
      ingreso: '05/02/2024' }
  ]

  return (
    <div className="space-y-6">
      
      {/* Cabecera de la sección */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Alumnos</h1>
          <p className="text-xs text-slate-500 mt-1">Administración de alumnos del instituto.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Registrar Alumno
        </button>
      </div>

      {/* Buscador y filtros rápidos (Estático) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por DNI, apellido o nombre..." 
            className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded text-xs outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="border border-slate-200 rounded p-2 text-xs bg-white outline-none w-full md:w-36">
            <option value="">Todos los niveles</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
          </select>
        </div>
      </div>

      {/* Tabla de Alumnos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div className="text-xs font-semibold text-slate-700">Listado General</div>
          <span className="text-2xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
            Total: {alumnosEjemplo.length}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alumno</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">DNI</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teléfono</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nivel Actual</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fecha Ingreso</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alumnosEjemplo.map((alumno) => (
                <tr key={alumno.dni} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-xs font-semibold text-slate-800">{alumno.apellido}, {alumno.nombre}</td>
                  <td className="p-3 text-xs font-mono text-slate-400">{alumno.dni}</td>
                  <td className="p-3 text-xs text-slate-600">{alumno.telefono}</td>
                  <td className="p-3 text-xs text-slate-600">{alumno.email}</td>
                  <td className="p-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-indigo-50 text-indigo-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{alumno.nivel}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-400">{alumno.ingreso}</td>
                  <td className="p-3 text-xs flex gap-2">
                    <button className="text-indigo-600 hover:text-indigo-800 font-semibold text-2xs">Editar</button>
                    <span className="text-slate-300">|</span>
                    <button className="text-rose-600 hover:text-rose-800 font-semibold text-2xs">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
           MODAL: REGISTRAR ALUMNO
           ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header del Modal */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-semibold text-slate-800">👤 Registrar Nuevo Alumno</h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Formulario (Cuerpo Scrolleable) */}
            <form className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Sección Datos Personales */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Datos Personales</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Apellido *</label>
                    <input 
                      type="text" required placeholder="Ej. González" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Nombre *</label>
                    <input 
                      type="text" required placeholder="Ej. Lucía" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">DNI *</label>
                    <input 
                      type="text" required maxLength={8} placeholder="Ej. 40123456" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Fecha de Nacimiento</label>
                    <input 
                      type="date" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Contacto */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Contacto</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Teléfono *</label>
                    <input 
                      type="tel" required placeholder="Ej. 2216789012" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Email</label>
                    <input 
                      type="email" placeholder="Ej. nombre@email.com" 
                      className="border border-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Académica inicial */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Académico</div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Nivel de Ingreso (Opcional)</label>
                  <select 
                    className="border border-slate-200 rounded p-2 text-xs bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="">Sin nivel previo (Requiere diagnóstico)</option>
                    <option value="A1">A1 — Principiante</option>
                    <option value="A2">A2 — Elemental</option>
                    <option value="B1">B1 — Intermedio</option>
                    <option value="B2">B2 — Intermedio Alto</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1">Si no se selecciona un nivel, se registrará al alumno como "Pendiente de Evaluación".</span>
                </div>
              </div>

            </form>

            {/* Footer del Modal */}
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
                Guardar Alumno
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
