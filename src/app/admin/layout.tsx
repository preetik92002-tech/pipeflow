'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Home,
  Users,
  HardHat,
  BookOpen,
  Wrench,
  MapPin,
  Image as ImageIcon,
  Globe,
  Settings,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  MessageSquare,
  CircleHelp,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { createClient } from '@/lib/supabase/client'

const adminNav = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Homepage', href: '/admin/home', icon: Home },
  { label: 'Leads & Inquiries', href: '/admin/leads', icon: Users },
  { label: 'Pro Applications', href: '/admin/pro-applications', icon: HardHat },
  { label: 'Blog Engine', href: '/admin/blogs', icon: BookOpen },
  { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
  { label: 'FAQs', href: '/admin/faqs', icon: CircleHelp },
  { label: 'Services', href: '/admin/services', icon: Wrench },
  { label: 'Service Areas', href: '/admin/service-areas', icon: MapPin },
  { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { label: 'SEO Manager', href: '/admin/seo', icon: Globe },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  // Don't render admin sidebar shell for login and unauthorized pages
  const isBarePage = pathname === '/admin/login' || pathname === '/admin/unauthorized'

  useEffect(() => {
    if (isBarePage) return

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push(`/admin/login?redirectTo=${encodeURIComponent(pathname)}`)
      } else {
        setAuthorized(true)
      }
    })
  }, [pathname, isBarePage, router])

  if (isBarePage) {
    return <>{children}</>
  }

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/admin/login')
      router.refresh()
    } catch {
      router.push('/admin/login')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-navy-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="PipeFlow" width={110} height={32} className="h-7 w-auto" />
          <span className="text-xs font-bold bg-brand-blue/30 text-brand-blue-lighter px-2 py-0.5 rounded-full">
            Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 rounded-lg text-neutral-300 hover:text-white"
        >
          {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'bg-navy-900 text-white w-64 flex-shrink-0 flex flex-col justify-between z-30 transition-all md:static fixed inset-y-0 left-0',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div>
          {/* Logo & Brand */}
          <div className="p-6 border-b border-navy-800 flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Image src="/assets/logo.png" alt="PipeFlow" width={130} height={40} className="h-8 w-auto" />
            </Link>
            <span className="text-2xs font-bold uppercase bg-brand-blue/30 text-brand-blue-lighter px-2 py-0.5 rounded-full">
              CMS
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5" aria-label="Admin navigation">
            {adminNav.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'text-neutral-300 hover:bg-navy-800 hover:text-white'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-neutral-400')} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Status, View Site & Sign Out */}
        <div className="p-4 border-t border-navy-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-2.5 rounded-xl bg-navy-800/80 hover:bg-navy-800 text-neutral-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
              View Public Website
            </span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-200 text-xs font-semibold transition-colors border border-red-900/50"
          >
            <span className="flex items-center gap-2">
              <LogOut className="h-3.5 w-3.5 text-red-300" />
              <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
            </span>
          </button>

          <div className="flex items-center gap-2 px-2 pt-1 text-2xs text-neutral-400">
            <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
            <span>Supabase RLS Protected</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  )
}
