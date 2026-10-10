/**
 * Pages beyond the five the client wrote copy for: the rest of the sitemap in
 * the website-structure document (service pages, commercial, directory,
 * contractors, resources) and the service + city landing pages.
 *
 * Copy here is general and factual, written so the client can edit it. It makes
 * no claims about specific businesses, prices, response times, licences or
 * reviews. Everything is noindex until the client has read it, and the
 * service + city pages are drafts (the document says to publish those only
 * for genuine coverage).
 */
import type { SeedPage, SeedSection } from './pages.ts'

type Node = Record<string, unknown>
const t = (text: string): Node => ({ type: 'text', text })
const para = (text: string): Node => ({ type: 'paragraph', content: [t(text)] })
const bullets = (items: string[]): Node => ({ type: 'bulletList', content: items.map((i) => ({ type: 'listItem', content: [para(i)] })) })
const doc = (...content: Node[]) => ({ type: 'doc', content })
const REQUEST = '/book-service'
const btn = (label: string, href: string, variant: 'primary' | 'secondary' = 'primary') => ({ label, href, variant })
const EYEBROW = 'Serving Denver, CO, and Boulder, CO.'

const hero = (heading: string, subtitle: string, buttons = [btn('Request Service', REQUEST)], eyebrow = EYEBROW): SeedSection => ({
  type: 'hero', data: { eyebrow, heading, subtitle, intro: '', image: '', buttons, align: 'left' },
})
const cta = (heading = 'Need a Plumbing or HVAC Professional?', text = 'Tell us what you need and find a local professional serving Denver or Boulder.', label = 'Request Service', href = REQUEST): SeedSection => ({
  type: 'cta', data: { heading, text, buttons: [btn(label, href)], tone: 'dark' },
})
const steps = (heading = 'How to Request Service'): SeedSection => ({
  type: 'steps',
  data: {
    heading, intro: '',
    steps: [
      { title: 'Tell Us What You Need', text: 'Select a service and describe the problem.' },
      { title: 'Share the Details', text: 'Add your location, preferred appointment time and photos of the issue.' },
      { title: 'Find a Local Pro', text: 'We match your request with professionals serving Denver or Boulder.' },
      { title: 'Schedule Service', text: 'Connect with the professional and arrange the appointment.' },
    ],
    buttons: [btn('Request Service', REQUEST)],
  },
})
const block = (label: string, heading: string, content: Node, button: ReturnType<typeof btn> | null = null): SeedSection => ({
  type: 'contentBlock', data: { label, heading, imagePosition: 'none', image: '', imageAlt: '', content, button },
})
const faq = (items: [string, string][], heading = 'Frequently Asked Questions'): SeedSection => ({
  type: 'faq', data: { heading, items: items.map(([question, answer]) => ({ question, answer })) },
})
const cards = (heading: string, intro: string, items: [string, string, string][]): SeedSection => ({
  type: 'featureCards', data: { heading, intro, cards: items.map(([title, text, href]) => ({ title, text, href, image: '' })) },
})
const links = (heading: string, items: [string, string][]): SeedSection => ({
  type: 'linkList', data: { heading, links: items.map(([label, href]) => ({ label, href })) },
})

// ---------------------------------------------------------------- service pages
interface Service {
  path: string
  title: string
  name: string
  seoTitle: string
  intro: string
  overview: string[]
  problems: string[]
  include: string[]
  faqs: [string, string][]
  trade: 'plumbing' | 'hvac'
}

const SERVICES: Service[] = [
  {
    path: 'plumbing/plumbing-repair', trade: 'plumbing', name: 'Plumbing Repair',
    title: 'Plumbing Repair Services in Denver & Boulder', seoTitle: 'Plumbing Repair Services in Denver & Boulder',
    intro: 'Find local professionals for plumbing repairs in Denver and Boulder, Colorado. Describe the problem, add photos and request service.',
    overview: [
      'A dripping faucet, a slow drain or a leak under the sink is easier to fix when it is caught early. Tell us what is happening and we will help you find a local plumbing professional serving Denver or Boulder.',
      'Photos help. A picture of the fixture, pipe or shutoff valve lets a professional understand the job before the appointment.',
    ],
    problems: ['Leaking pipes, joints or fittings', 'Dripping or low-pressure faucets', 'Slow or clogged drains', 'Running or leaking toilets', 'Low water pressure', 'Noisy pipes or valves that will not close'],
    include: ['What is leaking, dripping or not working, and where', 'Whether water is still running and the shutoff valve is closed', 'Photos of the fixture, pipe or area', 'Your address and ZIP code, and when you are available'],
    faqs: [
      ['What should I do if a pipe is leaking right now?', 'If you can, close the nearest shutoff valve or the main water shutoff, move belongings away from the water and then submit a request with photos. If water is near electrical outlets or appliances, keep away from them.'],
      ['Can I request service for more than one problem?', 'Yes. Describe each problem in your request so the professional can plan the visit.'],
      ['Do you serve both Denver and Boulder?', 'Yes. You can request plumbing repair for homes and businesses in Denver and Boulder.'],
    ],
  },
  {
    path: 'plumbing/water-heater-replacement', trade: 'plumbing', name: 'Water Heater Replacement',
    title: 'Water Heater Replacement in Denver & Boulder', seoTitle: 'Water Heater Replacement in Denver & Boulder',
    intro: 'Find local professionals for water heater replacement in Denver and Boulder, Colorado. Tell us about your current water heater and request service.',
    overview: [
      'Replacing a water heater is a good time to think about the size, fuel type and tank or tankless options that suit your home or business.',
      'Share the age and type of your current unit, a photo of its label if you can, and what is going wrong. Professionals can then explain the options.',
    ],
    problems: ['A tank that leaks from the body', 'Rusty or discoloured hot water', 'Not enough hot water for the household', 'Frequent repairs on an older unit', 'Planning a move to a tankless system', 'Replacing a unit at a rental or commercial property'],
    include: ['Gas or electric, tank or tankless, if you know', 'Approximate age and size, or a photo of the label', 'Where the unit is installed', 'Whether it is leaking right now'],
    faqs: [
      ['How do I know whether to repair or replace?', 'A leaking tank, repeated repairs or an older unit that no longer keeps up are common reasons to consider replacement. A professional can assess the unit and explain the options. See our water heater repair page for more.'],
      ['Should I choose a tank or a tankless water heater?', 'It depends on your household, space, fuel and budget. Ask the professional to explain the differences for your property.'],
      ['Is a leaking water heater an emergency?', 'It can be. If water is coming from the tank, turn off the water supply to the unit and the power or gas if you can do so safely, then request service.'],
    ],
  },
  {
    path: 'plumbing/frozen-pipe-repair', trade: 'plumbing', name: 'Frozen Pipe Repair',
    title: 'Frozen Pipe Repair in Denver & Boulder', seoTitle: 'Frozen Pipe Repair in Denver & Boulder',
    intro: 'Find local professionals for frozen pipe repair in Denver and Boulder, Colorado. Describe the problem, add photos and request service.',
    overview: [
      'Cold Colorado nights can freeze pipes in exterior walls, crawl spaces, garages and unheated rooms. A frozen pipe can split, so it is worth acting early.',
      'If a tap gives no water in cold weather, or you see frost on a pipe, tell us what you see and we will help you find a local professional.',
    ],
    problems: ['No water or a trickle from one or more taps', 'Frost or bulging on exposed pipes', 'A pipe that has split or is leaking after a thaw', 'Pipes in a crawl space, garage or outside wall', 'A frozen outdoor tap or supply line', 'Water stains after a freeze'],
    include: ['Which taps or areas have no water', 'Where the pipes run (outside wall, crawl space, garage)', 'Whether any pipe is leaking or split', 'Photos of the pipe and the area'],
    faqs: [
      ['What should I do if I think a pipe is frozen?', 'Keep the tap open, and if you can find the main shutoff valve, know where it is in case a pipe splits. Do not use an open flame to thaw a pipe. Request service and describe what you see.'],
      ['What if a pipe has already burst?', 'Close the main water shutoff, turn off the power if water is near electrical equipment and request service right away. Choose the Emergency option on the request form.'],
      ['How can I help prevent frozen pipes?', 'Keep the heat on, let a tap drip during very cold nights, open cabinet doors on exterior walls and disconnect outdoor hoses. See our guide to what to do when a pipe freezes.'],
    ],
  },
  {
    path: 'plumbing/plumbing-fixes', trade: 'plumbing', name: 'Plumbing Fixes',
    title: 'Local Plumbing Fixes for Homes & Businesses in Denver & Boulder', seoTitle: 'Local Plumbing Fixes in Denver & Boulder',
    intro: 'Everyday plumbing fixes for homes and businesses in Denver and Boulder. Describe the job, add photos and request service.',
    overview: [
      'Not every plumbing job is an emergency. Fixture repairs, small replacements and tune-ups are easy to get done when you can pick a time that suits you.',
      'Tell us what needs fixing and when you are free, and we will help you find a local professional.',
    ],
    problems: ['Faucet and showerhead repair or replacement', 'Toilet repairs and replacements', 'Garbage disposal problems', 'Supply lines and shutoff valves', 'Sink and drain fittings', 'Small repairs for rental and commercial properties'],
    include: ['The fixture and what it does or does not do', 'Make and model if you know it', 'Photos of the fixture and what is underneath it', 'Preferred days and times'],
    faqs: [
      ['Can I book a small job?', 'Yes. Small repairs and fixture replacements are part of everyday plumbing. Describe the job and any parts you have already bought.'],
      ['Can I request several fixes in one visit?', 'Yes. List each one in your request so the professional can plan for them.'],
      ['Do you help with commercial plumbing?', 'Yes. Choose Business on the request form or visit our commercial plumbing page.'],
    ],
  },
  {
    path: 'hvac/ac-repair', trade: 'hvac', name: 'AC Repair',
    title: 'AC Repair Services in Denver & Boulder', seoTitle: 'AC Repair Services in Denver & Boulder',
    intro: 'Find local professionals for AC repair in Denver and Boulder, Colorado. Describe the problem, add photos and request service.',
    overview: [
      'When the air conditioner stops cooling on a hot afternoon, the quickest way forward is to describe what you see and hear and request service.',
      'Photos of the outdoor unit, the thermostat and any error codes can help a professional understand the problem before the visit.',
    ],
    problems: ['The AC runs but the house does not cool', 'The system does not turn on', 'Ice on the indoor coil or refrigerant lines', 'Water leaking near the indoor unit', 'Strange noises or smells', 'The outdoor unit not running'],
    include: ['What the AC is doing or not doing', 'The thermostat display and any error codes', 'Photos of the outdoor and indoor units', 'Age and type of the system, if you know'],
    faqs: [
      ['What can I check before I request AC repair?', 'Check the thermostat settings and batteries, make sure the air filter is not blocked and that the circuit breaker has not tripped. If it still does not work, request service and note what you checked.'],
      ['Is AC repair urgent?', 'You can choose Emergency, Today, Soon or Flexible on the request form so the professional knows how quickly you need help.'],
      ['Should I repair or replace my AC?', 'It depends on age, repair history and efficiency. See our AC replacement page, or ask the professional for a recommendation.'],
    ],
  },
  {
    path: 'hvac/ac-installation', trade: 'hvac', name: 'AC Installation',
    title: 'AC Installation in Denver & Boulder', seoTitle: 'AC Installation in Denver & Boulder',
    intro: 'Find local professionals for AC installation in Denver and Boulder, Colorado. Tell us about your home or business and request service.',
    overview: [
      'A new air conditioner should be sized and installed for your property. Tell us about the building and what you want, and we will help you find a local HVAC professional.',
      'Useful details are the size of the space, your existing heating and ductwork and whether you are adding cooling for the first time.',
    ],
    problems: ['Adding air conditioning to a home without it', 'Installing a new central AC system', 'Adding cooling with a ductless system', 'Installing a system in a new build or addition', 'Upgrading cooling at a business or rental property', 'Getting quotes for a planned project'],
    include: ['Approximate size of the space and number of floors', 'Existing heating and ductwork, if any', 'Photos of where equipment would go', 'Your timeline and whether the property is residential or commercial'],
    faqs: [
      ['How do I choose the right size AC?', 'The right size depends on the building, insulation, windows and layout. A professional should assess the property rather than guess from square footage alone.'],
      ['Can I get more than one quote?', 'You can request service and discuss options with the professional who contacts you.'],
      ['Is AC installation different from replacement?', 'Installation adds a system where there was none. Replacement swaps an existing system. See our AC replacement page.'],
    ],
  },
  {
    path: 'hvac/ac-replacement', trade: 'hvac', name: 'AC Replacement',
    title: 'AC Replacement in Denver & Boulder', seoTitle: 'AC Replacement in Denver & Boulder',
    intro: 'Find local professionals for AC replacement in Denver and Boulder, Colorado. Tell us about your current system and request service.',
    overview: [
      'If your air conditioner is old, failing often or no longer keeps the house comfortable, replacement may be worth considering.',
      'Share the age of the system, what is going wrong and a photo of the nameplate on the outdoor unit if you can.',
    ],
    problems: ['A system that is many years old', 'Repeated breakdowns or growing repair bills', 'Rooms that never cool properly', 'Rising energy bills', 'A system that uses an older refrigerant', 'Planning ahead before the cooling season'],
    include: ['Age and brand of the current system, if known', 'What problems you have had and when', 'Photos of the outdoor unit and its label', 'Preferred timing'],
    faqs: [
      ['When should I replace instead of repair?', 'Age, repair history, efficiency and the cost of the repair all matter. Ask the professional to explain the repair and replacement options side by side.'],
      ['How long does replacement take?', 'It depends on the system and the property. The professional will explain the schedule when you discuss the job.'],
      ['Can I replace only the outdoor unit?', 'Sometimes, but the indoor and outdoor parts need to work together. Ask the professional what is right for your system.'],
    ],
  },
  {
    path: 'hvac/hvac-repair', trade: 'hvac', name: 'HVAC Repair',
    title: 'HVAC Repair Services in Denver & Boulder', seoTitle: 'HVAC Repair Services in Denver & Boulder',
    intro: 'Find local professionals for heating and cooling repair in Denver and Boulder, Colorado. Describe the problem and request service.',
    overview: [
      'Heating and cooling problems are uncomfortable and sometimes unsafe. Tell us what your system is doing and we will help you find a local HVAC professional.',
      'Photos of the equipment, the thermostat and any error codes are very helpful.',
    ],
    problems: ['Furnace that will not start or keeps shutting off', 'Uneven heating or cooling between rooms', 'Weak airflow from vents', 'Thermostat problems', 'Strange noises, smells or short cycling', 'A system that stopped working suddenly'],
    include: ['Heating, cooling or both', 'What the system is doing and since when', 'Thermostat display and any error codes', 'Photos of the equipment'],
    faqs: [
      ['What if I smell gas?', 'If you smell gas, leave the building, avoid switches and flames and call your gas utility or emergency services from outside. Do not rely on an online request for a gas emergency.'],
      ['Do you help with both heating and cooling?', 'Yes. Choose HVAC on the request form and describe the problem.'],
      ['What if the system stops working in extreme weather?', 'Choose Emergency on the request form and tell us how quickly you need help.'],
    ],
  },
  {
    path: 'hvac/hvac-maintenance', trade: 'hvac', name: 'HVAC Maintenance',
    title: 'HVAC Maintenance Services in Denver & Boulder', seoTitle: 'HVAC Maintenance Services in Denver & Boulder',
    intro: 'Find local professionals for heating and cooling maintenance in Denver and Boulder, Colorado. Request a seasonal tune-up.',
    overview: [
      'Regular maintenance helps you find small problems before they become breakdowns. It is easiest to schedule before the heating or cooling season starts.',
      'Tell us about your system and when you are available, and we will help you find a local professional.',
    ],
    problems: ['A seasonal tune-up before summer or winter', 'Filter and airflow checks', 'Cleaning and inspection of equipment', 'A check before buying or renting out a property', 'Ongoing maintenance for a business', 'Questions about how often to service the system'],
    include: ['Type and age of the system, if known', 'The last time it was serviced', 'Whether it covers heating, cooling or both', 'Preferred days and times'],
    faqs: [
      ['How often should HVAC be serviced?', 'Many manufacturers and professionals suggest a check at least once a year. Ask the professional what is right for your equipment.'],
      ['What can I do myself?', 'Replace or clean filters on schedule, keep vents and the outdoor unit clear and keep an eye on the thermostat. Leave anything else to a professional.'],
      ['Can I set up maintenance for a business?', 'Yes. Choose Business on the request form or visit our commercial HVAC page.'],
    ],
  },
]

function servicePage(s: Service): SeedPage {
  const hubPath = s.trade === 'plumbing' ? '/plumbing' : '/hvac'
  const hubName = s.trade === 'plumbing' ? 'Plumbing Services' : 'HVAC & AC Services'
  return {
    path: s.path, title: s.title, description: s.intro, seoTitle: s.seoTitle, seoDescription: s.intro, noindex: true,
    sections: [
      hero(s.title, s.intro),
      block('', `About ${s.name} in Denver & Boulder`, doc(para(s.overview[0]), para(s.overview[1])), btn('Request Service', REQUEST)),
      block('Common reasons to request service', `When to Request ${s.name}`, doc(bullets(s.problems))),
      block('Get a faster, better match', 'What to Include in Your Request', doc(para('The more detail you share, the easier it is for a professional to understand the job:'), bullets(s.include))),
      steps(),
      faq(s.faqs),
      links(`${s.name} in Denver & Boulder`, [[`${s.name} in Denver`, '/denver'], [`${s.name} in Boulder`, '/boulder'], [hubName, hubPath]]),
      cta(),
    ],
  }
}

// ---------------------------------------------------------------- commercial
const commercialHub: SeedPage = {
  path: 'commercial', title: 'Commercial Plumbing & HVAC Services',
  description: 'Help keep your business, property or facility running with local professionals for commercial plumbing and HVAC repairs, replacements, installations and service needs.',
  seoTitle: 'Commercial Plumbing & HVAC Services in Denver & Boulder', seoDescription: 'Local professionals for commercial plumbing and HVAC repairs, replacements, installations and service in Denver and Boulder.', noindex: true,
  sections: [
    hero('Commercial Plumbing & HVAC Help for Your Business', 'Help keep your business, property or facility running with local professionals for commercial plumbing and HVAC repairs, replacements, installations and service needs.', [btn('Request Commercial Service', REQUEST)]),
    cards('Commercial Services', '', [
      ['Commercial Plumbing', 'Repairs, water heaters, fixtures and frozen or leaking pipes for businesses and properties.', '/commercial/plumbing'],
      ['Commercial HVAC', 'Heating and cooling repair, replacement, installation and maintenance for commercial spaces.', '/commercial/hvac'],
    ]),
    block('What to tell us', 'Details That Help', doc(bullets(['Business name and property address', 'Property type', 'Plumbing or HVAC, and the service needed', 'Emergency or routine', 'Equipment or system details', 'Photos or documents', 'Preferred appointment and contact information']))),
    steps('How Commercial Requests Work'),
    cta('Need Commercial Plumbing or HVAC Service?', 'Tell us about your property and what you need.', 'Request Commercial Service'),
  ],
}
const commercialTrade = (trade: 'plumbing' | 'hvac'): SeedPage => {
  const name = trade === 'plumbing' ? 'Plumbing' : 'HVAC'
  const examples = trade === 'plumbing'
    ? ['Leaks and burst or frozen pipes', 'Water heater repair and replacement', 'Restroom fixtures and drains', 'Kitchen and break-room plumbing', 'Shutoff and supply valves', 'Repairs for property managers and landlords']
    : ['Heating and cooling repair', 'AC replacement and installation', 'Rooftop and split systems', 'Seasonal maintenance', 'Thermostat and control problems', 'Comfort complaints in offices, shops and rental units']
  return {
    path: `commercial/${trade}`, title: `Commercial ${name} Services in Denver & Boulder`,
    description: `Find local professionals for commercial ${name.toLowerCase()} in Denver and Boulder, Colorado.`, seoTitle: `Commercial ${name} in Denver & Boulder`, seoDescription: `Find local professionals for commercial ${name.toLowerCase()} repair, replacement, installation and service in Denver and Boulder.`, noindex: true,
    sections: [
      hero(`Commercial ${name} Services in Denver & Boulder`, `Find local professionals for commercial ${name.toLowerCase()} repairs, replacements, installations and service for your business or property.`, [btn('Request Commercial Service', REQUEST)]),
      block('Common requests', `Commercial ${name} Help`, doc(bullets(examples))),
      steps('How Commercial Requests Work'),
      faq([
        ['Can I request service for a building I manage?', 'Yes. Choose Business on the request form and enter the property address and your contact details.'],
        ['Can I upload photos or documents?', 'Yes. Photos and documents help the professional understand the equipment and the problem.'],
        ['How do I say that the problem is urgent?', 'Choose Emergency, Today, Soon or Flexible on the request form.'],
      ]),
      links('Related Pages', [['All Commercial Services', '/commercial'], [trade === 'plumbing' ? 'Plumbing Services' : 'HVAC & AC Services', `/${trade}`], ['Denver', '/denver'], ['Boulder', '/boulder']]),
      cta('Need Commercial Plumbing or HVAC Service?', 'Tell us about your property and what you need.', 'Request Commercial Service'),
    ],
  }
}

// ---------------------------------------------------------------- directory + contractors
const findAPro: SeedPage = {
  path: 'find-a-pro', title: 'Find a Pro', description: 'Find trusted plumbing and HVAC professionals serving Denver and Boulder.',
  seoTitle: 'Find Trusted Plumbing & HVAC Professionals in Denver & Boulder', seoDescription: 'Search for plumbing and HVAC professionals serving Denver and Boulder, or request service and we will match you.', noindex: true,
  sections: [
    hero('Find Trusted Plumbing & HVAC Professionals', 'Search professionals by service and location, review their profiles and connect with companies that serve your area.', [btn('Request Service', REQUEST), btn('Join as a Professional', '/for-contractors', 'secondary')]),
    cards('Browse by Type', '', [
      ['Plumbers', 'Plumbing professionals serving Denver and Boulder.', '/find-a-pro/plumbers'],
      ['HVAC Contractors', 'Heating and cooling professionals serving Denver and Boulder.', '/find-a-pro/hvac-contractors'],
    ]),
    block('Building the directory', 'Professional Profiles Are on the Way', doc(para('We are adding professional profiles with clear business information and service areas. Credentials are shown as verified only after they have actually been checked.'), para('You do not need to wait. Request service now and we will match your request with professionals serving Denver or Boulder.')), btn('Request Service', REQUEST)),
    cta(),
  ],
}
const finderCategory = (slug: 'plumbers' | 'hvac-contractors'): SeedPage => {
  const name = slug === 'plumbers' ? 'Plumbers' : 'HVAC Contractors'
  const trade = slug === 'plumbers' ? 'plumbing' : 'HVAC'
  return {
    path: `find-a-pro/${slug}`, title: `${name} in Denver & Boulder`, description: `Find ${trade} professionals serving Denver and Boulder.`,
    seoTitle: `${name} in Denver & Boulder`, seoDescription: `Find ${trade} professionals serving Denver and Boulder, Colorado.`, noindex: true,
    sections: [
      hero(`${name} in Denver & Boulder`, `Find ${trade} professionals serving Denver and Boulder. Request service and we will match you with a professional who covers your area.`),
      block('Profiles coming soon', 'Professional Profiles Are Being Added', doc(para(`Listings for ${name.toLowerCase()} will appear here as profiles are added and checked. Credentials are shown as verified only after they have been verified.`), para(`Are you a ${trade} professional serving Denver or Boulder? Create your profile and start receiving requests.`)), btn('Join as a Professional', '/for-contractors')),
      links('Related Pages', [['Find a Pro', '/find-a-pro'], [trade === 'plumbing' ? 'Plumbing Services' : 'HVAC & AC Services', `/${slug === 'plumbers' ? 'plumbing' : 'hvac'}`], ['Denver', '/denver'], ['Boulder', '/boulder']]),
      cta(),
    ],
  }
}
const forContractors: SeedPage = {
  path: 'for-contractors', title: 'For Contractors', description: 'Build a professional online presence and connect with customers looking for plumbing and HVAC services in Denver and Boulder.',
  seoTitle: 'Grow Your Plumbing or HVAC Business in Denver & Boulder', seoDescription: 'Create a professional profile, showcase your services and connect with customers looking for plumbing and HVAC help in Denver and Boulder.', noindex: true,
  sections: [
    hero('Grow Your Plumbing or HVAC Business in Denver & Boulder', 'Build a professional online presence and connect with customers actively looking for plumbing and HVAC services.', [btn('Create Your Professional Profile', '/join-us'), btn('Talk to Us About Leads', '/contact', 'secondary')], 'For plumbing & HVAC professionals'),
    cards('What You Get', '', ['Create Your Professional Profile', 'Showcase Your Services', 'Promote Your Service Areas', 'Display Verified Credentials', 'Receive Customer Leads', 'Manage Leads and Service Requests', 'Collect Customer Reviews', 'Track Profile and Lead Performance'].map((x) => [x, '', ''] as [string, string, string])),
    { type: 'steps', data: { heading: 'How to Join', intro: '', steps: [
      { title: 'Apply', text: 'Tell us about your company, services and the areas you serve.' },
      { title: 'Share Your Credentials', text: 'Provide licence and insurance details so they can be checked.' },
      { title: 'Set Up Your Profile', text: 'Add your services, service areas and project photos.' },
      { title: 'Receive Requests', text: 'Customers in Denver and Boulder can find you and send requests.' },
    ], buttons: [btn('Create Your Professional Profile', '/join-us')] } },
    cta('Ready to Reach More Customers?', 'Join as a plumbing or HVAC professional serving Denver or Boulder.', 'Create Your Professional Profile', '/join-us'),
  ],
}

// ---------------------------------------------------------------- resources
interface Guide { slug: string; title: string; intro: string; sections: [string, Node][]; related: [string, string] }
const GUIDES: Guide[] = [
  {
    slug: 'what-to-do-when-a-pipe-freezes', title: 'What to Do When a Pipe Freezes',
    intro: 'A frozen pipe can split when the ice thaws or expands. These steps help you limit the damage while you get help.',
    sections: [
      ['Signs of a frozen pipe', doc(bullets(['No water, or only a trickle, from a tap in cold weather', 'Frost on exposed pipe', 'A pipe that looks bulged or cracked', 'Strange smells from a drain or tap']))],
      ['What to do first', doc(bullets(['Open the affected tap so water can flow as the ice melts', 'Find your main water shutoff valve so you can close it quickly if a pipe splits', 'Warm the area with the heating on and cabinet doors open', 'Never use an open flame to thaw a pipe']))],
      ['If a pipe has split', doc(para('Close the main water shutoff, turn off power if water is near electrical equipment or outlets, move belongings out of the water\'s path and request emergency service.'))],
      ['Prevent it next time', doc(bullets(['Keep the heat on during cold spells', 'Let a tap drip on very cold nights', 'Insulate pipes in garages, crawl spaces and exterior walls', 'Disconnect and drain outdoor hoses']))],
    ],
    related: ['Frozen Pipe Repair', '/plumbing/frozen-pipe-repair'],
  },
  {
    slug: 'when-to-repair-or-replace-a-water-heater', title: 'When to Repair or Replace a Water Heater',
    intro: 'Not every water heater problem means a new unit. Here is what to think about when you decide.',
    sections: [
      ['Signs repair may be enough', doc(bullets(['The unit is fairly new', 'The problem is a single part, such as a thermostat or valve', 'There are no leaks from the tank body']))],
      ['Signs to consider replacement', doc(bullets(['Water leaking from the tank itself', 'Rusty or discoloured hot water', 'Repeated repairs', 'An older unit that no longer keeps up', 'Rising energy bills']))],
      ['Questions to ask the professional', doc(bullets(['What is wrong and what does the repair cost?', 'How does that compare with replacement?', 'Would a different size or type suit us better?', 'What is covered by any warranty?']))],
    ],
    related: ['Water Heater Repair', '/plumbing/water-heater-repair'],
  },
  {
    slug: 'signs-your-ac-needs-repair', title: 'Signs Your AC Needs Repair',
    intro: 'Catching AC problems early can save a hot afternoon. Watch for these signs.',
    sections: [
      ['Common warning signs', doc(bullets(['Weak airflow from the vents', 'Warm air when the system should be cooling', 'Ice on the coil or refrigerant lines', 'Water around the indoor unit', 'Strange noises, smells or frequent cycling on and off', 'Higher energy bills with no change in use']))],
      ['Quick checks before you call', doc(bullets(['Check the thermostat settings and batteries', 'Replace or clean a dirty air filter', 'Check that the breaker has not tripped', 'Keep the outdoor unit clear of leaves and debris']))],
      ['When to request service', doc(para('If the checks do not help, or you see ice, water or hear grinding or banging noises, switch the system off and request service. Photos of the unit and the thermostat help.'))],
    ],
    related: ['AC Repair', '/hvac/ac-repair'],
  },
  {
    slug: 'ac-repair-vs-replacement', title: 'AC Repair vs. Replacement',
    intro: 'Should you fix your air conditioner or put in a new one? These points can help you weigh it up.',
    sections: [
      ['Things that favour repair', doc(bullets(['A newer system', 'A single, well-understood fault', 'A system that has been reliable until now']))],
      ['Things that favour replacement', doc(bullets(['An older system with frequent breakdowns', 'Repair costs that are a large share of a new system', 'Rooms that never cool properly', 'Rising energy bills']))],
      ['Ask for both options', doc(para('Ask the professional to explain the repair and the replacement side by side, including what each would involve and what is covered by any warranty.'))],
    ],
    related: ['AC Replacement', '/hvac/ac-replacement'],
  },
  {
    slug: 'hvac-maintenance-checklist', title: 'HVAC Maintenance Checklist',
    intro: 'A few simple habits keep your heating and cooling running more reliably.',
    sections: [
      ['What you can do', doc(bullets(['Replace or clean filters on the schedule in your manual', 'Keep vents and registers clear of furniture and rugs', 'Keep the outdoor unit clear of leaves, snow and debris', 'Check thermostat settings and batteries each season']))],
      ['What to leave to a professional', doc(bullets(['Cleaning and inspecting coils, burners and blowers', 'Electrical and refrigerant checks', 'Combustion and safety checks on heating equipment']))],
      ['When to schedule', doc(para('Many people book a tune-up in spring for cooling and in autumn for heating, before the busy season starts.'))],
    ],
    related: ['HVAC Maintenance', '/hvac/hvac-maintenance'],
  },
]
const guidePage = (g: Guide): SeedPage => ({
  path: `resources/${g.slug}`, title: g.title, description: g.intro, seoTitle: `${g.title} | Denver & Boulder`, seoDescription: g.intro, noindex: true,
  sections: [
    hero(g.title, g.intro, [btn('Request Service', REQUEST)], 'Helpful guide'),
    ...g.sections.map(([heading, content]) => block('', heading, content)),
    links('Related', [[g.related[0], g.related[1]], ['All Resources', '/resources']]),
    cta(),
  ],
})
const resources: SeedPage = {
  path: 'resources', title: 'Resources', description: 'Helpful plumbing and HVAC resources for homeowners and businesses in Denver and Boulder.',
  seoTitle: 'Helpful Plumbing & HVAC Resources | Denver & Boulder', seoDescription: 'Guides on frozen pipes, water heaters, AC repair and replacement and HVAC maintenance for Denver and Boulder.', noindex: true,
  sections: [
    hero('Helpful Plumbing & HVAC Resources', 'Practical guides to help you understand common plumbing and HVAC problems and decide what to do next.', [btn('Request Service', REQUEST)], ''),
    cards('Guides', '', GUIDES.map((g) => [g.title, g.intro, `/resources/${g.slug}`] as [string, string, string])),
    cta(),
  ],
}

// ---------------------------------------------------------------- service + city pages (drafts)
const CITY_NOTES: Record<string, Record<string, string>> = {
  Denver: {
    freeze: 'Denver winters bring cold snaps and wide temperature swings, which can stress pipes in garages, crawl spaces and exterior walls.',
    heat: 'Denver summers can be hot and dry, and a working air conditioner makes a real difference on the warmest afternoons.',
    general: 'Denver has a mix of older and newer homes and a large number of commercial properties, so plumbing and HVAC needs vary widely.',
  },
  Boulder: {
    freeze: 'Boulder winters can be cold, especially in the evenings, and pipes in exterior walls, outbuildings and unheated spaces are most at risk.',
    heat: 'Boulder summers are sunny and warm, and many homes were built without air conditioning, so people often ask about adding or replacing it.',
    general: 'Boulder has a mix of homes, rentals and businesses, and plumbing and HVAC needs vary widely from one property to the next.',
  },
}
interface CitySvc { path: string; name: string; parent: string; parentName: string; note: 'freeze' | 'heat' | 'general'; ask: string }
const CITY_SERVICES: CitySvc[] = [
  { path: 'water/water-heater-repair', name: 'Water Heater Repair', parent: '/plumbing/water-heater-repair', parentName: 'Water Heater Repair', note: 'general', ask: 'Describe what the water heater is doing: no hot water, leaks, noises or a pilot or error light.' },
  { path: 'water/water-heater-replacement', name: 'Water Heater Replacement', parent: '/plumbing/water-heater-replacement', parentName: 'Water Heater Replacement', note: 'general', ask: 'Share the age and type of the current unit and what you would like from the new one.' },
  { path: 'frozen/frozen-pipe-repair', name: 'Frozen Pipe Repair', parent: '/plumbing/frozen-pipe-repair', parentName: 'Frozen Pipe Repair', note: 'freeze', ask: 'Tell us which taps have no water and where the pipes run.' },
  { path: 'plumbing/plumbing-repair', name: 'Plumbing Repair', parent: '/plumbing/plumbing-repair', parentName: 'Plumbing Repair', note: 'general', ask: 'Describe the leak, drip or blockage and add photos if you can.' },
  { path: 'ac/ac-repair', name: 'AC Repair', parent: '/hvac/ac-repair', parentName: 'AC Repair', note: 'heat', ask: 'Tell us what the AC is doing and add photos of the unit and thermostat.' },
  { path: 'ac/ac-installation', name: 'AC Installation', parent: '/hvac/ac-installation', parentName: 'AC Installation', note: 'heat', ask: 'Tell us about the size of the space and any existing heating or ductwork.' },
  { path: 'hvac/hvac-repair', name: 'HVAC Repair', parent: '/hvac/hvac-repair', parentName: 'HVAC Repair', note: 'general', ask: 'Tell us whether it is heating or cooling and what the system is doing.' },
]
function cityPage(s: CitySvc, city: 'Denver' | 'Boulder'): SeedPage {
  const c = city.toLowerCase()
  const title = `${s.name} in ${city}`
  const intro = `Find local professionals for ${s.name.toLowerCase()} in ${city}, Colorado. Describe the problem, add photos and request service.`
  return {
    path: `${s.path}/${c}`, title, description: intro, seoTitle: `${title}, CO`, seoDescription: intro, noindex: true, draft: true,
    sections: [
      hero(`${title}, Colorado`, intro, [btn('Request Service', REQUEST)], `Serving ${city}, CO.`),
      block(`${s.name} for ${city} homes and businesses`, `Request ${s.name} in ${city}`, doc(para(CITY_NOTES[city][s.note]), para(s.ask), para(`Request service and we will match you with professionals serving ${city}.`)), btn('Request Service', REQUEST)),
      steps(),
      links('Related Pages', [[`${s.parentName} in Denver & Boulder`, s.parent], [`Services in ${city}`, `/${c}`]]),
      cta('Need a Plumbing or HVAC Professional?', `Tell us what you need and find a local professional serving ${city}.`),
    ],
  }
}

// ---------------------------------------------------------------- company pages
const about: SeedPage = {
  path: 'about', title: 'About', description: 'PipeFlow helps homeowners and businesses in Denver and Boulder find qualified local plumbing and HVAC professionals.',
  seoTitle: 'About PipeFlow | Plumbing & HVAC Professionals in Denver & Boulder', seoDescription: 'PipeFlow helps homeowners and businesses in Denver and Boulder find qualified local plumbing and HVAC professionals.', noindex: true,
  sections: [
    hero('A Better Way to Find Plumbing & HVAC Help', 'PipeFlow is a local platform that helps homeowners and businesses in Denver and Boulder find qualified plumbing and HVAC professionals.', [btn('Request Service', REQUEST), btn('Join as a Professional', '/for-contractors', 'secondary')], 'About PipeFlow'),
    block('What we do', 'Tell Us What You Need. We Help You Find the Right Pro.', doc(para('Customers describe the problem, add photos and choose a time. We match each request with professionals serving Denver or Boulder, so you can arrange the appointment with confidence.'), para('For plumbing and HVAC companies, PipeFlow is a way to build an online presence and connect with customers who are looking for help.'))),
    cards('How we work', '', [
      ['Local first', 'We focus on Denver and Boulder, and add new areas only when we can serve them.', ''],
      ['Clear information', 'Professionals are shown with clear business information and service areas.', ''],
      ['Credentials checked first', 'We show a credential as verified only after it has actually been checked.', ''],
      ['Real reviews only', 'We show authentic reviews from customers, never invented ones.', ''],
    ]),
    cta(),
  ],
}
const contact: SeedPage = {
  path: 'contact', title: 'Contact', description: 'Contact PipeFlow about plumbing and HVAC service in Denver and Boulder.',
  seoTitle: 'Contact PipeFlow | Denver & Boulder', seoDescription: 'Request plumbing or HVAC service in Denver or Boulder, or get in touch with the PipeFlow team.', noindex: true,
  sections: [
    hero('Contact PipeFlow', 'The fastest way to get help is to send a service request. For anything else, use the details below.', [btn('Request Service', REQUEST)], 'Denver & Boulder'),
    { type: 'contactInfo', data: { heading: 'Get in touch', phone: '', email: '', address: '', hours: '' } },
    cta('Looking for Plumbing or HVAC Help?', 'Tell us what you need and find a local professional serving Denver or Boulder.'),
  ],
}
const legalDraft = (path: string, title: string): SeedPage => ({
  path, title, description: `${title} for PipeFlow.`, seoTitle: `${title} | PipeFlow`, seoDescription: `${title} for PipeFlow.`, noindex: true, draft: true,
  sections: [
    hero(title, 'DRAFT. Replace this page with your own policy, reviewed by a lawyer, before publishing.', [], ''),
    block('', `${title} goes here`, doc(para('This page is a placeholder and is not published. Write or paste the policy that applies to your business, have it reviewed, then publish the page and add a link to it in Admin > Navigation.'))),
  ],
})

export const serviceSeedPages: SeedPage[] = SERVICES.map(servicePage)
export const extraSeedPages: SeedPage[] = [
  commercialHub, commercialTrade('plumbing'), commercialTrade('hvac'),
  findAPro, finderCategory('plumbers'), finderCategory('hvac-contractors'),
  forContractors, resources, about, contact, legalDraft('privacy', 'Privacy Policy'), legalDraft('terms', 'Terms of Service'), ...GUIDES.map(guidePage),
  ...CITY_SERVICES.flatMap((s) => (['Denver', 'Boulder'] as const).map((c) => cityPage(s, c))),
]
