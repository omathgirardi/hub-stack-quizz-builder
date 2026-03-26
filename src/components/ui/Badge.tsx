interface BadgeProps {
  children: React.ReactNode
  color?: 'primary' | 'secondary' | 'destructive' | 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

const colors = {
  primary: 'bg-primary-100 text-primary-700',
  secondary: 'bg-chalet-green-50 text-chalet-green-600',
  destructive: 'bg-destructive-100 text-destructive-700',
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
}

export function Badge({ children, color = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}
