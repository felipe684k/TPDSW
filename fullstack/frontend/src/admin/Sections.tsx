import { useState, useEffect } from 'react'
import { sectionService, type Section, type Classroom } from '../biz/services/section.service'
import { courseService, type Course } from '../biz/services/course.service'
import { levelService, sortLevelsByProgression, type Level } from '../biz/services/level.service'
import { academicYearService, type AcademicYear } from '../biz/services/academicYear.service'
import { classroomService } from '../biz/services/classroom.service'
import { professorService, type Professor as User } from '../biz/services/professor.service'
import Modal from '../shared/components/Modal'
import { theme } from '../shared/theme'
import { formatDateAR } from '../biz/date'

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
}

type DayKey = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'

export default function Sections() {
  const [sections, setSections] = useState<Section[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [professors, setProfessors] = useState<User[]>([])

  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all')

  const [expandedSection, setExpandedSection] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'danger' } | null>(null)

  const [formData, setFormData] = useState<{
    name: string
    id_course: string
    id_academic_year: string
    id_classroom: string
    id_professor: string
    schedules: { day: DayKey; start_time: string; end_time: string }[]
  }>({
    name: '',
    id_course: '',
    id_academic_year: '',
    id_classroom: '',
    id_professor: '',
    schedules: [{ day: 'MONDAY', start_time: '18:00', end_time: '20:00' }],
  })

  const fetchSections = async (
    level: string = selectedLevel,
    id_course: string = selectedCourse,
    id_academic_year: string = selectedAcademicYear
  ) => {
    setLoading(true)
    try {
      const data = await sectionService.getSections({
        level: level === 'all' ? undefined : level,
        id_course: id_course === 'all' ? undefined : id_course,
        id_academic_year: id_academic_year === 'all' ? undefined : id_academic_year,
      })
      setSections(data)
    } catch (error) {
      console.error('Error loading sections:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCatalogs = async () => {
    try {
      const [levelsData, coursesData, yearsData, classroomsData, professorsData] = await Promise.all([
        levelService.getLevels(),
        courseService.getCourses(),
        academicYearService.getAcademicYears(),
        classroomService.getClassrooms(),
        professorService.getProfessors(),
      ])
      setLevels(levelsData)
      setCourses(coursesData)
      setAcademicYears(yearsData)
      setClassrooms(classroomsData)
      setProfessors(professorsData)
    } catch (error) {
      console.error('Error loading catalogs:', error)
    }
  }

  useEffect(() => {
    fetchCatalogs()
    fetchSections('all', 'all', 'all')
  }, [])

  const handleLevelChange = (newLevel: string) => {
    let nextCourse = selectedCourse
    if (newLevel !== 'all' && selectedCourse !== 'all') {
      const courseObj = courses.find((c) => String(c.id_course) === selectedCourse)
      if (!courseObj || String(courseObj.level_code) !== newLevel) {
        nextCourse = 'all'
      }
    }
    setSelectedLevel(newLevel)
    setSelectedCourse(nextCourse)
    fetchSections(newLevel, nextCourse, selectedAcademicYear)
  }

  const handleCourseChange = (newCourse: string) => {
    setSelectedCourse(newCourse)
    fetchSections(selectedLevel, newCourse, selectedAcademicYear)
  }

  const handleAcademicYearChange = (newYear: string) => {
    setSelectedAcademicYear(newYear)
    fetchSections(selectedLevel, selectedCourse, newYear)
  }

  const handleClearFilters = () => {
    setSelectedLevel('all')
    setSelectedCourse('all')
    setSelectedAcademicYear('all')
    fetchSections('all', 'all', 'all')
  }

  const availableCourseOptions = selectedLevel === 'all'
    ? courses
    : courses.filter((c) => String(c.level_code) === selectedLevel)

  const handleOpenCreateModal = () => {
    setEditingId(null)
    setFormData({
      name: '',
      id_course: selectedCourse !== 'all' ? selectedCourse : '',
      id_academic_year:
        selectedAcademicYear !== 'all'
          ? selectedAcademicYear
          : academicYears[0]?.id_academic_year
            ? String(academicYears[0].id_academic_year)
            : '',
      id_classroom: '',
      id_professor: '',
      schedules: [{ day: 'MONDAY', start_time: '18:00', end_time: '20:00' }],
    })
    setModalOpen(true)
    setToast(null)
  }

  const handleOpenEditModal = (section: Section) => {
    setEditingId(section.id_section || null)
    const professorId =
      section.professors && section.professors.length > 0 && section.professors[0].id
        ? String(section.professors[0].id)
        : ''
    const schedules =
      section.schedules && section.schedules.length > 0
        ? section.schedules.map((s) => ({
            day: s.day as DayKey,
            start_time: s.start_time.slice(0, 5),
            end_time: s.end_time.slice(0, 5),
          }))
        : [{ day: 'MONDAY' as DayKey, start_time: '18:00', end_time: '20:00' }]

    setFormData({
      name: section.name || '',
      id_course: String(section.id_course),
      id_academic_year: String(section.id_academic_year),
      id_classroom: String(section.id_classroom),
      id_professor: professorId,
      schedules,
    })
    setModalOpen(true)
    setToast(null)
  }

  const handleAddSchedule = () => {
    setFormData({
      ...formData,
      schedules: [...formData.schedules, { day: 'MONDAY', start_time: '18:00', end_time: '20:00' }],
    })
  }

  const handleRemoveSchedule = (index: number) => {
    setFormData({
      ...formData,
      schedules: formData.schedules.filter((_, i) => i !== index),
    })
  }

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const updated = [...formData.schedules]
    updated[index] = { ...updated[index], [field]: value } as any
    setFormData({ ...formData, schedules: updated })
  }

  const handleToggleSectionDetail = async (sectionId: number) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null)
      return
    }
    setExpandedSection(sectionId)
    try {
      const detail = await sectionService.getSectionById(sectionId)
      setSections((prev) =>
        prev.map((sec) => (sec.id_section === sectionId ? detail : sec))
      )
    } catch (error) {
      console.error('Error fetching section detail:', error)
    }
  }

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    for (let i = 0; i < formData.schedules.length; i++) {
      const a = formData.schedules[i]
      if (a.start_time >= a.end_time) {
        setToast({
          text: `Horario inválido el día ${DAY_LABELS[a.day] || a.day}: la hora de fin debe ser posterior a la de inicio.`,
          type: 'danger',
        })
        setTimeout(() => setToast(null), 4000)
        return
      }
      for (let j = i + 1; j < formData.schedules.length; j++) {
        const b = formData.schedules[j]
        if (a.day === b.day && a.start_time < b.end_time && a.end_time > b.start_time) {
          setToast({
            text: `Los horarios cargados se superponen entre sí el día ${DAY_LABELS[a.day] || a.day} (${a.start_time.slice(0, 5)}–${a.end_time.slice(0, 5)} y ${b.start_time.slice(0, 5)}–${b.end_time.slice(0, 5)}).`,
            type: 'danger',
          })
          setTimeout(() => setToast(null), 4000)
          return
        }
      }
    }

    try {
      const payload = {
        name: formData.name,
        id_course: Number(formData.id_course),
        id_academic_year: Number(formData.id_academic_year),
        id_classroom: Number(formData.id_classroom),
        id_professor: Number(formData.id_professor),
        schedules: formData.schedules,
      }
      if (editingId) {
        await sectionService.updateSection(editingId, payload)
      } else {
        await sectionService.createSection(payload)
      }
      setModalOpen(false)
      setEditingId(null)
      setToast({
        text: editingId ? 'Comisión actualizada exitosamente' : 'Comisión creada exitosamente',
        type: 'success',
      })
      setTimeout(() => setToast(null), 3000)
      fetchSections(selectedLevel, selectedCourse, selectedAcademicYear)
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : editingId
            ? 'Error al actualizar la comisión'
            : 'Error al crear la comisión'
      setToast({ text: msg, type: 'danger' })
      setTimeout(() => setToast(null), 4000)
    }
  }

  const promptDelete = (section: Section) => {
    setSectionToDelete(section)
    setDeleteModalOpen(true)
    setToast(null)
  }

  const executeDelete = async () => {
    if (!sectionToDelete?.id_section) return
    const id = sectionToDelete.id_section
    try {
      await sectionService.deleteSection(id)
      setDeleteModalOpen(false)
      setSectionToDelete(null)
      setToast({ text: 'Comisión eliminada exitosamente', type: 'success' })
      setTimeout(() => setToast(null), 3000)
      if (expandedSection === id) setExpandedSection(null)
      fetchSections(selectedLevel, selectedCourse, selectedAcademicYear)
    } catch (error) {
      setDeleteModalOpen(false)
      setSectionToDelete(null)
      const msg = error instanceof Error ? error.message : 'Error al eliminar la comisión'
      setToast({ text: msg, type: 'danger' })
      setTimeout(() => setToast(null), 4000)
    }
  }

  const hasActiveFilters = selectedLevel !== 'all' || selectedCourse !== 'all' || selectedAcademicYear !== 'all'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Comisiones</h1>
          <p className="text-xs text-slate-500 mt-1">
            Listado general de comisiones con su aula, horarios, docente asignado y cupo disponible.
          </p>
        </div>
        <button onClick={handleOpenCreateModal} className={theme.button.primary}>
          + Nueva Comisión
        </button>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white border px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 ${
            toast.type === 'success'
              ? 'border-emerald-500/50 text-emerald-500 shadow-emerald-900/20'
              : 'border-rose-500/50 text-rose-500 shadow-rose-900/20'
          }`}
        >
          <span className="text-lg">{toast.type === 'success' ? '✅' : '❌'}</span>
          <span className="font-medium text-sm whitespace-pre-line">{toast.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Nivel Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="sectionLevelFilter" className="text-xs font-semibold text-slate-700">
              Nivel:
            </label>
            <select
              id="sectionLevelFilter"
              value={selectedLevel}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="border border-slate-200 bg-white text-slate-700 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium cursor-pointer shadow-sm"
            >
              <option value="all">Todos los niveles</option>
              {sortLevelsByProgression(levels)
                .filter((l): l is Level & { level_code: number } => l?.level_code !== undefined)
                .map((l) => (
                  <option key={l.level_code} value={l.level_code.toString()}>
                    {l.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Curso Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="sectionCourseFilter" className="text-xs font-semibold text-slate-700">
              Curso:
            </label>
            <select
              id="sectionCourseFilter"
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="border border-slate-200 bg-white text-slate-700 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium cursor-pointer shadow-sm"
            >
              <option value="all">Todos los cursos</option>
              {availableCourseOptions.map((c) => (
                <option key={c.id_course} value={String(c.id_course)}>
                  {c.course_name}
                </option>
              ))}
            </select>
          </div>

          {/* Ciclo Lectivo Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="sectionYearFilter" className="text-xs font-semibold text-slate-700">
              Ciclo Lectivo:
            </label>
            <select
              id="sectionYearFilter"
              value={selectedAcademicYear}
              onChange={(e) => handleAcademicYearChange(e.target.value)}
              className="border border-slate-200 bg-white text-slate-700 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium cursor-pointer shadow-sm"
            >
              <option value="all">Todos los ciclos</option>
              {academicYears.map((y) => (
                <option key={y.id_academic_year} value={String(y.id_academic_year)}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>
            Mostrando <strong className="text-slate-700">{sections.length}</strong>{' '}
            {sections.length === 1 ? 'comisión' : 'comisiones'}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3 max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="text-slate-500 text-sm">Cargando comisiones...</div>
        ) : sections.length === 0 ? (
          <div className="bg-white p-10 rounded-xl border border-slate-200 text-center space-y-2">
            <div className="text-2xl">📋</div>
            <p className="text-sm font-semibold text-slate-700">
              No se encontraron comisiones{hasActiveFilters ? ' con los filtros seleccionados' : ' registradas'}.
            </p>
            <p className="text-xs text-slate-400">
              Podés crear una nueva comisión con el botón superior o cambiar los filtros de búsqueda.
            </p>
          </div>
        ) : (
          sections.map((section) => {
            const isExpanded = expandedSection === section.id_section
            const professor =
              section.professors && section.professors.length > 0 ? section.professors[0] : null
            const capacity = Number(section.classroom?.capacity) || 0
            const enrolledCount =
              section.enrolled_count ??
              (section.enrollments || []).filter((e) => e.status !== 'Dado de Baja').length
            const availableSpots = section.available_spots ?? Math.max(0, capacity - enrolledCount)
            const activeEnrollments = (section.enrollments || []).filter(
              (e) => e.status !== 'Dado de Baja'
            )

            return (
              <div
                key={section.id_section}
                className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Row Header: Clickable to toggle detail panel */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleToggleSectionDetail(section.id_section!)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleToggleSectionDetail(section.id_section!)
                    }
                  }}
                  className="w-full p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer text-left focus:outline-none"
                >
                  {/* Left: Section Name, Course & Level */}
                  <div className="flex items-center gap-3 min-w-[220px]">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200 shrink-0 font-bold text-sm">
                      {section.course?.level?.name?.slice(0, 2) || '👥'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-800">{section.name}</h3>
                        {section.academic_year?.name && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            Ciclo {section.academic_year.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {section.course?.course_name || 'Curso'}
                        {section.course?.level?.name ? ` · ${section.course.level.name}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Center: Promised Columns -> Aula, Horario, Docente, Cupo Disponible */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 flex-1">
                    {/* Aula */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">
                        Aula
                      </span>
                      <span className="text-xs font-bold text-slate-700 block">
                        {section.classroom?.name || 'Sin aula'}
                      </span>
                      {capacity > 0 && (
                        <span className="text-[10px] text-slate-400">Cap. {capacity} alumnos</span>
                      )}
                    </div>

                    {/* Horario */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">
                        Horario
                      </span>
                      {section.schedules && section.schedules.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {section.schedules.map((h, i) => (
                            <span key={h.id_schedule || i} className="text-xs font-semibold text-slate-700">
                              {DAY_LABELS[h.day] || h.day} {h.start_time.slice(0, 5)}–{h.end_time.slice(0, 5)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Sin horario</span>
                      )}
                    </div>

                    {/* Docente */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">
                        Docente
                      </span>
                      <span className="text-xs font-bold text-slate-700 block">
                        {professor ? `${professor.first_name} ${professor.last_name}` : 'Sin asignar'}
                      </span>
                    </div>

                    {/* Cupo Disponible */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">
                        Cupo Disponible
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded border ${
                            availableSpots === 0
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : availableSpots <= 3
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {availableSpots} {availableSpots === 1 ? 'vacante' : 'vacantes'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({enrolledCount}/{capacity})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Expand Arrow */}
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenEditModal(section)
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2.5 py-1 rounded hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        promptDelete(section)
                      }}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-700 px-2.5 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      Eliminar
                    </button>
                    <div
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      title={isExpanded ? 'Ocultar detalle' : 'Ver detalle de la comisión'}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-indigo-600' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Detail Panel */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/60 p-6 space-y-6">
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                        <div>
                          <h4 className="text-base font-bold text-slate-800">
                            Detalle de la Comisión: {section.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Información completa de cursada, docente responsable, cupo y nómina de alumnos inscriptos.
                          </p>
                        </div>
                        {section.course?.level?.name && (
                          <span className="self-start sm:self-auto px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-full">
                            {section.course.level.name}
                          </span>
                        )}
                      </div>

                      {/* Grid with Curso, Ciclo, Aula, Docente, Horarios, Cupo */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                          <span className="text-slate-400 font-medium block mb-1">Curso y Nivel</span>
                          <span className="font-bold text-slate-800 text-sm block">
                            {section.course?.course_name || '—'}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {section.course?.level?.name || ''}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                          <span className="text-slate-400 font-medium block mb-1">Ciclo Lectivo</span>
                          <span className="font-bold text-slate-800 text-sm block">
                            {section.academic_year?.name || '—'}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                          <span className="text-slate-400 font-medium block mb-1">Aula Asignada</span>
                          <span className="font-bold text-slate-800 text-sm block">
                            {section.classroom?.name || '—'}
                          </span>
                          <span className="text-slate-500 text-xs">Capacidad total: {capacity} lugares</span>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                          <span className="text-slate-400 font-medium block mb-1">Docente Responsable</span>
                          <span className="font-bold text-slate-800 text-sm block">
                            {professor ? `${professor.first_name} ${professor.last_name}` : 'Sin asignar'}
                          </span>
                          {professor?.email && (
                            <span className="text-slate-500 text-xs">{professor.email}</span>
                          )}
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                          <span className="text-slate-400 font-medium block mb-1">Horarios de Cursada</span>
                          {section.schedules && section.schedules.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {section.schedules.map((h, i) => (
                                <span
                                  key={h.id_schedule || i}
                                  className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-xs"
                                >
                                  {DAY_LABELS[h.day] || h.day}: {h.start_time.slice(0, 5)} a {h.end_time.slice(0, 5)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Sin horarios</span>
                          )}
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                          <span className="text-slate-400 font-medium block mb-1">Estado de Cupo</span>
                          <span className="font-bold text-emerald-700 text-sm block">
                            {availableSpots} {availableSpots === 1 ? 'vacante disponible' : 'vacantes disponibles'}
                          </span>
                          <span className="text-slate-500 text-xs">
                            Inscriptos vigentes: {enrolledCount} de {capacity}
                          </span>
                        </div>
                      </div>

                      {/* Lista de Alumnos Inscriptos */}
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <span>🎓</span> Alumnos Inscriptos ({activeEnrollments.length})
                          </h5>
                        </div>

                        {activeEnrollments.length === 0 ? (
                          <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
                            No hay alumnos inscriptos vigentes en esta comisión.
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                  <th className="py-2.5 px-3 font-semibold">Alumno</th>
                                  <th className="py-2.5 px-3 font-semibold">DNI</th>
                                  <th className="py-2.5 px-3 font-semibold">Email</th>
                                  <th className="py-2.5 px-3 font-semibold">Fecha de Inscripción</th>
                                  <th className="py-2.5 px-3 font-semibold">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {activeEnrollments.map((enr) => (
                                  <tr key={enr.id_enrollment} className="hover:bg-slate-50/80">
                                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                                      {enr.user ? `${enr.user.last_name}, ${enr.user.first_name}` : '—'}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-600 font-mono">
                                      {enr.user?.dni || '—'}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-500">
                                      {enr.user?.email || '—'}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-600">
                                      {formatDateAR(enr.enrollment_date)}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        {enr.status || 'Activo'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Create / Edit Section Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingId(null)
        }}
        title={editingId ? '✏️ Editar Comisión' : '➕ Nueva Comisión'}
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setModalOpen(false)
                setEditingId(null)
              }}
              className="cursor-pointer px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="createSectionForm"
              className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all"
            >
              {editingId ? 'Guardar Cambios' : 'Validar y Guardar'}
            </button>
          </>
        }
      >
        <form id="createSectionForm" onSubmit={handleSubmitCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre de la Comisión *</label>
            <input
              type="text"
              required
              placeholder="ej. Comisión A - Turno Tarde"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-slate-300 bg-white text-slate-700 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Curso *</label>
              <select
                required
                value={formData.id_course}
                onChange={(e) => setFormData({ ...formData, id_course: e.target.value })}
                className="w-full border border-slate-300 bg-white text-slate-700 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
              >
                <option value="">-- Seleccionar Curso --</option>
                {courses.map((c) => (
                  <option key={c.id_course} value={c.id_course}>
                    {c.course_name} {c.level?.name ? `(${c.level.name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Ciclo Lectivo *</label>
              <select
                required
                value={formData.id_academic_year}
                onChange={(e) => setFormData({ ...formData, id_academic_year: e.target.value })}
                className="w-full border border-slate-300 bg-white text-slate-700 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
              >
                <option value="">-- Seleccionar Ciclo --</option>
                {academicYears.map((y) => (
                  <option key={y.id_academic_year} value={y.id_academic_year}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Aula *</label>
              <select
                required
                value={formData.id_classroom}
                onChange={(e) => setFormData({ ...formData, id_classroom: e.target.value })}
                className="w-full border border-slate-300 bg-white text-slate-700 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
              >
                <option value="">-- Seleccionar Aula --</option>
                {classrooms.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Cap: {a.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Profesor Asignado *</label>
              <select
                required
                value={formData.id_professor}
                onChange={(e) => setFormData({ ...formData, id_professor: e.target.value })}
                className="w-full border border-slate-300 bg-white text-slate-700 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
              >
                <option value="">-- Seleccionar Profesor --</option>
                {professors.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-slate-600">Horarios</span>
              <button
                type="button"
                onClick={handleAddSchedule}
                className="text-[10px] cursor-pointer bg-indigo-500/20 text-indigo-600 font-semibold px-2.5 py-1 rounded hover:bg-indigo-500/30 transition-colors"
              >
                + Agregar Día
              </button>
            </div>

            <div className="space-y-3">
              {formData.schedules.map((h, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <select
                    value={h.day}
                    onChange={(e) => handleScheduleChange(i, 'day', e.target.value)}
                    className="flex-1 border border-slate-300 bg-white text-slate-700 rounded p-2 text-xs outline-none"
                  >
                    <option value="MONDAY">Lunes</option>
                    <option value="TUESDAY">Martes</option>
                    <option value="WEDNESDAY">Miércoles</option>
                    <option value="THURSDAY">Jueves</option>
                    <option value="FRIDAY">Viernes</option>
                    <option value="SATURDAY">Sábado</option>
                  </select>
                  <input
                    type="time"
                    required
                    value={h.start_time}
                    onChange={(e) => handleScheduleChange(i, 'start_time', e.target.value)}
                    className="w-24 border border-slate-300 bg-white text-slate-700 rounded p-2 text-xs outline-none"
                  />
                  <span className="text-slate-500 text-xs">a</span>
                  <input
                    type="time"
                    required
                    value={h.end_time}
                    onChange={(e) => handleScheduleChange(i, 'end_time', e.target.value)}
                    className="w-24 border border-slate-300 bg-white text-slate-700 rounded p-2 text-xs outline-none"
                  />
                  {formData.schedules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSchedule(i)}
                      className="cursor-pointer w-7 h-7 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 rounded ml-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setSectionToDelete(null)
        }}
        isDanger={true}
        maxWidth="max-w-sm"
        footer={
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(false)
                setSectionToDelete(null)
              }}
              className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={executeDelete}
              className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Eliminar
            </button>
          </div>
        }
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-xl mx-auto mb-3">
            ⚠️
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            ¿Eliminar {sectionToDelete?.name || 'Comisión'}?
          </h3>
          <p className="text-xs text-slate-500 mb-2">
            Solo se puede eliminar una comisión si no tiene alumnos inscriptos.
          </p>
        </div>
      </Modal>
    </div>
  )
}
