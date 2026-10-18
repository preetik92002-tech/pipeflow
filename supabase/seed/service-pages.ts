/**
 * Plumbing and HVAC service pages (two category pages, individual service pages) from the client's
 * content document. No imports on purpose, so scripts/generate-seed-sql.ts can run it with plain Node.
 *
 * Every page is seeded as a DRAFT: nothing goes live until an admin previews and publishes it.
 * Regenerate the migration after editing:  npm run seed:sql
 */

export interface ServiceSeedPage {
  path: string
  title: string
  description: string
  seoTitle: string
  seoDescription: string
  type: 'serviceCategory' | 'serviceDetail'
  data: Record<string, unknown>
}

const DISCLOSURE = 'Submitting a request does not guarantee immediate service or availability of a provider. Service coverage, pricing, scheduling and terms vary by location, service type and provider.'

type Kind = 'text' | 'list' | 'steps' | 'cards' | 'table' | 'notice' | 'accordion'
const blk = (kind: Kind, heading: string, rest: Record<string, unknown> = {}) => ({
  kind, heading, intro: '', text: '', items: [] as string[], cards: [], columns: [] as string[], rows: [] as string[][], tone: 'info', ...rest,
})
const faq = (question: string, answer: string) => ({ question, answer })
const link = (label: string, href: string) => ({ label, href })

const home = link('Home', '/')
const PLUMBING = link('Plumbing Services', '/plumbing-services')
const HVAC = link('HVAC Services', '/hvac-services')
const DENVER = link('Denver', '/denver')
const BOULDER = link('Boulder', '/boulder')
const WH_REPAIR = link('Water Heater Repair', '/water-heater-repair')
const WH_INSTALL = link('Water Heater Installation & Replacement', '/water-heater-installation-replacement')
const FROZEN = link('Frozen Pipe Repair', '/frozen-pipe-repair')
const AC_SERVICES = link('AC Services', '/ac-services')
const AC_INSTALL = link('AC Installation', '/ac-installation')
const HEATING = link('Heating Installation', '/heating-installation')

const base = {
  guidanceHeading: '', faqHeading: 'Frequently asked questions', relatedHeading: 'Related services and areas', disclosure: DISCLOSURE,
}

// ------------------------------------------------------------------ 1. Plumbing Services
const plumbingServices: ServiceSeedPage = {
  path: 'plumbing-services',
  title: 'Plumbing Services',
  description: 'Explore plumbing services for homes and businesses in Denver and Boulder, including water heater repair, replacement, and frozen pipe help.',
  seoTitle: 'Plumbing Services for Homes & Businesses in Denver & Boulder | PipeFlowCo',
  seoDescription: 'Explore plumbing services for homes and businesses in Denver and Boulder, including water heater repair, replacement, and frozen pipe help. Request service today.',
  type: 'serviceCategory',
  data: {
    ...base,
    serviceCategory: 'plumbing', formService: 'plumbing:water-heater-repair',
    breadcrumbs: [home, link('Plumbing Services', '/plumbing-services')],
    heading: 'Plumbing Services for Homes and Businesses',
    intro: "Plumbing problems tend to show up at the worst times: a cold shower in the morning, a stain on the ceiling, a pipe that stops running during a cold snap. PipeFlowCo helps homeowners, property managers, and business owners in Denver, Boulder, and surrounding Colorado communities explore plumbing services and send a request where service coverage is available.",
    ctaLabel: 'Request Service', illustration: 'pipes', illustrationAlt: '',
    mainHeading: 'Plumbing Services You Can Explore',
    cards: [
      { title: 'Water Heater Repair', text: 'No hot water, lukewarm water, noises, or moisture around the tank? Our guide explains common symptoms and causes, and when a repair may be worth considering.', href: '/water-heater-repair', illustration: 'water-heater', illustrationAlt: '' },
      { title: 'Water Heater Installation & Replacement', text: 'Planning for an aging unit, a new build, or a switch from tank to tankless? Learn how capacity, fuel type, efficiency, and installation requirements affect your choice.', href: '/water-heater-installation-replacement', illustration: 'water-heater', illustrationAlt: '' },
      { title: 'Frozen Pipe Repair and Prevention', text: 'Colorado winters can be hard on exposed pipes. Learn the warning signs, safe first steps, and ways to reduce your risk.', href: '/frozen-pipe-repair', illustration: 'frozen-pipe', illustrationAlt: '' },
    ],
    mainBlocks: [],
    guidanceHeading: 'Plumbing guidance and how to request service',
    guidanceBlocks: [
      blk('cards', 'Residential and Commercial Plumbing Inquiries', {
        cards: [
          { title: 'For homeowners', text: "Whether you live in a historic Denver bungalow, a Boulder townhome, or a newer suburban house, plumbing needs vary with the age of the home, its materials, and its layout. When you send a request, describe what you're seeing and where in the house it's happening." },
          { title: 'For businesses and property managers', text: 'Offices, restaurants, retail spaces, and multifamily buildings often have larger systems, shared utilities, and tighter schedules. Tell us the property type, the size of the space, and whether the issue affects tenants or customers. Service for commercial properties depends on provider availability and scope.' },
        ],
      }),
      blk('steps', 'How to Request Plumbing Service', {
        items: ['Choose the service closest to your problem.', 'Add your ZIP code and whether the property is residential or commercial.', "Describe what's happening, including any leaks, noises, or temperature issues.", "Submit the request. We'll follow up about availability and next steps."],
      }),
      blk('notice', 'When to Act Quickly', {
        tone: 'safety',
        items: [
          '**Active flooding or a burst pipe:** Shut off your main water valve if you can do so safely.',
          "**Water near electrical panels or outlets:** Stay away. Turn off power at the main breaker only if you can reach it without standing in water. Call 911 if you're unsure.",
          '**Gas smell:** Leave the building and call your gas utility or 911 from outside.',
        ],
      }),
      blk('notice', 'A website request form is not an emergency line.', { tone: 'safety' }),
    ],
    faqHeading: 'Plumbing Services FAQs',
    faqs: [
      faq('What plumbing services can I explore on PipeFlowCo?', 'Currently, water heater repair, water heater installation and replacement, and frozen pipe repair and prevention.'),
      faq('Can I request service for a business?', "Yes. Select 'Commercial' in the form and describe the property and the issue."),
      faq('Which areas are covered?', "We focus on Denver and Boulder. Enter your ZIP code and we'll confirm coverage."),
      faq('How do I know if I need a repair or a replacement?', 'It depends on the age, condition, and repair history of the equipment. Our water heater pages explain the factors to consider.'),
      faq('Will I get a price when I submit a request?', 'Not automatically. Pricing is discussed when we respond about availability and details.'),
      faq('What should I do while I wait for a response?', 'Follow the safety tips on the relevant service page, and contact emergency services or your utility for gas, flooding, or electrical hazards.'),
    ],
    finalHeading: 'Ready to request plumbing service?',
    finalText: "Tell us what's going on and send your request. We'll follow up about availability and next steps.",
    finalCtaLabel: 'Request Service',
    related: [WH_REPAIR, WH_INSTALL, FROZEN, DENVER, BOULDER, HVAC],
  },
}

// ------------------------------------------------------------------ 2. HVAC Services
const hvacServices: ServiceSeedPage = {
  path: 'hvac-services',
  title: 'HVAC Services',
  description: 'Explore HVAC services for cooling and heating in Denver and Boulder, including AC services, AC installation, and heating installation.',
  seoTitle: 'HVAC Services for Homes & Businesses in Denver & Boulder | PipeFlowCo',
  seoDescription: 'Explore HVAC services for cooling and heating in Denver and Boulder, including AC services, AC installation, and heating installation. Request service today.',
  type: 'serviceCategory',
  data: {
    ...base,
    serviceCategory: 'hvac', formService: 'hvac:ac-repair',
    breadcrumbs: [home, link('HVAC Services', '/hvac-services')],
    heading: 'HVAC Services for Homes and Businesses',
    intro: 'Colorado asks a lot of a heating and cooling system: cold winters, warm and dry summers, and big day-to-night swings, particularly in the foothills. PipeFlowCo helps homeowners, property managers, and business owners in Denver, Boulder, and nearby communities explore HVAC services and send a request where service coverage is available.',
    ctaLabel: 'Request Service', illustration: 'thermostat', illustrationAlt: '',
    mainHeading: 'Cooling and Heating Services',
    cards: [
      { title: 'AC Services', text: 'Not cooling well? Weak airflow, odd noises, or rising bills may point to a problem. Learn what to look for and what to include in your request.', href: '/ac-services', illustration: 'ac-vent', illustrationAlt: '' },
      { title: 'AC Installation', text: 'Planning a new or replacement air conditioner? Learn how sizing, efficiency, and installation planning affect comfort and costs.', href: '/ac-installation', illustration: 'ac-condenser', illustrationAlt: '' },
      { title: 'Heating Installation', text: 'Compare furnace and heating system options, and learn how sizing and installation planning affect performance.', href: '/heating-installation', illustration: 'furnace', illustrationAlt: '' },
    ],
    mainBlocks: [],
    guidanceHeading: 'HVAC guidance and how to request service',
    guidanceBlocks: [
      blk('list', 'What Affects HVAC Performance in Colorado', {
        items: [
          "**Altitude:** At Denver's elevation of roughly 5,280 feet, and Boulder's slightly higher, thinner air affects combustion in gas equipment and may require altitude-specific settings or equipment ratings.",
          '**Dry climate:** Evaporative (swamp) coolers are more common here than in humid regions, but may not suit every property.',
          '**Temperature swings:** Systems must handle cold nights and sunny, warm days, sometimes within hours.',
          '**Building age and construction:** Older homes may have leaky ductwork, poor insulation, or no ducts at all.',
          '**Fire season and air quality:** Wildfire smoke may make filtration a consideration.',
        ],
      }),
      blk('cards', 'Residential and Commercial HVAC', {
        cards: [
          { title: 'Residential', text: 'Single-family homes, townhomes, condos, additions, and finished basements.' },
          { title: 'Commercial', text: 'Offices, retail, restaurants, and multi-tenant buildings, including rooftop units and zoning needs. Describe your property type, size, and current equipment to help us route your inquiry.' },
        ],
      }),
      blk('steps', 'How to Request HVAC Service', {
        items: ['Choose AC Services, AC Installation, or Heating Installation.', 'Enter your ZIP code and property type.', 'Describe the problem or project.', "Submit. We'll follow up about availability and next steps."],
      }),
      blk('notice', 'Safety First', {
        tone: 'safety',
        text: 'Gas furnaces and other combustion appliances can produce carbon monoxide. Install CO detectors on each level and near sleeping areas, and test them regularly. If an alarm sounds, or you smell gas, leave immediately and call 911 or your gas utility.',
      }),
    ],
    faqHeading: 'HVAC Services FAQs',
    faqs: [
      faq('What HVAC services can I explore?', 'AC services, AC installation, and heating installation.'),
      faq('Can I request a heating repair?', "Our current heating focus is installation. Describe your needs in the form and we'll let you know what's available."),
      faq('Do you serve commercial properties?', 'You can submit commercial inquiries. Availability depends on the property and provider.'),
      faq('How often should HVAC systems be serviced?', 'Manufacturers commonly recommend annual maintenance, often in spring for cooling and fall for heating.'),
      faq('How do I choose between a furnace and a heat pump?', 'It depends on climate, existing infrastructure, fuel costs, and efficiency goals. See the heating installation page.'),
      faq('Will I receive a price on this page?', 'No. Pricing depends on your property, equipment, and the provider.'),
    ],
    finalHeading: 'Ready to request HVAC service?',
    finalText: "Choose a service, add your ZIP code and property type, and send your request. We'll follow up about availability and next steps.",
    finalCtaLabel: 'Request Service',
    related: [AC_SERVICES, AC_INSTALL, HEATING, DENVER, BOULDER, PLUMBING],
  },
}

// ------------------------------------------------------------------ 3. Water Heater Repair
const waterHeaterRepair: ServiceSeedPage = {
  path: 'water-heater-repair',
  title: 'Water Heater Repair',
  description: 'No hot water or a leaking tank? Learn common water heater problems, causes, and repair options in Denver and Boulder, then request service.',
  seoTitle: 'Water Heater Repair in Denver & Boulder, CO | PipeFlowCo',
  seoDescription: 'No hot water or a leaking tank? Learn common water heater problems, causes, and repair options in Denver and Boulder, then request service.',
  type: 'serviceDetail',
  data: {
    ...base,
    serviceCategory: 'plumbing', formService: 'plumbing:water-heater-repair',
    breadcrumbs: [home, PLUMBING, link('Water Heater Repair', '/water-heater-repair')],
    heading: 'Water Heater Repair Services in Denver and Boulder',
    intro: 'When your water heater stops working, everyday routines grind to a halt. Showers go cold, dishwashers underperform, and laundry gets harder. This page explains common water heater problems, what may be causing them, and how to send a repair request in Denver, Boulder, and nearby areas where service coverage is available.',
    ctaLabel: 'Request Water Heater Service', illustration: 'water-heater', illustrationAlt: '',
    mainHeading: 'Common Signs Your Water Heater Needs Attention',
    cards: [],
    mainBlocks: [
      blk('list', '', {
        items: ['No hot water at all.', "Water that's lukewarm or runs out quickly.", 'Rumbling, popping, or banging from the tank.', 'Rusty or discolored hot water.', 'Water pooling around the base of the unit.', "A pilot light that won't stay lit on gas models.", 'A tripped breaker or no power to the unit on electric models.', 'Unusual odors from hot water.', 'Error codes or fault lights on tankless units.'],
      }),
      blk('list', 'Possible Causes: Tank Water Heaters', {
        items: [
          '**Sediment buildup:** Minerals settle at the bottom of the tank over time, which can cause noise and reduce efficiency. Moderately hard water in many areas can contribute.',
          '**Failed heating element or thermostat:** On electric units, these can cause little or no hot water.',
          "**Pilot or thermocouple issues:** A pilot that won't stay lit may point to a faulty thermocouple or a gas supply or venting problem.",
          "**Corroded tank:** A leak from the tank body usually means the tank has failed. This generally can't be repaired.",
          '**Faulty temperature and pressure relief valve:** This safety device may drip or discharge when something\'s wrong.',
        ],
      }),
      blk('text', 'Possible Causes: Tankless Water Heaters', {
        text: "Possible causes include mineral scale on the heat exchanger, clogged inlet filters, venting or ignition faults, flow-rate issues or cold-water 'sandwich' effects, and error codes that require manufacturer-specific diagnosis.",
      }),
      blk('table', 'Repair or Replace? Things to Consider', {
        columns: ['Factor', 'May favor repair', 'May favor replacement'],
        rows: [
          ['Age', 'Relatively new unit', "Tank units approaching or past about 10–12 years; check the manufacturer's data"],
          ['Problem type', 'Replaceable part, such as an element, thermostat, or igniter', 'Tank leak or severe corrosion'],
          ['Repair history', 'First or minor issue', 'Repeated repairs'],
          ['Efficiency', 'Unit still performs well', 'Rising energy bills or inconsistent hot water'],
          ['Household needs', 'Needs unchanged', 'Larger household, new fixtures, or capacity too low'],
        ],
        text: 'A qualified provider can assess the specific unit and explain your options.',
      }),
    ],
    guidanceHeading: 'Safety and request guidance',
    guidanceBlocks: [
      blk('notice', 'Safe Steps Before You Request Service', {
        tone: 'safety',
        items: [
          "**Gas models:** If you smell gas, leave the building and call your gas utility or 911. Don't operate switches or lighters.",
          '**Leaks:** Shut off the cold-water supply valve to the heater and, for electric units, turn off the breaker. For gas units, set the gas control to "off" or "pilot" per the manufacturer\'s instructions.',
          "**Hot discharge:** Don't touch the temperature and pressure relief valve or its discharge pipe. Water can be scalding.",
          "**Temperature:** A setting of about 120°F is commonly recommended to reduce scald risk. Don't modify safety devices.",
          "**Electrical and gas work:** Don't open panels or relight gas units if you're unsure. Wiring and gas connections are best handled by qualified professionals.",
        ],
      }),
      blk('cards', 'Residential and Commercial Use Cases', {
        cards: [
          { title: 'Homes', text: 'Tank units in basements, closets, or garages; tankless units mounted on walls; combination systems.' },
          { title: 'Commercial', text: 'Larger-capacity or multiple-unit systems in restaurants, offices, multifamily buildings, and salons, where hot-water demand is high and downtime is disruptive. Describe the equipment type if you know it.' },
        ],
      }),
      blk('steps', 'How to Request Water Heater Repair', {
        items: ['Click Request Service and choose Plumbing, then Water Heater Repair.', 'Enter your ZIP code and property type.', 'Note the fuel type (gas or electric), tank or tankless, brand and approximate age if you know them, and the symptoms.', "Add photos if the form allows; a label photo helps.", "Submit. We'll follow up about availability and next steps."],
      }),
    ],
    faqs: [
      faq('Why is my water heater making popping or rumbling noises?', 'Often sediment at the bottom of a tank. Water trapped beneath sediment can bubble and pop as it heats.'),
      faq('Why do I have hot water for only a few minutes?', "Possible causes include a failed heating element, a broken dip tube, sediment, or a unit that's too small for your household's demand."),
      faq('Is a leaking water heater dangerous?', 'It can cause water damage and, near electrical components, a hazard. Shut off the water supply and power or gas to the unit if safe to do so, and request service.'),
      faq('Can a leaking tank be repaired?', 'A leak from fittings or valves may be repairable. A leak from the tank itself typically means replacement.'),
      faq('How long do water heaters last?', 'Many tank models last around a decade or somewhat longer, depending on water quality, maintenance, and usage. Check the manufacturer\'s documentation.'),
      faq('Do tankless water heaters need maintenance?', 'Generally yes. Periodic descaling and filter cleaning are commonly recommended, especially in hard-water areas.'),
      faq('Will you guarantee same-day repair?', 'No. Availability depends on location, provider schedules, and the problem.'),
    ],
    finalHeading: 'Need a water heater looked at?',
    finalText: "Tell us what's happening with your water heater and send your request. We'll follow up about availability and next steps.",
    finalCtaLabel: 'Request Water Heater Service',
    related: [WH_INSTALL, PLUMBING, FROZEN, DENVER, BOULDER],
  },
}

// ------------------------------------------------------------------ 4. Water Heater Installation & Replacement
const waterHeaterInstall: ServiceSeedPage = {
  path: 'water-heater-installation-replacement',
  title: 'Water Heater Installation & Replacement',
  description: 'Compare tank and tankless water heaters, capacity, and efficiency. Learn what to consider and request a water heater installation estimate.',
  seoTitle: 'Water Heater Installation & Replacement in Denver & Boulder | PipeFlowCo',
  seoDescription: 'Compare tank and tankless water heaters, capacity, and efficiency. Learn what to consider and request a water heater installation estimate.',
  type: 'serviceDetail',
  data: {
    ...base,
    serviceCategory: 'plumbing', formService: 'plumbing:water-heater-replacement',
    breadcrumbs: [home, PLUMBING, link('Water Heater Installation & Replacement', '/water-heater-installation-replacement')],
    heading: 'Water Heater Installation and Replacement',
    intro: 'A new water heater is a long-term investment in daily comfort and household energy use. This page explains the main system types, how to think about capacity and efficiency, and what to include when you request an installation or replacement estimate in Denver, Boulder, and nearby communities where service is available.',
    ctaLabel: 'Request an Installation Estimate', illustration: 'water-heater', illustrationAlt: '',
    mainHeading: 'Replacement Decisions and Choosing a Water Heater',
    cards: [],
    mainBlocks: [
      blk('list', 'Signs It May Be Time to Replace', {
        items: ['The unit is near or beyond its expected service life.', 'Rust-colored water or visible corrosion.', 'A leak from the tank itself.', 'Repeated repairs.', 'Not enough hot water for your household.', 'Rising energy bills with no change in usage.'],
      }),
      blk('cards', 'Choosing a Water Heater Type', {
        cards: [
          { title: 'Storage tank', text: 'Heats and stores a set volume of water. Typically lower upfront cost and simpler installation when replacing like-for-like. Standby heat loss is a tradeoff, and capacity is finite.' },
          { title: 'Tankless (on-demand)', text: "Heats water as it flows, so there's no storage tank to run out. Can offer a continuous supply and often a smaller footprint. Installation can be more involved: gas line sizing, venting, electrical capacity, and drain or condensate handling may need upgrading." },
          { title: 'Heat pump (hybrid)', text: 'Uses electricity to move heat rather than generate it, and is often more efficient than standard electric tanks. Needs adequate space and airflow, and may cool the space it sits in. Rebates sometimes exist for efficient equipment; check current programs directly.' },
          { title: 'Fuel type', text: 'Natural gas, propane, and electric each have different installation requirements and operating costs. Your existing connections often influence the practical choice.' },
        ],
      }),
      blk('list', 'Capacity and Sizing', {
        items: ['Tank size depends on household size and peak demand. Common residential tanks range from about 40 to 80 gallons.', 'Tankless flow rate is measured in gallons per minute (GPM) and temperature rise. Cold incoming water in winter increases the required temperature rise, so sizing matters.', 'First-hour rating for tank units estimates how much hot water the unit can supply in a peak hour.', 'Count simultaneous uses such as showers, dishwasher, and laundry.'],
        text: 'A provider can help you size based on your actual usage.',
      }),
      blk('text', 'Energy Efficiency', {
        text: 'Look for the unit\'s Uniform Energy Factor (UEF) and the yellow EnergyGuide label. Higher UEF means greater efficiency. ENERGY STAR® certified models are available in several categories. Compare estimated annual operating costs against upfront cost over the life of the unit.',
      }),
      blk('list', 'Installation Considerations', {
        items: ['Permits and code compliance: replacement may require a permit and inspection, depending on your jurisdiction.', 'Venting and combustion air for gas units.', 'Gas line, electrical, and water connections.', 'Expansion tank and pressure considerations.', 'Drain pan and leak protection.', 'Removal and disposal of the old unit.', 'Space and clearance constraints.'],
      }),
    ],
    guidanceHeading: 'Property needs and installation request',
    guidanceBlocks: [
      blk('cards', 'Residential and Commercial Needs', {
        cards: [
          { title: 'Homes', text: 'Closets, basements, garages, and attics each pose different clearance and venting issues.' },
          { title: 'Commercial', text: 'Higher hot-water demand, recirculation loops, multiple units, code requirements, and scheduling around business hours.' },
        ],
      }),
      blk('steps', 'How to Request an Estimate', {
        items: ['Click Request Service, then Plumbing, then Water Heater Installation/Replacement.', 'Share your ZIP code and property type.', 'Describe your current unit: type, fuel, size, location, and age.', 'Tell us your goals, such as lower bills, more hot water, or space savings.', "Add your preferred timing. We'll follow up about availability and next steps."],
      }),
    ],
    faqs: [
      faq('Tank or tankless: which is better?', 'Neither is universally better. Tank units are simpler and often cheaper to install, while tankless units offer on-demand hot water but may require upgrades.'),
      faq('How big a water heater do I need?', 'It depends on household size and usage patterns. A provider can estimate based on fixtures and demand.'),
      faq('Can I switch from tank to tankless?', 'Often yes, but it may involve gas line, venting, or electrical changes.'),
      faq('Do I need a permit?', 'Often, yes. Requirements vary by city and county; the installer or your local building department can confirm.'),
      faq('How long does installation take?', 'A straightforward like-for-like swap can be quicker than a conversion. The provider can give you an estimate.'),
      faq('Are there rebates for efficient models?', 'Programs change. Check with your utility and state or federal energy programs.'),
      faq('Will PipeFlowCo quote a price on this page?', 'No. Prices depend on equipment, installation conditions, and provider.'),
    ],
    finalHeading: 'Planning a new water heater?',
    finalText: "Share your current unit and your goals, and send your request. We'll follow up about availability and next steps.",
    finalCtaLabel: 'Request an Installation Estimate',
    related: [WH_REPAIR, PLUMBING, DENVER, BOULDER],
  },
}

// ------------------------------------------------------------------ 5. Frozen Pipe Repair
const frozenPipe: ServiceSeedPage = {
  path: 'frozen-pipe-repair',
  title: 'Frozen Pipe Repair',
  description: 'Learn the signs of frozen pipes, safe first steps, and prevention tips for Colorado winters. Request help for frozen or burst pipes in Denver and Boulder.',
  seoTitle: 'Frozen Pipe Repair & Prevention in Colorado | PipeFlowCo',
  seoDescription: 'Learn the signs of frozen pipes, safe first steps, and prevention tips for Colorado winters. Request help for frozen or burst pipes in Denver and Boulder.',
  type: 'serviceDetail',
  data: {
    ...base,
    serviceCategory: 'plumbing', formService: 'plumbing:frozen-pipe-repair',
    breadcrumbs: [home, PLUMBING, link('Frozen Pipe Repair', '/frozen-pipe-repair')],
    heading: 'Frozen Pipe Repair and Prevention in Colorado',
    intro: "Colorado's cold snaps, wide temperature swings, and wind can push water in vulnerable pipes below freezing. A frozen pipe can block water flow, and if it bursts, it can cause serious damage. This page covers warning signs, safe first steps, prevention, and how to request professional help in Denver, Boulder, and nearby areas where service is available.",
    ctaLabel: 'Request Frozen Pipe Help', illustration: 'frozen-pipe', illustrationAlt: '',
    mainHeading: 'Warning Signs and Pipe-Freezing Risks',
    cards: [],
    mainBlocks: [
      blk('list', 'Warning Signs of a Frozen Pipe', {
        items: ['Little or no water from a faucet, especially in cold weather.', 'Frost on exposed pipes.', 'Strange sounds, such as banging or gurgling, when you run water.', 'Unusual smells from drains or faucets.', 'Bulging, cracked, or visibly damaged pipes.', 'Water stains or dripping near pipes, which may indicate a split.'],
      }),
      blk('list', 'Where Pipes Are Most at Risk', {
        items: ['Exterior walls.', 'Crawl spaces, attics, and unheated basements.', 'Garages.', 'Pipes near vents, outdoor hose bibs, or sprinkler lines.', 'Vacant or seasonal properties where heat is lowered or off.'],
        text: 'Sustained temperatures well below freezing (32°F), or high winds hitting poorly insulated areas, raise the risk. Exposed pipes can freeze even when the thermostat inside seems fine.',
      }),
    ],
    guidanceHeading: 'Safe steps, prevention, and FAQs',
    guidanceBlocks: [
      blk('steps', 'Safe Immediate Steps', {
        items: [
          '**Keep the faucet open.** Open the affected faucet slightly. Running water, even a trickle, can help relieve pressure and, once thawed, assist flow.',
          '**Locate your main water shutoff** and know how to close it in case a pipe has split.',
          '**Check for leaks or cracks.** If you see any, shut off the main valve and request professional help.',
          '**Gently warm the area.** Increase indoor heat, open cabinet doors under sinks, or use a hair dryer on a low setting, keeping it moving and away from standing water.',
          '**Thaw gradually,** working from the faucet back toward the frozen section.',
          "**Don't ignore thawed pipes.** A pipe that froze may have cracked and could leak once water flows again.",
        ],
      }),
      blk('notice', 'What Not to Do', {
        tone: 'safety',
        items: [
          '**Never use an open flame** (torch, lighter, propane heater, or similar) to thaw a pipe. It creates a serious fire risk and can damage pipes or ignite materials inside walls.',
          "Don't use kerosene or propane heaters indoors in poorly ventilated spaces.",
          "Don't use electrical devices near standing water.",
          "Don't force a frozen valve or fitting.",
          "Don't leave a thawing process unattended.",
        ],
      }),
      blk('list', 'When to Call a Professional', {
        items: ["You can't find or reach the frozen section.", 'The pipe is behind a wall, under a slab, or in a crawl space.', 'The pipe is visibly split or leaking.', "Water is flowing where it shouldn't be.", 'You have no heat and a freezing risk.'],
      }),
      blk('text', 'Possible Pipe Damage', {
        text: 'Frozen water expands, which can crack pipes or loosen joints, often at weak points like fittings. Damage may only show once the ice melts and pressure returns. Depending on severity, options include repairing a section, replacing a segment, or addressing water damage. A professional can inspect the system and advise.',
      }),
      blk('list', 'Prevention Tips for Colorado Winters', {
        items: ['Insulate exposed pipes in crawl spaces, attics, basements, and garages.', 'Seal air leaks around pipes where they pass through exterior walls.', 'Disconnect and drain garden hoses, and shut off and drain exterior hose bibs and sprinkler lines before winter.', 'Keep your thermostat at a steady temperature, including during short trips. Many experts suggest not setting it lower than about 55°F when away.', 'Open cabinet doors under sinks on exterior walls during extreme cold.', 'Let faucets drip slightly during severe cold if pipes are at risk, understanding this adds to your water use.', 'Know where your main shutoff valve is, and test it before winter.', 'For vacant properties, consider draining the system or arranging regular checks.'],
      }),
      blk('cards', 'Residential and Commercial', {
        cards: [
          { title: 'Homes', text: 'Older houses with uninsulated walls, additions, or crawl spaces.' },
          { title: 'Commercial', text: 'Unoccupied suites, loading docks, rooftop equipment lines, fire sprinkler systems, and vacant or seasonally used properties.' },
        ],
      }),
      blk('steps', 'How to Request Help', {
        items: ['Click Request Service, then Plumbing, then Frozen Pipe Repair.', 'Enter your ZIP code, property type, and describe where the freezing occurred.', "Note whether you've seen leaks, and whether you've shut off the water.", "Submit. We'll follow up about availability and next steps."],
      }),
      blk('notice', 'Emergency notice', {
        tone: 'safety',
        text: "If water is flooding your property or near electrical equipment, don't wait for a form response. Shut off the main water valve if safe, and contact emergency services if there is a hazard.",
      }),
    ],
    faqs: [
      faq('At what temperature do pipes freeze?', 'Water freezes at 32°F, but pipes typically freeze after prolonged exposure to temperatures below that, particularly with wind or poor insulation.'),
      faq('How can I tell if a pipe has burst?', 'Look for water stains, dripping, a sudden drop in water pressure, or sounds of running water when nothing is on.'),
      faq('Should I turn off my water if I suspect a freeze?', 'If you see a leak or crack, yes. Otherwise, keep a faucet open while you gently warm the area.'),
      faq('Is it safe to use a hair dryer?', 'Generally, on a low setting, kept moving, away from water and wet floors. Stop if anything seems unsafe.'),
      faq('Will a pipe always burst when it freezes?', 'No, but the risk is real. Damage may appear after thawing.'),
      faq('Does homeowners insurance cover frozen pipe damage?', 'Coverage varies by policy. Contact your insurance company directly.'),
      faq('Can you guarantee same-day service?', 'No. Availability depends on your location, the provider, and conditions at the time.'),
    ],
    finalHeading: 'Dealing with a frozen or burst pipe?',
    finalText: "Tell us where the freezing occurred and send your request. We'll follow up about availability and next steps.",
    finalCtaLabel: 'Request Frozen Pipe Help',
    related: [PLUMBING, WH_REPAIR, DENVER, BOULDER],
  },
}

// ------------------------------------------------------------------ 6. AC Services
const acServices: ServiceSeedPage = {
  path: 'ac-services',
  title: 'AC Services',
  description: 'Learn about common AC problems, weak airflow, noises, and maintenance needs. Send an air conditioning service inquiry in Denver or Boulder.',
  seoTitle: 'Air Conditioning Services in Denver & Boulder, CO | PipeFlowCo',
  seoDescription: 'Learn about common AC problems, weak airflow, noises, and maintenance needs. Send an air conditioning service inquiry in Denver or Boulder.',
  type: 'serviceDetail',
  data: {
    ...base,
    serviceCategory: 'hvac', formService: 'hvac:ac-repair',
    breadcrumbs: [home, HVAC, link('AC Services', '/ac-services')],
    heading: 'Air Conditioning Services for Homes and Businesses',
    intro: "When your air conditioner isn't keeping up, the house feels it fast. This page explains common cooling problems, simple checks you can safely do yourself, and how to submit an air conditioning service inquiry in Denver, Boulder, and surrounding areas where coverage is available.\n\nWhether a specific AC repair or maintenance service is available depends on your location and provider. Submit an inquiry and we'll let you know what we can help with.",
    ctaLabel: 'Send an AC Service Inquiry', illustration: 'ac-condenser', illustrationAlt: '',
    mainHeading: 'Common AC Problems and Initial Checks',
    cards: [],
    mainBlocks: [
      blk('list', 'Common AC Problems', {
        items: [
          '**Not cooling enough:** A dirty filter, blocked coils, thermostat settings, low refrigerant from a leak, or equipment that is undersized or aging.',
          '**Weak airflow:** A clogged filter, blocked or closed vents, duct leaks or disconnections, or a failing blower.',
          '**Unusual noises:** Grinding, squealing, rattling, or buzzing can indicate worn motors or bearings, loose parts, or electrical issues.',
          '**Water around the unit:** Condensate drain clogs can cause leaks near the indoor unit.',
          '**Ice on the refrigerant line or coil:** Often tied to restricted airflow or low refrigerant. Turn the system off to let it thaw rather than chipping ice.',
          '**High energy bills:** May reflect reduced efficiency, duct leakage, or aging equipment.',
          "**System won't start or short-cycles:** May involve thermostat, electrical, or control problems.",
        ],
      }),
      blk('list', 'Simple Checks Before You Request Service', {
        items: [
          'Confirm the thermostat is set to "cool" with a temperature below the current room temperature.',
          'Replace or inspect the air filter. Many are changed every one to three months, depending on type and use.',
          'Make sure supply and return vents are open and unblocked.',
          "Check that the breaker hasn't tripped.",
          'Clear leaves, debris, and grass clippings from around the outdoor unit, keeping about two feet of clearance.',
        ],
      }),
      blk('notice', '', { tone: 'safety', text: "Don't open electrical panels or handle refrigerant. Both call for trained professionals." }),
      blk('text', 'Maintenance Matters', {
        text: 'Regular maintenance may include inspecting and cleaning coils, checking the condensate drain, testing electrical components, verifying refrigerant levels, and checking airflow. Many homeowners schedule this in spring, before the first heat wave.',
      }),
      blk('list', 'Colorado Considerations', {
        items: ['Cottonwood fluff, dust, and debris can clog outdoor coils in late spring and summer.', 'Hail can damage condenser fins; check your unit after storms.', 'Evaporative coolers need different maintenance than refrigerant-based AC.'],
      }),
      blk('cards', 'Residential and Commercial', {
        cards: [
          { title: 'Homes', text: 'Central AC, ductless mini-splits, and heat pumps in cooling mode.' },
          { title: 'Commercial', text: 'Rooftop units, split systems, and multi-zone setups, where downtime affects customers and employees.' },
        ],
      }),
    ],
    guidanceHeading: 'Sending an inquiry and FAQs',
    guidanceBlocks: [
      blk('steps', 'How to Send an AC Inquiry', {
        items: ['Click Request Service, then HVAC, then AC Services.', 'Add your ZIP code and property type.', 'Describe symptoms, equipment type and age if known, and any error codes.', "Submit. We'll follow up about availability and next steps."],
      }),
    ],
    faqs: [
      faq('Why is my AC running but not cooling?', 'Common culprits include a dirty filter, frozen coil, low refrigerant, or a failing component.'),
      faq('How often should I change my filter?', 'It varies by filter type, pets, and use. Check the filter monthly during heavy use.'),
      faq('Why is ice forming on my AC?', 'Usually restricted airflow or low refrigerant. Turn the system off and request service.'),
      faq('Is it normal for my AC to make noise?', "Some operating sound is normal. Grinding, squealing, or banging isn't."),
      faq('Should I repair or replace my AC?', 'Age, repair history, refrigerant type, and efficiency all matter. See the AC Installation page.'),
      faq('Can PipeFlowCo confirm repair availability right now?', "Availability depends on your location and the provider. Submit an inquiry and we'll respond."),
      faq('Does a swamp cooler need servicing?', 'Yes, but differently from a refrigerant-based system.'),
    ],
    finalHeading: 'Cooling not keeping up?',
    finalText: "Describe what you're seeing and send your inquiry. We'll follow up about availability and next steps.",
    finalCtaLabel: 'Send an AC Service Inquiry',
    related: [HVAC, AC_INSTALL, DENVER, BOULDER],
  },
}

// ------------------------------------------------------------------ 7. AC Installation
const acInstallation: ServiceSeedPage = {
  path: 'ac-installation',
  title: 'AC Installation',
  description: 'Planning a new air conditioner? Learn about sizing, efficiency, and installation planning for homes and businesses, then request an estimate.',
  seoTitle: 'AC Installation in Denver & Boulder, CO | PipeFlowCo',
  seoDescription: 'Planning a new air conditioner? Learn about sizing, efficiency, and installation planning for homes and businesses, then request an estimate.',
  type: 'serviceDetail',
  data: {
    ...base,
    serviceCategory: 'hvac', formService: 'hvac:ac-installation',
    breadcrumbs: [home, HVAC, link('AC Installation', '/ac-installation')],
    heading: 'AC Installation for Residential and Commercial Properties',
    intro: 'A new air conditioning system affects comfort, energy use, and indoor air quality for years. This page explains how sizing, system type, and efficiency affect your decision, and how to request an installation estimate in Denver, Boulder, and surrounding communities where service is available.',
    ctaLabel: 'Request an AC Installation Estimate', illustration: 'ac-condenser', illustrationAlt: '',
    mainHeading: 'Choosing and Planning a New AC System',
    cards: [],
    mainBlocks: [
      blk('list', 'When to Consider a New AC System', {
        items: ['Your system is old or repeatedly needs repairs.', "It uses a refrigerant that's being phased out, such as older R-22 systems.", "Rooms don't cool evenly.", 'Energy bills are climbing.', "You're adding space or finishing a basement.", "You're moving from no AC to central cooling."],
      }),
      blk('cards', 'Types of Cooling Systems', {
        cards: [
          { title: 'Central split system', text: 'An outdoor condenser and indoor coil connected to ductwork.' },
          { title: 'Heat pump', text: 'Provides both cooling and heating; increasingly considered in Colorado, including cold-climate models.' },
          { title: 'Ductless mini-split', text: 'Good for homes without ducts, additions, or zoned comfort.' },
          { title: 'Packaged and rooftop units', text: 'Common in commercial buildings and some homes.' },
          { title: 'Evaporative cooler', text: "Works best in dry climates and uses less electricity, but doesn't dehumidify and may not suit every home." },
        ],
      }),
      blk('text', 'System Sizing', {
        text: "Bigger isn't better. An oversized system cools quickly, then shuts off before removing enough moisture and may cycle too often, wearing out components. An undersized system struggles on hot days. Professionals often use a load calculation, such as ACCA Manual J, that considers square footage, insulation, windows, sun exposure, and occupancy. Avoid sizing based only on your old unit's capacity.",
      }),
      blk('list', 'Energy Efficiency', {
        items: ['SEER2 rates seasonal cooling efficiency; higher is generally more efficient.', 'EER2 reflects efficiency at high outdoor temperatures.', 'ENERGY STAR® models are available.', 'Compare long-term operating costs with upfront price.', 'Ask about incentives. Federal, state, and utility programs change, so confirm current availability before you buy.'],
      }),
    ],
    guidanceHeading: 'Installation planning, request steps, and FAQs',
    guidanceBlocks: [
      blk('list', 'Installation Planning', {
        items: ['Ductwork condition, sealing, and insulation.', 'Placement of the outdoor unit, including clearance, noise, snow, and hail exposure.', 'Electrical capacity and disconnects.', 'Thermostat compatibility.', 'Condensate drainage.', 'Permits and inspections.', 'Removal of the old unit and proper refrigerant handling.'],
      }),
      blk('cards', 'Residential and Commercial', {
        cards: [
          { title: 'Homes', text: 'Whole-house cooling, add-ons, and zoned comfort for finished basements and upper floors.' },
          { title: 'Commercial', text: 'Rooftop replacements, tenant improvements, and multi-zone systems. Share square footage, building use, and current equipment.' },
        ],
      }),
      blk('steps', 'How to Request an Estimate', {
        items: ['Click Request Service, then HVAC, then AC Installation.', 'Enter ZIP code and property type.', 'Describe your property, existing system, and goals.', "Add preferred timing. We'll follow up about availability and next steps."],
      }),
    ],
    faqs: [
      faq('How do I know what size AC I need?', 'A load calculation based on your property is the best approach.'),
      faq('Is a heat pump a good option in Colorado?', 'Modern cold-climate heat pumps can work well in many homes, though suitability depends on the building and equipment.'),
      faq('How long does an AC installation take?', 'It varies with the system and complexity. A provider can offer an estimate after review.'),
      faq('Do I need new ductwork?', 'Not always. Existing ducts should be evaluated for condition, sizing, and leakage.'),
      faq('Do I need a permit?', 'Often, yes. Your installer or local building department can confirm.'),
      faq('Will a higher SEER2 always save me money?', 'Not necessarily. Savings depend on usage, climate, and upfront cost.'),
      faq('Can you give me a price here?', 'No. Prices depend on equipment, installation, and provider.'),
    ],
    finalHeading: 'Planning a new air conditioner?',
    finalText: "Share your property, your current system and your goals, and send your request. We'll follow up about availability and next steps.",
    finalCtaLabel: 'Request an AC Installation Estimate',
    related: [AC_SERVICES, HEATING, HVAC, DENVER, BOULDER],
  },
}

// ------------------------------------------------------------------ 8. Heating Installation
// The form is preset to the catalog's own hvac:heating-installation service (src/lib/requests/schema.ts), so the
// saved request is labelled "Heating Installation" and not "Something else / not sure".
const heatingInstallation: ServiceSeedPage = {
  path: 'heating-installation',
  title: 'Heating Installation',
  description: 'Compare furnace and heating options, sizing, and efficiency for Colorado homes and businesses. Request a heating installation estimate.',
  seoTitle: 'Heating System Installation in Denver & Boulder, CO | PipeFlowCo',
  seoDescription: 'Compare furnace and heating options, sizing, and efficiency for Colorado homes and businesses. Request a heating installation estimate.',
  type: 'serviceDetail',
  data: {
    ...base,
    serviceCategory: 'hvac', formService: 'hvac:heating-installation',
    breadcrumbs: [home, HVAC, link('Heating Installation', '/heating-installation')],
    heading: 'Heating System Installation in Denver and Boulder',
    intro: 'Winter in Colorado can bring heavy snow, sub-freezing nights, and sudden cold snaps. A heating system that fits your property keeps you comfortable and manages energy use. This page explains the main heating options, sizing, and planning, and how to request an installation estimate in Denver, Boulder, and nearby communities where service is available.',
    ctaLabel: 'Request a Heating Installation Estimate', illustration: 'furnace', illustrationAlt: '',
    mainHeading: 'Choosing and Sizing a Heating System',
    cards: [],
    mainBlocks: [
      blk('list', 'Signs You May Need a New Heating System', {
        items: ['Aging equipment or frequent breakdowns.', 'Uneven heating or cold spots.', 'Higher energy bills.', 'Excessive noise, short cycling, or visible rust.', 'Safety concerns, such as a cracked heat exchanger identified by a professional.', 'A renovation or addition.'],
      }),
      blk('cards', 'Heating Options', {
        cards: [
          { title: 'Gas furnace', text: 'Common in Colorado homes. Efficiency is rated in AFUE. High-efficiency condensing models typically exceed 90% AFUE and need different venting. Altitude affects combustion, so equipment and settings should suit your elevation.' },
          { title: 'Electric furnace', text: 'Simpler installation but often higher operating cost where electricity is pricier than gas.' },
          { title: 'Heat pump (air-source and cold-climate)', text: "Moves heat rather than generating it, and can provide both heating and cooling. Cold-climate models are designed for lower outdoor temperatures. Some homes pair a heat pump with a gas furnace as a 'dual fuel' system." },
          { title: 'Boilers and radiant systems', text: 'Common in some older Denver and Boulder homes. These use hot water or steam.' },
          { title: 'Ductless mini-splits', text: 'Useful for additions, rooms without ducts, or zoned heating.' },
          { title: 'Commercial systems', text: 'Rooftop heating units, unit heaters, boilers, and multi-zone systems.' },
        ],
      }),
      blk('text', 'Sizing and Load', {
        text: 'Heating load depends on square footage, insulation, windows, air leakage, orientation, and local design temperatures. Professionals often use a load calculation, such as ACCA Manual J. An oversized furnace may short-cycle, causing uneven comfort and extra wear. An undersized one may not keep up on the coldest nights.',
      }),
      blk('list', 'Energy Efficiency', {
        items: ['AFUE for furnaces and boilers.', 'HSPF2 for heat pumps.', 'ENERGY STAR® options.', 'Insulation, air sealing, and duct sealing can reduce the load and may allow a smaller system.', 'Check for current federal, state, and utility incentives.'],
      }),
    ],
    guidanceHeading: 'Installation planning, request steps, and FAQs',
    guidanceBlocks: [
      blk('list', 'Installation Planning', {
        items: ['Venting, flue, and combustion air.', 'Gas line capacity and shutoff.', 'Electrical requirements.', 'Ductwork condition and layout.', 'Thermostat selection.', 'Permits and inspections.', 'Removal of the old equipment.', 'Carbon monoxide detectors and testing.'],
      }),
      blk('cards', 'Residential and Commercial', {
        cards: [
          { title: 'Homes', text: 'Replacing a furnace, switching fuels, or adding zones.' },
          { title: 'Commercial', text: 'Replacing rooftop units, planning for tenant spaces, and addressing code or ventilation requirements.' },
        ],
      }),
      blk('steps', 'How to Request an Estimate', {
        items: ['Click Request Service, then HVAC, then Heating Installation.', 'Enter ZIP code and property type.', 'Describe your current heating, property size, and goals.', "Add preferred timing. We'll follow up about availability and next steps."],
      }),
    ],
    faqs: [
      faq('Furnace or heat pump: which is better for Colorado?', "Both can work. The best fit depends on your property, fuel costs, and the equipment's cold-weather performance."),
      faq('What does AFUE mean?', "It measures how much of a furnace's fuel becomes usable heat. A higher AFUE means less wasted fuel."),
      faq('How long do furnaces last?', 'Often 15 to 20 years with maintenance, though it varies.'),
      faq('Does altitude affect a furnace?', 'Yes. Thinner air affects combustion, so equipment and settings should suit your elevation.'),
      faq('Do I need a carbon monoxide detector?', 'Yes, with any fuel-burning appliance. Place them per manufacturer and local code guidance.'),
      faq('Can you replace my furnace the same day?', "Timing depends on availability and the project. We'll discuss it when we respond."),
      faq('Can you give me a price here?', 'No. Prices depend on equipment, installation, and provider.'),
    ],
    finalHeading: 'Planning a new heating system?',
    finalText: "Describe your current heating, your property and your goals, and send your request. We'll follow up about availability and next steps.",
    finalCtaLabel: 'Request a Heating Installation Estimate',
    related: [HVAC, AC_INSTALL, AC_SERVICES, DENVER, BOULDER],
  },
}

export const servicePages: ServiceSeedPage[] = [plumbingServices, hvacServices, waterHeaterRepair, waterHeaterInstall, frozenPipe, acServices, acInstallation, heatingInstallation]
