import { ArrowRight, Award, BadgeCheck, Check, Clock, Droplets, Fan, Flame, Home, Mail, MapPin, Phone, Plus, Route, ShieldCheck, Snowflake, ThermometerSun, ThumbsUp, Users, Wrench, type LucideIcon } from 'lucide-react'
import type { SectionData } from '@/lib/cms-pages/sections/schema'
import type { CmsButton } from '@/lib/cms-pages/links'
import { heroBanner, linkPhotoFor, servicePhotoFor, topicPhotoFor, type Photo } from '@/lib/media/photos'
import { CmsButtons, SmartLink } from './CmsButtons'
import { CmsImage } from './CmsImage'
import { FrontRangeMap } from './FrontRangeMap'
import { ExpandOnDesktop } from './ExpandOnDesktop'
import { HomeHero } from './HomeHero'
import { RichTextRenderer } from './RichTextRenderer'
import { ReviewCard } from '@/components/reviews/ReviewCard'

export { FrontRangeMap }

/**
 * Public page sections. Har CMS page inhi se banta hai, isliye design yahan badalne se
 * poori site ek jaisi dikhti hai. Content (data) bilkul wahi rehta hai jo admin ne save kiya.
 *
 * -`tone`: light sections white/paper mein alternate hote hain (SectionRenderer decide karta hai).
 * -`kind`: page ka type (home, location, service) — hero aur kuch layouts isse badalte hain.
 * -`photo` / `flip`: SectionRenderer gives a text-only section a photo when the section before it was text-only too,
 *  so a page never shows two text-only sections in a row. `flip` alternates the photo's side.
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

/** A photo SectionRenderer hands to a text-only section, and which side it goes on. */
export interface Rhythm {
  photo?: Photo | null
  flip?: boolean
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

// ------------------------------------------------------------------ shared layout pieces

/**
 * A cropped photo in the site's frame. Phones get a short, wide band (so a photo never costs a whole screen);
 * wide screens get the `wide` aspect. `sticky` keeps the photo in view beside long text.
 */
export function PhotoFrame({ photo, sizes = '(min-width: 1024px) 40vw, 100vw', className = '', wide = 'lg:aspect-[4/3]', sticky = false, alt }: { photo: Pick<Photo, 'src' | 'alt'>; sizes?: string; className?: string; wide?: string; sticky?: boolean; alt?: string }) {
  return (
    <div data-clip className={`photo-frame aspect-[2/1] md:aspect-[4/3] ${wide} ${sticky ? 'lg:sticky lg:top-28' : ''} ${className}`}>
      <div data-parallax="6" className="absolute inset-0">
        <CmsImage src={photo.src} alt={alt ?? photo.alt} sizes={sizes} className="object-cover" />
      </div>
    </div>
  )
}

/**
 * Photo and content side by side from 768px (photo on the left, or the right with `flip`), stacked on phones with
 * the photo first as a short band. Long content keeps the photo sticky beside it instead of stretching it.
 */
export function PhotoSplit({ photo, flip = false, long = false, children, photoAlt }: { photo: Pick<Photo, 'src' | 'alt'>; flip?: boolean; long?: boolean; children: React.ReactNode; photoAlt?: string }) {
  return (
    <div className={`container-wide grid gap-6 md:grid-cols-12 md:gap-8 lg:gap-14 ${long ? 'md:items-start' : 'md:items-center'}`}>
      <div className={`md:col-span-5 ${flip ? 'md:order-2' : ''} ${long ? 'md:sticky md:top-28' : ''}`}>
        <PhotoFrame photo={photo} alt={photoAlt} />
      </div>
      <div className="min-w-0 md:col-span-7">{children}</div>
    </div>
  )
}

/**
 * A horizontal swipe row on phones (the next card peeks in) and a grid from 768px, with `cols` columns from 1024px.
 * The list sits in a focusable, labelled region so keyboard users can scroll it on narrow screens.
 */
export function Rail({ label, cols = 3, even = false, className = '', children }: { label: string; cols?: number; even?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className={`rail-region ${className}`}>
      <ul className="rail" data-even={even || undefined} data-cols={cols} style={{ ['--rail-cols' as string]: cols }}>
        {children}
      </ul>
    </div>
  )
}

// ------------------------------------------------------------------ hero

function Breadcrumbs({ crumbs, light }: { crumbs: Crumb[]; light: boolean }) {
  if (crumbs.length < 2) return null
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.9rem] ${light ? 'text-white/70' : 'text-neutral-600'}`}>
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className="opacity-50">
                /
              </span>
            )}
            {c.href && i < crumbs.length - 1 ? (
              <SmartLink href={c.href} className={`tap-target underline-offset-4 hover:underline ${light ? 'hover:text-white' : 'hover:text-ink'}`}>
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
        <div className={`container-wide relative pb-8 pt-2 lg:flex lg:min-h-[360px] lg:items-center lg:py-12 ${center ? 'lg:justify-center lg:text-center' : ''}`}>
          <div data-hero-content className={`hero-enter ${center ? 'mx-auto max-w-3xl' : 'max-w-2xl'}`}>
            <Breadcrumbs crumbs={ctx.crumbs} light />
            {data.eyebrow && <p className="ui-kicker !text-terra-light">{data.eyebrow}</p>}
            <h1 id={first ? 'page-title' : undefined} className="hero-h1 mt-2 font-display text-display-xl font-semibold text-white [text-wrap:balance]">
              {data.heading}
            </h1>
            {data.subtitle && <p className={`mt-3 max-w-prose text-base leading-relaxed text-white/85 lg:text-lg ${center ? 'mx-auto' : ''}`}>{data.subtitle}</p>}
            <CmsButtons buttons={data.buttons} onDark center={center} className="mt-6" />
          </div>
        </div>
      </section>
      {intro.length > 0 && (
        <section className="border-b border-line bg-white section-y-sm" aria-label="Overview">
          {photo ? (
            <PhotoSplit photo={photo} flip>
              <div className="ui-body max-w-prose space-y-3">
                {intro.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </PhotoSplit>
          ) : (
            <div className="container-wide">
              <div className="ui-body max-w-prose space-y-3">
                {intro.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  )
}

// ------------------------------------------------------------------ text

export function RichTextSection({ data, tone, photo, flip }: { data: SectionData<'richText'>; tone: Tone } & Rhythm) {
  const body = <RichTextRenderer doc={data.content} className={`cms-prose [&>h2:first-child]:mt-0 ${photo ? '' : 'cms-lists-2'}`} />
  return (
    <section className={`${toneBg[tone]} section-y-sm`}>
      {photo ? (
        <PhotoSplit photo={photo} flip={flip} long={JSON.stringify(data.content).length > 1400}>
          {body}
        </PhotoSplit>
      ) : (
        <div className="container-wide">
          <div className="max-w-3xl">{body}</div>
        </div>
      )}
    </section>
  )
}

const blockLabel = (label: string) => {
  const number = /^\d{1,2}$/.test(label) ? pad2(Number(label)) : null
  return number ? <span className="ui-kicker">Step {number}</span> : label && <p className="ui-kicker">{label}</p>
}

/**
 * One content block. With an editor's image (left or right) or a rhythm photo it is a photo split; otherwise a
 * readable text column whose long lists flow into two columns on wide screens.
 */
export function ContentBlockSection({ data, tone, photo, flip }: { data: SectionData<'contentBlock'>; tone: Tone } & Rhythm) {
  const own = data.image !== '' && data.imagePosition !== 'none'
  const id = `cb-${slug(data.heading)}`
  const label = blockLabel(data.label)
  // A "card photo" on a block that ends up alone is still shown, beside the text like a rhythm photo.
  const shown = data.image ? { src: data.image, alt: data.imageAlt } : photo

  if (shown) {
    return (
      <Band tone={tone} labelledBy={id}>
        <PhotoSplit photo={shown} flip={own ? data.imagePosition === 'right' : flip} long={JSON.stringify(data.content).length > 1200} photoAlt={data.image ? data.imageAlt : undefined}>
          {label}
          <h2 id={id} data-lines className={`font-display text-display-lg font-semibold text-ink ${label ? 'mt-2' : ''}`}>
            {data.heading}
          </h2>
          <RichTextRenderer doc={data.content} className="cms-prose mt-4" />
          {data.button && <CmsButtons buttons={[data.button]} className="mt-6" />}
        </PhotoSplit>
      </Band>
    )
  }

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
 * cards instead of a tall stack of full-width sections: a swipe row on phones, a grid on wider screens. Each card keeps
 * its full content and its button. A card shows its block's own image, or a rhythm photo when the row needs one.
 */
export function ContentBlockGroup({ blocks, tone, photos = [] }: { blocks: SectionData<'contentBlock'>[]; tone: Tone; photos?: (Photo | null)[] }) {
  return (
    <section className={`${toneBg[tone]} section-y-sm`}>
      <div className="container-wide">
        <Rail label={blocks.map((b) => b.heading).join(', ')} cols={blocks.length >= 3 ? 3 : 2}>
          {blocks.map((b, i) => {
            const number = /^\d{1,2}$/.test(b.label) ? Number(b.label) : null
            const photo = b.image ? { src: b.image, alt: b.imageAlt } : photos[i]
            const hid = `cbg-${slug(b.heading)}`
            return (
              <li key={i} className="flex">
                <article className="ui-card flex w-full flex-col overflow-hidden" aria-labelledby={hid}>
                  {photo && (
                    <div className="relative aspect-[16/9] bg-mist">
                      <CmsImage src={photo.src} alt={b.image ? b.imageAlt : ''} decorative={!b.image || !b.imageAlt} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 82vw" className="object-cover" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    {number ? (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-white" aria-hidden="true">
                        {number}
                      </span>
                    ) : (
                      b.label && <p className="ui-kicker">{b.label}</p>
                    )}
                    <h2 id={hid} className={`ui-h3 text-[1.35rem] ${number || b.label ? 'mt-2' : ''}`}>
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
                      <SmartLink href={b.button.href} className="group mt-5 inline-flex min-h-[2.75rem] items-center gap-1.5 self-start font-semibold text-terra hover:text-terra-dark">
                        <span className="underline decoration-terra/30 underline-offset-4 group-hover:decoration-terra">{b.button.label}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </SmartLink>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </Rail>
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
  const photo = image || linkPhotoFor(href)?.src
  return (
    <li>
      <SmartLink href={href} className="ui-card-link group flex h-full min-h-[4.5rem] items-center gap-4 p-3 pr-4">
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
          {text && <span className="mt-0.5 line-clamp-2 text-[0.9rem] leading-snug text-neutral-600">{text}</span>}
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

/** The photo a linked card shows: the editor's image, the service page's photo, or one that fits a guide's topic. */
export const cardPhoto = (card: Pick<Card, 'image' | 'href' | 'title'>) => card.image || linkPhotoFor(card.href)?.src || topicPhotoFor(card.title, card.href)?.src || ''

/** Photo cards: photo on top, then title, text and a link label. A swipe row on phones, a grid on wider screens. */
export function PhotoCards({ cards, label, cta = 'Learn more' }: { cards: Card[]; label: string; cta?: string }) {
  return (
    <Rail label={label} cols={cards.length === 5 ? 5 : cards.length === 4 ? 4 : cards.length >= 3 ? 3 : 2}>
      {cards.map((card, i) => {
        const photo = cardPhoto(card)
        return (
          <li key={i} className="flex">
            <SmartLink href={card.href} className="ui-card-link group flex w-full flex-col overflow-hidden">
              {photo && (
                <span className="relative block aspect-[16/9] w-full overflow-hidden bg-mist">
                  <CmsImage src={photo} alt={card.imageAlt} decorative={!card.imageAlt} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 82vw" className="object-cover" />
                </span>
              )}
              <span className="flex flex-1 flex-col p-5">
                <span className="ui-h3 group-hover:text-terra">{card.title}</span>
                {card.text && <span className="ui-body mt-2 line-clamp-3">{card.text}</span>}
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[0.95rem] font-semibold text-terra">
                  {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </span>
            </SmartLink>
          </li>
        )
      })}
    </Rail>
  )
}

export function FeatureCardsSection({ data, tone, photo, flip }: { data: SectionData<'featureCards'>; tone: Tone } & Rhythm) {
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
            <SectionHeader heading={data.heading} intro={data.intro} id={id} light />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {data.cards.map((card, i) => (
                <li key={i}>
                  <SmartLink href={card.href} className="group flex h-full items-center gap-3 rounded-xl bg-white p-2.5 pr-4 text-ink transition-shadow hover:shadow-card-hover">
                    <span className="relative block h-16 w-20 flex-none overflow-hidden rounded-lg bg-mist">
                      {card.image && <CmsImage src={card.image} alt={card.imageAlt} decorative={!card.imageAlt} sizes="80px" className="object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{card.title}</span>
                      {card.text && <span className="mt-0.5 line-clamp-2 text-[0.9rem] leading-snug text-neutral-600">{card.text}</span>}
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

  // Linked cards (services, guides): photo cards. Guides without an image get a photo that fits their topic.
  const photoCount = data.cards.filter((c) => cardPhoto(c)).length
  if (linked && n > 0 && (withImages || photoCount * 2 > n)) {
    const guides = !withImages && data.cards.every((c) => !linkPhotoFor(c.href))
    return (
      <Band tone={tone} labelledBy={id}>
        <div className="container-wide">
          <SectionHeader heading={data.heading} intro={data.intro} id={id} />
          <div className={data.heading || data.intro ? 'mt-6 sm:mt-8' : ''}>
            <PhotoCards cards={data.cards} label={data.heading || 'Pages'} cta={guides ? 'Read the guide' : 'Learn more'} />
          </div>
        </div>
      </Band>
    )
  }

  // Linked, no photo for most: a compact index of text rows.
  if (linked && n > 0) {
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
                    {card.text && <span className="ui-body mt-1 block text-neutral-600">{card.text}</span>}
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

  // No photo, no link: icon + short label tiles. Beside a photo when the page needs one, two columns of tiles.
  const tileIcons = [Users, ShieldCheck, Clock, BadgeCheck, Wrench, Award, ThumbsUp, Home]
  const tiles = (
    <ul className={`grid gap-3 sm:grid-cols-2 ${photo ? '' : 'lg:grid-cols-3'}`}>
      {data.cards.map((card, i) => {
        const Icon = tileIcons[i % tileIcons.length]
        return (
          <li key={i}>
            <CardShell card={card} className="ui-card flex h-full items-start gap-3.5 p-4">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-paper text-terra">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-sans text-base font-semibold leading-snug text-ink">{card.title}</h3>
                {card.text && <p className="mt-1 text-[0.95rem] leading-snug text-neutral-600">{card.text}</p>}
              </div>
            </CardShell>
          </li>
        )
      })}
    </ul>
  )
  return (
    <Band tone={tone} labelledBy={id}>
      {photo ? (
        <PhotoSplit photo={photo} flip={flip}>
          <SectionHeader heading={data.heading} intro={data.intro} id={id} />
          <div className="mt-6">{tiles}</div>
        </PhotoSplit>
      ) : (
        <div className="container-wide">
          <SectionHeader heading={data.heading} intro={data.intro} id={id} />
          <div className="mt-6 sm:mt-8">{tiles}</div>
        </div>
      )}
    </Band>
  )
}

// ------------------------------------------------------------------ comparison, steps

/** Side-by-side options (tank vs tankless, repair vs replace). Stacks into cards on phones: no sideways scrolling. */
export function ComparisonSection({ data, tone, photo, flip }: { data: SectionData<'comparison'>; tone: Tone } & Rhythm) {
  const id = `cmp-${slug(data.heading)}`
  const header = <SectionHeader heading={data.heading} intro={data.intro} id={id} />
  return (
    <Band tone={tone} labelledBy={id}>
      {photo && (
        <div className="mb-8">
          <PhotoSplit photo={photo} flip={flip}>
            {header}
          </PhotoSplit>
        </div>
      )}
      <div className="container-wide">
        {!photo && header}
        <Rail label={data.columns.map((c) => c.title).join(' and ')} cols={data.columns.length} className={photo ? '' : 'mt-6 sm:mt-8'}>
          {data.columns.map((col, i) => (
            <li key={i} className={`rounded-xl p-5 sm:p-6 ${i % 2 === 1 ? 'bg-ink text-white' : 'border border-line bg-white'}`}>
              <h3 className={`font-display text-display-md font-semibold ${i % 2 === 1 ? 'text-white' : 'text-ink'}`}>{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item, j) => (
                  <li key={j} className={`flex gap-2.5 text-base leading-relaxed ${i % 2 === 1 ? 'text-white/85' : 'text-neutral-700'}`}>
                    <Check className={`mt-1 h-4 w-4 flex-shrink-0 ${i % 2 === 1 ? 'text-terra-light' : 'text-terra'}`} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </Rail>
        {data.outro && <p className="ui-body mt-6 max-w-prose">{data.outro}</p>}
        <CmsButtons buttons={data.buttons} className="mt-6" />
      </div>
    </Band>
  )
}

/** Numbered steps on one vertical pipe line. `flow` marks the home page version (it carries data-flow). */
export function PipeSteps({ steps, flow = false }: { steps: { title: string; text: string }[]; flow?: boolean }) {
  return (
    <ol className="pipe-steps" data-flow={flow || undefined}>
      {steps.map((step, i) => (
        <li key={i}>
          <span data-step-line className="pipe-line" aria-hidden="true" />
          <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-white ring-4 ring-white" aria-hidden="true">
            {i + 1}
          </span>
          <h3 className="font-sans text-[1.05rem] font-semibold leading-snug text-ink">{step.title}</h3>
          {step.text && <p className="ui-body mt-1 text-neutral-600">{step.text}</p>}
        </li>
      ))}
    </ol>
  )
}

/**
 * Steps: heading beside a vertical, numbered list. With a rhythm photo the photo takes one side and the heading and
 * steps the other; without, the heading sits left and the steps right on wide screens.
 */
export function StepsSection({ data, tone = 'paper', photo, flip }: { data: SectionData<'steps'>; ctx: PageContext; tone?: Tone } & Rhythm) {
  const id = `steps-${slug(data.heading)}`
  const list = <PipeSteps steps={data.steps} />
  const buttons = <CmsButtons buttons={data.buttons} className="mt-7" />
  return (
    <section className={`${toneBg[tone]} ${pad}`} aria-labelledby={id}>
      {photo ? (
        <PhotoSplit photo={photo} flip={flip} long={data.steps.length > 4}>
          <SectionHeader heading={data.heading} intro={data.intro} id={id} />
          <div className="mt-7">{list}</div>
          {buttons}
        </PhotoSplit>
      ) : (
        <div className="container-wide grid gap-7 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeader heading={data.heading} intro={data.intro} id={id} />
            <div className="hidden lg:block">{buttons}</div>
          </div>
          <div className="lg:col-span-7">
            {list}
            <div className="lg:hidden">{buttons}</div>
          </div>
        </div>
      )}
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
          <summary className="flex min-h-[3.25rem] cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-left text-base font-semibold text-ink hover:text-terra dark:hover:text-[#F4A3A3] sm:px-5 [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-line text-ink transition-transform duration-200 group-open:rotate-45 group-open:border-terra group-open:text-terra" aria-hidden="true">
              <Plus className="h-3.5 w-3.5" />
            </span>
          </summary>
          <div className="ui-body max-w-prose space-y-2.5 px-4 pb-4 sm:px-5">
            {item.answer.split(/\n{2,}/).map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}

/** Questions beside their heading. A rhythm photo sits under the heading on wide screens only: phones keep the list short. */
export function FaqSection({ data, tone, photo }: { data: SectionData<'faq'>; tone: Tone } & Rhythm) {
  if (!data.items.length) return null
  const id = `faq-${slug(data.heading)}`
  return (
    <Band tone={tone} labelledBy={id}>
      <div className="container-wide grid gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <SectionHeader heading={data.heading} id={id} />
          {photo && <PhotoFrame photo={photo} className="mt-6 hidden lg:block" sizes="30vw" />}
        </div>
        <FaqAccordion items={data.items} className="lg:col-span-8 lg:self-start" />
      </div>
    </Band>
  )
}

// ------------------------------------------------------------------ calls to action

/**
 * Closing call to action. Shows only the editor's own heading, text and buttons: no badges or claims (licensing,
 * same-day service) that the business has not confirmed. The availability note lives with the forms and the hero,
 * not on every band.
 */
export function CtaSection({ data, tone }: { data: SectionData<'cta'>; tone: Tone }) {
  const id = `cta-${slug(data.heading)}`
  if (data.tone === 'dark') {
    return (
      <section className="bg-ink py-10 text-white sm:py-14" aria-labelledby={id} data-dark>
        <div className="container-wide flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <h2 id={id} className="font-display text-display-lg font-semibold text-white">
              {data.heading}
            </h2>
            {data.text && (
              <div className="mt-3 space-y-2 text-base leading-relaxed text-white/80 lg:text-lg">
                {paragraphs(data.text).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
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
              <div className="ui-body mt-2 space-y-2 text-neutral-600">
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
        <PhotoSplit photo={ctx.cityPhoto} flip>
          <SectionHeader heading={data.heading} id={id} />
          <div className="mt-6">
            <LinkRows links={data.links} />
          </div>
        </PhotoSplit>
      </Band>
    )
  }
  // Service-area lists: the places in columns on a navy panel.
  if (/\b(areas?|cities|city|neighbou?rhoods?|locations?|communities|serving)\b/i.test(data.heading) && data.links.length >= 4) {
    return (
      <section className={`bg-ink text-white ${pad}`} aria-labelledby={id} data-dark>
        <div className="container-wide">
          <SectionHeader heading={data.heading} id={id} light />
          <ul className="mt-6 columns-2 gap-8 sm:columns-3 lg:columns-4 [&>li]:mb-1">
            {data.links.map((l, i) => (
              <li key={i} className="break-inside-avoid">
                <SmartLink href={l.href} className="inline-flex min-h-[2.75rem] items-center gap-2 text-base text-white/90 hover:text-white hover:underline hover:underline-offset-4">
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
        <SectionHeader heading={data.heading} id={id} compact />
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
        <SectionHeader heading={data.heading} id={id} />
        <Rail label={data.heading} className="mt-6">
          {data.items.map((t, i) => (
            <li key={i} className="flex">
              <figure className="ui-card flex w-full flex-col p-5">
                {t.rating && (
                  <p className="text-lg tracking-wide text-amber-500 dark:text-[#fcd34d]" aria-label={`${t.rating} out of 5 stars`}>
                    {'★'.repeat(t.rating)}
                    <span className="text-neutral-300">{'★'.repeat(5 - t.rating)}</span>
                  </p>
                )}
                <blockquote className="ui-body mt-3 flex-1">“{t.quote}”</blockquote>
                <figcaption className="mt-4 border-t border-line pt-3 text-sm font-semibold text-ink">
                  {t.name}
                  {t.location && <span className="font-normal text-neutral-600">, {t.location}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </Rail>
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
                  <dt className="text-sm font-semibold text-neutral-600">{r.label}</dt>
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

/**
 * What a visitor can rely on, shown where reviews will go until real ones exist. Every line restates something the
 * site already says elsewhere (credentials are checked before a pro joins, the two service areas, how a request is
 * handled): no ratings, counts or guarantees.
 */
const TRUST_POINTS = [
  { Icon: ShieldCheck, title: 'License and insurance checked', text: 'We ask every pro for license and insurance details before they join.' },
  { Icon: MapPin, title: 'Denver and Boulder', text: 'Plus nearby communities where coverage is available.' },
  { Icon: Route, title: 'How matching works', text: 'Send one request. We match it to a local pro and follow up.' },
]

export function TrustStrip({ tone = 'white' }: { tone?: Tone }) {
  return (
    <section className={`${toneBg[tone]} border-y border-line py-7 sm:py-10`} aria-label="Why customers use PipeFlowCo" data-reviews>
      <Rail label="Why customers use PipeFlowCo" cols={3} even className="container-wide">
        {TRUST_POINTS.map(({ Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3.5 rounded-xl border border-line bg-white p-4 md:border-0 md:bg-transparent md:p-0">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-ink text-white">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold leading-snug text-ink">{title}</span>
              <span className="mt-0.5 block text-base leading-snug text-neutral-600">{text}</span>
            </span>
          </li>
        ))}
      </Rail>
    </section>
  )
}

/**
 * Customer reviews (home page and service pages). Real, active reviews from the testimonials table only.
 * With none, a trust strip takes the place instead of an empty heading. Cards show only fields that exist;
 * the count and average come from the same real reviews, and nothing else is claimed.
 */
export function ReviewsSection({ reviews, stats, tone = 'white' }: { reviews: ReviewItem[]; stats?: ReviewStats; tone?: Tone }) {
  if (!reviews.length) return <TrustStrip tone={tone} />
  const average = stats?.average ?? null
  return (
    <section className={`${toneBg[tone]} section-y`} aria-labelledby="home-reviews" data-reviews>
      <div className="container-wide">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="home-reviews" className="font-display text-display-lg font-semibold text-ink">
            What Customers Are Saying
          </h2>
          <div className="flex flex-col gap-1 sm:items-end">
            {stats && stats.count > 0 && (
              <p className="text-sm text-neutral-600">
                {average !== null && (
                  <>
                    <span className="font-semibold text-ink">{average.toFixed(1)}</span> average from{' '}
                  </>
                )}
                {stats.count} customer review{stats.count === 1 ? '' : 's'}
              </p>
            )}
            <SmartLink href="/reviews" className="ui-link text-sm">
              Read all reviews <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </SmartLink>
          </div>
        </div>
        <Rail label="Customer reviews" className="mt-6">
          {reviews.slice(0, 3).map((r, i) => (
            <li key={i} className="flex">
              <ReviewCard review={r} />
            </li>
          ))}
        </Rail>
      </div>
    </section>
  )
}

export function SpacerSection({ data }: { data: SectionData<'spacer'> }) {
  const h = { sm: 'h-6', md: 'h-12', lg: 'h-24' }[data.size]
  return <div className={h} aria-hidden="true" />
}

export type { CmsButton }
