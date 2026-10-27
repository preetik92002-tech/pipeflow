import { z } from 'zod'
import { SERVICES } from '@/lib/requests/schema'

/** Services a reviewer can name: the request flow's own catalog, without its "not sure" options. */
export const REVIEW_SERVICES = (['plumbing', 'hvac'] as const).map((category) => ({
  group: category === 'plumbing' ? 'Plumbing' : 'HVAC',
  labels: SERVICES[category].filter((s) => !s.value.startsWith('other-')).map((s) => s.label as string),
}))
const SERVICE_LABELS = new Set(REVIEW_SERVICES.flatMap((g) => g.labels))

export const REVIEW_MIN_LENGTH = 20
export const REVIEW_MAX_LENGTH = 2000

/** One schema for the /reviews form and POST /api/reviews, so both reject the same input with the same message. */
export const reviewSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(80, 'Use 80 characters or fewer for your name.'),
  city: z.string().trim().max(80, 'Use 80 characters or fewer for your city.').optional().or(z.literal('')),
  rating: z.number({ invalid_type_error: 'Choose a star rating.', required_error: 'Choose a star rating.' }).int().min(1, 'Choose a star rating.').max(5),
  text: z
    .string()
    .trim()
    .min(REVIEW_MIN_LENGTH, `Tell us a little more (at least ${REVIEW_MIN_LENGTH} characters).`)
    .max(REVIEW_MAX_LENGTH, `Keep your review under ${REVIEW_MAX_LENGTH} characters.`),
  service: z
    .string()
    .trim()
    .refine((v) => v === '' || SERVICE_LABELS.has(v), 'Choose a service from the list.')
    .optional(),
  email: z.string().trim().min(1, 'Enter your email.').email('Enter a valid email address.').max(254),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please confirm this review is about your own experience.' }) }),
  website_url_hp: z.string().max(500).optional(),
  formOpenedAt: z.string().datetime().optional(),
})

export type ReviewInput = z.infer<typeof reviewSchema>
