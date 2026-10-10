import type { SiteConfig } from '@/types'

/**
 * Default site configuration.
 * All values marked [PLACEHOLDER] must be replaced with real business data
 * through the admin panel once Supabase is configured.
 */
export const siteConfig: SiteConfig = {
  company: {
    name: 'PipeFlow Co.',
    tagline: 'Flowing Comfort. Built to Last.',
    phone: '(720) 555-0100', // [PLACEHOLDER — replace with real number]
    email: 'hello@pipeflowco.com', // [PLACEHOLDER — replace with real email]
    address: '123 Main Street', // [PLACEHOLDER — replace with real address]
    city: 'Denver',
    state: 'CO',
    zip: '80202', // [PLACEHOLDER]
    license: '',
  },

  nav: [
    { label: 'Home', href: '/' },
    { label: 'Plumbing', href: '/plumbing' },
    { label: 'HVAC', href: '/hvac' },
    { label: 'Denver', href: '/denver' },
    { label: 'Boulder', href: '/boulder' },
    { label: 'For Contractors', href: '/join-us' },
  ],

  ctas: {
    bookService: { label: 'Request Service', href: '/book-service' },
    getQuote: { label: 'Request Service', href: '/book-service' },
    callNow: { label: 'Call Now', phone: '(720) 555-0100' }, // [PLACEHOLDER]
    joinPro: { label: 'Join as a Professional', href: '/join-us' },
  },

  announcement: {
    enabled: true,
    messages: [
      'Plumbing & HVAC help in Denver & Boulder',
    ],
  },

  // Add real links in code or here once the business has these profiles.
  social: {},

  seo: {
    defaultTitle: 'PipeFlow — Plumbing & HVAC Professionals in Denver & Boulder',
    titleTemplate: '%s | PipeFlow',
    defaultDescription:
      'Tell us what you need, find qualified local professionals, and schedule plumbing or HVAC service with confidence in Denver and Boulder, Colorado.',
    keywords: [
      'plumbing Denver',
      'plumbing Boulder',
      'HVAC Denver',
      'HVAC Boulder',
      'water heater repair Denver',
      'water heater repair Boulder',
      'frozen pipe repair Colorado',
      'AC repair Denver',
      'AC installation Boulder',
      'find a plumber Denver',
    ],
  },
}
