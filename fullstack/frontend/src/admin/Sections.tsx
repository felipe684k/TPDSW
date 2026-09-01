import { useState, useEffect } from 'react'
import { sectionService, type Section, type Classroom } from '../services/section.service'
import { classroomService } from '../services/classroom.service'
import { academicYearService, type AcademicYear } from '../services/academicYear.service'
import { courseService, type Course } from '../services/course.service'
import { professorService, type Professor as User } from '../services/professor.service'

export default function Sections() {
  const [modalOpen, setModalOpen] = useState(false)
  
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [professors, setProfessors] = useState<User[]>([])
  
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | ''>('')
  
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{text: string, type: 'success' | 'danger'} | null>(null)
  
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)

  const [formData, setFormData] = useState<{
    id_course: string,
    id_classroom: string,
    id_professor: string,
    schedules: {day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY', start_time: string, end_time: string}[]
  }>({
    id_course: '', id_classroom: '', id_professor: '', schedules: [{day: 'MONDAY', start_time: '08:00', end_time: '10:00'}]
  })

  const fetchData = async () => {
    try {
      const [academicYearsData, classroomsData, coursesData, professorsData] = await Promise.all([
        academicYearService.getAcademicYears(),
        classroomService.getClassrooms(),
        courseService.getCourses(),
        professorService.getProfessors()
      ])
      setAcademicYears(academicYearsData)
      setClassrooms(classroomsData)
      setCourses(coursesData)
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
      setSections(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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
    
    // Validate schedules
    for (const h of formData.schedules) {
      if (h.start_time >= h.end_time) {
        setToast({ text: `Horario inválido el ${h.day}: La hora de fin debe ser posterior a la de inicio.`, type: 'danger' })
        setTimeout(() => setToast(null), 4000)
        return
      }
    }

    if (!selectedAcademicYearId) {
      setToast({ text: "Seleccione un ciclo lectivo primero", type: 'danger' })
      return
    }
    
    try {
      await sectionService.createSection({
        id_course: Number(formData.id_course),
        id_classroom: Number(formData.id_classroom),
        id_academic_year: selectedAcademicYearId,
        id_professor: formData.id_professor ? Number(formData.id_professor) : undefined,
        schedules: formData.schedules
      })
      
      setModalOpen(false)
      setToast({ text: "Comisión creada exitosamente", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      fetchSections(selectedAcademicYearId as number)
      
      // Reset form
      setFormData({ id_course: '', id_classroom: '', id_professor: '', schedules: [{day: 'MONDAY', start_time: '08:00', end_time: '10:00'}] })
    } catch (error: any) {
      setToast({ text: error.message || "Error al crear la comisión", type: 'danger' })
      setTimeout(() => setToast(null), 4000)
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Comisiones y Horarios</h1>
          <p className="text-xs text-slate-500 mt-1">Gestión de aulas, superposición de horarios y asignación de profesores.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={selectedAcademicYearId} 
            onChange={handleAcademicYearChange}
            className="border border-slate-700 bg-[#17181e] text-slate-200 rounded p-2 text-xs outline-none focus:border-indigo-500 min-w-[200px]"
          >
            {academicYears.length === 0 && <option value="">Sin ciclos lectivos...</option>}
            {academicYears.map(c => (
              <option key={c.id_academic_year} value={c.id_academic_year}>{c.name}</option>
            ))}
          </select>
          <button 
            onClick={() => {
              if(!selectedAcademicYearId) { setToast({text:'Debe seleccionar o crear un ciclo lectivo primero', type:'danger'}); return; }
              setModalOpen(true)
            }} 
            className="cursor-pointer whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
          >
            ➕ Crear Comisión
          </button>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] bg-[#1c1d24] border px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          toast.type === 'success' ? 'border-emerald-500/50 text-emerald-400' : 'border-rose-500/50 text-rose-400'
        }`}>
          <span className="text-lg">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="font-medium text-sm whitespace-pre-line">{toast.text}</span>
        </div>
      )}

      {/* Accordion grouped by Course */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-slate-400 text-sm">Cargando comisiones...</div>
        ) : courses.length === 0 ? (
          <div className="text-slate-500 text-sm bg-[#1c1d24] p-8 rounded-xl border border-slate-800 text-center">
            No hay cursos para mostrar.
          </div>
        ) : (
          courses.map(course => {
            const courseSections = (sections || []).filter(c => c.id_course === course.id_course);
            const isExpanded = expandedCourse === course.id_course;

            return (
              <div key={course.id_course} className="bg-[#1c1d24] rounded-xl border border-slate-800 shadow-sm overflow-hidden transition-all">
                {/* Course Header Button */}
                <button 
                  onClick={() => setExpandedCourse(isExpanded ? null : course.id_course!)}
                  className="w-full p-4 flex justify-between items-center bg-[#1c1d24] hover:bg-[#17181e] transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-950/50 flex items-center justify-center text-indigo-400 border border-indigo-900/30">
                      {isExpanded ? '📂' : '📁'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-100">{course.course_name}</h3>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-950/30 text-indigo-400 text-[10px] font-semibold">
                          {course.level?.name || `Nivel ${course.level_code}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {courseSections.length} {courseSections.length === 1 ? 'comisión registrada' : 'comisiones registradas'}
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-500 font-mono text-sm bg-slate-900 w-8 h-8 rounded flex items-center justify-center">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </button>

                {/* Expandable Content */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/60 bg-[#17181e]/30">
                    {courseSections.length === 0 ? (
                      <div className="text-center p-6 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                        Aún no hay comisiones creadas para este curso en este ciclo lectivo.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {courseSections.map((section) => (
                          <div key={section.id_section} className="bg-[#1c1d24] p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col hover:border-indigo-500/30 transition-colors">
                            
                            <div className="flex justify-between items-start border-b border-slate-800/60 pb-3 mb-3">
                              <div>
                                <h3 className="text-sm font-bold text-slate-100">{section.name}</h3>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <span className="text-[10px] text-slate-400 block">👨‍🏫 Profesor Responsable</span>
                                <span className="text-xs font-semibold text-slate-300">
                                  {section.professors && section.professors.length > 0 
                                    ? `${section.professors[0].first_name} ${section.professors[0].last_name}` 
                                    : 'Sin Asignar'}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] text-slate-400 block">🏫 Aula</span>
                                  <span className="text-xs font-semibold text-slate-300">{section.classroom?.name || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block">⏰ Horarios</span>
                                  <div className="flex flex-col gap-0.5 mt-0.5">
                                    {section.schedules && section.schedules.map(h => (
                                      <span key={h.id_schedule} className="text-[10px] font-semibold text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded">
                                        {h.day.substring(0,3)}: {h.start_time.substring(0,5)} a {h.end_time.substring(0,5)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-end gap-3">
                              <button onClick={() => handleDelete(section.id_section!)} className="text-rose-500 hover:text-rose-400 font-semibold text-[10px] cursor-pointer">Desactivar</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto z-50">
          <div className="bg-[#1c1d24] rounded-xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden my-auto border border-slate-800">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#17181e]">
              <h3 className="text-sm font-bold text-slate-100">Nueva Comisión</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Curso *</label>
                  <select required value={formData.id_course} onChange={e => setFormData({...formData, id_course: e.target.value})} className="w-full border border-slate-700 bg-[#17181e] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500">
                    <option value="">-- Seleccionar --</option>
                    {courses.map(c => <option key={c.id_course} value={c.id_course}>{c.course_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Aula *</label>
                  <select required value={formData.id_classroom} onChange={e => setFormData({...formData, id_classroom: e.target.value})} className="w-full border border-slate-700 bg-[#17181e] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500">
                    <option value="">-- Seleccionar --</option>
                    {classrooms.map(a => <option key={a.id} value={a.id}>{a.name} (Cap: {a.capacity})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Profesor Asignado *</label>
                <select required value={formData.id_professor} onChange={e => setFormData({...formData, id_professor: e.target.value})} className="w-full border border-slate-700 bg-[#17181e] text-slate-200 rounded p-2.5 text-xs outline-none focus:border-indigo-500">
                  <option value="">-- Seleccionar --</option>
                  {professors.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
              </div>

              <div className="border border-slate-800 rounded-lg p-4 bg-[#17181e]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-300">Horarios</span>
                  <button type="button" onClick={handleAddSchedule} className="text-[10px] cursor-pointer bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded hover:bg-indigo-500/30 transition-colors">
                    + Agregar Día
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.schedules.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={h.day} onChange={e => handleScheduleChange(i, 'day', e.target.value)} className="flex-1 border border-slate-700 bg-[#1c1d24] text-slate-200 rounded p-2 text-xs outline-none">
                        <option value="MONDAY">Lunes</option>
                        <option value="TUESDAY">Martes</option>
                        <option value="WEDNESDAY">Miércoles</option>
                        <option value="THURSDAY">Jueves</option>
                        <option value="FRIDAY">Viernes</option>
                        <option value="SATURDAY">Sábado</option>
                      </select>
                      <input type="time" required value={h.start_time} onChange={e => handleScheduleChange(i, 'start_time', e.target.value)} className="w-24 border border-slate-700 bg-[#1c1d24] text-slate-200 rounded p-2 text-xs outline-none" />
                      <span className="text-slate-500">a</span>
                      <input type="time" required value={h.end_time} onChange={e => handleScheduleChange(i, 'end_time', e.target.value)} className="w-24 border border-slate-700 bg-[#1c1d24] text-slate-200 rounded p-2 text-xs outline-none" />
                      
                      {formData.schedules.length > 1 && (
                        <button type="button" onClick={() => handleRemoveSchedule(i)} className="cursor-pointer w-7 h-7 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 rounded ml-1">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-3 py-2 border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 rounded text-xs font-medium cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium cursor-pointer">Validar y Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
