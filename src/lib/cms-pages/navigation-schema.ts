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
    { label: 'Commercial', href: '/commercial' },
    { label: 'Find a Pro', href: '/find-a-pro' },
    { label: 'Denver', href: '/denver' },
    { label: 'Boulder', href: '/boulder' },
    { label: 'Resources', href: '/resources' },
  ],
  footerServices: [
    { label: 'Plumbing Repair', href: '/plumbing/plumbing-repair' },
    { label: 'Water Heater Repair', href: '/plumbing/water-heater-repair' },
    { label: 'Water Heater Replacement', href: '/plumbing/water-heater-replacement' },
    { label: 'Frozen Pipe Repair', href: '/plumbing/frozen-pipe-repair' },
    { label: 'Plumbing Fixes', href: '/plumbing/plumbing-fixes' },
    { label: 'AC Repair', href: '/hvac/ac-repair' },
    { label: 'AC Installation', href: '/hvac/ac-installation' },
    { label: 'AC Replacement', href: '/hvac/ac-replacement' },
    { label: 'HVAC Repair', href: '/hvac/hvac-repair' },
    { label: 'HVAC Maintenance', href: '/hvac/hvac-maintenance' },
  ],
  footerAreas: [
    { label: 'Denver', href: '/denver' },
    { label: 'Boulder', href: '/boulder' },
    { label: 'Commercial Plumbing', href: '/commercial/plumbing' },
    { label: 'Commercial HVAC', href: '/commercial/hvac' },
  ],
  footerCompany: [
    { label: 'Find Plumbers', href: '/find-a-pro/plumbers' },
    { label: 'Find HVAC Contractors', href: '/find-a-pro/hvac-contractors' },
    { label: 'Join as a Professional', href: '/for-contractors' },
    { label: 'Contact', href: '/contact' },
  ],
  footerResources: [
    { label: 'Resources', href: '/resources' },
    { label: 'Blog', href: '/blog' },
  ],
  cta: { label: 'Request Service', href: '/book-service' },
}
