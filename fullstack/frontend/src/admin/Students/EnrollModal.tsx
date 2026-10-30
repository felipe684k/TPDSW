import { useState, useEffect } from 'react'
import { sectionService, type Section } from '../../biz/services/section.service'
import { academicYearService, type AcademicYear } from '../../biz/services/academicYear.service'
import { enrollmentService } from '../../biz/services/enrollment.service'
import { levelService, type Level } from '../../biz/services/level.service'
import type { Student } from '../../biz/services/student.service'
import Modal from '../../shared/components/Modal'

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentId: number | null;
  student?: Student | null;
  onSuccess: () => void;
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lun',
  TUESDAY: 'Mar',
  WEDNESDAY: 'Mié',
  THURSDAY: 'Jue',
  FRIDAY: 'Vie',
  SATURDAY: 'Sáb'
}

const PAYMENT_METHODS = [
  { id: 'Efectivo', label: 'Efectivo', icon: '💵' },
  { id: 'Transferencia Bancaria', label: 'Transferencia', icon: '🏦' },
  { id: 'Tarjeta de Crédito', label: 'Tarjeta', icon: '💳' }
]

export default function EnrollModal({ isOpen, onClose, studentId, student, onSuccess }: Props) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [levels, setLevels] = useState<Level[]>([])

  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | ''>('')
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('')
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('Efectivo')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchInitialData()
    } else {
      setSelectedAcademicYearId('')
      setSelectedCourseId('')
      setSelectedSectionId('')
      setPaymentMethod('Efectivo')
    }
  }, [isOpen])

  const fetchInitialData = async () => {
    try {
      const [ayData, levelsData] = await Promise.all([
        academicYearService.getAcademicYears(),
        levelService.getLevels()
      ])
      setAcademicYears(ayData)
      setLevels(levelsData)
      if (ayData.length > 0) {
        setSelectedAcademicYearId(ayData[0].id_academic_year!)
        fetchSections(ayData[0].id_academic_year!)
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

  const handleAcademicYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    setSelectedAcademicYearId(id)
    setSelectedCourseId('')
    setSelectedSectionId('')
    fetchSections(id)
  }

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(Number(e.target.value))
    setSelectedSectionId('')
  }

  // Determinar el nivel actual del alumno y el único nivel siguiente al que puede inscribirse
  const studentCurrentLevel: Level | null = (() => {
    if (!student?.level_code || levels.length === 0) return null
    return levels.find(l => Number(l.level_code) === Number(student.level_code)) || null
  })()

  const allowedLevel: Level | null = (() => {
    if (levels.length === 0) return null
    if (!studentCurrentLevel) {
      const referencedNext = new Set(levels.map(l => l.next_level_code).filter(Boolean))
      return levels.find(l => !referencedNext.has(l.level_code)) || levels[0]
    }
    if (!studentCurrentLevel.next_level_code) {
      return null
    }
    return levels.find(l => Number(l.level_code) === Number(studentCurrentLevel.next_level_code)) || null
  })()

  const eligibleSections = sections.filter(s => {
    if (!s.course || !allowedLevel) return false
    return Number(s.course.level_code) === Number(allowedLevel.level_code)
  })

  const availableCourses = Array.from(
    new Map(eligibleSections.map(s => [s.course!.id_course, s.course])).values()
  )
  const availableSections = eligibleSections.filter(s => s.id_course === selectedCourseId)
  const selectedCourse = availableCourses.find(c => c?.id_course === selectedCourseId)

  // Auto-seleccionar curso y comisión cuando solo hay una opción disponible
  useEffect(() => {
    if (availableCourses.length === 1 && availableCourses[0]?.id_course) {
      setSelectedCourseId(availableCourses[0].id_course)
    }
  }, [sections, allowedLevel?.level_code])

  useEffect(() => {
    if (availableSections.length === 1 && availableSections[0]?.id_section) {
      setSelectedSectionId(availableSections[0].id_section)
    }
  }, [selectedCourseId, sections])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSectionId || !paymentMethod || !studentId) return
    try {
      setLoading(true)

      await enrollmentService.createEnrollment({
        id_user: studentId,
        id_section: selectedSectionId,
      })

      onSuccess()
    } catch (error) {
      console.error("Error creando inscripción", error)
      const msg = error instanceof Error ? error.message : "Hubo un error al inscribir al alumno"
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const studentInitials = student
    ? `${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`.toUpperCase()
    : 'AL'

  const hasAvailableCourses = Boolean(allowedLevel && availableCourses.length > 0)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📝 Registrar Inscripción"
      maxWidth="max-w-xl"
      footer={
        <>
          <button
            type="button" onClick={onClose}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          {hasAvailableCourses && (
            <button
              type="submit" form="enrollForm"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedSectionId || !paymentMethod || !allowedLevel || loading}
            >
              {loading ? 'Procesando...' : 'Confirmar Inscripción'}
            </button>
          )}
        </>
      }
    >
      <form id="enrollForm" onSubmit={handleSubmit} className="space-y-4">
        {/* Cabecera del Alumno + Progresión de Nivel */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
              {studentInitials}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                {student ? `${student.last_name}, ${student.first_name}` : 'Alumno'}
              </div>
              {student?.dni && (
                <div className="text-[11px] text-slate-400">DNI {student.dni}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-lg px-3 py-2">
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">Nivel aprobado</div>
              <div className="text-[11px] font-semibold text-slate-600">
                {studentCurrentLevel ? studentCurrentLevel.name : 'Sin nivel previo'}
              </div>
            </div>
            <span className="text-slate-300 text-sm px-1">→</span>
            <div>
              <div className="text-[9px] uppercase tracking-wider font-semibold text-indigo-400">Habilitado a cursar</div>
              <div className="text-[11px] font-bold text-indigo-600">
                {allowedLevel ? allowedLevel.name : 'Máximo alcanzado'}
              </div>
            </div>
          </div>
        </div>

        {/* Estado 1: Alumno ya completó el nivel máximo (ej. C2) */}
        {!allowedLevel && levels.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center space-y-1.5">
            <div className="text-2xl">🎓</div>
            <div className="text-xs font-bold text-amber-900">
              Nivel máximo completado ({studentCurrentLevel?.name})
            </div>
            <p className="text-xs text-amber-700 max-w-md mx-auto">
              Este alumno ya aprobó el último nivel del plan de estudios y no posee un nivel siguiente al cual inscribirse.
            </p>
          </div>
        )}

        {/* Selector de Ciclo Lectivo + Curso cuando tiene nivel habilitado */}
        {allowedLevel && (
          <>
            <div className={hasAvailableCourses ? 'grid grid-cols-1 sm:grid-cols-3 gap-3' : ''}>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Ciclo Lectivo</label>
                <select
                  value={selectedAcademicYearId}
                  onChange={handleAcademicYearChange}
                  className="w-full border border-slate-200 bg-white text-slate-700 rounded-lg p-2.5 text-xs font-medium outline-none focus:border-indigo-500 transition-colors"
                >
                  {academicYears.map(ay => (
                    <option key={ay.id_academic_year} value={ay.id_academic_year}>{ay.name}</option>
                  ))}
                </select>
              </div>

              {hasAvailableCourses && (
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Curso disponible ({allowedLevel.name}) *
                  </label>
                  <select
                    required
                    value={selectedCourseId}
                    onChange={handleCourseChange}
                    className="w-full border border-slate-200 bg-white text-slate-700 rounded-lg p-2.5 text-xs font-medium outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="">-- Seleccionar Curso --</option>
                    {availableCourses.map(c => (
                      <option key={c?.id_course} value={c?.id_course}>
                        {c?.course_name} — Matrícula: ${Number(c?.registration_fee || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Estado 2: No hay cursos/comisiones creadas para el nivel habilitado */}
            {!loading && availableCourses.length === 0 && selectedAcademicYearId && (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-lg">
                  📚
                </div>
                <div className="text-xs font-bold text-slate-700">
                  Sin comisiones disponibles para {allowedLevel.name}
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  No se encontraron cursos con comisiones abiertas del nivel{' '}
                  <strong className="text-slate-700">{allowedLevel.name}</strong> en el ciclo lectivo seleccionado.
                </p>
              </div>
            )}

            {/* Estado 3: Selección interactiva de Comisión y Método de Pago */}
            {hasAvailableCourses && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-slate-500">
                      Comisión *
                    </label>
                    {selectedCourseId && (
                      <span className="text-[10px] text-slate-400">
                        {availableSections.length} {availableSections.length === 1 ? 'opción disponible' : 'opciones disponibles'}
                      </span>
                    )}
                  </div>

                  {!selectedCourseId ? (
                    <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">
                      Seleccioná un curso arriba para ver sus comisiones y horarios.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-0.5">
                      {availableSections.map(s => {
                        const isSelected = Number(selectedSectionId) === Number(s.id_section)
                        const prof = s.professors && s.professors.length > 0
                          ? `${s.professors[0].first_name} ${s.professors[0].last_name}`
                          : 'Sin profesor asignado'
                        return (
                          <button
                            key={s.id_section}
                            type="button"
                            onClick={() => setSelectedSectionId(s.id_section!)}
                            className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                  {s.name}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  👨‍🏫 {prof} {s.classroom ? `· 🚪 ${s.classroom.name}` : ''}
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                              }`}>
                                {isSelected && <span className="text-[9px] leading-none">✓</span>}
                              </div>
                            </div>

                            {s.schedules && s.schedules.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                                {s.schedules.map((sch, idx) => (
                                  <span
                                    key={idx}
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                      isSelected
                                        ? 'bg-indigo-100/80 text-indigo-700'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {DAY_LABELS[sch.day] || sch.day} {sch.start_time.slice(0, 5)}–{sch.end_time.slice(0, 5)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Método de pago en píldoras interactivas */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    Método de Pago (Matrícula) *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map(pm => {
                      const active = paymentMethod === pm.id
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            active
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{pm.icon}</span>
                          <span>{pm.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Resumen de cargo por matrícula */}
                <div className="bg-indigo-50/70 border border-indigo-100 px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-indigo-800">
                    Deuda automática por matrícula al confirmar:
                  </span>
                  <span className="font-bold text-indigo-900 text-sm">
                    {selectedCourse
                      ? `$${Number(selectedCourse.registration_fee || 0).toLocaleString()}`
                      : '—'}
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </form>
    </Modal>
  )
}
