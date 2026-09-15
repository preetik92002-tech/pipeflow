import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-neutral-200', className)}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-100 p-6 space-y-3" aria-hidden="true">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-8 w-28 rounded-md mt-2" />
    </div>
  )
}

export function LoadingSpinner({
  className,
  size = 'md',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div role="status" aria-label="Loading" className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-neutral-200 border-t-brand-blue',
          sizeClasses[size]
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function ErrorState({
  message = 'Something went wrong.',
  retry,
}: {
  message?: string
  retry?: () => void
}) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50 p-8 text-center">
      <p className="text-sm text-red-600 font-medium">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="text-xs text-brand-blue underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          Try again
        </button>
      )}
    </div>
  )
}
