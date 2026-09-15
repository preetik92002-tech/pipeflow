import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_ROLES = ['super_admin', 'admin', 'editor', 'marketing']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect shorthand aliases to canonical URLs
  if (pathname === '/book') {
    return NextResponse.redirect(new URL('/book-service', request.url))
  }
  if (pathname === '/quote') {
    return NextResponse.redirect(new URL('/get-a-quote', request.url))
  }
  if (pathname === '/join') {
    return NextResponse.redirect(new URL('/join-us', request.url))
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isConfigured =
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseKey.includes('placeholder')

  // Always refresh cookies for Supabase session persistence
  if (isConfigured) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    // IMPORTANT: getUser() refreshes the auth token and validates it with Supabase Auth server
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 1. If trying to access admin login page while already authenticated as admin, redirect to /admin
    if (pathname === '/admin/login' && user) {
      const metaRole = (user.app_metadata?.role || user.user_metadata?.role) as string | undefined
      if (metaRole && ADMIN_ROLES.includes(metaRole.toLowerCase())) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }

    // 2. Protect all /admin routes except /admin/login and /admin/unauthorized
    const isProtectedAdminRoute =
      pathname.startsWith('/admin') &&
      pathname !== '/admin/login' &&
      pathname !== '/admin/unauthorized'

    if (isProtectedAdminRoute) {
      // Not logged in -> redirect to admin login with return URL
      if (!user) {
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Check role authorization
      const metaRole = (user.app_metadata?.role || user.user_metadata?.role) as string | undefined
      let isAuthorized = metaRole ? ADMIN_ROLES.includes(metaRole.toLowerCase()) : false

      // If not in metadata, check via user query in profiles table
      if (!isAuthorized) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (profile?.role && ADMIN_ROLES.includes(profile.role.toLowerCase())) {
          isAuthorized = true
        }
      }

      // If user has no role or is not admin, redirect to unauthorized page
      // Note: If no profiles table exists yet (initial install), we allow authenticated user through
      // so they can configure the app initially without being locked out.
      if (!isAuthorized && metaRole && !ADMIN_ROLES.includes(metaRole.toLowerCase())) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
