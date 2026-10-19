import { ArrowRight, Award, BadgeCheck, Check, Clock, Droplets, Fan, Flame, Home, Info, Mail, MapPin, Phone, Plus, ShieldCheck, Snowflake, ThermometerSun, ThumbsUp, Users, Wrench, type LucideIcon } from 'lucide-react'
import type { SectionData } from '@/lib/cms-pages/sections/schema'
import type { CmsButton } from '@/lib/cms-pages/links'
import { heroBanner, servicePhotoFor, SERVICE_PHOTOS, type Photo } from '@/lib/media/photos'
import { CmsButtons, SmartLink } from './CmsButtons'
import { CmsImage } from './CmsImage'
import { FrontRangeMap } from './FrontRangeMap'
import { ExpandOnDesktop } from './ExpandOnDesktop'
import { HomeHero } from './HomeHero'
import { RichTextRenderer } from './RichTextRenderer'

export { FrontRangeMap }

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
  /** Paths ('/plumbing') of the linked CMS pages that are live. When set, service pages withhold links to any other CMS page. */
  liveHrefs?: ReadonlySet<string>
}

const toneBg: Record<Tone, string> = { white: 'bg-white', paper: 'bg-paper' }
const pad = 'section-y'

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
      {eyebrow && <p className={`ui-kicker ${light ? '!text-terra-light' : ''}`}>{eyebrow}</p>}
      {heading && (
        <h2 id={id} data-lines className={`font-display ${compact ? 'text-display-md' : 'text-display-lg'} font-semibold ${light ? 'text-white' : 'text-ink'} ${eyebrow ? 'mt-2' : ''}`}>
          {heading}
        </h2>
      )}
      {intro && <p className={`mt-3 max-w-prose text-lead ${center ? 'mx-auto' : ''} ${light ? 'text-white/75' : 'text-neutral-600'}`}>{intro}</p>}
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
const paragraphs = (text: string) => text.split(/\n{2,}/).filter((p) => p.trim())

// ------------------------------------------------------------------ hero

function Breadcrumbs({ crumbs, light }: { crumbs: Crumb[]; light: boolean }) {
  if (crumbs.length < 2) return null
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.85rem] ${light ? 'text-white/70' : 'text-neutral-600'}`}>
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className="opacity-50">
                /
              </span>
            )}
            {c.href && i < crumbs.length - 1 ? (
              <SmartLink href={c.href} className={`underline-offset-4 hover:underline ${light ? 'hover:text-white' : 'hover:text-ink'}`}>
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

/**
 * Page hero for every CMS page except the homepage. A compact banner: the wide photo shows on the right (desktop) or as a
 * short band on top (phones), the heading, subtitle and buttons sit on navy. Longer introduction text moves to an
 * overview strip right below, beside a relevant photo, so the banner stays short and the text gets an image to balance it.
 */
export function HeroSection({ data, first, ctx }: { data: SectionData<'hero'>; first: boolean; ctx: PageContext }) {
  if (ctx.kind === 'home') return <HomeHero labelId={first ? 'page-title' : undefined} />
  const center = data.align === 'center'
  // The banner is chosen from the hero's wording; an image chosen in the editor is shown in the overview strip.
  const trail = ctx.crumbs.map((c) => c.href ?? c.label)
  const banner = heroBanner(data.heading, data.eyebrow, ...trail)
  const intro = paragraphs(data.intro)
  const photo = data.image ? { src: data.image, alt: data.imageAlt } : ctx.cityPhoto ? { src: ctx.cityPhoto.src, alt: ctx.cityPhoto.alt } : servicePhotoFor(data.heading, ...trail)
  return (
    <>
      <section data-hero className="relative isolate overflow-hidden bg-navy-900 text-white" aria-labelledby={first ? 'page-title' : undefined}>
        <div className="relative aspect-[16/6] select-none sm:aspect-[16/5] lg:absolute lg:inset-0 lg:aspect-auto" aria-hidden="true">
          <div className="absolute inset-0 hero-clip-reveal">
            <div className="absolute inset-0 hero-photo-settle">
              <div data-hero-media className="absolute inset-0">
                <CmsImage src={banner} alt={data.imageAlt || 'Denver skyline and the Rocky Mountains behind a PipeFlow technician'} priority={first} sizes="100vw" className="object-cover object-right" />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent lg:bg-gradient-to-r lg:from-navy-900 lg:via-navy-900/70 lg:via-40% lg:to-transparent lg:to-75%" />
        </div>
        <div className={`container-wide relative pb-8 pt-2 lg:flex lg:min-h-[380px] lg:items-center lg:py-12 ${center ? 'lg:justify-center lg:text-center' : ''}`}>
          <div data-hero-content className={`hero-enter ${center ? 'mx-auto max-w-3xl' : 'max-w-2xl'}`}>
            <Breadcrumbs crumbs={ctx.crumbs} light />
            {data.eyebrow && <p className="ui-kicker !text-terra-light">{data.eyebrow}</p>}
            <h1 id={first ? 'page-title' : undefined} className="hero-h1 mt-2 font-display text-display-xl font-semibold text-white [text-wrap:balance]">
              {data.heading}
            </h1>
            {data.subtitle && <p className={`mt-3 max-w-prose text-[1.02rem] leading-relaxed text-white/85 lg:text-lg ${center ? 'mx-auto' : ''}`}>{data.subtitle}</p>}
            <CmsButtons buttons={data.buttons} onDark center={center} className="mt-6" />
          </div>
        </div>
      </section>
      {intro.length > 0 && (
        <section className="border-b border-line bg-white py-10 sm:py-12" aria-label="Overview">
          <div className={`container-wide grid gap-6 lg:items-center lg:gap-12 ${photo ? 'lg:grid-cols-12' : ''}`}>
            <div className={`space-y-3 text-[1.02rem] leading-relaxed text-neutral-700 ${photo ? 'lg:col-span-7' : 'max-w-prose'}`}>
              {intro.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {photo && (
              <div data-clip className="photo-frame relative aspect-[16/9] lg:col-span-5 lg:aspect-[3/2]">
                <div data-parallax="4" className="absolute inset-0">
                  <CmsImage src={photo.src} alt={photo.alt} sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}

// ------------------------------------------------------------------ text

export function RichTextSection({ data, tone }: { data: SectionData<'richText'>; tone: Tone }) {
  return (
    <section className={`${toneBg[tone]} section-y-sm`}>
      <div className="container-wide">
        <div className="max-w-3xl">
          <RichTextRenderer doc={data.content} className="cms-prose cms-lists-2 [&>h2:first-child]:mt-0" />
        </div>
      </div>
    </section>
  )
}

export function ContentBlockSection({ data, tone }: { data: SectionData<'contentBlock'>; tone: Tone }) {
  const hasImage = data.image !== '' && data.imagePosition !== 'none'
  const number = /^\d{1,2}$/.test(data.label) ? pad2(Number(data.label)) : null
  const id = `cb-${slug(data.heading)}`
  const label = number ? <span className="ui-kicker">Step {number}</span> : data.label && <p className="ui-kicker">{data.label}</p>

  if (hasImage) {
    return (
      <Band tone={tone} labelledBy={id}>
        <div className="container-wide grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div data-clip className={`photo-frame aspect-[16/10] lg:aspect-[4/3] ${data.imagePosition === 'right' ? 'lg:order-2' : ''}`}>
            <div data-parallax="6" className="absolute inset-0">
              <CmsImage src={data.image} alt={data.imageAlt} sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </div>
          <div>
            {label}
            <h2 id={id} data-lines className="mt-2 font-display text-display-lg font-semibold text-ink">
              {data.heading}
            </h2>
            <RichTextRenderer doc={data.content} className="cms-prose mt-4" />
            {data.button && <CmsButtons buttons={[data.button]} className="mt-6" />}
          </div>
        </div>
      </Band>
    )
  }

  // Bina image: a readable column; long lists flow into two columns on wide screens.
  return (
    <Band tone={tone} labelledBy={id}>
      <div className="container-wide">
        <div className="max-w-4xl">
          {label}
          <h2 id={id} data-lines className={`font-display text-display-lg font-semibold text-ink ${label ? 'mt-2' : ''}`}>
            {data.heading}
          </h2>
          <RichTextRenderer doc={data.content} className="cms-prose cms-lists-2 mt-4" />
          {data.button && <CmsButtons buttons={[data.button]} className="mt-6" />}
        </div>
      </div>
    </Band>
  )
}

/**
 * Consecutive text blocks (Repair / Replacement / Installation, or Residential / Commercial / Find a Pro) as one row of
 * cards instead of a tall stack of full-width sections. Each card keeps its full content and its button.
 */
export function ContentBlockGroup({ blocks, tone }: { blocks: SectionData<'contentBlock'>[]; tone: Tone }) {
  const cols = blocks.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
  return (
    <section className={`${toneBg[tone]} section-y-sm`}>
      <div className="container-wide">
        <div className={`grid gap-4 md:grid-cols-2 ${cols}`}>
          {blocks.map((b, i) => {
            const number = /^\d{1,2}$/.test(b.label) ? pad2(Number(b.label)) : null
            return (
              <article key={i} className={`ui-card flex flex-col p-5 sm:p-6 ${blocks.length === 3 ? 'md:last:col-span-2 lg:last:col-span-1' : ''}`} aria-labelledby={`cbg-${slug(b.heading)}`}>
                {number ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-white" aria-hidden="true">
                    {Number(b.label)}
                  </span>
                ) : (
                  b.label && <p className="ui-kicker">{b.label}</p>
                )}
                <h2 id={`cbg-${slug(b.heading)}`} className={`font-display text-display-md font-semibold text-ink ${number || b.label ? 'mt-3' : ''}`}>
                  {b.heading}
                </h2>
                {JSON.stringify(b.content).length > 900 ? (
                  <ExpandOnDesktop summary={`More about ${b.heading.toLowerCase()}`}>
                    <RichTextRenderer doc={b.content} className="cms-prose cms-prose-sm mt-1 lg:mt-3" />
                  </ExpandOnDesktop>
                ) : (
                  <RichTextRenderer doc={b.content} className="cms-prose cms-prose-sm mt-3 flex-1" />
                )}
                {b.button && (
                  <SmartLink href={b.button.href} className="group mt-5 inline-flex items-center gap-1.5 self-start font-semibold text-terra hover:text-terra-dark">
                    <span className="underline decoration-terra/30 underline-offset-4 group-hover:decoration-terra">{b.button.label}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </SmartLink>
                )}
              </article>
            )
          })}
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

/** A compact service link: small photo (when there is one for that page) or an icon, the name, an optional line, an arrow. */
function ServiceLinkCard({ href, title, text, image, imageAlt }: { href: string; title: string; text?: string; image?: string; imageAlt?: string }) {
  const Icon = serviceIcon(title)
  const photo = image || SERVICE_PHOTOS[href]?.src
  return (
    <li>
      <SmartLink href={href} className="ui-card-link group flex h-full items-center gap-4 p-3 pr-4">
        {photo ? (
          <span className="relative block h-16 w-20 flex-none overflow-hidden rounded-lg bg-mist sm:h-[4.5rem] sm:w-24">
            <CmsImage src={photo} alt={imageAlt} decorative={!imageAlt} sizes="96px" className="object-cover" />
          </span>
        ) : (
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-paper text-terra">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug text-ink group-hover:text-terra">{title}</span>
          {text && <span className="mt-0.5 line-clamp-2 text-[0.88rem] leading-snug text-neutral-600">{text}</span>}
        </span>
        <ArrowRight className="h-4 w-4 flex-none text-ink/50 transition-transform group-hover:translate-x-0.5 group-hover:text-terra" aria-hidden="true" />
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
  const n = data.cards.length

  // "Serving Denver & Boulder": area cards beside a map of the service area.
  if (withImages && linked && /serving|service areas?|denver|boulder|locations?/i.test(data.heading) && n <= 3) {
    return (
      <section className={`bg-ink text-white ${pad}`} aria-labelledby={id} data-dark>
        <div className="container-wide grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-6">
            <SectionHeader eyebrow="Service areas" heading={data.heading} intro={data.intro} id={id} light />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {data.cards.map((card, i) => (
                <li key={i}>
                  <SmartLink href={card.href} className="group flex h-full items-center gap-3 rounded-xl bg-white p-2.5 pr-4 text-ink transition-shadow hover:shadow-card-hover">
                    <span className="relative block h-16 w-20 flex-none overflow-hidden rounded-lg bg-mist">
                      {card.image && <CmsImage src={card.image} alt={card.imageAlt} decorative={!card.imageAlt} sizes="80px" className="object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{card.title}</span>
                      {card.text && <span className="mt-0.5 line-clamp-2 text-[0.82rem] leading-snug text-neutral-600">{card.text}</span>}
                    </span>
                    <ArrowRight className="h-4 w-4 flex-none text-terra" aria-hidden="true" />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden lg:col-span-6 lg:block">
            <FrontRangeMap className="mx-auto w-full max-w-md" />
          </div>
        </div>
      </section>
    )
  }

  // Photo cards: photo on top, then title, text and a "Learn more" link. Content-height cards, no forced blank space.
  if (withImages && linked) {
    return (
      <Band tone={tone} labelledBy={id}>
        <div className="container-wide">
          <SectionHeader heading={data.heading} intro={data.intro} id={id} />
          <ul className={`mt-8 grid gap-5 sm:grid-cols-2 ${n >= 3 ? 'lg:grid-cols-3' : ''}`}>
            {data.cards.map((card, i) => {
              const photo = card.image || SERVICE_PHOTOS[card.href]?.src
              return (
                <li key={i}>
                  <SmartLink href={card.href} className="ui-card-link group flex h-full flex-col overflow-hidden">
                    {photo && (
                      <span className="relative block aspect-[16/9] w-full overflow-hidden bg-mist">
                        <CmsImage src={photo} alt={card.imageAlt} decorative={!card.imageAlt} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                      </span>
                    )}
                    <span className="flex flex-1 flex-col p-5">
                      <span className="ui-h3 group-hover:text-terra">{card.title}</span>
                      {card.text && <span className="mt-2 text-[0.95rem] leading-relaxed text-neutral-600">{card.text}</span>}
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-terra">
                        Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </span>
                  </SmartLink>
                </li>
              )
            })}
          </ul>
        </div>
      </Band>
    )
  }

  // Bina photo, sab linked: article/guide index (compact text rows).
  if (linked && data.cards.length > 0) {
    return (
      <Band tone={tone} labelledBy={id}>
        <div className="container-wide grid gap-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <SectionHeader heading={data.heading} intro={data.intro} id={id} />
          </div>
          <ul className="border-t border-line lg:col-span-8">
            {data.cards.map((card, i) => (
              <li key={i} className="border-b border-line">
                <SmartLink href={card.href} className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 py-4 sm:gap-6">
                  <span className="text-sm font-medium tabular-nums text-neutral-500">{pad2(i + 1)}</span>
                  <span>
                    <span className="block font-semibold text-ink transition-colors group-hover:text-terra sm:text-lg">{card.title}</span>
                    {card.text && <span className="mt-1 block text-[0.95rem] text-neutral-600">{card.text}</span>}
                  </span>
                  <ArrowRight className="h-4 w-4 text-ink transition-transform group-hover:translate-x-0.5 group-hover:text-terra" aria-hidden="true" />
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </Band>
    )
  }

  // No photo, no link: compact tiles with an icon and a title.
  const tileIcons = [Users, ShieldCheck, Clock, BadgeCheck, Wrench, Award, ThumbsUp, Home]
  return (
    <Band tone={tone} labelledBy={id}>
      <div className="container-wide">
        <SectionHeader heading={data.heading} intro={data.intro} id={id} />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.cards.map((card, i) => {
            const Icon = tileIcons[i % tileIcons.length]
            return (
              <li key={i}>
                <CardShell card={card} className="ui-card flex h-full items-start gap-4 p-4">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-paper text-terra">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <h3 className="font-semibold leading-snug text-ink">{card.title}</h3>
                    {card.text && <p className="mt-1 text-[0.93rem] leading-snug text-neutral-600">{card.text}</p>}
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

// ------------------------------------------------------------------ comparison, steps

/** Side-by-side options (tank vs tankless, repair vs replace). Stacks into cards on phones: no sideways scrolling. */
export function ComparisonSection({ data, tone }: { data: SectionData<'comparison'>; tone: Tone }) {
  const id = `cmp-${slug(data.heading)}`
  return (
    <Band tone={tone} labelledBy={id}>
      <div className="container-wide">
        <SectionHeader heading={data.heading} intro={data.intro} id={id} />
        <div className={`mt-8 grid gap-4 ${data.columns.length === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
          {data.columns.map((col, i) => (
            <div key={i} className={`rounded-xl p-5 sm:p-6 ${i % 2 === 1 ? 'bg-ink text-white' : 'border border-line bg-white'}`}>
              <h3 className={`font-display text-display-md font-semibold ${i % 2 === 1 ? 'text-white' : 'text-ink'}`}>{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item, j) => (
                  <li key={j} className={`flex gap-2.5 text-[0.95rem] leading-relaxed ${i % 2 === 1 ? 'text-white/85' : 'text-neutral-700'}`}>
                    <Check className={`mt-1 h-4 w-4 flex-shrink-0 ${i % 2 === 1 ? 'text-terra-light' : 'text-terra'}`} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {data.outro && <p className="mt-6 max-w-prose text-[1.02rem] leading-relaxed text-neutral-600">{data.outro}</p>}
        <CmsButtons buttons={data.buttons} className="mt-6" />
      </div>
    </Band>
  )
}

export function StepsSection({ data, tone = 'paper' }: { data: SectionData<'steps'>; ctx: PageContext; tone?: Tone }) {
  const id = `steps-${slug(data.heading)}`
  const n = data.steps.length
  const cols = n % 3 === 0 || n === 5 ? 'lg:grid-cols-3' : n >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'
  return (
    <section className={`${toneBg[tone]} ${pad}`} aria-labelledby={id}>
      <div className="container-wide">
        <SectionHeader eyebrow="How it works" heading={data.heading} intro={data.intro} id={id} />
        <ol className={`mt-8 grid gap-3 sm:grid-cols-2 ${cols}`}>
          {data.steps.map((step, i) => (
            <li key={i} className="ui-card relative overflow-hidden p-5">
              <span data-step-line className="absolute inset-x-0 top-0 h-1 bg-terra/80" aria-hidden="true" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-bold text-white" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-ink">{step.title}</h3>
              {step.text && <p className="mt-1.5 text-[0.93rem] leading-relaxed text-neutral-600">{step.text}</p>}
            </li>
          ))}
        </ol>
        <CmsButtons buttons={data.buttons} className="mt-6" />
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ faq

/** One accessible FAQ list (native disclosure: keyboard and screen-reader support built in). Used by every page that has questions. */
export function FaqAccordion({ items, className = '' }: { items: { question: string; answer: string }[]; className?: string }) {
  return (
    <div className={`divide-y divide-line rounded-xl border border-line bg-white ${className}`}>
      {items.map((item, i) => (
        <details key={i} className="faq-item group">
          <summary className="flex min-h-[3.25rem] cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-left text-[0.98rem] font-semibold text-ink hover:text-terra sm:px-5 [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-line text-ink transition-transform duration-200 group-open:rotate-45 group-open:border-terra group-open:text-terra" aria-hidden="true">
              <Plus className="h-3.5 w-3.5" />
            </span>
          </summary>
          <div className="max-w-prose space-y-2.5 px-4 pb-4 text-[0.95rem] leading-relaxed text-neutral-700 sm:px-5">
            {item.answer.split(/\n{2,}/).map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}

export function FaqSection({ data, tone }: { data: SectionData<'faq'>; tone: Tone }) {
  if (!data.items.length) return null
  const id = `faq-${slug(data.heading)}`
  return (
    <Band tone={tone} labelledBy={id}>
      <div className="container-wide grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <SectionHeader eyebrow="FAQ" heading={data.heading} id={id} />
        </div>
        <FaqAccordion items={data.items} className="lg:col-span-8" />
      </div>
    </Band>
  )
}

// ------------------------------------------------------------------ calls to action

/**
 * Closing call to action. Shows only the editor's own heading, text and buttons plus the standard availability note:
 * no badges or claims (licensing, same-day service) that the business has not confirmed.
 */
export function CtaSection({ data, tone }: { data: SectionData<'cta'>; tone: Tone }) {
  const id = `cta-${slug(data.heading)}`
  if (data.tone === 'dark') {
    return (
      <section className="bg-ink py-12 text-white sm:py-14" aria-labelledby={id} data-dark>
        <div className="container-wide flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <h2 id={id} className="font-display text-display-lg font-semibold text-white">
              {data.heading}
            </h2>
            {data.text && (
              <div className="mt-3 space-y-2 text-[1.02rem] leading-relaxed text-white/80">
                {paragraphs(data.text).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            <p className="mt-3 flex items-start gap-2 text-sm text-white/60">
              <Info className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
              Submitting a request does not guarantee immediate service or provider availability.
            </p>
          </div>
          <CmsButtons buttons={data.buttons} onDark className="mt-0 flex-shrink-0" />
        </div>
      </section>
    )
  }
  return (
    <section className={`${toneBg[tone]} section-y-sm`} aria-labelledby={id}>
      <div className="container-wide">
        <div className="flex flex-col gap-5 rounded-xl border border-line bg-white p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 id={id} className="font-display text-display-md font-semibold text-ink">
              {data.heading}
            </h2>
            {data.text && (
              <div className="mt-2 space-y-2 text-[1rem] leading-relaxed text-neutral-600">
                {paragraphs(data.text).map((p, i) => (
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
        <li key={i} className="border-b border-line">
          <SmartLink href={l.href} className="group flex min-h-[3.25rem] items-center justify-between gap-4 py-3">
            <span className="font-semibold leading-snug text-ink transition-colors group-hover:text-terra sm:text-lg">{l.label}</span>
            <ArrowRight className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-terra" aria-hidden="true" />
          </SmartLink>
        </li>
      ))}
    </ul>
  )
}

export function LinkListSection({ data, tone, ctx }: { data: SectionData<'linkList'>; tone: Tone; ctx: PageContext }) {
  if (!data.links.length) return null
  const id = `links-${slug(data.heading)}`
  // City page: the list of services beside a photo of the city (Denver / Boulder).
  if (ctx.kind === 'location' && ctx.cityPhoto) {
    return (
      <Band tone={tone} labelledBy={id}>
        <div className="container-wide grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <SectionHeader heading={data.heading} id={id} />
            <div className="mt-6">
              <LinkRows links={data.links} />
            </div>
          </div>
          <div className="lg:col-span-6">
            <div data-clip className="photo-frame aspect-[16/10] lg:aspect-[4/3]">
              <div data-parallax="6" className="absolute inset-0">
                <CmsImage src={ctx.cityPhoto.src} alt={ctx.cityPhoto.alt} sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </Band>
    )
  }
  // Service-area lists: the places in columns on a navy panel.
  if (/\b(areas?|cities|city|neighbou?rhoods?|locations?|communities|serving)\b/i.test(data.heading) && data.links.length >= 4) {
    return (
      <section className={`bg-ink text-white ${pad}`} aria-labelledby={id} data-dark>
        <div className="container-wide">
          <SectionHeader eyebrow="Service areas" heading={data.heading} id={id} light />
          <ul className="mt-6 columns-2 gap-8 sm:columns-3 lg:columns-4 [&>li]:mb-2.5">
            {data.links.map((l, i) => (
              <li key={i} className="break-inside-avoid">
                <SmartLink href={l.href} className="inline-flex items-center gap-2 text-[0.95rem] text-white/90 hover:text-white hover:underline hover:underline-offset-4">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-terra-light" aria-hidden="true" />
                  {l.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }
  // Service list (category pages, related services): compact link cards with the page's photo or an icon.
  return (
    <Band tone={tone} labelledBy={id}>
      <div className="container-wide">
        <SectionHeader heading={data.heading} id={id} />
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.links.map((l, i) => (
            <ServiceLinkCard key={i} href={l.href} title={l.label} />
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
        <ul className={`mt-8 grid gap-4 ${cols}`}>
          {data.images.map((img, i) => (
            <li key={i}>
              <figure>
                <div className="photo-frame aspect-[4/3]">
                  <CmsImage src={img.src} alt={img.alt} sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
                </div>
                {img.caption && <figcaption className="mt-2 text-sm text-neutral-600">{img.caption}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  )
}

/** Reviews an editor typed into a page. Only what was entered is shown; with none, nothing renders. */
export function TestimonialsSection({ data, tone }: { data: SectionData<'testimonials'>; tone: Tone }) {
  if (!data.items.length) return null
  const id = `t-${slug(data.heading)}`
  return (
    <Band tone={tone} labelledBy={id}>
      <div className="container-wide">
        <SectionHeader eyebrow="Reviews" heading={data.heading} id={id} />
        <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((t, i) => (
            <li key={i}>
              <figure className="ui-card flex h-full flex-col p-5">
                {t.rating && (
                  <p className="text-lg tracking-wide text-amber-500" aria-label={`${t.rating} out of 5 stars`}>
                    {'★'.repeat(t.rating)}
                    <span className="text-neutral-300">{'★'.repeat(5 - t.rating)}</span>
                  </p>
                )}
                <blockquote className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-neutral-700">“{t.quote}”</blockquote>
                <figcaption className="mt-4 border-t border-line pt-3 text-sm font-semibold text-ink">
                  {t.name}
                  {t.location && <span className="font-normal text-neutral-600"> · {t.location}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </Band>
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
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-center">
          <dl className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {rows.map((r) => (
              <div key={r.label} className="ui-card flex gap-4 p-4">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-paper">
                  <r.icon className="h-5 w-5 text-terra" aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-600">{r.label}</dt>
                  <dd className="mt-1 text-ink">
                    {r.href ? (
                      <a href={r.href} className="hover:underline">
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
          <div className="lg:col-span-5">
            <FrontRangeMap className="mx-auto w-full max-w-md" />
          </div>
        </div>
      </div>
    </Band>
  )
}

/** Customer reviews after the services. Real reviews only: nothing is shown that is not in the record. */
const SOURCE_LABEL: Record<string, string> = { google: 'Google', yelp: 'Yelp', bbb: 'BBB' }

/**
 * Customer reviews (home page and service pages). Real, active reviews from the testimonials table only.
 * With none, a single quiet line says so instead of a large empty band. Cards show only fields that exist;
 * the count and average come from the same real reviews, and nothing else is claimed.
 */
export function ReviewsSection({ reviews, stats, tone = 'white' }: { reviews: ReviewItem[]; stats?: ReviewStats; tone?: Tone }) {
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

/** Home page only, last section before the footer: invites plumbing and HVAC companies to the contractor pages. */
export function CompanyMarketingCta() {
  return (
    <section className="bg-navy-900 py-16 text-white sm:py-20" aria-labelledby="company-cta">
      <div className="container-wide">
        <h2 id="company-cta" className="max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Are You a Plumbing or HVAC Company?
        </h2>
        <p className="mt-4 max-w-2xl text-lead leading-relaxed text-white/85">We also help plumbing and HVAC companies grow their reputation, search visibility, and leads.</p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <SmartLink href="/for-contractors" className="btn-primary !px-7 !py-3.5 text-base focus-visible:ring-offset-navy-900">
            View Marketing Services
          </SmartLink>
          <SmartLink
            href="/for-contractors"
            className="inline-flex items-center justify-center rounded-lg border-2 border-white px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white hover:text-navy-900 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 active:scale-95"
          >
            Request a Marketing Consultation
          </SmartLink>
        </div>
      </div>
    </section>
  )
}

export function SpacerSection({ data }: { data: SectionData<'spacer'> }) {
  const h = { sm: 'h-6', md: 'h-12', lg: 'h-24' }[data.size]
  return <div className={h} aria-hidden="true" />
}

export type { CmsButton }
