import {
  ShieldCheck,
  Clock,
  AlertCircle,
  ThumbsUp,
  DollarSign,
  MapPin,
  Award,
  CheckCircle,
} from 'lucide-react'
import type { TrustBadge } from '@/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'shield-check': ShieldCheck,
  clock: Clock,
  'alert-circle': AlertCircle,
  'thumbs-up': ThumbsUp,
  'dollar-sign': DollarSign,
  'map-pin': MapPin,
  award: Award,
  'check-circle': CheckCircle,
}

interface TrustBadgesProps {
  badges: TrustBadge[]
  variant?: 'light' | 'dark'
}

export function TrustBadges({ badges, variant = 'light' }: TrustBadgesProps) {
  const isDark = variant === 'dark'

  return (
    <section
      className={`py-10 border-y ${
        isDark ? 'bg-navy-900 border-navy-700' : 'bg-white border-neutral-100'
      }`}
      aria-label="Why choose PipeFlow Co."
    >
      <div className="container-site">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge) => {
            const Icon = iconMap[badge.iconName] ?? CheckCircle
            return (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-2 text-center group"
              >
                <div
                  className={`rounded-xl p-3 transition-colors duration-200 ${
                    isDark
                      ? 'bg-navy-800 group-hover:bg-navy-700'
                      : 'bg-blue-50 group-hover:bg-blue-100'
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      isDark ? 'text-brand-blue-lighter' : 'text-brand-blue'
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <p
                  className={`text-xs font-semibold leading-snug ${
                    isDark ? 'text-neutral-300' : 'text-navy-700'
                  }`}
                >
                  {badge.label}
                </p>
                {badge.description && badge.description !== '[PLACEHOLDER]' && (
                  <p
                    className={`text-xs leading-tight ${
                      isDark ? 'text-neutral-500' : 'text-neutral-400'
                    }`}
                  >
                    {badge.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
export default TrustBadges
