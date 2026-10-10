import Image from 'next/image'
import { resolveImage } from '@/lib/media/photos'

/**
 * next/image only optimises hosts listed in next.config.ts (our own site and
 * Supabase storage). Any other https image is still shown, just not optimised.
 */
const OPTIMISED = /^(\/(?!\/)|https:\/\/[a-z0-9-]+\.supabase\.co\/)/i

/**
 * Stored src ko pehle resolveImage se guzaarte hain: purane /art/*.svg paths asli photos ban jaate
 * hain, alt text aur crop (focus) ke saath. `decorative` images (sirf background) ka alt hamesha khaali.
 */
export function CmsImage({
  src,
  alt = '',
  decorative = false,
  className,
  priority = false,
  sizes = '(min-width: 1024px) 50vw, 100vw',
}: {
  src: string
  alt?: string
  decorative?: boolean
  className?: string
  priority?: boolean
  sizes?: string
}) {
  const img = resolveImage(src, alt)
  const finalAlt = decorative ? '' : img.alt
  const style = img.focus ? { objectPosition: img.focus } : undefined
  if (OPTIMISED.test(img.src)) {
    // priority = preload + eager; fetchPriority=high alag se dena padta hai (Next 16 ise khud nahi lagata), warna hero photo Low priority par aati thi.
    return <Image src={img.src} alt={finalAlt} fill sizes={sizes} priority={priority} fetchPriority={priority ? 'high' : undefined} className={className} style={style} />
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={img.src} alt={finalAlt} loading={priority ? 'eager' : 'lazy'} className={`absolute inset-0 h-full w-full ${className ?? ''}`} style={style} />
}
