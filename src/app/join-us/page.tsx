import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  HardHat,
  DollarSign,
  Calendar,
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { ProApplicationForm } from '@/components/pro/ProApplicationForm'
import { Accordion } from '@/components/ui/Accordion'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = genMeta({
  title: 'Grow Your Business With PipeFlow — Pro Trade Partner Network',
  description:
    'Join PipeFlow Co. as a licensed plumber, HVAC technician, or independent service contractor in Denver, Colorado. Steady residential dispatch, weekly payouts, and top support.',
  path: '/join-us',
})

const proFaqs = [
  {
    id: 'pro-faq-1',
    question: 'What licensing is required to partner with PipeFlow?',
    answer:
      'Plumbers must hold a valid Colorado Journeyman or Master Plumbing License. HVAC technicians must hold EPA Universal certification and relevant municipal mechanical certifications.',
  },
  {
    id: 'pro-faq-2',
    question: 'How does dispatch scheduling work for trade contractors?',
    answer:
      'You define your service routes and available days. Our dispatch desk sends pre-qualified, vetted residential service calls directly into your territory.',
  },
  {
    id: 'pro-faq-3',
    question: 'What are the payout terms?',
    answer:
      'We operate transparent, weekly electronic payouts for completed jobs. Full compensation breakdown is provided before onboarding.',
  },
  {
    id: 'pro-faq-4',
    question: 'Do I need my own truck and hand tools?',
    answer:
      'Independent contractors should possess a reliable vehicle and primary field tools. PipeFlow provides diagnostic software, dispatch tech, and access to commercial equipment support.',
  },
]

export default function JoinUsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with Dedicated Professional Theme */}
      <section className="bg-navy-950 text-white section-padding relative overflow-hidden">
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand-blue/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="container-site relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/20 border border-brand-blue/30 px-3.5 py-1 text-xs font-bold text-brand-blue-lighter uppercase tracking-wider mb-4">
            <HardHat className="h-4 w-4" />
            <span>Contractor &amp; Trade Careers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight mb-4 leading-tight">
            Grow Your Business With PipeFlow
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mb-8">
            Whether you are an independent licensed master looking for steady Front Range dispatch,
            or an experienced technician seeking an organization that respects the trades—partner with
            PipeFlow Co.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <p className="font-bold text-white text-sm">Steady Volume</p>
              <p className="text-neutral-400 text-2xs mt-0.5">Consistent Denver dispatch</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <p className="font-bold text-white text-sm">Weekly Payouts</p>
              <p className="text-neutral-400 text-2xs mt-0.5">Reliable compensation</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <p className="font-bold text-white text-sm">Tech Support</p>
              <p className="text-neutral-400 text-2xs mt-0.5">Streamlined app &amp; dispatch</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <p className="font-bold text-white text-sm">Autonomy</p>
              <p className="text-neutral-400 text-2xs mt-0.5">Flexible territory routes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual & Core Value Proposition Section */}
      <section className="section-padding bg-neutral-50 border-b border-neutral-200">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-xl border border-neutral-200">
                <Image
                  src="/assets/service-detail-1.jpg"
                  alt="PipeFlow technician working with high quality gloves and tools in Colorado"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                Who We Are Looking For
              </span>
              <h2 className="text-3xl font-display font-bold text-navy-900 tracking-tight">
                Built By Tradespeople, For Tradespeople
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                We believe skilled plumbers and HVAC mechanics deserve dignity, clean operations, and
                fair compensation. We don&apos;t micro-manage or push predatory sales quotas. We
                focus on clean technical execution, honest homeowner communication, and strong
                contractor relationships.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Journeyman & Master Plumbers',
                  'Certified Furnace & Heat Pump Mechanics',
                  'EPA Universal Certified AC Technicians',
                  'Independent Subcontractors (LLC)',
                  'Sewer & Hydro-Jetting Specialists',
                  'Residential Replacement Specialists',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Application Form Anchor */}
          <div id="apply" className="scroll-mt-20">
            <ProApplicationForm />
          </div>
        </div>
      </section>

      {/* Pro FAQs */}
      <section className="section-padding bg-white">
        <div className="container-site max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-navy-900 mb-2">
              Contractor &amp; Professional Questions
            </h2>
            <p className="text-sm text-neutral-600">
              Details on licensing, dispatch software, compensation, and onboarding requirements.
            </p>
          </div>
          <Accordion items={proFaqs} />
        </div>
      </section>
    </div>
  )
}
