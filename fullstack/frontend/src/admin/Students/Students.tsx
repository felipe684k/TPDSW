import { useState, useEffect } from 'react'
import { studentService, type Student } from '../../services/student.service'
import ConfirmDeleteModal from '../../shared/ConfirmDeleteModal'
import StudentFormModal from './StudentFormModal'
import DataTable from '../../shared/components/DataTable'

export default function Students() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [isFromBackend, setIsFromBackend] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [editingId, setEditingId] = useState<number | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null) 
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toast, setToast] = useState<{text: string, type: 'success' | 'danger'} | null>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dni: '',
    phone: '',
    email: '',
    level_code: '',
    birth_date: ''
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const data = await studentService.getStudents()
      setStudents(data)
      setIsFromBackend(true)
    } catch (error) {
      console.error("Error loading students", error)
    }
  }

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
            email: data.email ? data.email.split('_deleted_')[0] : '',
            birth_date: data.birth_date ? data.birth_date.split('T')[0] : ''
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
      level_code: (student as any).level_code || '',
      birth_date: student.birth_date ? student.birth_date.split('T')[0] : ''
    })
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
          birth_date: formData.birth_date
        })
      } else {
        const newStudent = {
          ...formData,
          username: formData.first_name,
          password: formData.dni
        }
        await studentService.createStudent(newStudent as any)
      }

      setIsModalOpen(false)
      setFormData({ first_name: '', last_name: '', dni: '', phone: '', email: '', level_code: '', birth_date: '' })
      
      setToast({ text: editingId ? "Alumno actualizado exitosamente" : "Alumno registrado exitosamente", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      
      setEditingId(null)
      fetchStudents()
      
    } catch (error) {
      console.error("Error saving student", error)
      setErrorMsg("No se pudo guardar el alumno. Por favor verifique que el DNI y/o Email no estén duplicados o intente nuevamente.")
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
      render: (s: Student) => <span className="font-semibold text-slate-200">{s.last_name}, {s.first_name}</span>,
    },
    {
      header: 'DNI',
      render: (s: Student) => <span className="font-mono text-slate-400">{s.dni}</span>,
    },
    {
      header: 'Teléfono',
      render: (s: Student) => <span className="text-slate-400">{s.phone || 'N/A'}</span>,
    },
    {
      header: 'Email',
      render: (s: Student) => <span className="text-slate-400">{s.email || 'N/A'}</span>,
    },
    {
      header: 'Acciones',
      render: (s: Student) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(s)}
            className="text-indigo-400 hover:text-indigo-300 font-semibold text-2xs cursor-pointer"
          >
            Editar
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setStudentToDelete(s.id!)}
            className="text-rose-500 hover:text-rose-400 font-semibold text-2xs cursor-pointer"
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
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Alumnos</h1>
          <p className="text-xs text-slate-500 mt-1">Administración de los alumnos del instituto.</p>
        </div>

        <button
          onClick={handleOpenModalCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all cursor-pointer"
        >
          ➕ Registrar Alumno
        </button>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 bg-[#1c1d24] border px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          toast.type === 'success' 
            ? 'border-emerald-500/50 text-emerald-400 shadow-emerald-900/20' 
            : 'border-rose-500/50 text-rose-400 shadow-rose-900/20'
        }`}>
          <span className="text-lg">{toast.type === 'success' ? '✅' : '🗑️'}</span>
          <span className="font-medium text-sm tracking-wide">{toast.text}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-[#1c1d24] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Buscar por DNI, apellido o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-slate-800 rounded text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <DataTable 
        title="Lista General"
        columns={columns}
        data={filteredStudents}
        totalCount={filteredStudents.length}
        emptyMessage={isFromBackend ? 'Ningún alumno registrado coincide con la búsqueda.' : 'Cargando alumnos...'}
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
        message="Esta acción desactivará al alumno del sistema. ¿Estás seguro de que deseas continuar?"
      />
    </div>
  )
}
