import { ArrowRight, ArrowUpRight, Check, Clock, Mail, MapPin, Phone, Plus } from 'lucide-react'
import type { SectionData } from '@/lib/cms-pages/sections/schema'
import type { CmsButton } from '@/lib/cms-pages/links'
import { MARQUEE_PHOTOS, PHOTOS, PROCESS_PHOTOS, SERVICE_PHOTOS, type Photo } from '@/lib/media/photos'
import { SplitWords } from '@/components/motion/SplitWords'
import { CmsButtons, SmartLink } from './CmsButtons'
import { CmsImage } from './CmsImage'
import { RichTextRenderer } from './RichTextRenderer'

/**
 * Public page sections. Har CMS page inhi se banta hai, isliye design yahan badalne se
 * poori site ek jaisi dikhti hai. Content (data) bilkul wahi rehta hai jo admin ne save kiya.
 *
 * - `tone`: light sections white/paper mein alternate hote hain (SectionRenderer decide karta hai).
 * - `kind`: page ka type (home, location, service) — hero aur kuch layouts isse badalte hain.
 */
export type Tone = 'white' | 'paper'
export type PageKind = 'home' | 'location' | 'service' | 'page'
export interface Crumb { label: string; href?: string }
export interface PageContext { kind: PageKind; crumbs: Crumb[]; cityPhoto?: Photo }

const toneBg: Record<Tone, string> = { white: 'bg-white', paper: 'bg-paper' }
const pad = 'py-20 sm:py-24 lg:py-28'

function Band({ tone, children, className = '', labelledBy }: { tone: Tone; children: React.ReactNode; className?: string; labelledBy?: string }) {
  return (
    <section className={`${toneBg[tone]} ${pad} ${className}`} aria-labelledby={labelledBy}>
      {children}
    </section>
  )
}

function SectionHeader({ eyebrow, heading, intro, light = false, center = false, id, compact = false }: { eyebrow?: string; heading?: string; intro?: string; light?: boolean; center?: boolean; id?: string; compact?: boolean }) {
  if (!heading && !intro) return null
  return (
    <div className={`max-w-3xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p data-reveal="fade" className={`eyebrow ${light ? 'eyebrow-light' : ''} ${center ? 'justify-center' : ''}`}>{eyebrow}</p>}
      {heading && <h2 id={id} data-lines className={`font-display ${compact ? 'text-display-md' : 'text-display-lg'} font-normal ${light ? 'text-white' : 'text-ink'} ${eyebrow ? 'mt-4' : ''}`}>{heading}</h2>}
      {intro && <p data-reveal style={{ '--reveal-delay': '160ms' } as React.CSSProperties} className={`mt-5 text-lead ${light ? 'text-white/75' : 'text-neutral-600'}`}>{intro}</p>}
    </div>
  )
}

const pad2 = (n: number) => String(n).padStart(2, '0')
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)

// ------------------------------------------------------------------ hero

function Breadcrumbs({ crumbs, light }: { crumbs: Crumb[]; light: boolean }) {
  if (crumbs.length < 2) return null
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${light ? 'text-white/70' : 'text-neutral-500'}`}>
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className="opacity-50">/</span>}
            {c.href && i < crumbs.length - 1 ? (
              <SmartLink href={c.href} className={`link-grow ${light ? 'hover:text-white' : 'hover:text-ink'}`}>{c.label}</SmartLink>
            ) : (
              <span aria-current={i === crumbs.length - 1 ? 'page' : undefined} className={light ? 'text-white' : 'text-ink'}>{c.label}</span>
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
          {data.intro.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}
      <CmsButtons buttons={data.buttons} onDark={light} center={center} />
    </>
  )
}

export function HeroSection({ data, first, ctx }: { data: SectionData<'hero'>; first: boolean; ctx: PageContext }) {
  const center = data.align === 'center'
  const hasImage = data.image !== ''
  // Home aur city pages: poori chaudai wali photo. Service pages: split layout lambi photo ke saath.
  const fullBleed = hasImage && (center || ctx.kind === 'home' || ctx.kind === 'location')

  if (fullBleed) {
    return (
      <section data-hero className="relative isolate flex min-h-[min(88svh,820px)] items-end overflow-hidden bg-ink text-white" aria-labelledby={first ? 'page-title' : undefined}>
        <div className="absolute inset-0 -z-20 hero-clip-reveal">
          <div className="absolute inset-0 hero-photo-settle">
            <div data-hero-media className="absolute inset-0">
              <CmsImage src={data.image} alt={data.imageAlt} priority={first} sizes="100vw" className="object-cover" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/20" aria-hidden="true" />
        {!center && <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/35 to-transparent" aria-hidden="true" />}
        <div className={`container-wide w-full pb-16 pt-32 sm:pb-20 lg:pb-24 ${center ? 'text-center' : ''}`}>
          <Breadcrumbs crumbs={ctx.crumbs} light />
          <div data-hero-content className={`hero-enter ${center ? 'mx-auto max-w-4xl' : 'max-w-4xl'}`}>
            <HeroCopy data={data} first={first} light center={center} />
          </div>
        </div>
      </section>
    )
  }

  if (hasImage) {
    return (
      <section className="relative overflow-hidden bg-paper" aria-labelledby={first ? 'page-title' : undefined}>
        <div className="container-wide grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:py-24">
          <div className="lg:col-span-7">
            <Breadcrumbs crumbs={ctx.crumbs} light={false} />
            <div className="hero-enter">
              <HeroCopy data={data} first={first} light={false} center={false} />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="photo-frame hero-clip-reveal aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-[4/5]">
              <div className="absolute inset-0 hero-photo-settle">
                <div data-parallax="5" className="absolute inset-0">
                  <CmsImage src={data.image} alt={data.imageAlt} priority={first} sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative isolate overflow-hidden bg-ink text-white" aria-labelledby={first ? 'page-title' : undefined}>
      <div className="pointer-events-none absolute -right-32 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-brand-blue/25 blur-3xl" aria-hidden="true" />
      <div className={`container-wide py-20 sm:py-24 lg:py-28 ${center ? 'text-center' : ''}`}>
        <Breadcrumbs crumbs={ctx.crumbs} light />
        <div className={`hero-enter ${center ? 'mx-auto max-w-4xl' : 'max-w-4xl'}`}>
          <HeroCopy data={data} first={first} light center={center} />
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
            {number ? <p className="font-display text-sm font-medium tracking-[0.2em] text-brand-red">{number}</p> : data.label && <p className="eyebrow">{data.label}</p>}
            <h2 id={id} data-lines className="mt-4 font-display text-display-lg font-normal text-ink">{data.heading}</h2>
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
              <p className="font-display text-[clamp(3.5rem,6vw,5.5rem)] font-normal leading-none tracking-tight text-transparent [-webkit-text-stroke:1.5px_theme(colors.brand.red)]" aria-hidden="true">{number}</p>
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
        <div className={`grid gap-px overflow-hidden rounded-4xl border border-line bg-line ${blocks.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
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

function CardShell({ card, className, children }: { card: Card; className: string; children: React.ReactNode }) {
  return card.href ? <SmartLink href={card.href} className={`group ${className}`}>{children}</SmartLink> : <div className={className}>{children}</div>
}

export function FeatureCardsSection({ data, tone }: { data: SectionData<'featureCards'>; tone: Tone }) {
  const withImages = data.cards.some((c) => c.image)
  const linked = data.cards.every((c) => c.href)
  const id = data.heading ? `fc-${slug(data.heading)}` : undefined

  // 2 photo cards: badi photo tiles (Plumbing / HVAC, Denver / Boulder).
  if (withImages && data.cards.length === 2) {
    return (
      <Band tone={tone} labelledBy={id}>
        <div className="container-wide">
          <SectionHeader heading={data.heading} intro={data.intro} id={id} />
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {data.cards.map((card, i) => (
              <li key={i} data-reveal style={{ '--reveal-delay': `${i * 110}ms` } as React.CSSProperties}>
                <CardShell card={card} className="relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-4xl bg-ink p-7 text-white sm:aspect-[5/4] sm:p-10">
                  {card.image && (
                    <div className="absolute inset-0 -z-20 transition-transform duration-700 ease-out-expo group-hover:scale-105">
                      <div data-parallax="5" className="absolute inset-0">
                        <CmsImage src={card.image} alt={card.imageAlt} decorative={!card.imageAlt} sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" aria-hidden="true" />
                  <h3 className="font-display text-display-md font-normal">{card.title}</h3>
                  {card.text && <p className="mt-3 max-w-md text-white/80">{card.text}</p>}
                  {card.href && (
                    <span className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink transition-all duration-300 ease-out-expo group-hover:bg-brand-red group-hover:text-white" aria-hidden="true">
                      <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  )}
                </CardShell>
              </li>
            ))}
          </ul>
        </div>
      </Band>
    )
  }

  // Photo cards (3+): pehla card bada, baaki chhote — ek "bento" layout.
  if (withImages) {
    const bento = data.cards.length === 5 || data.cards.length === 3
    return (
      <Band tone={tone} labelledBy={id}>
        <div className="container-wide">
          <SectionHeader heading={data.heading} intro={data.intro} id={id} />
          <ul className={`mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${bento ? 'lg:auto-rows-[minmax(15rem,auto)]' : ''}`}>
            {data.cards.map((card, i) => {
              const big = bento && i === 0
              return (
                <li key={i} className={big ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2' : ''} data-reveal style={{ '--reveal-delay': `${(i % 3) * 90}ms` } as React.CSSProperties}>
                  <CardShell card={card} className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-ink/15 hover:shadow-[0_24px_60px_-28px_rgba(11,23,40,0.35)]">
                    {card.image && (
                      <div className={`relative overflow-hidden bg-mist ${big ? 'aspect-[4/3] lg:aspect-auto lg:flex-1' : 'aspect-[16/10]'}`}>
                        <div className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-105">
                          <CmsImage src={card.image} alt={card.imageAlt} decorative={!card.imageAlt} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                        </div>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4 p-6 sm:p-7">
                      <div>
                        <h3 className={`font-display font-normal text-ink ${big ? 'text-display-md' : 'text-xl'}`}>{card.title}</h3>
                        {card.text && <p className="mt-2 text-[0.95rem] leading-relaxed text-neutral-600">{card.text}</p>}
                      </div>
                      {card.href && <ArrowUpRight className="mt-1 h-5 w-5 flex-shrink-0 text-brand-red transition-transform duration-300 group-hover:rotate-45" aria-hidden="true" />}
                    </div>
                  </CardShell>
                </li>
              )
            })}
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
          <div className="lg:col-span-4"><SectionHeader heading={data.heading} intro={data.intro} id={id} /></div>
          <ul className="border-t border-line lg:col-span-8">
            {data.cards.map((card, i) => (
              <li key={i} className="border-b border-line" data-reveal style={{ '--reveal-delay': `${i * 60}ms` } as React.CSSProperties}>
                <SmartLink href={card.href} className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-5 py-6 sm:gap-8">
                  <span className="font-display text-sm font-medium text-neutral-400">{pad2(i + 1)}</span>
                  <span>
                    <span className="block font-display text-xl font-normal text-ink transition-colors group-hover:text-brand-red sm:text-2xl">{card.title}</span>
                    {card.text && <span className="mt-2 block text-neutral-600">{card.text}</span>}
                  </span>
                  <ArrowRight className="h-5 w-5 text-ink transition-transform duration-300 ease-out-expo group-hover:translate-x-1 group-hover:text-brand-red" aria-hidden="true" />
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </Band>
    )
  }

  // Bina photo, bina link: numbered features grid.
  return (
    <Band tone={tone} labelledBy={id}>
      <div className="container-wide">
        <SectionHeader heading={data.heading} intro={data.intro} id={id} />
        <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {data.cards.map((card, i) => (
            <li key={i} className="border-t border-ink/15 pt-6" data-reveal style={{ '--reveal-delay': `${(i % 3) * 90}ms` } as React.CSSProperties}>
              <CardShell card={card} className="block">
                <span className="font-display text-sm font-medium tracking-[0.2em] text-brand-red">{pad2(i + 1)}</span>
                <h3 className="mt-3 font-display text-xl font-normal text-ink">{card.title}</h3>
                {card.text && <p className="mt-3 leading-relaxed text-neutral-600">{card.text}</p>}
              </CardShell>
            </li>
          ))}
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
              <div key={i} data-reveal style={{ '--reveal-delay': `${i * 110}ms` } as React.CSSProperties} className={`rounded-4xl p-8 sm:p-10 ${dark ? 'bg-ink text-white' : 'border border-line bg-white'}`}>
                <h3 className={`font-display text-display-md font-normal ${dark ? 'text-white' : 'text-ink'}`}>{col.title}</h3>
                <ul className="mt-7 space-y-4">
                  {col.items.map((item, j) => (
                    <li key={j} className={`flex gap-3 ${dark ? 'text-white/80' : 'text-neutral-700'}`}>
                      <span className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${dark ? 'bg-white/10' : 'bg-mist'}`}>
                        <Check className={`h-3.5 w-3.5 ${dark ? 'text-white' : 'text-brand-blue'}`} aria-hidden="true" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
        {data.outro && <p className="mt-10 max-w-3xl text-lead text-neutral-600" data-reveal>{data.outro}</p>}
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
                    <span className="pt-1 font-display text-sm font-medium tracking-[0.2em] text-brand-red-light">{pad2(i + 1)}</span>
                    <div>
                      <h3 className="font-display text-[clamp(1.35rem,1.1rem+0.9vw,1.85rem)] font-normal leading-tight text-white">{step.title}</h3>
                      {step.text && <p className="mt-2 max-w-md leading-relaxed text-white/70">{step.text}</p>}
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-10 flex items-center gap-5" aria-hidden="true">
                <div className="h-px flex-1 bg-white/15"><div data-story-progress className="h-px origin-left bg-brand-red" /></div>
                <span data-story-count className="font-display text-sm tabular-nums text-white/60">01 / {pad2(n)}</span>
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
              <span data-step-line className="absolute -top-px left-0 h-px w-full origin-left bg-brand-red" style={{ transform: 'scaleX(0.16)' }} aria-hidden="true" />
              <span className="font-display text-sm font-medium tracking-[0.2em] text-brand-red-light">Step {pad2(i + 1)}</span>
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
          <div className="lg:sticky lg:top-32"><SectionHeader eyebrow="FAQ" heading={data.heading} id={id} /></div>
        </div>
        <div className="border-t border-line lg:col-span-8" data-reveal>
          {data.items.map((item, i) => (
            <details key={i} className="faq-item group border-b border-line">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left font-display text-lg font-medium text-ink transition-colors hover:text-brand-red sm:text-xl [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-line transition-all duration-300 ease-out-expo group-open:rotate-45 group-open:border-brand-red group-open:bg-brand-red group-open:text-white" aria-hidden="true">
                  <Plus className="h-4 w-4" />
                </span>
              </summary>
              <div className="max-w-3xl space-y-3 pb-7 pr-14 leading-relaxed text-neutral-700">
                {item.answer.split(/\n{2,}/).map((p, j) => <p key={j}>{p}</p>)}
              </div>
            </details>
          ))}
        </div>
      </div>
    </Band>
  )
}

// ------------------------------------------------------------------ calls to action

const CTA_PHOTOS = [PHOTOS.plumberSinkTrap, PHOTOS.mechanicalPipes, PHOTOS.technicianToolBelt, PHOTOS.plumberUnderSink]

export function CtaSection({ data, tone }: { data: SectionData<'cta'>; tone: Tone }) {
  const id = `cta-${slug(data.heading)}`
  if (data.tone === 'dark') {
    // Background photo sirf sajawat hai (alt khaali); heading se chuni jaati hai taaki pages par alag dikhe.
    const photo = CTA_PHOTOS[[...data.heading].reduce((a, c) => a + c.charCodeAt(0), 0) % CTA_PHOTOS.length]
    return (
      <section className="relative isolate overflow-hidden bg-ink text-white" aria-labelledby={id}>
        <div className="absolute inset-0 -z-20 opacity-40">
          <div data-parallax="7" className="absolute inset-0">
            <CmsImage src={photo.src} decorative sizes="100vw" className="object-cover" />
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/80 via-ink/70 to-ink" aria-hidden="true" />
        <div className="container-wide py-24 text-center sm:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl" data-reveal>
            <h2 id={id} data-lines className="font-display text-display-xl font-normal">{data.heading}</h2>
            {data.text && (
              <div className="mx-auto mt-6 max-w-2xl space-y-3 text-lead text-white/75">
                {data.text.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
            <CmsButtons buttons={data.buttons} onDark center className="mt-10" />
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className={`${toneBg[tone]} py-16 sm:py-20`} aria-labelledby={id}>
      <div className="container-wide">
        <div className="flex flex-col gap-8 rounded-4xl border border-line bg-white p-8 sm:p-12 lg:flex-row lg:items-end lg:justify-between" data-reveal>
          <div className="max-w-2xl">
            <h2 id={id} className="font-display text-display-lg font-normal text-ink">{data.heading}</h2>
            {data.text && (
              <div className="mt-4 space-y-2 text-lead text-neutral-600">
                {data.text.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
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
          <SmartLink href={l.href} className="group flex items-center justify-between gap-6 py-5">
            <span className="font-display text-lg font-medium text-ink transition-colors group-hover:text-brand-red sm:text-xl">{l.label}</span>
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-line transition-all duration-300 ease-out-expo group-hover:border-brand-red group-hover:bg-brand-red group-hover:text-white" aria-hidden="true">
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
            <div className="mt-10"><LinkRows links={data.links} /></div>
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
  // Service index: 3+ links jinki photo maujood hai -> hover/focus par photo crossfade (sirf CSS).
  const photos = data.links.map((l) => SERVICE_PHOTOS[l.href])
  if (photos.filter(Boolean).length >= 3 && data.links.length <= 10) {
    return (
      <Band tone={tone} labelledBy={id} className="!py-16 sm:!py-20">
        <div className="svc-index container-wide grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeader heading={data.heading} id={id} />
            <div className="mt-8"><LinkRows links={data.links} /></div>
          </div>
          <div className="hidden lg:col-span-5 lg:block" aria-hidden="true">
            <div className="photo-frame sticky top-32 aspect-[4/5] w-full">
              {data.links.map((l, i) => (
                <div key={i} className="svc-photo absolute inset-0">
                  <CmsImage src={(photos[i] ?? photos.find(Boolean)!).src} decorative sizes="(min-width: 1024px) 38vw, 0px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Band>
    )
  }
  return (
    <Band tone={tone} labelledBy={id} className="!py-16 sm:!py-20">
      <div className="container-wide grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4"><SectionHeader heading={data.heading} id={id} /></div>
        <div className="lg:col-span-8"><LinkRows links={data.links} /></div>
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
                <div className="photo-frame aspect-[4/3] !rounded-3xl">
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
export function TestimonialsSection({ data, tone }: { data: SectionData<'testimonials'>; tone: Tone }) {
  if (!data.items.length) return null
  return (
    <Band tone={tone}>
      <div className="container-wide">
        <SectionHeader heading={data.heading} />
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((t, i) => (
            <li key={i} className="flex flex-col rounded-4xl border border-line bg-white p-8" data-reveal style={{ '--reveal-delay': `${(i % 3) * 90}ms` } as React.CSSProperties}>
              {t.rating && <p className="text-sm tracking-widest text-amber-500" aria-label={`${t.rating} out of 5 stars`}>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</p>}
              <blockquote className="mt-4 flex-1 font-display text-lg leading-snug text-ink">“{t.quote}”</blockquote>
              <p className="mt-6 text-sm font-semibold text-ink">
                {t.name}
                {t.location && <span className="font-normal text-neutral-500"> · {t.location}</span>}
              </p>
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
        <dl className="mt-10 grid gap-5 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="flex gap-4 rounded-3xl border border-line bg-white p-6" data-reveal>
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-mist"><r.icon className="h-5 w-5 text-brand-blue" aria-hidden="true" /></span>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{r.label}</dt>
                <dd className="mt-1 text-lg text-ink">{r.href ? <a href={r.href} className="link-grow">{r.value}</a> : r.value}</dd>
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
export function PhotoMarquee({ photos = MARQUEE_PHOTOS, direction = 'left' }: { photos?: Photo[]; direction?: 'left' | 'right' }) {
  return (
    <section className="overflow-hidden bg-white py-10 sm:py-14" aria-hidden="true">
      <div data-marquee={direction} className="flex w-max gap-4 will-change-transform sm:gap-6">
        {photos.map((p, i) => (
          <div key={i} className={`photo-frame !rounded-3xl aspect-[4/5] w-[58vw] flex-none sm:w-[34vw] lg:w-[22vw] ${i % 2 ? 'translate-y-6 sm:translate-y-10' : ''}`}>
            <CmsImage src={p.src} decorative sizes="(min-width: 1024px) 22vw, 58vw" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  )
}

export function SpacerSection({ data }: { data: SectionData<'spacer'> }) {
  const h = { sm: 'h-6', md: 'h-12', lg: 'h-24' }[data.size]
  return <div className={h} aria-hidden="true" />
}

export type { CmsButton }
