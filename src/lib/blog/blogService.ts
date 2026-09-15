import type { BlogPost, BlogCategory, BlogStatus } from './types'

export const defaultBlogCategories: BlogCategory[] = [
  { id: 'cat-1', name: 'Plumbing Tips', slug: 'plumbing', description: 'Essential plumbing advice for homeowners', sortOrder: 1 },
  { id: 'cat-2', name: 'HVAC Guide', slug: 'hvac', description: 'Heating, cooling, and heat pump insights', sortOrder: 2 },
  { id: 'cat-3', name: 'Colorado Homeowners', slug: 'colorado-homeowners', description: 'Climate-specific advice for the Front Range', sortOrder: 3 },
  { id: 'cat-4', name: 'Maintenance', slug: 'maintenance', description: 'Preventive care to extend system lifespan', sortOrder: 4 },
  { id: 'cat-5', name: 'Emergency', slug: 'emergency', description: 'Immediate response guides for urgent leaks and outages', sortOrder: 5 },
  { id: 'cat-6', name: 'Seasonal Care', slug: 'seasonal', description: 'Spring, summer, fall, and winter home prep', sortOrder: 6 },
]

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'How to Prevent Frozen Pipes During a Colorado Cold Snap',
    slug: 'prevent-frozen-pipes-colorado-winter',
    seoTitle: 'How to Prevent Frozen Pipes in Denver, CO | PipeFlow Co.',
    seoDescription:
      'Proven steps Denver homeowners must take to protect indoor and outdoor plumbing during sub-zero Arctic cold fronts.',
    excerpt:
      'When Arctic air hits the Denver metro area, water inside copper and PEX pipes can freeze in under four hours. Here is your step-by-step winter protection protocol.',
    author: 'PipeFlow Master Trades Team',
    authorRole: 'Senior Plumbing Specialist',
    featuredImage: '/assets/service-detail-2.jpg',
    featuredImageAlt: 'Technician checking indoor water lines for winter freeze insulation',
    categoryId: 'cat-1',
    categoryName: 'Plumbing Tips',
    categorySlug: 'plumbing',
    tags: ['Winterization', 'Freeze Protection', 'Denver Plumbing', 'Emergency'],
    publishedAt: '2025-01-20T08:00:00.000Z',
    updatedAt: '2025-01-22T10:00:00.000Z',
    status: 'published',
    body: `### The High-Altitude Winter Challenge

Every winter along the Colorado Front Range, temperatures can plummet 40 degrees in just a few hours. When outside temperatures drop below 20°F, uninsulated pipes in crawlspaces, exterior walls, and unheated basements face severe hydrostatic pressure.

Water expands by roughly 9% as it freezes. It isn't the ice itself that bursts the pipe—it's the extreme hydraulic pressure trapped between the frozen blockage and a closed faucet downstream.

---

### Step 1: Open Under-Sink Cabinet Doors

Warm indoor air needs to circulate around supply lines. In kitchen and bathroom vanities situated on exterior walls:
- Keep cabinet doors slightly ajar during freezing nights.
- Clear out clutter and chemical bottles to maximize warm airflow.

---

### Step 2: Allow a Consistent Trickle on Problem Fixtures

A small stream of moving water—just a pencil-lead thickness—relieves line pressure and makes freezing significantly less likely:
- Pick the faucet farthest from your main water shutoff.
- Run both hot and cold lines slightly so both pipes remain active.

---

### Step 3: Disconnect All Garden Hoses Before First Frost

Leaving a hose attached to an outdoor bib traps water inside the sillcock. When that water freezes, it bursts the brass valve body inside your wall:
- Disconnect and drain all garden hoses by late October.
- Shut off interior isolation valves for exterior hose bibs if your plumbing system has them.

---

### What to Do If a Pipe Does Freeze

1. **Locate your main water shutoff immediately.** If the pipe has fractured, opening it while thawing will flood your home.
2. **Open the affected faucet** to give melting water an exit route.
3. **Use gentle heat**—a hair dryer or space heater. **Never use an open flame torch.**
4. If you see bulging or active spraying, shut off the main valve and call PipeFlow dispatch immediately.`,
    readingTimeMinutes: 5,
    canonicalUrl: 'https://pipeflowco.com/blog/prevent-frozen-pipes-colorado-winter',
    noindex: false,
    faqs: [
      {
        question: 'At what temperature do pipes freeze in Denver?',
        answer:
          'Pipes are vulnerable when outside temperatures stay at 20°F or colder for more than 4 to 6 consecutive hours, especially in homes with unheated crawlspaces.',
      },
      {
        question: 'Does running water prevent pipes from freezing?',
        answer:
          'Yes. A steady, thin trickle keeps water moving and relieves trapped hydraulic pressure, dramatically reducing burst risks.',
      },
    ],
    ctaType: 'plumbing',
    relatedServiceSlug: 'pipe-repair',
    relatedServiceAreaSlug: 'denver',
    viewsCount: 1420,
    createdAt: '2025-01-15T10:00:00.000Z',
  },
  {
    id: 'post-2',
    title: 'Heat Pumps vs. Traditional Furnaces: What Makes Sense in Colorado?',
    slug: 'heat-pumps-vs-furnaces-colorado-climate',
    seoTitle: 'Heat Pumps vs. Gas Furnaces in Colorado Climate | PipeFlow Co.',
    seoDescription:
      'Compare modern cold-climate hybrid heat pumps with standard gas furnaces for altitude efficiency, heating bills, and winter performance.',
    excerpt:
      'With new cold-climate inverter technology and local Xcel energy rebates, many Denver homeowners are evaluating hybrid dual-fuel systems. Here is the engineering reality.',
    author: 'PipeFlow HVAC Engineering Team',
    authorRole: 'HVAC Solutions Specialist',
    featuredImage: '/assets/hero-hvac-tech.jpg',
    featuredImageAlt: 'HVAC technician installing modern high-efficiency heat pump system',
    categoryId: 'cat-2',
    categoryName: 'HVAC Guide',
    categorySlug: 'hvac',
    tags: ['Heat Pumps', 'Furnaces', 'Energy Efficiency', 'Colorado HVAC'],
    publishedAt: '2025-02-05T09:00:00.000Z',
    updatedAt: '2025-02-06T12:00:00.000Z',
    status: 'published',
    body: `### The Mile-High Altitude Heating Dilemma

Denver sits at 5,280 feet above sea level. At this altitude, air is thinner and less dense, which directly impacts combustion efficiency in gas furnaces and heat transfer across condenser coils.

Traditionally, natural gas furnaces were the undisputed champions of Front Range heating. But modern **cold-climate inverter heat pumps** have radically shifted the landscape.

---

### Understanding Dual-Fuel (Hybrid) Systems

For most Colorado homeowners, the premier configuration is **dual-fuel**:
- An electric heat pump handles cooling in summer and efficient heating during mild winter days (down to 25°F–30°F).
- When a severe sub-zero Arctic freeze arrives, the system automatically switches to a high-efficiency gas furnace.

This ensures you enjoy whisper-quiet heating, lower carbon emissions, and total security when Denver dips to -10°F.

---

### Economic Comparison & Rebate Opportunities

1. **Operating Costs:** During moderate winter weather (35°F to 55°F), heat pumps deliver 2.5 to 3.5 units of heat for every 1 unit of electricity consumed.
2. **Rebates:** Colorado clean heat initiatives and local utilities offer significant rebates for qualified heat pump installations.
3. **Air Conditioning Included:** A heat pump replaces your air conditioner completely, giving you top-tier summer cooling along with heating.`,
    readingTimeMinutes: 6,
    canonicalUrl: 'https://pipeflowco.com/blog/heat-pumps-vs-furnaces-colorado-climate',
    noindex: false,
    faqs: [
      {
        question: 'Do heat pumps work below zero in Denver?',
        answer:
          'Cold-climate heat pumps can maintain heating capacity down to -13°F, though many Colorado homeowners pair them with a gas furnace for dual-fuel reliability.',
      },
    ],
    ctaType: 'hvac',
    relatedServiceSlug: 'heating-furnace',
    relatedServiceAreaSlug: 'denver',
    viewsCount: 980,
    createdAt: '2025-02-01T10:00:00.000Z',
  },
  {
    id: 'post-3',
    title: '5 Warning Signs Your Water Heater Is About to Fail',
    slug: 'warning-signs-water-heater-failure',
    seoTitle: '5 Warning Signs of Water Heater Failure | PipeFlow Co.',
    seoDescription:
      'Learn how to identify tank corrosion, anode rod depletion, and pressure valve leaks before your water heater floods your basement.',
    excerpt:
      'Most residential water heaters last between 8 and 12 years in Colorado. Spotting these five subtle indicators can save you from catastrophic basement flooding.',
    author: 'PipeFlow Master Trades Team',
    authorRole: 'Residential Plumbing Specialist',
    featuredImage: '/assets/service-plumbing.jpg',
    featuredImageAlt: 'Plumber inspecting water heater connections in residential utility room',
    categoryId: 'cat-1',
    categoryName: 'Plumbing Tips',
    categorySlug: 'plumbing',
    tags: ['Water Heater', 'Plumbing Maintenance', 'Leak Prevention'],
    publishedAt: '2025-02-14T08:00:00.000Z',
    updatedAt: '2025-02-14T08:00:00.000Z',
    status: 'published',
    body: `### The Hidden Risk in Your Mechanical Room

A typical residential water heater holds 40 to 50 gallons of pressurized water heated to 125°F. When an aged tank breaches, it doesn't just drip—it continuously discharges until the supply valve is manually shut off.

In Colorado, water mineral hardness accelerates sacrificial anode rod depletion. Here are the five critical warning signs:

---

### 1. Rusty or Discolored Hot Water
If tap water runs clear on cold but looks amber or rusty on hot, internal tank lining corrosion has begun.

### 2. Rumbling and Popping Noises
Mineral sediment settles at the bottom of the tank. As burners ignite, trapped water bubbles burst violently through the sediment layer.

### 3. Moisture or Pooling Around the Tank Base
Even minor weeping around fittings or the tank jacket indicates metal fatigue or internal tank perforation.

### 4. Lukewarm or Rapidly Depleted Hot Water
Failing heating elements or heavy calcium buildup on burners cuts recovery volume in half.

### 5. Age Over 10 Years
Check the manufacturer label serial number. If your unit was installed over a decade ago, proactive replacement prevents emergency damage.`,
    readingTimeMinutes: 4,
    canonicalUrl: 'https://pipeflowco.com/blog/warning-signs-water-heater-failure',
    noindex: false,
    faqs: [
      {
        question: 'Should I replace or repair my water heater?',
        answer:
          'If the tank itself is leaking or the unit is over 10 years old, replacement is typically the safest and most cost-effective decision.',
      },
    ],
    ctaType: 'plumbing',
    relatedServiceSlug: 'water-heater',
    viewsCount: 1650,
    createdAt: '2025-02-10T10:00:00.000Z',
  },
]

// In-memory / localStorage store for dynamic additions during runtime
let blogStore: BlogPost[] = [...initialBlogPosts]

export const blogService = {
  getPublishedPosts(): BlogPost[] {
    return blogStore
      .filter((p) => p.status === 'published')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  },

  getAllPosts(): BlogPost[] {
    return [...blogStore].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  getPostBySlug(slug: string): BlogPost | undefined {
    return blogStore.find((p) => p.slug === slug)
  },

  getPostById(id: string): BlogPost | undefined {
    return blogStore.find((p) => p.id === id)
  },

  getRelatedPosts(currentSlug: string, categoryId: string, limit = 3): BlogPost[] {
    return blogStore
      .filter((p) => p.slug !== currentSlug && p.status === 'published' && p.categoryId === categoryId)
      .slice(0, limit)
  },

  getCategories(): BlogCategory[] {
    return defaultBlogCategories
  },

  savePost(post: Partial<BlogPost> & { title: string }): BlogPost {
    const existingIndex = post.id ? blogStore.findIndex((p) => p.id === post.id) : -1

    const slug =
      post.slug ||
      post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

    const wordCount = (post.body || '').split(/\s+/).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    if (existingIndex >= 0) {
      const updated: BlogPost = {
        ...blogStore[existingIndex],
        ...post,
        slug,
        readingTimeMinutes: readingTime,
        updatedAt: new Date().toISOString(),
      } as BlogPost
      blogStore[existingIndex] = updated
      return updated
    } else {
      const newPost: BlogPost = {
        id: post.id || `post-${Date.now()}`,
        title: post.title,
        slug,
        seoTitle: post.seoTitle || `${post.title} | PipeFlow Co.`,
        seoDescription: post.seoDescription || post.excerpt || '',
        excerpt: post.excerpt || '',
        author: post.author || 'PipeFlow Team',
        authorRole: post.authorRole || 'Home Services Specialist',
        featuredImage: post.featuredImage || '/assets/service-plumbing.jpg',
        featuredImageAlt: post.featuredImageAlt || post.title,
        categoryId: post.categoryId || 'cat-1',
        categoryName:
          defaultBlogCategories.find((c) => c.id === post.categoryId)?.name || 'General',
        categorySlug:
          defaultBlogCategories.find((c) => c.id === post.categoryId)?.slug || 'general',
        tags: post.tags || ['Home Care'],
        publishedAt: post.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: (post.status as BlogStatus) || 'draft',
        body: post.body || '',
        readingTimeMinutes: readingTime,
        canonicalUrl: post.canonicalUrl || `https://pipeflowco.com/blog/${slug}`,
        noindex: Boolean(post.noindex),
        ogTitle: post.ogTitle || post.title,
        ogDescription: post.ogDescription || post.excerpt,
        ogImage: post.ogImage || post.featuredImage,
        faqs: post.faqs || [],
        ctaType: post.ctaType || 'plumbing',
        relatedServiceSlug: post.relatedServiceSlug,
        relatedServiceAreaSlug: post.relatedServiceAreaSlug,
        viewsCount: 0,
        createdAt: new Date().toISOString(),
      }
      blogStore.unshift(newPost)
      return newPost
    }
  },

  deletePost(id: string): boolean {
    const initialLength = blogStore.length
    blogStore = blogStore.filter((p) => p.id !== id)
    return blogStore.length < initialLength
  },

  updateStatus(id: string, status: BlogStatus): boolean {
    const post = blogStore.find((p) => p.id === id)
    if (post) {
      post.status = status
      post.updatedAt = new Date().toISOString()
      if (status === 'published' && !post.publishedAt) {
        post.publishedAt = new Date().toISOString()
      }
      return true
    }
    return false
  },

  duplicatePost(id: string): BlogPost | null {
    const original = blogStore.find((p) => p.id === id)
    if (!original) return null

    const duplicate: BlogPost = {
      ...original,
      id: `post-${Date.now()}`,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 0,
    }
    blogStore.unshift(duplicate)
    return duplicate
  },
}
