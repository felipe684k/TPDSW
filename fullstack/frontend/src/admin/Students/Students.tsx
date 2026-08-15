import { useState, useEffect } from 'react'
import { studentService, type Student as Student } from '../../services/student.service'
import ConfirmDeleteModal from '../../shared/ConfirmDeleteModal'
import StudentFormModal from './StudentFormModal'

export default function Students() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [isFromBackend, setIsFromBackend] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // ESTADO: Si editingDni es string estamos Editando, si es null estamos Creando
  const [editingDni, setEditingDni] = useState<string | null>(null)

  // Estado: si studentToDelete es string se abre la ventana, si es null no se abre
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null) 
  
  // Estado: 
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Estados para el formulario (vinculados a los inputs)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    nivel: '',
    fecha_nacimiento: ''
  })

  // Cargar alumnos apenas se abre la pantalla
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const datos = await studentService.getStudents()
      setStudents(datos)
      setIsFromBackend(true)
    } catch (error) {
      console.error("Error al cargar alumnos", error)
    }
  }

  // Filtrado de búsqueda rápido en la tabla
  const filteredStudents = students.filter(a => {
    return (a.nombre + " " + a.apellido + " " + a.dni).toLowerCase().includes(searchQuery.toLowerCase());
  })

  // Función genérica para guardar lo que se tipea en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // NUEVA FUNCIÓN: Abrir modal para CREAR (resetea el formulario)
  const handleOpenModalCreate = () => {
    setEditingDni(null)
    setFormData({ nombre: '', apellido: '', dni: '', telefono: '', email: '', nivel: '', fecha_nacimiento: '' })
    setIsModalOpen(true)
    setErrorMsg(null) // 
  }

  // NUEVA FUNCIÓN: Abrir modal para EDITAR (carga los datos del alumno seleccionado)
  const handleEdit = (student: Student) => {
    setEditingDni(student.dni)
    setFormData({
      nombre: student.nombre || '',
      apellido: student.apellido || '',
      dni: student.dni || '',
      telefono: student.telefono || '',
      email: student.email || '',
      nivel: (student as any).nivel_actual || '',
      fecha_nacimiento: student.fecha_nacimiento ? student.fecha_nacimiento.split('T')[0] : ''
    })
    setIsModalOpen(true)
  }

  // Función que envía los datos al backend (crea o actualiza según editingDni)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página parpadee o se recargue
    setErrorMsg(null); // Borramos errores viejos
    
    try {
      if (editingDni) {
        await studentService.updateStudent(editingDni, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          email: formData.email,
          fecha_nacimiento: formData.fecha_nacimiento
        })
      } else {
        const newStudent = {
          ...formData,
          usuario: formData.nombre,
          contrasena: formData.dni
        }
        await studentService.createStudent(newStudent as any)
      }

      setIsModalOpen(false)
      setFormData({ nombre: '', apellido: '', dni: '', telefono: '', email: '', nivel: '', fecha_nacimiento: '' })
      setEditingDni(null)
      fetchStudents()
      
    } catch (error) {
      console.error("Error al guardar alumno", error)
      // En vez de alert(), guardamos el error en nuestra variable
      setErrorMsg("No se pudo guardar el alumno. Verifique que el DNI y/o Email no esté repetido o intente nuevamente.")
    }
  }

  // Función para borrar (Baja Lógica)
  const handleDelete = async () => {
    if (studentToDelete) {
      try {
        await studentService.deleteStudent(studentToDelete)
        fetchStudents() // Recargamos lista al borrar
        setStudentToDelete(null)
      } catch (error) {
        console.error("Error al eliminar", error)
      }
    }
  }

  return (
    <div className="space-y-6">

      {/* Cabecera de la sección */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Alumnos</h1>
          <p className="text-xs text-slate-500 mt-1">Administración de alumnos del instituto.</p>
        </div>

        <button
          onClick={handleOpenModalCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Registrar Alumno
        </button>
      </div>

      {/* Buscador y filtros rápidos */}
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

      {/* Tabla de Alumnos */}
      <div className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Listado General</span>
            {isFromBackend && (
              <span className="text-[10px] bg-emerald-900/50 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full font-medium">
                📡 Conectado a Backend
              </span>
            )}
          </div>
          <span className="text-2xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-mono">
            Total: {filteredStudents.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#17181e] border-b border-slate-800">
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alumno</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">DNI</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teléfono</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-slate-400">
                    {isFromBackend ? 'No hay alumnos registrados que coincidan con la búsqueda.' : 'Cargando alumnos...'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.dni} className="hover:bg-[#17181e] transition-colors">
                    <td className="p-3 text-xs font-semibold text-slate-200">{student.apellido}, {student.nombre}</td>
                    <td className="p-3 text-xs font-mono text-slate-400">{student.dni}</td>
                    <td className="p-3 text-xs text-slate-400">{student.telefono || 'N/A'}</td>
                    <td className="p-3 text-xs text-slate-400">{student.email || 'N/A'}</td>
                    <td className="p-3 text-xs flex gap-2">
                      <button 
                        onClick={() => handleEdit(student)}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold text-2xs cursor-pointer"
                      >
                        Editar
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => setStudentToDelete(student.dni)}
                        className="text-rose-500 hover:text-rose-400 font-semibold text-2xs cursor-pointer">Eliminar</button>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      <StudentFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        onChange={handleInputChange}
        errorMessage={errorMsg}
        editingDni={editingDni}
      />

      <ConfirmDeleteModal
        isOpen={studentToDelete != null}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDelete}
        message='Esta acción dará de baja al alumno del sistema. ¿Estás seguro de continuar?'
      />
    </div>
  )
}
