import { useState } from 'react'
import DataTable from '../shared/components/DataTable'
import Modal from '../shared/components/Modal'
import FormSelect from '../shared/components/FormSelect'

export interface Enrollment {
  id: number
  last_name: string
  first_name: string
  dni: string
  section: string
  level: string
  date: string
  status: string
  final_grade?: string
  attendance_percentage?: string
}

interface EnrollmentsProps {
  enrollments: Enrollment[]
  setEnrollments: React.Dispatch<React.SetStateAction<Enrollment[]>>
}

const getUniqueId = () => Date.now();

export default function Enrollments({ enrollments, setEnrollments }: EnrollmentsProps) {
  const [modalOpen, setModalOpen] = useState(false)
  
  const cerrarModal = () => setModalOpen(false)

  const [formStudent, setFormStudent] = useState('')
  const [formSection, setFormSection] = useState('')
  const [formPayment, setFormPayment] = useState('')

  const availableStudents = [
    { id: 1, 
      fullName: 'González, Lucía', 
      dni: '40.123.456' },

    { id: 2, 
      fullName: 'Ramírez, Tomás', 
      dni: '38.901.234' },

    { id: 3, 
      fullName: 'Fernández, Valentina', 
      dni: '42.567.890' }
  ]

  const availableSections = [
    { id: 1, 
      name: 'Kids 1 - A', 
      registration_fee: 8000 },
    { id: 2, 
      name: 'Teens 3 - Noche', 
      registration_fee: 10000 },
    { id: 3, 
      name: 'First Certificate Prep', 
      registration_fee: 15000 }
  ]

  const selectedSection = availableSections.find(s => s.id.toString() === formSection)
  const basePrice = selectedSection ? selectedSection.registration_fee : 0
  const registrationFeeAmount = formPayment === 'cash' ? basePrice * 0.9 : basePrice

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formStudent || !formSection || !formPayment) {
      alert('Por favor selecciona un alumno, una comisión y un método de pago para la matrícula.')
      return
    }

    const student = availableStudents.find(a => a.id.toString() === formStudent)

    const newEnrollment: Enrollment = {
      id: getUniqueId(),
      last_name: student?.fullName.split(',')[0] || '',
      first_name: student?.fullName.split(',')[1].trim() || '',
      dni: student?.dni || '',
      section: selectedSection?.name || '',
      level: '-', 
      date: new Date().toLocaleDateString('en-US'),
      status: 'Active', 
      final_grade: '-',
      attendance_percentage: '0%'
    }

    setEnrollments([newEnrollment, ...enrollments])
    setModalOpen(false)
    
    setFormStudent('')
    setFormSection('')
    setFormPayment('')
  }

  const handleDelete = (id: number) => {
    if (confirm('¿Cancelar esta inscripción?')) {
      setEnrollments(enrollments.filter((i: Enrollment) => i.id !== id))
    }
  }

  const columns = [
    {
      header: 'Alumno',
      render: (i: Enrollment) => <span className="font-semibold text-slate-200">{i.last_name}, {i.first_name}</span>,
    },
    {
      header: 'DNI',
      render: (i: Enrollment) => <span className="font-mono text-slate-400">{i.dni}</span>,
    },
    {
      header: 'Comisión',
      render: (i: Enrollment) => <span className="text-slate-400">{i.section}</span>,
    },
    {
      header: 'Nivel',
      render: (i: Enrollment) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-indigo-950/30 text-indigo-400">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{i.level}
        </span>
      ),
    },
    {
      header: 'Fecha',
      render: (i: Enrollment) => <span className="text-slate-400">{i.date}</span>,
    },
    {
      header: 'Asistencia',
      render: (i: Enrollment) => <span className="font-semibold text-slate-400">{i.attendance_percentage || '0%'}</span>,
    },
    {
      header: 'Nota Final',
      render: (i: Enrollment) => <span className="font-semibold text-slate-400">{i.final_grade || '-'}</span>,
    },
    {
      header: 'Estado',
      render: (i: Enrollment) => (
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
      ),
    },
    {
      header: 'Acciones',
      render: (i: Enrollment) => (
        <button 
          onClick={() => handleDelete(i.id)} 
          className="text-rose-500 hover:text-rose-400 hover:bg-rose-950/30 px-2 py-1 rounded text-2xs font-medium transition-colors cursor-pointer"
        >
          Desactivar
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Inscripciones</h1>
          <p className="text-xs text-slate-500 mt-1">Lista de alumnos inscritos en comisiones.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all">
          ➕ Nueva Inscripción
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-xs flex gap-2.5">
        <span className="text-sm">ℹ️</span>
        <div>Los alumnos sin nivel previo deben rendir una <strong>evaluación diagnóstica</strong> antes de ser asignados a una comisión.</div>
      </div>

      <DataTable 
        title="Lista de Inscripciones"
        columns={columns}
        data={enrollments}
        totalCount={enrollments.length}
      />

      <Modal
        isOpen={modalOpen}
        onClose={cerrarModal}
        title="📝 Registrar Inscripción"
        maxWidth="max-w-lg"
        footer={
          <>
            <button 
              type="button" onClick={cerrarModal}
              className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" form="enrollmentForm"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all cursor-pointer"
            >
              Confirmar Inscripción
            </button>
          </>
        }
      >
        <form id="enrollmentForm" onSubmit={handleConfirm} className="space-y-5">
          
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Selección de Alumno</div>
            <div className="flex flex-col gap-1">
              <FormSelect
                label="Alumno a inscribir *"
                required value={formStudent} onChange={e => setFormStudent(e.target.value)}
                options={[
                  { value: '', label: '— Seleccionar Alumno Registrado —' },
                  ...availableStudents.map(a => ({ value: a.id.toString(), label: `${a.fullName} (DNI: ${a.dni})` }))
                ]}
              />
              <span className="text-[10px] text-slate-400 mt-1">⚠️ El alumno ya debe haber sido creado en el módulo de "Alumnos".</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Selección de Comisión</div>
            <FormSelect
              label="Comisión *"
              required value={formSection} onChange={e => setFormSection(e.target.value)}
              options={[
                { value: '', label: '— Seleccionar Comisión —' },
                ...availableSections.map(s => ({ value: s.id.toString(), label: s.name }))
              ]}
            />
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Pago de Matrícula (Liquidación Inmediata)</div>
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Método de pago *"
                required value={formPayment} onChange={e => setFormPayment(e.target.value)}
                options={[
                  { value: '', label: '— Seleccionar —' },
                  { value: 'cash', label: 'Efectivo (-10%)' },
                  { value: 'transfer', label: 'Transferencia' },
                  { value: 'card', label: 'Tarjeta' }
                ]}
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Monto a pagar hoy</label>
                <input 
                  type="text" readOnly value={formPayment ? `$${registrationFeeAmount.toLocaleString('en-US')}` : ''}
                  placeholder="$0" className="border border-slate-800 bg-[#17181e] rounded p-2 text-xs outline-none font-bold text-slate-100"
                />
                {formPayment === 'cash' && (
                  <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">✅ Descuento por efectivo aplicado.</span>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
