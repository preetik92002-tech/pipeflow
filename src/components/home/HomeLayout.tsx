import type { ReactNode } from 'react'
import { ArrowRight, Building2, Camera, Check, ClipboardList, Home, Info, MapPin, MessageSquareText, Search, ShieldAlert, Users } from 'lucide-react'
import type { Section, SectionData } from '@/lib/cms-pages/sections/schema'
import { SERVICE_PHOTOS } from '@/lib/media/photos'
import { CmsImage } from '@/components/cms/CmsImage'
import { CmsButtons, SmartLink } from '@/components/cms/CmsButtons'
import { RichTextRenderer } from '@/components/cms/RichTextRenderer'
import { HomeHero } from '@/components/cms/HomeHero'
import { FaqAccordion, FrontRangeMap, ReviewsSection, type PageContext } from '@/components/cms/sections'
import { QuickRequestForm } from './QuickRequestForm'

type Of<T extends Section['type']> = Extract<Section, { type: T }>

/** Homepage questions from the approved content document (no prices, guarantees or staffing claims). */
const HOME_FAQS = [
  { question: 'What is PipeFlowCo?', answer: 'A website where homeowners and businesses can explore plumbing and HVAC services in Denver and Boulder and send service requests. We also offer marketing services to plumbing and HVAC companies.' },
  { question: 'Does PipeFlowCo send its own technicians?', answer: 'Our website is designed to help you explore service options and submit inquiries. Who performs the work, and the terms of that service, will be explained when we respond to your request.' },
  { question: 'Which areas do you serve?', answer: "We currently focus on Denver and Boulder, Colorado, and surrounding communities where coverage is available. Enter your ZIP code and we'll confirm whether we can help." },
  { question: 'Is my request a guarantee of service?', answer: 'No. Submitting a request does not guarantee immediate service or provider availability.' },
  { question: 'Can I submit a request for my business or rental property?', answer: 'Yes. Choose residential or commercial and describe your property and needs.' },
  { question: 'What should I include in my request?', answer: 'The type of service, your ZIP code, residential or commercial, a short description of the problem, and your preferred timing.' },
  { question: 'What should I do in a plumbing or heating emergency?', answer: 'If you smell gas, suspect a carbon monoxide problem, or see flooding near electrical equipment, leave the area and contact your gas utility or 911 right away. A website form is not an emergency line.' },
  { question: 'I own a plumbing or HVAC company. Can PipeFlowCo help my business?', answer: 'Yes. We offer reputation management, SEO, and lead generation for plumbing and HVAC companies.' },
]

const REASONS = [
  { title: 'Clear information first', text: 'Each service page explains common problems, your options, and what to include in your request.' },
  { title: 'One simple request', text: 'Send your details once instead of calling around to explain the same problem repeatedly.' },
  { title: 'Honest expectations', text: "We'll tell you plainly whether we can help in your area and what the next step is." },
]

const isAreas = (s: Of<'featureCards'>) => /serving|service areas?|locations?/i.test(s.data.heading) || s.data.cards.some((c) => /^\/(denver|boulder)$/.test(c.href))
const isServicePanels = (s: Of<'featureCards'>) => s.data.cards.length > 0 && s.data.cards.every((c) => c.href) && s.data.cards.some((c) => /^\/(plumbing|hvac)$/.test(c.href))
const isResources = (s: Of<'featureCards'>) => s.data.cards.length > 0 && s.data.cards.every((c) => c.href) && !s.data.cards.some((c) => c.image)
const pathwayIcon = (b: SectionData<'contentBlock'>) => {
  const t = `${b.label} ${b.heading}`.toLowerCase()
  if (/photo|problem|show/.test(t)) return Camera
  if (/commercial|business/.test(t)) return Building2
  if (/find|pro/.test(t)) return Search
  return Home
}

function Heading({ kicker, title, intro, id, center = false, light = false }: { kicker?: string; title: string; intro?: string; id: string; center?: boolean; light?: boolean }) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {kicker && <p className={`ui-kicker ${light ? '!text-terra-light' : ''}`}>{kicker}</p>}
      <h2 id={id} className={`mt-2 font-display text-display-lg font-semibold ${light ? 'text-white' : 'text-ink'}`}>
        {title}
      </h2>
      {intro && <p className={`mt-3 text-[1.02rem] leading-relaxed ${light ? 'text-white/80' : 'text-neutral-600'}`}>{intro}</p>}
    </div>
  )
}

/**
 * The homepage, composed from the sections stored for it in the CMS: service panels, service link lists, steps,
 * customer pathways, service areas, resources and the closing call to action all come from the saved content, so
 * an admin's edits still show. Sections this layout does not recognise are rendered in order (renderOther), so
 * nothing an admin adds is lost. The page-level copy below the hero (introduction, reasons, FAQs) comes from the
 * approved content document.
 */
export function HomeLayout({ sections, ctx, renderOther }: { sections: Section[]; ctx: PageContext; renderOther: (s: Section) => ReactNode }) {
  const used = new Set<string>()
  const take = <T extends Section['type']>(type: T, pred: (s: Of<T>) => boolean = () => true): Of<T> | undefined => {
    const hit = sections.find((s): s is Of<T> => s.type === type && !used.has(s.id) && pred(s as Of<T>))
    if (hit) used.add(hit.id)
    return hit
  }
  const takeAll = <T extends Section['type']>(type: T, pred: (s: Of<T>) => boolean = () => true): Of<T>[] => {
    const hits = sections.filter((s): s is Of<T> => s.type === type && !used.has(s.id) && pred(s as Of<T>))
    hits.forEach((h) => used.add(h.id))
    return hits
  }

  const hero = take('hero')
  const panels = take('featureCards', isServicePanels)
  const areas = take('featureCards', isAreas)
  const resources = take('featureCards', isResources)
  const linkLists = takeAll('linkList')
  const steps = take('steps')
  const pathways = takeAll('contentBlock', (s) => !(s.data.image && s.data.imagePosition !== 'none'))
  const ctas = takeAll('cta')
  const finalCta = ctas.find((c) => c.data.tone === 'dark') ?? ctas[ctas.length - 1]
  const contractorCta = ctas.find((c) => c !== finalCta && c.data.buttons.some((b) => /contractor|join-us|marketing/.test(b.href)))
  const otherCtas = ctas.filter((c) => c !== finalCta && c !== contractorCta)
  const others = sections.filter((s) => !used.has(s.id))

  const linksFor = (href: string) => linkLists.flatMap((l) => l.data.links).filter((l) => l.href.startsWith(`${href}/`))
  const unmatchedLists = linkLists.filter((l) => !panels?.data.cards.some((c) => l.data.links.some((x) => x.href.startsWith(`${c.href}/`))))

  return (
    <>
      <HomeHero labelId={hero ? 'page-title' : undefined} />

      {/* 1. Short introduction: what PipeFlowCo is, before any service list. */}
      <section className="border-b border-line bg-white py-10 sm:py-12" aria-labelledby="home-intro">
        <div className="container-wide grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-7">
            <p className="ui-kicker">About PipeFlowCo</p>
            <h2 id="home-intro" className="mt-2 font-display text-display-md font-semibold text-ink">
              One place to explore plumbing and HVAC services
            </h2>
            <p className="mt-3 max-w-prose text-[1.02rem] leading-relaxed text-neutral-700">
              PipeFlowCo helps homeowners, property managers and businesses explore plumbing and HVAC service options in Denver, Boulder and surrounding communities where coverage is available. Each service page explains common problems, your options and what to include in a request. When you&apos;re ready, send one inquiry and we&apos;ll follow up about availability and next steps.
            </p>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
            {[
              { Icon: MapPin, text: 'Service areas: Denver and Boulder, Colorado' },
              { Icon: Users, text: 'Residential and commercial inquiries' },
              { Icon: ClipboardList, text: 'One request, clear next steps' },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 rounded-lg bg-paper px-3.5 py-3 text-[0.93rem] font-medium text-ink">
                <Icon className="h-5 w-5 flex-none text-terra" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2. Service selection: Plumbing and HVAC panels with their core pages (the stored service lists). */}
      {panels && (
        <section id="services" className="scroll-mt-24 bg-paper section-y" aria-labelledby="home-services">
          <div className="container-wide">
            <Heading id="home-services" title={panels.data.heading || 'What Service Do You Need?'} intro={panels.data.intro} />
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {panels.data.cards.map((card) => {
                const photo = card.image || SERVICE_PHOTOS[card.href]?.src
                const sub = linksFor(card.href)
                return (
                  <article key={card.href} className="ui-card flex flex-col overflow-hidden">
                    {photo && (
                      <div className="relative aspect-[16/9] bg-mist sm:aspect-[2/1]">
                        <CmsImage src={photo} alt={card.imageAlt} decorative={!card.imageAlt} sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <h3 className="ui-h3 text-2xl">{card.title}</h3>
                      {card.text && <p className="mt-2 text-[0.95rem] leading-relaxed text-neutral-600">{card.text}</p>}
                      {sub.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${card.title}: popular pages`}>
                          {sub.map((l) => (
                            <li key={l.href}>
                              <SmartLink href={l.href} className="inline-flex min-h-[2.25rem] items-center rounded-full border border-line bg-white px-3 text-sm font-medium text-ink transition-colors hover:border-ink/40 hover:bg-paper">
                                {l.label}
                              </SmartLink>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-auto pt-5">
                        <SmartLink href={card.href} className="ui-btn ui-btn-dark ui-btn-sm">
                          Explore {card.title}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </SmartLink>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Stored service lists that did not belong to a panel keep their place here. */}
      {unmatchedLists.map((l) => (
        <div key={l.id}>{renderOther(l)}</div>
      ))}

      {/* 3. How it works and why people use PipeFlowCo, side by side. */}
      <section className="bg-white section-y" aria-labelledby="home-how">
        <div className="container-wide grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Heading kicker="How it works" id="home-how" title={steps?.data.heading || 'How PipeFlowCo Works'} intro={steps?.data.intro || undefined} />
            {steps && steps.data.steps.length > 0 && (
              <ol className="mt-7 grid gap-3 sm:grid-cols-2" data-flow>
                {steps.data.steps.map((step, i) => (
                  <li key={i} className="flex gap-3.5 rounded-xl border border-line bg-white p-4">
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink text-sm font-bold text-white" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{step.title}</span>
                      {step.text && <span className="mt-1 block text-[0.92rem] leading-relaxed text-neutral-600">{step.text}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-4 flex items-start gap-2 text-sm text-neutral-600">
              <Info className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
              Submitting a request does not guarantee immediate service or availability of a provider. Pricing, scheduling and service terms are determined with the service provider.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-paper p-5 sm:p-6">
              <h2 className="font-display text-xl font-semibold text-ink">Why customers use PipeFlowCo</h2>
              <ul className="mt-4 space-y-4">
                {REASONS.map((r) => (
                  <li key={r.title} className="flex gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-none text-terra" aria-hidden="true" />
                    <span>
                      <span className="block font-semibold text-ink">{r.title}</span>
                      <span className="mt-0.5 block text-[0.93rem] leading-relaxed text-neutral-600">{r.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Customer pathways: residential, commercial, photo uploads, finding a pro (the stored content blocks). */}
      {pathways.length > 0 && (
        <section className="border-t border-line bg-white pb-12 pt-10 sm:pb-16" aria-label="Ways to get help">
          <div className="container-wide">
            <ul className={`grid gap-4 sm:grid-cols-2 ${pathways.length >= 4 ? 'lg:grid-cols-4' : pathways.length === 3 ? 'lg:grid-cols-3' : ''}`}>
              {pathways.map((p) => {
                const Icon = pathwayIcon(p.data)
                return (
                  <li key={p.id} className="ui-card flex flex-col p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-paper text-terra">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {p.data.label && <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{p.data.label}</p>}
                    <h3 className={`ui-h3 text-lg ${p.data.label ? 'mt-1' : 'mt-4'}`}>{p.data.heading}</h3>
                    <RichTextRenderer doc={p.data.content} className="cms-prose mt-2 flex-1 !text-[0.93rem] !leading-relaxed" />
                    {p.data.button && <CmsButtons buttons={[p.data.button]} asLinks className="mt-4" />}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      {/* 5. Service areas: Denver and Boulder, presented as areas (not offices), with the existing map. */}
      {areas && (
        <section className="bg-ink section-y text-white" aria-labelledby="home-areas" data-dark>
          <div className="container-wide grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="lg:col-span-6">
              <Heading kicker="Service areas" id="home-areas" title={areas.data.heading || 'Serving Denver and Boulder, Colorado'} light
                intro={areas.data.intro || 'PipeFlowCo currently focuses on Denver and Boulder. Availability depends on your location and the type of service you need, so we ask for your ZIP code with every request. These are service areas, not office locations.'} />
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {areas.data.cards.map((card) => (
                  <li key={card.href || card.title}>
                    <SmartLink href={card.href || '/'} className="group flex h-full items-center gap-3 rounded-xl bg-white p-2.5 pr-4 text-ink transition-shadow hover:shadow-card-hover">
                      <span className="relative block h-16 w-20 flex-none overflow-hidden rounded-lg bg-mist">
                        {card.image && <CmsImage src={card.image} alt={card.imageAlt} decorative={!card.imageAlt} sizes="80px" className="object-cover" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{card.title}</span>
                        {card.text && <span className="mt-0.5 text-[0.82rem] leading-snug text-neutral-600 line-clamp-2">{card.text}</span>}
                      </span>
                      <ArrowRight className="h-4 w-4 flex-none text-terra transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </SmartLink>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-white/70">Outside Denver or Boulder? Send a request anyway. We&apos;ll let you know whether service coverage is available in your area.</p>
            </div>
            <div className="hidden lg:col-span-6 lg:block">
              <FrontRangeMap className="mx-auto w-full max-w-md" />
            </div>
          </div>
        </section>
      )}

      {/* 6. Reviews: real records only; a quiet line when there are none. */}
      <ReviewsSection reviews={ctx.reviews ?? []} stats={ctx.reviewStats} />

      {/* 7. Helpful resources (stored guide links). */}
      {resources && (
        <section className="border-t border-line bg-white py-10 sm:py-14" aria-labelledby="home-resources">
          <div className="container-wide grid gap-6 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <Heading kicker="Resources" id="home-resources" title={resources.data.heading} intro={resources.data.intro || undefined} />
            </div>
            <ul className="grid gap-x-8 sm:grid-cols-2 lg:col-span-8">
              {resources.data.cards.map((c) => (
                <li key={c.href} className="border-b border-line">
                  <SmartLink href={c.href} className="group flex min-h-[3.25rem] items-center justify-between gap-4 py-3 text-[0.98rem] font-semibold text-ink hover:text-terra">
                    <span>{c.title}</span>
                    <ArrowRight className="h-4 w-4 flex-none transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Anything else an admin added to the homepage, in its saved order. */}
      {others.map((s) => (
        <div key={s.id}>{renderOther(s)}</div>
      ))}
      {otherCtas.map((s) => (
        <div key={s.id}>{renderOther(s)}</div>
      ))}

      {/* 8. Questions. */}
      <section className="bg-paper section-y" aria-labelledby="home-faq">
        <div className="container-wide grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Heading kicker="FAQ" id="home-faq" title="Frequently Asked Questions" />
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
              <ShieldAlert className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
              Gas smell, carbon monoxide alarm or flooding near electrical equipment? Leave the area and call 911 or your gas utility. A website form is not an emergency line.
            </p>
          </div>
          <FaqAccordion items={HOME_FAQS} className="lg:col-span-8" />
        </div>
      </section>

      {/* 9. Contractor journey: a separate, secondary panel with its own action. */}
      <section className="bg-white py-10 sm:py-14" aria-labelledby="company-cta">
        <div className="container-wide">
          <div className="grid gap-6 rounded-2xl border border-line bg-white p-6 sm:p-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <p className="ui-kicker !text-brand-blue">For plumbing &amp; HVAC companies</p>
              <h2 id="company-cta" className="mt-2 font-display text-display-md font-semibold text-ink">
                Are You a Plumbing or HVAC Company?
              </h2>
              <p className="mt-2 max-w-prose text-[0.98rem] leading-relaxed text-neutral-600">We also help plumbing and HVAC companies grow their reputation, search visibility, and leads.</p>
              <ul className="mt-4 flex flex-wrap gap-2 text-sm text-neutral-700">
                {['Reputation management', 'Local SEO', 'Lead generation'].map((t) => (
                  <li key={t} className="rounded-full bg-paper px-3 py-1">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col lg:items-stretch">
              <SmartLink href={contractorCta?.data.buttons.find((b) => b.href)?.href ?? '/for-contractors'} className="ui-btn ui-btn-dark">
                Request a Marketing Consultation
              </SmartLink>
              <SmartLink href="/for-contractors" className="ui-btn ui-btn-secondary">
                View Marketing Services
              </SmartLink>
            </div>
          </div>
        </div>
      </section>

      {/* 10. One closing customer call to action, with the quick request start. */}
      <section className="bg-ink section-y text-white" aria-labelledby="home-final" data-dark>
        <div className="container-wide grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-5">
            <h2 id="home-final" className="font-display text-display-lg font-semibold text-white">
              {finalCta?.data.heading || 'Ready to Request Plumbing or HVAC Service?'}
            </h2>
            <p className="mt-3 text-[1.02rem] leading-relaxed text-white/80">
              {finalCta?.data.text || "Tell us what you need and where you're located. It only takes a few minutes, and we'll follow up about availability and next steps."}
            </p>
            <p className="mt-4 flex items-start gap-2 text-sm text-white/65">
              <MessageSquareText className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
              Submitting a request does not guarantee immediate service or provider availability.
            </p>
          </div>
          <div className="lg:col-span-7">
            <QuickRequestForm id="request" />
          </div>
        </div>
      </section>
    </>
  )
}
