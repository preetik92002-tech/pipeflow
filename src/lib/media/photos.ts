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

const BY_SRC = new Map<string, Photo>(Object.values(PHOTOS).map((ph) => [ph.src, ph]))

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
  '/hvac/hvac-repair': PHOTOS.technicianEquipment,
  '/hvac/hvac-maintenance': PHOTOS.technicianToolBelt,
}

/**
 * Home page par photo-strip (scroll se chalti): 8 alag photos. Isme woh photos nahi jo isi page par hero, service tiles ya
 * pinned story mein dikhti hain (khaaskar hero ki photo do screen ke andar dobara na aaye). City photos aur woh photos jo
 * sirf hover-preview mein aati hain (screen par dikhti nahi) istemaal hui hain.
 */
export const MARQUEE_PHOTOS: Photo[] = [
  PHOTOS.denverAerial, PHOTOS.plumberSinkPipes, PHOTOS.acUnitsWall, PHOTOS.boulderMeadow,
  PHOTOS.faucet, PHOTOS.denverCityView, PHOTOS.technicianEquipment, PHOTOS.boulderAutumn,
]
