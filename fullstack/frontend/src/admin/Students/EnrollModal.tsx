import { useState, useEffect } from 'react'
import { sectionService, type Section } from '../../services/section.service'
import { academicYearService, type AcademicYear } from '../../services/academicYear.service'
import Modal from '../../shared/components/Modal'

interface EnrollModalProps {
  isOpen: boolean
  onClose: () => void
  studentId: number | null
  onSuccess: () => void
}

export default function EnrollModal({ isOpen, onClose, studentId, onSuccess }: EnrollModalProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [sections, setSections] = useState<Section[]>([])
  
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | ''>('')
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('')
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchAcademicYears()
    } else {
      // Reset state on close
      setSelectedAcademicYearId('')
      setSelectedCourseId('')
      setSelectedSectionId('')
      setPaymentMethod('')
    }
  }, [isOpen])

  const fetchAcademicYears = async () => {
    try {
      const data = await academicYearService.getAcademicYears()
      setAcademicYears(data)
      if (data.length > 0) {
        setSelectedAcademicYearId(data[0].id_academic_year!)
        fetchSections(data[0].id_academic_year!)
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
    setSelectedSectionId('') // reset section when course changes
  }

  const availableCourses = Array.from(new Map(sections.filter(s => s.course).map(s => [s.course!.id_course, s.course])).values())
  const availableSections = sections.filter(s => s.id_course === selectedCourseId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSectionId || !paymentMethod) return

    // Since the CRUD is not ready, we simulate success
    onSuccess()
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📝 Registrar Inscripción"
      maxWidth="max-w-md"
      footer={
        <>
          <button 
            type="button" onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded text-xs font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="submit" form="enrollForm"
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all cursor-pointer"
            disabled={!selectedSectionId || !paymentMethod}
          >
            Confirmar Inscripción
          </button>
        </>
      }
    >
      <form id="enrollForm" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Ciclo Lectivo</label>
          <select 
            value={selectedAcademicYearId} 
            onChange={handleAcademicYearChange}
            className="w-full border border-slate-300 bg-slate-50 text-slate-700 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
          >
            <option value="">-- Seleccionar --</option>
            {academicYears.map(ay => (
              <option key={ay.id_academic_year} value={ay.id_academic_year}>{ay.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Curso *</label>
          <select 
            required
            value={selectedCourseId} 
            onChange={handleCourseChange}
            className="w-full border border-slate-300 bg-slate-50 text-slate-700 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
            disabled={loading || availableCourses.length === 0}
          >
            <option value="">{loading ? 'Cargando cursos...' : '-- Seleccionar Curso --'}</option>
            {availableCourses.map(c => (
              <option key={c?.id_course} value={c?.id_course}>{c?.course_name}</option>
            ))}
          </select>
          {availableCourses.length === 0 && !loading && selectedAcademicYearId && (
            <p className="text-[10px] text-rose-400 mt-1">No hay cursos con comisiones en este ciclo lectivo.</p>
          )}
        </div>

        <div>
          <label className={`text-xs font-semibold block mb-1 ${!selectedCourseId ? 'text-slate-600' : 'text-slate-500'}`}>Comisión *</label>
          <select 
            required
            value={selectedSectionId} 
            onChange={e => setSelectedSectionId(Number(e.target.value))}
            className="w-full border border-slate-300 bg-slate-50 text-slate-700 rounded p-2.5 text-xs outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100"
            disabled={!selectedCourseId || availableSections.length === 0}
          >
            {!selectedCourseId ? (
              <option value="">-- Primero seleccioná un Curso --</option>
            ) : availableSections.length === 0 ? (
              <option value="">-- No hay comisiones disponibles --</option>
            ) : (
              <option value="">-- Seleccionar Comisión --</option>
            )}
            {availableSections.map(s => (
              <option key={s.id_section} value={s.id_section}>{s.name} (Cupos: {s.capacity})</option>
            ))}
          </select>
          {availableSections.length === 0 && selectedCourseId && (
            <p className="text-[10px] text-rose-500 mt-1">No hay comisiones para el curso seleccionado.</p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Método de Pago (Matrícula) *</label>
          <select 
            required
            value={paymentMethod} 
            onChange={e => setPaymentMethod(e.target.value)}
            className="w-full border border-slate-300 bg-slate-50 text-slate-700 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
          >
            <option value="">-- Seleccionar Método --</option>
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia Bancaria</option>
            <option value="credit_card">Tarjeta de Crédito</option>
          </select>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-700">
          <strong>Nota:</strong> Al confirmar, el sistema generará automáticamente la deuda por el costo de la matrícula de la comisión seleccionada.
        </div>
      </form>
    </Modal>
  )
}
