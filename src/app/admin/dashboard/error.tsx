'use client'

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div role="alert" className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-xs"><h1 className="text-xl font-bold text-navy-900">Dashboard data is unavailable</h1><p className="mt-2 text-sm text-neutral-600">{error.message || 'Unable to load dashboard metrics from Supabase.'}</p><button type="button" onClick={reset} className="btn-primary mt-4 !px-4 !py-2 text-sm">Try again</button></div>
}
