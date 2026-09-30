import { useState, useEffect } from 'react'

import { API_BASE_URL } from '../../biz/config'
import { paymentService, type Installment } from '../../biz/services/payment.service'
import { academicYearService, type AcademicYear } from '../../biz/services/academicYear.service'

interface Student {
  id: number
  fullName: string
  dni: string
  course?: string
  tuitionAmount?: number
  admissionMonthIndex?: number
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number | null;
}

export default function PaymentModal({ isOpen, onClose, studentId }: PaymentModalProps) {
  const [studentsList, setStudentsList] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<number | null>(studentId)
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | ''>('')
  const [enrollmentsList, setEnrollmentsList] = useState<any[]>([])
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | ''>('')
  const [installments, setInstallments] = useState<Installment[]>([])
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null)
  const [hasEnrollment, setHasEnrollment] = useState<boolean>(true)
  
  const [paymentModal, setPaymentModal] = useState<Installment | null>(null)
  const [receiptModal, setReceiptModal] = useState<Installment | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [payAmount, setPayAmount] = useState<number | ''>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen) {
      fetchStudents()
      fetchAcademicYears()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && studentId) {
      setSelectedStudent(studentId)
      loadAccountStatus(studentId, selectedAcademicYearId)
    }
  }, [isOpen, studentId])

  const fetchAcademicYears = async () => {
    try {
      const data = await academicYearService.getAcademicYears()
      if (data && Array.isArray(data) && data.length > 0) {
        setAcademicYears(data)
        if (!selectedAcademicYearId) {
          const currentYear = new Date().getFullYear()
          const matched = data.find(ay => {
            const yr = new Date(ay.start_date).getFullYear()
            return yr === currentYear || ay.name.includes(currentYear.toString())
          })
          const defaultId = matched ? matched.id_academic_year! : data[data.length - 1].id_academic_year!
          setSelectedAcademicYearId(defaultId)
          if (studentId) {
            loadAccountStatus(studentId, defaultId)
          }
        }
      }
    } catch (e) {
      console.warn('Error loading academic years:', e)
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users?role=STUDENT`)
      if (res.ok) {
        const json = await res.json()
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: Student[] = json.data.map((u: any) => ({
            id: u.id,
            fullName: `${u.last_name || ''}, ${u.first_name || ''}`.trim(),
            dni: u.dni || '',
            course: u.current_level || 'General Course',
            tuitionAmount: 12000,
            admissionMonthIndex: 0
          }))
          setStudentsList(mapped)
          return
        }
      }
    } catch (e) {
      console.warn('Error loading students from backend, using fallback:', e)
    }

    setStudentsList([
      { id: 1, fullName: 'González, Lucía', dni: '40.123.456', course: 'Kids 1 - A', tuitionAmount: 12000, admissionMonthIndex: 0 } as any,
      { id: 2, fullName: 'Ramírez, Tomás', dni: '38.901.234', course: 'Teens 3 - Noche', tuitionAmount: 14500, admissionMonthIndex: 5 } as any
    ])
  }

  const loadAccountStatus = async (id: number, academicYearId?: number | '') => {
    setLoading(true)
    try {
      const ayParam = academicYearId !== undefined 
        ? (academicYearId === '' ? undefined : Number(academicYearId)) 
        : (selectedAcademicYearId === '' ? undefined : Number(selectedAcademicYearId))
      const data = await paymentService.getStudentAccountStatus(id, ayParam)
      const enrolls = data.enrollments || []
      setEnrollmentsList(enrolls)
      if (enrolls.length > 0) {
        setHasEnrollment(true)
        setSelectedEnrollmentId(prev => {
          const exists = enrolls.some((e: any) => e.id_enrollment === prev)
          return exists ? prev : enrolls[0].id_enrollment
        })
        setEnrollmentId(enrolls[0].id_enrollment)
        setInstallments(data.installments || [])
      } else {
        setHasEnrollment(false)
        setSelectedEnrollmentId('')
        setEnrollmentId(null)
        setInstallments([])
      }
      setLoading(false)
      return
    } catch (e) {
      console.warn('Error loading installments from backend:', e)
    }

    const student = studentsList.find(a => a.id === id)
    if (student) {
      setHasEnrollment(true)
      const academicMonths = [
        { name: 'March', monthNum: 3 },
        { name: 'April', monthNum: 4 },
        { name: 'May', monthNum: 5 },
        { name: 'June', monthNum: 6 },
        { name: 'July', monthNum: 7 },
        { name: 'August', monthNum: 8 },
        { name: 'September', monthNum: 9 },
        { name: 'October', monthNum: 10 },
        { name: 'November', monthNum: 11 },
        { name: 'December', monthNum: 12 }
      ]

      const now = new Date()
      const currentMonthNum = now.getMonth() + 1
      const currentYear = now.getFullYear()

      const monthsToDate = academicMonths.filter(m => m.monthNum <= currentMonthNum)

      const mockInstallments: Installment[] = monthsToDate.map((m, idx) => {
        const base = student.tuitionAmount || 12000
        const isPaid = idx === 0
        return {
          id: idx + 1,
          id_enrollment: id,
          section: student.course || 'Section',
          course_name: student.course || 'Curso General',
          installment_month: m.name,
          amount: base,
          total_paid: isPaid ? base : 0,
          remaining_amount: isPaid ? 0 : base,
          due_date: `10/${m.monthNum.toString().padStart(2, '0')}/${currentYear}`,
          status: isPaid ? 'Paid' : 'Pending',
          payment_date: isPaid ? `05/${m.monthNum.toString().padStart(2, '0')}/${currentYear}` : null,
          payment_method: isPaid ? 'Cash' : undefined,
          year: currentYear
        }
      })
      setInstallments(mockInstallments)
    }
    setLoading(false)
  }

  const handleAcademicYearChange = (id: number | '') => {
    setSelectedAcademicYearId(id)
    if (selectedStudent) {
      loadAccountStatus(selectedStudent, id)
    }
  }

  useEffect(() => {
    const mainContainer = document.querySelector('main > div.overflow-y-auto')
    if (isOpen) {
      mainContainer?.classList.add('!overflow-hidden')
    } else {
      mainContainer?.classList.remove('!overflow-hidden')
    }
    return () => {
      mainContainer?.classList.remove('!overflow-hidden')
    }
  }, [isOpen])

  const handleOpenPaymentModal = (installment: Installment) => {
    setPaymentModal(installment)
    setPaymentMethod('Cash')
    const remaining = installment.remaining_amount !== undefined ? installment.remaining_amount : installment.amount
    setPayAmount(remaining)
  }

  const handleVerRecibo = (installment: Installment) => {
    setReceiptModal(installment)
  }

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentModal) return
    if (!paymentMethod) {
      alert('Por favor seleccioná un método de pago.')
      return
    }

    const numAmount = Number(payAmount)
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor ingresá un monto válido mayor a 0.')
      return
    }

    const remaining = paymentModal.remaining_amount !== undefined ? paymentModal.remaining_amount : paymentModal.amount
    if (numAmount > remaining) {
      alert(`El monto ingresado ($${numAmount}) supera el saldo pendiente de la cuota ($${remaining}).`)
      return
    }

    const targetEnrollmentId = typeof paymentModal.id_enrollment === 'number' ? paymentModal.id_enrollment : enrollmentId

    if (!targetEnrollmentId) {
      alert('Este alumno no tiene una inscripción activa. Debe estar inscripto en una comisión para registrar un pago.')
      return
    }

    const todayDate = new Date().toISOString().split('T')[0]

    const payload = {
      id_enrollment: targetEnrollmentId,
      installment_month: paymentModal.installment_month,
      amount: numAmount,
      payment_method: paymentMethod,
      payment_date: todayDate
    }

    try {
      await paymentService.registerPayment(payload)
      if (selectedStudent) {
        await loadAccountStatus(selectedStudent, selectedAcademicYearId)
      }
    } catch (err) {
      console.warn('Error al registrar el pago:', err)
      const msg = err instanceof Error ? err.message : 'Ocurrió un error al procesar el pago.'
      alert(msg)
    }

    setPaymentModal(null)
  }

  const currentStudent = studentsList.find(a => a.id === selectedStudent)
  const currentAcademicYear = academicYears.find(ay => ay.id_academic_year === selectedAcademicYearId)
  const currentEnrollment = enrollmentsList.find((e: any) => e.id_enrollment === selectedEnrollmentId)
  
  // Filter installments by selected course/enrollment
  const visibleInstallments = selectedEnrollmentId
    ? installments.filter(inst => inst.id_enrollment === selectedEnrollmentId)
    : installments

  const visibleDebt = visibleInstallments
    .reduce((acc, c) => acc + (c.remaining_amount !== undefined ? c.remaining_amount : (c.status === 'Paid' ? 0 : c.amount)), 0)

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex justify-end">
      <div className="bg-white w-full max-w-3xl h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
        
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Estado de Cuenta</h1>
            <p className="text-xs text-slate-500 mt-0.5">Gestión y control de pagos de cuotas por curso y alumno.</p>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:bg-slate-100 bg-white border border-slate-200 p-2 shadow-sm text-sm font-medium rounded-lg cursor-pointer">
            Cerrar
          </button>
        </div>

        {/* Selector de Ciclo Lectivo y Curso */}
        <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl mb-5 space-y-3 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Ciclo Lectivo */}
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <span>📅</span> Ciclo Lectivo:
              </label>
              <select
                value={selectedAcademicYearId}
                onChange={e => handleAcademicYearChange(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="">-- Todos los Ciclos Lectivos --</option>
                {academicYears.map(ay => (
                  <option key={ay.id_academic_year} value={ay.id_academic_year}>
                    {ay.name} ({new Date(ay.start_date).getFullYear()})
                  </option>
                ))}
              </select>
            </div>

            {/* Curso / Comisión */}
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <span>📚</span> Curso a Consultar / Cobrar:
              </label>
              <select
                disabled={enrollmentsList.length === 0}
                value={selectedEnrollmentId}
                onChange={e => setSelectedEnrollmentId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
              >
                {enrollmentsList.length > 1 && (
                  <option value="">-- Ver Todos los Cursos ({enrollmentsList.length}) --</option>
                )}
                {enrollmentsList.map((enr: any) => (
                  <option key={enr.id_enrollment} value={enr.id_enrollment}>
                    {enr.section?.course?.course_name || 'Curso'} ({enr.section?.name || 'Comisión'})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {enrollmentsList.length > 1 && (
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 overflow-x-auto text-[11px]">
              <span className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap">Cursos del alumno:</span>
              <button
                type="button"
                onClick={() => setSelectedEnrollmentId('')}
                className={`px-2.5 py-1 rounded-full font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                  selectedEnrollmentId === ''
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Todos los cursos
              </button>
              {enrollmentsList.map((enr: any) => (
                <button
                  type="button"
                  key={enr.id_enrollment}
                  onClick={() => setSelectedEnrollmentId(enr.id_enrollment)}
                  className={`px-2.5 py-1 rounded-full font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                    selectedEnrollmentId === enr.id_enrollment
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {enr.section?.course?.course_name || 'Curso'}
                </button>
              ))}
            </div>
          )}
        </div>

      {/* Warning if no enrollment */}
      {selectedStudent && !hasEnrollment && !loading && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3 mb-5">
          <span className="text-lg">⚠️</span>
          <div>
            <strong className="font-bold">No se registran inscripciones para este Ciclo Lectivo {currentAcademicYear ? `(${currentAcademicYear.name})` : ''}.</strong>
            <p className="text-[11px] text-amber-700 mt-1">El alumno no cursó o aún no fue inscripto a comisiones en este período. Podés seleccionar otro ciclo arriba o inscribirlo desde el módulo de <em>Inscripciones</em>.</p>
          </div>
        </div>
      )}

      {/* Installments Panel */}
      {selectedStudent && hasEnrollment && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-700">Estado de Cuenta - {currentStudent?.fullName}</h2>
              <div className="flex flex-wrap gap-2 items-center mt-1">
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {currentEnrollment ? `${currentEnrollment.section?.course?.course_name || 'Curso'} (${currentEnrollment.section?.name || 'Comisión'})` : 'Todos los Cursos'}
                </span>
                <p className="text-xs text-slate-500">
                  {currentAcademicYear ? currentAcademicYear.name : 'Ciclo Lectivo'}
                </p>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  {visibleInstallments.length} Cuotas
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Deuda Pendiente</span>
              <span className="text-lg font-bold text-rose-500">
                ${visibleDebt.toLocaleString('en-US')}
              </span>
            </div>
          </div>
          
          <div className="p-5">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-500">Cargando estado de cuenta...</div>
            ) : visibleInstallments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No hay cuotas devengadas registradas para el curso seleccionado.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleInstallments.map((installment) => {
                  const remAmount = installment.remaining_amount !== undefined 
                    ? installment.remaining_amount 
                    : (installment.status === 'Paid' ? 0 : installment.amount);
                  const isPaid = installment.status === 'Paid';
                  const isPartial = installment.status === 'Partial';

                  return (
                    <div 
                      key={installment.id} 
                      className={`p-4 rounded-xl border ${
                        isPaid 
                          ? 'border-emerald-800/40 bg-emerald-950/10' 
                          : isPartial 
                          ? 'border-blue-700/40 bg-blue-950/10' 
                          : 'border-slate-200 bg-white'
                      } shadow-sm flex flex-col justify-between space-y-3`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            {installment.installment_month} {installment.year || ''}
                          </span>
                          <span className="block text-[11px] font-semibold text-indigo-600 truncate max-w-[170px]" title={installment.course_name ? `${installment.course_name} (${installment.section})` : installment.section}>
                            {installment.course_name ? `${installment.course_name}` : installment.section}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            Vencimiento: {installment.due_date}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isPaid 
                            ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50' 
                            : isPartial 
                            ? 'bg-blue-900/40 text-blue-400 border border-blue-700/50' 
                            : 'bg-amber-900/40 text-amber-400 border border-amber-700/50'
                        }`}>
                          {isPaid ? 'Saldado' : isPartial ? 'Pago Parcial' : 'Pendiente'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50/50 p-2 rounded border border-slate-200/60">
                        <div>
                          <span className="text-slate-500 block">Cuota Base</span>
                          <span className="font-semibold text-slate-700">${installment.amount.toLocaleString('en-US')}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Abonado</span>
                          <span className="font-semibold text-emerald-600">${(installment.total_paid || (isPaid ? installment.amount : 0)).toLocaleString('en-US')}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Restante</span>
                          <span className={`font-semibold ${remAmount > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                            ${remAmount.toLocaleString('en-US')}
                          </span>
                        </div>
                      </div>

                      {installment.payments && installment.payments.length > 0 && (
                        <div className="text-[10px] bg-slate-100/80 p-2 rounded border border-slate-200/60 space-y-1">
                          <span className="font-semibold text-slate-600 block">Pagos realizados ({installment.payments.length}):</span>
                          {installment.payments.map((p, pIdx) => (
                            <div key={p.id || pIdx} className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-500">{p.payment_date || 'Fecha N/D'}</span>
                              <span className="font-medium text-emerald-700">+${Number(p.amount).toLocaleString('en-US')}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-end pt-2 border-t border-slate-200/60 gap-2">
                        <div>
                          <span className="block text-[10px] text-slate-500">Saldo a Cobrar</span>
                          <span className="text-base font-bold text-slate-800">${remAmount.toLocaleString('en-US')}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {!isPaid && (
                            <button 
                              onClick={() => handleOpenPaymentModal(installment)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-medium shadow-sm transition-colors cursor-pointer"
                            >
                              {isPartial ? 'Abonar Saldo' : 'Cobrar'}
                            </button>
                          )}
                          {(isPaid || isPartial) && (
                            <button 
                              onClick={() => handleVerRecibo(installment)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                            >
                              Ver Recibo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TUITION PAYMENT MODAL */}
      {paymentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-700">Registrar Pago de Cuota</h2>
              <button onClick={() => setPaymentModal(null)} className="text-slate-500 hover:text-slate-700 text-xs">✕</button>
            </div>
            
            <form onSubmit={handleProcessPayment} className="p-5 space-y-4">
              <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 text-center mb-2">
                <span className="block text-xs text-slate-500 uppercase tracking-wider">
                  Cuota de {paymentModal.installment_month} {paymentModal.year || ''}
                </span>
                <span className="text-xs font-bold text-indigo-700 block mt-0.5">
                  {paymentModal.course_name ? `${paymentModal.course_name} · ${paymentModal.section}` : paymentModal.section}
                </span>
                <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total</span>
                    <span className="font-semibold text-slate-700">${paymentModal.amount.toLocaleString('en-US')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Abonado</span>
                    <span className="font-semibold text-emerald-600">${(paymentModal.total_paid || 0).toLocaleString('en-US')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pendiente</span>
                    <span className="font-bold text-rose-500">${(paymentModal.remaining_amount ?? paymentModal.amount).toLocaleString('en-US')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Amount Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700">Monto a Cobrar ($) *</label>
                  <button
                    type="button"
                    onClick={() => setPayAmount(paymentModal.remaining_amount ?? paymentModal.amount)}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
                  >
                    Saldo completo
                  </button>
                </div>
                <input 
                  type="number"
                  required
                  min="1"
                  max={paymentModal.remaining_amount ?? paymentModal.amount}
                  value={payAmount} 
                  onChange={e => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="border border-slate-300 rounded p-2.5 text-base font-bold bg-white text-slate-800 outline-none focus:border-indigo-500"
                  placeholder="Ej: 5000"
                />
                <p className="text-[10px] text-slate-500">
                  Podés cobrar una fracción de la cuota o el total pendiente (${(paymentModal.remaining_amount ?? paymentModal.amount).toLocaleString('en-US')}).
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Método de Pago *</label>
                <select 
                  required value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                  className="border border-slate-300 rounded p-2.5 text-xs bg-white text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="Cash">Efectivo</option>
                  <option value="Bank Transfer">Transferencia Bancaria</option>
                  <option value="Debit/Credit Card">Tarjeta de Débito/Crédito</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-2">
                <button 
                  type="button" onClick={() => setPaymentModal(null)}
                  className="flex-1 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Confirmar Cobro {payAmount ? `($${Number(payAmount).toLocaleString('en-US')})` : ''}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT RECEIPT MODAL */}
      {receiptModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden print:p-0 print:border-none print:shadow-none">
            {/* Receipt Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Instituto de Idiomas</h2>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Recibo Oficial de Pago</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded border ${
                receiptModal.status === 'Paid' 
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50' 
                  : 'bg-blue-950/80 text-blue-400 border-blue-800/50'
              }`}>
                {receiptModal.status === 'Paid' ? 'SALDADO' : 'PAGO PARCIAL'}
              </span>
            </div>

            {/* Receipt Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="flex justify-between items-center bg-slate-50/60 p-3 rounded-lg border border-slate-200/60">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block font-semibold">N° Recibo</span>
                  <span className="font-mono font-bold text-indigo-500">#REC-{receiptModal.year || '2026'}-{receiptModal.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] uppercase block font-semibold">Fecha de Emisión</span>
                  <span className="font-semibold text-slate-600">{receiptModal.payment_date || new Date().toLocaleDateString('en-US')}</span>
                </div>
              </div>

              {/* Student and Course Detail */}
              <div className="space-y-2 border-b border-slate-200/80 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Alumno:</span>
                  <span className="font-semibold text-slate-700">{currentStudent?.fullName || 'Alumno Registrado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DNI:</span>
                  <span className="font-mono text-slate-600">{currentStudent?.dni || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Comisión / Curso:</span>
                  <span className="font-semibold text-indigo-600">{receiptModal.section || currentStudent?.course || 'Curso de Idioma'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Concepto:</span>
                  <span className="font-medium text-slate-700">
                    Cuota {receiptModal.installment_month} {receiptModal.year || ''} {receiptModal.academic_year_name ? `(${receiptModal.academic_year_name})` : ''}
                  </span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cuota Base:</span>
                  <span className="text-slate-600">${receiptModal.amount.toLocaleString('en-US')}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Total Abonado a la Fecha:</span>
                  <span className="font-semibold text-emerald-600">
                    ${(receiptModal.total_paid || (receiptModal.status === 'Paid' ? receiptModal.amount : 0)).toLocaleString('en-US')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Saldo Restante:</span>
                  <span className="font-semibold text-rose-500">
                    ${(receiptModal.remaining_amount !== undefined ? receiptModal.remaining_amount : (receiptModal.status === 'Paid' ? 0 : receiptModal.amount)).toLocaleString('en-US')}
                  </span>
                </div>

                {receiptModal.payments && receiptModal.payments.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Historial de Entregas:</span>
                    {receiptModal.payments.map((p, idx) => (
                      <div key={p.id || idx} className="flex justify-between text-[11px] bg-slate-50 p-1.5 rounded">
                        <span className="text-slate-600">
                          Entrega #{idx + 1} ({p.payment_date || 'Fecha'} - {p.payment_method === 'Cash' ? 'Efectivo' : p.payment_method === 'Bank Transfer' ? 'Transferencia' : 'Tarjeta'}):
                        </span>
                        <span className="font-semibold text-emerald-600">+${Number(p.amount).toLocaleString('en-US')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 print:hidden">
              <button 
                type="button" 
                onClick={() => setReceiptModal(null)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button 
                type="button" 
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                🖨️ Imprimir Recibo
              </button>
            </div>
          </div>
        </div>
      )}
            </div>
    </div>
  )
}
