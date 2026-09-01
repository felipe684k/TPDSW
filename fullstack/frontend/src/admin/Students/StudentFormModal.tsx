import React from 'react';
import Modal from '../../shared/components/Modal';
import FormInput from '../../shared/components/FormInput';
import FormSelect from '../../shared/components/FormSelect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errorMessage: string | null;
  editingId: number | null;
}

export default function StudentFormModal({ isOpen, onClose, onSubmit, formData, onChange, errorMessage, editingId }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? '✏️ Editar Alumno' : '👤 Registrar Nuevo Alumno'}
      maxWidth="max-w-lg"
      footer={
        <>
          <button
            type="button" onClick={onClose}
            className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors cursor-pointer"
          >Cancelar</button>
          <button
            type="submit" form="student-form"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            {editingId ? 'Guardar Cambios' : 'Guardar Alumno'}
          </button>
        </>
      }
    >
      <form id="student-form" onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-3">
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 text-xs font-semibold p-3 rounded flex items-center gap-2">
              <span>⚠️</span> {errorMessage}
            </div>
          )}
          
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Datos Personales</div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Apellido *"
              name="last_name" value={formData.last_name} onChange={onChange}
              type="text" required placeholder="Ej. González"
            />
            <FormInput
              label="Nombre *"
              name="first_name" value={formData.first_name} onChange={onChange}
              type="text" required placeholder="Ej. Lucía"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="DNI *"
              name="dni" value={formData.dni} onChange={onChange}
              type="text" required maxLength={8} placeholder="Ej. 40123456"
            />
            <FormInput
              label="Fecha de Nacimiento"
              name="birth_date" value={formData.birth_date} onChange={onChange}
              type="date"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Contacto</div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Teléfono *"
              name="phone" value={formData.phone} onChange={onChange}
              type="tel" required placeholder="Ej. 2216789012"
            />
            <FormInput
              label="Email"
              name="email" value={formData.email} onChange={onChange}
              type="email" placeholder="Ej. nombre@email.com"
            />
          </div>
        </div>

        {!editingId && (
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Académico</div>
            <FormSelect
              label="Nivel de Ingreso"
              name="level_code" value={formData.level_code} onChange={onChange}
              options={[
                { value: "", label: "Sin nivel previo" },
                { value: "1", label: "A1 — Principiante" },
                { value: "2", label: "A2 — Básico" },
                { value: "3", label: "B1 — Intermedio" },
                { value: "4", label: "B2 — Intermedio Alto" },
                { value: "5", label: "C1 — Avanzado" },
                { value: "6", label: "C2 — Experto" }
              ]}
            />
          </div>
        )}
      </form>
    </Modal>
  );
}