import { z } from 'zod'
import { hrefSchema } from './links'

const linkSchema = z.object({
  label: z.string().trim().min(1, 'Link text is required.').max(60),
  href: hrefSchema.refine((v) => v !== '', 'Choose where the link goes.'),
})
const links = (max: number) => z.array(linkSchema).max(max)

/** Menus shown on the public site. Edited in Admin > Navigation, stored as one JSON row. */
export const navigationSchema = z.object({
  header: links(8),
  footerServices: links(12),
  footerAreas: links(12),
  footerCompany: links(12),
  footerResources: links(12),
  cta: z.object({
    label: z.string().trim().min(1).max(40),
    href: hrefSchema.refine((v) => v !== '', 'Choose where the button goes.'),
  }),
})
export type Navigation = z.infer<typeof navigationSchema>
export type NavLink = z.infer<typeof linkSchema>

export const DEFAULT_NAVIGATION: Navigation = {
  header: [
    { label: 'Home', href: '/' },
    { label: 'Plumbing', href: '/plumbing' },
    { label: 'HVAC', href: '/hvac' },
    { label: 'Denver', href: '/denver' },
    { label: 'Boulder', href: '/boulder' },
    { label: 'For Contractors', href: '/join-us' },
  ],
  footerServices: [
    { label: 'Plumbing Repair', href: '/plumbing/plumbing-repair' },
    { label: 'Water Heater Repair', href: '/plumbing/water-heater-repair' },
    { label: 'Frozen Pipe Repair', href: '/plumbing/frozen-pipe-repair' },
    { label: 'AC Repair', href: '/hvac/ac-repair' },
    { label: 'AC Installation', href: '/hvac/ac-installation' },
  ],
  footerAreas: [
    { label: 'Denver', href: '/denver' },
    { label: 'Boulder', href: '/boulder' },
  ],
  footerCompany: [
    { label: 'Plumbing', href: '/plumbing' },
    { label: 'HVAC', href: '/hvac' },
    { label: 'For Contractors', href: '/join-us' },
    { label: 'Contact', href: '/contact' },
  ],
  footerResources: [
    { label: 'Blog', href: '/blog' },
    { label: 'Request Service', href: '/book-service' },
  ],
  cta: { label: 'Request Service', href: '/book-service' },
}
