import { cn } from '@/lib/cn'

type PaddingSize = 'none' | 'sm' | 'md' | 'lg'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: PaddingSize
  as?: 'div' | 'article' | 'section' | 'li'
}

const paddingClasses: Record<PaddingSize, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, className, hover = false, padding = 'md', as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={cn(
        'bg-white rounded-xl border border-neutral-100 shadow-card',
        hover && 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </Tag>
  )
}
export default Card
