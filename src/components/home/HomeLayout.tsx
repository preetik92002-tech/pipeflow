import type { ReactNode } from 'react'
import { ArrowRight, ClipboardList, FileText, MessageSquareText, Search, ShieldAlert, Star, TrendingUp } from 'lucide-react'
import type { Section, SectionData } from '@/lib/cms-pages/sections/schema'
import { HANDSHAKE_PHOTO, PHOTOS, PLACEHOLDER_PHOTOS, SERVICE_PHOTOS, type Photo } from '@/lib/media/photos'
import { CmsImage } from '@/components/cms/CmsImage'
import { CmsButtons, SmartLink } from '@/components/cms/CmsButtons'
import { RichTextRenderer } from '@/components/cms/RichTextRenderer'
import { HomeHero } from '@/components/cms/HomeHero'
import { FaqAccordion, FrontRangeMap, PhotoCards, PhotoFrame, PhotoSplit, PipeSteps, Rail, ReviewsSection, type PageContext } from '@/components/cms/sections'
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

/** Why customers use PipeFlowCo: icon and a short label, one line each. */
const REASONS = [
  { Icon: FileText, title: 'Clear information first', text: 'Problems, options and what to send.' },
  { Icon: ClipboardList, title: 'One simple request', text: 'Explain the problem once, not five times.' },
  { Icon: MessageSquareText, title: 'Honest expectations', text: 'A plain answer on coverage and next steps.' },
]

const isAreas = (s: Of<'featureCards'>) => /serving|service areas?|locations?/i.test(s.data.heading) || s.data.cards.some((c) => /^\/(denver|boulder)$/.test(c.href))
const isServicePanels = (s: Of<'featureCards'>) => s.data.cards.length > 0 && s.data.cards.every((c) => c.href) && s.data.cards.some((c) => /^\/(plumbing|hvac)$/.test(c.href))
// Guides: linked cards that point at /resources or /blog (with or without images), or a section headed as resources.
const isResources = (s: Of<'featureCards'>) =>
  s.data.cards.length > 0 && s.data.cards.every((c) => c.href) && (s.data.cards.every((c) => /^\/(resources|blog)(\/|$)/.test(c.href)) || /resource|guide/i.test(s.data.heading) || !s.data.cards.some((c) => c.image))

/**
 * Default photo for a customer pathway card, from its label and heading. An image chosen for the block in the page
 * editor always wins; the two placeholders stand in for photos the site does not have yet.
 */
const pathwayPhoto = (b: SectionData<'contentBlock'>): Pick<Photo, 'src' | 'alt'> => {
  if (b.image) return { src: b.image, alt: b.imageAlt }
  const t = `${b.label} ${b.heading}`.toLowerCase()
  if (/photo|problem|show/.test(t)) return PLACEHOLDER_PHOTOS.photoUpload
  if (/commercial|business/.test(t)) return PLACEHOLDER_PHOTOS.commercialBuilding
  if (/find|pro/.test(t)) return PHOTOS.plumberSinkTrap
  return PHOTOS.houseBlossom
}

function Heading({ kicker, title, intro, id, center = false, light = false }: { kicker?: string; title: string; intro?: string; id: string; center?: boolean; light?: boolean }) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {kicker && <p className={`ui-kicker mb-2 ${light ? '!text-terra-light' : ''}`}>{kicker}</p>}
      <h2 id={id} className={`font-display text-display-lg font-semibold ${light ? 'text-white' : 'text-ink'}`}>
        {title}
      </h2>
      {intro && <p className={`mt-3 text-base leading-relaxed lg:text-[1.05rem] ${light ? 'text-white/80' : 'text-neutral-600'}`}>{intro}</p>}
    </div>
  )
}

/**
 * The homepage, composed from the sections stored for it in the CMS: service panels, service link lists, steps,
 * customer pathways, service areas, resources and the closing call to action all come from the saved content, so
 * an admin's edits still show. Sections this layout does not recognise are rendered in order (renderOther), so
 * nothing an admin adds is lost. The page-level copy below the hero (introduction, reasons, FAQs) comes from the
 * approved content document.
 *
 * Rhythm: photo and text alternate down the page (never two text-only bands in a row), and on phones the service
 * panels, pathways and resources are swipe rows instead of tall stacks.
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
  // Pathways are the short content blocks without a side image ("Image position: none"); a block image becomes the card photo.
  const pathways = takeAll('contentBlock', (s) => s.data.imagePosition === 'none' || !s.data.image)
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

      {/* 1. What PipeFlowCo is, beside a photo, with why people use it as three short points. */}
      <section className="bg-white section-y" aria-labelledby="home-intro">
        <PhotoSplit photo={HANDSHAKE_PHOTO}>
          <h2 id="home-intro" className="font-display text-display-lg font-semibold text-ink">
            One place to find plumbing and HVAC help
          </h2>
          <p className="mt-3 max-w-prose text-base leading-relaxed text-neutral-700 lg:text-[1.05rem]">
            See common problems and your options, then send one request. We cover homes and businesses in Denver, Boulder and surrounding communities.
          </p>
          <h3 className="mt-7 font-sans text-sm font-semibold text-neutral-600">Why customers use PipeFlowCo</h3>
          {/* Phones: three icons with their labels in one row; the one-line explanations join from 640px. */}
          <ul className="mt-3 grid grid-cols-3 gap-3">
            {REASONS.map(({ Icon, title, text }) => (
              <li key={title} className="flex flex-col gap-2.5">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-paper text-terra">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[0.95rem] font-semibold leading-snug text-ink sm:text-base">{title}</span>
                  <span className="mt-0.5 hidden text-[0.95rem] leading-snug text-neutral-600 sm:block">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </PhotoSplit>
      </section>

      {/* 2. Service selection: Plumbing and HVAC panels with their core pages (the stored service lists). */}
      {panels && (
        <section id="services" className="scroll-mt-24 bg-paper section-y" aria-labelledby="home-services">
          <div className="container-wide">
            <Heading id="home-services" title={panels.data.heading || 'What Service Do You Need?'} intro={panels.data.intro} />
            <Rail label="Service categories" cols={2} className="mt-6 sm:mt-8">
              {panels.data.cards.map((card) => {
                const photo = card.image || SERVICE_PHOTOS[card.href]?.src
                const sub = linksFor(card.href)
                return (
                  <li key={card.href} className="flex">
                    <article className="ui-card flex w-full flex-col overflow-hidden">
                      {photo && (
                        <div className="relative aspect-[2/1] bg-mist lg:aspect-[5/2]">
                          <CmsImage src={photo} alt={card.imageAlt} decorative={!card.imageAlt} sizes="(min-width: 768px) 45vw, 82vw" className="object-cover" />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <h3 className="ui-h3 text-2xl">{card.title}</h3>
                        {card.text && <p className="ui-body mt-2 text-neutral-600">{card.text}</p>}
                        {sub.length > 0 && (
                          // Phones: one link per row (a narrow card cannot fit pills side by side). From 640px: pills.
                          <ul className="mt-3 divide-y divide-line border-y border-line sm:mt-4 sm:flex sm:flex-wrap sm:gap-2 sm:divide-y-0 sm:border-0" aria-label={`${card.title}: popular pages`}>
                            {sub.map((l) => (
                              <li key={l.href}>
                                <SmartLink href={l.href} className="group flex min-h-[2.75rem] items-center justify-between gap-2 text-[0.95rem] font-medium text-ink hover:text-terra dark:hover:text-[#F4A3A3] sm:rounded-full sm:border sm:border-line sm:bg-white sm:px-3.5 sm:hover:border-ink/40 sm:hover:bg-paper sm:hover:text-ink sm:dark:hover:bg-[#132952] sm:dark:hover:text-[#EAF1FB]">
                                  {l.label}
                                  <ArrowRight className="h-4 w-4 flex-none text-ink/40 sm:hidden" aria-hidden="true" />
                                </SmartLink>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-auto pt-5">
                          <SmartLink href={card.href} className="ui-btn ui-btn-dark w-full whitespace-nowrap px-4 sm:w-auto sm:px-5">
                            Explore {card.title}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </SmartLink>
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </Rail>
          </div>
        </section>
      )}

      {/* Stored service lists that did not belong to a panel keep their place here. */}
      {unmatchedLists.map((l) => (
        <div key={l.id}>{renderOther(l)}</div>
      ))}

      {/* 3. How it works: numbered steps on one pipe line, beside a photo of the work. */}
      <section className="bg-white section-y" aria-labelledby="home-how">
        <PhotoSplit photo={PHOTOS.plumberBathroom} flip>
          <Heading id="home-how" title={steps?.data.heading || 'How PipeFlowCo Works'} intro={steps?.data.intro || undefined} />
          {steps && steps.data.steps.length > 0 && (
            <div className="mt-7">
              <PipeSteps steps={steps.data.steps} flow />
            </div>
          )}
          {steps && steps.data.buttons.length > 0 && <CmsButtons buttons={steps.data.buttons} className="mt-7" />}
        </PhotoSplit>
      </section>

      {/* 4. Customer pathways: photo cards for residential, commercial, photo uploads and finding a pro (the stored content blocks). */}
      {pathways.length > 0 && (
        <section className="bg-paper section-y" aria-labelledby="home-ways">
          <div className="container-wide">
            <Heading id="home-ways" title="Ways to get help" />
            <Rail label="Ways to get help" cols={pathways.length >= 4 ? 4 : pathways.length === 3 ? 3 : 2} className="mt-6 sm:mt-8">
              {pathways.map((p) => {
                const photo = pathwayPhoto(p.data)
                return (
                  <li key={p.id} className="flex">
                    <article className="ui-card flex w-full flex-col overflow-hidden" aria-labelledby={`way-${p.id}`}>
                      <div className="relative aspect-[16/10] bg-mist">
                        <CmsImage src={photo.src} alt={photo.alt} sizes="(min-width: 1024px) 24vw, (min-width: 768px) 45vw, 82vw" className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        {p.data.label && <p className="ui-kicker">{p.data.label}</p>}
                        <h3 id={`way-${p.id}`} className={`ui-h3 text-lg ${p.data.label ? 'mt-1' : ''}`}>
                          {p.data.heading}
                        </h3>
                        <RichTextRenderer doc={p.data.content} className="cms-prose cms-prose-sm mt-2 flex-1 [&_p]:line-clamp-4" />
                        {p.data.button && <CmsButtons buttons={[p.data.button]} asLinks className="mt-4" />}
                      </div>
                    </article>
                  </li>
                )
              })}
            </Rail>
          </div>
        </section>
      )}

      {/* 5. Service areas: Denver and Boulder, presented as areas (not offices), with the existing map. */}
      {areas && (
        <section className="bg-ink section-y text-white" aria-labelledby="home-areas" data-dark>
          <div className="container-wide grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="lg:col-span-6">
              <Heading id="home-areas" title={areas.data.heading || 'Serving Denver and Boulder, Colorado'} light
                intro={areas.data.intro || "We focus on Denver and Boulder. Share your ZIP code with your request and we'll confirm coverage, even just outside these areas."} />
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {areas.data.cards.map((card) => (
                  <li key={card.href || card.title}>
                    <SmartLink href={card.href || '/'} className="group flex h-full items-center gap-3 rounded-xl bg-white p-2.5 pr-4 text-ink transition-shadow hover:shadow-card-hover">
                      <span className="relative block h-16 w-20 flex-none overflow-hidden rounded-lg bg-mist">
                        {card.image && <CmsImage src={card.image} alt={card.imageAlt} decorative={!card.imageAlt} sizes="80px" className="object-cover" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{card.title}</span>
                        {card.text && <span className="mt-0.5 line-clamp-2 text-[0.9rem] leading-snug text-neutral-600">{card.text}</span>}
                      </span>
                      <ArrowRight className="h-4 w-4 flex-none text-terra transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
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
      )}

      {/* 6. Reviews: real records only; until there are some, a trust strip (credentials, areas, how matching works). */}
      <ReviewsSection reviews={ctx.reviews ?? []} stats={ctx.reviewStats} />

      {/* 7. Helpful resources (stored guide links), as photo cards. */}
      {resources && (
        <section className="bg-white section-y" aria-labelledby="home-resources">
          <div className="container-wide">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <Heading id="home-resources" title={resources.data.heading} intro={resources.data.intro || undefined} />
              <SmartLink href="/resources" className="ui-link min-h-[2.75rem] flex-none">
                All guides <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </SmartLink>
            </div>
            <div className="mt-6 sm:mt-8">
              <PhotoCards cards={resources.data.cards} label={resources.data.heading || 'Guides'} cta="Read the guide" />
            </div>
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
        <div className="container-wide grid gap-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Heading id="home-faq" title="Frequently Asked Questions" />
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-base leading-relaxed text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/30 dark:text-[#fde68a]">
              <ShieldAlert className="mt-1 h-4 w-4 flex-none" aria-hidden="true" />
              Gas smell, carbon monoxide alarm or flooding near electrical equipment? Leave the area and call 911 or your gas utility.
            </p>
          </div>
          <FaqAccordion items={HOME_FAQS} className="lg:col-span-8 lg:self-start" />
        </div>
      </section>

      {/* 9. Contractor journey: a separate, secondary panel with its own photo and action. */}
      <section className="bg-white section-y" aria-labelledby="company-cta">
        <div className="container-wide">
          <div className="grid overflow-hidden rounded-2xl border border-line bg-white md:grid-cols-12">
            <PhotoFrame photo={PHOTOS.technicianToolBelt} className="!rounded-none md:col-span-5 md:!aspect-auto md:h-full" sizes="(min-width: 768px) 40vw, 100vw" />
            <div className="p-6 sm:p-8 md:col-span-7 lg:p-10">
              <p className="ui-kicker !text-brand-blue">For plumbing and HVAC companies</p>
              <h2 id="company-cta" className="mt-2 font-display text-display-lg font-semibold text-ink">
                Are You a Plumbing or HVAC Company?
              </h2>
              <p className="ui-body mt-2 max-w-prose text-neutral-600">We help plumbing and HVAC companies grow their reputation, search visibility and leads.</p>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  { Icon: Star, label: 'Reputation management' },
                  { Icon: Search, label: 'Local SEO' },
                  { Icon: TrendingUp, label: 'Lead generation' },
                ].map(({ Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5 font-medium text-ink">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-paper text-brand-blue">
                      <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
                <SmartLink href={contractorCta?.data.buttons.find((b) => b.href)?.href ?? '/for-contractors'} className="ui-btn ui-btn-dark">
                  Request a Marketing Consultation
                </SmartLink>
                <SmartLink href="/for-contractors" className="ui-btn ui-btn-secondary">
                  View Marketing Services
                </SmartLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. One closing customer call to action, with the quick request start. The availability note sits with the form. */}
      <section className="bg-ink section-y text-white" aria-labelledby="home-final" data-dark>
        <div className="container-wide grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-5">
            <h2 id="home-final" className="font-display text-display-lg font-semibold text-white">
              {finalCta?.data.heading || 'Ready to Request Plumbing or HVAC Service?'}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/80 lg:text-[1.05rem]">
              {finalCta?.data.text || "Tell us what you need and where you're located. We'll follow up about availability and next steps."}
            </p>
            <p className="mt-4 flex items-start gap-2 text-sm text-white/70">
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
