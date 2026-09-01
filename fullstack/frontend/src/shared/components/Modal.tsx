import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  isDanger?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-sm',
  isDanger = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-6 z-50">
      <div className={`bg-[#1c1d24] rounded-xl shadow-xl w-full ${maxWidth} max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isDanger ? 'border border-rose-900/50' : ''}`}>
        
        {(title || onClose) && (
          <div className={`p-4 border-b border-slate-800 flex justify-between items-center shrink-0 ${isDanger ? 'relative border-b-0' : ''}`}>
            {title && <h2 className="text-sm font-semibold text-slate-200">{title}</h2>}
            <button
              onClick={onClose}
              className={`w-7 h-7 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 rounded flex items-center justify-center text-sm text-slate-500 transition-colors ${isDanger ? 'absolute top-4 right-4' : ''}`}
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>

        {footer && (
          <div className="p-4 border-t border-slate-800 bg-[#17181e] flex justify-end gap-2 rounded-b-xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
