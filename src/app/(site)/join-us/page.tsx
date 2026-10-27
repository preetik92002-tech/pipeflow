import type { Metadata } from 'next'
import { BarChart3, BadgeCheck, ClipboardList, Inbox, MapPin, Star, UserRound, Wrench } from 'lucide-react'
import { ProApplicationForm } from '@/components/pro/ProApplicationForm'
import { Accordion } from '@/components/ui/Accordion'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'
import { CmsImage } from '@/components/cms/CmsImage'
import { PHOTOS } from '@/lib/media/photos'

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
  {
    id: 'pro-faq-3',
    question: 'When are credentials shown as verified?',
    answer: 'Only after the information has actually been checked. We never display a verification badge that has not been earned.',
  },
  {
    id: 'pro-faq-4',
    question: 'What happens after I apply?',
    answer: 'We review your application and contact you about the next steps. Terms, pricing and how leads work are discussed with you before anything starts.',
  },
]

export default function JoinUsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section data-hero className="relative isolate overflow-hidden bg-ink text-white">
        <div className="relative aspect-[16/7] sm:aspect-[16/6] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[46%]" aria-hidden="true">
          <CmsImage src={PHOTOS.technicianToolBelt.src} alt="" priority sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent lg:bg-gradient-to-r lg:from-ink lg:via-ink/30 lg:to-transparent" />
        </div>
        <div className="container-site relative pb-10 pt-2 lg:flex lg:min-h-[420px] lg:items-center lg:py-16">
          <div className="max-w-xl">
            <p className="ui-kicker !text-terra-light">For plumbing and HVAC professionals</p>
            <h1 className="mt-2 font-display text-display-xl font-semibold text-white">Grow Your Plumbing or HVAC Business in Denver &amp; Boulder</h1>
            <p className="mt-4 text-base leading-relaxed text-white/85 lg:text-lg">Build a professional profile and connect with customers looking for plumbing and HVAC help.</p>
            <a href="#application-form" className="ui-btn ui-btn-primary mt-6 w-full sm:w-auto">
              Create Your Professional Profile
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-paper section-y">
        <div className="container-site">
          <h2 className="font-display text-display-lg font-semibold text-ink">What You Get</h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:mt-8 lg:grid-cols-4 lg:gap-6">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:gap-3.5">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-white text-terra ring-1 ring-line">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-sans text-base font-semibold leading-snug text-ink">{title}</h3>
                  <p className="mt-1 hidden text-[0.95rem] leading-snug text-neutral-600 sm:block">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="application-form" className="container-site scroll-mt-12 section-y">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="font-display text-display-lg font-semibold text-ink">Create Your Professional Profile</h2>
            <p className="ui-body mt-2 text-neutral-600">Tell us about your company. We review every application.</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4 sm:p-10">
            <ProApplicationForm />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper section-y">
        <div className="container-site max-w-4xl">
          <h2 className="mb-6 text-center font-display text-display-lg font-semibold text-ink sm:mb-8">Questions From Professionals</h2>
          <Accordion items={proFaqs} />
        </div>
      </section>
    </div>
  )
}
