import type { Metadata } from 'next'
import { BarChart3, BadgeCheck, ClipboardList, Inbox, MapPin, Star, UserRound, Wrench } from 'lucide-react'
import { ProApplicationForm } from '@/components/pro/ProApplicationForm'
import { Accordion } from '@/components/ui/Accordion'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: 'Join as a Plumbing or HVAC Professional in Denver & Boulder',
    description: 'Create your professional profile, showcase your services and service areas, and connect with customers looking for plumbing and HVAC help in Denver and Boulder.',
    path: '/join-us',
  })
}

const benefits = [
  { icon: UserRound, title: 'Create Your Professional Profile', text: 'Present your company clearly to customers.' },
  { icon: Wrench, title: 'Showcase Your Services', text: 'List the plumbing and HVAC work you do.' },
  { icon: MapPin, title: 'Promote Your Service Areas', text: 'Tell customers in Denver and Boulder where you work.' },
  { icon: BadgeCheck, title: 'Display Verified Credentials', text: 'Licences and insurance are shown as verified once they have been checked.' },
  { icon: Inbox, title: 'Receive Customer Leads', text: 'Get service requests from customers in your area.' },
  { icon: ClipboardList, title: 'Manage Leads and Requests', text: 'Keep track of the requests you receive.' },
  { icon: Star, title: 'Collect Customer Reviews', text: 'Build a reputation with authentic reviews.' },
  { icon: BarChart3, title: 'Track Performance', text: 'See how your profile and leads are doing.' },
]

const proFaqs = [
  { id: 'pro-faq-1', question: 'Who can apply?', answer: 'Plumbing and HVAC companies and independent professionals who serve Denver or Boulder, Colorado.' },
  { id: 'pro-faq-2', question: 'What do you ask for?', answer: 'Your company details, the services you offer, the areas you serve, and your licence and insurance information so it can be checked.' },
  { id: 'pro-faq-3', question: 'When are credentials shown as verified?', answer: 'Only after the information has actually been checked. We never display a verification badge that has not been earned.' },
  { id: 'pro-faq-4', question: 'What happens after I apply?', answer: 'We review your application and contact you about the next steps. Terms, pricing and how leads work are discussed with you before anything starts.' },
]

export default function JoinUsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-600 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-brand-blue/30 blur-3xl" aria-hidden="true" />
        <div className="container-site py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">For plumbing &amp; HVAC professionals</p>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Grow Your Plumbing or HVAC Business in Denver &amp; Boulder</h1>
            <p className="mt-5 text-lg leading-relaxed text-neutral-200">Build a professional online presence and connect with customers actively looking for plumbing and HVAC services.</p>
            <a href="#application-form" className="btn-primary mt-8 !px-6 !py-3">Create Your Professional Profile</a>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-neutral-50 py-14">
        <div className="container-site">
          <h2 className="font-display text-2xl font-bold text-navy-800 sm:text-3xl">What You Get</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="font-display text-base font-semibold text-navy-800">{title}</h3>
                <p className="mt-1 text-sm text-neutral-600">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="application-form" className="container-site scroll-mt-12 py-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold text-navy-800">Create Your Professional Profile</h2>
            <p className="mt-2 text-sm text-neutral-500">Tell us about your company. We review every application.</p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg sm:p-10">
            <ProApplicationForm />
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 py-14">
        <div className="container-site max-w-4xl">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-navy-800 sm:text-3xl">Questions From Professionals</h2>
          <Accordion items={proFaqs} />
        </div>
      </section>
    </div>
  )
}
