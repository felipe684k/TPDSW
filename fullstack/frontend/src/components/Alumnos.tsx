import { useState, useEffect } from 'react'

interface AlumnoItem {
  dni: string
  apellido: string
  nombre: string
  telefono: string
  email: string
  nivel: string
  ingreso: string
}

export default function Alumnos() {
  // Un único estado simple para abrir/cerrar el formulario de registro
  const [modalOpen, setModalOpen] = useState(false)

  // Datos de alumnos con conexión a API backend
  const [alumnos, setAlumnos] = useState<AlumnoItem[]>([
    { dni: '43.123.456', apellido: 'González', nombre: 'Lucía', telefono: '2216789012', email: 'lucia.gonzalez@email.com', nivel: 'B1', ingreso: '15/03/2024' },
    { dni: '41.901.234', apellido: 'Ramírez', nombre: 'Tomás', telefono: '2215432109', email: 'tomas.ramirez@email.com', nivel: 'A2', ingreso: '10/04/2024' },
    { dni: '44.567.890', apellido: 'Fernández', nombre: 'Valentina', telefono: '2219876543', email: 'valen.f@email.com', nivel: 'A1', ingreso: '02/06/2025' },
    { dni: '42.234.567', apellido: 'López', nombre: 'Mateo', telefono: '2213456789', email: 'mateo.lopez@email.com', nivel: 'B2', ingreso: '20/11/2023' },
    { dni: '40.876.543', apellido: 'Perez', nombre: 'Antonella', telefono: '2216549870', email: 'anto.perez@email.com', nivel: 'A2', ingreso: '05/02/2024' }
  ])
  const [isFromBackend, setIsFromBackend] = useState(false)
  const [dbCount, setDbCount] = useState<number | null>(null)

  //hook para traer alumnos de la db
  useEffect(() => {
    //es una funcion asincrona porque va a recibir una peticion del backend
    const fetchAlumnosFromBackend = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/users')
        // si la peticion es exitosa
        if (res.ok) {
          const json = await res.json()
          setIsFromBackend(true) //siempre que hay una peticion exitosa, se actualiza el estado a true
          if (json.data && Array.isArray(json.data)) {
            setDbCount(json.data.length)
            //aca mapeamos los datos para que se muestren en la tabla
            if (json.data.length > 0) {
              const mapped = json.data.map((item: any) => ({
                //aca definimos que campos se van a mostrar en la tabla y los nombramos como queremos que se llamen en la tabla.
                dni: item.dni || String(item.id || 'N/A'),
                apellido: item.apellido || item.nombre_apellido || item.nombre_usuario || 'Sin Apellido',
                nombre: item.nombre || item.nombre_apellido || item.nombre_usuario || 'Sin Nombre',
                telefono: item.telefono || 'N/A',
                email: item.email || 'N/A',
                nivel: item.nivel || 'A1',
                ingreso: item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-AR') : 'Reciente'
              }))
              setAlumnos(mapped)
            } else {
              // Si la DB tiene 0 alumnos, limpiamos los precargados ficticios
              setAlumnos([])
            }
          }
        }
      } catch {
        // Si la peticion falla, se ejecuta este bloque, se van a mostrar los datos precargados para que no explote
      }
    }
    //aca llamamos a la funcion asincrona
    fetchAlumnosFromBackend()
  }, [])
  // los [] del final indican a React que se ejecute solo una vez al montar el componente, es decir, cuando el componente se renderiza por primera vez

  // El return es todo lo que se muestra en pantalla, esta dividido en 3 grandes partes. 
  return (
    <div className="space-y-6">

      {/* Cabecera de la sección */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Alumnos</h1>
          <p className="text-xs text-slate-500 mt-1">Administración de alumnos del instituto.</p>
        </div>

        {/*El onClick indica que al hacer click en el botón de registrar alumno, se abre el modal. */}
        <button
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Registrar Alumno
        </button>
      </div>

      {/* Buscador y filtros rápidos (Estático) */}
      <div className="bg-[#1c1d24] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>

          <input
            type="text"
            placeholder="Buscar por DNI, apellido o nombre..."
            className="w-full pl-8 pr-3 py-2 border border-slate-800 rounded text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] outline-none w-full md:w-36">
            <option value="">Todos los niveles</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
          </select>
        </div>
      </div>

      {/* Tabla de Alumnos */}
      <div className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Listado General</span>
            {isFromBackend && (
              <span className="text-[10px] bg-emerald-900/50 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full font-medium">
                📡 Conectado a Backend ({dbCount !== null ? `${dbCount} reg. en DB` : 'API OK'})
              </span>
            )}
          </div>
          <span className="text-2xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-mono">
            Total: {alumnos.length}
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
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nivel Actual</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fecha Ingreso</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {alumnos.length === 0 ? ( /* Si no hay alumnos en la tabla, se muestra un mensaje de que no hay alumnos registrados. */
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-slate-400">
                    {isFromBackend
                      ? '📂 Conectado a la Base de Datos: Aún no hay alumnos registrados en MySQL.'
                      : 'Cargando alumnos...'}
                  </td>
                </tr>
              ) : (
                alumnos.map((alumno) => ( /* Si hay alumnos en la tabla, se muestra un mensaje de que hay alumnos registrados. */
                  <tr key={alumno.dni} className="hover:bg-[#17181e] transition-colors">
                    <td className="p-3 text-xs font-semibold text-slate-200">{alumno.apellido}, {alumno.nombre}</td>
                    <td className="p-3 text-xs font-mono text-slate-400">{alumno.dni}</td>
                    <td className="p-3 text-xs text-slate-400">{alumno.telefono}</td>
                    <td className="p-3 text-xs text-slate-400">{alumno.email}</td>
                    <td className="p-3 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-indigo-950/30 text-indigo-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{alumno.nivel}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-400">{alumno.ingreso}</td>
                    <td className="p-3 text-xs flex gap-2">
                      <button className="text-indigo-400 hover:text-indigo-300 font-semibold text-2xs">Editar</button>
                      <span className="text-slate-300">|</span>
                      <button className="text-rose-500 hover:text-rose-400 font-semibold text-2xs">Eliminar</button>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
           MODAL: REGISTRAR ALUMNO
           ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Header del Modal */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-semibold text-slate-200">👤 Registrar Nuevo Alumno</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Formulario (Cuerpo Scrolleable) */}
            <form className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Sección Datos Personales */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Datos Personales</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Apellido *</label>
                    <input
                      type="text" required placeholder="Ej. González"
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Nombre *</label>
                    <input
                      type="text" required placeholder="Ej. Lucía"
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">DNI *</label>
                    <input
                      type="text" required maxLength={8} placeholder="Ej. 40123456"
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Contacto */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Contacto</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Teléfono *</label>
                    <input
                      type="tel" required placeholder="Ej. 2216789012"
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Email</label>
                    <input
                      type="email" placeholder="Ej. nombre@email.com"
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Académica inicial */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Académico</div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Nivel de Ingreso (Opcional)</label>
                  <select
                    className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="">Sin nivel previo (Requiere diagnóstico)</option>
                    <option value="A1">A1 — Principiante</option>
                    <option value="A2">A2 — Elemental</option>
                    <option value="B1">B1 — Intermedio</option>
                    <option value="B2">B2 — Intermedio Alto</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1">Si no se selecciona un nivel, se registrará al alumno como "Pendiente de Evaluación".</span>
                </div>
              </div>

            </form>

            {/* Footer del Modal */}
            <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 shrink-0">
              <button
                type="button" onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button" onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all"
              >
                Guardar Alumno
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
