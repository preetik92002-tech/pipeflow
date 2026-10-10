'use client'

import type { SectionType } from '@/lib/cms-pages/sections/schema'
import { ImageField, ListEditor, SelectField, TextField } from './fields'
import { RichTextEditor } from './RichTextEditor'

type Data = Record<string, unknown>
type Errors = Record<string, string>

interface FormProps {
  data: Data
  onChange: (data: Data) => void
  /** Validation messages from the server, keyed by path inside this section, e.g. "buttons.0.href". */
  errors: Errors
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

interface Btn { label: string; href: string; variant: 'primary' | 'secondary' }

function ButtonsField({ buttons, onChange, max = 2, errors, prefix = 'buttons' }: { buttons: Btn[]; onChange: (b: Btn[]) => void; max?: number; errors: Errors; prefix?: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-neutral-700">Buttons</p>
      <ListEditor
        items={buttons}
        onChange={onChange}
        max={max}
        itemLabel="Button"
        addLabel="Add button"
        newItem={() => ({ label: '', href: '/', variant: 'primary' as const })}
        render={(b, update, i) => (
          <>
            <TextField label="Button text" value={b.label} onChange={(label) => update({ label })} max={80} error={errors[`${prefix}.${i}.label`]} />
            <TextField label="Links to" value={b.href} onChange={(href) => update({ href })} hint="A page like /plumbing/water-heater-repair, or https://, mailto:, tel:" error={errors[`${prefix}.${i}.href`]} />
            <SelectField label="Style" value={b.variant} onChange={(variant) => update({ variant })} options={[{ value: 'primary', label: 'Main (red)' }, { value: 'secondary', label: 'Outline' }]} />
          </>
        )}
      />
    </div>
  )
}

function HeroForm({ data, onChange, errors }: FormProps) {
  const set = (patch: Data) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <TextField label="Small label above heading (optional)" value={str(data.eyebrow)} onChange={(eyebrow) => set({ eyebrow })} max={120} />
      <TextField label="Heading" value={str(data.heading)} onChange={(heading) => set({ heading })} max={180} error={errors.heading} />
      <TextField label="Subtitle" value={str(data.subtitle)} onChange={(subtitle) => set({ subtitle })} max={500} multiline rows={2} />
      <TextField label="Intro text (optional)" value={str(data.intro)} onChange={(intro) => set({ intro })} max={2000} multiline rows={4} hint="Leave a blank line between paragraphs." />
      <ImageField label="Background image (optional)" value={str(data.image)} onChange={(image) => set({ image })} />
      <SelectField label="Alignment" value={str(data.align) || 'left'} onChange={(align) => set({ align })} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centered' }]} />
      <ButtonsField buttons={list<Btn>(data.buttons)} onChange={(buttons) => set({ buttons })} errors={errors} />
    </div>
  )
}

function RichTextForm({ data, onChange }: FormProps) {
  return <RichTextEditor label="Text" value={data.content} onChange={(content) => onChange({ ...data, content })} />
}

function ContentBlockForm({ data, onChange, errors }: FormProps) {
  const set = (patch: Data) => onChange({ ...data, ...patch })
  const button = data.button as Btn | null
  return (
    <div className="space-y-4">
      <TextField label="Small label (optional)" value={str(data.label)} onChange={(label) => set({ label })} max={60} hint='For example "1." or "Residential".' />
      <TextField label="Heading" value={str(data.heading)} onChange={(heading) => set({ heading })} max={180} error={errors.heading} />
      <RichTextEditor label="Text" value={data.content} onChange={(content) => set({ content })} />
      <SelectField label="Image position" value={str(data.imagePosition) || 'none'} onChange={(imagePosition) => set({ imagePosition })} options={[{ value: 'none', label: 'No image' }, { value: 'left', label: 'Image on the left' }, { value: 'right', label: 'Image on the right' }]} />
      {str(data.imagePosition) !== 'none' && str(data.imagePosition) !== '' && (
        <>
          <ImageField label="Image" value={str(data.image)} onChange={(image) => set({ image })} />
          <TextField label="Image description (for screen readers)" value={str(data.imageAlt)} onChange={(imageAlt) => set({ imageAlt })} max={250} />
        </>
      )}
      <ButtonsField buttons={button ? [button] : []} max={1} errors={errors} prefix="button" onChange={(b) => set({ button: b[0] ?? null })} />
    </div>
  )
}

function GalleryForm({ data, onChange, errors }: FormProps) {
  const set = (patch: Data) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <TextField label="Heading (optional)" value={str(data.heading)} onChange={(heading) => set({ heading })} max={180} />
      <SelectField label="Columns" value={Number(data.columns) || 3} onChange={(columns) => set({ columns })} options={[{ value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }]} />
      <ListEditor
        items={list<{ src: string; alt: string; caption: string }>(data.images)}
        onChange={(images) => set({ images })}
        max={24}
        itemLabel="Image"
        addLabel="Add image"
        newItem={() => ({ src: '', alt: '', caption: '' })}
        render={(img, update, i) => (
          <>
            <ImageField label="Image" value={img.src} onChange={(src) => update({ src })} />
            {errors[`images.${i}.src`] && <p role="alert" className="text-xs font-medium text-red-700">{errors[`images.${i}.src`]}</p>}
            <TextField label="Description (for screen readers)" value={img.alt} onChange={(alt) => update({ alt })} max={250} />
            <TextField label="Caption (optional)" value={img.caption} onChange={(caption) => update({ caption })} max={250} />
          </>
        )}
      />
    </div>
  )
}

function FeatureCardsForm({ data, onChange, errors }: FormProps) {
  const set = (patch: Data) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={str(data.heading)} onChange={(heading) => set({ heading })} max={180} />
      <TextField label="Intro (optional)" value={str(data.intro)} onChange={(intro) => set({ intro })} max={1000} multiline rows={2} />
      <ListEditor
        items={list<{ title: string; text: string; href: string; image: string }>(data.cards)}
        onChange={(cards) => set({ cards })}
        max={12}
        itemLabel="Card"
        addLabel="Add card"
        newItem={() => ({ title: '', text: '', href: '', image: '' })}
        render={(c, update, i) => (
          <>
            <TextField label="Title" value={c.title} onChange={(title) => update({ title })} max={120} error={errors[`cards.${i}.title`]} />
            <TextField label="Text" value={c.text} onChange={(text) => update({ text })} max={600} multiline rows={2} />
            <TextField label="Links to (optional)" value={c.href} onChange={(href) => update({ href })} error={errors[`cards.${i}.href`]} />
            <ImageField label="Image (optional)" value={c.image} onChange={(image) => update({ image })} />
          </>
        )}
      />
    </div>
  )
}

function ComparisonForm({ data, onChange, errors }: FormProps) {
  const set = (patch: Data) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={str(data.heading)} onChange={(heading) => set({ heading })} max={180} error={errors.heading} />
      <ListEditor
        items={list<{ title: string; items: string[] }>(data.columns)}
        onChange={(columns) => set({ columns })}
        max={3}
        itemLabel="Column"
        addLabel="Add column"
        newItem={() => ({ title: '', items: [] })}
        render={(col, update, i) => (
          <>
            <TextField label="Column title" value={col.title} onChange={(title) => update({ title })} max={120} error={errors[`columns.${i}.title`]} />
            <TextField label="Points" value={col.items.join('\n')} onChange={(v) => update({ items: v.split('\n') })} multiline rows={5} hint="One point per line." />
          </>
        )}
      />
      {errors.columns && <p role="alert" className="text-xs font-medium text-red-700">{errors.columns}</p>}
    </div>
  )
}

function StepsForm({ data, onChange, errors }: FormProps) {
  const set = (patch: Data) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={str(data.heading)} onChange={(heading) => set({ heading })} max={180} error={errors.heading} />
      <ListEditor
        items={list<{ title: string; text: string }>(data.steps)}
        onChange={(steps) => set({ steps })}
        max={12}
        itemLabel="Step"
        addLabel="Add step"
        newItem={() => ({ title: '', text: '' })}
        render={(s, update, i) => (
          <>
            <TextField label="Step title" value={s.title} onChange={(title) => update({ title })} max={120} error={errors[`steps.${i}.title`]} />
            <TextField label="Description" value={s.text} onChange={(text) => update({ text })} max={600} multiline rows={2} />
          </>
        )}
      />
    </div>
  )
}

function FaqForm({ data, onChange, errors }: FormProps) {
  const set = (patch: Data) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={str(data.heading)} onChange={(heading) => set({ heading })} max={180} error={errors.heading} />
      <ListEditor
        items={list<{ question: string; answer: string }>(data.items)}
        onChange={(items) => set({ items })}
        max={30}
        itemLabel="Question"
        addLabel="Add question"
        newItem={() => ({ question: '', answer: '' })}
        render={(q, update, i) => (
          <>
            <TextField label="Question" value={q.question} onChange={(question) => update({ question })} max={300} error={errors[`items.${i}.question`]} />
            <TextField label="Answer" value={q.answer} onChange={(answer) => update({ answer })} max={3000} multiline rows={3} error={errors[`items.${i}.answer`]} />
          </>
        )}
      />
    </div>
  )
}

function CtaForm({ data, onChange, errors }: FormProps) {
  const set = (patch: Data) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={str(data.heading)} onChange={(heading) => set({ heading })} max={180} error={errors.heading} />
      <TextField label="Text (optional)" value={str(data.text)} onChange={(text) => set({ text })} max={1000} multiline rows={3} />
      <SelectField label="Colour" value={str(data.tone) || 'dark'} onChange={(tone) => set({ tone })} options={[{ value: 'dark', label: 'Dark blue' }, { value: 'light', label: 'Light' }]} />
      <ButtonsField buttons={list<Btn>(data.buttons)} onChange={(buttons) => set({ buttons })} errors={errors} />
    </div>
  )
}

function TestimonialsForm({ data, onChange, errors }: FormProps) {
  const set = (patch: Data) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Only add real reviews from real customers, with their permission.</p>
      <TextField label="Heading" value={str(data.heading)} onChange={(heading) => set({ heading })} max={180} error={errors.heading} />
      <ListEditor
        items={list<{ quote: string; name: string; location: string; rating: number | null }>(data.items)}
        onChange={(items) => set({ items })}
        max={12}
        itemLabel="Review"
        addLabel="Add review"
        newItem={() => ({ quote: '', name: '', location: '', rating: null })}
        render={(t, update, i) => (
          <>
            <TextField label="Review" value={t.quote} onChange={(quote) => update({ quote })} max={1000} multiline rows={3} error={errors[`items.${i}.quote`]} />
            <TextField label="Customer name" value={t.name} onChange={(name) => update({ name })} max={120} error={errors[`items.${i}.name`]} />
            <TextField label="Location (optional)" value={t.location} onChange={(location) => update({ location })} max={120} />
            <SelectField label="Stars" value={t.rating ?? 0} onChange={(v) => update({ rating: v === 0 ? null : v })} options={[{ value: 0, label: 'No rating' }, ...[1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n}` }))]} />
          </>
        )}
      />
    </div>
  )
}

function LinkListForm({ data, onChange, errors }: FormProps) {
  const set = (patch: Data) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={str(data.heading)} onChange={(heading) => set({ heading })} max={180} error={errors.heading} />
      <ListEditor
        items={list<{ label: string; href: string }>(data.links)}
        onChange={(links) => set({ links })}
        max={20}
        itemLabel="Link"
        addLabel="Add link"
        newItem={() => ({ label: '', href: '/' })}
        render={(l, update, i) => (
          <>
            <TextField label="Link text" value={l.label} onChange={(label) => update({ label })} max={120} error={errors[`links.${i}.label`]} />
            <TextField label="Links to" value={l.href} onChange={(href) => update({ href })} error={errors[`links.${i}.href`]} />
          </>
        )}
      />
    </div>
  )
}

function ContactInfoForm({ data, onChange, errors }: FormProps) {
  const set = (patch: Data) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <TextField label="Heading" value={str(data.heading)} onChange={(heading) => set({ heading })} max={180} error={errors.heading} />
      <TextField label="Phone" value={str(data.phone)} onChange={(phone) => set({ phone })} max={40} />
      <TextField label="Email" value={str(data.email)} onChange={(email) => set({ email })} max={200} />
      <TextField label="Address" value={str(data.address)} onChange={(address) => set({ address })} max={300} />
      <TextField label="Hours" value={str(data.hours)} onChange={(hours) => set({ hours })} max={300} />
    </div>
  )
}

function SpacerForm({ data, onChange }: FormProps) {
  return (
    <SelectField label="Height" value={str(data.size) || 'md'} onChange={(size) => onChange({ ...data, size })} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
  )
}

const FORMS: Record<SectionType, (p: FormProps) => React.ReactElement> = {
  hero: HeroForm, richText: RichTextForm, contentBlock: ContentBlockForm, gallery: GalleryForm,
  featureCards: FeatureCardsForm, comparison: ComparisonForm, steps: StepsForm, faq: FaqForm, cta: CtaForm,
  testimonials: TestimonialsForm, linkList: LinkListForm, contactInfo: ContactInfoForm, spacer: SpacerForm,
}

export function SectionForm({ type, ...props }: FormProps & { type: SectionType }) {
  const Form = FORMS[type]
  return Form ? <Form {...props} /> : <p className="text-sm text-red-700">Unknown section type “{type}”.</p>
}

/** One line shown on the collapsed section card. */
export function sectionSummary(type: SectionType, data: Data): string {
  const heading = str(data.heading)
  if (heading) return heading
  if (type === 'richText') return 'Formatted text'
  if (type === 'spacer') return `${str(data.size) || 'md'} space`
  return ''
}
