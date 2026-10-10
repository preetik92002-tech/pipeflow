import type { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: 'Contact Us — Denver Plumbing & HVAC Dispatch | PipeFlow Co.',
    description:
      'Have a question about an upcoming project, need service area confirmation, or require immediate 24/7 emergency dispatch? Get in touch with PipeFlow Co.',
    path: '/contact',
  })
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
