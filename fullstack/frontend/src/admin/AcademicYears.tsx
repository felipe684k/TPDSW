import { useState, useEffect } from 'react'
import { academicYearService, type AcademicYear } from '../biz/services/academicYear.service'
import Modal from '../shared/components/Modal'
import FormInput from '../shared/components/FormInput'
import { theme } from '../shared/theme'
import { formatDateAR } from '../biz/date'

export default function AcademicYears() {
  const [modalOpen, setModalOpen] = useState(false)
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [academicYearToDelete, setAcademicYearToDelete] = useState<AcademicYear | null>(null)
  const [deleting, setDeleting] = useState(false)
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
      setToast({ text: editingId ? "Ciclo lectivo actualizado exitosamente" : "Ciclo lectivo creado exitosamente", type: 'success' })
      setTimeout(() => setToast(null), 3000)
      fetchAcademicYears()
    } catch (error) {
      console.error(error)
      setToast({ text: error instanceof Error ? error.message : 'Error al guardar el ciclo lectivo', type: 'danger' })
      setTimeout(() => setToast(null), 4000)
    }
  }

  const handleConfirmDelete = async () => {
    if (!academicYearToDelete?.id_academic_year) return
    setDeleting(true)
    try {
      await academicYearService.deleteAcademicYear(academicYearToDelete.id_academic_year)
      setAcademicYearToDelete(null)
      setToast({ text: 'Ciclo lectivo eliminado exitosamente', type: 'success' })
      setTimeout(() => setToast(null), 3000)
      fetchAcademicYears()
    } catch (error) {
      console.error(error)
      setAcademicYearToDelete(null)
      setToast({
        text: error instanceof Error ? error.message : 'Error al eliminar el ciclo lectivo',
        type: 'danger'
      })
      setTimeout(() => setToast(null), 4500)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Ciclos Lectivos</h1>
          <p className="text-xs text-slate-500 mt-1">Administración de períodos académicos anuales o semestrales.</p>
        </div>
        <button onClick={handleOpenModalCreate} className={theme.button.primary}>
          + Nuevo Ciclo Lectivo
        </button>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white border px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          toast.type === 'success' ? 'border-emerald-500/50 text-emerald-400' : 'border-rose-500/50 text-rose-400'
        }`}>
          <span className="text-lg">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="font-medium text-sm">{toast.text}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-4xl">
        {loading ? (
          <div className="text-slate-500 text-sm">Cargando...</div>
        ) : academicYears.length === 0 ? (
          <div className="text-slate-500 text-sm">No hay ciclos lectivos registrados.</div>
        ) : (
          academicYears.map(ay => (
            <div key={ay.id_academic_year} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{ay.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Desde {formatDateAR(ay.start_date)} hasta {formatDateAR(ay.end_date)}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleEdit(ay)}
                  className="text-indigo-500 hover:text-indigo-700 font-semibold text-sm cursor-pointer transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => setAcademicYearToDelete(ay)}
                  className="text-rose-500 hover:text-rose-700 font-semibold text-sm cursor-pointer transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={Boolean(academicYearToDelete)}
        onClose={() => !deleting && setAcademicYearToDelete(null)}
        title="Confirmar Baja de Ciclo Lectivo"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              disabled={deleting}
              onClick={() => setAcademicYearToDelete(null)}
              className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium cursor-pointer disabled:opacity-50"
            >
              {deleting ? 'Eliminando...' : 'Eliminar Ciclo Lectivo'}
            </button>
          </>
        }
      >
        <div className="space-y-2 text-xs text-slate-600">
          <p>
            ¿Estás seguro de que deseás dar de baja el ciclo lectivo{' '}
            <strong className="text-slate-800">{academicYearToDelete?.name}</strong>?
          </p>
          <p className="text-slate-400">
            Solo se puede eliminar un ciclo lectivo si no tiene comisiones asociadas.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Ciclo Lectivo' : 'Nuevo Ciclo Lectivo'}
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium cursor-pointer">Cancelar</button>
            <button type="submit" form="academicYearForm" className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium cursor-pointer">Guardar</button>
          </>
        }
      >
        <form id="academicYearForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormInput
            label="Nombre *"
            type="text" required placeholder="ej. Primer Semestre 2026"
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <FormInput
            label="Fecha de Inicio *"
            type="date" required
            value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})}
          />
          <FormInput
            label="Fecha de Fin *"
            type="date" required
            value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})}
          />
        </form>
      </Modal>
    </div>
  )
}
