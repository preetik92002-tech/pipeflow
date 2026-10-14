import { ArrowRight, ArrowUpRight, Award, CalendarCheck, BadgeCheck, Check, Clock, Droplets, Fan, Flame, Home, Mail, MapPin, Phone, Plus, ShieldCheck, Snowflake, ThermometerSun, ThumbsUp, Users, Wrench, type LucideIcon } from 'lucide-react'
import type { SectionData } from '@/lib/cms-pages/sections/schema'
import type { CmsButton } from '@/lib/cms-pages/links'
import { PHOTOS, HERO_BANNERS, heroBanner, SERVICE_PHOTOS, type Photo } from '@/lib/media/photos'
import { SplitWords } from '@/components/motion/SplitWords'
import { CmsButtons, SmartLink } from './CmsButtons'
import { CmsImage } from './CmsImage'
import { HeroCarousel } from './HeroCarousel'
import { RichTextRenderer } from './RichTextRenderer'

/**
 * Public page sections. Har CMS page inhi se banta hai, isliye design yahan badalne se
 * poori site ek jaisi dikhti hai. Content (data) bilkul wahi rehta hai jo admin ne save kiya.
 *
 * -`tone`: light sections white/paper mein alternate hote hain (SectionRenderer decide karta hai).
 * -`kind`: page ka type (home, location, service) — hero aur kuch layouts isse badalte hain.
 */
export type Tone = 'white' | 'paper'
export type PageKind = 'home' | 'location' | 'service' | 'page'
export interface Crumb {
  label: string
  href?: string
}
/** A real customer review (from the testimonials table), as shown in the home page reviews section. */
export interface ReviewItem {
  name: string
  city?: string
  rating: number
  text: string
  service?: string
  date?: string
  verified?: boolean
  source?: string
}
export interface ReviewStats {
  count: number
  /** Average of the valid ratings, or null when there is none. */
  average: number | null
}
export interface PageContext {
  kind: PageKind
  crumbs: Crumb[]
  cityPhoto?: Photo
  reviews?: ReviewItem[]
  reviewStats?: ReviewStats
}

/** Optional look for a section: dark navy band with slanted (criss-cross) top and bottom edges, optionally ending with the "Questions?" bar. */
export interface Look {
  dark: boolean
  slant: 'a' | 'b' | 'c' // c = straight top edge (right under the hero), slanted bottom
  bar?: boolean
}

const toneBg: Record<Tone, string> = { white: 'bg-white', paper: 'bg-paper' }
const pad = 'py-20 sm:py-24 lg:py-28'

function Band({ tone, children, className = '', labelledBy, look }: { tone: Tone; children: React.ReactNode; className?: string; labelledBy?: string; look?: Look }) {
  if (look?.dark) {
    return (
      <section className={`slant-band slant-${look.slant} soft-texture text-ink ${className}`} aria-labelledby={labelledBy}>
        {children}
      </section>
    )
  }
  return (
    <section className={`${toneBg[tone]} ${pad} ${className}`} aria-labelledby={labelledBy}>
      {children}
    </section>
  )
}

function SectionHeader({
  eyebrow,
  heading,
  intro,
  light = false,
  center = false,
  id,
  compact = false,
}: {
  eyebrow?: string
  heading?: string
  intro?: string
  light?: boolean
  center?: boolean
  id?: string
  compact?: boolean
}) {
  if (!heading && !intro) return null
  return (
    <div className={`max-w-3xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <p data-reveal="fade" className={`eyebrow ${light ? 'eyebrow-light' : ''} ${center ? 'justify-center' : ''}`}>
          {eyebrow}
        </p>
      )}
      {heading && (
        <h2 id={id} data-lines className={`font-display ${compact ? 'text-display-md' : 'text-display-lg'} font-normal ${light ? 'text-white' : 'text-ink'} ${eyebrow ? 'mt-4' : ''}`}>
          {heading}
        </h2>
      )}
      {intro && (
        <p data-reveal style={{ '--reveal-delay': '160ms' } as React.CSSProperties} className={`mt-5 text-lead ${light ? 'text-white/75' : 'text-neutral-600'}`}>
          {intro}
        </p>
      )}
    </div>
  )
}

const pad2 = (n: number) => String(n).padStart(2, '0')
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)

// ------------------------------------------------------------------ hero

function Breadcrumbs({ crumbs, light }: { crumbs: Crumb[]; light: boolean }) {
  if (crumbs.length < 2) return null
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${light ? 'text-white/70' : 'text-neutral-600'}`}>
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className="opacity-50">
                /
              </span>
            )}
            {c.href && i < crumbs.length - 1 ? (
              <SmartLink href={c.href} className={`link-grow ${light ? 'hover:text-white' : 'hover:text-ink'}`}>
                {c.label}
              </SmartLink>
            ) : (
              <span aria-current={i === crumbs.length - 1 ? 'page' : undefined} className={light ? 'text-white' : 'text-ink'}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function HeroCopy({ data, first, light, center }: { data: SectionData<'hero'>; first: boolean; light: boolean; center: boolean }) {
  return (
    <>
      {data.eyebrow && <p className={`eyebrow ${light ? 'eyebrow-light' : ''} ${center ? 'justify-center' : ''}`}>{data.eyebrow}</p>}
      <h1 id={first ? 'page-title' : undefined} className={`hero-h1 mt-5 font-display text-display-2xl font-normal ${light ? 'text-white' : 'text-ink'}`}>
        <SplitWords text={data.heading} />
      </h1>
      {data.subtitle && <p className={`mt-6 max-w-2xl text-lead ${center ? 'mx-auto' : ''} ${light ? 'text-white/85' : 'text-neutral-700'}`}>{data.subtitle}</p>}
      {data.intro && (
        <div className={`mt-5 max-w-2xl space-y-3 leading-relaxed ${center ? 'mx-auto' : ''} ${light ? 'text-white/70' : 'text-neutral-600'}`}>
          {data.intro.split(/\n{2,}/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      <CmsButtons buttons={data.buttons} onDark={light} center={center} />
    </>
  )
}

export function HeroSection({ data, first, ctx }: { data: SectionData<'hero'>; first: boolean; ctx: PageContext }) {
  const center = data.align === 'center'
  // The banner is chosen from the hero's wording; the page's stored image is left untouched.
  const banner = heroBanner(data.heading, data.eyebrow, ...ctx.crumbs.map((c) => c.href ?? c.label))
  if (ctx.kind === 'home') return <HeroCarousel heading={data.heading} labelId={first ? 'page-title' : undefined} />
  return (
    <section data-hero className="relative isolate flex min-h-[460px] items-center overflow-hidden bg-navy-900 text-white lg:min-h-[560px]" aria-labelledby={first ? 'page-title' : undefined}>
      <div className="absolute inset-0 -z-20 select-none">
        <div className="absolute inset-0 hero-clip-reveal">
          <div className="absolute inset-0 hero-photo-settle">
            <div data-hero-media className="absolute inset-0">
              <CmsImage src={banner} alt={data.imageAlt || 'Denver skyline and the Rocky Mountains behind a PipeFlow technician'} priority={first} sizes="100vw" className="object-cover object-[75%_center] sm:object-center" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900/90 via-navy-900/60 to-navy-900/10 sm:via-navy-900/30 sm:to-transparent" aria-hidden="true" />
      <div className={`container-wide w-full py-16 sm:py-20 lg:py-24 ${center ? 'text-center' : ''}`}>
        <Breadcrumbs crumbs={ctx.crumbs} light />
        <div data-hero-content className={`hero-enter ${center ? 'mx-auto max-w-3xl' : 'max-w-2xl'}`}>
          {data.eyebrow && (
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-blue-light/40 bg-brand-blue/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-blue-lighter backdrop-blur-md">
              {data.eyebrow}
            </p>
          )}
          <h1 id={first ? 'page-title' : undefined} className="hero-h1 font-display text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            <SplitWords text={data.heading} />
          </h1>
          {data.subtitle && <p className={`mt-5 text-base leading-relaxed text-neutral-200 lg:text-lg ${center ? 'mx-auto' : ''}`}>{data.subtitle}</p>}
          {data.intro && (
            <div className={`mt-4 space-y-3 leading-relaxed text-neutral-300 ${center ? 'mx-auto' : ''}`}>
              {data.intro.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          <CmsButtons buttons={data.buttons} onDark center={center} className="mt-8" />
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ text

export function RichTextSection({ data, tone }: { data: SectionData<'richText'>; tone: Tone }) {
  return (
    <section className={`${toneBg[tone]} relative overflow-hidden py-16 sm:py-20`}>
      <Avatar pose={3} className="pointer-events-none absolute -bottom-4 right-6 hidden h-72 w-auto opacity-[0.1] lg:block" />
      <div className="container-wide relative">
        <div data-reveal className="max-w-3xl">
          <RichTextRenderer doc={data.content} className="cms-prose text-lead [&>h2:first-child]:mt-0 [&>h2:first-child]:text-display-lg" />
        </div>
      </div>
    </section>
  )
}

export function ContentBlockSection({ data, tone }: { data: SectionData<'contentBlock'>; tone: Tone }) {
  const hasImage = data.image !== '' && data.imagePosition !== 'none'
  const number = /^\d{1,2}$/.test(data.label) ? pad2(Number(data.label)) : null
  const id = `cb-${slug(data.heading)}`

  if (hasImage) {
    return (
      <Band tone={tone} labelledBy={id}>
        <div className="container-wide grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div data-clip className={`photo-frame aspect-[4/3] !rounded-[2.5rem] !rounded-br-[5rem] lg:aspect-[5/4] ${data.imagePosition === 'right' ? 'lg:order-2' : ''}`}>
            <div data-parallax="6" className="absolute inset-0">
              <CmsImage src={data.image} alt={data.imageAlt} sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </div>
          <div data-reveal>
            {number ? <p className="font-display text-sm font-medium tracking-[0.2em] text-terra">{number}</p> : data.label && <p className="eyebrow">{data.label}</p>}
            <h2 id={id} data-lines className="mt-4 font-display text-display-lg font-normal text-ink">
              {data.heading}
            </h2>
            <RichTextRenderer doc={data.content} className="cms-prose mt-6" />
            {data.button && <CmsButtons buttons={[data.button]} />}
          </div>
        </div>
      </Band>
    )
  }

  // Bina image: editorial do-column layout — heading baayein (sticky), content daayein.
  return (
    <Band tone={tone} labelledBy={id} className="relative overflow-hidden">
      <Avatar pose={(data.heading.length % 2 === 0 ? 2 : 4) as 2 | 4} className="pointer-events-none absolute -bottom-6 right-4 hidden h-72 w-auto opacity-[0.1] lg:block" />
      <div className="container-wide relative grid gap-x-16 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-5" data-reveal>
          <div className="lg:sticky lg:top-32">
            {number ? (
              <p
                className="font-display text-[clamp(3.5rem,6vw,5.5rem)] font-normal leading-none tracking-tight text-transparent [-webkit-text-stroke:1.5px_theme(colors.terra.DEFAULT)]"
                aria-hidden="true"
              >
                {number}
              </p>
            ) : (
              data.label && <p className="eyebrow">{data.label}</p>
            )}
            <h2 id={id} data-lines className={`font-display text-display-lg font-normal text-ink ${number ? 'mt-5' : data.label ? 'mt-4' : ''}`}>
              {data.heading}
            </h2>
          </div>
        </div>
        <div className="lg:col-span-7" data-reveal style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>
          <RichTextRenderer doc={data.content} className="cms-prose max-w-2xl" />
          {data.button && <CmsButtons buttons={[data.button]} />}
        </div>
      </div>
    </Band>
  )
}

/** Kai chhote content blocks lagataar hon (jaise home par Residential / Commercial / Find a Pro) to ek row. */
export function ContentBlockGroup({ blocks, tone }: { blocks: SectionData<'contentBlock'>[]; tone: Tone }) {
  return (
    <section className={`${toneBg[tone]} py-16 sm:py-20`}>
      <div className="container-wide">
        {/* Dividers ek hairline ke roop mein: grid ka background line colour, cells apna tone. */}
        <div className={`grid gap-px overflow-hidden border border-line bg-line ${blocks.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {blocks.map((b, i) => (
            <div key={i} className={`${tone === 'paper' ? 'bg-paper' : 'bg-white'} flex flex-col p-8 sm:p-10`} data-reveal style={{ '--reveal-delay': `${i * 90}ms` } as React.CSSProperties}>
              {b.label && <p className="eyebrow">{b.label}</p>}
              <h2 className="mt-4 font-display text-display-md font-normal text-ink">{b.heading}</h2>
              <RichTextRenderer doc={b.content} className="cms-prose mt-4 flex-1 !text-base" />
              {b.button && <CmsButtons buttons={[b.button]} asLinks className="mt-8" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ cards

type Card = SectionData<'featureCards'>['cards'][number]

/** The PipeFlow mascot (transparent PNG), used in a few places on the home page. */
const POSES: Record<number, { src: string; w: number; h: number }> = {
  1: { src: '/images/mascot/pose-1.webp', w: 385, h: 402 }, // worried, pliers
  2: { src: '/images/mascot/pose-2.webp', w: 404, h: 503 }, // fixing a pipe
  3: { src: '/images/mascot/pose-3.webp', w: 385, h: 595 }, // pointing, holding a fitting
  4: { src: '/images/mascot/pose-4.webp', w: 350, h: 458 }, // waving from above
}

/** Mascot. Without `pose` it is the logo mascot; poses 1-4 are the four cut-outs. */
export function Avatar({ className = '', pose }: { className?: string; pose?: 1 | 2 | 3 | 4 }) {
  const img = pose ? POSES[pose] : { src: '/images/avatar.webp', w: 640, h: 802 }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={img.src} alt="" width={img.w} height={img.h} loading="lazy" decoding="async" className={className} aria-hidden="true" />
}

/** Google-Maps-style map of the Denver / Boulder area with a faint photo behind it. Illustrative, not to scale. */
export function FrontRangeMap({ className = '' }: { className?: string }) {
  const cities: [string, number, number][] = [
    ['Longmont', 228, 70], ['Lafayette', 262, 150], ['Broomfield', 236, 196], ['Brighton', 392, 150], ['Arvada', 214, 240],
    ['Westminster', 292, 206], ['Thornton', 368, 214], ['Golden', 170, 292], ['Lakewood', 232, 310], ['Aurora', 400, 292],
    ['Littleton', 262, 372], ['Centennial', 356, 360], ['Parker', 430, 398], ['Castle Rock', 330, 456],
  ]
  const label = { fontFamily: 'Roboto, Inter, system-ui, sans-serif', paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3.5, strokeLinejoin: 'round' } as const
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 ${className}`}>
      <div className="absolute inset-0" aria-hidden="true">
        <CmsImage src={PHOTOS.denverAerial.src} decorative sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
      </div>
      <svg viewBox="0 0 600 520" className="relative block h-auto w-full" role="img" aria-label="Map of the Denver and Boulder service area">
        {/* land (slightly see-through so the photo behind shows faintly) */}
        <rect width="600" height="520" fill="#EEF0F2" fillOpacity="0.88" />
        {/* parks and water */}
        <g fillOpacity="0.9">
          <ellipse cx="96" cy="330" rx="86" ry="130" fill="#CFE8CB" />
          <ellipse cx="500" cy="170" rx="70" ry="48" fill="#D9EDD5" />
          <ellipse cx="196" cy="452" rx="74" ry="38" fill="#D9EDD5" />
          <ellipse cx="420" cy="320" rx="26" ry="14" fill="#A8D4F5" />
          <ellipse cx="128" cy="96" rx="34" ry="16" fill="#A8D4F5" />
        </g>
        <path d="M250 20 C268 120 292 210 286 300 S262 440 280 510" fill="none" stroke="#A8D4F5" strokeWidth="7" strokeLinecap="round" />
        {/* local streets */}
        <g stroke="#fff" strokeWidth="2.2" fill="none">
          {Array.from({ length: 12 }, (_, i) => <path key={`h${i}`} d={`M0 ${36 + i * 42} H600`} />)}
          {Array.from({ length: 14 }, (_, i) => <path key={`v${i}`} d={`M${16 + i * 44} 0 V520`} />)}
        </g>
        {/* highways: outline then fill, like a road map */}
        <g fill="none" strokeLinecap="round">
          {[
            'M312 20 C310 140 306 250 304 330 S300 470 296 510',
            'M20 292 C140 286 240 282 330 284 S520 282 590 288',
            'M306 270 C282 220 220 170 156 130',
          ].map((d) => (
            <g key={d}>
              <path d={d} stroke="#E0A82E" strokeWidth="9" />
              <path d={d} stroke="#F9D26B" strokeWidth="6" />
            </g>
          ))}
          <path d="M420 110 C486 220 486 340 410 440" stroke="#fff" strokeWidth="6" />
          <path d="M420 110 C486 220 486 340 410 440" stroke="#C9CDD2" strokeWidth="2" strokeDasharray="1 7" />
        </g>
        {/* service area */}
        <circle cx="306" cy="270" r="214" fill="#1F5FAD" fillOpacity="0.1" stroke="#1F5FAD" strokeWidth="4" />
        {/* labels */}
        <g fill="#3C4043" fontSize="12.5" fontWeight="500">
          {cities.map(([name, x, y]) => (
            <g key={name}>
              <circle cx={x} cy={y} r="3.5" fill="#70757A" stroke="#fff" strokeWidth="1.5" />
              <text x={x + 8} y={y + 4} style={label}>{name}</text>
            </g>
          ))}
          <text x="124" y="206" style={{ ...label, fontStyle: 'italic' }} fill="#5F6368" fontSize="12">Front Range foothills</text>
        </g>
        {/* Boulder and Denver markers */}
        {([['Boulder', 182, 152], ['Denver', 306, 272]] as const).map(([name, x, y]) => (
          <g key={name} transform={`translate(${x} ${y})`}>
            <path d="M0 0 C-14 -16 -16 -34 0 -38 C16 -34 14 -16 0 0Z" fill="#EA4335" stroke="#B3261E" strokeWidth="1.5" />
            <circle cx="0" cy="-24" r="5" fill="#fff" />
            <text x="16" y="-12" style={label} fill="#202124" fontSize="16" fontWeight="700">{name}</text>
          </g>
        ))}
        {/* map controls */}
        <g transform="translate(548 20)" fontFamily="Roboto, Inter, sans-serif" fontSize="22" fill="#5F6368">
          <rect width="34" height="68" rx="4" fill="#fff" stroke="#DADCE0" />
          <line x1="4" y1="34" x2="30" y2="34" stroke="#DADCE0" />
          <text x="17" y="24" textAnchor="middle">+</text>
          <text x="17" y="58" textAnchor="middle">−</text>
        </g>
        <text x="590" y="508" textAnchor="end" fontSize="9" fill="#5F6368" fontFamily="Roboto, Inter, sans-serif">Illustrative map · not to scale</text>
      </svg>
    </div>
  )
}

/** Mascot standing on the seam between two sections, with a big Book Appointment button. Sits in a zero-height row so no section clips it. */
export function JunctionAvatar({ flip = false, pose }: { flip?: boolean; pose?: 1 | 2 | 3 | 4 }) {
  return (
    <div className="pointer-events-none relative z-20 h-0" aria-hidden={false}>
      <div className={`flex w-full px-2 sm:px-6 lg:px-10 ${flip ? 'justify-start' : 'justify-end'}`}>
        <div className={`pointer-events-auto relative -translate-y-[calc(100%-5.5rem)] ${flip ? 'flex-row-reverse' : ''} flex items-end gap-3 sm:gap-6`}>
          <SmartLink
            href="/book-service"
            className="mb-8 inline-flex items-center gap-2 rounded-2xl bg-brand-red px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-xl shadow-black/25 ring-4 ring-white transition hover:-translate-y-1 hover:bg-brand-red-dark sm:mb-12 sm:px-8 sm:py-4 sm:text-lg"
          >
            <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            Book Appointment
          </SmartLink>
          <Avatar pose={pose} className={`h-40 w-auto flex-none drop-shadow-xl sm:h-56 lg:h-72 ${flip && pose !== 2 ? '-scale-x-100' : ''}`} />
        </div>
      </div>
    </div>
  )
}

/** Angled seam between two sections: a triangle of the next section's colour on top of the previous one's. */
export function SlantDivider({ from, to, flip }: { from: string; to: string; flip: boolean }) {
  return (
    <div className={`relative h-8 sm:h-14 ${from}`} aria-hidden="true">
      <div className={`absolute inset-0 ${to}`} style={{ clipPath: flip ? 'polygon(0 0, 100% 100%, 0 100%)' : 'polygon(100% 0, 100% 100%, 0 100%)' }} />
    </div>
  )
}

/** "Questions? Contact us today!" bar with the mascot standing on its edge. */
function QuestionsBar() {
  return (
    <div className="container-wide mt-14">
      <div className="relative flex flex-col items-start gap-5 rounded-3xl bg-gradient-to-r from-navy-900 to-navy-700 px-6 py-6 shadow-xl sm:flex-row sm:items-center sm:px-10" data-reveal>
        <p className="font-display text-2xl font-bold text-white sm:text-3xl">
          <span className="text-brand-red">Questions?</span> Contact Us Today!
        </p>
        <div className="flex flex-wrap gap-3">
          <SmartLink href="/book-service" className="btn-primary !px-6 !py-3">Request Service</SmartLink>
          <SmartLink href="/find-a-pro" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-navy-800 transition-colors hover:bg-neutral-100">Find a Professional</SmartLink>
        </div>
      </div>
    </div>
  )
}

/** Round icon for a service, picked from its name. */
function serviceIcon(text: string): LucideIcon {
  const t = text.toLowerCase()
  if (/freez|frozen/.test(t)) return Snowflake
  if (/water heater|heater/.test(t)) return Flame
  if (/ac |a\/c|air condition|cooling|\bac\b/.test(t)) return Snowflake
  if (/furnace|heating|hvac repair/.test(t)) return Flame
  if (/maintenance|tune/.test(t)) return ThermometerSun
  if (/hvac|install|replac/.test(t)) return Fan
  if (/plumbing repair|drain|pipe|leak|faucet|fix/.test(t)) return Droplets
  return Wrench
}

/** A service as a white rounded card: round icon badge, bold title, red "Learn More" button. The whole card is the link. */
function ServiceButtonCard({ href, title, text, index, image, imageAlt }: { href: string; title: string; text?: string; index: number; image?: string; imageAlt?: string }) {
  const Icon = serviceIcon(title)
  return (
    <li className={`${text ? 'w-full' : 'w-[calc(50%-0.625rem)]'} sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]`} data-reveal style={{ '--reveal-delay': `${(index % 3) * 70}ms` } as React.CSSProperties}>
      <SmartLink
        href={href}
        className={`group relative flex h-full flex-col items-center rounded-3xl border border-line bg-white text-center shadow-md transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl focus-visible:-translate-y-1.5 focus-visible:shadow-2xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${image ? 'overflow-hidden pb-5 sm:pb-7' : 'px-3 pb-5 pt-11 sm:px-6 sm:pb-7 sm:pt-12'}`}
      >
        {image && (
          <span className="relative block aspect-[16/9] w-full overflow-hidden bg-mist">
            <CmsImage src={image} alt={imageAlt} decorative={!imageAlt} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
          </span>
        )}
        <span className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-navy-800 text-white shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none ${image ? 'relative -mt-7' : 'absolute -top-7'}`}>
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <span className={`font-display text-base font-bold leading-snug text-ink sm:text-2xl ${image ? 'mt-3 px-4' : ''}`}>{title}</span>
        {text && <span className="mt-2 px-4 text-[0.95rem] leading-relaxed text-neutral-600">{text}</span>}
        <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors group-hover:bg-brand-red-dark sm:px-6 sm:py-2.5 sm:text-sm">
          Learn More
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </SmartLink>
    </li>
  )
}

function CardShell({ card, className, children }: { card: Card; className: string; children: React.ReactNode }) {
  return card.href ? (
    <SmartLink href={card.href} className={`group ${className}`}>
      {children}
    </SmartLink>
  ) : (
    <div className={className}>{children}</div>
  )
}

export function FeatureCardsSection({ data, tone, look }: { data: SectionData<'featureCards'>; tone: Tone; look?: Look }) {
  const withImages = data.cards.some((c) => c.image)
  const linked = data.cards.every((c) => c.href)
  const id = data.heading ? `fc-${slug(data.heading)}` : undefined
  const n = data.cards.length

  // "Serving Denver & Boulder": area cards beside a map of the service area.
  if (withImages && linked && /serving|service areas?|denver|boulder|locations?/i.test(data.heading) && n <= 3) {
    return (
      <Band tone={tone} labelledBy={id} className="!py-14 sm:!py-20">
        <div className="container-wide">
          <div className="grid gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 to-navy-700 p-6 text-white sm:p-10 lg:grid-cols-12 lg:items-center lg:gap-12" data-reveal>
            <div className="lg:col-span-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/70">Service areas</p>
              <h2 id={id} className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{data.heading}</h2>
              {data.intro && <p className="mt-3 text-white/80">{data.intro}</p>}
              <ul className="mt-8 space-y-4">
                {data.cards.map((card, i) => (
                  <li key={i}>
                    <SmartLink href={card.href} className="group flex items-center gap-4 rounded-2xl bg-white p-3 text-ink shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
                      <span className="relative block h-20 w-24 flex-none overflow-hidden rounded-xl bg-mist sm:h-24 sm:w-32">
                        {card.image && <CmsImage src={card.image} alt={card.imageAlt} decorative={!card.imageAlt} sizes="128px" className="object-cover" />}
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-xl font-bold">{card.title}</span>
                        {card.text && <span className="mt-1 block text-sm leading-snug text-neutral-600">{card.text}</span>}
                      </span>
                      <span className="mr-1 inline-flex flex-none items-center gap-1 rounded-lg bg-brand-red px-3 py-2 text-xs font-bold text-white">
                        Learn More <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-6">
              <FrontRangeMap className="mx-auto w-full max-w-lg" />
            </div>
          </div>
        </div>
      </Band>
    )
  }

  // Photo cards: the photo on top, the icon badge overlapping it, then title, text and a button.
  if (withImages && linked) {
    return (
      <Band tone={tone} labelledBy={id} look={look} className={look?.dark ? (look.slant === 'c' ? 'slant-pad-c' : 'slant-pad') : '!py-14 sm:!py-20'}>
        <div className="container-wide">
          <SectionHeader heading={data.heading} intro={data.intro} id={id} center />
          <ul className="mt-14 flex flex-wrap justify-center gap-x-5 gap-y-12 sm:gap-x-6">
            {data.cards.map((card, i) => (
              <ServiceButtonCard key={i} href={card.href} title={card.title} text={card.text} index={i} image={card.image || undefined} imageAlt={card.imageAlt} />
            ))}
          </ul>
        </div>
        {look?.bar && <QuestionsBar />}
      </Band>
    )
  }

  // Bina photo, sab linked: article/guide index (badi text rows).
  if (linked && data.cards.length > 0) {
    return (
      <Band tone={tone} labelledBy={id}>
        <div className="container-wide grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader heading={data.heading} intro={data.intro} id={id} />
          </div>
          <ul className="border-t border-line lg:col-span-8">
            {data.cards.map((card, i) => (
              <li key={i} className="border-b border-line" data-reveal style={{ '--reveal-delay': `${i * 60}ms` } as React.CSSProperties}>
                <SmartLink href={card.href} className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-5 py-6 sm:gap-8">
                  <span className="font-display text-sm font-medium text-neutral-600">{pad2(i + 1)}</span>
                  <span>
                    <span className="block font-display text-xl font-normal text-ink transition-colors group-hover:text-terra sm:text-2xl">{card.title}</span>
                    {card.text && <span className="mt-2 block text-neutral-600">{card.text}</span>}
                  </span>
                  <ArrowRight className="h-5 w-5 text-ink transition-transform duration-300 ease-out-expo group-hover:translate-x-1 group-hover:text-terra" aria-hidden="true" />
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </Band>
    )
  }

  // No photo, no link: tinted rounded tiles with a round icon and a bold title.
  const tileIcons = [Users, ShieldCheck, Clock, BadgeCheck, Wrench, Award, ThumbsUp, Home]
  return (
    <Band tone={tone} labelledBy={id}>
      <div className="container-wide">
        <SectionHeader heading={data.heading} intro={data.intro} id={id} />
        <ul className="mt-10 flex flex-wrap justify-center gap-4">
          {data.cards.map((card, i) => {
            const Icon = tileIcons[i % tileIcons.length]
            return (
              <li key={i} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]" data-reveal style={{ '--reveal-delay': `${(i % 3) * 90}ms` } as React.CSSProperties}>
                <CardShell card={card} className="flex h-full items-center gap-5 rounded-2xl bg-brand-blue/10 p-5 sm:p-6">
                  <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-navy-700 text-white shadow-md">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <span>
                    <h3 className="font-display text-lg font-bold leading-snug text-ink">{card.title}</h3>
                    {card.text && <p className="mt-1 text-[0.95rem] leading-snug text-neutral-700">{card.text}</p>}
                  </span>
                </CardShell>
              </li>
            )
          })}
        </ul>
      </div>
    </Band>
  )
}

// ------------------------------------------------------------------ comparison, steps, faq

export function ComparisonSection({ data, tone }: { data: SectionData<'comparison'>; tone: Tone }) {
  const id = `cmp-${slug(data.heading)}`
  return (
    <Band tone={tone} labelledBy={id}>
      <div className="container-wide">
        <div className="relative">
          <SectionHeader heading={data.heading} intro={data.intro} id={id} />
          <Avatar pose={3} className="pointer-events-none absolute -top-6 right-0 hidden h-44 w-auto lg:block" />
        </div>
        <div className={`mt-12 grid gap-5 ${data.columns.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>
          {data.columns.map((col, i) => {
            const dark = i % 2 === 1
            return (
              <div key={i} data-reveal style={{ '--reveal-delay': `${i * 110}ms` } as React.CSSProperties} className={`p-8 sm:p-10 ${dark ? 'bg-ink text-white' : 'rounded-2xl border border-line bg-white'}`}>
                <h3 className={`font-display text-display-md font-normal ${dark ? 'text-white' : 'text-ink'}`}>{col.title}</h3>
                <ul className="mt-7 space-y-4">
                  {col.items.map((item, j) => (
                    <li key={j} className={`flex gap-3 ${dark ? 'text-white/80' : 'text-neutral-700'}`}>
                      <span className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center ${dark ? 'bg-white/10' : 'bg-mist'}`}>
                        <Check className={`h-3.5 w-3.5 ${dark ? 'text-white' : 'text-terra'}`} aria-hidden="true" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
        {data.outro && (
          <p className="mt-10 max-w-3xl text-lead text-neutral-600" data-reveal>
            {data.outro}
          </p>
        )}
        <CmsButtons buttons={data.buttons} />
      </div>
    </Band>
  )
}

export function StepsSection({ data, ctx }: { data: SectionData<'steps'>; ctx: PageContext }) {
  const id = `steps-${slug(data.heading)}`
  const n = data.steps.length
  // Home page, 3-6 steps: a flow chart (illustrated nodes joined by arrows). Other pages keep the plain step grid below.
  if (ctx.kind === 'home' && n >= 3 && n <= 6) {
    const poses = [1, 3, 2, 4] as const
    return (
      <section data-flow className="relative isolate overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 py-16 text-white sm:py-24" aria-labelledby={id}>
        {/* background: dotted texture, soft blue glows and dashed rings instead of a photo */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1.2px)', backgroundSize: '9px 9px' }} />
        <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-brand-blue/30 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-20 bottom-0 -z-10 h-80 w-80 rounded-full bg-brand-red/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[28rem] w-[28rem] rounded-full border border-dashed border-white/15" aria-hidden="true" />
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center" data-reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white/90">How it works</p>
            <h2 id={id} className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {data.heading}
            </h2>
            <p className="mt-4 text-lead text-white/80">{data.intro || `${n} simple steps from your first request to a scheduled visit.`}</p>
          </div>
          <ol className="mt-14 flex flex-col items-stretch gap-2 lg:flex-row lg:items-start lg:gap-0">
            {data.steps.map((step, i) => (
              <li key={i} className="relative flex flex-1 flex-col items-center lg:flex-row lg:items-start" data-reveal style={{ '--reveal-delay': `${i * 110}ms` } as React.CSSProperties}>
                <div className="flex w-full max-w-sm flex-col items-center rounded-3xl bg-white/10 px-6 pb-7 pt-6 text-center ring-1 ring-white/20 backdrop-blur-sm lg:max-w-none lg:flex-1">
                  <span className="relative flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-xl ring-8 ring-white/10">
                    <Avatar pose={poses[i % poses.length]} className="h-24 w-auto max-w-[5.5rem] object-contain" />
                    <span className="absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-red text-base font-extrabold text-white ring-4 ring-navy-800">{i + 1}</span>
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold">{step.title}</h3>
                  {step.text && <p className="mt-2 leading-relaxed text-white/75">{step.text}</p>}
                </div>
                {i < n - 1 && (
                  <span className="flex flex-none items-center justify-center py-3 text-white/70 lg:px-2 lg:py-0 lg:pt-20" aria-hidden="true">
                    <ArrowRight className="h-8 w-8 rotate-90 lg:rotate-0" />
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-10 max-w-2xl text-center text-white/75" data-reveal>
            Describe your project once and we help match you with local plumbing and HVAC professionals in Denver and Boulder.
          </p>
          <CmsButtons buttons={data.buttons} onDark center className="mt-8" />
        </div>
      </section>
    )
  }
  const cols = n === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
  return (
    <section className={`relative isolate overflow-hidden bg-ink text-white ${pad}`} aria-labelledby={id}>
      <div className="container-wide">
        <div className="relative">
          <SectionHeader heading={data.heading} intro={data.intro} light id={id} />
          <Avatar pose={2} className="pointer-events-none absolute -top-2 right-0 hidden h-36 w-auto xl:block" />
        </div>
        <ol className={`mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 ${cols}`}>
          {data.steps.map((step, i) => (
            <li key={i} className="relative border-t border-white/15 pt-7" data-reveal style={{ '--reveal-delay': `${i * 90}ms` } as React.CSSProperties}>
              <span data-step-line className="absolute -top-px left-0 h-px w-full origin-left bg-terra-light" style={{ transform: 'scaleX(0.16)' }} aria-hidden="true" />
              <span className="font-display text-sm font-medium tracking-[0.2em] text-terra-light">Step {pad2(i + 1)}</span>
              <h3 className="mt-3 font-display text-xl font-medium text-white">{step.title}</h3>
              {step.text && <p className="mt-3 leading-relaxed text-white/70">{step.text}</p>}
            </li>
          ))}
        </ol>
        <CmsButtons buttons={data.buttons} onDark className="mt-14" />
      </div>
    </section>
  )
}

export function FaqSection({ data, tone }: { data: SectionData<'faq'>; tone: Tone }) {
  if (!data.items.length) return null
  const id = `faq-${slug(data.heading)}`
  return (
    <Band tone={tone} labelledBy={id}>
      <div className="container-wide grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHeader eyebrow="FAQ" heading={data.heading} id={id} />
            <Avatar pose={1} className="mt-8 hidden h-44 w-auto lg:block" />
          </div>
        </div>
        <div className="border-t border-line lg:col-span-8" data-reveal>
          {data.items.map((item, i) => (
            <details key={i} className="faq-item group border-b border-line">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left font-display text-lg font-medium text-ink transition-colors hover:text-terra sm:text-xl [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center border border-line transition-all duration-300 ease-out-expo group-open:rotate-45 group-open:border-terra group-open:bg-terra group-open:text-white"
                  aria-hidden="true"
                >
                  <Plus className="h-4 w-4" />
                </span>
              </summary>
              <div className="max-w-3xl space-y-3 pb-7 pr-14 leading-relaxed text-neutral-700">
                {item.answer.split(/\n{2,}/).map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </Band>
  )
}

// ------------------------------------------------------------------ calls to action


export function CtaSection({ data, tone }: { data: SectionData<'cta'>; tone: Tone }) {
  const id = `cta-${slug(data.heading)}`
  if (data.tone === 'dark') {
    return (
      <section className="bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-14 text-white sm:py-20" aria-labelledby={id}>
        <div className="container-wide">
          <div className="grid overflow-hidden rounded-3xl bg-navy-700/40 ring-1 ring-white/15 lg:grid-cols-2" data-reveal>
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-blue-light/40 bg-brand-blue/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-blue-lighter">
                Same-day service available
              </p>
              <h2 id={id} className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {data.heading}
              </h2>
              {data.text && (
                <div className="mt-5 space-y-3 text-lead text-white/80">
                  {data.text.split(/\n{2,}/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
              <ul className="mt-6 grid gap-2 text-sm font-semibold text-white/90 sm:grid-cols-2">
                {['Licensed local professionals', 'Easy online scheduling', 'Residential & commercial', 'Serving Denver & Boulder'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 text-brand-red" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
              <CmsButtons buttons={data.buttons} onDark className="mt-8" />
            </div>
            <div className="relative min-h-[240px] lg:min-h-full">
              <CmsImage src={HERO_BANNERS.van} decorative sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover object-right" />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-800/60 to-transparent lg:from-navy-800/40" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className={`${toneBg[tone]} py-16 sm:py-20`} aria-labelledby={id}>
      <div className="container-wide">
        <div className="flex flex-col gap-8 rounded-2xl border border-line bg-white p-8 sm:p-12 lg:flex-row lg:items-end lg:justify-between" data-reveal>
          <div className="max-w-2xl">
            <h2 id={id} className="font-display text-display-lg font-normal text-ink">
              {data.heading}
            </h2>
            {data.text && (
              <div className="mt-4 space-y-2 text-lead text-neutral-600">
                {data.text.split(/\n{2,}/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </div>
          <CmsButtons buttons={data.buttons} className="mt-0 flex-shrink-0" />
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ links, gallery, testimonials, contact

function LinkRows({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="border-t border-line">
      {links.map((l, i) => (
        <li key={i} className="border-b border-line" data-reveal style={{ '--reveal-delay': `${i * 60}ms` } as React.CSSProperties}>
          <SmartLink href={l.href} className="group flex min-h-[3.5rem] items-center justify-between gap-4 py-4 sm:gap-6 sm:py-5">
            <span className="font-display text-lg font-medium leading-snug text-ink transition-colors group-hover:text-terra sm:text-xl">{l.label}</span>
            <span
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-line transition-all duration-300 ease-out-expo group-hover:border-terra group-hover:bg-terra group-hover:text-white"
              aria-hidden="true"
            >
              <ArrowRight className="h-4 w-4" />
            </span>
          </SmartLink>
        </li>
      ))}
    </ul>
  )
}

export function LinkListSection({ data, tone, ctx, look }: { data: SectionData<'linkList'>; tone: Tone; ctx: PageContext; look?: Look }) {
  if (!data.links.length) return null
  const id = `links-${slug(data.heading)}`
  // City page: services ki list ke saath ek lambi city photo (Denver / Boulder).
  if (ctx.kind === 'location' && ctx.cityPhoto) {
    return (
      <Band tone={tone} labelledBy={id}>
        <div className="container-wide grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <SectionHeader heading={data.heading} id={id} />
            <div className="mt-10">
              <LinkRows links={data.links} />
            </div>
          </div>
          <div className="lg:col-span-6">
            <div data-clip className="photo-frame aspect-[4/3] lg:aspect-[4/5]">
              <div data-parallax="6" className="absolute inset-0">
                <CmsImage src={ctx.cityPhoto.src} alt={ctx.cityPhoto.alt} sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </Band>
    )
  }
  // Service-area lists: dark rounded panel with the places in columns and a pin-in-circle graphic.
  if (/\b(areas?|cities|city|neighbou?rhoods?|locations?|communities|serving)\b/i.test(data.heading) && data.links.length >= 4) {
    return (
      <Band tone={tone} labelledBy={id} className="!py-12 sm:!py-16">
        <div className="container-wide">
          <div className="grid gap-10 overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 to-navy-700 p-8 text-white sm:p-12 lg:grid-cols-12" data-reveal>
            <div className="lg:col-span-7">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/70">Service areas</p>
              <h2 id={id} className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {data.heading}
              </h2>
              <ul className="mt-8 columns-2 gap-8 sm:columns-3 [&>li]:mb-2.5">
                {data.links.map((l, i) => (
                  <li key={i} className="break-inside-avoid">
                    <SmartLink href={l.href} className="inline-flex items-center gap-2 text-[0.95rem] text-white/90 transition-colors hover:text-white">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-brand-red" aria-hidden="true" />
                      <span className="link-grow">{l.label}</span>
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden items-center justify-center lg:col-span-5 lg:flex" aria-hidden="true">
              <div className="relative flex h-72 w-72 items-center justify-center rounded-full border-4 border-white/90 bg-brand-blue/30">
                <span className="absolute inset-6 rounded-full border border-dashed border-white/30" />
                <span className="absolute inset-16 rounded-full border border-dashed border-white/20" />
                <MapPin className="h-16 w-16 text-brand-red drop-shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </Band>
    )
  }
  // Service list: icon button cards, no photos.
  return (
    <Band tone={tone} labelledBy={id} look={look} className={look?.dark ? (look.slant === 'c' ? 'slant-pad-c' : 'slant-pad') : '!py-12 sm:!py-16'}>
      <div className="container-wide">
        <SectionHeader heading={data.heading} id={id} center />
        <ul className="mt-12 flex flex-wrap justify-center gap-x-5 gap-y-12 sm:gap-x-6">
          {data.links.map((l, i) => (
            <ServiceButtonCard key={i} href={l.href} title={l.label} index={i} />
          ))}
        </ul>
      </div>
      {look?.bar && <QuestionsBar />}
    </Band>
  )
}

export function GallerySection({ data, tone }: { data: SectionData<'gallery'>; tone: Tone }) {
  if (!data.images.length) return null
  const cols = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[data.columns]
  return (
    <Band tone={tone}>
      <div className="container-wide">
        {data.heading && <SectionHeader heading={data.heading} />}
        <ul className={`mt-10 grid gap-5 ${cols}`}>
          {data.images.map((img, i) => (
            <li key={i} data-reveal style={{ '--reveal-delay': `${(i % 4) * 70}ms` } as React.CSSProperties}>
              <figure>
                <div className="photo-frame aspect-[4/3]">
                  <CmsImage src={img.src} alt={img.alt} sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
                </div>
                {img.caption && <figcaption className="mt-3 text-sm text-neutral-600">{img.caption}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  )
}

/** Sirf asli, admin dwara daale gaye reviews dikhte hain; khaali ho to section render hi nahi hota. */
function GoogleG() {
  return (
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white font-bold" aria-label="Google">
      <span className="bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-lg text-transparent">G</span>
    </span>
  )
}

export function TestimonialsSection({ data }: { data: SectionData<'testimonials'>; tone: Tone }) {
  if (!data.items.length) return null
  const rated = data.items.filter((t) => t.rating)
  const average = rated.length ? (rated.reduce((n, t) => n + (t.rating ?? 0), 0) / rated.length).toFixed(1) : null
  return (
    <section className="bg-gradient-to-b from-navy-800 to-navy-900 pb-16 text-white sm:pb-20 lg:pb-24">
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-brand-blue to-navy-700 pb-24 pt-14 sm:pt-20 lg:pb-28">
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[58%] [clip-path:polygon(16%_0,100%_0,100%_100%,0_100%)] md:block" aria-hidden="true">
          <CmsImage src={HERO_BANNERS.van} decorative sizes="60vw" className="object-cover object-right" />
        </div>
        <div className="container-wide" data-reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Reviews</p>
          <h2 className="mt-3 max-w-md font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{data.heading}</h2>
          {average && (
            <p className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-white/15 px-5 py-3 ring-1 ring-white/25 backdrop-blur">
              <GoogleG />
              <span className="font-display text-3xl font-bold">{average}</span>
              <span className="text-sm text-white/90">
                <span className="block text-amber-300" aria-hidden="true">★★★★★</span>
                Based on {data.items.length} review{data.items.length === 1 ? '' : 's'}
              </span>
            </p>
          )}
        </div>
      </div>
      <div className="container-wide -mt-14 sm:-mt-16">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((t, i) => (
            <li key={i} className="flex flex-col overflow-hidden rounded-2xl bg-white text-ink shadow-xl shadow-black/20" data-reveal style={{ '--reveal-delay': `${(i % 3) * 90}ms` } as React.CSSProperties}>
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                {t.rating && (
                  <p className="text-xl tracking-widest text-amber-500" aria-label={`${t.rating} out of 5 stars`}>
                    {'★'.repeat(t.rating)}
                    {'☆'.repeat(5 - t.rating)}
                  </p>
                )}
                <blockquote className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-neutral-700">“{t.quote}”</blockquote>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4 sm:px-8">
                <p className="text-sm font-bold text-ink">
                  {t.name}
                  {t.location && <span className="font-normal text-neutral-600"> · {t.location}</span>}
                </p>
                <GoogleG />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function ContactInfoSection({ data, tone }: { data: SectionData<'contactInfo'>; tone: Tone }) {
  const rows = [
    { icon: Phone, label: 'Phone', value: data.phone, href: data.phone ? `tel:${data.phone.replace(/[^+\d]/g, '')}` : '' },
    { icon: Mail, label: 'Email', value: data.email, href: data.email ? `mailto:${data.email}` : '' },
    { icon: MapPin, label: 'Address', value: data.address, href: '' },
    { icon: Clock, label: 'Hours', value: data.hours, href: '' },
  ].filter((r) => r.value)
  if (!rows.length) return null
  return (
    <Band tone={tone}>
      <div className="container-wide">
        <div className="relative">
          <SectionHeader heading={data.heading} />
          <Avatar pose={4} className="pointer-events-none absolute -top-4 right-0 hidden h-32 w-auto md:block lg:h-40" />
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-center">
        <dl className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
          {rows.map((r) => (
            <div key={r.label} className="flex gap-4 rounded-2xl border border-line bg-white p-6" data-reveal>
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-mist">
                <r.icon className="h-5 w-5 text-terra" aria-hidden="true" />
              </span>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{r.label}</dt>
                <dd className="mt-1 text-lg text-ink">
                  {r.href ? (
                    <a href={r.href} className="link-grow">
                      {r.value}
                    </a>
                  ) : (
                    r.value
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>
        <div className="rounded-3xl bg-gradient-to-br from-navy-900 to-navy-700 p-5 lg:col-span-5">
          <FrontRangeMap className="mx-auto w-full max-w-md" />
        </div>
        </div>
      </div>
    </Band>
  )
}

/**
 * Photo strip: scroll position se chalti hai (GSAP scrub), apne aap nahi. Poori tarah sajawati, isliye
 * screen readers se chhupi aur alt khaali. Sab photos alag hain.
 */
const MARQUEE_PHRASES = [
  'Expert Plumbing Repairs',
  'AC Repair & Installation',
  'Water Heater Services',
  'Emergency Plumbing',
  'Residential & Commercial',
  'Denver & Boulder',
  'Trusted Local Professionals',
  'Easy Scheduling',
]

/** Thick brand-red strip of bold text that scrolls right to left on its own (CSS only; the text is duplicated for a seamless loop). */
export function TextMarquee() {
  const run = (key: string, hidden: boolean) => (
    <ul key={key} className="flex flex-none items-center" aria-hidden={hidden || undefined}>
      {MARQUEE_PHRASES.map((t) => (
        <li key={t} className="flex flex-none items-center whitespace-nowrap">
          <span>{t}</span>
          <span className="px-6 text-navy-900 sm:px-9" aria-hidden="true">✦</span>
        </li>
      ))}
    </ul>
  )
  return (
    <section data-text-marquee className="relative z-[2] overflow-hidden bg-brand-red text-white" aria-label="What we do">
      <div className="text-marquee-track flex w-max items-center py-5 font-display text-2xl font-extrabold uppercase tracking-tight sm:py-7 sm:text-3xl lg:py-8 lg:text-[2.5rem]">
        {run('a', false)}
        {run('b', true)}
      </div>
    </section>
  )
}

/** About-style block: copy and icon tiles on the left, a big pill-shaped photo on the right. */
export function AboutBlock() {
  const tiles: [LucideIcon, string, string][] = [
    [Users, 'Local', 'Professionals'],
    [CalendarCheck, 'Easy Online', 'Service Requests'],
    [Wrench, 'Plumbing', '& HVAC'],
    [Home, 'Residential', '& Commercial'],
    [MapPin, 'Denver', '& Boulder'],
    [Clock, 'Same-Day', 'Service'],
  ]
  return (
    <section className="bg-white py-16 sm:py-24" aria-labelledby="about-pipeflow">
      <div className="container-wide grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div data-reveal>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-terra">About PipeFlow</p>
          <h2 id="about-pipeflow" className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Plumbing &amp; HVAC Help, Made Simple
          </h2>
          <p className="mt-5 max-w-xl text-lead text-neutral-600">Tell us what you need and we&apos;ll help you find the right local professional serving Denver and Boulder.</p>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
            {tiles.map(([Icon, a, b]) => (
              <li key={a} className="flex items-center gap-3 rounded-2xl bg-brand-blue/10 p-3.5 sm:gap-4 sm:p-5">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-navy-800 text-white sm:h-12 sm:w-12">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </span>
                <span className="text-sm leading-tight text-neutral-700 sm:text-base">
                  <span className="block font-bold text-ink">{a}</span>
                  {b}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <SmartLink href="/book-service" className="btn-primary !px-6 !py-3">Request Service</SmartLink>
            <SmartLink href="/find-a-pro" className="btn-outline !px-6 !py-3">Find a Professional</SmartLink>
          </div>
        </div>
        <div className="relative aspect-[12/7] w-full overflow-hidden rounded-[2.5rem] rounded-br-[6rem] rounded-tl-[6rem] shadow-2xl" data-reveal="scale">
          <CmsImage src="/images/about-handshake.jpg" alt="A PipeFlow professional shaking hands with a customer in front of the PipeFlow van" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>
    </section>
  )
}

/** Customer reviews after the services. Real reviews only; a clearly labelled sample set shows in development builds when there are none. */
const SOURCE_LABEL: Record<string, string> = { google: 'Google', yelp: 'Yelp', bbb: 'BBB' }

/**
 * Customer reviews (home page and service pages). Always renders; with no active reviews it shows a small empty state.
 * Cards show only fields that exist; the count and average come from the same real reviews, and nothing else is claimed.
 */
export function ReviewsSection({ reviews, stats }: { reviews: ReviewItem[]; stats?: ReviewStats; tone?: Tone }) {
  const has = reviews.length > 0
  const average = stats?.average ?? null
  return (
    <section className="bg-gradient-to-b from-navy-800 to-navy-900 pb-14 text-white sm:pb-20" aria-labelledby="home-reviews" data-reviews>
      <div className={`relative isolate overflow-hidden bg-gradient-to-br from-brand-blue to-navy-700 pt-12 sm:pt-16 ${has ? 'pb-28 lg:pb-32' : 'pb-12 sm:pb-16'}`}>
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[52%] [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)] md:block" aria-hidden="true">
          <CmsImage src={HERO_BANNERS.van} decorative sizes="55vw" className="object-cover object-right" />
          <div className="absolute inset-0 bg-navy-900/35" />
        </div>
        <div className="container-wide">
          <div className="max-w-xl" data-reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">Customer Reviews</p>
            <h2 id="home-reviews" className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              What Customers Are Saying
            </h2>
            <p className="mt-4 text-lead text-white/85">Authentic customer reviews collected through the platform or verified sources.</p>
            {!has && (
              <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold ring-1 ring-white/25">
                <Clock className="h-4 w-4 flex-none" aria-hidden="true" />
                Customer reviews will appear here as they become available.
              </p>
            )}
          </div>
        </div>
      </div>
      {has && (
        <div className="container-wide -mt-20 lg:-mt-24">
          <ul className="flex flex-wrap justify-center gap-5">
            {reviews.map((r, i) => (
              <li key={i} className="w-full md:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.85rem)]">
                <figure className="flex h-full flex-col overflow-hidden rounded-3xl bg-white text-ink shadow-2xl shadow-black/25">
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-2xl tracking-wider text-amber-500" aria-label={`${r.rating} out of 5 stars`}>
                        {'★'.repeat(r.rating)}
                        <span className="text-neutral-300">{'★'.repeat(5 - r.rating)}</span>
                      </p>
                      {r.source && SOURCE_LABEL[r.source] && (
                        <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-neutral-700">{SOURCE_LABEL[r.source]}</span>
                      )}
                    </div>
                    <blockquote className="mt-4 flex-1 text-[0.98rem] leading-relaxed text-neutral-700">“{r.text}”</blockquote>
                  </div>
                  <figcaption className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line bg-paper px-6 py-4 sm:px-8">
                    <span className="text-sm font-bold">
                      {r.name}
                      {r.city && <span className="font-normal text-neutral-600"> · {r.city}</span>}
                    </span>
                    <span className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                      {r.service && <span className="rounded-full bg-brand-blue/10 px-3 py-1 font-semibold text-brand-blue">{r.service}</span>}
                      {r.date && <span>{r.date}</span>}
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          {stats && stats.count > 0 && (
            <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-center gap-6 rounded-3xl bg-white/10 px-6 py-6 text-center ring-1 ring-white/20 backdrop-blur sm:flex-row sm:gap-12">
              <p>
                <span className="block font-display text-4xl font-bold">{stats.count}</span>
                <span className="text-sm text-white/80">customer review{stats.count === 1 ? '' : 's'}</span>
              </p>
              {average !== null && (
                <p>
                  <span className="block font-display text-4xl font-bold">{average.toFixed(1)}</span>
                  <span className="text-sm text-white/80">
                    <span className="text-amber-400" aria-hidden="true">★★★★★</span> average rating
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export function SpacerSection({ data }: { data: SectionData<'spacer'> }) {
  const h = { sm: 'h-6', md: 'h-12', lg: 'h-24' }[data.size]
  return <div className={h} aria-hidden="true" />
}

export type { CmsButton }
