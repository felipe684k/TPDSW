import React from 'react';

// Definimos los 7 cables (Props) usando los nombres en inglés que acabás de configurar
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
  if (!isOpen) return null; // Si está cerrado, no dibuja nada

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 overflow-y-auto z-50">
      <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* CABECERA */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <h2 className="text-sm font-semibold text-slate-200">
            {editingId ? '✏️ Editar Alumno' : '👤 Registrar Nuevo Alumno'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
          >✕</button>
        </div>

        {/* FORMULARIO */}
        <form id="student-form" onSubmit={onSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="space-y-3">
            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 text-xs font-semibold p-3 rounded flex items-center gap-2">
                <span>⚠️</span> {errorMessage}
              </div>
            )}
            
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Datos Personales</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Apellido *</label>
                <input
                  name="apellido" value={formData.apellido} onChange={onChange}
                  type="text" required placeholder="Ej. González"
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Nombre *</label>
                <input
                  name="nombre" value={formData.nombre} onChange={onChange}
                  type="text" required placeholder="Ej. Lucía"
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">DNI *</label>
                <input
                  name="dni" value={formData.dni} onChange={onChange}
                  type="text" required maxLength={8} placeholder="Ej. 40123456"
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Fecha Nacimiento</label>
                <input
                  name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={onChange}
                  type="date"
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Contacto</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Teléfono *</label>
                <input
                  name="telefono" value={formData.telefono} onChange={onChange}
                  type="tel" required placeholder="Ej. 2216789012"
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Email</label>
                <input
                  name="email" value={formData.email} onChange={onChange}
                  type="email" placeholder="Ej. nombre@email.com"
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {!editingId && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Académico</div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Nivel de Ingreso</label>
                <select
                  name="nivel" value={formData.nivel} onChange={onChange}
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="">Sin nivel previo</option>
                  <option value="A1">A1 — Principiante</option>
                  <option value="A2">A2 — Elemental</option>
                  <option value="B1">B1 — Intermedio</option>
                  <option value="B2">B2 — Intermedio Alto</option>
                  <option value="C1">C1 — Avanzado</option>
                  <option value="C2">C2 — Proficiente</option>
                </select>
              </div>
            </div>
          )}
        </form>

        {/* PIE DE LA VENTANA */}
        <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 shrink-0">
          <button
            type="button" onClick={onClose}
            className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors"
          >Cancelar</button>
          <button
            type="submit" form="student-form"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all"
          >
            {editingId ? 'Guardar Cambios' : 'Guardar Alumno'}
          </button>
        </div>
      </div>
    </div>
  );
}