import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config'

interface Cuota {
  id: number | string
  id_inscripcion?: number
  comision?: string
  mes_cuota: string
  monto: number
  vencimiento: string
  estado: string
  fecha_pago: string | null
  recargo: number
  descuento: number
  metodoPago?: string
}

interface Alumno {
  id: number
  nombreCompleto: string
  dni: string
  curso?: string
  montoCuota?: number
  mesIngresoIndex?: number
}

export default function Pagos() {
  const [alumnosList, setAlumnosList] = useState<Alumno[]>([])
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<number | null>(null)
  const [cuotas, setCuotas] = useState<Cuota[]>([])
  const [inscripcionId, setInscripcionId] = useState<number | null>(null)
  
  const [modalPago, setModalPago] = useState<Cuota | null>(null)
  const [modalRecibo, setModalRecibo] = useState<Cuota | null>(null)
  const [metodoPago, setMetodoPago] = useState('')
  const [recargo, setRecargo] = useState<number>(0)
  const [descuento, setDescuento] = useState<number>(0)
  const [cargando, setCargando] = useState<boolean>(false)

  // Cargar alumnos desde el backend
  useEffect(() => {
    fetchAlumnos()
  }, [])

  const fetchAlumnos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users?tipo=ALUMNO`)
      if (res.ok) {
        const json = await res.json()
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: Alumno[] = json.data.map((u: any) => ({
            id: u.id,
            nombreCompleto: `${u.apellido || ''}, ${u.nombre || ''}`.trim(),
            dni: u.dni || '',
            curso: u.nivel_actual || 'Curso General',
            montoCuota: 12000,
            mesIngresoIndex: 0
          }))
          setAlumnosList(mapped)
          return
        }
      }
    } catch (e) {
      console.warn('Error al cargar alumnos desde backend, usando fallback:', e)
    }

    // Fallback si no hay respuesta de la DB
    setAlumnosList([
      { id: 1, nombreCompleto: 'González, Lucía', dni: '40.123.456', curso: 'Kids 1 - A', montoCuota: 12000, mesIngresoIndex: 0 },
      { id: 2, nombreCompleto: 'Ramírez, Tomás', dni: '38.901.234', curso: 'Teens 3 - Noche', montoCuota: 14500, mesIngresoIndex: 5 }
    ])
  }

  // Cargar estado de cuenta / cuotas de un alumno
  const cargarEstadoCuenta = async (id: number) => {
    setCargando(true)
    try {
      const res = await fetch(`${API_BASE_URL}/pagos/alumno/${id}`)
      if (res.ok) {
        const json = await res.json()
        if (json.data && json.data.cuotas && json.data.cuotas.length > 0) {
          setCuotas(json.data.cuotas)
          if (json.data.inscripciones && json.data.inscripciones.length > 0) {
            setInscripcionId(json.data.inscripciones[0].id_inscripcion)
          }
          setCargando(false)
          return
        }
      }
    } catch (e) {
      console.warn('Error al cargar cuotas desde backend:', e)
    }

    // Fallback ajustado: Meses lectivos en Argentina (Marzo a Diciembre)
    const alumno = alumnosList.find(a => a.id === id)
    if (alumno) {
      const mesesAcademicos = [
        { nombre: 'Marzo', mesNum: 3 },
        { nombre: 'Abril', mesNum: 4 },
        { nombre: 'Mayo', mesNum: 5 },
        { nombre: 'Junio', mesNum: 6 },
        { nombre: 'Julio', mesNum: 7 },
        { nombre: 'Agosto', mesNum: 8 },
        { nombre: 'Septiembre', mesNum: 9 },
        { nombre: 'Octubre', mesNum: 10 },
        { nombre: 'Noviembre', mesNum: 11 },
        { nombre: 'Diciembre', mesNum: 12 }
      ]

      const now = new Date()
      const currentMonthNum = now.getMonth() + 1 // 8 para Agosto
      const currentYear = now.getFullYear() // 2026

      const mesesHastaHoy = mesesAcademicos.filter(m => m.mesNum <= currentMonthNum)

      const mockCuotas: Cuota[] = mesesHastaHoy.map((m, idx) => {
        return {
          id: idx + 1,
          id_inscripcion: id,
          comision: alumno.curso || 'Comisión',
          mes_cuota: m.nombre,
          monto: alumno.montoCuota || 12000,
          vencimiento: `10/${m.mesNum.toString().padStart(2, '0')}/${currentYear}`,
          estado: idx === 0 ? 'Pagado' : 'Pendiente',
          fecha_pago: idx === 0 ? `05/${m.mesNum.toString().padStart(2, '0')}/${currentYear}` : null,
          recargo: 0,
          descuento: 0,
          metodoPago: idx === 0 ? 'Efectivo' : undefined
        }
      })
      setCuotas(mockCuotas)
    }
    setCargando(false)
  }

  const handleSeleccionarAlumno = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value)
    if (!id) {
      setAlumnoSeleccionado(null)
      setCuotas([])
      setInscripcionId(null)
      return
    }
    setAlumnoSeleccionado(id)
    cargarEstadoCuenta(id)
  }

  const handleAbrirModal = (cuota: Cuota) => {
    setModalPago(cuota)
    setMetodoPago('')
    setRecargo(0)
    setDescuento(0)
  }

  const handleVerRecibo = (cuota: Cuota) => {
    setModalRecibo(cuota)
  }

  const handleProcesarPago = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalPago) return
    if (!metodoPago) {
      alert('Por favor seleccione un método de pago')
      return
    }

    const fechaHoy = new Date().toISOString().split('T')[0]

    const payload = {
      id_inscripcion: modalPago.id_inscripcion || inscripcionId || 1,
      mes_cuota: modalPago.mes_cuota,
      monto: modalPago.monto,
      recargo: Number(recargo),
      descuento: Number(descuento),
      estado: 'Pagado',
      fecha_pago: fechaHoy
    }

    try {
      const res = await fetch(`${API_BASE_URL}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        if (alumnoSeleccionado) {
          await cargarEstadoCuenta(alumnoSeleccionado)
        }
      } else {
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
      }
    } catch (err) {
      console.warn('Error al registrar pago en backend, actualizando vista localmente:', err)
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
    }

    setModalPago(null)
  }

  const alumnoActual = alumnosList.find(a => a.id === alumnoSeleccionado)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Cobro de Cuotas</h1>
          <p className="text-xs text-slate-500 mt-1">Gestión de pagos mensuales del Ciclo Lectivo 2026.</p>
        </div>
      </div>

      {/* Buscador / Selector de Alumno */}
      <div className="bg-[#1c1d24] p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col gap-3">
        <label className="text-xs font-semibold text-slate-300">Buscar Alumno Inscripto</label>
        <select 
          onChange={handleSeleccionarAlumno}
          className="border border-slate-300 rounded-lg p-3 text-sm bg-[#17181e] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all max-w-md"
        >
          <option value="">— Seleccionar Alumno —</option>
          {alumnosList.map(a => (
            <option key={a.id} value={a.id}>{a.nombreCompleto} (DNI: {a.dni}) - {a.curso}</option>
          ))}
        </select>
      </div>

      {/* Panel de Cuotas */}
      {alumnoSeleccionado && (
        <div className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 border-b border-slate-800 bg-[#17181e] flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Estado de Cuenta - {alumnoActual?.nombreCompleto}</h2>
              <div className="flex gap-2 items-center mt-1">
                <p className="text-xs text-slate-500">Ciclo Lectivo 2026 (Marzo - Agosto)</p>
                <span className="text-[10px] font-semibold bg-indigo-950/40 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-800/40">
                  {cuotas.length} Cuotas Devengadas
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Deuda Vencida a la Fecha</span>
              <span className="text-lg font-bold text-rose-500">
                ${cuotas.filter(c => c.estado === 'Pendiente').reduce((acc, c) => acc + c.monto, 0).toLocaleString('es-AR')}
              </span>
            </div>
          </div>
          
          <div className="p-5">
            {cargando ? (
              <div className="text-center py-8 text-xs text-slate-400">Cargando estado de cuenta...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cuotas.map((cuota) => (
                  <div key={cuota.id} className={`p-4 rounded-xl border ${cuota.estado === 'Pagado' ? 'border-emerald-800/40 bg-emerald-950/10' : 'border-slate-800 bg-[#1c1d24]'} shadow-sm flex flex-col justify-between space-y-4`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{cuota.mes_cuota} 2026</span>
                        <span className="block text-[10px] text-slate-500">Vto: {cuota.vencimiento}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cuota.estado === 'Pagado' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50' : 'bg-amber-900/40 text-amber-400 border border-amber-700/50'
                      }`}>
                        {cuota.estado}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#17181e]/50 p-2 rounded border border-slate-800/60">
                      <div>
                        <span className="text-slate-400 block">Arancel Base</span>
                        <span className="font-semibold text-slate-300">${cuota.monto.toLocaleString('es-AR')}</span>
                      </div>
                      {cuota.estado === 'Pagado' && (
                        <>
                          <div>
                            <span className="text-slate-400 block">Fecha Pago</span>
                            <span className="font-semibold text-slate-300">{cuota.fecha_pago || 'Abonado'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Recargo</span>
                            <span className="font-semibold text-rose-400">+${cuota.recargo}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Descuento</span>
                            <span className="font-semibold text-emerald-400">-${cuota.descuento}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-between items-end pt-2 border-t border-slate-800/60">
                      <div>
                        <span className="block text-[10px] text-slate-500">Total</span>
                        <span className="text-lg font-bold text-slate-100">${(cuota.monto + cuota.recargo - cuota.descuento).toLocaleString('es-AR')}</span>
                      </div>
                      
                      {cuota.estado === 'Pendiente' ? (
                        <button 
                          onClick={() => handleAbrirModal(cuota)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-medium shadow-sm transition-colors cursor-pointer"
                        >
                          Pagar
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleVerRecibo(cuota)}
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

      {/* MODAL DE REGISTRO DE PAGO */}
      {modalPago && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-sm border border-slate-800">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-200">Registrar Pago de Cuota</h2>
              <button onClick={() => setModalPago(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            
            <form onSubmit={handleProcesarPago} className="p-5 space-y-4">
              <div className="bg-[#17181e] border border-slate-800/60 rounded-lg p-3 text-center mb-2">
                <span className="block text-xs text-slate-500 uppercase tracking-wider">Cuota de {modalPago.mes_cuota} 2026</span>
                <span className="text-2xl font-bold text-slate-100">${(modalPago.monto + recargo - descuento).toLocaleString('es-AR')}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Recargo ($)</label>
                  <input 
                    type="number" min="0" value={recargo} onChange={e => setRecargo(Number(e.target.value))}
                    className="border border-slate-700 rounded p-2 text-sm bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Descuento ($)</label>
                  <input 
                    type="number" min="0" value={descuento} onChange={e => setDescuento(Number(e.target.value))}
                    className="border border-slate-700 rounded p-2 text-sm bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Método de Pago *</label>
                <select 
                  required value={metodoPago} onChange={e => setMetodoPago(e.target.value)}
                  className="border border-slate-700 rounded p-2.5 text-sm bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="">— Seleccionar —</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Tarjeta de Débito/Crédito">Tarjeta de Débito/Crédito</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-2">
                <button 
                  type="button" onClick={() => setModalPago(null)}
                  className="flex-1 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors"
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

      {/* MODAL DE VER RECIBO DE PAGO */}
      {modalRecibo && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-[#1c1d24] border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden print:p-0 print:border-none print:shadow-none">
            {/* Encabezado del Recibo */}
            <div className="p-5 bg-[#17181e] border-b border-slate-800 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏛️</span>
                  <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Instituto de Idiomas</h2>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Comprobante Oficial de Pago</p>
              </div>
              <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-800/50">
                PAGADO ✅
              </span>
            </div>

            {/* Cuerpo del Recibo */}
            <div className="p-5 space-y-4 text-xs">
              <div className="flex justify-between items-center bg-[#17181e]/60 p-3 rounded-lg border border-slate-800/60">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block font-semibold">N° Recibo</span>
                  <span className="font-mono font-bold text-indigo-400">#REC-2026-{modalRecibo.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] uppercase block font-semibold">Fecha de Emisión</span>
                  <span className="font-semibold text-slate-300">{modalRecibo.fecha_pago || new Date().toLocaleDateString('es-AR')}</span>
                </div>
              </div>

              {/* Detalle Alumno y Curso */}
              <div className="space-y-2 border-b border-slate-800/80 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Alumno:</span>
                  <span className="font-semibold text-slate-200">{alumnoActual?.nombreCompleto || 'Alumno Registrado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DNI:</span>
                  <span className="font-mono text-slate-300">{alumnoActual?.dni || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Comisión / Curso:</span>
                  <span className="font-semibold text-indigo-300">{modalRecibo.comision || alumnoActual?.curso || 'Curso de Idiomas'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Concepto Abonado:</span>
                  <span className="font-medium text-slate-200">Cuota {modalRecibo.mes_cuota} 2026</span>
                </div>
              </div>

              {/* Desglose Financiero */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Arancel Base:</span>
                  <span className="text-slate-300">${modalRecibo.monto.toLocaleString('es-AR')}</span>
                </div>
                {modalRecibo.recargo > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Recargo por Mora:</span>
                    <span>+${modalRecibo.recargo.toLocaleString('es-AR')}</span>
                  </div>
                )}
                {modalRecibo.descuento > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Descuento Aplicado:</span>
                    <span>-${modalRecibo.descuento.toLocaleString('es-AR')}</span>
                  </div>
                )}
                {modalRecibo.metodoPago && (
                  <div className="flex justify-between text-slate-400">
                    <span>Método de Pago:</span>
                    <span className="capitalize text-slate-300">{modalRecibo.metodoPago}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm font-bold pt-3 border-t border-slate-800 text-slate-100">
                  <span>Total Abonado:</span>
                  <span className="text-emerald-400 text-base">
                    ${(modalRecibo.monto + modalRecibo.recargo - modalRecibo.descuento).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer de Acciones */}
            <div className="p-4 bg-[#17181e] border-t border-slate-800 flex justify-end gap-2 print:hidden">
              <button 
                type="button" 
                onClick={() => setModalRecibo(null)}
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
