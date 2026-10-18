'use client'

import { SERVICES } from '@/lib/requests/schema'
import { SERVICE_ILLUSTRATIONS } from '@/lib/cms-pages/sections/schema'
import { ListEditor, SelectField, TextField } from './fields'

type Data = Record<string, unknown>
type Errors = Record<string, string>
interface Props {
  data: Data
  onChange: (data: Data) => void
  errors: Errors
  template: 'category' | 'detail'
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

interface Link { label: string; href: string }
interface Card { title: string; text: string }
interface Block {
  kind: string; heading: string; intro: string; text: string; items: string[]; cards: Card[]; columns: string[]; rows: string[][]; tone: string
}

const ILLUSTRATIONS = SERVICE_ILLUSTRATIONS.map((v) => ({ value: v, label: v.replace('-', ' ') }))
const SERVICE_OPTIONS = (['plumbing', 'hvac'] as const).flatMap((c) => SERVICES[c].map((s) => ({ value: `${c}:${s.value}`, label: `${c === 'plumbing' ? 'Plumbing' : 'HVAC'}: ${s.label}` })))
const KINDS = [
  { value: 'text', label: 'Paragraphs' },
  { value: 'list', label: 'Tick list' },
  { value: 'steps', label: 'Numbered steps' },
  { value: 'cards', label: 'Info cards' },
  { value: 'table', label: 'Comparison table' },
  { value: 'notice', label: 'Notice or safety box' },
  { value: 'accordion', label: 'Expandable items' },
]
const newBlock = (): Block => ({ kind: 'text', heading: '', intro: '', text: '', items: [], cards: [], columns: [], rows: [], tone: 'info' })

const lines = (v: string[]) => v.join('\n')
const toLines = (v: string) => v.split('\n')

function LinksEditor({ label, links, onChange, errors, prefix }: { label: string; links: Link[]; onChange: (l: Link[]) => void; errors: Errors; prefix: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-neutral-700">{label}</p>
      <ListEditor
        items={links}
        onChange={onChange}
        itemLabel="Link"
        addLabel="Add link"
        newItem={() => ({ label: '', href: '/' })}
        render={(l, update, i) => (
          <>
            <TextField label="Link text" value={l.label} onChange={(v) => update({ label: v })} max={120} error={errors[`${prefix}.${i}.label`]} />
            <TextField label="Links to" value={l.href} onChange={(v) => update({ href: v })} hint="A page like /water-heater-repair, or https://, mailto:, tel:" error={errors[`${prefix}.${i}.href`]} />
          </>
        )}
      />
    </div>
  )
}

function BlocksEditor({ label, blocks, onChange, errors, prefix }: { label: string; blocks: Block[]; onChange: (b: Block[]) => void; errors: Errors; prefix: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-neutral-700">{label}</p>
      <ListEditor
        items={blocks}
        onChange={onChange}
        max={24}
        itemLabel="Block"
        addLabel="Add content block"
        newItem={newBlock}
        render={(b, update, i) => {
          const e = (k: string) => errors[`${prefix}.${i}.${k}`]
          return (
            <>
              <SelectField label="Block type" value={b.kind} onChange={(kind) => update({ kind })} options={KINDS} />
              {b.kind === 'notice' && (
                <SelectField label="Style" value={b.tone} onChange={(tone) => update({ tone })} options={[{ value: 'info', label: 'Information' }, { value: 'safety', label: 'Safety warning' }]} />
              )}
              <TextField label="Heading" value={b.heading} onChange={(heading) => update({ heading })} max={180} error={e('heading')} />
              {b.kind !== 'notice' && <TextField label="Intro (optional)" value={b.intro} onChange={(intro) => update({ intro })} max={1500} multiline rows={2} />}
              {(b.kind === 'text' || b.kind === 'notice') && (
                <TextField label="Text" value={b.text} onChange={(text) => update({ text })} max={4000} multiline rows={4} hint="Leave a blank line between paragraphs. Plain text only." error={e('text')} />
              )}
              {(b.kind === 'list' || b.kind === 'steps' || b.kind === 'notice') && (
                <TextField label="Items (one per line)" value={lines(b.items)} onChange={(v) => update({ items: toLines(v) })} multiline rows={5} hint="Start a line with **Bold lead.** to bold its first words." error={e('items')} />
              )}
              {(b.kind === 'cards' || b.kind === 'accordion') && (
                <ListEditor
                  items={b.cards}
                  onChange={(cards) => update({ cards })}
                  max={12}
                  itemLabel="Item"
                  addLabel="Add item"
                  newItem={() => ({ title: '', text: '' })}
                  render={(c, up, j) => (
                    <>
                      <TextField label="Title" value={c.title} onChange={(title) => up({ title })} max={160} error={errors[`${prefix}.${i}.cards.${j}.title`]} />
                      <TextField label="Text" value={c.text} onChange={(text) => up({ text })} max={1500} multiline rows={3} />
                    </>
                  )}
                />
              )}
              {b.kind === 'table' && (
                <>
                  <TextField label="Column headings (one per line)" value={lines(b.columns)} onChange={(v) => update({ columns: toLines(v) })} multiline rows={3} error={e('columns')} />
                  <TextField
                    label="Rows (one per line, cells separated by |)"
                    value={b.rows.map((r) => r.join(' | ')).join('\n')}
                    onChange={(v) => update({ rows: v.split('\n').map((r) => r.split('|').map((c) => c.trim())) })}
                    multiline
                    rows={6}
                  />
                </>
              )}
              {(b.kind === 'list' || b.kind === 'cards' || b.kind === 'table') && (
                <TextField label="Text below (optional)" value={b.text} onChange={(text) => update({ text })} max={4000} multiline rows={2} />
              )}
            </>
          )
        }}
      />
    </div>
  )
}

/** One structured editor for both service templates: no raw JSON or HTML. */
export function ServicePageForm({ data, onChange, errors, template }: Props) {
  const set = (patch: Data) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-5">
      <fieldset className="space-y-4 rounded-lg border border-neutral-200 p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-neutral-500">Service and request form</legend>
        <SelectField label="Service category" value={str(data.serviceCategory) || 'plumbing'} onChange={(serviceCategory) => set({ serviceCategory })} options={[{ value: 'plumbing', label: 'Plumbing' }, { value: 'hvac', label: 'HVAC' }]} />
        <SelectField label="Service preselected in the request form" value={str(data.formService)} onChange={(formService) => set({ formService })} options={SERVICE_OPTIONS} />
        <TextField label="Name shown for that service in the form (optional)" value={str(data.formServiceLabel)} onChange={(formServiceLabel) => set({ formServiceLabel })} max={80} hint="Use when the catalog has no exact match, for example Heating Installation. The request still uses the catalog service chosen above." />
        {errors.formService && <p role="alert" className="text-xs font-medium text-red-700">{errors.formService}</p>}
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-neutral-200 p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-neutral-500">Hero</legend>
        <LinksEditor label="Breadcrumbs (last one is the current page)" links={list<Link>(data.breadcrumbs)} onChange={(breadcrumbs) => set({ breadcrumbs })} errors={errors} prefix="breadcrumbs" />
        <TextField label="Heading (H1)" value={str(data.heading)} onChange={(heading) => set({ heading })} max={180} error={errors.heading} />
        <TextField label="Introduction" value={str(data.intro)} onChange={(intro) => set({ intro })} max={3000} multiline rows={5} hint="Leave a blank line between paragraphs." />
        <TextField label="Button text" value={str(data.ctaLabel)} onChange={(ctaLabel) => set({ ctaLabel })} max={80} hint="The button scrolls to the request form on the same page." />
        <SelectField label="Illustration" value={str(data.illustration) || 'pipes'} onChange={(illustration) => set({ illustration })} options={ILLUSTRATIONS} />
        <TextField label="Illustration description (for screen readers)" value={str(data.illustrationAlt)} onChange={(illustrationAlt) => set({ illustrationAlt })} max={250} hint="Leave empty if the picture is only decoration." />
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-neutral-200 p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-neutral-500">{template === 'category' ? 'Service directory' : 'Main service information'}</legend>
        <TextField label="Section heading" value={str(data.mainHeading)} onChange={(mainHeading) => set({ mainHeading })} max={180} />
        {template === 'category' && (
          <ListEditor
            items={list<{ title: string; text: string; href: string; illustration: string; illustrationAlt: string }>(data.cards)}
            onChange={(cards) => set({ cards })}
            max={6}
            itemLabel="Service card"
            addLabel="Add service card"
            newItem={() => ({ title: '', text: '', href: '/', illustration: 'pipes', illustrationAlt: '' })}
            render={(c, update, i) => (
              <>
                <TextField label="Title" value={c.title} onChange={(title) => update({ title })} max={160} error={errors[`cards.${i}.title`]} />
                <TextField label="Description" value={c.text} onChange={(text) => update({ text })} max={800} multiline rows={3} />
                <TextField label="Learn More links to" value={c.href} onChange={(href) => update({ href })} error={errors[`cards.${i}.href`]} />
                <SelectField label="Illustration" value={c.illustration} onChange={(illustration) => update({ illustration })} options={ILLUSTRATIONS} />
                <TextField label="Illustration description (optional)" value={c.illustrationAlt} onChange={(illustrationAlt) => update({ illustrationAlt })} max={250} />
              </>
            )}
          />
        )}
        <BlocksEditor label="Content blocks" blocks={list<Block>(data.mainBlocks)} onChange={(mainBlocks) => set({ mainBlocks })} errors={errors} prefix="mainBlocks" />
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-neutral-200 p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-neutral-500">Guidance, FAQs and request form</legend>
        <TextField label="Section heading" value={str(data.guidanceHeading)} onChange={(guidanceHeading) => set({ guidanceHeading })} max={180} />
        <BlocksEditor label="Content blocks (safety notice, steps, residential and commercial, ...)" blocks={list<Block>(data.guidanceBlocks)} onChange={(guidanceBlocks) => set({ guidanceBlocks })} errors={errors} prefix="guidanceBlocks" />
        <TextField label="FAQ heading" value={str(data.faqHeading)} onChange={(faqHeading) => set({ faqHeading })} max={180} />
        <ListEditor
          items={list<{ question: string; answer: string }>(data.faqs)}
          onChange={(faqs) => set({ faqs })}
          max={20}
          itemLabel="Question"
          addLabel="Add question"
          newItem={() => ({ question: '', answer: '' })}
          render={(f, update, i) => (
            <>
              <TextField label="Question" value={f.question} onChange={(question) => update({ question })} max={300} error={errors[`faqs.${i}.question`]} />
              <TextField label="Answer" value={f.answer} onChange={(answer) => update({ answer })} max={3000} multiline rows={3} error={errors[`faqs.${i}.answer`]} />
            </>
          )}
        />
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border border-neutral-200 p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-neutral-500">Final call to action</legend>
        <TextField label="Heading" value={str(data.finalHeading)} onChange={(finalHeading) => set({ finalHeading })} max={180} error={errors.finalHeading} />
        <TextField label="Text" value={str(data.finalText)} onChange={(finalText) => set({ finalText })} max={1000} multiline rows={2} />
        <TextField label="Button text" value={str(data.finalCtaLabel)} onChange={(finalCtaLabel) => set({ finalCtaLabel })} max={80} />
        <TextField label="Related links heading" value={str(data.relatedHeading)} onChange={(relatedHeading) => set({ relatedHeading })} max={180} />
        <LinksEditor label="Related service and area links" links={list<Link>(data.related)} onChange={(related) => set({ related })} errors={errors} prefix="related" />
        <TextField label="Availability disclosure" value={str(data.disclosure)} onChange={(disclosure) => set({ disclosure })} max={600} multiline rows={3} />
      </fieldset>
    </div>
  )
}
