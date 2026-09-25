'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import Link from 'next/link'
import type { HomepageContent } from '@/lib/cms/types'
import { MediaSelect } from '@/components/admin/MediaSelect'

interface OptionRecord { id: string; slug: string; name?: string; title?: string; reviewer_name?: string; question?: string; active?: boolean }
const card = 'rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 space-y-4'

export function HomepageEditor() {
  const [content, setContent] = useState<HomepageContent | null>(null)
  const [services, setServices] = useState<OptionRecord[]>([])
  const [areas, setAreas] = useState<OptionRecord[]>([])
  const [testimonials, setTestimonials] = useState<OptionRecord[]>([])
  const [faqs, setFaqs] = useState<OptionRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [statsJson, setStatsJson] = useState('[]')
  const [trustJson, setTrustJson] = useState('[]')
  const [stepsJson, setStepsJson] = useState('[]')

  useEffect(() => {
    let active = true
    void Promise.all([
      fetch('/api/admin/cms/homepage').then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d.item as HomepageContent }),
      fetch('/api/admin/cms/service').then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return (d.items || []) as OptionRecord[] }),
      fetch('/api/admin/cms/service_area').then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return (d.items || []) as OptionRecord[] }),
      fetch('/api/admin/cms/testimonial').then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return (d.items || []) as OptionRecord[] }),
      fetch('/api/admin/cms/faq').then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return (d.items || []) as OptionRecord[] }),
    ]).then(([home, svc, area, review, faq]) => {
      if (!active) return
      setContent(home); setServices(svc); setAreas(area); setTestimonials(review); setFaqs(faq)
      setStatsJson(JSON.stringify(home.stats, null, 2)); setTrustJson(JSON.stringify(home.trust, null, 2)); setStepsJson(JSON.stringify(home.process.steps, null, 2))
    }).catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : 'Unable to load homepage content.') })
    return () => { active = false }
  }, [])

  if (!content) return <div className="space-y-4"><h1 className="text-2xl font-bold text-navy-900">Homepage Content</h1>{error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : <p className="text-sm text-neutral-500">Loading content from Supabase…</p>}</div>

  function updateSection<K extends keyof HomepageContent>(section: K, update: Partial<HomepageContent[K]>) {
    setContent((current) => current ? { ...current, [section]: Object.assign({}, current[section], update) } as HomepageContent : current)
  }
  function updateText(section: keyof HomepageContent, field: string, value: string) {
    updateSection(section, { [field]: value } as never)
  }
  function checkboxList(title: string, options: OptionRecord[], selected: string[], toggle: (id: string) => void, label: (option: OptionRecord) => string) {
    const available = options.filter((option) => option.active !== false)
    return <fieldset className="space-y-2"><legend className="text-sm font-semibold text-navy-900">{title}</legend>{available.length ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{available.map((option) => <label key={option.id} className="flex items-center gap-2 rounded-lg bg-neutral-50 p-2.5 text-sm"><input type="checkbox" checked={selected.includes(option.id)} onChange={() => toggle(option.id)} />{label(option)}</label>)}</div> : <p className="text-xs text-neutral-500">No active records available. Create or enable records first.</p>}</fieldset>
  }
  function toggleList(items: string[], id: string) { return items.includes(id) ? items.filter((item) => item !== id) : [...items, id] }

  async function save() {
    if (!content) return
    setSaving(true); setError(null); setMessage(null)
    try {
      const stats = JSON.parse(statsJson) as HomepageContent['stats']
      const trust = JSON.parse(trustJson) as HomepageContent['trust']
      const steps = JSON.parse(stepsJson) as HomepageContent['process']['steps']
      if (!Array.isArray(stats) || !Array.isArray(trust) || !Array.isArray(steps)) throw new Error('Statistics, trust, and process steps must be valid JSON arrays.')
      const payload = { ...content, stats, trust, process: { ...content.process, steps } }
      const response = await fetch('/api/admin/cms/homepage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save homepage content.')
      setMessage('Homepage content saved. Public content is revalidated.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save homepage content.') }
    finally { setSaving(false) }
  }

  const input = (section: keyof HomepageContent, field: string, label: string, multiline = false) => <label className="block text-sm font-medium text-neutral-700">{label}{multiline ? <textarea rows={3} value={String((content[section] as unknown as Record<string, unknown>)[field] ?? '')} onChange={(e) => updateText(section, field, e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 p-2.5" /> : <input value={String((content[section] as unknown as Record<string, unknown>)[field] ?? '')} onChange={(e) => updateText(section, field, e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 p-2.5" />}</label>
  const active = (section: keyof HomepageContent, enabled: boolean) => <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enabled} onChange={(e) => updateSection(section, { active: e.target.checked } as never)} />Show this section</label>

  return <div className="space-y-5 pb-12">
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-navy-900">Homepage Content</h1><p className="mt-1 text-xs text-neutral-500">Edit page copy and select content records. Layout and styling stay fixed.</p></div><button onClick={() => void save()} disabled={saving} className="btn-primary !py-2.5 !px-5 inline-flex items-center gap-2"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save changes'}</button></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    <section className={card}><h2 className="text-lg font-bold">Hero</h2>{active('hero', content.hero.active)}{input('hero','eyebrow','Eyebrow')}{input('hero','headline','Headline')}{input('hero','description','Description',true)}<div className="grid sm:grid-cols-2 gap-3">{input('hero','primaryCtaText','Primary CTA text')}{input('hero','primaryCtaUrl','Primary CTA URL')}{input('hero','secondaryCtaText','Secondary CTA text')}{input('hero','secondaryCtaUrl','Secondary CTA URL')}</div><label className="block text-sm font-medium">Hero image<MediaSelect value={content.hero.image} onChange={(image)=>updateSection('hero',{image})} title="Select homepage hero image" /></label></section>
    <section className={card}><h2 className="text-lg font-bold">Featured Services</h2>{active('services', content.services.active)}{input('services','heading','Section heading')}{input('services','description','Section description',true)}{checkboxList('Displayed services',services,content.services.ids,(id)=>updateSection('services',{ids:toggleList(content.services.ids,id)}),(o)=>o.title || o.slug)}</section>
    <section className={card}><h2 className="text-lg font-bold">Statistics</h2><p className="text-xs text-neutral-500">Edit JSON objects with number, label, active, and order fields.</p><textarea rows={6} value={statsJson} onChange={(e)=>setStatsJson(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-3 font-mono text-xs" /></section>
    <section className={card}><h2 className="text-lg font-bold">Trust principles</h2><p className="text-xs text-neutral-500">Each object supports title, description, iconName, active, and order.</p><textarea rows={8} value={trustJson} onChange={(e)=>setTrustJson(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-3 font-mono text-xs" /></section>
    <section className={card}><h2 className="text-lg font-bold">How It Works</h2>{active('process',content.process.active)}{input('process','heading','Heading')}{input('process','description','Description',true)}<p className="text-xs text-neutral-500">Each step supports title, description, and order.</p><textarea aria-label="Process steps JSON" rows={8} value={stepsJson} onChange={(e)=>setStepsJson(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-3 font-mono text-xs" /></section>
    <section className={card}><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Testimonials</h2><Link href="/admin/testimonials" className="text-xs font-semibold text-brand-blue hover:underline">Manage reviews</Link></div>{checkboxList('Show customer reviews',testimonials,content.testimonialIds,(id)=>setContent({...content,testimonialIds:toggleList(content.testimonialIds,id)}),(o)=>o.reviewer_name || o.id)}</section>
    <section className={card}><h2 className="text-lg font-bold">Service Areas</h2>{active('serviceAreas',content.serviceAreas.active)}{input('serviceAreas','heading','Heading')}{input('serviceAreas','description','Description',true)}{checkboxList('Displayed areas',areas,areas.filter((a)=>content.serviceAreas.slugs.includes(a.slug)).map((a)=>a.slug),(slug)=>updateSection('serviceAreas',{slugs:toggleList(content.serviceAreas.slugs,slug)}),(o)=>o.name || o.slug)}</section>
    <section className={card}><div className="flex items-center justify-between"><h2 className="text-lg font-bold">FAQs</h2><Link href="/admin/faqs" className="text-xs font-semibold text-brand-blue hover:underline">Manage questions</Link></div><label className="block text-sm font-medium text-neutral-700">Heading<input value={content.faqHeading} onChange={(e)=>setContent({...content,faqHeading:e.target.value})} className="mt-1 w-full rounded-lg border border-neutral-300 p-2.5" /></label><label className="block text-sm font-medium text-neutral-700">Description<input value={content.faqDescription} onChange={(e)=>setContent({...content,faqDescription:e.target.value})} className="mt-1 w-full rounded-lg border border-neutral-300 p-2.5" /></label>{checkboxList('Displayed questions',faqs,content.faqIds,(id)=>setContent({...content,faqIds:toggleList(content.faqIds,id)}),(o)=>o.question || o.id)}</section>
    <section className={card}><h2 className="text-lg font-bold">Promotion</h2>{active('promotion',content.promotion.active)}{input('promotion','heading','Heading')}{input('promotion','description','Description',true)}<div className="grid sm:grid-cols-2 gap-3">{input('promotion','ctaText','CTA text')}{input('promotion','ctaUrl','CTA URL')}</div></section>
    <section className={card}><h2 className="text-lg font-bold">Final CTA</h2>{input('finalCta','heading','Heading')}{input('finalCta','description','Description',true)}<div className="grid sm:grid-cols-2 gap-3">{input('finalCta','ctaText','CTA text')}{input('finalCta','ctaUrl','CTA URL')}</div></section>
  </div>
}
