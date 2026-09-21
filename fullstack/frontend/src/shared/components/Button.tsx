import React from 'react'
import { theme } from '../theme'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'action' | 'actionDanger' | 'actionSuccess'
  children: React.ReactNode
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = variant.startsWith('action') ? 'inline-flex items-center cursor-pointer transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed' : theme.button.base
  const variantClasses = theme.button[variant]
  
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  )
}
