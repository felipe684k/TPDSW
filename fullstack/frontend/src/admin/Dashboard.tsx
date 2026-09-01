import { useEffect, useState } from 'react'
import type { Enrollment } from './Enrollments'
import { studentService } from '../services/student.service'
import { paymentService } from '../services/payment.service'
import { API_BASE_URL } from '../config'

interface DashboardProps {
  enrollments?: Enrollment[]
  setActiveTab: (tab: 'dashboard' | 'enrollments' | 'students' | 'professors' | 'courses' | 'sections' | 'payments' | 'classrooms' | 'academic-years') => void
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const [studentsCount, setStudentsCount] = useState<number>(0)
  const [enrollmentsList, setEnrollmentsList] = useState<any[]>([])
  const [sectionsCount, setSectionsCount] = useState<number>(0)
  const [debtorsCount, setDebtorsCount] = useState<number>(0)

  useEffect(() => {
    studentService.getStudents().then(data => setStudentsCount(data.length)).catch(() => setStudentsCount(0))
    
    fetch(`${API_BASE_URL}/enrollments`)
      .then(res => res.json())
      .then(json => setEnrollmentsList(json.data || []))
      .catch(() => setEnrollmentsList([]))
      
    fetch(`${API_BASE_URL}/sections`)
      .then(res => res.json())
      .then(json => setSectionsCount(json.data?.length || 0))
      .catch(() => setSectionsCount(0))
      
    paymentService.getDebtors()
      .then(data => setDebtorsCount(data.length))
      .catch(() => setDebtorsCount(0))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Panel</h1>
          <p className="text-xs text-slate-500 mt-1">Resumen general del instituto de inglés.</p>
        </div>
        <button 
          onClick={() => setActiveTab('enrollments')} 
          className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          Ir a Inscripciones →
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1c1d24] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-indigo-950/30 flex items-center justify-center text-lg">👥</div>
          <div>
            <div className="text-xl font-bold text-slate-100">{studentsCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Alumnos activos</div>
          </div>
        </div>
        <div className="bg-[#1c1d24] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-cyan-950/30 flex items-center justify-center text-lg">📝</div>
          <div>
            <div className="text-xl font-bold text-slate-100">{enrollmentsList.length}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Inscripciones</div>
          </div>
        </div>
        <div className="bg-[#1c1d24] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-emerald-950/30 flex items-center justify-center text-lg">🏫</div>
          <div>
            <div className="text-xl font-bold text-slate-100">{sectionsCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Comisiones activas</div>
          </div>
        </div>
        <div className="bg-[#1c1d24] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-amber-950/30 flex items-center justify-center text-lg">⚠️</div>
          <div>
            <div className="text-xl font-bold text-slate-100">{debtorsCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Deudores / Impagos</div>
          </div>
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Inscripciones Recientes</h3>
            <p className="text-[11px] text-slate-400">Lista de alumnos inscriptos recientemente</p>
          </div>
          <button onClick={() => setActiveTab('enrollments')} className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-400 font-medium">Ver todo →</button>
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
              {enrollmentsList.length === 0 ? (
                 <tr><td colSpan={5} className="p-4 text-center text-slate-500 text-xs">No hay inscripciones para mostrar</td></tr>
              ) : (
                enrollmentsList.slice(0, 5).map((i) => (
                  <tr key={i.id} className="hover:bg-[#17181e] transition-colors">
                    <td className="p-3 text-xs font-semibold text-slate-200">{i.last_name}, {i.first_name}</td>
                    <td className="p-3 text-xs text-slate-400">{i.section}</td>
                    <td className="p-3 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-indigo-950/30 text-indigo-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{i.level}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-400">{i.date}</td>
                    <td className="p-3 text-xs">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold ${
                        i.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                        i.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-950/30 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          i.status === 'Active' ? 'bg-emerald-500' :
                          i.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-950/300'
                        }`}></span>
                        {i.status === 'Active' ? 'Activo' : i.status === 'Pending' ? 'Pendiente' : i.status === 'Overdue' ? 'Vencido' : i.status}
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
