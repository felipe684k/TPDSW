import React from 'react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center p-6 overflow-y-auto z-50">
      <div className="bg-[#1c1d24] rounded-xl shadow-xl w-full max-w-lg max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <h2 className="text-sm font-semibold text-slate-200">
            {editingId ? '✏️ Edit Student' : '👤 Register New Student'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 rounded flex items-center justify-center text-sm text-slate-500 transition-colors"
          >✕</button>
        </div>

        {/* FORM */}
        <form id="student-form" onSubmit={onSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="space-y-3">
            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 text-xs font-semibold p-3 rounded flex items-center gap-2">
                <span>⚠️</span> {errorMessage}
              </div>
            )}
            
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Personal Data</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Last Name *</label>
                <input
                  name="last_name" value={formData.last_name} onChange={onChange}
                  type="text" required placeholder="e.g. González"
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">First Name *</label>
                <input
                  name="first_name" value={formData.first_name} onChange={onChange}
                  type="text" required placeholder="e.g. Lucía"
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">DNI *</label>
                <input
                  name="dni" value={formData.dni} onChange={onChange}
                  type="text" required maxLength={8} placeholder="e.g. 40123456"
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Date of Birth</label>
                <input
                  name="birth_date" value={formData.birth_date} onChange={onChange}
                  type="date"
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Contact</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Phone *</label>
                <input
                  name="phone" value={formData.phone} onChange={onChange}
                  type="tel" required placeholder="e.g. 2216789012"
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Email</label>
                <input
                  name="email" value={formData.email} onChange={onChange}
                  type="email" placeholder="e.g. name@email.com"
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {!editingId && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">Academic</div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Admission Level</label>
                <select
                  name="level_code" value={formData.level_code} onChange={onChange}
                  className="border border-slate-800 rounded p-2 text-xs bg-[#1c1d24] text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="">No previous level</option>
                  <option value="1">A1 — Beginner</option>
                  <option value="2">A2 — Elementary</option>
                  <option value="3">B1 — Intermediate</option>
                  <option value="4">B2 — Upper Intermediate</option>
                  <option value="5">C1 — Advanced</option>
                  <option value="6">C2 — Mastery</option>
                </select>
              </div>
            </div>
          )}
        </form>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 shrink-0">
          <button
            type="button" onClick={onClose}
            className="px-4 py-2 border border-slate-800 bg-[#1c1d24] hover:bg-[#17181e] text-slate-400 rounded text-xs font-medium transition-colors cursor-pointer"
          >Cancel</button>
          <button
            type="submit" form="student-form"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            {editingId ? 'Save Changes' : 'Save Student'}
          </button>
        </div>
      </div>
    </div>
  );
}