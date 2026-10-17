import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SectionRenderer, layoutSections } from '@/components/cms/SectionRenderer'
import type { PageContext } from '@/components/cms/sections'
import { REVEAL_BOOT_SCRIPT } from '@/components/motion/RevealObserver'
import { SplitWords } from '@/components/motion/SplitWords'
import { isPublishableMessage, hasRealPhone } from '@/lib/config/contact'
import { ancestorPaths, breadcrumbJsonLd, buildCrumbs, pageKind, serviceJsonLd } from '@/lib/cms-pages/page-context'
import { sectionsSchema } from '@/lib/cms-pages/sections/schema'
import { MARQUEE_PHOTOS, PHOTOS, PROCESS_PHOTOS, SERVICE_PHOTOS, resolveImage } from '@/lib/media/photos'

const root = path.join(__dirname, '../..')
const css = readFileSync(path.join(root, 'src/app/globals.css'), 'utf8')
const uuid = () => crypto.randomUUID()
const doc = (text: string) => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] })
const hero = (extra: Record<string, unknown> = {}) => ({ id: uuid(), type: 'hero', data: { heading: 'Trusted Plumbing & HVAC Services in Denver & Boulder', image: '/art/home-pro.svg', buttons: [], ...extra } })
const steps = (n: number) => ({ id: uuid(), type: 'steps', data: { heading: 'Getting the Right Professional Is Easy', steps: Array.from({ length: n }, (_, i) => ({ title: `Step title ${i + 1}`, text: `Step text ${i + 1}` })), buttons: [{ label: 'Request Service', href: '/book-service', variant: 'primary' }] } })
const cards = (withImages: boolean, count = 2) => ({ id: uuid(), type: 'featureCards', data: { heading: 'What Service Do You Need?', cards: Array.from({ length: count }, (_, i) => ({ title: `Card ${i}`, text: '', href: '/plumbing', image: withImages ? '/art/hero-plumbing.svg' : '' })) } })
const ctx = (kind: PageContext['kind'], extra: Partial<PageContext> = {}): PageContext => ({ kind, crumbs: [], ...extra })
const render = (sections: unknown[], c: PageContext) => renderToStaticMarkup(<SectionRenderer sections={sections} ctx={c} />)
const count = (html: string, needle: string) => html.split(needle).length - 1

describe('SplitWords (hero headline)', () => {
  it('keeps the text intact, in order, with real spaces between words', () => {
    const html = renderToStaticMarkup(<h1><SplitWords text="Trusted Plumbing & HVAC Services" /></h1>)
    expect(html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&')).toBe('Trusted Plumbing & HVAC Services')
    expect(count(html, 'class="word-mask"')).toBe(5)
    expect(html).toContain('--i:4')
  })
  it('handles repeated whitespace and empty text', () => {
    expect(renderToStaticMarkup(<SplitWords text="  A   B " />).replace(/<[^>]+>/g, '')).toBe('A B')
    expect(renderToStaticMarkup(<SplitWords text="" />)).toBe('')
  })
  it('is what the hero heading uses, so the h1 is still one heading with its words', () => {
    const html = render([hero()], ctx('service'))
    expect(count(html, '<h1')).toBe(1)
    expect(html).toContain('class="word"')
  })
})

describe('hero markup contract', () => {
  it('home hero is the text-led hero with one heading and the request form', () => {
    const html = render([hero({ buttons: [{ label: 'Request Service', href: '/book-service', variant: 'primary' }] })], ctx('home'))
    expect(html).not.toContain('aria-roledescription="carousel"')
    expect(count(html, '<h1')).toBe(1)
    expect(html).toContain('Reliable Plumbing &amp; HVAC Solutions for Your Home and Business')
    expect(html).toContain('Water Heater Repair')
    expect(html).toContain('e.g. 80202')
  })
  it('photo hero exposes the hooks the scroll timeline needs', () => {
    const html = render([hero()], ctx('service'))
    for (const hook of ['data-hero', 'data-hero-media', 'data-hero-content', 'hero-clip-reveal', 'hero-photo-settle']) expect(html, hook).toContain(hook)
  })
  it('service pages use the same banner hero as the home page', () => {
    const html = render([hero()], ctx('service'))
    expect(html).toContain('data-hero-media')
    expect(html).toContain('images%2Fhero')
  })
  it('the settle/clip animations sit on different elements than the scroll transform', () => {
    // CSS animation (fill both) overrides inline transforms, so GSAP must move an inner element.
    const html = render([hero()], ctx('service'))
    expect(html).toMatch(/hero-photo-settle[^>]*>\s*<div data-hero-media/)
  })
  it('uses alt text from the section, and empty alt only when none is given', () => {
    expect(render([hero({ imageAlt: 'A plumber at work' })], ctx('service'))).toContain('alt="A plumber at work"')
    expect(render([hero()], ctx('service'))).toMatch(/alt="[^"]+"/) // falls back to the built-in photo's description
  })
})

describe('home "How it works" flow chart', () => {
  const home = ctx('home')
  it('puts every step in the DOM, in order, as a real ordered list with arrows between them', () => {
    const html = render([steps(4)], home)
    expect(html).toContain('data-flow')
    const order = [1, 2, 3, 4].map((n) => html.indexOf(`Step title ${n}`))
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(html).toContain('<ol')
    expect(html).toContain('Step text 3')
    expect(count(html, '<svg')).toBe(3) // an arrow between each pair of the 4 steps
  })
  it('uses the mascot illustrations, decorative, and keeps the button reachable after the list', () => {
    const html = render([steps(4)], home)
    expect(count(html, '/images/mascot/')).toBe(4)
    expect(html).not.toMatch(/<img[^>]+alt="[^"]+"/)
    expect(html.indexOf('Request Service')).toBeGreaterThan(html.indexOf('</ol>'))
  })
  it('is only used on the home page with 3 to 6 steps; everywhere else steps are a plain list with a filling hairline', () => {
    for (const c of [ctx('service'), ctx('page'), ctx('location')]) {
      const html = render([steps(4)], c)
      expect(html).not.toContain('data-flow')
      expect(count(html, 'data-step-line')).toBe(4)
    }
    expect(render([steps(2)], home)).not.toContain('data-flow')
    expect(render([steps(7)], home)).not.toContain('data-flow')
  })
})

describe('photo marquee and service tiles', () => {
  it('adds one decorative marquee after the first photo tiles, on the home page only', () => {
    const html = render([hero(), cards(true), cards(true)], ctx('home'))
    expect(count(html, 'data-text-marquee')).toBe(1)
    expect(html.indexOf('data-text-marquee')).toBeGreaterThan(html.indexOf('What Service Do You Need?'))
    expect(render([hero(), cards(true)], ctx('service'))).not.toContain('data-text-marquee')
    expect(render([hero(), cards(false)], ctx('home'))).not.toContain('data-text-marquee')
  })
  it('the text marquee has the exact phrases, star separators, and a hidden duplicate for a seamless loop', () => {
    const html = render([cards(true)], ctx('home'))
    const phrases = ['Expert Plumbing Repairs', 'AC Repair &amp; Installation', 'Water Heater Services', 'Emergency Plumbing', 'Residential &amp; Commercial', 'Denver &amp; Boulder', 'Trusted Local Professionals', 'Easy Scheduling']
    let last = -1
    for (const t of phrases) {
      const at = html.indexOf(t)
      expect(at, t).toBeGreaterThan(last)
      last = at
      expect(count(html, t)).toBe(2)
    }
    expect(count(html, '✦')).toBe(16)
    expect(html).toContain('aria-hidden="true"')
    expect(MARQUEE_PHOTOS).toHaveLength(8)
  })
  it('never repeats a photo that the home hero, service tiles or pinned story already show', () => {
    const onScreenElsewhere = [PHOTOS.plumberBathroom, PHOTOS.plumberUnderSink, PHOTOS.acCondenser, PHOTOS.houseBlossom, PHOTOS.technicianToolBelt, PHOTOS.denverRockies, PHOTOS.boulderFlatirons]
    for (const p of onScreenElsewhere) expect(MARQUEE_PHOTOS.map((m) => m.src), p.src).not.toContain(p.src)
  })
  it('the hero image is fetched with high priority; other images are not', () => {
    const html = render([hero()], ctx('service'))
    expect(html).toMatch(/<img[^>]*fetchPriority="high"[^>]*images%2Fhero|<img[^>]*images%2Fhero[^>]*fetchPriority="high"/)
    expect(render([cards(true)], ctx('home'))).not.toContain('fetchPriority="high"')
  })
  it('photo cards keep their photo, with an icon badge and a Learn More button', () => {
    const html = render([cards(true)], ctx('home'))
    expect(count(html, 'href="/plumbing"')).toBe(2)
    expect(count(html, 'Learn More')).toBe(2)
    expect(count(html, '<img')).toBeGreaterThanOrEqual(2)
  })
})

describe('service cards', () => {
  const links = (hrefs: string[]) => ({ id: uuid(), type: 'linkList', data: { heading: 'Plumbing', links: hrefs.map((h, i) => ({ label: `Link ${i}`, href: h })) } })
  it('shows each link as an icon card with a Learn More button and no photo', () => {
    const hrefs = ['/plumbing/plumbing-repair', '/plumbing/water-heater-repair', '/plumbing/water-heater-replacement', '/plumbing/frozen-pipe-repair', '/plumbing/plumbing-fixes']
    const html = render([links(hrefs)], ctx('page'))
    expect(count(html, 'Learn More')).toBe(5)
    for (const h of hrefs) expect(html).toContain(`href="${h}"`)
    expect(html).not.toMatch(/<img[^>]+alt="[^"]+"/)
  })
  it('has a photo for each of the five required services', () => {
    for (const p of ['/plumbing/plumbing-repair', '/plumbing/water-heater-repair', '/plumbing/frozen-pipe-repair', '/hvac/ac-repair', '/hvac/ac-installation']) expect(SERVICE_PHOTOS[p], p).toBeTruthy()
  })
})

describe('repeated call-to-action', () => {
  const cta = (heading: string, tone: 'dark' | 'light') => ({ id: uuid(), type: 'cta', data: { heading, text: '', buttons: [], tone } })
  it('drops an identical heading and keeps only the last dark call-to-action', () => {
    const html = render([cta('Need help?', 'dark'), cta('Need help?', 'dark'), cta('Other', 'light')], ctx('page'))
    expect(count(html, 'Need help?')).toBe(1)
    expect(html).toContain('Other')
  })
})

describe('layout grouping', () => {
  it('turns consecutive short text blocks into one row, and leaves a lone block alone', () => {
    const block = (heading: string) => ({ id: uuid(), type: 'contentBlock', data: { label: '', heading, content: doc('Short.'), image: '', imageAlt: '', imagePosition: 'none', button: null } })
    const parsed = (arr: unknown[]) => sectionsSchema.parse(arr)
    expect(layoutSections(parsed([block('A'), block('B'), block('C')])).map((i) => i.kind)).toEqual(['group'])
    expect(layoutSections(parsed([block('A')])).map((i) => i.kind)).toEqual(['one'])
    expect(layoutSections(parsed([block('A'), hero(), block('B')])).map((i) => i.kind)).toEqual(['one', 'one', 'one'])
  })
})

describe('motion hooks used by the scroll engine all exist in the markup', () => {
  const engine = readFileSync(path.join(root, 'src/components/motion/init-motion.ts'), 'utf8')
  const used = [...new Set([...engine.matchAll(/\[(data-[a-z-]+)(?:[=\]])/g)].map((m) => m[1]))]
  it('finds the hooks in the engine', () => {
    expect(used.sort()).toEqual(['data-clip', 'data-hero', 'data-hero-content', 'data-hero-media', 'data-lines', 'data-parallax', 'data-step-line'])
  })
  it('renders every one of them somewhere in the section components', () => {
    const imageBlock = { id: uuid(), type: 'contentBlock', data: { heading: 'With photo', content: doc('x'), image: '/art/hero-plumbing.svg', imagePosition: 'left' } }
    const html = [render([hero(), imageBlock, steps(4), cards(true)], ctx('service')), render([steps(4), cards(true)], ctx('home'))].join('')
    for (const hook of used) expect(html, hook).toContain(hook)
  })
})

describe('reduced motion and no-JavaScript safety (CSS)', () => {
  /** Text of the at-rule block that contains `needle`, or '' when it sits at top level. */
  const enclosingMedia = (needle: string) => {
    const i = css.indexOf(needle)
    const start = css.lastIndexOf('@media', i)
    if (start === -1) return ''
    let depth = 0
    for (let k = css.indexOf('{', start); k < css.length; k++) {
      if (css[k] === '{') depth++
      if (css[k] === '}' && --depth === 0) return k > i ? css.slice(start, css.indexOf('{', start)) : ''
    }
    return ''
  }
  it('hides headings and reveals only when motion is allowed and the "js" class is present', () => {
    expect(enclosingMedia('html.js [data-lines]:not([data-split])')).toContain('prefers-reduced-motion: no-preference')
    expect(enclosingMedia('html.js [data-reveal]:not([data-revealed])')).toContain('prefers-reduced-motion: no-preference')
    expect(css).not.toMatch(/^\s*\[data-lines\][^{]*\{[^}]*visibility:\s*hidden/m)
  })
  it('runs the entrance animations only when motion is allowed', () => {
    expect(enclosingMedia('.hero-clip-reveal {')).toContain('no-preference')
    expect(enclosingMedia('animation: wordUp')).toContain('no-preference')
  })
  it('the page fade releases when it ends (fill-mode backwards): a lingering transform would trap pinned (position: fixed) sections', () => {
    const rule = css.match(/\.page-enter\s*\{[^}]*\}/)![0]
    expect(rule).toContain('backwards')
    expect(rule).not.toMatch(/\b(both|forwards)\b/)
  })
  it('global reduced-motion rule still shortens any leftover animation', () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation-duration: 0\.01ms/)
  })
})

describe('reveal boot script', () => {
  afterEach(() => vi.useRealTimers())
  const run = (opts: { io: boolean; ready?: boolean }) => {
    vi.useFakeTimers()
    const classes = new Set<string>()
    const win: Record<string, unknown> = { __revealReady: opts.ready ?? false }
    if (opts.io) win.IntersectionObserver = function () {}
    const doc = { documentElement: { classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c) } } }
    vm.runInNewContext(REVEAL_BOOT_SCRIPT, { window: win, document: doc, setTimeout, IntersectionObserver: win.IntersectionObserver ? win.IntersectionObserver : undefined } as never)
    return { classes, win }
  }
  it('marks the page as animated only when IntersectionObserver exists', () => {
    expect(run({ io: true }).classes.has('js')).toBe(true)
    expect(run({ io: false }).classes.has('js')).toBe(false)
  })
  it('gives up after 3 seconds if the motion code never started, so content is never stuck hidden', () => {
    const { classes } = run({ io: true })
    expect(classes.has('js')).toBe(true)
    vi.advanceTimersByTime(3001)
    expect(classes.has('js')).toBe(false)
  })
  it('keeps the class if the motion code did start', () => {
    const { classes, win } = run({ io: true })
    win.__revealReady = true
    vi.advanceTimersByTime(3001)
    expect(classes.has('js')).toBe(true)
  })
})

describe('photography', () => {
  const all = Object.values(PHOTOS)
  it('every photo file exists, is a real JPEG of a sensible size, and is credited with an Unsplash link', () => {
    for (const p of all) {
      const file = path.join(root, 'public', p.src)
      expect(existsSync(file), p.src).toBe(true)
      const bytes = readFileSync(file)
      expect([bytes[0], bytes[1], bytes[2]], p.src).toEqual([0xff, 0xd8, 0xff])
      expect(statSync(file).size, p.src).toBeLessThan(700 * 1024)
      expect(p.credit.url).toMatch(/^https:\/\/unsplash\.com\/photos\/[\w-]+$/)
      expect(p.alt.length).toBeGreaterThan(10)
    }
  })
  it('uses 21 different files (no repeats to fake variety)', () => {
    expect(new Set(all.map((p) => p.src)).size).toBe(all.length)
    expect(all).toHaveLength(21)
  })
  it('maps the old illustration paths and the three missing blog images to real photos', () => {
    for (const legacy of ['/art/home-pro.svg', '/art/hero-plumbing.svg', '/art/water-heater.svg', '/art/denver.svg', '/art/boulder.svg', '/assets/service-plumbing.jpg', '/assets/service-detail-2.jpg', '/assets/hero-hvac-tech.jpg']) {
      const r = resolveImage(legacy)
      expect(r.src, legacy).toMatch(/^\/images\/photos\/.+\.jpg$/)
      expect(existsSync(path.join(root, 'public', r.src))).toBe(true)
    }
  })
  it('leaves anything else untouched, and prefers an alt text the editor wrote', () => {
    expect(resolveImage('https://x.supabase.co/storage/v1/object/public/site-media/a.jpg', 'Mine')).toEqual({ src: 'https://x.supabase.co/storage/v1/object/public/site-media/a.jpg', alt: 'Mine' })
    expect(resolveImage('/art/denver.svg', 'Custom alt').alt).toBe('Custom alt')
    expect(resolveImage('/art/denver.svg').alt).toBe(PHOTOS.denverRockies.alt)
  })
})

describe('placeholder business details never reach the public site', () => {
  it('filters announcement text that contains the placeholder phone number', () => {
    expect(isPublishableMessage('24/7 Emergency Dispatch Available Across Denver Metro: (720) 555-0100')).toBe(false)
    expect(isPublishableMessage('Placeholder text')).toBe(false)
    expect(isPublishableMessage('   ')).toBe(false)
    expect(isPublishableMessage('Plumbing & HVAC help in Denver & Boulder')).toBe(true)
  })
  it('only treats a real number as a phone', () => {
    expect(hasRealPhone('(720) 555-0100')).toBe(false)
    expect(hasRealPhone('(303) 555-0200')).toBe(true)
    expect(hasRealPhone('')).toBe(false)
  })
})

describe('breadcrumbs and structured data', () => {
  it('classifies pages', () => {
    expect(pageKind('')).toBe('home')
    expect(pageKind('denver')).toBe('location')
    expect(pageKind('plumbing/water-heater-repair')).toBe('service')
    expect(pageKind('plumbing')).toBe('page')
    expect(pageKind('about')).toBe('page')
  })
  it('lists ancestors nearest last', () => {
    expect(ancestorPaths('plumbing/water-heater-repair/denver')).toEqual(['plumbing', 'plumbing/water-heater-repair'])
    expect(ancestorPaths('about')).toEqual([])
  })
  it('only links to ancestors that are live, never to a draft', () => {
    const live = new Map([['plumbing', 'Plumbing Services']])
    const crumbs = buildCrumbs('plumbing/water-heater-repair/denver', 'Water Heater Repair in Denver', live)
    expect(crumbs).toEqual([{ label: 'Home', href: '/' }, { label: 'Plumbing Services', href: '/plumbing' }, { label: 'Water Heater Repair in Denver' }])
    expect(buildCrumbs('', 'Home', live)).toEqual([])
  })
  it('builds a BreadcrumbList with absolute URLs, and nothing for a single crumb', () => {
    const crumbs = buildCrumbs('plumbing/water-heater-repair', 'Water Heater Repair', new Map([['plumbing', 'Plumbing Services']]))
    const ld = breadcrumbJsonLd(crumbs, 'https://pipeflowco.com', 'https://pipeflowco.com/plumbing/water-heater-repair')!
    expect(ld['@type']).toBe('BreadcrumbList')
    expect(ld.itemListElement.map((i) => i.item)).toEqual(['https://pipeflowco.com', 'https://pipeflowco.com/plumbing', 'https://pipeflowco.com/plumbing/water-heater-repair'])
    expect(breadcrumbJsonLd([{ label: 'Home', href: '/' }], 'https://pipeflowco.com', 'x')).toBeNull()
  })
  it('Service data states only confirmed facts: no rating, price, address or hours', () => {
    const ld = serviceJsonLd({ name: 'AC Repair', description: 'Find local AC repair.', url: 'https://pipeflowco.com/hvac/ac-repair', providerName: 'PipeFlow Co.', baseUrl: 'https://pipeflowco.com' })
    expect(ld['@type']).toBe('Service')
    expect(ld.areaServed.map((a) => a.name)).toEqual(['Denver', 'Boulder'])
    const text = JSON.stringify(ld).toLowerCase()
    for (const bad of ['rating', 'review', 'price', 'offer', 'address', 'telephone', 'opening', 'license']) expect(text.includes(bad), bad).toBe(false)
  })
})

describe('editor exposes the alt-text fields the schema has', () => {
  const forms = readFileSync(path.join(root, 'src/components/admin/pages/SectionForms.tsx'), 'utf8')
  it('has a description field for the hero image, the content-block image and each card image', () => {
    expect(forms).toContain('Hero image description (for screen readers)')
    expect(forms).toContain('Image description (for screen readers)')
    expect(forms.match(/imageAlt/g)!.length).toBeGreaterThanOrEqual(6)
  })
  it('keeps the motion code out of the admin interface entirely', () => {
    const adminLayout = readFileSync(path.join(root, 'src/app/(admin)/layout.tsx'), 'utf8')
    expect(adminLayout).not.toMatch(/MotionRoot|RevealObserver|gsap/)
    const siteLayout = readFileSync(path.join(root, 'src/app/(site)/layout.tsx'), 'utf8')
    expect(siteLayout).not.toContain('<MotionRoot />') // scroll animations are switched off
    expect(siteLayout).not.toMatch(/import \{[^}]*Sora[^}]*\} from 'next\/font\/google'/) // the admin loads its own fonts
  })
})

describe('image alt-text fields are backward compatible', () => {
  it('older saved sections without imageAlt still validate, with an empty default', () => {
    const parsed = sectionsSchema.parse([{ id: uuid(), type: 'hero', data: { heading: 'H' } }, { id: uuid(), type: 'featureCards', data: { cards: [{ title: 'T' }] } }])
    expect((parsed[0].data as { imageAlt: string }).imageAlt).toBe('')
    expect((parsed[1].data as { cards: { imageAlt: string }[] }).cards[0].imageAlt).toBe('')
  })
  it('limits alt text to 250 characters', () => {
    expect(sectionsSchema.safeParse([{ id: uuid(), type: 'hero', data: { heading: 'H', imageAlt: 'x'.repeat(251) } }]).success).toBe(false)
    expect(sectionsSchema.safeParse([{ id: uuid(), type: 'hero', data: { heading: 'H', imageAlt: 'x'.repeat(250) } }]).success).toBe(true)
  })
})
