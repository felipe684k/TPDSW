import React, { useEffect, useState } from 'react';
import Modal from '../../shared/components/Modal';
import FormInput from '../../shared/components/FormInput';
import FormSelect from '../../shared/components/FormSelect';
import { todayISO } from '../../biz/date';
import { levelService, sortLevelsByProgression, type Level } from '../../biz/services/level.service';

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
  const today = todayISO();

  // Los niveles se leen de la base (no se escriben a mano), así el código guardado siempre es el real
  const [levels, setLevels] = useState<Level[]>([]);
  const [levelsStatus, setLevelsStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    levelService.getLevels()
      .then(data => {
        if (cancelled) return;
        setLevels(sortLevelsByProgression(data));
        setLevelsStatus('ok');
      })
      .catch(() => {
        if (!cancelled) setLevelsStatus('error');
      });
    return () => { cancelled = true; };
  }, [isOpen]);

  const levelOptions = levelsStatus === 'loading'
    ? [{ value: formData.level_code ?? '', label: 'Cargando niveles...' }]
    : [
        { value: '', label: 'Sin nivel asignado' },
        ...levels.map(l => ({ value: String(l.level_code), label: l.name }))
      ];

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
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded text-xs font-medium transition-colors cursor-pointer"
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
          
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">Datos Personales</div>
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
              max={today}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">Contacto</div>
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

        <div className="space-y-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">Académico</div>
          <FormSelect
            label={editingId ? "Nivel Actual" : "Nivel de Ingreso"}
            name="level_code" value={formData.level_code} onChange={onChange}
            disabled={levelsStatus === 'loading'}
            options={levelOptions}
          />
          {levelsStatus === 'error' && (
            <p role="alert" className="text-[11px] text-rose-600">
              No se pudieron cargar los niveles. Cerrá y volvé a abrir el formulario para reintentar.
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
