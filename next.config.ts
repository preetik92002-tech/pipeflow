import type { NextConfig } from 'next'

// External origins the app actually loads scripts from or connects to:
// Supabase (API + storage), Google Analytics (gtag.js), Meta Pixel.
// next/font self-hosts fonts at build time, so no external font CDN is needed.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co https://www.facebook.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://www.facebook.com",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Content-Security-Policy', value: csp },
]

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // The old /services and /service-areas pages are replaced by CMS pages at the
  // URLs in the client's structure document. Keep old links and bookmarks working.
  async redirects() {
    return [
      { source: '/get-a-quote', destination: '/book-service', permanent: true },
      { source: '/services', destination: '/', permanent: true },
      { source: '/services/plumbing', destination: '/plumbing', permanent: true },
      { source: '/services/hvac', destination: '/hvac', permanent: true },
      { source: '/services/plumbing/water-heater', destination: '/plumbing/water-heater-repair', permanent: true },
      { source: '/services/hvac/ac-repair', destination: '/hvac/ac-repair', permanent: true },
      { source: '/services/hvac/ac-installation', destination: '/hvac/ac-installation', permanent: true },
      { source: '/services/plumbing/:slug', destination: '/plumbing', permanent: true },
      { source: '/services/hvac/:slug', destination: '/hvac', permanent: true },
      { source: '/services/:path*', destination: '/', permanent: true },
      { source: '/service-areas/boulder', destination: '/boulder', permanent: true },
      { source: '/service-areas/:path*', destination: '/denver', permanent: true },
      { source: '/service-areas', destination: '/denver', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
