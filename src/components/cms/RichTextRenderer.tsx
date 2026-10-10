import type { ReactNode } from 'react'
import Link from 'next/link'
import { sanitizeRichText, type RichTextNode } from '@/lib/cms-pages/richtext'
import { isExternalHref } from '@/lib/cms-pages/links'

/**
 * Renders stored rich text as React elements. The document is sanitised again
 * here, so even a row written straight into the database cannot inject markup.
 */
function renderMarks(node: RichTextNode, key: string): ReactNode {
  let out: ReactNode = node.text
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') out = <strong>{out}</strong>
    else if (mark.type === 'italic') out = <em>{out}</em>
    else if (mark.type === 'link' && mark.attrs?.href) {
      const href = mark.attrs.href
      out = href.startsWith('/') ? (
        <Link href={href} className="font-medium text-brand-blue underline underline-offset-2 hover:text-brand-blue-light">
          {out}
        </Link>
      ) : (
        <a
          href={href}
          className="font-medium text-brand-blue underline underline-offset-2 hover:text-brand-blue-light"
          {...(isExternalHref(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {out}
        </a>
      )
    }
  }
  return <span key={key}>{out}</span>
}

function renderNode(node: RichTextNode, key: string): ReactNode {
  const children = node.content?.map((c, i) => renderNode(c, `${key}.${i}`))
  switch (node.type) {
    case 'text':
      return renderMarks(node, key)
    case 'hardBreak':
      return <br key={key} />
    case 'paragraph':
      return children?.length ? <p key={key}>{children}</p> : null
    case 'heading': {
      const level = node.attrs?.level
      if (level === 3) return <h3 key={key}>{children}</h3>
      if (level === 4) return <h4 key={key}>{children}</h4>
      return <h2 key={key}>{children}</h2>
    }
    case 'bulletList':
      return <ul key={key}>{children}</ul>
    case 'orderedList':
      return <ol key={key}>{children}</ol>
    case 'listItem':
      return <li key={key}>{children}</li>
    case 'blockquote':
      return <blockquote key={key}>{children}</blockquote>
    default:
      return null
  }
}

export function RichTextRenderer({ doc, className }: { doc: unknown; className?: string }) {
  const clean = sanitizeRichText(doc)
  return <div className={className ?? 'cms-prose'}>{clean.content.map((n, i) => renderNode(n, String(i)))}</div>
}
