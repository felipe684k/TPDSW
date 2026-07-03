import { useState } from 'react'

export interface Inscripcion {
  id: number
  apellido: string
  nombre: string
  dni: string
  comision: string
  nivel: string
  fecha: string
  estado: string
  nota_final?: string
  porc_asistencia?: string
}

interface InscripcionesProps {
  inscripciones: Inscripcion[]
  setInscripciones: React.Dispatch<React.SetStateAction<Inscripcion[]>>
}

// Generador de ID fuera del componente para evitar advertencias de pureza
const getUniqueId = () => Date.now();

export default function Inscripciones({ inscripciones, setInscripciones }: InscripcionesProps) {
  // Estado para el modal de nueva inscripción
  const [modalOpen, setModalOpen] = useState(false)
  
  const cerrarModal = () => setModalOpen(false)

  // Estados del formulario
  const [formAlumno, setFormAlumno] = useState('')
  const [formComision, setFormComision] = useState('')
  const [formPago, setFormPago] = useState('')

  // Mock datos
  const alumnosDisponibles = [
    { id: 1, nombreCompleto: 'González, Lucía', dni: '40.123.456' },
    { id: 2, nombreCompleto: 'Ramírez, Tomás', dni: '38.901.234' },
    { id: 3, nombreCompleto: 'Fernández, Valentina', dni: '42.567.890' }
  ]

  const comisionesDisponibles = [
    { id: 1, nombre: 'Kids 1 - A', matricula: 8000 },
    { id: 2, nombre: 'Teens 3 - Noche', matricula: 10000 },
    { id: 3, nombre: 'First Certificate Prep', matricula: 15000 }
  ]

  const comisionSeleccionada = comisionesDisponibles.find(c => c.id.toString() === formComision)
  const precioBase = comisionSeleccionada ? comisionSeleccionada.matricula : 0
  const montoMatricula = formPago === 'efectivo' ? precioBase * 0.9 : precioBase

  // Función para registrar inscripción
  const handleConfirmar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formAlumno || !formComision || !formPago) {
      alert('Por favor selecciona un alumno, una comisión y una forma de pago para la matrícula.')
      return
    }

    const alumno = alumnosDisponibles.find(a => a.id.toString() === formAlumno)

    const nueva: Inscripcion = {
      id: getUniqueId(),
      apellido: alumno?.nombreCompleto.split(',')[0] || '',
      nombre: alumno?.nombreCompleto.split(',')[1].trim() || '',
      dni: alumno?.dni || '',
      comision: comisionSeleccionada?.nombre || '',
      nivel: '-', // Simplificado para este ejemplo
      fecha: new Date().toLocaleDateString('es-AR'),
      estado: 'Activa', // Siempre activa porque la matrícula se abona en el acto
      nota_final: '-',
      porc_asistencia: '0%'
    }

    setInscripciones([nueva, ...inscripciones])
    setModalOpen(false)
    
    // Limpiar formulario
    setFormAlumno('')
    setFormComision('')
    setFormPago('')
  }

  // Función para dar de baja
  const handleEliminar = (id: number) => {
    if (confirm('¿Dar de baja esta inscripción?')) {
      setInscripciones(inscripciones.filter((i: Inscripcion) => i.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Inscripciones</h1>
          <p className="text-xs text-slate-500 mt-1">Listado de alumnos inscriptos a comisiones.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all">
          ➕ Nueva Inscripción
        </button>
      </div>

      {/* Regla de negocio alert */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-xs flex gap-2.5">
        <span className="text-sm">ℹ️</span>
        <div>Alumnos sin nivel previo deben rendir una <strong>evaluación diagnóstica</strong> antes de ser asignados a una comisión.</div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div className="text-xs font-semibold text-slate-700">Listado de Inscripciones</div>
          <span className="text-2xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
            Total: {inscripciones.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alumno</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">DNI</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Comisión</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nivel</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fecha</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Asistencia</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nota Final</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estado</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inscripciones.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-xs font-semibold text-slate-800">{i.apellido}, {i.nombre}</td>
                  <td className="p-3 text-xs font-mono text-slate-400">{i.dni}</td>
                  <td className="p-3 text-xs text-slate-600">{i.comision}</td>
                  <td className="p-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-indigo-50 text-indigo-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{i.nivel}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-400">{i.fecha}</td>
                  <td className="p-3 text-xs font-semibold text-slate-600">{i.porc_asistencia || '0%'}</td>
                  <td className="p-3 text-xs font-semibold text-slate-600">{i.nota_final || '-'}</td>
                  <td className="p-3 text-xs">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold ${
                      i.estado === 'Activa' ? 'bg-emerald-50 text-emerald-700' :
                      i.estado === 'Pendiente' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        i.estado === 'Activa' ? 'bg-emerald-500' :
                        i.estado === 'Pendiente' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></span>
                      {i.estado}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    <button 
                      onClick={() => handleEliminar(i.id)} 
                      className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded text-2xs font-medium transition-colors"
                    >
                      Dar de Baja
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
           MODAL: NUEVA INSCRIPCIÓN
           ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-semibold text-slate-800">📝 Registrar Inscripción</h2>
              <button 
                onClick={cerrarModal}
                className="w-7 h-7 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleConfirmar} className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Sección Alumno */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Selección de Alumno</div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Alumno a inscribir *</label>
                  <select 
                    required value={formAlumno} onChange={e => setFormAlumno(e.target.value)}
                    className="border border-slate-200 rounded p-2 text-xs bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="">— Seleccionar Alumno Registrado —</option>
                    {alumnosDisponibles.map(a => (
                      <option key={a.id} value={a.id}>{a.nombreCompleto} (DNI: {a.dni})</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1">⚠️ El alumno ya debe haber sido creado en el módulo "Alumnos".</span>
                </div>
              </div>

              {/* Sección Comisión */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Selección de Comisión</div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Comisión *</label>
                  <select 
                    required value={formComision} onChange={e => setFormComision(e.target.value)}
                    className="border border-slate-200 rounded p-2 text-xs bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="">— Seleccionar Comisión —</option>
                    {comisionesDisponibles.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sección Matrícula y Pago */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Pago de Matrícula (Abono Inmediato)</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Forma de pago *</label>
                    <select 
                      required value={formPago} onChange={e => setFormPago(e.target.value)}
                      className="border border-slate-200 rounded p-2 text-xs bg-white outline-none focus:border-indigo-500"
                    >
                      <option value="">— Seleccionar —</option>
                      <option value="efectivo">Efectivo (-10%)</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="tarjeta">Tarjeta</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Monto a abonar hoy</label>
                    <input 
                      type="text" readOnly value={formPago ? `$${montoMatricula.toLocaleString('es-AR')}` : ''}
                      placeholder="$0" className="border border-slate-200 bg-slate-50 rounded p-2 text-xs text-slate-500 outline-none font-bold text-slate-900"
                    />
                    {formPago === 'efectivo' && (
                      <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">✅ Descuento por efectivo aplicado.</span>
                    )}
                  </div>
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button 
                type="button" onClick={cerrarModal}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button" onClick={handleConfirmar}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all"
              >
                Confirmar Registro
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
