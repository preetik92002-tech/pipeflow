'use client'

import { useState, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { safeRedirect } from '@/lib/auth/redirect'

function friendlyError(raw: string): string {
  const msg = raw?.toLowerCase() ?? ''
  if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('wrong password')) return 'Invalid email or password. Please try again.'
  if (msg.includes('email not confirmed')) return 'Please confirm your email address before signing in.'
  if (msg.includes('too many requests') || msg.includes('rate limit')) return 'Too many sign-in attempts. Please wait a moment and try again.'
  if (msg.includes('user not found') || msg.includes('no user')) return 'No account found with that email address.'
  return 'An unexpected error occurred. Please try again.'
}

const inputCls =
  'block w-full rounded-none border border-field bg-white py-3 pl-11 text-base text-ink placeholder:text-neutral-600 focus:border-ink focus:outline-none focus:ring-2 focus:ring-terra sm:text-sm'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirect(searchParams.get('redirectTo'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(friendlyError(authError.message))
        setLoading(false)
        return
      }
      if (data?.user) {
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err: unknown) {
      setError(friendlyError(err instanceof Error ? err.message : ''))
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5" noValidate>
      {error && (
        <div role="alert" className="flex items-start gap-2.5 border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-ink">
          Email address
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-600">
            <Mail className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className={`${inputCls} pr-4`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-ink">
          Password
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-600">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            id="password"
            name="password"
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className={`${inputCls} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            aria-label={showPass ? 'Hide password' : 'Show password'}
            aria-pressed={showPass}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-700 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-terra"
          >
            {showPass ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-none bg-terra px-4 py-3 text-sm font-bold text-white hover:bg-terra-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Signing in…</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>

      <p className="text-center text-sm">
        <Link href="/" className="text-neutral-700 underline underline-offset-4 hover:text-ink">
          ← Return to public website
        </Link>
      </p>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-paper px-4 py-10 text-ink sm:px-8">
      <div className="login-in w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 block w-fit">
          <Image src="/assets/logo.png" alt="PipeFlow Co." width={160} height={48} className="h-10 w-auto object-contain" priority />
        </Link>

        <div className="border border-line bg-white p-6 sm:p-9">
          <h1 className="font-display text-3xl font-normal leading-tight text-ink">Admin sign in</h1>
          <p className="mb-7 mt-2 text-sm text-neutral-700">Sign in with your staff credentials to continue.</p>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-10 text-sm text-neutral-700">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Loading…
              </div>
            }
          >
            <LoginFormContent />
          </Suspense>
        </div>

        <p className="mt-5 text-center text-xs text-neutral-700">Protected by Supabase Row-Level Security</p>
      </div>
    </main>
  )
}
