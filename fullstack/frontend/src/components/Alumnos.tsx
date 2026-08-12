import { useState, useEffect } from 'react'
import { alumnoService, type Alumno } from '../services/alumno.service'

export default function Alumnos() {
  const [modalOpen, setModalOpen] = useState(false)
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [isFromBackend, setIsFromBackend] = useState(false)
  const [busqueda, setBusqueda] = useState("")

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
    cargarAlumnos()
  }, [])

  const cargarAlumnos = async () => {
    try {
      const datos = await alumnoService.getAlumnos()
      setAlumnos(datos)
      setIsFromBackend(true)
    } catch (error) {
      console.error("Error al cargar alumnos", error)
    }
  }

  // Filtrado de búsqueda rápido en la tabla
  const alumnosFiltrados = alumnos.filter(a => {
    return (a.nombre + " " + a.apellido + " " + a.dni).toLowerCase().includes(busqueda.toLowerCase());
  })

  // Función genérica para guardar lo que se tipea en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Función que envía los datos al backend cuando tocamos "Guardar Alumno"
  const handleSubmit = async () => {
    try {
      // Como el backend pide usuario y contraseña obligatoriamente para la tabla Usuario,
      // le pasamos el DNI por defecto en ambos campos (luego el sistema tendrá opción de cambiarlo)
      const nuevoAlumno = {
        ...formData,
        usuario: formData.dni,
        contrasena: formData.dni
      }

      await alumnoService.createAlumno(nuevoAlumno as any)

      // Cerramos la ventana y vaciamos el formulario
      setModalOpen(false)
      setFormData({ nombre: '', apellido: '', dni: '', telefono: '', email: '', nivel: '', fecha_nacimiento: '' })

      // Volvemos a cargar la lista para que aparezca el nuevo
      cargarAlumnos()
    } catch (error) {
      console.error("Error al guardar alumno", error)
      alert("Error al guardar el alumno")
    }
  }

  // Función para borrar
  const handleDelete = async (dni: string) => {
    if (confirm("¿Estás seguro de eliminar a este alumno?")) {
      try {
        await alumnoService.deleteAlumno(dni)
        cargarAlumnos() // Recargamos lista al borrar
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
          onClick={() => setModalOpen(true)}
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
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
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
            Total: {alumnosFiltrados.length}
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
              {alumnosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-slate-400">
                    {isFromBackend ? 'No hay alumnos registrados que coincidan con la búsqueda.' : 'Cargando alumnos...'}
                  </td>
                </tr>
              ) : (
                alumnosFiltrados.map((alumno) => (
                  <tr key={alumno.dni} className="hover:bg-[#17181e] transition-colors">
                    <td className="p-3 text-xs font-semibold text-slate-200">{alumno.apellido}, {alumno.nombre}</td>
                    <td className="p-3 text-xs font-mono text-slate-400">{alumno.dni}</td>
                    <td className="p-3 text-xs text-slate-400">{alumno.telefono || 'N/A'}</td>
                    <td className="p-3 text-xs text-slate-400">{alumno.email || 'N/A'}</td>
                    <td className="p-3 text-xs flex gap-2">
                      <button className="text-indigo-400 hover:text-indigo-300 font-semibold text-2xs">Editar</button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => handleDelete(alumno.dni)}
                        className="text-rose-500 hover:text-rose-400 font-semibold text-2xs">Eliminar</button>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTRAR ALUMNO */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-semibold text-slate-200">👤 Registrar Nuevo Alumno</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >✕</button>
            </div>

            <form className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Datos Personales</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Apellido *</label>
                    <input
                      name="apellido" value={formData.apellido} onChange={handleInputChange}
                      type="text" required placeholder="Ej. González"
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Nombre *</label>
                    <input
                      name="nombre" value={formData.nombre} onChange={handleInputChange}
                      type="text" required placeholder="Ej. Lucía"
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">DNI *</label>
                    <input
                      name="dni" value={formData.dni} onChange={handleInputChange}
                      type="text" required maxLength={8} placeholder="Ej. 40123456"
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Fecha de Nacimiento</label>
                    <input
                      name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange}
                      type="date"
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Contacto</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Teléfono *</label>
                    <input
                      name="telefono" value={formData.telefono} onChange={handleInputChange}
                      type="tel" required placeholder="Ej. 2216789012"
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Email</label>
                    <input
                      name="email" value={formData.email} onChange={handleInputChange}
                      type="email" placeholder="Ej. nombre@email.com"
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Académico</div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Nivel de Ingreso (Opcional)</label>
                  <select
                    name="nivel" value={formData.nivel} onChange={handleInputChange}
                    className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="">Sin nivel previo (Requiere diagnóstico)</option>
                    <option value="A1">A1 — Principiante</option>
                    <option value="A2">A2 — Elemental</option>
                    <option value="B1">B1 — Intermedio</option>
                    <option value="B2">B2 — Intermedio Alto</option>
                  </select>
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 shrink-0">
              <button
                type="button" onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors"
              >Cancelar</button>
              <button
                type="button" onClick={handleSubmit}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all"
              >Guardar Alumno</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
