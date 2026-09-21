import React from 'react';
import { theme } from '../theme';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function FormInput({ label, className = '', ...props }: FormInputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className={theme.input.label}>{label}</label>
      <input
        className={`${theme.input.base} ${theme.input.default} ${theme.input.disabled} ${className}`}
        {...props}
      />
    </div>
  );
}
