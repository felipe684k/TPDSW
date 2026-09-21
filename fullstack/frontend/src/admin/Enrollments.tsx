import DataTable from '../shared/components/DataTable'

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

export default function Enrollments({ enrollments, setEnrollments }: EnrollmentsProps) {
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
          <p className="text-xs text-slate-500 mt-1">Lista general de todos los alumnos inscriptos en el instituto.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-xs flex gap-2.5">
        <span className="text-sm">ℹ️</span>
        <div>Para inscribir a un nuevo alumno, ve a la pestaña <strong>Alumnos</strong> y haz click en "📝 Inscribir" junto a su nombre.</div>
      </div>

      <DataTable 
        title="Lista de Inscripciones"
        columns={columns}
        data={enrollments}
        totalCount={enrollments.length}
      />
    </div>
  )
}
