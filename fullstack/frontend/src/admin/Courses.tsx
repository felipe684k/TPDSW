import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { courseService, type Course } from '../biz/services/course.service'
import { levelService, sortLevelsByProgression, type Level } from '../biz/services/level.service'
import { tuitionFeeService } from '../biz/services/tuitionFee.service'
import Modal from '../shared/components/Modal'
import FormInput from '../shared/components/FormInput'
import FormSelect from '../shared/components/FormSelect'
import CourseSections from './Courses/CourseSections'
import { theme } from '../shared/theme'
import { formatDateAR } from '../biz/date'
import { formatMoney } from '../biz/money'

export default function Courses() {
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [updateTuitionFeeModalOpen, setUpdateTuitionFeeModalOpen] = useState(false)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  
  const [courses, setCourses] = useState<Course[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  
  const [editingId, setEditingId] = useState<number | null>(null)
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [newTuitionFeeAmount, setNewTuitionFeeAmount] = useState('')
  
  const [toast, setToast] = useState<{text: string, type: 'success' | 'danger'} | null>(null)
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all')

  const [formData, setFormData] = useState({
    course_name: '',
    level_code: '',
    registration_fee: '',
    initial_tuition_fee: '',
    weekly_hours: ''
  })

  const fetchCourses = async (level: string = selectedLevelFilter) => {
    setLoading(true)
    try {
      const data = await courseService.getCourses(level === 'all' ? undefined : level)
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
    fetchCourses('all')
    fetchLevels()
  }, [])

  const handleLevelFilterChange = (levelValue: string) => {
    setSelectedLevelFilter(levelValue)
    fetchCourses(levelValue)
  }

  const handleOpenModalCreate = () => {
    setEditingId(null)
    setFormData({ course_name: '', level_code: '', registration_fee: '', initial_tuition_fee: '', weekly_hours: '' })
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
      registration_fee: course.registration_fee.toString(), 
      initial_tuition_fee: lastTuitionFee.toString(),
      weekly_hours: course.weekly_hours != null && course.weekly_hours !== '' ? Number(course.weekly_hours).toString() : ''
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
        registration_fee: Number(formData.registration_fee),
        initial_tuition_fee: Number(formData.initial_tuition_fee),
        weekly_hours: formData.weekly_hours !== '' ? Number(formData.weekly_hours) : null
      }

      if (editingId) {
        await courseService.updateCourse(editingId, dataToSave)
      } else {
        await courseService.createCourse(dataToSave)
      }
      
      setModalOpen(false)
      setToast({ text: editingId ? "Curso actualizado exitosamente" : "Curso registrado exitosamente", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      
      fetchCourses(selectedLevelFilter)
    } catch (error) {
      console.error('Error saving course', error)
      setToast({ text: error instanceof Error ? error.message : 'Error al guardar el curso', type: 'danger' })
      setTimeout(() => setToast(null), 4000)
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
      setToast({ text: "Curso desactivado exitosamente", type: 'danger' })
      setTimeout(() => setToast(null), 3000)
      fetchCourses(selectedLevelFilter)
      setDeleteModalOpen(false)
      setCourseToDelete(null)
    } catch (error) {
      console.error(error)
      setDeleteModalOpen(false)
      setCourseToDelete(null)
      const msg = error instanceof Error ? error.message : 'Error al desactivar el curso'
      setToast({ text: msg, type: 'danger' })
      setTimeout(() => setToast(null), 4000)
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
      setToast({ text: "Cuota actualizada", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      fetchCourses(selectedLevelFilter)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Cursos</h1>
          <p className="text-xs text-slate-500 mt-1">Gestión del catálogo de cursos y sus tarifas.</p>
        </div>
        <button 
          onClick={handleOpenModalCreate} 
          className={theme.button.primary}
        >
          + Registrar Curso 
        </button>
      </div>

      {toast && createPortal(
        <div className={`fixed bottom-6 right-6 z-[200] bg-white border px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          toast.type === 'success' 
            ? 'border-emerald-500/50 text-emerald-600 shadow-emerald-900/20' 
            : 'border-rose-500/50 text-rose-600 shadow-rose-900/20'
        }`}>
          <span className="text-lg">{toast.type === 'success' ? '✅' : '🗑️'}</span>
          <span className="font-medium text-sm tracking-wide">{toast.text}</span>
        </div>,
        document.body
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label htmlFor="levelFilter" className="text-xs font-semibold text-slate-700">
            Filtrar por Nivel:
          </label>
          <select
            id="levelFilter"
            value={selectedLevelFilter}
            onChange={(e) => handleLevelFilterChange(e.target.value)}
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

        <div className="text-xs text-slate-500">
          Mostrando <span className="font-semibold text-slate-700">{courses.length}</span> {courses.length === 1 ? 'curso' : 'cursos'}
          {selectedLevelFilter !== 'all' && (
            <button
              onClick={() => handleLevelFilterChange('all')}
              className="ml-2 text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
            >
              Limpiar filtro
            </button>
          )}
        </div>
      </div>

      {/* Courses list by level */}
      <div className="flex flex-col max-w-6xl mx-auto gap-8 w-full">
        {loading ? (
          <div className="text-slate-500 text-sm">Cargando cursos...</div>
        ) : courses.length === 0 ? (
          <div className="text-slate-500 text-sm bg-white p-8 rounded-xl border border-slate-200 text-center">
            No se encontraron cursos {selectedLevelFilter !== 'all' ? 'para el nivel seleccionado' : 'registrados'}.
          </div>
        ) : (
          (() => {
            return sortLevelsByProgression(levels).map(level => {
              const levelCourses = courses.filter(c => c.level_code === level?.level_code);
              if (levelCourses.length === 0) return null;

              return (
                <div key={level?.level_code} className="space-y-4">
                  {/* Level Header */}
                  <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                    <span className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {level.name.charAt(0).toUpperCase()}
                    </span>
                    <h2 className="text-lg font-bold text-slate-700">{level.name}</h2>
                    <span className="text-xs text-slate-400 font-normal">({levelCourses.length} {levelCourses.length === 1 ? 'curso' : 'cursos'})</span>
                  </div>

                  {/* Level Course Cards */}
                  <div className="space-y-3">
                    {levelCourses.map((course) => {
                      const sortedFees = course.tuition_fees ? [...course.tuition_fees].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()) : []
                      const activeFee = sortedFees.length > 0 ? sortedFees[sortedFees.length - 1] : null;
                      const isExpanded = expandedCourse === course.id_course;
                      
                      return (
                        <div key={course.id_course} className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                          {/* Card Header (Clickable: opens/closes detail) */}
                          <div 
                            role="button"
                            tabIndex={0}
                            onClick={() => setExpandedCourse(isExpanded ? null : course.id_course!)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setExpandedCourse(isExpanded ? null : course.id_course!);
                              }
                            }}
                            className="w-full p-5 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer text-left focus:outline-none"
                          >
                            {/* Left: Icon and Course Name */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 border border-amber-200 shrink-0">
                                {isExpanded ? '📂' : '📁'}
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-slate-800">{course.course_name}</h3>
                                <span className="text-[11px] text-slate-400 font-normal">
                                  {isExpanded ? 'Ocultar panel de detalle' : 'Tocar para ver detalle y comisiones'}
                                </span>
                              </div>
                            </div>

                            {/* Center: Carga Horaria & Costos (Matrícula y Cuota Mensual) */}
                            <div className="flex flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 bg-slate-50 px-5 py-3 rounded-xl border border-slate-200">
                              {/* Carga Horaria */}
                              <div className="text-center">
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Carga Horaria</span>
                                <span className="text-sm font-bold text-slate-700 font-mono">
                                  {course.weekly_hours != null && course.weekly_hours !== '' ? `${Number(course.weekly_hours)} hs/sem` : '—'}
                                </span>
                              </div>

                              <div className="h-8 w-px bg-slate-200"></div>

                              {/* Matrícula */}
                              <div className="text-center">
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">Matrícula</span>
                                <span className="text-sm font-bold text-slate-700 font-mono">
                                  {formatMoney(Number(course.registration_fee))}
                                </span>
                              </div>

                              <div className="h-8 w-px bg-slate-200"></div>

                              {/* Cuota Mensual */}
                              <div className="text-center">
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-0.5">Cuota Mensual</span>
                                {activeFee ? (
                                  <div>
                                    <span className="text-sm font-bold text-emerald-600 font-mono">
                                      {formatMoney(Number(activeFee.monthly_cost))}
                                    </span>
                                    <div className="flex items-center justify-center gap-1.5 mt-1">
                                      <div 
                                        onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); setNewTuitionFeeAmount(''); setUpdateTuitionFeeModalOpen(true); }}
                                        className="cursor-pointer text-[10px] font-medium bg-emerald-100/70 hover:bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 transition-colors"
                                        title="Actualizar valor de la cuota mensual"
                                      >
                                        ✏️ Actualizar
                                      </div>
                                      <div 
                                        onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); setHistoryModalOpen(true); }}
                                        className="cursor-pointer text-[10px] font-medium bg-white hover:bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                                        title="Ver historial de valores de la cuota"
                                      >
                                        📜 Historial
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 block font-medium">Sin cuota</span>
                                )}
                              </div>
                            </div>

                            {/* Right: Actions for the Course */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleEdit(course); }} 
                                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                >
                                  Editar
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); promptDelete(course.id_course!); }} 
                                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                                >
                                  Desactivar
                                </button>
                              </div>

                              {/* Flecha para expandir/colapsar panel de detalle */}
                              <div 
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                                title={isExpanded ? 'Ocultar panel de detalle' : 'Ver detalle del curso'}
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-indigo-600' : ''}`} 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Content: Panel de Detalle */}
                          {isExpanded && (
                            <div className="border-t border-slate-200 bg-slate-50/50 p-6 space-y-6">
                              {/* Panel de Detalle: Nivel, Matrícula, Cuota Vigente, Carga Horaria e Historial */}
                              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
                                  <div>
                                    <h4 className="text-base font-bold text-slate-800">Detalle del Curso: {course.course_name}</h4>
                                    <p className="text-xs text-slate-500">Información académica, aranceles e historial de cuotas.</p>
                                  </div>
                                  <span className="self-start sm:self-auto px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-full">
                                    {course.level?.name || level.name}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="text-slate-400 font-medium block mb-1">Nivel</span>
                                    <span className="font-semibold text-slate-700 text-sm">{course.level?.name || level.name}</span>
                                  </div>
                                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="text-slate-400 font-medium block mb-1">Carga Horaria</span>
                                    <span className="font-semibold text-slate-700 text-sm">
                                      {course.weekly_hours != null && course.weekly_hours !== '' ? `${Number(course.weekly_hours)} hs semanales` : 'Sin dato'}
                                    </span>
                                  </div>
                                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="text-slate-400 font-medium block mb-1">Matrícula</span>
                                    <span className="font-semibold text-slate-700 text-sm font-mono">
                                      {formatMoney(Number(course.registration_fee))}
                                    </span>
                                  </div>
                                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="text-slate-400 font-medium block mb-1">Cuota Vigente</span>
                                    <span className="font-semibold text-emerald-600 text-sm font-mono">
                                      {activeFee ? formatMoney(Number(activeFee.monthly_cost)) : 'Sin cuota'}
                                    </span>
                                  </div>
                                </div>

                                {/* Historial de Cuotas */}
                                <div className="mt-5 pt-4 border-t border-slate-100">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                      <span>📜</span> Historial de Cuotas
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => { setSelectedCourse(course); setNewTuitionFeeAmount(''); setUpdateTuitionFeeModalOpen(true); }}
                                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200 transition-colors cursor-pointer"
                                    >
                                      + Actualizar Cuota
                                    </button>
                                  </div>

                                  {sortedFees.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No hay historial registrado.</p>
                                  ) : (
                                    <div className="flex flex-wrap gap-2">
                                      {[...sortedFees].reverse().map((fee, idx) => (
                                        <div 
                                          key={fee.id_tuition_fee || idx}
                                          className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
                                            idx === 0 
                                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' 
                                              : 'bg-white border-slate-200 text-slate-600'
                                          }`}
                                        >
                                          <span className="font-mono">{formatMoney(Number(fee.monthly_cost))}</span>
                                          <span className="text-[11px] text-slate-400 font-normal">
                                            (desde {formatDateAR(fee.start_date)})
                                          </span>
                                          {idx === 0 && (
                                            <span className="text-[9px] bg-emerald-600 text-white uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">
                                              Vigente
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Comisiones del Curso */}
                              <div>
                                <div className="mb-3">
                                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <span>👥</span> Comisiones del Curso
                                  </h4>
                                  <p className="text-xs text-slate-500">Gestión de comisiones, aulas y horarios asignados a este curso.</p>
                                </div>
                                <CourseSections courseId={course.id_course!} />
                              </div>
                            </div>
                          )}
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? '🏫 Editar Curso' : '🏫 Registrar Nuevo Curso'}
        maxWidth="max-w-lg"
        footer={
          <>
            <button 
              type="button" onClick={() => setModalOpen(false)}
              className="cursor-pointer px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" form="courseForm"
              className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all"
            >
              {editingId ? 'Guardar Cambios' : 'Guardar Curso'}
            </button>
          </>
        }
      >
        <form id="courseForm" onSubmit={handleSubmit} className="space-y-4">
          <FormInput 
            label="Nombre del Curso *"
            type="text" required placeholder="ej. Kids 1" 
            value={formData.course_name}
            onChange={e => setFormData({...formData, course_name: e.target.value})}
          />
          
          <FormSelect
            label="Nivel *"
            required 
            value={formData.level_code}
            onChange={e => setFormData({...formData, level_code: e.target.value})}
            options={[
              { value: '', label: '— Elegir Nivel —' },
              ...levels.map(l => ({ value: l?.level_code?.toString() || '', label: l.name }))
            ]}
          />

          <FormInput 
            label="Carga Horaria Semanal (horas)"
            type="number" 
            placeholder="ej. 4 (entre 0.5 y 60)" 
            min="0.5" 
            max="60" 
            step="0.5"
            value={formData.weekly_hours}
            onChange={e => setFormData({...formData, weekly_hours: e.target.value})}
          />

          <FormInput 
            label="Matrícula ($) *"
            type="number" required placeholder="10000" min="0" step="0.01"
            value={formData.registration_fee}
            onChange={e => setFormData({...formData, registration_fee: e.target.value})}
          />

          {!editingId && (
            <div className="flex flex-col gap-1.5 pt-3 mt-2 border-t border-slate-200">
              <label className="text-xs font-semibold text-indigo-400">Cuota Mensual Inicial ($) *</label>
              <input 
                type="number" required placeholder="15000" min="0" step="0.01"
                value={formData.initial_tuition_fee}
                onChange={e => setFormData({...formData, initial_tuition_fee: e.target.value})}
                className="border border-indigo-500/30 rounded p-2.5 text-xs bg-white text-slate-700 outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500">
                Este valor será la cuota activa al crear el curso. Las actualizaciones de precio futuras pueden hacerse desde las acciones del curso.
              </span>
            </div>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        isDanger={true}
        maxWidth="max-w-sm"
        footer={
          <div className="flex gap-2 w-full">
            <button 
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              onClick={executeDelete}
              className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium transition-colors cursor-pointer"
            >
              Desactivar
            </button>
          </div>
        }
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-xl mx-auto mb-3">
            ⚠️
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">¿Desactivar {courses.find(c => c.id_course === courseToDelete)?.course_name || 'Curso'}?</h3>
          <p className="text-xs text-slate-500 mb-2">¿Estás seguro que deseas desactivar este curso? Quedará oculto de las listas activas.</p>
        </div>
      </Modal>

      <Modal
        isOpen={updateTuitionFeeModalOpen}
        onClose={() => setUpdateTuitionFeeModalOpen(false)}
        title="Actualizar Cuota"
        maxWidth="max-w-sm"
        footer={
          <>
            <button type="button" onClick={() => setUpdateTuitionFeeModalOpen(false)} className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium">Cancelar</button>
            <button type="submit" form="tuitionFeeForm" className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium">Guardar Cuota</button>
          </>
        }
      >
        <form id="tuitionFeeForm" onSubmit={handleUpdateTuitionFee} className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Curso</p>
            <p className="text-sm font-medium text-slate-700">{selectedCourse?.course_name}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Nuevo Costo Mensual ($)</label>
            <input 
              type="number" required placeholder="ej. 18000" min="0" step="0.01"
              value={newTuitionFeeAmount} onChange={e => setNewTuitionFeeAmount(e.target.value)}
              className="w-full border border-slate-200 bg-white text-slate-700 rounded p-2 text-sm outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">La fecha de inicio se registrará automáticamente con la fecha y hora actual.</p>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Historial de Cuotas"
        maxWidth="max-w-md"
        footer={
          <button onClick={() => setHistoryModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium w-full text-right">Cerrar</button>
        }
      >
        <div>
          {selectedCourse && (
            <p className="text-xs text-slate-500 mb-4">{selectedCourse.course_name}</p>
          )}
          {(!selectedCourse?.tuition_fees || selectedCourse.tuition_fees.length === 0) ? (
            <p className="text-sm text-slate-500 text-center py-4">No hay historial de cuotas para este curso.</p>
          ) : (
            <div className="space-y-3">
              {[...selectedCourse.tuition_fees]
                .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                .map((fee, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div>
                      <p className="text-sm font-bold text-emerald-600">{formatMoney(Number(fee.monthly_cost))}</p>
                      <p className="text-xs text-slate-500">Desde: {formatDateAR(fee.start_date)}</p>
                    </div>
                    {idx === 0 && <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded">Activa</span>}
                  </div>
                ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
