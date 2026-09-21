import React from 'react';
import { theme } from './theme';

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
          ? theme.sidebar.activeItem
          : theme.sidebar.inactiveItem
      }`}
    >
      <span>{icon}</span> {label}
    </button>
  );
}
