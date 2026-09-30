import { useState, useEffect } from 'react';
import { enrollmentService, type Enrollment } from '../biz/services/enrollment.service';
import DataTable from '../shared/components/DataTable';
import Modal from '../shared/components/Modal';

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // State variables for Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<number | null>(null);

  // State variables for Update Modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    status: '',
    final_grade: '',
    attendance_percentage: ''
  });

  // Fetch enrollments on component mount
  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const data = await enrollmentService.getEnrollments()
      setEnrollments(data)
    } catch (error) {
      console.error('Failed to fetch enrollments:', error)
    }
  }

  // --- DELETE LOGIC ---
  const confirmDelete = (id: number) => {
    setEnrollmentToDelete(id);
    setDeleteModalOpen(true);
  }

  const executeDelete = async () => {
    if (!enrollmentToDelete) return;
    try {
      await enrollmentService.deleteEnrollment(enrollmentToDelete);
      fetchEnrollments();
      setDeleteModalOpen(false);
      setEnrollmentToDelete(null);
    } catch (error) {
      console.error('Error deactivating enrollment:', error);
      alert('Error deactivating enrollment.');
    }
  }

  // --- UPDATE LOGIC ---
  const handleEdit = (enrollment: Enrollment) => {
    setEditingId(enrollment.id_enrollment);

    // Pre-fill the form with existing data
    setFormData({
      status: enrollment.status || 'Active',
      final_grade: enrollment.final_grade ? enrollment.final_grade.toString() : '',
      attendance_percentage: enrollment.attendance_percentage ? enrollment.attendance_percentage.toString() : ''
    });
    setUpdateModalOpen(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      // Prepare payload, converting empty strings to null for the database
      const dataToSave = {
        status: formData.status,
        final_grade: formData.final_grade ? Number(formData.final_grade) : null,
        attendance_percentage: formData.attendance_percentage ? Number(formData.attendance_percentage) : null
      };

      await enrollmentService.updateEnrollment(editingId, dataToSave);
      fetchEnrollments(); // Refresh table
      setUpdateModalOpen(false);
    } catch (error) {
      console.error("Error updating enrollment:", error);
      alert('Error saving enrollment. Please verify the data.');
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  // --- TABLE COLUMNS CONFIGURATION ---
  const columns = [
    {
      header: 'Alumno',
      render: (e: Enrollment) => <span className="font-semibold text-slate-700">{e.user?.last_name}, {e.user?.first_name}</span>,
    },
    {
      header: 'DNI',
      render: (e: Enrollment) => <span className="font-mono text-slate-500">{e.user?.dni}</span>,
    },
    {
      header: 'Comisión',
      render: (e: Enrollment) => <span className="text-slate-500">{e.section?.name}</span>,
    },
    {
      header: 'Nivel',
      render: (e: Enrollment) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-indigo-50 text-indigo-400">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{e.section?.course?.level?.name || '-'}
        </span>
      ),
    },
    {
      header: 'Fecha',
      render: (e: Enrollment) => <span className="text-slate-500">{new Date(e.enrollment_date).toLocaleDateString()}</span>,
    },
    {
      header: 'Asistencia',
      render: (e: Enrollment) => <span className="font-semibold text-slate-500">{e.attendance_percentage ? `${e.attendance_percentage}%` : '-'}</span>,
    },
    {
      header: 'Nota Final',
      render: (e: Enrollment) => <span className="font-semibold text-slate-500">{e.final_grade || '-'}</span>,
    },
    {
      header: 'Estado',
      render: (e: Enrollment) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold ${e.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
          e.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-950/30 text-rose-700'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${e.status === 'Active' ? 'bg-emerald-500' :
            e.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
            }`}></span>
          {e.status === 'Active' ? 'Activo' : e.status === 'Pending' ? 'Pendiente' : 'Dado de Baja'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      render: (e: Enrollment) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(e)}
            className="text-indigo-400 hover:text-indigo-300 font-semibold text-2xs cursor-pointer"
          >
            Editar
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => confirmDelete(e.id_enrollment)}
            className="text-rose-500 hover:text-rose-400 font-semibold text-2xs cursor-pointer"
          >
            Desactivar
          </button>
        </div>
      ),
    },
  ]

  // --- UI RENDER ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Inscripciones</h1>
          <p className="text-xs text-slate-500 mt-1">Lista general de todos los alumnos inscriptos en el instituto.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-xs flex gap-2.5">
        <span className="text-sm">ℹ️</span>
        <div>Para inscribir a un nuevo alumno, ve a la pestaña <strong>Alumnos</strong> y haz click en "📝 Inscribir" junto a su nombre.</div>
      </div>

      <DataTable
        title="Lista de Inscripciones"
        columns={columns}
        data={enrollments}
        totalCount={enrollments.length}
      />

      {/* --- UPDATE MODAL --- */}
      <Modal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        title="✏️ Editar Inscripción"
        maxWidth="max-w-sm"
        footer={
          <>
            <button
              type="button" onClick={() => setUpdateModalOpen(false)}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit" form="editForm"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium cursor-pointer"
            >
              Guardar Cambios
            </button>
          </>
        }
      >
        <form id="editForm" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Nota Final</label>
            <input
              type="number" step="0.01" min="0" max="10" placeholder="Ej: 8.5"
              name="final_grade"
              value={formData.final_grade}
              onChange={handleInputChange}
              className="w-full border border-slate-300 bg-slate-50 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Porcentaje de Asistencia (%)</label>
            <input
              type="number" step="0.01" min="0" max="100" placeholder="Ej: 85"
              name="attendance_percentage"
              value={formData.attendance_percentage}
              onChange={handleInputChange}
              className="w-full border border-slate-300 bg-slate-50 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Estado</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full border border-slate-300 bg-slate-50 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
            >
              <option value="Active">Activo</option>
              <option value="Pending">Pendiente</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setEnrollmentToDelete(null); }}
        isDanger={true}
        maxWidth="max-w-sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => { setDeleteModalOpen(false); setEnrollmentToDelete(null); }}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={executeDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium cursor-pointer"
            >
              Sí, desactivar
            </button>
          </>
        }
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 text-rose-500 text-xl">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">¿Desactivar Inscripción?</h2>
          <p className="text-xs text-slate-500 mb-2">
            Esta acción cambiará el estado del alumno a "Dado de Baja" y perderá el acceso al curso.
          </p>
        </div>
      </Modal>

    </div>
  )
}
