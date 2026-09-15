'use client'

import { useState, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message || 'Invalid login credentials. Please check your email and password.')
        setLoading(false)
        return
      }

      if (data?.user) {
        // Force router refresh so server middleware sees updated cookies
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during authentication.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-navy-900/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-navy-800 sm:px-10">
      {error && (
        <div className="mb-6 rounded-xl bg-red-950/50 border border-red-800/80 p-3.5 flex items-start gap-2.5 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-neutral-300">
            Staff Email Address
          </label>
          <div className="mt-1.5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@pipeflowco.com"
              className="block w-full pl-9 pr-3 py-2.5 bg-navy-950 border border-navy-700 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-neutral-300">
            Password
          </label>
          <div className="mt-1.5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="block w-full pl-9 pr-3 py-2.5 bg-navy-950 border border-navy-700 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Session...</span>
              </>
            ) : (
              <>
                <span>Authenticate &amp; Open Control Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-navy-800 flex items-center justify-between text-2xs text-neutral-400">
        <Link href="/" className="hover:text-white transition-colors">
          &larr; Return to Public Website
        </Link>
        <span>Supabase RLS Protected</span>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <Link href="/" className="inline-block">
            <Image
              src="/assets/logo.png"
              alt="PipeFlow Co."
              width={160}
              height={48}
              className="h-10 w-auto object-contain brightness-0 invert"
              priority
            />
          </Link>
        </div>
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900 border border-navy-700 text-brand-blue-lighter text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-brand-blue-lighter" />
            <span>Staff &amp; Operator Access</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            PipeFlow Control Center
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Sign in with your verified credentials to access administrative tools.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <Suspense fallback={<div className="text-center text-white py-12">Loading login portal...</div>}>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  )
}
