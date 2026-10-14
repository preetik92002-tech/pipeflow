import { ArrowRight, ArrowUpRight, Award, BadgeCheck, Check, Clock, Droplets, Fan, Flame, Home, Mail, MapPin, Phone, Plus, ShieldCheck, Snowflake, ThermometerSun, ThumbsUp, Users, Wrench, type LucideIcon } from 'lucide-react'
import type { SectionData } from '@/lib/cms-pages/sections/schema'
import type { CmsButton } from '@/lib/cms-pages/links'
import { PHOTOS, PROCESS_PHOTOS, HERO_BANNERS, heroBanner, SERVICE_PHOTOS, type Photo } from '@/lib/media/photos'
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
}
export interface PageContext {
  kind: PageKind
  crumbs: Crumb[]
  cityPhoto?: Photo
  reviews?: ReviewItem[]
}

const toneBg: Record<Tone, string> = { white: 'bg-white', paper: 'bg-paper' }
const pad = 'py-20 sm:py-24 lg:py-28'

function Band({ tone, children, className = '', labelledBy }: { tone: Tone; children: React.ReactNode; className?: string; labelledBy?: string }) {
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
    <section className={`${toneBg[tone]} py-16 sm:py-20`}>
      <div className="container-wide">
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
          <div data-clip className={`photo-frame aspect-[4/3] lg:aspect-[4/5] ${data.imagePosition === 'right' ? 'lg:order-2' : ''}`}>
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
    <Band tone={tone} labelledBy={id}>
      <div className="container-wide grid gap-x-16 gap-y-8 lg:grid-cols-12">
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
function ServiceButtonCard({ href, title, text, index }: { href: string; title: string; text?: string; index: number }) {
  const Icon = serviceIcon(title)
  return (
    <li className={`${text ? 'w-full' : 'w-[calc(50%-0.625rem)]'} sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]`} data-reveal style={{ '--reveal-delay': `${(index % 3) * 70}ms` } as React.CSSProperties}>
      <SmartLink
        href={href}
        className="group relative flex h-full flex-col items-center rounded-3xl border border-line bg-white px-3 pb-5 pt-11 text-center shadow-md sm:px-6 sm:pb-7 sm:pt-12 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl focus-visible:-translate-y-1.5 focus-visible:shadow-2xl motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <span className="absolute -top-7 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-navy-800 text-white shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <span className="font-display text-base font-bold leading-snug text-ink sm:text-2xl">{title}</span>
        {text && <span className="mt-2 text-[0.95rem] leading-relaxed text-neutral-600">{text}</span>}
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

export function FeatureCardsSection({ data, tone }: { data: SectionData<'featureCards'>; tone: Tone }) {
  const withImages = data.cards.some((c) => c.image)
  const linked = data.cards.every((c) => c.href)
  const id = data.heading ? `fc-${slug(data.heading)}` : undefined

  // Cards that used photos: no images, each service is an icon card with a button.
  if (withImages && linked) {
    return (
      <Band tone={tone} labelledBy={id} className="!py-14 sm:!py-20">
        <div className="container-wide">
          <SectionHeader heading={data.heading} intro={data.intro} id={id} center />
          <ul className="mt-14 flex flex-wrap justify-center gap-x-5 gap-y-12 sm:gap-x-6">
            {data.cards.map((card, i) => (
              <ServiceButtonCard key={i} href={card.href} title={card.title} text={card.text} index={i} />
            ))}
          </ul>
        </div>
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
        <SectionHeader heading={data.heading} intro={data.intro} id={id} />
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
  // Pinned story sirf home par aur 3-6 steps ke liye. Baaki pages par steps seedhi list rehti hain (hairline scroll se bharti hai).
  if (ctx.kind === 'home' && n >= 3 && n <= 6) {
    return (
      <section data-story className="relative isolate bg-ink text-white" aria-labelledby={id}>
        <div data-story-pin className="relative flex items-center py-20 lg:min-h-screen lg:py-0 lg:pb-10 lg:pt-28">
          <div className="container-wide grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
            <div className="lg:col-span-6 xl:col-span-5">
              <SectionHeader eyebrow="How it works" heading={data.heading} intro={data.intro} light compact id={id} />
              <ol className="mt-9 space-y-6">
                {data.steps.map((step, i) => (
                  <li key={i} data-story-step className="grid grid-cols-[auto_1fr] gap-x-5">
                    <span className="pt-1 font-display text-sm font-medium tracking-[0.2em] text-terra-light">{pad2(i + 1)}</span>
                    <div>
                      <h3 className="font-display text-[clamp(1.35rem,1.1rem+0.9vw,1.85rem)] font-normal leading-tight text-white">{step.title}</h3>
                      {step.text && <p className="mt-2 max-w-md leading-relaxed text-white/70">{step.text}</p>}
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-10 flex items-center gap-5" aria-hidden="true">
                <div className="h-px flex-1 bg-white/15">
                  <div data-story-progress className="h-px origin-left bg-terra-light" />
                </div>
                <span data-story-count className="font-display text-sm tabular-nums text-white/60">
                  01 / {pad2(n)}
                </span>
              </div>
            </div>
            <div className="hidden lg:col-span-6 lg:block xl:col-span-7" aria-hidden="true">
              <div className="photo-frame relative mx-auto aspect-[4/5] max-h-[76vh] w-full max-w-xl bg-ink">
                {data.steps.map((_, i) => (
                  <div key={i} data-story-photo className="absolute inset-0" style={i === 0 ? undefined : { clipPath: 'inset(100% 0% 0% 0%)' }}>
                    <CmsImage src={PROCESS_PHOTOS[i % PROCESS_PHOTOS.length].src} decorative sizes="(min-width: 1024px) 40vw, 0px" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {data.buttons.length > 0 && (
          <div className="container-wide pb-20 pt-2 lg:pb-24">
            <CmsButtons buttons={data.buttons} onDark className="mt-0" />
          </div>
        )}
      </section>
    )
  }
  const cols = n === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
  return (
    <section className={`relative isolate overflow-hidden bg-ink text-white ${pad}`} aria-labelledby={id}>
      <div className="container-wide">
        <SectionHeader heading={data.heading} intro={data.intro} light id={id} />
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

export function LinkListSection({ data, tone, ctx }: { data: SectionData<'linkList'>; tone: Tone; ctx: PageContext }) {
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
    <Band tone={tone} labelledBy={id} className="!py-12 sm:!py-16">
      <div className="container-wide">
        <SectionHeader heading={data.heading} id={id} center />
        <ul className="mt-12 flex flex-wrap justify-center gap-x-5 gap-y-12 sm:gap-x-6">
          {data.links.map((l, i) => (
            <ServiceButtonCard key={i} href={l.href} title={l.label} index={i} />
          ))}
        </ul>
      </div>
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
        <SectionHeader heading={data.heading} />
        <dl className="mt-10 grid gap-5 sm:grid-cols-2">
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
    <section data-text-marquee className="overflow-hidden bg-brand-red text-white" aria-label="What we do">
      <div className="text-marquee-track flex w-max items-center py-5 font-display text-2xl font-extrabold uppercase tracking-tight sm:py-7 sm:text-3xl lg:py-8 lg:text-[2.5rem]">
        {run('a', false)}
        {run('b', true)}
      </div>
    </section>
  )
}

/** Customer reviews after the services. Real reviews only; a clearly labelled sample set shows in development builds when there are none. */
export function ReviewsSection({ reviews, tone }: { reviews: ReviewItem[]; tone: Tone }) {
  const isDev = process.env.NODE_ENV !== 'production'
  const sample = reviews.length === 0 && isDev
  if (reviews.length === 0 && !isDev) return null
  const items: ReviewItem[] = sample
    ? [1, 2, 3].map((n) => ({ name: `Sample reviewer ${n}`, rating: 5, text: 'Development placeholder: this card shows the layout only. Real customer reviews from the admin Testimonials list appear here.', service: 'Plumbing' }))
    : reviews
  return (
    <Band tone={tone} labelledBy="home-reviews" className="!py-14 sm:!py-20">
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-terra">Customer Reviews</p>
          <h2 id="home-reviews" className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 text-lead text-neutral-600">See why homeowners and businesses choose PipeFlow for their plumbing and HVAC needs.</p>
          {sample && <p className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">Development placeholders, hidden in production</p>}
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-5">
          {items.map((r, i) => (
            <li key={i} className="w-full md:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.85rem)]" data-reveal style={{ '--reveal-delay': `${(i % 3) * 90}ms` } as React.CSSProperties}>
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xl tracking-widest text-amber-500" aria-label={`${r.rating} out of 5 stars`}>
                  {'★'.repeat(r.rating)}
                  {'☆'.repeat(5 - r.rating)}
                </p>
                <blockquote className="mt-4 flex-1 leading-relaxed text-neutral-700">“{r.text}”</blockquote>
                <figcaption className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
                  <span className="text-sm font-bold text-ink">
                    {r.name}
                    {r.city && <span className="font-normal text-neutral-600"> · {r.city}</span>}
                  </span>
                  {r.service && <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">{r.service}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  )
}

export function SpacerSection({ data }: { data: SectionData<'spacer'> }) {
  const h = { sm: 'h-6', md: 'h-12', lg: 'h-24' }[data.size]
  return <div className={h} aria-hidden="true" />
}

export type { CmsButton }
