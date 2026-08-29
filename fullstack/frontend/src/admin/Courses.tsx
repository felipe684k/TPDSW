import { useState, useEffect } from 'react'
import { courseService, type Course } from '../services/course.service'
import { levelService, type Level } from '../services/level.service'
import { tuitionFeeService } from '../services/tuitionFee.service'

export default function Courses() {
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [updateTuitionFeeModalOpen, setUpdateTuitionFeeModalOpen] = useState(false)
  
  const [courses, setCourses] = useState<Course[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  
  const [editingId, setEditingId] = useState<number | null>(null)
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [newTuitionFeeAmount, setNewTuitionFeeAmount] = useState('')
  
  const [toast, setToast] = useState<{text: string, type: 'success' | 'danger'} | null>(null)

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString; 
    return date.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
  }

  const [formData, setFormData] = useState({
    course_name: '',
    level_code: '',
    weekly_hours: '',
    days_per_week: '',
    registration_fee: '',
    initial_tuition_fee: ''
  })

  const fetchCourses = async () => {
    try {
      const data = await courseService.getCourses()
      setCourses(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLevels = async () => {
    try {
      const data = await levelService.getLevels()
      setLevels(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchCourses()
    fetchLevels()
  }, [])

  const handleOpenModalCreate = () => {
    setEditingId(null)
    setFormData({ course_name: '', level_code: '', weekly_hours: '', days_per_week: '', registration_fee: '', initial_tuition_fee: '' })
    setModalOpen(true)
    setToast(null)
  }

  const handleEdit = (course: Course) => {
    setEditingId(course.id_course || null)
    const lastTuitionFee = course.tuition_fees && course.tuition_fees.length > 0 
      ? course.tuition_fees[course.tuition_fees.length - 1].monthly_cost 
      : ''
      
    setFormData({ 
      course_name: course.course_name, 
      level_code: course.level_code.toString(), 
      weekly_hours: course.weekly_hours.toString(), 
      days_per_week: course.days_per_week.toString(), 
      registration_fee: course.registration_fee.toString(), 
      initial_tuition_fee: lastTuitionFee.toString()
    })
    setModalOpen(true)
    setToast(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dataToSave = {
        course_name: formData.course_name,
        level_code: Number(formData.level_code),
        weekly_hours: Number(formData.weekly_hours),
        days_per_week: Number(formData.days_per_week),
        registration_fee: Number(formData.registration_fee),
        initial_tuition_fee: Number(formData.initial_tuition_fee)
      }

      if (editingId) {
        await courseService.updateCourse(editingId, dataToSave)
      } else {
        await courseService.createCourse(dataToSave)
      }
      
      setModalOpen(false)
      setToast({ text: editingId ? "Course updated successfully" : "Course registered successfully", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      
      fetchCourses()
    } catch (error) {
      console.error('Error saving course', error)
    }
  }

  const promptDelete = (id: number) => {
    setCourseToDelete(id)
    setDeleteModalOpen(true)
    setToast(null)
  }

  const executeDelete = async () => {
    if (!courseToDelete) return
    try {
      await courseService.deleteCourse(courseToDelete)
      setToast({ text: "Course deactivated successfully", type: 'danger' })
      setTimeout(() => setToast(null), 3000)
      fetchCourses()
      setDeleteModalOpen(false)
      setCourseToDelete(null)
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateTuitionFee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse || !selectedCourse.id_course) return
    try {
      const today = new Date().toISOString()
      await tuitionFeeService.createTuitionFee({
        id_course: selectedCourse.id_course,
        monthly_cost: Number(newTuitionFeeAmount),
        start_date: today
      })
      setUpdateTuitionFeeModalOpen(false)
      setToast({ text: "Tuition fee updated", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      fetchCourses()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Courses</h1>
          <p className="text-xs text-slate-500 mt-1">Management of the course catalog and their fees.</p>
        </div>
        <button 
          onClick={handleOpenModalCreate} 
          className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Register Course 
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

      {/* Courses list by level */}
      <div className="flex flex-col max-w-6xl mx-auto gap-8 w-full">
        {loading ? (
          <div className="text-slate-400 text-sm">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-slate-500 text-sm">No courses registered.</div>
        ) : (
          (() => {
            // Sort levels by next_level_code
            const isNext = new Set(levels.map(l => l.next_level_code).filter(Boolean));
            let current = levels.find(l => !isNext.has(l.level_code));
            if (!current) current = levels[0]; 
            
            const sortedLevels = [];
            while (current) {
              sortedLevels.push(current);
              const nextId: number | undefined | null = current.next_level_code;
              const nextCurrent: Level | undefined = levels.find(l => l.level_code === nextId);
              if (!nextCurrent || sortedLevels.some(l => l.level_code === nextCurrent.level_code)) break;
              current = nextCurrent;
            }
            
            const sortedIds = new Set(sortedLevels.map(l => l.level_code));
            const disconnected = levels.filter(l => !sortedIds.has(l.level_code));
            const allSortedLevels = [...sortedLevels, ...disconnected];

            return allSortedLevels.map(level => {
              const levelCourses = courses.filter(c => c.level_code === level.level_code);
              if (levelCourses.length === 0) return null;

              return (
                <div key={level.level_code} className="space-y-4">
                  {/* Level Header */}
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                    <span className="w-8 h-8 rounded bg-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold text-sm">
                      {level.name.charAt(0).toUpperCase()}
                    </span>
                    <h2 className="text-lg font-bold text-slate-200">{level.name}</h2>
                  </div>

                  {/* Level Course Cards */}
                  <div className="space-y-3">
                    {levelCourses.map((course) => {
                      const sortedFees = course.tuition_fees ? [...course.tuition_fees].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()) : []
                      const activeFee = sortedFees.length > 0 ? sortedFees[sortedFees.length - 1] : null;
                      
                      return (
                        <div key={course.id_course} className="bg-[#1c1d24] p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                          {/* Card Header */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full md:w-1/4">
                            <div>
                              <h3 className="text-base font-bold text-slate-100">{course.course_name}</h3>
                            </div>
                          </div>

                          {/* Course Attributes */}
                          <div className="flex flex-row justify-around items-center w-full md:w-2/4 bg-[#17181e] p-3 rounded-lg border border-slate-800/60">
                            <div className="text-center">
                              <span className="text-[10px] text-slate-400 block mb-1">Weekly Hours</span>
                              <span className="text-sm font-semibold text-slate-300 font-mono">{course.weekly_hours} hrs</span>
                            </div>
                            <div className="text-center px-4 border-l border-r border-slate-800/60">
                              <span className="text-[10px] text-slate-400 block mb-1">Days x Week</span>
                              <span className="text-sm font-semibold text-slate-300 font-mono">{course.days_per_week}</span>
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] text-slate-400 block mb-1">Registration Fee</span>
                              <span className="text-sm font-semibold text-slate-300">${Number(course.registration_fee).toLocaleString('en-US')}</span>
                            </div>
                          </div>

                          {/* Tuition Fee and Actions */}
                          <div className="flex flex-row justify-between items-center w-full md:w-1/4">
                            <div>
                              {activeFee ? (
                                <>
                                  <span className="text-[10px] text-slate-400 block">Current Tuition</span>
                                  <span className="text-base font-bold text-emerald-400">${Number(activeFee.monthly_cost).toLocaleString('en-US')}</span>
                                  <div className="flex gap-2 mt-1">
                                    <button 
                                      onClick={() => { setSelectedCourse(course); setNewTuitionFeeAmount(''); setUpdateTuitionFeeModalOpen(true); }}
                                      className="cursor-pointer text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded"
                                    >
                                      Update
                                    </button>
                                    <button 
                                      onClick={() => { setSelectedCourse(course); setHistoryModalOpen(true); }}
                                      className="cursor-pointer text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded"
                                    >
                                      History
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-500 block">No fee</span>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 border-l border-slate-800/60 pl-4 ml-2">
                              <button onClick={() => handleEdit(course)} className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs cursor-pointer text-left">Edit</button>
                              <button onClick={() => promptDelete(course.id_course!)} className="text-rose-500 hover:text-rose-400 font-semibold text-xs cursor-pointer text-left">Deactivate</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          })()
        )}
      </div>

      {/* ==========================================
           MODAL: REGISTER/EDIT COURSE
           ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-semibold text-slate-200">🏫 {editingId ? 'Edit Course' : 'Register New Course'}</h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="cursor-pointer w-7 h-7 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Course Name *</label>
                <input 
                  type="text" required placeholder="e.g. Kids 1" 
                  value={formData.course_name}
                  onChange={e => setFormData({...formData, course_name: e.target.value})}
                  className="border border-slate-800 rounded p-2.5 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Level *</label>
                <select 
                  required 
                  value={formData.level_code}
                  onChange={e => setFormData({...formData, level_code: e.target.value})}
                  className="border border-slate-800 rounded p-2.5 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="">— Choose Level —</option>
                  {levels.map(l => (
                    <option key={l.level_code} value={l.level_code}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Weekly Hours *</label>
                <input 
                  type="number" required placeholder="4" min="1"
                  value={formData.weekly_hours}
                  onChange={e => setFormData({...formData, weekly_hours: e.target.value})}
                  className="border border-slate-800 rounded p-2.5 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Days per Week *</label>
                <input 
                  type="number" required placeholder="2" min="1" max="7"
                  value={formData.days_per_week}
                  onChange={e => setFormData({...formData, days_per_week: e.target.value})}
                  className="border border-slate-800 rounded p-2.5 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Registration Fee ($) *</label>
                <input 
                  type="number" required placeholder="10000" min="0" step="0.01"
                  value={formData.registration_fee}
                  onChange={e => setFormData({...formData, registration_fee: e.target.value})}
                  className="border border-slate-800 rounded p-2.5 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              {!editingId && (
                <div className="flex flex-col gap-1.5 pt-3 mt-2 border-t border-slate-800/60">
                  <label className="text-xs font-semibold text-indigo-400">Initial Monthly Tuition Fee ($) *</label>
                  <input 
                    type="number" required placeholder="15000" min="0" step="0.01"
                    value={formData.initial_tuition_fee}
                    onChange={e => setFormData({...formData, initial_tuition_fee: e.target.value})}
                    className="border border-indigo-500/30 rounded p-2.5 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">
                    This value will be the active fee upon course creation. Future price updates can be done from the course actions.
                  </span>
                </div>
              )}

              <button type="submit" className="hidden"></button>
            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 shrink-0">
              <button 
                type="button" onClick={() => setModalOpen(false)}
                className="cursor-pointer px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" onClick={handleSubmit}
                className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all"
              >
                {editingId ? 'Save Changes' : 'Save Course'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-sm p-5 border border-slate-800 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-xl mx-auto mb-3">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Deactivate Course</h3>
            <p className="text-xs text-slate-400 mb-6">Are you sure you want to deactivate this course? It will be hidden from active lists.</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium transition-colors cursor-pointer"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE TUITION FEE MODAL */}
      {updateTuitionFeeModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#17181e]">
              <h3 className="text-sm font-bold text-slate-100">Update Tuition Fee</h3>
              <button onClick={() => setUpdateTuitionFeeModalOpen(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>
            <form onSubmit={handleUpdateTuitionFee} className="p-5 flex flex-col gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Course</p>
                <p className="text-sm font-medium text-slate-200">{selectedCourse.course_name}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">New Monthly Cost ($)</label>
                <input 
                  type="number" required placeholder="e.g. 18000" min="0" step="0.01"
                  value={newTuitionFeeAmount} onChange={e => setNewTuitionFeeAmount(e.target.value)}
                  className="w-full border border-slate-800 bg-[#1c1d24] text-slate-200 rounded p-2 text-sm outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">The start date will be automatically registered with the current date and time.</p>
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setUpdateTuitionFeeModalOpen(false)} className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium">Save Tuition Fee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TUITION FEE HISTORY MODAL */}
      {historyModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 pt-20 z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden max-h-[80vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#17181e] shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Tuition Fee History</h3>
                <p className="text-xs text-slate-400">{selectedCourse.course_name}</p>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>
            <div className="overflow-y-auto p-4">
              {(!selectedCourse.tuition_fees || selectedCourse.tuition_fees.length === 0) ? (
                <p className="text-sm text-slate-500 text-center py-4">No tuition fee history for this course.</p>
              ) : (
                <div className="space-y-3">
                  {[...selectedCourse.tuition_fees]
                    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                    .map((fee, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-slate-800 bg-[#17181e]">
                        <div>
                          <p className="text-sm font-bold text-emerald-400">${Number(fee.monthly_cost).toLocaleString('en-US')}</p>
                          <p className="text-xs text-slate-500">From: {formatDate(fee.start_date)}</p>
                        </div>
                        {idx === 0 && <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Active</span>}
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-800 bg-[#17181e] shrink-0 text-right">
              <button onClick={() => setHistoryModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
