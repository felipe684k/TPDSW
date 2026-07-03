import { useState } from 'react'

interface Cuota {
  id: number
  mes_cuota: string
  monto: number
  vencimiento: string
  estado: string
  fecha_pago: string | null
  recargo: number
  descuento: number
  metodoPago?: string
}

export default function Pagos() {
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<number | null>(null)
  const [modalPago, setModalPago] = useState<Cuota | null>(null) // Guarda la cuota a pagar
  const [metodoPago, setMetodoPago] = useState('')

  // Datos mockeados de alumnos inscriptos
  const alumnosInscriptos = [
    { id: 1, nombreCompleto: 'González, Lucía', dni: '40.123.456', curso: 'Kids 1 - A', montoCuota: 12000, mesIngresoIndex: 0 }, // Ingresa en Marzo
    { id: 2, nombreCompleto: 'Ramírez, Tomás', dni: '38.901.234', curso: 'Teens 3 - Noche', montoCuota: 14500, mesIngresoIndex: 5 } // Ingresa en Agosto
  ]

  // Generamos cuotas solo a partir del mes de ingreso
  const generarCuotas = (montoBase: number, startIndex: number): Cuota[] => {
    const mesesTodos = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero']
    const meses = mesesTodos.slice(startIndex) // Cortamos desde el mes que ingresó en adelante
    
    return meses.map((mes, idx) => {
      const realIdx = startIndex + idx
      return {
        id: realIdx + 1,
        mes_cuota: mes,
        monto: montoBase,
        vencimiento: `10/${(realIdx + 3) > 12 ? (realIdx + 3 - 12).toString().padStart(2, '0') : (realIdx + 3).toString().padStart(2, '0')}/2026`,
        estado: idx === 0 ? 'Pagado' : 'Pendiente', // Su primer mes lo pagó, el resto pendiente
        fecha_pago: idx === 0 ? `05/${(realIdx + 3) > 12 ? (realIdx + 3 - 12).toString().padStart(2, '0') : (realIdx + 3).toString().padStart(2, '0')}/2026` : null,
        recargo: 0,
        descuento: 0
      }
    })
  }

  // Estado local para las cuotas del alumno seleccionado
  const [cuotas, setCuotas] = useState<Cuota[]>([])

  const handleSeleccionarAlumno = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value)
    if (!id) {
      setAlumnoSeleccionado(null)
      setCuotas([])
      return
    }
    const alumno = alumnosInscriptos.find(a => a.id === id)
    setAlumnoSeleccionado(id)
    if (alumno) {
      setCuotas(generarCuotas(alumno.montoCuota, alumno.mesIngresoIndex))
    }
  }

  const [recargo, setRecargo] = useState<number>(0)
  const [descuento, setDescuento] = useState<number>(0)

  const handleAbrirModal = (cuota: Cuota) => {
    setModalPago(cuota)
    setMetodoPago('')
    setRecargo(0)
    setDescuento(0)
  }

  const handleProcesarPago = (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalPago) return
    if (!metodoPago) {
      alert('Por favor seleccione un método de pago')
      return
    }

    // Actualizamos el estado de la cuota a 'Pagado' con los nuevos atributos
    setCuotas(cuotas.map(c => 
      c.id === modalPago.id ? { 
        ...c, 
        estado: 'Pagado', 
        metodoPago, 
        fecha_pago: new Date().toLocaleDateString('es-AR'),
        recargo: Number(recargo),
        descuento: Number(descuento)
      } : c
    ))

    setModalPago(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Cobro de Cuotas</h1>
          <p className="text-xs text-slate-500 mt-1">Gestión de pagos mensuales por alumno.</p>
        </div>
      </div>

      {/* Buscador / Selector de Alumno */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
        <label className="text-xs font-semibold text-slate-700">Buscar Alumno Inscripto</label>
        <select 
          onChange={handleSeleccionarAlumno}
          className="border border-slate-300 rounded-lg p-3 text-sm bg-slate-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all max-w-md"
        >
          <option value="">— Seleccionar Alumno —</option>
          {alumnosInscriptos.map(a => (
            <option key={a.id} value={a.id}>{a.nombreCompleto} (DNI: {a.dni}) - {a.curso}</option>
          ))}
        </select>
      </div>

      {/* Panel de Cuotas */}
      {alumnoSeleccionado && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Estado de Cuenta</h2>
              <div className="flex gap-2 items-center mt-1">
                <p className="text-xs text-slate-500">Ciclo Lectivo 2026</p>
                <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  Ingreso: {cuotas.length > 0 ? cuotas[0].mes_cuota : ''}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Deuda Total Vencida</span>
              <span className="text-lg font-bold text-rose-600">$0</span>
            </div>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cuotas.map((cuota) => (
                <div key={cuota.id} className={`p-4 rounded-xl border ${cuota.estado === 'Pagado' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'} shadow-sm flex flex-col justify-between space-y-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{cuota.mes_cuota}</span>
                      <span className="block text-[10px] text-slate-500">Vto: {cuota.vencimiento}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cuota.estado === 'Pagado' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {cuota.estado}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50/50 p-2 rounded border border-slate-100">
                    <div>
                      <span className="text-slate-400 block">Base</span>
                      <span className="font-semibold text-slate-700">${cuota.monto.toLocaleString('es-AR')}</span>
                    </div>
                    {cuota.estado === 'Pagado' && (
                      <>
                        <div>
                          <span className="text-slate-400 block">Fecha Pago</span>
                          <span className="font-semibold text-slate-700">{cuota.fecha_pago}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Recargo</span>
                          <span className="font-semibold text-rose-600">+${cuota.recargo}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Descuento</span>
                          <span className="font-semibold text-emerald-600">-${cuota.descuento}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-end pt-2 border-t border-slate-100/50">
                    <div>
                      <span className="block text-[10px] text-slate-500">Total a Pagar / Pagado</span>
                      <span className="text-lg font-bold text-slate-900">${(cuota.monto + cuota.recargo - cuota.descuento).toLocaleString('es-AR')}</span>
                    </div>
                    
                    {cuota.estado === 'Pendiente' ? (
                      <button 
                        onClick={() => handleAbrirModal(cuota)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-medium shadow-sm transition-colors"
                      >
                        Pagar
                      </button>
                    ) : (
                      <button className="text-slate-400 hover:text-slate-600 px-2 py-1 rounded text-xs font-medium underline transition-colors">
                        Ver Recibo
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PAGO */}
      {modalPago && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-800">Registrar Pago</h2>
            </div>
            
            <form onSubmit={handleProcesarPago} className="p-5 space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center mb-2">
                <span className="block text-xs text-slate-500 uppercase tracking-wider">Cuota de {modalPago.mes_cuota}</span>
                <span className="text-2xl font-bold text-slate-900">${(modalPago.monto + recargo - descuento).toLocaleString('es-AR')}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Recargo ($)</label>
                  <input 
                    type="number" min="0" value={recargo} onChange={e => setRecargo(Number(e.target.value))}
                    className="border border-slate-300 rounded p-2 text-sm bg-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Descuento ($)</label>
                  <input 
                    type="number" min="0" value={descuento} onChange={e => setDescuento(Number(e.target.value))}
                    className="border border-slate-300 rounded p-2 text-sm bg-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Método de Pago *</label>
                <select 
                  required value={metodoPago} onChange={e => setMetodoPago(e.target.value)}
                  className="border border-slate-300 rounded p-2.5 text-sm bg-white outline-none focus:border-indigo-500"
                >
                  <option value="">— Seleccionar —</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="tarjeta">Tarjeta (Débito/Crédito)</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-2">
                <button 
                  type="button" onClick={() => setModalPago(null)}
                  className="flex-1 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium shadow-sm transition-colors"
                >
                  Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
