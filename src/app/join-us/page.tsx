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
  Briefcase,
  Phone,
} from 'lucide-react'
import { ProApplicationForm } from '@/components/pro/ProApplicationForm'
import { Accordion } from '@/components/ui/Accordion'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'
import { PageHero } from '@/components/sections/PageHero'

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
      {/* Cinematic Hero */}
      <PageHero
        imageSrc="/assets/hero-hvac.jpg"
        imageAlt="Master trade technician carrying manifold gauges overlooking Colorado skyline"
        eyebrow="Contractor &amp; Trade Careers"
        eyebrowIcon={HardHat}
        title="Grow your trade business with PipeFlow."
        description="Whether you are an independent licensed master looking for steady Front Range dispatch, or an experienced technician seeking an organization that respects the trades—partner with PipeFlow Co."
        primaryCta={{
          label: 'Apply to Join Network',
          href: '#application-form',
          variant: 'red',
          icon: Briefcase,
        }}
        secondaryCta={{
          label: 'Call Contractor Relations',
          href: 'tel:(720)555-0100',
          variant: 'outline',
          icon: Phone,
          isExternal: true,
        }}
        badgeText="Weekly Electronic Payouts • Pre-Vetted Colorado Residential Calls"
      />

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
                Contractor First Ecosystem
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-navy-900 leading-tight">
                Spend Less Time Chasing Invoices &amp; More Time Doing Quality Work
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                We handle digital marketing, upfront customer qualification, address verification, and
                billing logistics. You focus on top-tier mechanical diagnostics, clean installations, and code compliance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-navy-900">Pre-Qualified Homeowners</h3>
                    <p className="text-2xs text-neutral-500 mt-0.5">
                      No cold leads or unvetted addresses. Every job has verified requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-navy-900">Weekly Guaranteed Payouts</h3>
                    <p className="text-2xs text-neutral-500 mt-0.5">
                      Direct deposit settlements every single Friday for verified jobs completed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-navy-900">Dispatch Mobile Tools</h3>
                    <p className="text-2xs text-neutral-500 mt-0.5">
                      Simple mobile job acceptance, navigation, customer notes, and photo uploads.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-navy-900">Territory Autonomy</h3>
                    <p className="text-2xs text-neutral-500 mt-0.5">
                      Set your radius. Choose your days. Maintain full command of your schedule.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Benefit Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-3">
                <DollarSign className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm">Competitive Rates</h3>
              <p className="text-2xs text-neutral-600 mt-1">
                Transparent flat-rate compensation models with performance bonuses.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-3">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm">Consistent Volume</h3>
              <p className="text-2xs text-neutral-600 mt-1">
                Year-round residential plumbing &amp; HVAC demand across Front Range ZIP codes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-3">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm">Dispute Protection</h3>
              <p className="text-2xs text-neutral-600 mt-1">
                PipeFlow supports our mechanics with dedicated customer dispute management.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-3">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm">Master Recognition</h3>
              <p className="text-2xs text-neutral-600 mt-1">
                Top-rated contractors receive priority dispatch for high-value installations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contractor Application Form Section */}
      <section id="application-form" className="section-padding container-site scroll-mt-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-display text-navy-900">
              Apply to Join the PipeFlow Network
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Submit your credentials below. Our contractor onboarding desk reviews applications within 2 business days.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-lg">
            <ProApplicationForm />
          </div>
        </div>
      </section>

      {/* Pro FAQs Section */}
      <section className="section-padding bg-neutral-50 border-t border-neutral-200">
        <div className="container-site max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-navy-900">
              Frequently Asked Questions for Contractors
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Common questions about licensing, territories, insurance, and onboarding.
            </p>
          </div>

          <Accordion items={proFaqs} />
        </div>
      </section>
    </div>
  )
}
