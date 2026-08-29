import { useState, useEffect } from 'react'
import { professorService, type Professor } from '../services/professor.service'

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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Professors</h1>
          <p className="text-xs text-slate-500 mt-1">Administration of the institute's teaching staff.</p>
        </div>
        <button 
          onClick={handleOpenModalCreate} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Register Professor
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
            placeholder="Search professor by name or DNI..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-slate-800 rounded text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Professors Table */}
      <div className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="text-xs font-semibold text-slate-300">Teaching Staff</div>
          <span className="text-2xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-mono">
            Total: {filteredProfessors.length}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#17181e] border-b border-slate-800">
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Professor</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">DNI</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Phone</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</th>
                <th className="p-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProfessors.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500 text-xs">No matching professors found</td></tr>
              ) : (
                filteredProfessors.map((professor) => (
                  <tr key={professor.id} className="hover:bg-[#17181e] transition-colors">
                    <td className="p-3 text-xs font-semibold text-slate-200">{professor.last_name}, {professor.first_name}</td>
                    <td className="p-3 text-xs font-mono text-slate-400">{professor.dni}</td>
                    <td className="p-3 text-xs text-slate-400">{professor.phone || '-'}</td>
                    <td className="p-3 text-xs text-slate-400">{professor.email || '-'}</td>
                    <td className="p-3 text-xs flex gap-2">
                      <button onClick={() => handleEdit(professor)} className="text-indigo-400 hover:text-indigo-300 font-semibold text-2xs cursor-pointer">Edit</button>
                      <span className="text-slate-300">|</span>
                      <button onClick={() => confirmDelete(professor.id!)} className="text-rose-500 hover:text-rose-400 font-semibold text-2xs cursor-pointer">Deactivate</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
           MODAL: REGISTER / EDIT PROFESSOR
           ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-semibold text-slate-200">
                {editingId ? '👨‍🏫 Edit Professor' : '👨‍🏫 Register New Professor'}
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
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Personal Data</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Last Name *</label>
                    <input 
                      type="text" required name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Smith" 
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">First Name *</label>
                    <input 
                      type="text" required name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="John" 
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
                    <label className="text-xs font-semibold text-slate-400">Date of Birth</label>
                    <input 
                      type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} 
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Contact</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Phone</label>
                    <input 
                      type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="2219998877" 
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Email</label>
                    <input 
                      type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john.smith@institute.com" 
                      className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 shrink-0 -mx-5 -mb-5 mt-5">
                <button 
                  type="button" onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Register Professor'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ==========================================
           MODAL: CONFIRM DEACTIVATION
           ========================================== */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 text-rose-500 text-xl">
                ⚠️
              </div>
              <h2 className="text-lg font-bold text-slate-100 mb-2">Deactivate professor?</h2>
              <p className="text-xs text-slate-400">
                This action will disable the professor in the system. They can be reactivated later if needed.
              </p>
            </div>
            <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 shrink-0">
              <button 
                type="button" 
                onClick={() => { setDeleteModalOpen(false); setProfessorToDelete(null); }}
                className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium shadow-sm transition-all cursor-pointer"
              >
                Yes, deactivate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
