import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config'
import { paymentService, type Installment } from '../services/payment.service'

interface Student {
  id: number
  fullName: string
  dni: string
  course?: string
  tuitionAmount?: number
  admissionMonthIndex?: number
}

export default function Payments() {
  const [studentsList, setStudentsList] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [installments, setInstallments] = useState<Installment[]>([])
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null)
  const [hasEnrollment, setHasEnrollment] = useState<boolean>(true)
  
  const [paymentModal, setPaymentModal] = useState<Installment | null>(null)
  const [receiptModal, setReceiptModal] = useState<Installment | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [surcharge, setSurcharge] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    fetchStudents()
  }, [])

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
      { id: 1, fullName: 'González, Lucía', Dni: '40.123.456', course: 'Kids 1 - A', tuitionAmount: 12000, admissionMonthIndex: 0 } as any,
      { id: 2, fullName: 'Ramírez, Tomás', Dni: '38.901.234', course: 'Teens 3 - Noche', tuitionAmount: 14500, admissionMonthIndex: 5 } as any
    ])
  }

  const loadAccountStatus = async (id: number) => {
    setLoading(true)
    try {
      const data = await paymentService.getStudentAccountStatus(id)
      const enrolls = data.enrollments || []
      if (enrolls.length > 0) {
        setHasEnrollment(true)
        setEnrollmentId(enrolls[0].id_enrollment)
        setInstallments(data.installments || [])
      } else {
        setHasEnrollment(false)
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
        return {
          id: idx + 1,
          id_enrollment: id,
          section: student.course || 'Section',
          installment_month: m.name,
          amount: student.tuitionAmount || 12000,
          due_date: `10/${m.monthNum.toString().padStart(2, '0')}/${currentYear}`,
          status: idx === 0 ? 'Paid' : 'Pending',
          payment_date: idx === 0 ? `05/${m.monthNum.toString().padStart(2, '0')}/${currentYear}` : null,
          surcharge: 0,
          discount: 0,
          paymentMethod: idx === 0 ? 'Cash' : undefined
        }
      })
      setInstallments(mockInstallments)
    }
    setLoading(false)
  }

  const handleSelectStudent = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value)
    if (!id) {
      setSelectedStudent(null)
      setInstallments([])
      setEnrollmentId(null)
      setHasEnrollment(true)
      return
    }
    setSelectedStudent(id)
    loadAccountStatus(id)
  }

  const handleOpenPaymentModal = (installment: Installment) => {
    setPaymentModal(installment)
    setPaymentMethod('')
    setSurcharge(0)
    setDiscount(0)
  }

  const handleVerRecibo = (installment: Installment) => {
    setReceiptModal(installment)
  }

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentModal) return
    if (!paymentMethod) {
      alert('Por favor selecciona un método de pago')
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
      amount: Number(paymentModal.amount),
      surcharge: Number(surcharge),
      discount: Number(discount),
      status: 'Paid',
      payment_date: todayDate
    }

    try {
      await paymentService.registerPayment(payload)
      if (selectedStudent) {
        await loadAccountStatus(selectedStudent)
      }
    } catch (err) {
      console.warn('Error al registrar el pago:', err)
      const msg = err instanceof Error ? err.message : 'Ocurrió un error de conexión al procesar el pago.'
      alert(msg)
    }

    setPaymentModal(null)
  }

  const currentStudent = studentsList.find(a => a.id === selectedStudent)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Cobro de Cuotas</h1>
          <p className="text-xs text-slate-500 mt-1">Gestión de pagos mensuales para el Ciclo Lectivo 2026.</p>
        </div>
      </div>

      {/* Student Selector */}
      <div className="bg-[#1c1d24] p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col gap-3">
        <label className="text-xs font-semibold text-slate-300">Buscar Alumno Inscripto</label>
        <select 
          onChange={handleSelectStudent}
          className="border border-slate-800 rounded-lg p-3 text-sm bg-[#17181e] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all max-w-md"
        >
          <option value="">— Seleccionar Alumno —</option>
          {studentsList.map(a => (
            <option key={a.id} value={a.id}>{a.fullName} (DNI: {a.dni}) - {a.course}</option>
          ))}
        </select>
      </div>

      {/* Warning if no enrollment */}
      {selectedStudent && !hasEnrollment && !loading && (
        <div className="bg-amber-950/40 border border-amber-800/60 text-amber-300 p-4 rounded-xl text-xs flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <strong>El alumno no tiene una inscripción activa en comisiones.</strong>
            <p className="text-[11px] text-amber-400/80 mt-0.5">Para cobrar cuotas, el alumno debe ser inscripto previamente en el módulo de <em>Inscripciones</em>.</p>
          </div>
        </div>
      )}

      {/* Installments Panel */}
      {selectedStudent && hasEnrollment && (
        <div className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 border-b border-slate-800 bg-[#17181e] flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Estado de Cuenta - {currentStudent?.fullName}</h2>
              <div className="flex gap-2 items-center mt-1">
                <p className="text-xs text-slate-500">Ciclo Lectivo 2026 (Marzo - Diciembre)</p>
                <span className="text-[10px] font-semibold bg-indigo-950/40 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-800/40">
                  {installments.length} Cuotas Devengadas
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Deuda Vencida a la Fecha</span>
              <span className="text-lg font-bold text-rose-500">
                ${installments.filter(c => c.status === 'Pending').reduce((acc, c) => acc + c.amount, 0).toLocaleString('en-US')}
              </span>
            </div>
          </div>
          
          <div className="p-5">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">Cargando estado de cuenta...</div>
            ) : installments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No hay cuotas devengadas registradas para este alumno.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {installments.map((installment) => (
                  <div key={installment.id} className={`p-4 rounded-xl border ${installment.status === 'Paid' ? 'border-emerald-800/40 bg-emerald-950/10' : 'border-slate-800 bg-[#1c1d24]'} shadow-sm flex flex-col justify-between space-y-4`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{installment.installment_month} 2026</span>
                        <span className="block text-[10px] text-slate-500">Vencimiento: {installment.due_date}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        installment.status === 'Paid' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50' : 'bg-amber-900/40 text-amber-400 border border-amber-700/50'
                      }`}>
                        {installment.status === 'Paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#17181e]/50 p-2 rounded border border-slate-800/60">
                      <div>
                        <span className="text-slate-400 block">Cuota Base</span>
                        <span className="font-semibold text-slate-300">${installment.amount.toLocaleString('en-US')}</span>
                      </div>
                      {installment.status === 'Paid' && (
                        <>
                          <div>
                            <span className="text-slate-400 block">Fecha de Pago</span>
                            <span className="font-semibold text-slate-300">{installment.payment_date || 'Saldado'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Recargo</span>
                            <span className="font-semibold text-rose-400">+${installment.surcharge}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Descuento</span>
                            <span className="font-semibold text-emerald-400">-${installment.discount}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-between items-end pt-2 border-t border-slate-800/60">
                      <div>
                        <span className="block text-[10px] text-slate-500">Total</span>
                        <span className="text-lg font-bold text-slate-100">${(installment.amount + installment.surcharge - installment.discount).toLocaleString('en-US')}</span>
                      </div>
                      
                      {installment.status === 'Pending' ? (
                        <button 
                          onClick={() => handleOpenPaymentModal(installment)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-medium shadow-sm transition-colors cursor-pointer"
                        >
                          Cobrar
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleVerRecibo(installment)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                        >
                          📄 Ver Recibo
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TUITION PAYMENT MODAL */}
      {paymentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-sm border border-slate-800">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-200">Registrar Pago de Cuota</h2>
              <button onClick={() => setPaymentModal(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            
            <form onSubmit={handleProcessPayment} className="p-5 space-y-4">
              <div className="bg-[#17181e] border border-slate-800/60 rounded-lg p-3 text-center mb-2">
                <span className="block text-xs text-slate-500 uppercase tracking-wider">Cuota de {paymentModal.installment_month} 2026</span>
                <span className="text-2xl font-bold text-slate-100">${(paymentModal.amount + surcharge - discount).toLocaleString('en-US')}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Recargo ($)</label>
                  <input 
                    type="number" min="0" value={surcharge} onChange={e => setSurcharge(Number(e.target.value))}
                    className="border border-slate-700 rounded p-2 text-sm bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Descuento ($)</label>
                  <input 
                    type="number" min="0" value={discount} onChange={e => setDiscount(Number(e.target.value))}
                    className="border border-slate-700 rounded p-2 text-sm bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Método de Pago *</label>
                <select 
                  required value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                  className="border border-slate-700 rounded p-2.5 text-sm bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="">— Seleccionar —</option>
                  <option value="Cash">Efectivo</option>
                  <option value="Bank Transfer">Transferencia Bancaria</option>
                  <option value="Debit/Credit Card">Tarjeta de Débito/Crédito</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-2">
                <button 
                  type="button" onClick={() => setPaymentModal(null)}
                  className="flex-1 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium shadow-sm transition-colors cursor-pointer"
                >
                  Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT RECEIPT MODAL */}
      {receiptModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-[#1c1d24] border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden print:p-0 print:border-none print:shadow-none">
            {/* Receipt Header */}
            <div className="p-5 bg-[#17181e] border-b border-slate-800 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏛️</span>
                  <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Instituto de Idiomas</h2>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Recibo Oficial de Pago</p>
              </div>
              <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-800/50">
                PAGADO ✅
              </span>
            </div>

            {/* Receipt Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="flex justify-between items-center bg-[#17181e]/60 p-3 rounded-lg border border-slate-800/60">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block font-semibold">Nº Recibo</span>
                  <span className="font-mono font-bold text-indigo-400">#REC-2026-{receiptModal.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] uppercase block font-semibold">Fecha de Emisión</span>
                  <span className="font-semibold text-slate-300">{receiptModal.payment_date || new Date().toLocaleDateString('en-US')}</span>
                </div>
              </div>

              {/* Student and Course Detail */}
              <div className="space-y-2 border-b border-slate-800/80 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Alumno:</span>
                  <span className="font-semibold text-slate-200">{currentStudent?.fullName || 'Alumno Registrado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DNI:</span>
                  <span className="font-mono text-slate-300">{currentStudent?.dni || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Comisión / Curso:</span>
                  <span className="font-semibold text-indigo-300">{receiptModal.section || currentStudent?.course || 'Curso de Idioma'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Concepto Abonado:</span>
                  <span className="font-medium text-slate-200">Cuota {receiptModal.installment_month} 2026</span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cuota Base:</span>
                  <span className="text-slate-300">${receiptModal.amount.toLocaleString('en-US')}</span>
                </div>
                {receiptModal.surcharge > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Recargo por Mora:</span>
                    <span>+${receiptModal.surcharge.toLocaleString('en-US')}</span>
                  </div>
                )}
                {receiptModal.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Descuento Aplicado:</span>
                    <span>-${receiptModal.discount.toLocaleString('en-US')}</span>
                  </div>
                )}
                {receiptModal.paymentMethod && (
                  <div className="flex justify-between text-slate-400">
                    <span>Método de Pago:</span>
                    <span className="capitalize text-slate-300">
                      {receiptModal.paymentMethod === 'Cash' ? 'Efectivo' : 
                       receiptModal.paymentMethod === 'Bank Transfer' ? 'Transferencia Bancaria' : 
                       receiptModal.paymentMethod === 'Debit/Credit Card' ? 'Tarjeta de Débito/Crédito' : 
                       receiptModal.paymentMethod}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm font-bold pt-3 border-t border-slate-800 text-slate-100">
                  <span>Total Abonado:</span>
                  <span className="text-emerald-400 text-base">
                    ${(receiptModal.amount + receiptModal.surcharge - receiptModal.discount).toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-[#17181e] border-t border-slate-800 flex justify-end gap-2 print:hidden">
              <button 
                type="button" 
                onClick={() => setReceiptModal(null)}
                className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-slate-800 text-slate-400 rounded text-xs font-medium transition-colors cursor-pointer"
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
  )
}
