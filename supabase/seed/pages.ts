/**
 * Launch content for the CMS: every page here comes from the client's own
 * documents (content/website-structure and content/water-heater-repair). It
 * has no imports on purpose so scripts/generate-seed-sql.ts can run it with
 * plain Node. tests/unit/seed.test.ts checks every page against the same
 * Zod schemas the editor uses.
 *
 * Regenerate the migration after editing:  npm run seed:sql
 */

type Node = Record<string, unknown>
export interface SeedSection { type: string; data: Record<string, unknown> }
export interface SeedPage {
  path: string
  title: string
  description: string
  seoTitle?: string
  seoDescription?: string
  noindex?: boolean
  isTemplate?: boolean
  sections: SeedSection[]
}

// ---- small builders for rich text (Tiptap JSON) -------------------------------
const t = (text: string): Node => ({ type: 'text', text })
const para = (text: string): Node => ({ type: 'paragraph', content: [t(text)] })
const bullets = (items: string[]): Node => ({
  type: 'bulletList',
  content: items.map((i) => ({ type: 'listItem', content: [para(i)] })),
})
const doc = (...content: Node[]) => ({ type: 'doc', content })

const REQUEST = '/book-service'
const btn = (label: string, href: string, variant: 'primary' | 'secondary' = 'primary') => ({ label, href, variant })

// ---- reusable blocks -----------------------------------------------------------
const howItWorks = (heading: string, buttonLabel: string): SeedSection => ({
  type: 'steps',
  data: {
    heading,
    intro: '',
    steps: [
      { title: 'Tell Us What You Need', text: 'Select a service and describe the problem.' },
      { title: 'Share the Details', text: 'Add your location, preferred appointment time and photos of the issue.' },
      { title: 'Find a Local Pro', text: 'We match your request with professionals serving Denver or Boulder.' },
      { title: 'Schedule Service', text: 'Connect with the professional and arrange the appointment.' },
    ],
    buttons: [btn(buttonLabel, REQUEST)],
  },
})

const servesLinks = (service: string, links: { label: string; href: string }[]): SeedSection => ({
  type: 'linkList',
  data: { heading: `${service} in Denver & Boulder`, links },
})

/** Pages the client asked for whose copy has not been written yet: structure only, noindex until filled in. */
function starterServicePage(path: string, title: string, intro: string, noun: string): SeedPage {
  return {
    path,
    title,
    description: intro,
    seoTitle: title,
    seoDescription: intro,
    noindex: true,
    sections: [
      { type: 'hero', data: { eyebrow: 'Serving Denver, CO, and Boulder, CO.', heading: title, subtitle: intro, intro: '', image: '', buttons: [btn('Request Service', REQUEST)], align: 'left' } },
      howItWorks('How to Request Service', 'Request Service'),
      servesLinks(noun, [{ label: `${noun} in Denver`, href: '/denver' }, { label: `${noun} in Boulder`, href: '/boulder' }]),
      { type: 'cta', data: { heading: 'Need a Plumbing or HVAC Professional?', text: 'Tell us what you need and find a local professional serving Denver or Boulder.', buttons: [btn('Request Service', REQUEST)], tone: 'dark' } },
    ],
  }
}

const SERVICE_LINKS_DENVER = [
  { label: 'Plumbing in Denver', href: '/plumbing/plumbing-repair' },
  { label: 'Water Heater Repair in Denver', href: '/plumbing/water-heater-repair' },
  { label: 'Frozen Pipe Repair in Denver', href: '/plumbing/frozen-pipe-repair' },
  { label: 'AC Repair in Denver', href: '/hvac/ac-repair' },
  { label: 'AC Installation in Denver', href: '/hvac/ac-installation' },
]
const SERVICE_LINKS_BOULDER = SERVICE_LINKS_DENVER.map((l) => ({ ...l, label: l.label.replace('Denver', 'Boulder') }))

function locationPage(city: 'Denver' | 'Boulder', links: { label: string; href: string }[]): SeedPage {
  const headline = `Trusted Plumbing & HVAC Services in ${city}, Colorado`
  const copy = `Find local plumbing and HVAC professionals serving ${city}. Request plumbing repairs, water heater services, frozen pipe repair, AC repair, AC installation and other residential or commercial services.`
  return {
    path: city.toLowerCase(),
    title: `Plumbing & HVAC Services in ${city}, CO`,
    description: copy,
    seoTitle: `Plumbing & HVAC Services in ${city}, Colorado`,
    seoDescription: copy,
    sections: [
      { type: 'hero', data: { eyebrow: '', heading: headline, subtitle: copy, intro: '', image: '', buttons: [btn('Request Service', REQUEST)], align: 'left' } },
      { type: 'linkList', data: { heading: `Services in ${city}`, links } },
      { type: 'cta', data: { heading: 'Need a Plumbing or HVAC Professional?', text: `Tell us what you need and find a local professional serving ${city}.`, buttons: [btn('Request Service', REQUEST)], tone: 'dark' } },
    ],
  }
}

// ---- water heater page: the client's full copy ---------------------------------
const waterHeater: SeedPage = {
  path: 'plumbing/water-heater-repair',
  title: 'Water Heater Repair',
  description: 'Need water heater repair, replacement or installation in Denver or Boulder, CO? Find local plumbing professionals for reliable water heater services. Request service today.',
  seoTitle: 'Water Heater Repair, Replacement & Installation Denver & Boulder',
  seoDescription: 'Need water heater repair, replacement or installation in Denver or Boulder, CO? Find local plumbing professionals for reliable water heater services. Request service today.',
  sections: [
    {
      type: 'hero',
      data: {
        eyebrow: 'Serving Denver, CO, and Boulder, CO.',
        heading: 'Water Heater Repair, Replacement & Installation in Denver & Boulder',
        subtitle: 'Looking for reliable water heater repair, replacement, or installation in Denver or Boulder, Colorado? Our platform helps homeowners and commercial property owners connect with local plumbing professionals for water heater problems, new installations, and replacement projects.',
        intro: "Whether your water heater is leaking, producing inconsistent hot water, making unusual noises, or no longer meeting your property's needs, you can submit a service request and find professionals serving your area.\n\nFrom diagnosing common water heater issues to installing a new system, explore local service options and request an appointment that works for you.",
        image: '',
        buttons: [btn('Request Water Heater Service', REQUEST), btn('Find a Local Plumber', '/plumbing', 'secondary')],
        align: 'left',
      },
    },
    {
      type: 'richText',
      data: {
        content: doc(
          { type: 'heading', attrs: { level: 2 }, content: [t('Water Heater Services We Help You Find')] },
          para('Water heater problems can affect your daily routine, business operations, and comfort. Find local professionals for repair, replacement, and installation services based on your needs.')
        ),
      },
    },
    {
      type: 'contentBlock',
      data: {
        label: '1', heading: 'Water Heater Repair', imagePosition: 'none', image: '', imageAlt: '',
        content: doc(
          para('Is your water heater not working properly? A qualified plumbing professional can inspect the system, identify the problem, and recommend an appropriate repair.'),
          para('Common water heater problems include:'),
          bullets([
            'No hot water or insufficient hot water',
            'Water temperature fluctuations',
            'Water leaking around the tank or connections',
            'Unusual popping, rumbling, or banging noises',
            'Pilot light or ignition problems',
            'Water heater not turning on',
            'Rust-colored water or unusual odors',
            'Problems with heating elements or thermostats',
          ]),
          para('If you need water heater repair in Denver or Boulder, submit your service request with details about the issue. You can also upload photos to help the professional understand your situation before the appointment.')
        ),
        button: btn('Request Water Heater Repair', REQUEST),
      },
    },
    {
      type: 'contentBlock',
      data: {
        label: '2', heading: 'Water Heater Replacement', imagePosition: 'none', image: '', imageAlt: '',
        content: doc(
          para("Sometimes repairing an older or frequently malfunctioning water heater may not be the most practical long-term option. Depending on the system's age, condition, repair costs, and energy efficiency, replacement may be worth considering."),
          para('You may want to explore water heater replacement if:'),
          bullets([
            'Your existing unit frequently needs repairs',
            'Your household or business regularly runs out of hot water',
            'The tank is leaking or showing signs of corrosion',
            'Your water heater is no longer operating efficiently',
            'Repair costs are becoming difficult to justify',
            'Your hot water requirements have changed',
          ]),
          para('A plumbing professional can evaluate your current system, discuss suitable replacement options, and help you choose a water heater based on your hot water demand, available space, fuel type, and budget.'),
          para('Looking for water heater replacement in Denver or Boulder, CO? Submit your requirements to connect with a local professional.')
        ),
        button: btn('Get Water Heater Replacement Help', REQUEST),
      },
    },
    {
      type: 'contentBlock',
      data: {
        label: '3', heading: 'Water Heater Installation', imagePosition: 'none', image: '', imageAlt: '',
        content: doc(
          para("Planning a new water heater installation for your home, rental property, office, or commercial building? The right system depends on your property's hot water needs, plumbing configuration, available utilities, and installation requirements."),
          para('Professional water heater installation services may include:'),
          bullets([
            'Installation of a new traditional tank water heater',
            'Tankless water heater installation',
            'Replacement of an existing water heater',
            'Hot water system installation for residential properties',
            'Water heater installation for commercial properties',
            'Connection and system setup',
            'Safety and operational checks',
            'Recommendations for ongoing maintenance',
          ]),
          para('Proper installation is important for system performance, safety, and reliability. Gas, electrical, venting, and plumbing work should be handled by appropriately qualified professionals in accordance with applicable codes and permit requirements.'),
          para('If you are planning water heater installation in Denver or Boulder, share your project details to help find a professional who serves your location.')
        ),
        button: btn('Request Water Heater Installation', REQUEST),
      },
    },
    {
      type: 'contentBlock',
      data: {
        label: 'Residential Water Heater Services', heading: 'Reliable Hot Water for Your Home', imagePosition: 'none', image: '', imageAlt: '',
        content: doc(
          para('Hot water is essential for showers, cleaning, laundry, and everyday household activities. When your water heater stops working, finding the right service professional can help you get the problem assessed and addressed.'),
          para('Our platform helps homeowners in Denver and Boulder explore local plumbing professionals for:'),
          bullets([
            'Water heater troubleshooting and repair',
            'Water heater replacement',
            'New water heater installation',
            'Tankless water heater services',
            'Hot water supply problems',
            'Routine water heater maintenance',
          ]),
          para('Whether you need help with an existing unit or are planning an upgrade, submit a service request with your location and preferred appointment time.')
        ),
        button: btn('Find a Residential Water Heater Plumber', REQUEST),
      },
    },
    {
      type: 'contentBlock',
      data: {
        label: 'Commercial Water Heater Services', heading: 'Water Heater Solutions for Businesses and Properties', imagePosition: 'none', image: '', imageAlt: '',
        content: doc(
          para('Commercial properties may have higher or more consistent hot water demands than residential buildings. A malfunctioning water heater can disrupt operations in restaurants, offices, apartment buildings, hotels, retail facilities, and other commercial spaces.'),
          para('Find local plumbing professionals for commercial water heater requirements such as:'),
          bullets([
            'Commercial water heater repair',
            'Water heater replacement',
            'New system installation',
            'Hot water supply issues',
            'Water heater assessment and maintenance',
            'Replacement planning for aging equipment',
          ]),
          para('Provide your business type, property location, system details, and service requirements so that your request can be matched with professionals offering the appropriate services.')
        ),
        button: btn('Request Commercial Water Heater Service', REQUEST),
      },
    },
    {
      type: 'contentBlock',
      data: {
        label: 'Water Heater Repair in Denver, CO', heading: 'Find Local Water Heater Professionals in Denver', imagePosition: 'none', image: '', imageAlt: '',
        content: doc(
          para('Need water heater repair, replacement, or installation in Denver? Connect with plumbing professionals serving Denver, Colorado, for common hot water problems and new system requirements.'),
          para('Whether your water heater is leaking, failing to heat water, or nearing the end of its useful life, describe the issue and request an appointment with a local professional.'),
          para('Services you can request include:'),
          bullets([
            'Water heater repair in Denver',
            'Water heater replacement in Denver',
            'Water heater installation in Denver',
            'Tankless water heater installation',
            'Residential and commercial water heater services',
          ])
        ),
        button: btn('Find Water Heater Service in Denver', '/denver'),
      },
    },
    {
      type: 'contentBlock',
      data: {
        label: 'Water Heater Repair in Boulder, CO', heading: 'Local Water Heater Repair, Replacement & Installation in Boulder', imagePosition: 'none', image: '', imageAlt: '',
        content: doc(
          para('If you need water heater service in Boulder, Colorado, our platform helps you find plumbing professionals who serve your area.'),
          para('From troubleshooting an existing water heater to planning a replacement or installing a new system, submit your service requirements and preferred appointment time.'),
          para('Available service categories may include:'),
          bullets([
            'Water heater repair in Boulder',
            'Water heater replacement in Boulder',
            'Water heater installation in Boulder',
            'Hot water heater repair',
            'Tankless water heater services',
            'Commercial water heater services',
          ]),
          para('Service availability depends on the participating professionals and the location of your property.')
        ),
        button: btn('Find Water Heater Service in Boulder', '/boulder'),
      },
    },
    {
      type: 'comparison',
      data: {
        heading: 'Tank vs. Tankless Water Heaters: Which Is Right for You?',
        intro: 'Choosing between a traditional tank water heater and a tankless system depends on your hot water usage, budget, installation conditions, and energy source.',
        columns: [
          { title: 'Traditional tank water heaters', items: ['Store heated water for use when needed', 'Are available in different tank capacities', 'May be suitable for households with predictable hot water requirements', 'Require enough space for the tank and associated connections'] },
          { title: 'Tankless water heaters', items: ['Heat water on demand', 'Generally take up less space than traditional tank systems', 'Can provide continuous hot water within their rated capacity', 'May require upgrades to gas supply, electrical service, or venting, depending on the model'] },
        ],
        outro: "A qualified professional can assess your property's requirements and explain the costs, capacity, and installation considerations of each option.",
        buttons: [btn('Explore Water Heater Installation Options', REQUEST)],
      },
    },
    {
      type: 'contentBlock',
      data: {
        label: '', heading: 'When Should You Repair or Replace a Water Heater?', imagePosition: 'none', image: '', imageAlt: '', button: null,
        content: doc(
          para('The right decision depends on the source of the problem and the condition of the equipment.'),
          para('Repair may be suitable when the issue is limited to a replaceable component and the system is otherwise in good condition.'),
          para('Replacement may be worth considering when the tank is leaking due to corrosion, repairs are recurring, the system cannot meet your hot water needs, or the estimated repair cost is high relative to a new unit.'),
          para('A leaking tank often requires replacement rather than a simple repair. If you notice water around your unit, have the source assessed promptly. If you suspect a gas leak, leave the area and contact the appropriate emergency service or gas utility from a safe location.'),
          para('A professional inspection can help you understand your options before making a decision.')
        ),
      },
    },
    {
      type: 'steps',
      data: {
        heading: 'How to Request Water Heater Service',
        intro: 'Finding the right professional should be straightforward.',
        steps: [
          { title: 'Select Your Service', text: 'Choose water heater repair, replacement, or installation.' },
          { title: 'Describe the Problem', text: 'Explain whether you have no hot water, a leak, inconsistent temperatures, or a new installation requirement.' },
          { title: 'Add Photos', text: 'Upload photos of the water heater or the affected area if available. Avoid touching leaking equipment or electrical components.' },
          { title: 'Enter Your Location', text: 'Provide your service address or ZIP code in Denver or Boulder.' },
          { title: 'Choose Your Preferred Appointment', text: 'Tell us whether you need urgent assistance or would prefer a scheduled appointment.' },
          { title: 'Connect With a Professional', text: 'Submit your request to find an appropriate local plumbing professional based on service coverage and availability.' },
        ],
        buttons: [btn('Request Water Heater Service Today', REQUEST)],
      },
    },
    {
      type: 'faq',
      data: {
        heading: 'Frequently Asked Questions',
        items: [
          { question: 'How much does water heater repair cost in Denver or Boulder?', answer: 'The cost depends on the type of water heater, the fault, required parts, labor, and accessibility. Request an assessment and ask the professional for an estimate before approving work.' },
          { question: 'When should I replace my water heater instead of repairing it?', answer: "Replacement may be appropriate when the tank is leaking from corrosion, the system requires frequent repairs, or repair costs are no longer economical. A professional can assess the unit's condition and explain the options." },
          { question: 'Do you help with water heater installation in Denver and Boulder?', answer: 'Yes. You can submit a request for new water heater installation in Denver or Boulder. Availability depends on the local professionals listed on the platform.' },
          { question: 'Can I request tankless water heater installation?', answer: 'Yes. Select water heater installation and mention that you are interested in a tankless system. The professional can assess capacity, utility requirements, and installation feasibility.' },
          { question: 'Do you offer commercial water heater services?', answer: 'You can submit requests for commercial water heater repair, replacement, and installation. Include your business type and property details so your requirements can be matched appropriately.' },
          { question: 'Can I upload a photo of my water heater?', answer: 'Yes. If photo upload is enabled in the service request form, you can attach pictures of the unit, model label, or visible issue. Photos can help provide context but do not replace an on-site inspection.' },
          { question: 'How quickly can I get water heater service?', answer: 'Appointment availability varies by service type, location, urgency, and participating professional. Include your preferred timing and indicate whether the issue is urgent when submitting your request.' },
          { question: 'Which areas do you serve?', answer: 'Our initial service markets are Denver, Colorado, and Boulder, Colorado. Availability depends on the participating professionals covering your specific address.' },
        ],
      },
    },
    {
      type: 'cta',
      data: {
        heading: 'Find Water Heater Repair, Replacement & Installation Today',
        text: "Whether you need to fix an existing water heater, replace an aging unit, or install a new system, start by describing your requirements.\n\nConnect with local plumbing professionals serving Denver and Boulder and request the service that fits your home or business.\n\nServing Denver, CO, and Boulder, CO.",
        buttons: [btn('Request Water Heater Service', REQUEST), btn('Find a Local Plumbing Professional', '/plumbing', 'secondary')],
        tone: 'dark',
      },
    },
  ],
}

// ---- category pages ------------------------------------------------------------
const plumbing: SeedPage = {
  path: 'plumbing',
  title: 'Plumbing Services',
  description: 'Find local professionals for plumbing repairs, water heater services, frozen pipes and everyday plumbing fixes in Denver and Boulder.',
  seoTitle: 'Trusted Plumbing Services in Denver & Boulder',
  seoDescription: 'Find local professionals for plumbing repairs, water heater services, frozen pipes and everyday plumbing fixes in Denver and Boulder.',
  sections: [
    { type: 'hero', data: { eyebrow: '', heading: 'Trusted Plumbing Services in Denver & Boulder', subtitle: 'Find local professionals for plumbing repairs, water heater services, frozen pipes and everyday plumbing fixes.', intro: '', image: '', buttons: [btn('Request Service', REQUEST)], align: 'left' } },
    {
      type: 'featureCards',
      data: {
        heading: 'Plumbing Services', intro: '',
        cards: [
          { title: 'Plumbing Repair', text: 'Plumbing Repair Services in Denver & Boulder', href: '/plumbing/plumbing-repair', image: '' },
          { title: 'Water Heater Repair', text: 'Water Heater Repair in Denver & Boulder', href: '/plumbing/water-heater-repair', image: '' },
          { title: 'Frozen Pipe Repair', text: 'Frozen Pipe Repair in Denver & Boulder', href: '/plumbing/frozen-pipe-repair', image: '' },
        ],
      },
    },
    { type: 'cta', data: { heading: 'Need a Plumbing or HVAC Professional?', text: 'Tell us what you need and find a local professional serving Denver or Boulder.', buttons: [btn('Request Service', REQUEST)], tone: 'dark' } },
  ],
}

const hvac: SeedPage = {
  path: 'hvac',
  title: 'HVAC & AC Services',
  description: 'Find local professionals for AC repair, installation, replacement and HVAC service in Denver and Boulder.',
  seoTitle: 'HVAC & AC Services in Denver & Boulder',
  seoDescription: 'Find local professionals for AC repair, installation, replacement and HVAC service in Denver and Boulder.',
  sections: [
    { type: 'hero', data: { eyebrow: '', heading: 'HVAC & AC Services in Denver & Boulder', subtitle: 'Find local professionals for AC repair, installation, replacement and HVAC service.', intro: '', image: '', buttons: [btn('Request Service', REQUEST)], align: 'left' } },
    {
      type: 'featureCards',
      data: {
        heading: 'HVAC & AC Services', intro: '',
        cards: [
          { title: 'AC Repair', text: 'AC Repair Services in Denver & Boulder', href: '/hvac/ac-repair', image: '' },
          { title: 'AC Installation', text: 'AC Installation in Denver & Boulder', href: '/hvac/ac-installation', image: '' },
        ],
      },
    },
    { type: 'cta', data: { heading: 'Need a Plumbing or HVAC Professional?', text: 'Tell us what you need and find a local professional serving Denver or Boulder.', buttons: [btn('Request Service', REQUEST)], tone: 'dark' } },
  ],
}

// ---- homepage: structure document section 3 ------------------------------------
const home: SeedPage = {
  path: '',
  title: 'Home',
  description: 'Find qualified local professionals for plumbing repairs, water heater services, frozen pipe repairs, AC repair, AC installation and HVAC services in Denver and Boulder.',
  seoTitle: 'Trusted Plumbing & HVAC Professionals in Denver & Boulder',
  seoDescription: 'Tell us what you need, find qualified local professionals, and schedule plumbing or HVAC service with confidence in Denver and Boulder, Colorado.',
  sections: [
    {
      type: 'hero',
      data: {
        eyebrow: 'Local Professionals • Easy Scheduling • Residential & Commercial',
        heading: 'Trusted Plumbing & HVAC Services in Denver & Boulder',
        subtitle: 'Find qualified local professionals for plumbing repairs, water heater services, frozen pipe repairs, AC repair, AC installation and HVAC services.',
        intro: '', image: '',
        buttons: [btn('Request Service', REQUEST), btn('Find a Professional', '/denver', 'secondary')],
        align: 'left',
      },
    },
    {
      type: 'featureCards',
      data: {
        heading: 'What Service Do You Need?',
        intro: "Whether you need an urgent repair or are planning a new installation, tell us what you need and we'll help you find the right local professional.",
        cards: [
          { title: 'Plumbing Services', text: 'Plumbing repair, water heater repair and frozen pipe repair.', href: '/plumbing', image: '' },
          { title: 'HVAC Services', text: 'AC repair and AC installation.', href: '/hvac', image: '' },
        ],
      },
    },
    { type: 'linkList', data: { heading: 'Plumbing', links: [{ label: 'Plumbing Repair', href: '/plumbing/plumbing-repair' }, { label: 'Water Heater Repair', href: '/plumbing/water-heater-repair' }, { label: 'Frozen Pipe Repair', href: '/plumbing/frozen-pipe-repair' }] } },
    { type: 'linkList', data: { heading: 'HVAC', links: [{ label: 'AC Repair', href: '/hvac/ac-repair' }, { label: 'AC Installation', href: '/hvac/ac-installation' }] } },
    howItWorks('Getting the Right Professional Is Easy', 'Request Service'),
    {
      type: 'contentBlock',
      data: {
        label: '', heading: 'Show Us the Problem', imagePosition: 'none', image: '', imageAlt: '',
        content: doc(para('Upload photos of your water heater, pipes, AC unit, thermostat or other equipment. Photos can help a professional understand your request before the appointment.')),
        button: btn('Upload Photos & Request Service', REQUEST),
      },
    },
    { type: 'cta', data: { heading: 'Need Plumbing or HVAC Help Now?', text: 'For urgent plumbing or HVAC problems, submit your service request and tell us how quickly you need help.', buttons: [btn('Get Emergency Help', REQUEST)], tone: 'dark' } },
    {
      type: 'contentBlock',
      data: {
        label: 'Residential', heading: 'Plumbing & HVAC Services for Your Home', imagePosition: 'none', image: '', imageAlt: '',
        content: doc(para('From everyday plumbing fixes to water heater replacement and AC repair, find local professionals for the services your home needs.')),
        button: btn('Find Home Service', REQUEST),
      },
    },
    {
      type: 'contentBlock',
      data: {
        label: 'Commercial', heading: 'Commercial Plumbing & HVAC Services', imagePosition: 'none', image: '', imageAlt: '',
        content: doc(para('Help keep your business, property or facility running with local professionals for commercial plumbing and HVAC repairs, replacements, installations and service needs.')),
        button: btn('Request Commercial Service', REQUEST),
      },
    },
    {
      type: 'featureCards',
      data: {
        heading: 'A Better Way to Find Plumbing & HVAC Help', intro: '',
        cards: ['Local Options', 'Easy Service Requests', 'Photo Uploads', 'Convenient Scheduling', 'Residential & Commercial Support', 'Clear Professional Profiles'].map((title) => ({ title, text: '', href: '', image: '' })),
      },
    },
    {
      type: 'featureCards',
      data: {
        heading: 'Serving Denver & Boulder', intro: '',
        cards: [
          { title: 'Denver', text: 'Find plumbing and HVAC professionals serving homes and businesses across Denver.', href: '/denver', image: '' },
          { title: 'Boulder', text: 'Find plumbing and HVAC professionals serving homes and businesses across Boulder.', href: '/boulder', image: '' },
        ],
      },
    },
    { type: 'cta', data: { heading: 'Get More Plumbing & HVAC Customers in Denver & Boulder', text: 'Build your online presence, showcase your services and connect with customers looking for plumbing and HVAC professionals.', buttons: [btn('Join as a Professional', '/join-us')], tone: 'light' } },
    { type: 'cta', data: { heading: 'Need a Plumbing or HVAC Professional?', text: 'Tell us what you need and find a local professional serving Denver or Boulder.', buttons: [btn('REQUEST SERVICE', REQUEST)], tone: 'dark' } },
  ],
}

// ---- template the client can duplicate ----------------------------------------
const template: SeedPage = {
  path: 'service-page-template',
  title: 'Service page template',
  description: 'Starting point for a new service page. Duplicate it, then change the text, buttons and links.',
  isTemplate: true,
  noindex: true,
  sections: [
    { type: 'hero', data: { eyebrow: 'Serving Denver, CO, and Boulder, CO.', heading: 'Service Name in Denver & Boulder', subtitle: 'One or two sentences saying what this service is and who it is for.', intro: '', image: '', buttons: [btn('Request Service', REQUEST)], align: 'left' } },
    { type: 'contentBlock', data: { label: '', heading: 'About this service', imagePosition: 'none', image: '', imageAlt: '', content: doc(para('Describe the service, common problems and when to call a professional.')), button: btn('Request Service', REQUEST) } },
    howItWorks('How to Request Service', 'Request Service'),
    { type: 'faq', data: { heading: 'Frequently Asked Questions', items: [{ question: 'Replace this with a real question?', answer: 'Replace this with a real answer.' }] } },
    { type: 'cta', data: { heading: 'Need a Plumbing or HVAC Professional?', text: 'Tell us what you need and find a local professional serving Denver or Boulder.', buttons: [btn('Request Service', REQUEST)], tone: 'dark' } },
  ],
}

export const seedPages: SeedPage[] = [
  home,
  plumbing,
  starterServicePage('plumbing/plumbing-repair', 'Plumbing Repair Services in Denver & Boulder', 'Find local professionals for plumbing repairs in Denver and Boulder, Colorado. Describe the problem, add photos and request service.', 'Plumbing Repair'),
  waterHeater,
  starterServicePage('plumbing/frozen-pipe-repair', 'Frozen Pipe Repair in Denver & Boulder', 'Find local professionals for frozen pipe repair in Denver and Boulder, Colorado. Describe the problem, add photos and request service.', 'Frozen Pipe Repair'),
  hvac,
  starterServicePage('hvac/ac-repair', 'AC Repair Services in Denver & Boulder', 'Find local professionals for AC repair in Denver and Boulder, Colorado. Describe the problem, add photos and request service.', 'AC Repair'),
  starterServicePage('hvac/ac-installation', 'AC Installation in Denver & Boulder', 'Find local professionals for AC installation in Denver and Boulder, Colorado. Tell us about your home or business and request service.', 'AC Installation'),
  locationPage('Denver', SERVICE_LINKS_DENVER),
  locationPage('Boulder', SERVICE_LINKS_BOULDER),
  template,
]
