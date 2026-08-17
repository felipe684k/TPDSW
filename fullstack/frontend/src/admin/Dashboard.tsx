import { useEffect, useState } from 'react'
import type { Inscripcion } from './Inscripciones'
import { studentService } from '../services/student.service'
import { API_BASE_URL } from '../config'

interface DashboardProps {
  inscripciones?: Inscripcion[]
  setActiveTab: (tab: 'dashboard' | 'inscripciones' | 'alumnos' | 'docentes' | 'cursos' | 'valorCuota' | 'comisiones' | 'pagos' | 'aulas') => void
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const [alumnosCount, setAlumnosCount] = useState<number>(0)
  const [inscripcionesList, setInscripcionesList] = useState<any[]>([])
  const [comisionesCount, setComisionesCount] = useState<number>(0)
  const [morososCount, setMorososCount] = useState<number>(0)

  useEffect(() => {
    studentService.getStudents().then(data => setAlumnosCount(data.length)).catch(() => setAlumnosCount(0))
    
    fetch(`${API_BASE_URL}/inscripciones`)
      .then(res => res.json())
      .then(json => setInscripcionesList(json.data || []))
      .catch(() => setInscripcionesList([]))
      
    fetch(`${API_BASE_URL}/comisiones`)
      .then(res => res.json())
      .then(json => setComisionesCount(json.data?.length || 0))
      .catch(() => setComisionesCount(0))
      
    fetch(`${API_BASE_URL}/pagos/morosos`)
      .then(res => res.json())
      .then(json => setMorososCount(json.data?.length || 0))
      .catch(() => setMorososCount(0))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Panel de Control</h1>
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
        <div className="bg-[#1c1d24] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-indigo-950/30 flex items-center justify-center text-lg">👥</div>
          <div>
            <div className="text-xl font-bold text-slate-100">{alumnosCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Alumnos activos</div>
          </div>
        </div>
        <div className="bg-[#1c1d24] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-cyan-950/30 flex items-center justify-center text-lg">📝</div>
          <div>
            <div className="text-xl font-bold text-slate-100">{inscripcionesList.length}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Inscripciones</div>
          </div>
        </div>
        <div className="bg-[#1c1d24] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-emerald-950/30 flex items-center justify-center text-lg">🏫</div>
          <div>
            <div className="text-xl font-bold text-slate-100">{comisionesCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Comisiones activas</div>
          </div>
        </div>
        <div className="bg-[#1c1d24] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-amber-950/30 flex items-center justify-center text-lg">⚠️</div>
          <div>
            <div className="text-xl font-bold text-slate-100">{morososCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Alumnos Morosos</div>
          </div>
        </div>
      </div>

      {/* Últimas Inscripciones */}
      <div className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Últimas Inscripciones</h3>
            <p className="text-[11px] text-slate-400">Listado de los alumnos registrados recientemente</p>
          </div>
          <button onClick={() => setActiveTab('inscripciones')} className="text-xs text-indigo-400 hover:text-indigo-400 font-medium">Ver todas →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#17181e] border-b border-slate-800">
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alumno</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Comisión</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nivel</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fecha</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {inscripcionesList.length === 0 ? (
                 <tr><td colSpan={5} className="p-4 text-center text-slate-500 text-xs">No hay inscripciones para mostrar</td></tr>
              ) : (
                inscripcionesList.slice(0, 5).map((i) => (
                  <tr key={i.id} className="hover:bg-[#17181e] transition-colors">
                    <td className="p-3 text-xs font-semibold text-slate-200">{i.apellido}, {i.nombre}</td>
                    <td className="p-3 text-xs text-slate-400">{i.comision}</td>
                    <td className="p-3 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-indigo-950/30 text-indigo-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{i.nivel}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-400">{i.fecha}</td>
                    <td className="p-3 text-xs">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold ${
                        i.estado === 'Activa' ? 'bg-emerald-50 text-emerald-700' :
                        i.estado === 'Pendiente' ? 'bg-amber-50 text-amber-700' : 'bg-rose-950/30 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          i.estado === 'Activa' ? 'bg-emerald-500' :
                          i.estado === 'Pendiente' ? 'bg-amber-500' : 'bg-rose-950/300'
                        }`}></span>
                        {i.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
