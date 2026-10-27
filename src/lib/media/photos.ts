/**
 * Site photography. Every file lives in /public/images/photos and comes from Unsplash
 * (free photos only, not Unsplash+), used under the Unsplash License: free for commercial
 * use, no attribution required. Credits are kept here anyway so the source of every image
 * is known.
 *
 * `focus` is the CSS object-position that keeps the subject in frame when the photo is
 * cropped to a tall or wide box.
 */
export interface Photo {
  src: string
  alt: string
  width: number
  height: number
  focus: string
  credit: { photographer: string; url: string }
}

const p = (file: string, width: number, height: number, alt: string, focus: string, photographer: string, id: string): Photo => ({
  src: `/images/photos/${file}.jpg`,
  alt,
  width,
  height,
  focus,
  credit: { photographer, url: `https://unsplash.com/photos/${id}` },
})

export const PHOTOS = {
  plumberBathroom: p('plumber-bathroom', 2000, 1333, 'A plumber in blue overalls working in a bathroom', '60% 40%', 'bhagya laxmi', 'jaP5ClBdIyU'),
  plumberUnderSink: p('plumber-under-sink', 1800, 1350, 'A plumber tightening a pipe fitting under a sink', '55% 50%', 'Timur Shakerzianov', 'c314Gh8dXAo'),
  plumberSinkPipes: p('plumber-sink-pipes', 1600, 2109, 'Hands adjusting the drain pipes under a sink', '50% 45%', 'Timur Shakerzianov', 'wzIjLL4KB-4'),
  plumberSinkTrap: p('plumber-sink-trap', 1600, 1200, 'A plumber checking a sink trap and supply lines', '50% 50%', 'Timur Shakerzianov', 'kxuz4YrLxSc'),
  waterHeater: p('water-heater-wrench', 2000, 1800, 'A pipe wrench on the supply fitting of a tank water heater', '45% 40%', 'Marian Florinel Condruz', 'C-oYJoIfgCs'),
  mechanicalPipes: p('mechanical-pipes-valves', 1800, 1197, 'Copper and steel pipes, valves and a pump in a mechanical room', '50% 45%', 'Immo Wegmann', 'U0jpGKtMtWE'),
  faucet: p('faucet-running-water', 1800, 1200, 'Water running from a kitchen faucet', '45% 50%', 'Imani', 'vDQ-e3RtaoE'),
  plumbingTools: p('plumbing-tools', 1600, 1067, 'Pliers and wrenches in a tool bag', '50% 50%', 'Quilia', '60krlMMeWxU'),
  acCondenser: p('ac-condenser-house', 2000, 1333, 'An outdoor air conditioning condenser beside a house', '30% 55%', 'Everett Pachmann', 'JsPkVrHMQoo'),
  miniSplit: p('mini-split-wall', 1600, 1600, 'A ductless mini-split outdoor unit mounted on a wall', '65% 45%', 'Konrad Koller', 'HDfQ1uXmFh0'),
  acUnitsWall: p('ac-units-wall', 1600, 1067, 'Several air conditioning units mounted on a commercial building wall', '60% 40%', 'Kien Nguyen', '3HuYNNM1-8w'),
  technicianEquipment: p('technician-equipment', 1600, 2400, 'A technician in a safety vest working on mechanical equipment', '50% 35%', 'Dimitar Belchev', 'KZjjly4F3Is'),
  technicianToolBelt: p('technician-tool-belt', 1600, 1067, 'A tradesperson with a tool belt and ladder at a work van', '50% 50%', 'Kevin Grieve', '3CKZS3-o3XU'),
  denverRockies: p('denver-skyline-rockies', 2000, 1334, 'Denver with the snow-covered Rocky Mountains behind the city', '50% 45%', 'Caleb Jack', '3ZpDWziy4Jk'),
  denverAerial: p('denver-aerial', 1800, 1200, 'An aerial view of downtown Denver and nearby neighborhoods', '50% 50%', 'Acton Crawford', 'NflJmUuaYVI'),
  denverCityView: p('denver-city-view', 1800, 1013, 'Denver neighborhoods and the downtown skyline on a clear day', '50% 50%', 'Bill Griepenstroh', 'Q9X_p5dDq_8'),
  denverStreet: p('denver-residential-street', 1800, 2400, 'Homes on a Denver residential street with the skyline behind', '50% 60%', 'Imitat', '4Phea4tjC40'),
  houseBlossom: p('house-blossom-tree', 1800, 1200, 'A white house with a blossoming tree and picket fence', '50% 45%', 'Aspen Metzger', 'K39ncY0WmDY'),
  boulderFlatirons: p('boulder-flatirons', 2000, 1335, 'The Flatirons rising above green meadows in Boulder', '55% 40%', 'Malachi Brooks', 'CkL2keStfIk'),
  boulderMeadow: p('boulder-flatirons-meadow', 1800, 1200, 'Boulder’s Flatirons above a meadow and pine trees', '50% 45%', 'LOGAN WEAVER', 'vJobaIvYSbo'),
  boulderAutumn: p('boulder-flatirons-autumn', 1800, 1200, 'The Flatirons above golden grassland in Boulder', '55% 40%', 'Braden Collum', 'TFFaIgbBETs'),
} satisfies Record<string, Photo>

/** The site's own HVAC banner photo (not stock), used for the HVAC Repair card. */
const HERO_HVAC_PHOTO: Photo = { src: '/images/hero/hvac.jpg', alt: 'A PipeFlow technician beside an outdoor AC unit with the Denver skyline behind', width: 1920, height: 641, focus: '85% 50%', credit: { photographer: 'PipeFlow', url: 'https://pipeflow-theta.vercel.app' } }

/** The site's own photo (not stock): a technician greeting a homeowner beside a PipeFlow van. */
export const HANDSHAKE_PHOTO: Photo = { src: '/images/about-handshake.jpg', alt: 'A PipeFlow technician shaking hands with a homeowner beside a branded van', width: 1024, height: 426, focus: '42% 50%', credit: { photographer: 'PipeFlow', url: 'https://pipeflow-theta.vercel.app' } }

/**
 * Placeholders for photos the site still needs. Each file in /public/images/placeholders is a plain navy tile with an
 * icon, so the layout is final while the real photo is outstanding. Replace the file (same name, any format the
 * src points to) or choose a Media Library image in the page editor. The alt text describes the intended photo.
 */
export const PLACEHOLDER_PHOTOS = {
  photoUpload: { src: '/images/placeholders/placeholder-customer-photo-upload.svg', alt: 'A customer photographing a leaking pipe under a sink with a phone', width: 1200, height: 900, focus: '50% 50%', credit: { photographer: 'Placeholder: photo needed', url: '' } },
  commercialBuilding: { src: '/images/placeholders/placeholder-commercial-building.svg', alt: 'The outside of a commercial building in Denver', width: 1200, height: 900, focus: '50% 50%', credit: { photographer: 'Placeholder: photo needed', url: '' } },
} satisfies Record<string, Photo>


/**
 * Pages saved before the photography existed point at /art/*.svg illustrations. Woh
 * paths database mein hain; unhe badle bina, render ke waqt sahi photo dikhai jaati hai.
 */
const LEGACY_ART: Record<string, Photo> = {
  '/art/home-pro.svg': PHOTOS.plumberBathroom,
  '/art/hero-plumbing.svg': PHOTOS.plumberUnderSink,
  '/art/hero-hvac.svg': PHOTOS.acCondenser,
  '/art/water-heater.svg': PHOTOS.waterHeater,
  '/art/frozen-pipe.svg': PHOTOS.faucet,
  '/art/ac-repair.svg': PHOTOS.acCondenser,
  '/art/ac-installation.svg': PHOTOS.miniSplit,
  '/art/denver.svg': PHOTOS.denverRockies,
  '/art/boulder.svg': PHOTOS.boulderFlatirons,
  // Published blog posts in the database point at these files, which were never added to /public.
  // Unke liye asli photos dikhti hain; database ko chhue bina. Admin ne post mein nayi image lagayi to woh chalegi.
  '/assets/service-plumbing.jpg': PHOTOS.waterHeater,
  '/assets/service-detail-2.jpg': PHOTOS.faucet,
  '/assets/hero-hvac-tech.jpg': PHOTOS.miniSplit,
}

const BY_SRC = new Map<string, Photo>([...Object.values(PHOTOS), HANDSHAKE_PHOTO, ...Object.values(PLACEHOLDER_PHOTOS)].map((ph) => [ph.src, ph]))

/** The image to show for a stored src, with the best alt text and crop we know of. */
export function resolveImage(src: string, alt = ''): { src: string; alt: string; focus?: string } {
  const photo = LEGACY_ART[src] ?? BY_SRC.get(src)
  if (!photo) return { src, alt }
  return { src: photo.src, alt: alt || photo.alt, focus: photo.focus }
}

/** Pinned process story: har step ki apni photo (sab alag, koi repeat nahi). Photos sirf sajawat hain; step ka text hi jaankari hai. */
export const PROCESS_PHOTOS: Photo[] = [PHOTOS.plumberUnderSink, PHOTOS.houseBlossom, PHOTOS.technicianToolBelt, PHOTOS.plumberBathroom]

/** Service index: kis page ke link par hover karne se kaunsi photo dikhe. Key = page ka path. */
export const SERVICE_PHOTOS: Record<string, Photo> = {
  '/plumbing/plumbing-repair': PHOTOS.plumberUnderSink,
  '/plumbing/water-heater-repair': PHOTOS.waterHeater,
  '/plumbing/water-heater-replacement': PHOTOS.plumberSinkPipes,
  '/plumbing/frozen-pipe-repair': PHOTOS.faucet,
  '/plumbing/plumbing-fixes': PHOTOS.plumbingTools,
  '/hvac/ac-repair': PHOTOS.acCondenser,
  '/hvac/ac-installation': PHOTOS.miniSplit,
  '/hvac/ac-replacement': PHOTOS.acUnitsWall,
  '/hvac/hvac-repair': HERO_HVAC_PHOTO,
  '/hvac/hvac-maintenance': PHOTOS.technicianToolBelt,
}

/** Photos for category and area pages, for link cards that point at them (related links, breadcrumbs lists). */
export const PAGE_PHOTOS: Record<string, Photo> = {
  '/plumbing': PHOTOS.plumberSinkTrap,
  '/hvac': PHOTOS.acCondenser,
  '/commercial': PHOTOS.acUnitsWall,
  '/commercial/plumbing': PHOTOS.mechanicalPipes,
  '/commercial/hvac': PHOTOS.acUnitsWall,
  '/denver': PHOTOS.denverRockies,
  '/boulder': PHOTOS.boulderFlatirons,
  '/find-a-pro': PHOTOS.technicianToolBelt,
  '/find-a-pro/plumbers': PHOTOS.plumberBathroom,
  '/find-a-pro/hvac-contractors': PHOTOS.technicianEquipment,
  '/for-contractors': PHOTOS.technicianToolBelt,
}

/** The photo for a link to one of the site's own pages: a service page first, then a category or area page. */
export const linkPhotoFor = (href: string): Photo | undefined => SERVICE_PHOTOS[href] ?? PAGE_PHOTOS[href.split(/[?#]/)[0]]

/**
 * Home page par photo-strip (scroll se chalti): 8 alag photos. Isme woh photos nahi jo isi page par hero, service tiles ya
 * pinned story mein dikhti hain (khaaskar hero ki photo do screen ke andar dobara na aaye). City photos aur woh photos jo
 * sirf hover-preview mein aati hain (screen par dikhti nahi) istemaal hui hain.
 */
export const MARQUEE_PHOTOS: Photo[] = [
  PHOTOS.denverAerial, PHOTOS.plumberSinkPipes, PHOTOS.acUnitsWall, PHOTOS.boulderMeadow,
  PHOTOS.faucet, PHOTOS.denverCityView, PHOTOS.technicianEquipment, PHOTOS.boulderAutumn,
]

/**
 * Hero banners (wide, dark navy fade on the left where the text sits). Picked at render time from the
 * hero's own wording, so no stored page data changes.
 */
export const HERO_BANNERS = {
  hvac: '/images/hero/hvac.jpg',
  plumbing: '/images/hero/plumbing.jpg',
  blog: '/images/hero/blog.jpg',
  van: '/images/hero/van.jpg',
} as const

export function heroBanner(...texts: (string | undefined)[]): string {
  const t = texts.filter(Boolean).join(' ').toLowerCase()
  if (/(hvac|ac|a\/c|air condition\w*|heating|furnace|cooling|heat pump|thermostat)/.test(t)) return HERO_BANNERS.hvac
  if (/plumb|water heater|pipe|drain|faucet|leak|sewer/.test(t)) return HERO_BANNERS.plumbing
  if (/(blog|guide|tips|resources?|articles?)/.test(t)) return HERO_BANNERS.blog
  return HERO_BANNERS.van
}

/**
 * A relevant stock photo for a service page, picked from its own wording (heading, crumbs). Used beside the page
 * introduction when the editor has not chosen an image. Returns null when nothing fits, so no unrelated photo is shown.
 */
export function servicePhotoFor(...texts: (string | undefined)[]): Photo | null {
  const t = texts.filter(Boolean).join(' ').toLowerCase()
  if (/water heater|tankless/.test(t)) return PHOTOS.waterHeater
  if (/frozen|freez|burst/.test(t)) return PHOTOS.mechanicalPipes
  if (/mini.?split|ductless|ac install|air condition\w* install/.test(t)) return PHOTOS.miniSplit
  if (/commercial/.test(t)) return PHOTOS.acUnitsWall
  if (/ac|a\/c|air condition|cooling/.test(t)) return PHOTOS.acCondenser
  if (/heating|furnace|boiler|heat pump/.test(t)) return PHOTOS.technicianEquipment
  if (/maintenance|tune/.test(t)) return PHOTOS.technicianToolBelt
  if (/hvac/.test(t)) return PHOTOS.acCondenser
  if (/fix|repair|leak|drain|faucet/.test(t)) return PHOTOS.plumberUnderSink
  if (/plumb/.test(t)) return PHOTOS.plumberSinkTrap
  return null
}

/** A thumbnail for a guide or article, picked from its title or URL. Null when nothing fits. */
export function topicPhotoFor(...texts: (string | undefined)[]): Photo | null {
  const t = texts.filter(Boolean).join(' ').toLowerCase()
  if (/freez|frozen|burst/.test(t)) return PHOTOS.faucet
  if (/maintenance|checklist|tune/.test(t)) return PHOTOS.technicianEquipment
  if (/repair.*vs|vs\.? replace|replacement/.test(t) && /\bac\b|air condition/.test(t)) return PHOTOS.acUnitsWall
  if (/\bac\b|air condition|cooling/.test(t)) return PHOTOS.miniSplit
  return servicePhotoFor(t)
}

/**
 * Photos that fit a page, most relevant first, chosen from its wording (title, crumbs, path). Section layouts draw from
 * this pool in order when a run of text needs a picture, so one page never shows the same photo twice until the pool
 * runs out.
 */
export function photoPool(...texts: (string | undefined)[]): Photo[] {
  const t = texts.filter(Boolean).join(' ').toLowerCase()
  const P = PHOTOS
  // Topic first: almost every heading says "Denver & Boulder", so a city only decides the pool for city pages.
  const topic = t.replace(/denver|boulder/g, ' ')
  let pool: Photo[]
  if (!/plumb|hvac|\bac\b|heat|pipe|commercial|contractor|resource|guide/.test(topic) && /boulder/.test(t)) pool = [P.boulderMeadow, P.boulderAutumn, P.houseBlossom, P.boulderFlatirons]
  else if (!/plumb|hvac|\bac\b|heat|pipe|commercial|contractor|resource|guide/.test(topic) && /denver/.test(t)) pool = [P.denverStreet, P.denverCityView, P.denverAerial, P.denverRockies]
  else if (/water heater|tankless/.test(t)) pool = [P.waterHeater, P.mechanicalPipes, P.plumberSinkPipes, P.technicianEquipment]
  else if (/frozen|freez|burst/.test(t)) pool = [P.mechanicalPipes, P.faucet, P.plumberUnderSink]
  else if (/commercial|business/.test(t)) pool = [P.acUnitsWall, P.mechanicalPipes, P.technicianEquipment]
  else if (/contractor|professional|join|grow/.test(t)) pool = [P.technicianToolBelt, P.technicianEquipment, P.plumbingTools]
  else if (/\bac\b|a\/c|air condition|cooling|mini.?split/.test(t)) pool = [P.acCondenser, P.miniSplit, P.acUnitsWall, P.technicianEquipment]
  else if (/hvac|heating|furnace|maintenance/.test(t)) pool = [P.technicianEquipment, P.acCondenser, P.technicianToolBelt, P.miniSplit]
  else if (/plumb|pipe|drain|leak|faucet|fix/.test(t)) pool = [P.plumberSinkTrap, P.plumbingTools, P.plumberBathroom, P.plumberUnderSink]
  else pool = []
  // Neutral, always-relevant photos so a long page never runs dry.
  const fallback = [HANDSHAKE_PHOTO, P.technicianToolBelt, P.houseBlossom, P.plumberBathroom, P.denverStreet]
  return [...new Set([...pool, ...fallback])]
}
