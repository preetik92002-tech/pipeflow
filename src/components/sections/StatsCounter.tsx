'use client'

import { useEffect, useState } from 'react'

import type { HomepageContent } from '@/lib/cms/types'

interface Stat {
  value: number
  suffix: string
  label: string
  prefix?: string
  placeholder?: boolean
}

// [PLACEHOLDER] — Replace with real business statistics via admin panel
const STATS: Stat[] = [
  { value: 0, suffix: '+', label: 'Jobs Completed', prefix: '', placeholder: true },
  { value: 0, suffix: '+', label: 'Happy Customers', prefix: '', placeholder: true },
  { value: 24, suffix: '/7', label: 'Emergency Service', prefix: '' },
  { value: 12, suffix: '+', label: 'Service Areas', prefix: '' },
]

function useCountUp(target: number, isVisible: boolean, duration = 1800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isVisible || target === 0) return
    const steps = 50
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target, isVisible, duration])
  return count
}

function StatItem({ stat, isVisible }: { stat: Stat; isVisible: boolean }) {
  const count = useCountUp(stat.value, isVisible)
  return (
    <div className="text-center px-4 py-2">
      <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-navy-800 mb-1 tabular-nums">
        {stat.placeholder ? (
          <span className="text-neutral-300">—</span>
        ) : (
          <>
            {stat.prefix}
            {count.toLocaleString()}
            {stat.suffix}
          </>
        )}
      </div>
      <p className="text-sm text-neutral-500 font-medium">{stat.label}</p>
    </div>
  )
}

export function StatsCounter({ stats }: { stats: HomepageContent['stats'] }) {
  const activeStats = [...stats].filter((stat) => stat.active).sort((a, b) => a.order - b.order)
  if (!activeStats.length) return null
  return (
    <section
      className="bg-white border-y border-neutral-100 py-12"
      aria-label="Company statistics"
    >
      <div className="container-site">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:divide-x lg:divide-neutral-100">
          {activeStats.map((stat) => <div key={`${stat.order}-${stat.label}`} className="text-center px-4 py-2"><div className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-navy-800 mb-1">{stat.number}</div><p className="text-sm text-neutral-500 font-medium">{stat.label}</p></div>)}
        </div>
      </div>
    </section>
  )
}
export default StatsCounter
