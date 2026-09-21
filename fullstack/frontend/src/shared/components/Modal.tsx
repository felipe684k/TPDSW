import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { theme } from '../theme';

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
        
        <div className={`p-4 ${theme.modal.header} flex justify-between items-center shrink-0 ${isDanger ? 'relative border-b-0' : ''}`}>
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors ml-auto flex items-center justify-center p-1 rounded-full hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

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
