import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Droplets, Wind, AlertTriangle } from 'lucide-react'

const categories = [
  {
    id: 'plumbing',
    title: 'Plumbing Services',
    description:
      'From leaky faucets to full pipe replacements — we handle every plumbing challenge with precision and speed.',
    image: '/assets/service-plumbing.jpg',
    imageAlt: 'PipeFlow Co. plumber installing kitchen faucet with professional tools',
    href: '/services?category=plumbing',
    icon: Droplets,
    iconColor: 'text-brand-blue',
    iconBg: 'bg-blue-50',
    label: 'Plumbing',
    services: ['Drain Cleaning', 'Water Heater', 'Leak Detection', 'Pipe Repair', 'Fixture Installation'],
  },
  {
    id: 'hvac',
    title: 'HVAC Services',
    description:
      "Keep your home comfortable through Colorado's extremes with expert heating, cooling, and ventilation service.",
    image: '/assets/hero-hvac-tech.jpg',
    imageAlt: 'PipeFlow Co. HVAC technician replacing furnace filter during professional maintenance',
    href: '/services?category=hvac',
    icon: Wind,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    label: 'HVAC',
    services: ['AC Installation', 'Furnace Repair', 'Heat Pumps', 'Duct Cleaning', 'Seasonal Tune-Ups'],
  },
]

export function ServiceCategoryGrid() {
  return (
    <section className="section-padding bg-neutral-50" aria-labelledby="services-heading">
      <div className="container-site">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2
            id="services-heading"
            className="text-3xl sm:text-4xl font-display font-bold text-navy-800 mb-3"
          >
            Expert Services for Every Need
          </h2>
          <p className="text-neutral-500 max-w-xl mx-auto">
            Comprehensive plumbing and HVAC solutions — from routine maintenance to emergency repairs.
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <article
                key={cat.id}
                className="group relative overflow-hidden rounded-2xl bg-white border border-neutral-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Image */}
                <div className="relative h-52 sm:h-64 overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.imageAlt}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 via-transparent to-transparent" aria-hidden="true" />
                  {/* Icon badge */}
                  <div className={`absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-sm`}>
                    <Icon className={`h-4 w-4 ${cat.iconColor}`} aria-hidden="true" />
                    <span className="text-xs font-bold text-navy-800">{cat.label}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy-800 mb-2">{cat.title}</h3>
                  <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{cat.description}</p>

                  {/* Service tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {cat.services.map((service) => (
                      <span
                        key={service}
                        className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-blue-light transition-colors group/link"
                    aria-label={`View all ${cat.title}`}
                  >
                    View All Services
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        {/* Emergency CTA strip */}
        <div className="rounded-2xl bg-brand-red/5 border border-brand-red/20 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-brand-red/10 p-2.5 flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-brand-red" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-navy-800">Plumbing or HVAC Emergency?</p>
              <p className="text-sm text-neutral-500 mt-0.5">
                We respond fast — 24 hours a day, 7 days a week.
              </p>
            </div>
          </div>
          <Link
            href="/services/emergency"
            className="btn-primary whitespace-nowrap flex-shrink-0"
          >
            Emergency Service
          </Link>
        </div>
      </div>
    </section>
  )
}
export default ServiceCategoryGrid
