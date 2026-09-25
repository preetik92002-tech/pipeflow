import type { MetadataRoute } from 'next'
import { getPublicSeoSettings } from '@/lib/seo/metadata'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getPublicSeoSettings()
  const baseUrl = settings?.canonical_domain || process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'
  const source = settings?.robots_txt_custom || ''
  const allow = source.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*Allow:\s*(\S+)\s*$/i)
    return match ? [match[1]] : []
  })
  const disallow = source.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*Disallow:\s*(\S+)\s*$/i)
    return match ? [match[1]] : []
  })
  return {
    rules: [{ userAgent: '*', allow: allow.length ? allow : '/', disallow: [...new Set(['/admin/', '/api/', '/_next/', ...disallow])] }],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
