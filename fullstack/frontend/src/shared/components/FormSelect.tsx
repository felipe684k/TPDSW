import React from 'react'
import { theme } from '../theme'

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string | number; label: string }[];
}

export default function FormSelect({ label, options, className = '', ...props }: FormSelectProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className={theme.input.label}>{label}</label>
      <select
        className={`${theme.input.base} ${theme.input.default} ${theme.input.disabled} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
