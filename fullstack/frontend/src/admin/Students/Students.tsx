import { useState, useEffect } from 'react'
import { studentService, type Student } from '../../biz/services/student.service'
import { paymentService, type Debtor } from '../../biz/services/payment.service'
import { academicYearService, type AcademicYear } from '../../biz/services/academicYear.service'
import ConfirmDeleteModal from '../../shared/ConfirmDeleteModal'
import StudentFormModal from './StudentFormModal'
import PaymentModal from './PaymentModal'
import EnrollModal from './EnrollModal'
import DataTable from '../../shared/components/DataTable'
import Modal from '../../shared/components/Modal'
import { theme } from '../../shared/theme'

export default function Students() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [isFromBackend, setIsFromBackend] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [editingId, setEditingId] = useState<number | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null)
  const [paymentStudentId, setPaymentStudentId] = useState<number | null>(null)
  const [enrollStudentId, setEnrollStudentId] = useState<number | null>(null)

  const [debtorsModalOpen, setDebtorsModalOpen] = useState(false)
  const [debtorsList, setDebtorsList] = useState<Debtor[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [selectedDebtYear, setSelectedDebtYear] = useState<string>('all')

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string, type: 'success' | 'danger' } | null>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dni: '',
    phone: '',
    email: '',
    level_code: '',
    birth_date: ''
  })

  const fetchStudents = async () => {
    try {
      const data = await studentService.getStudents()
      setStudents(data)
      setIsFromBackend(true)
      setLoadFailed(false)
    } catch (error) {
      console.error("Error loading students", error)
      setLoadFailed(true)
    }
  }

  const fetchDebtors = async (yearFilter: string = selectedDebtYear) => {
    try {
      const idYear = yearFilter === 'all' ? undefined : Number(yearFilter)
      const data = await paymentService.getDebtors(idYear)
      setDebtorsList(data || [])
    } catch (error) {
      console.error("Error loading debtors", error)
    }
  }

  useEffect(() => {
    fetchStudents()
    academicYearService.getAcademicYears().then(setAcademicYears).catch(() => setAcademicYears([]))
    fetchDebtors('all')
  }, [])

  const filteredStudents = students.filter(student => {
    return (student.first_name + " " + student.last_name + " " + student.dni).toLowerCase().includes(searchQuery.toLowerCase());
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (!editingId && formData.dni.length >= 7) {
      studentService.checkDni(formData.dni).then((data) => {
        if (data && !data.active) {
          setFormData(prev => ({
            ...prev,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || '',
            email: data.email || '',
            birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
            level_code: data.level_code ? String(data.level_code) : prev.level_code
          }));
        }
      }).catch(console.error);
    }
  }, [formData.dni, editingId]);

  const handleOpenModalCreate = () => {
    setEditingId(null)
    setFormData({ first_name: '', last_name: '', dni: '', phone: '', email: '', level_code: '', birth_date: '' })
    setIsModalOpen(true)
    setErrorMsg(null)
    setToast(null)
  }

  const handleEdit = (student: Student) => {
    if (!student.id) return;
    setEditingId(student.id)
    setFormData({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      dni: student.dni || '',
      phone: student.phone || '',
      email: student.email || '',
      level_code: student.level_code !== undefined && student.level_code !== null ? String(student.level_code) : '',
      birth_date: student.birth_date ? student.birth_date.split('T')[0] : ''
    })
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (editingId) {
        await studentService.updateStudent(editingId, {
          dni: formData.dni,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          email: formData.email,
          birth_date: formData.birth_date,
          level_code: formData.level_code
        })
      } else {
        await studentService.createStudent(formData)
      }

      setIsModalOpen(false)
      setFormData({ first_name: '', last_name: '', dni: '', phone: '', email: '', level_code: '', birth_date: '' })

      setToast({ text: editingId ? "Alumno actualizado exitosamente" : "Alumno registrado exitosamente", type: 'success' })
      setTimeout(() => setToast(null), 3000)

      setEditingId(null)
      fetchStudents()

    } catch (error) {
      console.error("Error saving student", error)
      setErrorMsg(error instanceof Error ? error.message : "No se pudo guardar el alumno. Intente nuevamente.")
    }
  }

  const handleDelete = async () => {
    if (studentToDelete) {
      try {
        await studentService.deleteStudent(studentToDelete)
        setToast({ text: "Alumno desactivado exitosamente", type: 'danger' })
        setTimeout(() => setToast(null), 3000)
        fetchStudents()
        setStudentToDelete(null)
      } catch (error) {
        console.error("Error deleting student", error)
      }
    }
  }

  const columns = [
    {
      header: 'Alumno',
      render: (s: Student) => <span className="font-semibold text-slate-700">{s.last_name}, {s.first_name}</span>,
    },
    {
      header: 'DNI',
      render: (s: Student) => <span className="font-mono text-slate-500">{s.dni}</span>,
    },
    {
      header: 'Nivel',
      render: (s: Student) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          s.level_code ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.level_code ? 'bg-indigo-500' : 'bg-slate-400'}`}></span>
          {s.current_level && s.current_level !== 'No Level Assigned' ? s.current_level : 'Sin nivel asignado'}
        </span>
      ),
    },
    {
      header: 'Teléfono',
      render: (s: Student) => <span className="text-slate-500">{s.phone || 'N/A'}</span>,
    },
    {
      header: 'Email',
      render: (s: Student) => <span className="text-slate-500">{s.email || 'N/A'}</span>,
    },
    {
      header: 'Acciones',
      render: (s: Student) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setPaymentStudentId(s.id!)}
            className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs cursor-pointer"
          >
            💰 Pagar
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setEnrollStudentId(s.id!)}
            className="text-blue-600 hover:text-blue-700 font-semibold text-xs cursor-pointer"
          >
            📝 Inscribir
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => handleEdit(s)}
            className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs cursor-pointer"
          >
            Editar
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setStudentToDelete(s.id!)}
            className="text-rose-500 hover:text-rose-700 font-semibold text-xs cursor-pointer"
          >
            Desactivar
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Alumnos</h1>
          <p className="text-xs text-slate-500 mt-1">Administración de los alumnos del instituto.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              fetchDebtors(selectedDebtYear)
              setDebtorsModalOpen(true)
            }}
            className="px-3.5 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>⚠️ Reporte de Deudores</span>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
              {debtorsList.length}
            </span>
          </button>
          <button
            onClick={handleOpenModalCreate}
            className={theme.button.primary}
          >
            + Registrar Alumno
          </button>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white border px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${toast.type === 'success'
          ? 'border-emerald-500/50 text-emerald-600 shadow-emerald-900/20'
          : 'border-rose-500/50 text-rose-600 shadow-rose-900/20'
          }`}>
          <span className="text-lg">{toast.type === 'success' ? '✅' : '🗑️'}</span>
          <span className="font-medium text-sm tracking-wide">{toast.text}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Buscar por DNI, apellido o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded text-xs bg-white text-slate-700 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <DataTable
        title="Lista General"
        columns={columns}
        data={filteredStudents}
        totalCount={filteredStudents.length}
        emptyMessage={loadFailed ? 'No se pudieron cargar los alumnos.' : isFromBackend ? 'Ningún alumno registrado coincide con la búsqueda.' : 'Cargando alumnos...'}
      />

      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        onChange={handleInputChange}
        errorMessage={errorMsg}
        editingId={editingId}
      />

      <ConfirmDeleteModal
        isOpen={studentToDelete != null}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDelete}
        itemName={(() => { const s = students.find(st => st.id === studentToDelete); return s ? `${s.first_name} ${s.last_name}` : undefined; })()}
        message={(() => { const s = students.find(st => st.id === studentToDelete); return s ? `Esta acción desactivará al alumno ${s.last_name}, ${s.first_name} (DNI ${s.dni}) del sistema. ¿Estás seguro de que deseas continuar?` : "Esta acción desactivará al alumno del sistema. ¿Estás seguro de que deseas continuar?"; })()}
      />

      <PaymentModal
        isOpen={paymentStudentId != null}
        onClose={() => {
          setPaymentStudentId(null)
          fetchDebtors(selectedDebtYear)
        }}
        studentId={paymentStudentId}
      />

      <Modal
        isOpen={debtorsModalOpen}
        onClose={() => setDebtorsModalOpen(false)}
        title="⚠️ Reporte de Alumnos con Deuda"
        maxWidth="max-w-4xl"
        footer={
          <button
            type="button"
            onClick={() => setDebtorsModalOpen(false)}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded text-xs font-medium cursor-pointer"
          >
            Cerrar
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-600">
              Total de alumnos con deuda vencida:{' '}
              <span className="font-bold text-rose-600">{debtorsList.length}</span> · Monto total adeudado:{' '}
              <span className="font-bold text-rose-600">
                ${debtorsList.reduce((acc, d) => acc + Number(d.totalDebt || 0), 0).toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Ciclo Lectivo:</label>
              <select
                value={selectedDebtYear}
                onChange={(e) => {
                  setSelectedDebtYear(e.target.value)
                  fetchDebtors(e.target.value)
                }}
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

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="p-3 font-semibold">Alumno</th>
                  <th className="p-3 font-semibold">DNI</th>
                  <th className="p-3 font-semibold">Comisión</th>
                  <th className="p-3 font-semibold">Ciclo</th>
                  <th className="p-3 font-semibold">Cuotas Vencidas</th>
                  <th className="p-3 font-semibold">Deuda Total</th>
                  <th className="p-3 font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {debtorsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-5 text-center text-emerald-600 font-medium">
                      ✅ No hay alumnos con deuda vencida para el ciclo seleccionado.
                    </td>
                  </tr>
                ) : (
                  debtorsList.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">{d.fullName}</td>
                      <td className="p-3 font-mono text-slate-500">{d.dni}</td>
                      <td className="p-3 text-slate-600">{d.course}</td>
                      <td className="p-3 text-slate-500">{d.academic_year || '-'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          {d.unpaidInstallments} {d.unpaidInstallments === 1 ? 'cuota' : 'cuotas'}
                        </span>
                        {d.unpaid_months && (
                          <span className="block text-[10px] text-slate-400 mt-0.5">{d.unpaid_months}</span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-rose-600">
                        ${Number(d.totalDebt).toLocaleString('es-AR')}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => {
                            setDebtorsModalOpen(false)
                            setPaymentStudentId(d.id)
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold cursor-pointer"
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
      </Modal>

      <EnrollModal
        isOpen={enrollStudentId != null}
        onClose={() => setEnrollStudentId(null)}
        studentId={enrollStudentId}
        student={students.find(s => s.id === enrollStudentId) || null}
        onSuccess={() => {
          setEnrollStudentId(null)
          setToast({ text: "Inscripción registrada exitosamente", type: 'success' })
          setTimeout(() => setToast(null), 3000)
        }}
      />
    </div>
  )
}
