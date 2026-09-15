'use client'

import { useEffect, useRef, useState } from 'react'

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

export function StatsCounter() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className="bg-white border-y border-neutral-100 py-12"
      aria-label="Company statistics"
    >
      <div className="container-site">
        <p className="text-center text-xs font-semibold text-amber-600 uppercase tracking-widest mb-8 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 max-w-max mx-auto">
          ⚠ Add real business statistics through the admin panel
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:divide-x lg:divide-neutral-100">
          {STATS.map((stat) => (
            <StatItem key={stat.label} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}
export default StatsCounter
