'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, Undo2 } from 'lucide-react'
import { isSafeHref } from '@/lib/cms-pages/links'
import { sanitizeRichText } from '@/lib/cms-pages/richtext'

/**
 * Tiptap limited to exactly what the public renderer supports. Anything the
 * server's sanitiser would drop is not offered here, so what the client sees
 * while editing is what visitors get.
 */
export function RichTextEditor({ value, onChange, label }: { value: unknown; onChange: (doc: unknown) => void; label: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    content: sanitizeRichText(value),
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false, codeBlock: false, strike: false, horizontalRule: false, underline: false,
        link: { openOnClick: false, autolink: false, protocols: ['https', 'mailto', 'tel'], validate: (href) => isSafeHref(href) },
      }),
    ],
    editorProps: {
      attributes: { 'aria-label': label, class: 'cms-prose min-h-[140px] rounded-b-lg px-3 py-2 focus:outline-none' },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getJSON()),
  })

  if (!editor) return <div className="h-40 animate-pulse rounded-lg bg-neutral-100" aria-hidden="true" />

  const btn = (active: boolean) =>
    `rounded p-1.5 ${active ? 'bg-brand-blue text-white' : 'text-neutral-600 hover:bg-neutral-200'} disabled:opacity-30`

  function setLink() {
    const previous = editor!.getAttributes('link').href as string | undefined
    const url = window.prompt('Link address (a site path like /denver, or https://, mailto:, tel:). Leave empty to remove.', previous ?? '')
    if (url === null) return
    if (url.trim() === '') {
      editor!.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    if (!isSafeHref(url.trim())) {
      window.alert('That link is not allowed. Use a site path like /denver, or an https:, mailto: or tel: address.')
      return
    }
    editor!.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  return (
    <div className="rounded-lg border border-neutral-300 bg-white focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/30">
      <div role="toolbar" aria-label={`${label} formatting`} className="flex flex-wrap gap-1 rounded-t-lg border-b border-neutral-200 bg-neutral-50 p-1.5">
        <button type="button" aria-label="Bold" aria-pressed={editor.isActive('bold')} className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></button>
        <button type="button" aria-label="Italic" aria-pressed={editor.isActive('italic')} className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></button>
        <button type="button" aria-label="Heading" aria-pressed={editor.isActive('heading', { level: 2 })} className={btn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></button>
        <button type="button" aria-label="Subheading" aria-pressed={editor.isActive('heading', { level: 3 })} className={btn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></button>
        <button type="button" aria-label="Bulleted list" aria-pressed={editor.isActive('bulletList')} className={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></button>
        <button type="button" aria-label="Numbered list" aria-pressed={editor.isActive('orderedList')} className={btn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></button>
        <button type="button" aria-label="Quote" aria-pressed={editor.isActive('blockquote')} className={btn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></button>
        <button type="button" aria-label="Link" aria-pressed={editor.isActive('link')} className={btn(editor.isActive('link'))} onClick={setLink}><Link2 className="h-4 w-4" /></button>
        <span className="mx-1 w-px bg-neutral-300" aria-hidden="true" />
        <button type="button" aria-label="Undo" className={btn(false)} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 className="h-4 w-4" /></button>
        <button type="button" aria-label="Redo" className={btn(false)} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 className="h-4 w-4" /></button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
