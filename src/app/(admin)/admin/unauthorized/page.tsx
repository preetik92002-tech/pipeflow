'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminUnauthorizedPage() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block">
          <Image
            src="/assets/logo.png"
            alt="PipeFlow Co."
            width={150}
            height={44}
            className="h-9 w-auto object-contain brightness-0 invert mx-auto"
          />
        </Link>

        <div className="mt-8 bg-navy-900 border border-navy-800 rounded-2xl p-8 shadow-2xl text-left">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-bold font-display text-white">Access Restricted</h1>
          <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
            Your Supabase account is authenticated, but your user profile has not been assigned an administrative or dispatch role (`super_admin`, `admin`, `editor`, or `marketing`).
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-navy-800 hover:bg-navy-700 transition-colors border border-navy-700"
            >
              <LogOut className="w-4 h-4 text-neutral-400" />
              <span>Sign Out &amp; Switch Account</span>
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-400" />
              <span>Back to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
