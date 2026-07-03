import type { Inscripcion } from './Inscripciones'

interface DashboardProps {
  inscripciones: Inscripcion[]
  setActiveTab: (tab: 'dashboard' | 'inscripciones' | 'alumnos' | 'docentes' | 'cursos' | 'valorCuota' | 'configuracion' | 'comisiones' | 'pagos') => void
}

export default function Dashboard({ inscripciones, setActiveTab }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Panel de Control</h1>
          <p className="text-xs text-slate-500 mt-1">Resumen general del instituto de inglés.</p>
        </div>
        <button 
          onClick={() => setActiveTab('inscripciones')} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          Ir a Inscripciones →
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-indigo-50 flex items-center justify-center text-lg">👥</div>
          <div>
            <div className="text-xl font-bold text-slate-900">{143 + inscripciones.length}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Alumnos activos</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-cyan-50 flex items-center justify-center text-lg">📝</div>
          <div>
            <div className="text-xl font-bold text-slate-900">{inscripciones.length}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Inscripciones</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-emerald-50 flex items-center justify-center text-lg">🏫</div>
          <div>
            <div className="text-xl font-bold text-slate-900">11</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Comisiones activas</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-amber-50 flex items-center justify-center text-lg">⚠️</div>
          <div>
            <div className="text-xl font-bold text-slate-900">8</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Alumnos Morosos</div>
          </div>
        </div>
      </div>

      {/* Últimas Inscripciones */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Últimas Inscripciones</h3>
            <p className="text-[11px] text-slate-400">Listado de los alumnos registrados recientemente</p>
          </div>
          <button onClick={() => setActiveTab('inscripciones')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Ver todas →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alumno</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Comisión</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nivel</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fecha</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inscripciones.slice(0, 5).map((i) => (
                <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-xs font-semibold text-slate-800">{i.apellido}, {i.nombre}</td>
                  <td className="p-3 text-xs text-slate-600">{i.comision}</td>
                  <td className="p-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-indigo-50 text-indigo-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{i.nivel}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-400">{i.fecha}</td>
                  <td className="p-3 text-xs">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold ${
                      i.estado === 'Activa' ? 'bg-emerald-50 text-emerald-700' :
                      i.estado === 'Pendiente' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        i.estado === 'Activa' ? 'bg-emerald-500' :
                        i.estado === 'Pendiente' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></span>
                      {i.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
