import Link from 'next/link'
import { Accordion } from '@/components/ui/Accordion'
import type { FAQ } from '@/types'

interface FAQSectionProps {
  faqs: FAQ[]
  heading?: string
  description?: string
}

export function FAQSection({ faqs, heading = 'Frequently Asked Questions', description = 'Have more questions? Contact our team.' }: FAQSectionProps) {
  if (!faqs.length) return null
  const sorted = [...faqs].sort((a, b) => a.order - b.order)
  const items = sorted.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))

  return (
    <section className="section-padding bg-neutral-50" aria-labelledby="faq-heading">
      <div className="container-site max-w-3xl">
        <div className="text-center mb-10">
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl font-display font-bold text-navy-800 mb-3"
          >
            {heading}
          </h2>
          <p className="text-neutral-500">
            {description}{' '}
            <Link href="/contact" className="text-brand-blue hover:underline font-medium">
              Contact our team
            </Link>
            .
          </p>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  )
}
export default FAQSection
