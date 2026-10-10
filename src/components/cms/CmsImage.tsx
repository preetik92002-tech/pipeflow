import Image from 'next/image'

/**
 * next/image only optimises hosts listed in next.config.ts (our own site and
 * Supabase storage). Any other https image is still shown, just not optimised.
 */
const OPTIMISED = /^(\/(?!\/)|https:\/\/[a-z0-9-]+\.supabase\.co\/)/i

export function CmsImage({
  src,
  alt,
  className,
  priority = false,
  sizes = '(min-width: 1024px) 50vw, 100vw',
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
}) {
  if (OPTIMISED.test(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} className={`absolute inset-0 h-full w-full ${className ?? ''}`} />
}
