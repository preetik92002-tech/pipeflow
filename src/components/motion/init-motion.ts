import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * Scroll-linked motion for the public site. Markup sirf data-attributes se opt-in karta hai:
 *   [data-hero] > [data-hero-media] + [data-hero-content]   hero scroll-away
 *   [data-parallax="6"]                                     photo apne frame mein scrub hoti hai
 *   [data-clip]                                             frame ek chhote mask se poora khulta hai
 *   [data-lines]                                            heading line-by-line (SplitText)
 *   [data-marquee="left|right"]                             photo strip scroll ke saath sarakti hai
 *   [data-story] (pinned process)                           desktop par pin, step-by-step
 *   [data-step-line]                                        steps ki hairline scroll se bharti hai
 *
 * Rules: sab kuch scrub hai, isliye upar scroll karne par animation ulti chalti hai (atakti nahi).
 * gsap.matchMedia sirf tab chalata hai jab user ne kam motion nahi maanga; reduced-motion par kuch
 * bhi create nahi hota aur content jaisa HTML mein hai waisa dikhta hai. Return function sab revert karta hai.
 */
export function initMotion(): () => void {
  // ROOT CAUSE FIX (navigation bug): ScrollTrigger refresh pichhli scroll position yaad rakhta hai aur layout naapne ke baad usi par
  // wapas scroll kar deta hai. Route badalne par wahi purani position Next ke scroll-to-top ko ulat deti thi. Naye page par
  // shuru karne se pehle (aur cleanup ke baad) yaad ki hui positions saaf karte hain. Browser ka apna Back/Forward restore alag hai, usse chhedte nahi.
  ScrollTrigger.clearScrollMemory()
  const mm = gsap.matchMedia()

  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 1024px)',
      // Pin tabhi jab pinned content (header ke neeche) screen mein poora aaye; chhoti height par normal list.
      pinnable: '(min-width: 1024px) and (min-height: 780px)',
    },
    (context) => {
      const { motion, desktop, pinnable } = context.conditions as { motion: boolean; desktop: boolean; pinnable: boolean }
      if (!motion) return
      const all = <T extends HTMLElement>(selector: string) => Array.from(document.querySelectorAll<T>(selector))
      // Mobile par chhota movement: kam GPU kaam, aur chhoti screen par jhatka kam lagta hai.
      const strength = desktop ? 1 : 0.55

      // ---- hero: photo aur content scroll karte waqt alag raftaar se hilte hain
      for (const hero of all('[data-hero]')) {
        const media = hero.querySelector<HTMLElement>('[data-hero-media]')
        const content = hero.querySelector<HTMLElement>('[data-hero-content]')
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
        })
        // scale 1.24 aur 11% shift: image ke kinare kabhi khali nahi dikhte.
        if (media) tl.fromTo(media, { yPercent: 0, scale: 1.1 }, { yPercent: 11 * strength, scale: 1.24 }, 0)
        if (content) {
          // Content pehle poora dikhta hai (CTAs kaam karte rehte hain), aakhri hisse mein hi dhundhla hota hai.
          tl.to(content, { y: -70 * strength }, 0)
          tl.to(content, { opacity: 0, duration: 0.35, ease: 'power1.in' }, 0.62)
        }
      }

      // ---- photo parallax (frame ke andar)
      for (const el of all('[data-parallax]')) {
        const amount = (parseFloat(el.dataset.parallax || '6') || 6) * strength
        gsap.fromTo(
          el,
          { yPercent: -amount, scale: 1 + (amount * 2) / 100 + 0.03 },
          {
            yPercent: amount,
            scale: 1 + (amount * 2) / 100 + 0.03,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        )
      }

      // ---- frames screen mein aate hi ek mask se poore khulte hain (scrub: upar scroll par wapas band)
      for (const el of all('[data-clip]')) {
        gsap.fromTo(
          el,
          { clipPath: 'inset(12% 9% 12% 9%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 96%', end: 'top 38%', scrub: true },
          }
        )
      }

      // ---- headings: line-by-line masked reveal. SplitText aria-label lagata hai, to reading order safe.
      for (const el of all('[data-lines]')) {
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          aria: 'auto',
          onSplit(self) {
            el.setAttribute('data-split', '')
            return gsap.from(self.lines, {
              yPercent: 112,
              duration: 1.1,
              ease: 'power4.out',
              stagger: 0.09,
              scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
            })
          },
        })
      }

      // ---- photo marquee: scroll position se chalti hai, apne aap nahi
      for (const track of all('[data-marquee]')) {
        const toRight = track.dataset.marquee === 'right'
        gsap.fromTo(
          track,
          { xPercent: toRight ? -32 : 0 },
          {
            xPercent: toRight ? 0 : -32,
            ease: 'none',
            scrollTrigger: { trigger: track.parentElement ?? track, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          }
        )
      }

      // ---- steps ki hairline scroll ke saath bharti hai
      for (const line of all('[data-step-line]')) {
        gsap.fromTo(
          line,
          { scaleX: 0.16 },
          { scaleX: 1, ease: 'none', scrollTrigger: { trigger: line.parentElement ?? line, start: 'top 88%', end: 'top 46%', scrub: true } }
        )
      }

      // ---- pinned process story: sirf bade, ooche desktop par. Mobile aur chhoti height par steps normal list rehte hain.
      if (pinnable) {
        for (const section of all('[data-story]')) {
          const pin = section.querySelector<HTMLElement>('[data-story-pin]')
          const steps = Array.from(section.querySelectorAll<HTMLElement>('[data-story-step]'))
          const photos = Array.from(section.querySelectorAll<HTMLElement>('[data-story-photo]'))
          const bar = section.querySelector<HTMLElement>('[data-story-progress]')
          const count = section.querySelector<HTMLElement>('[data-story-count]')
          const n = steps.length
          if (!pin || n < 2) continue

          const DIM = 0.38
          gsap.set(steps, { opacity: DIM })
          gsap.set(steps[0], { opacity: 1 })
          gsap.set(photos, { clipPath: (i: number) => (i === 0 ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)') })
          if (bar) gsap.set(bar, { scaleX: 0 })

          let active = 0
          const setActive = (i: number) => {
            if (i === active) return
            active = i
            steps.forEach((s, k) => (k === i ? s.setAttribute('aria-current', 'step') : s.removeAttribute('aria-current')))
            if (count) count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`
          }
          steps[0].setAttribute('aria-current', 'step')

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              // Har step ~65% viewport; kul pin chhota rehta hai aur phir page apne aap chhod deta hai.
              end: () => `+=${Math.round(window.innerHeight * n * 0.65)}`,
              pin,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => setActive(Math.min(n - 1, Math.floor(self.progress * n * 0.999))),
            },
          })
          for (let i = 1; i < n; i++) {
            const at = i - 0.35
            tl.to(steps[i - 1], { opacity: DIM, duration: 0.35 }, at)
            tl.to(steps[i], { opacity: 1, duration: 0.35 }, at)
            if (photos[i]) tl.to(photos[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power2.inOut' }, at - 0.1)
          }
          if (bar) tl.to(bar, { scaleX: 1, duration: n - 1 }, 0)
          tl.to({}, { duration: 1 }, n - 1) // aakhri step ko ruk kar padhne ka waqt
        }
      }
    }
  )

  // ScrollTrigger window load aur resize par khud refresh karta hai. Fonts ke baad ek hi (debounced) refresh kaafi hai:
  // pehle load aur fonts par alag-alag refresh hote the, har ek poore page ko dobara naapta tha (forced layout).
  let refreshTimer: ReturnType<typeof setTimeout> | undefined
  void document.fonts?.ready.then(() => {
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150)
  })

  return () => {
    if (refreshTimer) clearTimeout(refreshTimer)
    mm.revert()
    ScrollTrigger.clearScrollMemory() // saare tweens, ScrollTriggers, pins aur SplitText yahin saaf
  }
}
