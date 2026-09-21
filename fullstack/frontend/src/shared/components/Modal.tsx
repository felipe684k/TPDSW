import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { theme } from '../../utils/theme';

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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className={`fixed inset-0 ${theme.modal.overlay} flex items-center justify-center p-6 z-[100]`}>
      <div className={`${theme.modal.content} w-full ${maxWidth} max-h-[calc(100vh-48px)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isDanger ? 'border-rose-200' : ''}`}>
        
        {(title || onClose) && (
          <div className={`p-4 ${theme.modal.header} flex justify-between items-center shrink-0 ${isDanger ? 'relative border-b-0' : ''}`}>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            <button
              onClick={onClose}
              className={`w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center text-sm text-slate-500 transition-colors cursor-pointer ${isDanger ? 'absolute top-4 right-4' : ''}`}
            >
              ×
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 text-slate-600">
          {children}
        </div>

        {footer && (
          <div className={`p-4 ${theme.modal.footer} flex justify-end gap-2 rounded-b-xl shrink-0`}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
