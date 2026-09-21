import { useState, useEffect } from 'react'
import { sectionService, type Section, type Classroom } from '../../services/section.service'
import { classroomService } from '../../services/classroom.service'
import { academicYearService, type AcademicYear } from '../../services/academicYear.service'
import { professorService, type Professor as User } from '../../services/professor.service'

interface CourseSectionsProps {
  courseId: number;
}

export default function CourseSections({ courseId }: CourseSectionsProps) {
  const [modalOpen, setModalOpen] = useState(false)
  
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [professors, setProfessors] = useState<User[]>([])
  
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | ''>('')
  
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{text: string, type: 'success' | 'danger'} | null>(null)
  
  const [formData, setFormData] = useState<{
    id_classroom: string,
    id_professor: string,
    schedules: {day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY', start_time: string, end_time: string}[]
  }>({
    id_classroom: '', id_professor: '', schedules: [{day: 'MONDAY', start_time: '08:00', end_time: '10:00'}]
  })

  const fetchData = async () => {
    try {
      const [academicYearsData, classroomsData, professorsData] = await Promise.all([
        academicYearService.getAcademicYears(),
        classroomService.getClassrooms(),
        professorService.getProfessors()
      ])
      setAcademicYears(academicYearsData)
      setClassrooms(classroomsData)
      setProfessors(professorsData)
      
      if (academicYearsData.length > 0) {
        setSelectedAcademicYearId(academicYearsData[0].id_academic_year!)
        fetchSections(academicYearsData[0].id_academic_year!)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchSections = async (id_academic_year: number) => {
    setLoading(true)
    try {
      const data = await sectionService.getSections(id_academic_year)
      setSections(data.filter(s => s.id_course === courseId))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [courseId])

  const handleAcademicYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    setSelectedAcademicYearId(id)
    fetchSections(id)
  }

  const handleAddSchedule = () => {
    setFormData({
      ...formData,
      schedules: [...formData.schedules, { day: 'MONDAY', start_time: '08:00', end_time: '10:00' }]
    })
  }

  const handleRemoveSchedule = (index: number) => {
    setFormData({
      ...formData,
      schedules: formData.schedules.filter((_, i) => i !== index)
    })
  }

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedules = [...formData.schedules]
    newSchedules[index] = { ...newSchedules[index], [field]: value }
    setFormData({ ...formData, schedules: newSchedules as any })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAcademicYearId) {
      setToast({ text: "Seleccione un ciclo lectivo", type: 'danger' })
      setTimeout(() => setToast(null), 3000)
      return
    }

    try {
      await sectionService.createSection({
        id_course: courseId,
        id_academic_year: Number(selectedAcademicYearId),
        id_classroom: Number(formData.id_classroom),
        id_professor: Number(formData.id_professor),
        schedules: formData.schedules
      })
      
      setToast({ text: "Comisión registrada exitosamente", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      setModalOpen(false)
      fetchSections(Number(selectedAcademicYearId))
      setFormData({
        id_classroom: '', id_professor: '', schedules: [{day: 'MONDAY', start_time: '08:00', end_time: '10:00'}]
      })
    } catch (error) {
      console.error(error)
      setToast({ text: "Error al registrar la comisión", type: 'danger' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro que deseas eliminar esta comisión?')) return;
    try {
      await sectionService.deleteSection(id)
      setToast({ text: "Comisión eliminada", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      if (selectedAcademicYearId) fetchSections(selectedAcademicYearId as number)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-700">Comisiones del Curso</h3>
        <div className="flex gap-2">
          <select 
            value={selectedAcademicYearId} 
            onChange={handleAcademicYearChange}
            className="border border-slate-300 bg-white text-slate-700 rounded p-1.5 text-xs outline-none focus:border-indigo-500"
          >
            {academicYears.length === 0 && <option value="">Sin ciclos...</option>}
            {academicYears.map(c => (
              <option key={c.id_academic_year} value={c.id_academic_year}>{c.name}</option>
            ))}
          </select>
          <button 
            onClick={() => {
              if(!selectedAcademicYearId) { setToast({text:'Debe seleccionar un ciclo lectivo', type:'danger'}); return; }
              setModalOpen(true)
            }} 
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all"
          >
            ➕ Añadir Comisión
          </button>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] bg-white border px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          toast.type === 'success' ? 'border-emerald-500/50 text-emerald-400' : 'border-rose-500/50 text-rose-400'
        }`}>
          <span className="text-lg">{toast.type === 'success' ? '✅' : '❌'}</span>
          <span className="font-medium text-sm whitespace-pre-line">{toast.text}</span>
        </div>
      )}

      {loading ? (
        <div className="text-slate-500 text-xs">Cargando comisiones...</div>
      ) : sections.length === 0 ? (
        <div className="text-center p-6 text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
          Aún no hay comisiones creadas para este curso en este ciclo lectivo.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <div key={section.id_section} className="bg-slate-50 p-4 rounded-lg border border-slate-300 shadow-sm flex flex-col">
              <div className="flex justify-between items-start border-b border-slate-300 pb-2 mb-2">
                <h3 className="text-sm font-bold text-slate-800">{section.name}</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Profesor Responsable</span>
                  <span className="text-xs font-semibold text-slate-600">
                    {section.professors && section.professors.length > 0 
                      ? `${section.professors[0].first_name} ${section.professors[0].last_name}` 
                      : 'Sin Asignar'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Aula</span>
                    <span className="text-xs font-semibold text-slate-600">{section.classroom?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Horarios</span>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {section.schedules && section.schedules.map(h => (
                        <span key={h.id_schedule} className="text-[10px] font-semibold text-slate-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                          {h.day.substring(0,3)}: {h.start_time.substring(0,5)} a {h.end_time.substring(0,5)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-300 flex justify-end">
                <button onClick={() => handleDelete(section.id_section!)} className="text-rose-500 hover:text-rose-400 font-semibold text-[10px] cursor-pointer">Desactivar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden my-auto border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Nueva Comisión</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Aula *</label>
                  <select required value={formData.id_classroom} onChange={e => setFormData({...formData, id_classroom: e.target.value})} className="w-full border border-slate-300 bg-slate-50 text-slate-700 rounded p-2.5 text-xs outline-none focus:border-indigo-500">
                    <option value="">-- Seleccionar --</option>
                    {classrooms.map(a => <option key={a.id} value={a.id}>{a.name} (Cap: {a.capacity})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Profesor Asignado *</label>
                  <select required value={formData.id_professor} onChange={e => setFormData({...formData, id_professor: e.target.value})} className="w-full border border-slate-300 bg-slate-50 text-slate-700 rounded p-2.5 text-xs outline-none focus:border-indigo-500">
                    <option value="">-- Seleccionar --</option>
                    {professors.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-600">Horarios</span>
                  <button type="button" onClick={handleAddSchedule} className="text-[10px] cursor-pointer bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded hover:bg-indigo-500/30 transition-colors">
                    + Agregar Día
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.schedules.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={h.day} onChange={e => handleScheduleChange(i, 'day', e.target.value)} className="flex-1 border border-slate-300 bg-white text-slate-700 rounded p-2 text-xs outline-none">
                        <option value="MONDAY">Lunes</option>
                        <option value="TUESDAY">Martes</option>
                        <option value="WEDNESDAY">Miércoles</option>
                        <option value="THURSDAY">Jueves</option>
                        <option value="FRIDAY">Viernes</option>
                        <option value="SATURDAY">Sábado</option>
                      </select>
                      <input type="time" required value={h.start_time} onChange={e => handleScheduleChange(i, 'start_time', e.target.value)} className="w-24 border border-slate-300 bg-white text-slate-700 rounded p-2 text-xs outline-none" />
                      <span className="text-slate-500">a</span>
                      <input type="time" required value={h.end_time} onChange={e => handleScheduleChange(i, 'end_time', e.target.value)} className="w-24 border border-slate-300 bg-white text-slate-700 rounded p-2 text-xs outline-none" />
                      
                      {formData.schedules.length > 1 && (
                        <button type="button" onClick={() => handleRemoveSchedule(i)} className="cursor-pointer w-7 h-7 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 rounded ml-1">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-3 py-2 border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-700 rounded text-xs font-medium cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium cursor-pointer">Validar y Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
