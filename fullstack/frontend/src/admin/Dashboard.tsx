import { SIDEBAR_TABS } from '../shared/Sidebar.const'
import { useEffect, useState } from 'react'
import { studentService } from '../biz/services/student.service'
import { paymentService, type Debtor } from '../biz/services/payment.service'
import { enrollmentService } from '../biz/services/enrollment.service'
import { academicYearService, type AcademicYear } from '../biz/services/academicYear.service'
import { sectionService } from '../biz/services/section.service'
import PaymentModal from './Students/PaymentModal'
import { theme } from '../shared/theme'
import { formatDateAR } from '../biz/date'

interface DashboardProps {
  setActiveTab: (tab: import('../shared/Sidebar.const').SidebarTab) => void
}

const normalizeStatus = (s?: string) => {
  if (!s || s === 'Active' || s === 'Activo') return 'Activo';
  if (s === 'Pending' || s === 'Pendiente') return 'Pendiente';
  return 'Dado de Baja';
};

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const [studentsCount, setStudentsCount] = useState<number>(0)
  const [enrollmentsList, setEnrollmentsList] = useState<any[]>([])
  const [sectionsCount, setSectionsCount] = useState<number>(0)
  const [debtorsList, setDebtorsList] = useState<Debtor[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all')
  const [paymentStudentId, setPaymentStudentId] = useState<number | null>(null)

  const fetchDebtorsReport = (yearFilter: string = selectedAcademicYear) => {
    const idYear = yearFilter === 'all' ? undefined : Number(yearFilter)
    paymentService.getDebtors(idYear)
      .then(data => setDebtorsList(data || []))
      .catch(() => setDebtorsList([]))
  }

  useEffect(() => {
    studentService.getStudents().then(data => setStudentsCount(data.length)).catch(() => setStudentsCount(0))

    enrollmentService.getEnrollments()
      .then(data => setEnrollmentsList(data || []))
      .catch(() => setEnrollmentsList([]))

    sectionService.getSections()
      .then(data => setSectionsCount(data?.length || 0))
      .catch(() => setSectionsCount(0))

    academicYearService.getAcademicYears()
      .then(data => setAcademicYears(data || []))
      .catch(() => setAcademicYears([]))

    fetchDebtorsReport('all')
  }, [])

  const handleYearFilterChange = (val: string) => {
    setSelectedAcademicYear(val)
    fetchDebtorsReport(val)
  }

  const totalDebtAmount = debtorsList.reduce((acc, d) => acc + Number(d.totalDebt || 0), 0)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`text-xl font-bold tracking-tight ${theme.layout.pageHeader}`}>Panel</h1>
          <p className={`text-xs mt-1 ${theme.layout.pageSubheader}`}>Resumen general del instituto de inglés.</p>
        </div>
        <button
          onClick={() => setActiveTab(SIDEBAR_TABS.ENROLLMENTS)}
          className={theme.button.primary}
        >
          Ir a Inscripciones ➔
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${theme.card.wrapper} p-4 flex items-center gap-4`}>
          <div className="w-11 h-11 rounded bg-blue-100 flex items-center justify-center text-lg">👦</div>
          <div>
            <div className="text-xl font-bold text-slate-800">{studentsCount}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Alumnos activos</div>
          </div>
        </div>
        <div className={`${theme.card.wrapper} p-4 flex items-center gap-4`}>
          <div className="w-11 h-11 rounded bg-cyan-100 flex items-center justify-center text-lg">📝</div>
          <div>
            <div className="text-xl font-bold text-slate-800">{enrollmentsList.length}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Inscripciones</div>
          </div>
        </div>
        <div className={`${theme.card.wrapper} p-4 flex items-center gap-4`}>
          <div className="w-11 h-11 rounded bg-emerald-100 flex items-center justify-center text-lg">🏫</div>
          <div>
            <div className="text-xl font-bold text-slate-800">{sectionsCount}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Comisiones activas</div>
          </div>
        </div>
        <div
          onClick={() => document.getElementById('debtors-report-section')?.scrollIntoView({ behavior: 'smooth' })}
          className={`${theme.card.wrapper} p-4 flex items-center gap-4 cursor-pointer hover:border-rose-300 transition-colors`}
        >
          <div className="w-11 h-11 rounded bg-rose-100 flex items-center justify-center text-lg">⚠️</div>
          <div>
            <div className="text-xl font-bold text-slate-800">{debtorsList.length}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Deudores / Impagos</div>
          </div>
        </div>
      </div>

      {/* Reporte de Alumnos Deudores */}
      <div id="debtors-report-section" className={`${theme.card.wrapper} overflow-hidden`}>
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-semibold ${theme.card.header}`}>Reporte de Alumnos con Deuda</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {debtorsList.length} {debtorsList.length === 1 ? 'alumno' : 'alumnos'} · Total: ${totalDebtAmount.toLocaleString('es-AR')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Alumnos con matrícula o cuotas mensuales vencidas pendientes de pago.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="dashboardDebtorsYear" className="text-xs font-medium text-slate-600">
              Ciclo Lectivo:
            </label>
            <select
              id="dashboardDebtorsYear"
              value={selectedAcademicYear}
              onChange={(e) => handleYearFilterChange(e.target.value)}
              className="border border-slate-200 bg-white text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 font-medium cursor-pointer"
            >
              <option value="all">Todos los ciclos</option>
              {academicYears.map((ay) => (
                <option key={ay.id_academic_year} value={String(ay.id_academic_year)}>
                  {ay.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className={`p-3 text-[10px] uppercase font-bold ${theme.table.header} tracking-wider`}>Alumno</th>
                <th className={`p-3 text-[10px] uppercase font-bold ${theme.table.header} tracking-wider`}>DNI</th>
                <th className={`p-3 text-[10px] uppercase font-bold ${theme.table.header} tracking-wider`}>Comisión</th>
                <th className={`p-3 text-[10px] uppercase font-bold ${theme.table.header} tracking-wider`}>Ciclo</th>
                <th className={`p-3 text-[10px] uppercase font-bold ${theme.table.header} tracking-wider`}>Cuotas Vencidas</th>
                <th className={`p-3 text-[10px] uppercase font-bold ${theme.table.header} tracking-wider`}>Deuda Total</th>
                <th className={`p-3 text-[10px] uppercase font-bold ${theme.table.header} tracking-wider`}>Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {debtorsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-emerald-600 font-medium text-xs">
                    ✅ No se registran alumnos con deuda vencida para el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                debtorsList.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-xs font-semibold text-slate-800">{d.fullName}</td>
                    <td className="p-3 text-xs font-mono text-slate-500">{d.dni}</td>
                    <td className="p-3 text-xs text-slate-600">{d.course}</td>
                    <td className="p-3 text-xs text-slate-500">{d.academic_year || '-'}</td>
                    <td className="p-3 text-xs">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {d.unpaidInstallments} {d.unpaidInstallments === 1 ? 'cuota' : 'cuotas'}
                      </span>
                      {d.unpaid_months && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">{d.unpaid_months}</span>
                      )}
                    </td>
                    <td className="p-3 text-xs font-bold text-rose-600">
                      ${Number(d.totalDebt).toLocaleString('es-AR')}
                    </td>
                    <td className="p-3 text-xs">
                      <button
                        type="button"
                        onClick={() => setPaymentStudentId(d.id)}
                        className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        💰 Cobrar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className={`${theme.card.wrapper} overflow-hidden`}>
        <div className={`p-4 border-b border-slate-200 flex justify-between items-center`}>
          <div>
            <h3 className={`text-sm font-semibold ${theme.card.header}`}>Inscripciones Recientes</h3>
            <p className="text-[11px] text-slate-500">Lista de alumnos inscriptos recientemente</p>
          </div>
          <button onClick={() => setActiveTab(SIDEBAR_TABS.ENROLLMENTS)} className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-700 font-medium">Ver todo →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`bg-slate-50 border-b border-slate-200`}>
                <th className={`p-3 text-[10px] uppercase font-bold ${theme.table.header} tracking-wider`}>Alumno</th>
                <th className={`p-3 text-[10px] uppercase font-bold ${theme.table.header} tracking-wider`}>Comisión</th>
                <th className={`p-3 text-[10px] uppercase font-bold ${theme.table.header} tracking-wider`}>Nivel</th>
                <th className={`p-3 text-[10px] uppercase font-bold ${theme.table.header} tracking-wider`}>Fecha</th>
                <th className={`p-3 text-[10px] uppercase font-bold ${theme.table.header} tracking-wider`}>Estado</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-200`}>
              {enrollmentsList.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500 text-xs">No hay inscripciones para mostrar</td></tr>
              ) : (
                enrollmentsList.slice(0, 5).map((e) => {
                  const statusLabel = normalizeStatus(e.status);
                  return (
                    <tr key={e.id_enrollment} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-xs font-semibold text-slate-700">{e.user?.last_name}, {e.user?.first_name}</td>
                      <td className="p-3 text-xs text-slate-500">{e.section?.name}</td>
                      <td className="p-3 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{e.section?.course?.level?.name || '-'}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-500">{formatDateAR(e.enrollment_date)}</td>
                      <td className="p-3 text-xs">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          statusLabel === 'Activo' ? 'bg-emerald-50 text-emerald-700' :
                          statusLabel === 'Pendiente' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            statusLabel === 'Activo' ? 'bg-emerald-500' :
                            statusLabel === 'Pendiente' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></span>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentModal
        isOpen={paymentStudentId != null}
        onClose={() => {
          setPaymentStudentId(null)
          fetchDebtorsReport(selectedAcademicYear)
        }}
        studentId={paymentStudentId}
      />
    </div>
  )
}
