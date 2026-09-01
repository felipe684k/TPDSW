import { useState, useEffect } from 'react'
import { classroomService, type Classroom } from '../services/classroom.service'
import DataTable from '../shared/components/DataTable'
import Modal from '../shared/components/Modal'
import FormInput from '../shared/components/FormInput'

export default function Classrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState<number | ''>('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    setIsLoading(true)
    try {
      const data = await classroomService.getClassrooms()
      setClassrooms(data)
    } catch (error) {
      console.error(error)
      setErrorMsg('Error al cargar las aulas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (classroom?: Classroom) => {
    if (classroom) {
      setEditingId(classroom.id!)
      setName(classroom.name)
      setCapacity(classroom.capacity)
    } else {
      setEditingId(null)
      setName('')
      setCapacity('')
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !capacity) return
    
    setIsLoading(true)
    try {
      if (editingId) {
        await classroomService.updateClassroom(editingId, { name, capacity: Number(capacity) })
      } else {
        await classroomService.createClassroom({ name, capacity: Number(capacity) })
      }
      setModalOpen(false)
      fetchClassrooms()
    } catch (error) {
      console.error(error)
      setErrorMsg('Error al guardar el aula')
    } finally {
      setIsLoading(false)
    }
  }

  const columns = [
    {
      header: 'Nombre del Espacio',
      render: (c: Classroom) => (
        <span className="flex items-center gap-2 font-semibold text-slate-200">
          <span className="text-sm">🏫</span> {c.name}
        </span>
      ),
    },
    {
      header: 'Capacidad Máx',
      render: (c: Classroom) => <span className="font-mono text-slate-500">{c.capacity} alumnos</span>,
    },
    {
      header: 'Acciones',
      align: 'right' as const,
      render: (c: Classroom) => (
        <button 
          onClick={() => handleOpenModal(c)}
          className="text-slate-400 hover:text-indigo-400 transition-colors"
        >
          ✎ Editar
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Aulas y Espacios</h1>
          <p className="text-xs text-slate-500 mt-1">Ver la infraestructura física del instituto.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-medium shadow transition-all"
        >
          ➕ Registrar Aula
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/50 border border-rose-800/80 rounded-lg p-3 text-xs text-rose-400">
          {errorMsg}
        </div>
      )}

      <DataTable 
        title="Lista de Espacios Disponibles" 
        columns={columns} 
        data={classrooms} 
        totalCount={classrooms.length} 
        emptyMessage={isLoading ? "Cargando aulas..." : "No hay aulas registradas."}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={editingId ? '🏫 Editar Aula' : '🏫 Registrar Nueva Aula'}
        footer={
          <>
            <button 
              type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" form="classroomForm" disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Guardar Aula'}
            </button>
          </>
        }
      >
        <form id="classroomForm" onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Nombre del Aula *"
            type="text" required placeholder="ej. Aula 6" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <FormInput
            label="Capacidad (Número de Alumnos) *"
            type="number" required placeholder="ej. 30" min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : '')}
          />
        </form>
      </Modal>
    </div>
  )
}
