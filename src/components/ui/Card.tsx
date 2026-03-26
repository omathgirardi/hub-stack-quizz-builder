import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export function Card({ children, className = '', padding = true, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${padding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
