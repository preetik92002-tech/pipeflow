import Link from 'next/link'
import { Check } from 'lucide-react'
import type { z } from 'zod'
import type { servicePageData, serviceBlock } from '@/lib/cms-pages/sections/schema'
import { isLinkable } from '@/lib/cms-pages/service-links'
import { ServiceIllustration } from './ServiceIllustration'
import { ServiceRequestForm } from './ServiceRequestForm'
import styles from './servicePage.module.css'

type Data = z.infer<typeof servicePageData>
type Block = z.infer<typeof serviceBlock>

const paragraphs = (value: string) => value.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)

/** Text from the CMS is rendered as plain text only: no HTML is ever interpreted. */
function Prose({ value }: { value: string }) {
  return (
    <>
      {paragraphs(value).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  )
}

/** "**Bold lead.** rest" lets list items and paragraphs keep the bold lead-in of the source copy. */
function Lead({ value }: { value: string }) {
  const m = /^\*\*(.+?)\*\*\s*([\s\S]*)$/.exec(value)
  if (!m) return <>{value}</>
  return (
    <>
      <strong>{m[1]}</strong> {m[2]}
    </>
  )
}

function BlockView({ block }: { block: Block }) {
  const head = block.heading ? <h3>{block.heading}</h3> : null
  const intro = block.intro ? <p className={styles.blockIntro}>{block.intro}</p> : null
  switch (block.kind) {
    case 'text':
      return (
        <div className={styles.block}>
          {head}
          {intro}
          <Prose value={block.text} />
        </div>
      )
    case 'list':
      return (
        <div className={styles.block}>
          {head}
          {intro}
          <ul className={styles.ticks}>
            {block.items.map((item, i) => (
              <li key={i}>
                <Check aria-hidden="true" />
                <span>
                  <Lead value={item} />
                </span>
              </li>
            ))}
          </ul>
          {block.text && <Prose value={block.text} />}
        </div>
      )
    case 'steps':
      return (
        <div className={styles.block}>
          {head}
          {intro}
          <ol className={styles.steps}>
            {block.items.map((item, i) => (
              <li key={i}>
                <Lead value={item} />
              </li>
            ))}
          </ol>
        </div>
      )
    case 'cards':
      return (
        <div className={styles.block}>
          {head}
          {intro}
          <div className={styles.infoGrid}>
            {block.cards.map((c, i) => (
              <article key={i} className={styles.infoCard}>
                <h4>{c.title}</h4>
                <Prose value={c.text} />
              </article>
            ))}
          </div>
          {block.text && <Prose value={block.text} />}
        </div>
      )
    case 'table':
      return (
        <div className={styles.block}>
          {head}
          {intro}
          <div className={styles.tableWrap} role="region" aria-label={block.heading || 'Comparison table'} tabIndex={0}>
            <table>
              <thead>
                <tr>
                  {block.columns.map((c, i) => (
                    <th key={i} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (c === 0 ? <th key={c} scope="row">{cell}</th> : <td key={c}>{cell}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.text && <Prose value={block.text} />}
        </div>
      )
    case 'notice':
      return (
        <aside className={`${styles.notice} ${block.tone === 'safety' ? styles.safety : ''}`} role="note">
          {block.heading && <strong>{block.heading}</strong>}
          <Prose value={block.text} />
          {block.items.length > 0 && (
            <ul>
              {block.items.map((item, i) => (
                <li key={i}>
                  <Lead value={item} />
                </li>
              ))}
            </ul>
          )}
        </aside>
      )
    case 'accordion':
      return (
        <div className={styles.block}>
          {head}
          {intro}
          {block.cards.map((c, i) => (
            <details key={i} className={styles.details}>
              <summary>{c.title}</summary>
              <div>
                <Prose value={c.text} />
              </div>
            </details>
          ))}
        </div>
      )
  }
}

/**
 * Both service-page templates in one renderer. Four primary sections: hero, main information,
 * guidance with the request form, final call to action. Content comes from the CMS as structured data.
 */
export function ServicePageTemplate({ data, template, liveHrefs }: { data: Data; template: 'category' | 'detail'; liveHrefs?: ReadonlySet<string> }) {
  const ctaTarget = '#request'
  // Links to CMS pages that are not live (still drafts) are withheld, so a visitor never lands on a 404.
  const linkable = (href: string) => isLinkable(href, liveHrefs)
  const related = data.related.filter((l) => linkable(l.href))
  return (
    <div className={styles.page} data-service-page={template}>
      <section className={styles.hero} aria-labelledby="page-title">
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              {data.breadcrumbs.length > 0 && (
                <nav aria-label="Breadcrumb" className={styles.crumbs}>
                  <ol>
                    {data.breadcrumbs.map((c, i) => (
                      <li key={i}>
                        {i === data.breadcrumbs.length - 1 ? <span aria-current="page">{c.label}</span> : linkable(c.href) ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              <h1 id="page-title">{data.heading}</h1>
              <div className={styles.lead}>
                <Prose value={data.intro} />
              </div>
              <a href={ctaTarget} className={styles.cta}>
                {data.ctaLabel}
              </a>
            </div>
            <div className={styles.heroArt}>
              <ServiceIllustration name={data.illustration} alt={data.illustrationAlt} className={styles.heroSvg} />
            </div>
          </div>
        </div>
        <svg className={styles.flow} viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d="M0 20 C150 4 250 36 400 20 S650 4 800 20 S1050 36 1200 20" />
        </svg>
      </section>

      <section className={styles.alt} aria-labelledby="svc-main">
        <div className={styles.container}>
          {data.mainHeading && <h2 id="svc-main">{data.mainHeading}</h2>}
          {template === 'category' && data.cards.length > 0 && (
            <ul className={styles.cards}>
              {data.cards.map((c, i) => (
                <li key={i} className={styles.card}>
                  <ServiceIllustration name={c.illustration} alt={c.illustrationAlt} className={styles.cardSvg} />
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  {linkable(c.href) && (
                    <Link href={c.href} className={styles.more} aria-label={`Learn more about ${c.title}`}>
                      Learn More <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
          {data.mainBlocks.map((b, i) => (
            <BlockView key={i} block={b} />
          ))}
        </div>
      </section>

      <section className={styles.plain} aria-labelledby="svc-guidance">
        <div className={styles.container}>
          <div className={styles.twoCol}>
            <div className={styles.article}>
              {data.guidanceHeading && <h2 id="svc-guidance">{data.guidanceHeading}</h2>}
              {data.guidanceBlocks.map((b, i) => (
                <BlockView key={i} block={b} />
              ))}
              {data.faqs.length > 0 && (
                <div className={styles.block}>
                  <h3>{data.faqHeading}</h3>
                  {data.faqs.map((f, i) => (
                    <details key={i} className={styles.details}>
                      <summary>{f.question}</summary>
                      <div>
                        <Prose value={f.answer} />
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
            <aside className={styles.side} aria-label="Request service">
              <ServiceRequestForm defaultService={data.formService} defaultLabel={data.formServiceLabel} disclosure={data.disclosure} />
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.final} aria-labelledby="svc-final">
        <div className={styles.container}>
          <h2 id="svc-final">{data.finalHeading}</h2>
          {data.finalText && <p className={styles.finalText}>{data.finalText}</p>}
          <a href={ctaTarget} className={styles.cta}>
            {data.finalCtaLabel}
          </a>
          {data.related.length > 0 && (
            <nav aria-label={data.relatedHeading} className={styles.related}>
              <h3>{data.relatedHeading}</h3>
              <ul>
                {data.related.map((l, i) => (
                  <li key={i}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <p className={styles.disclosure}>{data.disclosure}</p>
        </div>
      </section>
    </div>
  )
}
