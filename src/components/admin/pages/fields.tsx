'use client'

import { useId, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { MediaSelect } from '@/components/admin/MediaSelect'

export const inputCls =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30'

export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold text-neutral-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

export function TextField({
  label, value, onChange, max, placeholder, multiline = false, rows = 3, hint, error,
}: {
  label: string; value: string; onChange: (v: string) => void; max?: number; placeholder?: string
  multiline?: boolean; rows?: number; hint?: string; error?: string
}) {
  const id = useId()
  const props = {
    id, value, maxLength: max, placeholder, 'aria-invalid': error ? true : undefined,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    className: `${inputCls} ${error ? 'border-red-400' : ''}`,
  }
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error}>
      {multiline ? <textarea rows={rows} {...props} /> : <input type="text" {...props} />}
      {max && (value.length > max * 0.8) && <p className="mt-1 text-right text-2xs text-neutral-400">{value.length}/{max}</p>}
    </Field>
  )
}

export function SelectField<T extends string | number>({
  label, value, onChange, options,
}: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id}>
      <select
        id={id}
        value={String(value)}
        onChange={(e) => onChange((typeof value === 'number' ? Number(e.target.value) : e.target.value) as T)}
        className={inputCls}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
        ))}
      </select>
    </Field>
  )
}

export function ImageField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <MediaSelect value={value} onChange={onChange} />
    </Field>
  )
}

/** A list the editor can add to, remove from and reorder. */
export function ListEditor<T>({
  items, onChange, newItem, render, addLabel, itemLabel, max = 50,
}: {
  items: T[]; onChange: (items: T[]) => void; newItem: () => T
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode
  addLabel: string; itemLabel: string; max?: number
}) {
  const move = (i: number, to: number) => {
    if (to < 0 || to >= items.length) return
    const next = [...items]
    ;[next[i], next[to]] = [next[to], next[i]]
    onChange(next)
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">{itemLabel} {i + 1}</span>
            <span className="flex gap-1">
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${itemLabel} ${i + 1} up`} className="rounded p-1 text-neutral-500 hover:bg-neutral-200 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} aria-label={`Move ${itemLabel} ${i + 1} down`} className="rounded p-1 text-neutral-500 hover:bg-neutral-200 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove ${itemLabel} ${i + 1}`} className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </span>
          </div>
          <div className="space-y-3">{render(item, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))), i)}</div>
        </div>
      ))}
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, newItem()])} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-400 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-brand-blue hover:text-brand-blue">
          <Plus className="h-4 w-4" />{addLabel}
        </button>
      )}
    </div>
  )
}
