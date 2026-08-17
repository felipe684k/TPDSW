import { useState, useEffect } from 'react'
import { profesorService, type Profesor } from '../services/profesor.service'

export default function Docentes() {
  const [modalOpen, setModalOpen] = useState(false)
  const [docentes, setDocentes] = useState<Profesor[]>([])
  const [searchTerm, setSearchTerm] = useState('')


  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [docenteToDelete, setDocenteToDelete] = useState<number | null>(null)
  const [toast, setToast] = useState<{text: string, type: 'success' | 'danger'} | null>(null)
  
  // Si editingId es number estamos editando, si es null estamos creando
  const [editingId, setEditingId] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    apellido: '',
    nombre: '',
    dni: '',
    fecha_nacimiento: '',
    telefono: '',
    email: ''
  })

  useEffect(() => {
    fetchDocentes()
  }, [])

  const fetchDocentes = async () => {
    try {
      const data = await profesorService.getProfesores() // Fetch all without filters
      setDocentes(data)
    } catch (error) {
      console.error('Failed to fetch docentes', error)
    }
  }

  // Filtrado local para búsqueda instantánea
  const filteredDocentes = docentes.filter(docente => {
    // Ocultar docentes dados de baja (baja lógica)
    if (!docente.activo) return false;

    const textToSearch = `${docente.nombre} ${docente.apellido} ${docente.dni}`.toLowerCase()
    return textToSearch.includes(searchTerm.toLowerCase())
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    // Si estamos creando (no editando) y el DNI tiene 7 o más números
    if (!editingId && formData.dni.length >= 7) {
      profesorService.checkDni(formData.dni).then((data) => {
        if (data && !data.activo) {
          // Usuario inactivo: autocompletar
          setFormData(prev => ({
            ...prev,
            nombre: data.nombre || '',
            apellido: data.apellido || '',
            telefono: data.telefono || '',
            fecha_nacimiento: data.fecha_nacimiento ? data.fecha_nacimiento.split('T')[0] : '',
            email: data.email ? data.email.split('_baja_')[0] : ''
          }));
        }
      }).catch(console.error);
    }
  }, [formData.dni, editingId]);

  const handleOpenModalCreate = () => {
    setEditingId(null)
    setFormData({ apellido: '', nombre: '', dni: '', fecha_nacimiento: '', telefono: '', email: '' })
    setModalOpen(true)
    setToast(null)
  }

  const handleEdit = (docente: Profesor) => {
    if (!docente.id) return;
    setEditingId(docente.id)
    setFormData({
      apellido: docente.apellido || '',
      nombre: docente.nombre || '',
      dni: docente.dni || '',
      fecha_nacimiento: docente.fecha_nacimiento ? docente.fecha_nacimiento.split('T')[0] : '',
      telefono: docente.telefono || '',
      email: docente.email || ''
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await profesorService.updateProfesor(editingId, formData)
      } else {
        await profesorService.createProfesor(formData)
      }
      setModalOpen(false)
      setFormData({ apellido: '', nombre: '', dni: '', fecha_nacimiento: '', telefono: '', email: '' })
      
      setToast({ text: editingId ? "Docente actualizado con éxito" : "Docente registrado con éxito", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      
      fetchDocentes()
    } catch (error) {
      console.error('Error guardando docente', error)
      alert('Error al guardar el docente. Verifique los datos.')
    }
  }

  const confirmDelete = (id: number) => {
    setDocenteToDelete(id)
    setDeleteModalOpen(true)
  }

  const executeDelete = async () => {
    if (!docenteToDelete) return
    try {
      await profesorService.deleteProfesor(docenteToDelete)
      setToast({ text: "Docente dado de baja con éxito", type: 'danger' })
      setTimeout(() => setToast(null), 3000)
      fetchDocentes()
      setDeleteModalOpen(false)
      setDocenteToDelete(null)
    } catch (error) {
      console.error('Error al dar de baja', error)
      alert('Error al dar de baja el docente.')
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Docentes</h1>
          <p className="text-xs text-slate-500 mt-1">Administración del cuerpo docente del instituto.</p>
        </div>
        <button 
          onClick={handleOpenModalCreate} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Registrar Docente
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

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-[#1c1d24] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar docente por nombre o DNI..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-slate-800 rounded text-xs outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {/* El filtro de estado fue removido */}
        </div>
      </div>

      {/* Tabla de Docentes */}
      <div className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="text-xs font-semibold text-slate-300">Cuerpo Docente</div>
          <span className="text-2xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-mono">
            Total: {filteredDocentes.length}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#17181e] border-b border-slate-800">
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Docente</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">DNI</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teléfono</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDocentes.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-500 text-xs">No hay docentes que coincidan</td></tr>
              ) : (
                filteredDocentes.map((docente) => (
                  <tr key={docente.id} className="hover:bg-[#17181e] transition-colors">
                    <td className="p-3 text-xs font-semibold text-slate-200">{docente.apellido}, {docente.nombre}</td>
                    <td className="p-3 text-xs font-mono text-slate-400">{docente.dni}</td>
                    <td className="p-3 text-xs text-slate-400">{docente.telefono || '-'}</td>
                    <td className="p-3 text-xs text-slate-400">{docente.email || '-'}</td>
                    <td className="p-3 text-xs flex gap-2">
                      <button onClick={() => handleEdit(docente)} className="text-indigo-400 hover:text-indigo-300 font-semibold text-2xs">Editar</button>
                      <span className="text-slate-300">|</span>
                      <button onClick={() => confirmDelete(docente.id!)} className="text-rose-500 hover:text-rose-400 font-semibold text-2xs">Dar de Baja</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
           MODAL: REGISTRAR / EDITAR DOCENTE
           ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-semibold text-slate-200">
                {editingId ? '👨‍🏫 Editar Docente' : '👨‍🏫 Registrar Nuevo Docente'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Datos Personales</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Apellido *</label>
                    <input 
                      type="text" required name="apellido" value={formData.apellido} onChange={handleInputChange} placeholder="Smith" 
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Nombre *</label>
                    <input 
                      type="text" required name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="John" 
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">DNI *</label>
                    <input 
                      type="text" required maxLength={8} name="dni" value={formData.dni} onChange={handleInputChange} placeholder="30123456" 
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Fecha de Nacimiento</label>
                    <input 
                      type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange} 
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Contacto</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Teléfono</label>
                    <input 
                      type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="2219998877" 
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Email</label>
                    <input 
                      type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john.smith@instituto.com" 
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 shrink-0 -mx-5 -mb-5 mt-5">
                <button 
                  type="button" onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all"
                >
                  {editingId ? 'Guardar Cambios' : 'Registrar Docente'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ==========================================
           MODAL: CONFIRMAR BAJA
           ========================================== */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 text-rose-500 text-xl">
                ⚠️
              </div>
              <h2 className="text-lg font-bold text-slate-100 mb-2">¿Dar de baja docente?</h2>
              <p className="text-xs text-slate-400">
                Esta acción deshabilitará al docente en el sistema. Podrá ser reactivado posteriormente si es necesario.
              </p>
            </div>
            <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 shrink-0">
              <button 
                type="button" 
                onClick={() => { setDeleteModalOpen(false); setDocenteToDelete(null); }}
                className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium shadow-sm transition-all"
              >
                Sí, dar de baja
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
