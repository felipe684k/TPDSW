import { useState, useEffect } from 'react';
import { enrollmentService, type Enrollment } from '../biz/services/enrollment.service';
import { sectionService, type Section } from '../biz/services/section.service';
import { studentService } from '../biz/services/student.service';
import DataTable from '../shared/components/DataTable';
import Modal from '../shared/components/Modal';
import { formatDateAR } from '../biz/date';

const normalizeStatus = (s?: string) => {
  if (!s || s === 'Active' || s === 'Activo') return 'Activo';
  if (s === 'Pending' || s === 'Pendiente') return 'Pendiente';
  return 'Dado de Baja';
};

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [expandedEnrollmentId, setExpandedEnrollmentId] = useState<number | null>(null);
  const [studentDetails, setStudentDetails] = useState<Record<number, any>>({});

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<number | null>(null);

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    status: '',
    final_grade: '',
    attendance_percentage: ''
  });

  const fetchSections = async () => {
    try {
      const data = await sectionService.getSections();
      setSections(data);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };

  const fetchEnrollments = async (sectionFilter: string = selectedSection) => {
    try {
      const data = await enrollmentService.getEnrollments(
        sectionFilter === 'all' ? undefined : sectionFilter
      );
      setEnrollments(data);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchEnrollments('all');
  }, []);

  const handleSectionFilterChange = (value: string) => {
    setSelectedSection(value);
    setExpandedEnrollmentId(null);
    fetchEnrollments(value);
  };

  const confirmDelete = (id: number) => {
    setEnrollmentToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!enrollmentToDelete) return;
    try {
      await enrollmentService.deleteEnrollment(enrollmentToDelete);
      fetchEnrollments(selectedSection);
      setDeleteModalOpen(false);
      setEnrollmentToDelete(null);
    } catch (error) {
      console.error('Error deactivating enrollment:', error);
      alert('Error al desactivar la inscripción.');
    }
  };

  const handleEdit = (enrollment: Enrollment) => {
    setEditingId(enrollment.id_enrollment);

    const normalized = normalizeStatus(enrollment.status);
    setFormData({
      status: normalized === 'Dado de Baja' ? 'Activo' : normalized,
      final_grade: enrollment.final_grade ? enrollment.final_grade.toString() : '',
      attendance_percentage: enrollment.attendance_percentage ? enrollment.attendance_percentage.toString() : ''
    });
    setUpdateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const dataToSave = {
        status: formData.status,
        final_grade: formData.final_grade ? Number(formData.final_grade) : null,
        attendance_percentage: formData.attendance_percentage ? Number(formData.attendance_percentage) : null
      };

      await enrollmentService.updateEnrollment(editingId, dataToSave);
      fetchEnrollments(selectedSection);
      const editedEnrollment = enrollments.find((enr) => enr.id_enrollment === editingId);
      if (editedEnrollment?.id_user) {
        studentService.getStudentById(editedEnrollment.id_user)
          .then((detail) => setStudentDetails((prev) => ({ ...prev, [editedEnrollment.id_user]: detail })))
          .catch(console.error);
      }
      setUpdateModalOpen(false);
    } catch (error) {
      console.error('Error updating enrollment:', error);
      alert('Error al guardar la inscripción. Por favor verificá los datos.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    {
      header: 'Alumno',
      render: (e: Enrollment) => (
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[10px]">
            {expandedEnrollmentId === e.id_enrollment ? '▼' : '▶'}
          </span>
          <span className="font-semibold text-slate-700">
            {e.user?.last_name}, {e.user?.first_name}
          </span>
        </div>
      ),
    },
    {
      header: 'DNI',
      render: (e: Enrollment) => <span className="font-mono text-slate-500">{e.user?.dni}</span>,
    },
    {
      header: 'Comisión',
      render: (e: Enrollment) => <span className="text-slate-600 font-medium">{e.section?.name}</span>,
    },
    {
      header: 'Nivel',
      render: (e: Enrollment) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          {e.section?.course?.level?.name || '-'}
        </span>
      ),
    },
    {
      header: 'Fecha de Inscripción',
      render: (e: Enrollment) => <span className="text-slate-500">{formatDateAR(e.enrollment_date)}</span>,
    },
    {
      header: 'Asistencia',
      render: (e: Enrollment) => (
        <span className="font-semibold text-slate-500">
          {e.attendance_percentage != null ? `${Number(e.attendance_percentage)}%` : '-'}
        </span>
      ),
    },
    {
      header: 'Nota Final',
      render: (e: Enrollment) => (
        <span className="font-semibold text-slate-500">
          {e.final_grade != null ? Number(e.final_grade) : '-'}
        </span>
      ),
    },
    {
      header: 'Estado',
      render: (e: Enrollment) => {
        const statusLabel = normalizeStatus(e.status);
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              statusLabel === 'Activo'
                ? 'bg-emerald-50 text-emerald-700'
                : statusLabel === 'Pendiente'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-rose-50 text-rose-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                statusLabel === 'Activo'
                  ? 'bg-emerald-500'
                  : statusLabel === 'Pendiente'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
              }`}
            ></span>
            {statusLabel}
          </span>
        );
      },
    },
    {
      header: 'Acciones',
      render: (e: Enrollment) => (
        <div className="flex gap-2" onClick={(ev) => ev.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleEdit(e)}
            className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs cursor-pointer"
          >
            Editar
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => confirmDelete(e.id_enrollment)}
            className="text-rose-500 hover:text-rose-700 font-semibold text-xs cursor-pointer"
          >
            Desactivar
          </button>
        </div>
      ),
    },
  ];

  const handleToggleStudentDetail = async (enrollment: Enrollment) => {
    if (expandedEnrollmentId === enrollment.id_enrollment) {
      setExpandedEnrollmentId(null);
      return;
    }
    setExpandedEnrollmentId(enrollment.id_enrollment);
    if (enrollment.id_user) {
      try {
        const detail = await studentService.getStudentById(enrollment.id_user);
        setStudentDetails((prev) => ({ ...prev, [enrollment.id_user]: detail }));
      } catch (error) {
        console.error('Error fetching student detail:', error);
      }
    }
  };

  const renderStudentDetailPanel = (enrollment: Enrollment) => {
    const student = studentDetails[enrollment.id_user] || enrollment.user;
    const studentEnrollments = student?.enrollments || [];

    return (
      <div className="p-5 bg-slate-50/80 space-y-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Detalle del Alumno: {student ? `${student.last_name}, ${student.first_name}` : '—'}
              </h4>
              <p className="text-xs text-slate-500">
                Datos personales, nivel actual aprobado e historial de inscripciones en el instituto.
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-full">
              Nivel actual: {student?.current_level?.name || 'Inicial (sin nivel aprobado)'}
            </span>
          </div>

          {/* Datos del Alumno: DNI, Email, Teléfono, Nivel Actual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-medium block mb-1">DNI</span>
              <span className="font-bold text-slate-800 font-mono text-sm">
                {student?.dni || '—'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-medium block mb-1">Email</span>
              <span className="font-semibold text-slate-700 text-sm break-all">
                {student?.email || 'No registrado'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-medium block mb-1">Teléfono</span>
              <span className="font-semibold text-slate-700 text-sm">
                {student?.phone || 'No registrado'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-medium block mb-1">Nivel Actual</span>
              <span className="font-bold text-indigo-700 text-sm">
                {student?.current_level?.name || 'Inicial (Sin nivel previo)'}
              </span>
            </div>
          </div>

          {/* Inscripciones del Alumno */}
          <div className="pt-3 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <span>📚</span> Inscripciones del Alumno ({studentEnrollments.length})
            </h5>

            {studentEnrollments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No registra inscripciones.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <th className="py-2 px-3 font-semibold">Comisión</th>
                      <th className="py-2 px-3 font-semibold">Curso</th>
                      <th className="py-2 px-3 font-semibold">Nivel</th>
                      <th className="py-2 px-3 font-semibold">Ciclo</th>
                      <th className="py-2 px-3 font-semibold">Fecha de Inscripción</th>
                      <th className="py-2 px-3 font-semibold">Asistencia</th>
                      <th className="py-2 px-3 font-semibold">Nota Final</th>
                      <th className="py-2 px-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {studentEnrollments.map((item: any) => {
                      const st = normalizeStatus(item.status);
                      return (
                        <tr
                          key={item.id_enrollment}
                          className={
                            item.id_enrollment === enrollment.id_enrollment
                              ? 'bg-indigo-50/40 font-medium'
                              : ''
                          }
                        >
                          <td className="py-2 px-3 font-semibold text-slate-800">
                            {item.section?.name || '—'}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {item.section?.course?.course_name || '—'}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {item.section?.course?.level?.name || '—'}
                          </td>
                          <td className="py-2 px-3 text-slate-500">
                            {item.section?.academic_year?.name || '—'}
                          </td>
                          <td className="py-2 px-3 text-slate-500">
                            {formatDateAR(item.enrollment_date)}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {item.attendance_percentage != null ? `${Number(item.attendance_percentage)}%` : '—'}
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-semibold">
                            {item.final_grade != null ? Number(item.final_grade) : '—'}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                st === 'Activo'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : st === 'Pendiente'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {st}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Inscripciones</h1>
          <p className="text-xs text-slate-500 mt-1">
            Listado de alumnos inscriptos filtrable por comisión. Tocá una fila para ver el detalle del alumno.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-xs flex gap-2.5">
        <span className="text-sm">ℹ️</span>
        <div>
          Para inscribir a un nuevo alumno, ve a la pestaña <strong>Alumnos</strong> y haz click en "📝 Inscribir" junto a su nombre.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <label htmlFor="enrollmentSectionFilter" className="text-xs font-semibold text-slate-700">
            Filtrar por Comisión:
          </label>
          <select
            id="enrollmentSectionFilter"
            value={selectedSection}
            onChange={(e) => handleSectionFilterChange(e.target.value)}
            className="border border-slate-200 bg-white text-slate-700 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium cursor-pointer shadow-sm"
          >
            <option value="all">Todas las comisiones</option>
            {sections.map((sec) => (
              <option key={sec.id_section} value={String(sec.id_section)}>
                {sec.name}
                {sec.course?.course_name ? ` — ${sec.course.course_name}` : ''}
                {sec.course?.level?.name ? ` (${sec.course.level.name})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Mostrando <span className="font-semibold text-slate-700">{enrollments.length}</span>{' '}
          {enrollments.length === 1 ? 'inscripción' : 'inscripciones'}
          {selectedSection !== 'all' && (
            <button
              type="button"
              onClick={() => handleSectionFilterChange('all')}
              className="ml-2 text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
            >
              Limpiar filtro
            </button>
          )}
        </div>
      </div>

      <DataTable
        title="Alumnos Inscriptos"
        columns={columns}
        data={enrollments}
        totalCount={enrollments.length}
        emptyMessage={
          selectedSection !== 'all'
            ? 'No hay alumnos inscriptos en la comisión seleccionada.'
            : 'No hay inscripciones registradas.'
        }
        onRowClick={(e) => handleToggleStudentDetail(e)}
        isRowExpanded={(e) => expandedEnrollmentId === e.id_enrollment}
        renderExpandedRow={renderStudentDetailPanel}
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
              type="button"
              onClick={() => setUpdateModalOpen(false)}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="editForm"
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
              type="number"
              step="0.01"
              min="0"
              max="10"
              placeholder="Ej: 8.5"
              name="final_grade"
              value={formData.final_grade}
              onChange={handleInputChange}
              className="w-full border border-slate-300 bg-slate-50 rounded p-2.5 text-xs outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Porcentaje de Asistencia (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Ej: 85"
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
              <option value="Activo">Activo</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEnrollmentToDelete(null);
        }}
        isDanger={true}
        maxWidth="max-w-sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(false);
                setEnrollmentToDelete(null);
              }}
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
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            ¿Desactivar inscripción
            {(() => {
              const e = enrollments.find(en => en.id_enrollment === enrollmentToDelete);
              return e?.user ? ` de ${e.user.first_name} ${e.user.last_name}` : '';
            })()}
            ?
          </h2>
          <p className="text-xs text-slate-500 mb-2">
            Esta acción cambiará el estado del alumno a "Dado de Baja" y perderá el acceso al curso.
          </p>
        </div>
      </Modal>
    </div>
  );
}
