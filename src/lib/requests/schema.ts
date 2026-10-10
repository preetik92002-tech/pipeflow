import { z } from 'zod'

export const CITIES = ['Denver', 'Boulder'] as const

export const SERVICES = {
  plumbing: [
    { value: 'plumbing-repair', label: 'Plumbing Repair' },
    { value: 'water-heater-repair', label: 'Water Heater Repair' },
    { value: 'water-heater-replacement', label: 'Water Heater Replacement' },
    { value: 'frozen-pipe-repair', label: 'Frozen Pipe Repair' },
    { value: 'plumbing-fixes', label: 'Plumbing Fixes' },
    { value: 'other-plumbing', label: 'Something else / not sure' },
  ],
  hvac: [
    { value: 'ac-repair', label: 'AC Repair' },
    { value: 'ac-installation', label: 'AC Installation' },
    { value: 'ac-replacement', label: 'AC Replacement' },
    { value: 'hvac-repair', label: 'HVAC Repair' },
    { value: 'hvac-maintenance', label: 'HVAC Maintenance' },
    { value: 'other-hvac', label: 'Something else / not sure' },
  ],
} as const

export const URGENCY = [
  { value: 'emergency', label: 'Emergency', hint: 'Water or safety risk right now' },
  { value: 'today', label: 'Today', hint: 'As soon as possible today' },
  { value: 'soon', label: 'Soon', hint: 'In the next few days' },
  { value: 'flexible', label: 'Flexible', hint: 'Whenever suits' },
] as const

export const WINDOWS = [
  { value: 'any', label: 'Any time' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
] as const

export const PROPERTY_TYPES = ['Office', 'Retail or restaurant', 'Apartment or rental building', 'Industrial or warehouse', 'School, medical or public building', 'Other'] as const

const allServices = [...SERVICES.plumbing, ...SERVICES.hvac].map((s) => s.value) as [string, ...string[]]
const text = (min: number, max: number, message: string) => z.string().trim().min(min, message).max(max)

export const MAX_FILES = 6
export const ATTACHMENT_PATH = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-6]-[a-z0-9._-]{1,80}$/

export const requestSchema = z
  .object({
    customerType: z.enum(['homeowner', 'business']),
    category: z.enum(['plumbing', 'hvac']),
    service: z.enum(allServices),
    description: text(10, 3000, 'Tell us a little about the problem or project (at least 10 characters).'),
    urgency: z.enum(['emergency', 'today', 'soon', 'flexible']),
    city: z.enum(CITIES),
    address: text(3, 200, 'Enter the service address.'),
    zip: z.string().trim().regex(/^80\d{3}$/, 'Enter a 5-digit Colorado ZIP code that starts with 80.'),
    attachments: z.array(z.string().regex(ATTACHMENT_PATH)).max(MAX_FILES).default([]),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid date.').optional().or(z.literal('')),
    preferredWindow: z.enum(['any', 'morning', 'afternoon', 'evening']).default('any'),
    name: text(1, 120, 'Enter your name.'),
    phone: z.string().trim().min(7, 'Enter a valid phone number.').max(30).regex(/^[+()\d.\-\s]+$/, 'Enter a valid phone number.'),
    email: z.string().trim().email('Enter a valid email address.').max(254),
    business: z
      .object({
        name: z.string().trim().max(160).default(''),
        propertyType: z.string().trim().max(80).default(''),
        equipment: z.string().trim().max(500).default(''),
      })
      .optional(),
    website_url_hp: z.string().max(500).optional(),
    formOpenedAt: z.string().datetime().optional(),
    utm_source: z.string().max(250).optional(), utm_medium: z.string().max(250).optional(),
    utm_campaign: z.string().max(250).optional(), utm_term: z.string().max(250).optional(),
    utm_content: z.string().max(250).optional(), gclid: z.string().max(1000).optional(),
    fbclid: z.string().max(1000).optional(), referrer: z.string().max(2000).optional(),
    landingPage: z.string().max(2000).optional(),
  })
  .superRefine((v, ctx) => {
    const valid = SERVICES[v.category].some((s) => s.value === v.service)
    if (!valid) ctx.addIssue({ code: 'custom', path: ['service'], message: 'Choose a service from the list.' })
    if (v.customerType === 'business' && !v.business?.name) {
      ctx.addIssue({ code: 'custom', path: ['business', 'name'], message: 'Enter the business name.' })
    }
  })
export type RequestInput = z.infer<typeof requestSchema>

export const serviceLabel = (value: string) => [...SERVICES.plumbing, ...SERVICES.hvac].find((s) => s.value === value)?.label ?? value

export const uploadRequestSchema = z.object({
  files: z
    .array(z.object({ name: z.string().trim().min(1).max(200), type: z.string().max(100), size: z.number().int().min(1) }))
    .min(1)
    .max(MAX_FILES),
})
