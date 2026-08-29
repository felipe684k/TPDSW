interface Props {
  isOpen: boolean;                  
  onClose: () => void;              
  onConfirm: () => void;            
  message?: string;                 
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, message }: Props) {
  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-[#1c1d24] border border-rose-900/50 rounded-xl shadow-2xl p-6 w-full max-w-sm text-center relative">
        
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="w-7 h-7 bg-slate-900 hover:bg-rose-950/30 hover:text-rose-400 rounded flex items-center justify-center text-sm text-slate-500 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-xl mx-auto mb-4 mt-2">
          ⚠️
        </div>
        <h3 className="text-lg font-bold text-slate-100 mb-2">Are you sure?</h3>
        <p className="text-sm text-slate-400 mb-6">
          {message || "This action will deactivate the record from the system. Do you want to continue?"}
        </p>
        
        <div className="flex gap-3 justify-center">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded font-semibold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 rounded font-semibold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-900/20 transition-all cursor-pointer"
          >
            Yes, deactivate
          </button>
        </div>
      </div>
    </div>
  );
}