'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-700 disabled:bg-primary-300',
  secondary: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive-600',
  outline: 'bg-transparent border border-primary text-primary hover:bg-primary-50',
  ghost: 'text-primary-600 hover:bg-primary-50',
  link: 'text-primary underline-offset-4 hover:underline',
}

const sizes = {
  sm: 'px-3 py-1.5 text-label',
  md: 'px-4 py-2 text-label',
  lg: 'px-5 py-2.5 text-body font-bold',
  icon: 'h-10 w-10',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
