'use client'

import { useState, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  Wrench,
  Users,
  BarChart3,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const FEATURES = [
  { icon: BarChart3,    label: 'Live bookings & leads dashboard' },
  { icon: Users,        label: 'Customer & pro management' },
  { icon: Wrench,       label: 'Service area configuration' },
  { icon: CheckCircle,  label: 'Quote & application approvals' },
]

function friendlyError(raw: string): string {
  const msg = raw?.toLowerCase() ?? ''
  if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('wrong password'))
    return 'Invalid email or password. Please try again.'
  if (msg.includes('email not confirmed'))
    return 'Please confirm your email address before signing in.'
  if (msg.includes('too many requests') || msg.includes('rate limit'))
    return 'Too many sign-in attempts. Please wait a moment and try again.'
  if (msg.includes('user not found') || msg.includes('no user'))
    return 'No account found with that email address.'
  return 'An unexpected error occurred. Please try again.'
}

function LoginFormContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirectTo') || '/admin/dashboard'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

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
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(friendlyError(msg))
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    color: '#ffffff',
    backgroundColor: '#0a1628',
    WebkitTextFillColor: '#ffffff',
    caretColor: '#ffffff',
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5" noValidate>
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-700/60 bg-red-950/50 px-4 py-3 text-sm text-red-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-neutral-300">
          Email address
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
            <Mail className="h-4 w-4" />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@pipeflowco.com"
            style={inputStyle}
            className="block w-full rounded-xl border border-navy-700 py-2.5 pl-10 pr-4 text-sm placeholder:text-neutral-600 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-neutral-300">
          Password
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
            <Lock className="h-4 w-4" />
          </span>
          <input
            id="password"
            name="password"
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            style={inputStyle}
            className="block w-full rounded-xl border border-navy-700 py-2.5 pl-10 pr-11 text-sm placeholder:text-neutral-600 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            aria-label={showPass ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="pt-1">
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-blue/30 hover:bg-brand-blue-light focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-navy-950 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <p className="pt-2 text-center text-xs text-neutral-500">
        <Link href="/" className="hover:text-neutral-300 transition-colors">
          ← Return to public website
        </Link>
      </p>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-navy-950">
      {/* LEFT PANEL */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/hero-about.jpg"
            alt="PipeFlow plumbing team at work"
            fill
            sizes="(min-width: 1024px) 60vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/75 to-navy-950/30" />
        </div>

        <div className="relative z-10 flex flex-col h-full px-10 py-12 xl:px-16">
          <Link href="/" className="inline-block w-fit">
            <Image
              src="/assets/logo.png"
              alt="PipeFlow Co."
              width={160}
              height={48}
              className="h-10 w-auto object-contain brightness-0 invert"
              priority
            />
          </Link>

          <div className="mt-auto mb-auto pt-16">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue/40 bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue-lighter mb-4">
              <Shield className="h-3.5 w-3.5" />
              Staff &amp; Operator Portal
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold font-display text-white tracking-tight leading-tight">
              PipeFlow<br />Control Center
            </h1>
            <p className="mt-4 text-base text-neutral-400 max-w-sm">
              Manage bookings, leads, service areas, and your team — all in one secure dashboard.
            </p>

            <ul className="mt-8 space-y-3">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-neutral-300">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-blue/15 text-brand-blue-lighter">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-neutral-600 mt-auto">
            © {new Date().getFullYear()} PipeFlow Plumbing &amp; HVAC. All rights reserved.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <Link href="/">
            <Image
              src="/assets/logo.png"
              alt="PipeFlow Co."
              width={140}
              height={42}
              className="h-9 w-auto object-contain brightness-0 invert"
              priority
            />
          </Link>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-brand-blue/40 bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue-lighter">
            <Shield className="h-3.5 w-3.5" />
            Staff &amp; Operator Portal
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-6 hidden lg:block">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="mt-1 text-sm text-neutral-400">Sign in with your admin credentials to continue.</p>
          </div>
          <div className="mb-6 lg:hidden text-center">
            <h2 className="text-2xl font-bold text-white">PipeFlow Control Center</h2>
            <p className="mt-1 text-sm text-neutral-400">Sign in to access the admin dashboard.</p>
          </div>

          <div className="rounded-2xl border border-navy-800 bg-navy-900/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-10 text-neutral-400 text-sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading…
                </div>
              }
            >
              <LoginFormContent />
            </Suspense>
          </div>

          <p className="mt-4 text-center text-xs text-neutral-600">
            Protected by Supabase Row-Level Security
          </p>
        </div>
      </div>
    </div>
  )
}
