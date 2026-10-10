import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, Check } from 'lucide-react'
import type { SectionData } from '@/lib/cms-pages/sections/schema'
import { CmsButtons } from './CmsButtons'
import { CmsImage } from './CmsImage'
import { RichTextRenderer } from './RichTextRenderer'

const wrap = 'container-site'
const h2 = 'font-display text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl'

export function HeroSection({ data, first }: { data: SectionData<'hero'>; first: boolean }) {
  const center = data.align === 'center'
  const hasImage = data.image !== ''
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 text-white" aria-labelledby={first ? 'page-title' : undefined}>
      {hasImage && (
        <>
          <CmsImage src={data.image} alt="" priority={first} sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-navy-900/75" aria-hidden="true" />
        </>
      )}
      <div className={`${wrap} py-16 sm:py-20 lg:py-28 ${center ? 'text-center' : ''}`}>
        <div className={center ? 'mx-auto max-w-3xl' : 'max-w-3xl'}>
          {data.eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-blue-lighter">{data.eyebrow}</p>}
          <h1 id={first ? 'page-title' : undefined} className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {data.heading}
          </h1>
          {data.subtitle && <p className="mt-5 text-lg leading-relaxed text-neutral-200">{data.subtitle}</p>}
          {data.intro && (
            <div className="mt-4 space-y-3 leading-relaxed text-neutral-300">
              {data.intro.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          <CmsButtons buttons={data.buttons} onDark center={center} />
        </div>
      </div>
    </section>
  )
}

export function RichTextSection({ data }: { data: SectionData<'richText'> }) {
  return (
    <section className="py-10 sm:py-12">
      <div className={`${wrap}`}>
        <RichTextRenderer doc={data.content} className="cms-prose max-w-3xl" />
      </div>
    </section>
  )
}

export function ContentBlockSection({ data }: { data: SectionData<'contentBlock'> }) {
  const hasImage = data.image !== '' && data.imagePosition !== 'none'
  return (
    <section className="py-10 sm:py-14">
      <div className={`${wrap} ${hasImage ? 'grid items-center gap-8 lg:grid-cols-2 lg:gap-12' : ''}`}>
        {hasImage && (
          <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 ${data.imagePosition === 'right' ? 'lg:order-2' : ''}`}>
            <CmsImage src={data.image} alt={data.imageAlt} className="object-cover" />
          </div>
        )}
        <div className={hasImage ? '' : 'max-w-3xl'}>
          {data.label && <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-red">{data.label}</p>}
          <h2 className={h2}>{data.heading}</h2>
          <RichTextRenderer doc={data.content} className="cms-prose mt-4" />
          {data.button && <CmsButtons buttons={[data.button]} />}
        </div>
      </div>
    </section>
  )
}

export function GallerySection({ data }: { data: SectionData<'gallery'> }) {
  if (!data.images.length) return null
  const cols = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[data.columns]
  return (
    <section className="py-10 sm:py-14">
      <div className={wrap}>
        {data.heading && <h2 className={`${h2} mb-6`}>{data.heading}</h2>}
        <ul className={`grid gap-4 ${cols}`}>
          {data.images.map((img, i) => (
            <li key={i}>
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
                  <CmsImage src={img.src} alt={img.alt} sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
                </div>
                {img.caption && <figcaption className="mt-2 text-sm text-neutral-600">{img.caption}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function FeatureCardsSection({ data }: { data: SectionData<'featureCards'> }) {
  return (
    <section className="py-10 sm:py-14">
      <div className={wrap}>
        {data.heading && <h2 className={h2}>{data.heading}</h2>}
        {data.intro && <p className="mt-3 max-w-3xl text-neutral-600">{data.intro}</p>}
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.cards.map((card, i) => {
            const inner = (
              <>
                {card.image && (
                  <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-lg bg-neutral-100">
                    <CmsImage src={card.image} alt="" sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
                  </div>
                )}
                <h3 className="font-display text-lg font-semibold text-navy-800">{card.title}</h3>
                {card.text && <p className="mt-2 text-sm leading-relaxed text-neutral-600">{card.text}</p>}
              </>
            )
            const cls = 'block h-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm'
            return (
              <li key={i}>
                {card.href ? (
                  card.href.startsWith('/') ? (
                    <Link href={card.href} className={`${cls} transition hover:border-brand-blue hover:shadow-md`}>{inner}</Link>
                  ) : (
                    <a href={card.href} className={`${cls} transition hover:border-brand-blue hover:shadow-md`}>{inner}</a>
                  )
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function ComparisonSection({ data }: { data: SectionData<'comparison'> }) {
  return (
    <section className="py-10 sm:py-14">
      <div className={wrap}>
        <h2 className={h2}>{data.heading}</h2>
        {data.intro && <p className="mt-3 max-w-3xl text-neutral-600">{data.intro}</p>}
        <div className={`mt-8 grid gap-5 ${data.columns.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>
          {data.columns.map((col, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h3 className="font-display text-lg font-semibold text-navy-800">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item, j) => (
                  <li key={j} className="flex gap-2.5 text-sm text-neutral-700">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-blue" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {data.outro && <p className="mt-6 max-w-3xl text-neutral-600">{data.outro}</p>}
        <CmsButtons buttons={data.buttons} />
      </div>
    </section>
  )
}

export function StepsSection({ data }: { data: SectionData<'steps'> }) {
  return (
    <section className="py-10 sm:py-14">
      <div className={wrap}>
        <h2 className={h2}>{data.heading}</h2>
        {data.intro && <p className="mt-3 max-w-3xl text-neutral-600">{data.intro}</p>}
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.steps.map((step, i) => (
            <li key={i} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue font-display text-sm font-bold text-white" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-navy-800">{step.title}</h3>
              {step.text && <p className="mt-2 text-sm leading-relaxed text-neutral-600">{step.text}</p>}
            </li>
          ))}
        </ol>
        <CmsButtons buttons={data.buttons} />
      </div>
    </section>
  )
}

export function FaqSection({ data }: { data: SectionData<'faq'> }) {
  if (!data.items.length) return null
  return (
    <section className="py-10 sm:py-14">
      <div className={`${wrap} max-w-4xl`}>
        <h2 className={h2}>{data.heading}</h2>
        <div className="mt-6 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
          {data.items.map((item, i) => (
            <details key={i} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy-800">
                {item.question}
                <span className="text-brand-blue transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">
                {item.answer.split(/\n{2,}/).map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CtaSection({ data }: { data: SectionData<'cta'> }) {
  const dark = data.tone === 'dark'
  return (
    <section className="py-10 sm:py-14">
      <div className={wrap}>
        <div className={`rounded-3xl px-6 py-12 text-center sm:px-12 ${dark ? 'bg-navy-900 text-white' : 'border border-neutral-200 bg-neutral-50 text-navy-800'}`}>
          <h2 className="mx-auto max-w-2xl font-display text-2xl font-bold tracking-tight sm:text-3xl">{data.heading}</h2>
          {data.text && (
            <div className={`mx-auto mt-4 max-w-2xl space-y-2 leading-relaxed ${dark ? 'text-neutral-300' : 'text-neutral-600'}`}>
              {data.text.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          <CmsButtons buttons={data.buttons} onDark={dark} center />
        </div>
      </div>
    </section>
  )
}

export function TestimonialsSection({ data }: { data: SectionData<'testimonials'> }) {
  if (!data.items.length) return null
  return (
    <section className="py-10 sm:py-14">
      <div className={wrap}>
        <h2 className={h2}>{data.heading}</h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((t, i) => (
            <li key={i} className="rounded-2xl border border-neutral-200 bg-white p-6">
              {t.rating && <p className="text-sm text-amber-500" aria-label={`${t.rating} out of 5 stars`}>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</p>}
              <blockquote className="mt-2 text-neutral-700">“{t.quote}”</blockquote>
              <p className="mt-4 text-sm font-semibold text-navy-800">
                {t.name}
                {t.location && <span className="font-normal text-neutral-500"> · {t.location}</span>}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function LinkListSection({ data }: { data: SectionData<'linkList'> }) {
  if (!data.links.length) return null
  return (
    <section className="py-10 sm:py-14">
      <div className={wrap}>
        <h2 className={h2}>{data.heading}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.links.map((l, i) => {
            const cls = 'flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 font-medium text-navy-800 transition hover:border-brand-blue hover:text-brand-blue'
            return (
              <li key={i}>
                {l.href.startsWith('/') ? (
                  <Link href={l.href} className={cls}>{l.label}<span aria-hidden="true">→</span></Link>
                ) : (
                  <a href={l.href} className={cls}>{l.label}<span aria-hidden="true">→</span></a>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function ContactInfoSection({ data }: { data: SectionData<'contactInfo'> }) {
  const rows = [
    { icon: Phone, label: 'Phone', value: data.phone, href: data.phone ? `tel:${data.phone.replace(/[^+\d]/g, '')}` : '' },
    { icon: Mail, label: 'Email', value: data.email, href: data.email ? `mailto:${data.email}` : '' },
    { icon: MapPin, label: 'Address', value: data.address, href: '' },
    { icon: Clock, label: 'Hours', value: data.hours, href: '' },
  ].filter((r) => r.value)
  if (!rows.length) return null
  return (
    <section className="py-10 sm:py-14">
      <div className={wrap}>
        <h2 className={h2}>{data.heading}</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-5">
              <r.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-blue" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{r.label}</dt>
                <dd className="mt-1 text-navy-800">{r.href ? <a href={r.href} className="hover:text-brand-blue">{r.value}</a> : r.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export function SpacerSection({ data }: { data: SectionData<'spacer'> }) {
  const h = { sm: 'h-6', md: 'h-12', lg: 'h-24' }[data.size]
  return <div className={h} aria-hidden="true" />
}
