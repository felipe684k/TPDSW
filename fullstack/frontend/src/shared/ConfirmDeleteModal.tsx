import Modal from './components/Modal';

interface Props {
  isOpen: boolean;                  
  onClose: () => void;              
  onConfirm: () => void;            
  message?: string;                 
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, message }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDanger={true}
      maxWidth="max-w-sm"
      footer={
        <div className="flex gap-3 justify-center w-full">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 rounded font-semibold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all cursor-pointer"
          >
            Sí, desactivar
          </button>
        </div>
      }
    >
      <div className="text-center mt-2">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-xl mx-auto mb-4">
          ⚠️
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">¿Estás seguro?</h3>
        <p className="text-sm text-slate-500 mb-2">
          {message || "Esta acción desactivará el registro del sistema. ¿Deseas continuar?"}
        </p>
      </div>
    </Modal>
  );
}