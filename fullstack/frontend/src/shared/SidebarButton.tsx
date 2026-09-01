import React from 'react';

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export default function SidebarButton({ icon, label, isActive, onClick }: SidebarButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${
        isActive 
          ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500' 
          : 'hover:bg-slate-900 hover:text-slate-200'
      }`}
    >
      <span>{icon}</span> {label}
    </button>
  );
}
