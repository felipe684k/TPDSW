import { useState, useEffect } from 'react'
import { academicYearService, type AcademicYear } from '../services/academicYear.service'

export default function AcademicYears() {
  const [modalOpen, setModalOpen] = useState(false)
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{text: string, type: 'success' | 'danger'} | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: ''
  })

  const fetchAcademicYears = async () => {
    try {
      const data = await academicYearService.getAcademicYears()
      setAcademicYears(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAcademicYears()
  }, [])

  const handleOpenModalCreate = () => {
    setEditingId(null)
    setFormData({ name: '', start_date: '', end_date: '' })
    setModalOpen(true)
    setToast(null)
  }

  const handleEdit = (academicYear: AcademicYear) => {
    setEditingId(academicYear.id_academic_year || null)
    setFormData({ 
      name: academicYear.name, 
      start_date: academicYear.start_date, 
      end_date: academicYear.end_date
    })
    setModalOpen(true)
    setToast(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await academicYearService.updateAcademicYear(editingId, formData)
      } else {
        await academicYearService.createAcademicYear(formData)
      }
      
      setModalOpen(false)
      setToast({ text: editingId ? "Academic year updated" : "Academic year created", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      fetchAcademicYears()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Academic Years</h1>
          <p className="text-xs text-slate-500 mt-1">Administration of annual or semester academic periods.</p>
        </div>
        <button onClick={handleOpenModalCreate} className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all">
          ➕ New Academic Year
        </button>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 bg-[#1c1d24] border px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          toast.type === 'success' ? 'border-emerald-500/50 text-emerald-400' : 'border-rose-500/50 text-rose-400'
        }`}>
          <span className="text-lg">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="font-medium text-sm">{toast.text}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-4xl">
        {loading ? (
          <div className="text-slate-400 text-sm">Loading...</div>
        ) : academicYears.length === 0 ? (
          <div className="text-slate-500 text-sm">No academic years registered.</div>
        ) : (
          academicYears.map(ay => (
            <div key={ay.id_academic_year} className="bg-[#1c1d24] p-5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{ay.name}</h3>
                <p className="text-xs text-slate-400 mt-1">From {ay.start_date} to {ay.end_date}</p>
              </div>
              <button onClick={() => handleEdit(ay)} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm cursor-pointer">
                Edit
              </button>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#17181e]">
              <h3 className="text-sm font-bold text-slate-100">{editingId ? 'Edit Academic Year' : 'New Academic Year'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Name *</label>
                <input 
                  type="text" required placeholder="e.g. First Semester 2026"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Start Date *</label>
                <input 
                  type="date" required
                  value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})}
                  className="w-full border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">End Date *</label>
                <input 
                  type="date" required
                  value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})}
                  className="w-full border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
