import { useState, useEffect } from 'react'
import { professorService, type Professor } from '../services/professor.service'
import DataTable from '../shared/components/DataTable'
import Modal from '../shared/components/Modal'
import FormInput from '../shared/components/FormInput'

export default function Professors() {
  const [modalOpen, setModalOpen] = useState(false)
  const [professors, setProfessors] = useState<Professor[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [professorToDelete, setProfessorToDelete] = useState<number | null>(null)
  const [toast, setToast] = useState<{text: string, type: 'success' | 'danger'} | null>(null)
  
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    dni: '',
    birth_date: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    fetchProfessors()
  }, [])

  const fetchProfessors = async () => {
    try {
      const data = await professorService.getProfessors()
      setProfessors(data)
    } catch (error) {
      console.error('Failed to fetch professors', error)
    }
  }

  const filteredProfessors = professors.filter(professor => {
    if (!professor.active) return false;

    const textToSearch = `${professor.first_name} ${professor.last_name} ${professor.dni}`.toLowerCase()
    return textToSearch.includes(searchTerm.toLowerCase())
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (!editingId && formData.dni.length >= 7) {
      professorService.checkDni(formData.dni).then((data) => {
        if (data && !data.active) {
          setFormData(prev => ({
            ...prev,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || '',
            birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
            email: data.email ? data.email.split('_deleted_')[0] : ''
          }));
        }
      }).catch(console.error);
    }
  }, [formData.dni, editingId]);

  const handleOpenModalCreate = () => {
    setEditingId(null)
    setFormData({ last_name: '', first_name: '', dni: '', birth_date: '', phone: '', email: '' })
    setModalOpen(true)
    setToast(null)
  }

  const handleEdit = (professor: Professor) => {
    if (!professor.id) return;
    setEditingId(professor.id)
    setFormData({
      last_name: professor.last_name || '',
      first_name: professor.first_name || '',
      dni: professor.dni || '',
      birth_date: professor.birth_date ? professor.birth_date.split('T')[0] : '',
      phone: professor.phone || '',
      email: professor.email || ''
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await professorService.updateProfessor(editingId, formData)
      } else {
        await professorService.createProfessor(formData)
      }
      setModalOpen(false)
      setFormData({ last_name: '', first_name: '', dni: '', birth_date: '', phone: '', email: '' })
      
      setToast({ text: editingId ? "Professor updated successfully" : "Professor registered successfully", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      
      fetchProfessors()
    } catch (error) {
      console.error('Error saving professor', error)
      alert('Error saving professor. Please verify the data.')
    }
  }

  const confirmDelete = (id: number) => {
    setProfessorToDelete(id)
    setDeleteModalOpen(true)
  }

  const executeDelete = async () => {
    if (!professorToDelete) return
    try {
      await professorService.deleteProfessor(professorToDelete)
      setToast({ text: "Professor deactivated successfully", type: 'danger' })
      setTimeout(() => setToast(null), 3000)
      fetchProfessors()
      setDeleteModalOpen(false)
      setProfessorToDelete(null)
    } catch (error) {
      console.error('Error deactivating professor', error)
      alert('Error deactivating professor.')
    }
  }

  const columns = [
    {
      header: 'Profesor',
      render: (p: Professor) => <span className="font-semibold text-slate-200">{p.last_name}, {p.first_name}</span>,
    },
    {
      header: 'DNI',
      render: (p: Professor) => <span className="font-mono text-slate-400">{p.dni}</span>,
    },
    {
      header: 'Teléfono',
      render: (p: Professor) => <span className="text-slate-400">{p.phone || '-'}</span>,
    },
    {
      header: 'Email',
      render: (p: Professor) => <span className="text-slate-400">{p.email || '-'}</span>,
    },
    {
      header: 'Acciones',
      render: (p: Professor) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(p)} className="text-indigo-400 hover:text-indigo-300 font-semibold text-2xs cursor-pointer">Editar</button>
          <span className="text-slate-300">|</span>
          <button onClick={() => confirmDelete(p.id!)} className="text-rose-500 hover:text-rose-400 font-semibold text-2xs cursor-pointer">Desactivar</button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Profesores</h1>
          <p className="text-xs text-slate-500 mt-1">Administración del cuerpo docente del instituto.</p>
        </div>
        <button 
          onClick={handleOpenModalCreate} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Registrar Profesor
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

      {/* Search and Filters */}
      <div className="bg-[#1c1d24] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar profesor por nombre o DNI..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-slate-800 rounded text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <DataTable 
        title="Cuerpo Docente"
        columns={columns}
        data={filteredProfessors}
        totalCount={filteredProfessors.length}
        emptyMessage="No se encontraron profesores coincidentes"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? '👨‍🏫 Editar Profesor' : '👨‍🏫 Registrar Nuevo Profesor'}
        maxWidth="max-w-lg"
        footer={
          <>
            <button 
              type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" form="professorForm"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all cursor-pointer"
            >
              {editingId ? 'Guardar Cambios' : 'Registrar Profesor'}
            </button>
          </>
        }
      >
        <form id="professorForm" onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Datos Personales</div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput 
                label="Apellido *"
                type="text" required name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Pérez" 
              />
              <FormInput 
                label="Nombre *"
                type="text" required name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="Juan" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput 
                label="DNI *"
                type="text" required maxLength={8} name="dni" value={formData.dni} onChange={handleInputChange} placeholder="30123456" 
              />
              <FormInput 
                label="Fecha de Nacimiento"
                type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} 
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Contacto</div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput 
                label="Teléfono"
                type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="2219998877" 
              />
              <FormInput 
                label="Email"
                type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="juan.perez@instituto.com" 
              />
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setProfessorToDelete(null); }}
        isDanger={true}
        maxWidth="max-w-sm"
        footer={
          <>
            <button 
              type="button" 
              onClick={() => { setDeleteModalOpen(false); setProfessorToDelete(null); }}
              className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={executeDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium shadow-sm transition-all cursor-pointer"
            >
              Sí, desactivar
            </button>
          </>
        }
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 text-rose-500 text-xl">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-slate-100 mb-2">¿Desactivar profesor?</h2>
          <p className="text-xs text-slate-400 mb-2">
            Esta acción deshabilitará al profesor en el sistema. Podrá ser reactivado más tarde si es necesario.
          </p>
        </div>
      </Modal>
    </div>
  )
}
