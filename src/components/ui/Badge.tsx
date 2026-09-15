import { cn } from '@/lib/cn'

type BadgeVariant = 'default' | 'blue' | 'red' | 'green' | 'yellow' | 'navy' | 'outline'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-neutral-100 text-neutral-700',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
  red: 'bg-red-50 text-brand-red border border-red-200',
  green: 'bg-green-50 text-green-700 border border-green-200',
  yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  navy: 'bg-navy-800 text-white',
  outline: 'border border-neutral-200 text-neutral-600 bg-transparent',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
export default Badge
