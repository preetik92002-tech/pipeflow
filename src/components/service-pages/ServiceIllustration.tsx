import type { SERVICE_ILLUSTRATIONS } from '@/lib/cms-pages/sections/schema'

export type IllustrationKey = (typeof SERVICE_ILLUSTRATIONS)[number]

const NAVY = '#0b2545'
const TEAL = '#19b5ad'
const MID = '#13376a'
const PALE = '#d5e1ea'

const ART: Record<IllustrationKey, React.ReactNode> = {
  'water-heater': (
    <>
      <rect x="62" y="22" width="76" height="130" rx="14" fill={PALE} stroke={NAVY} strokeWidth="4" />
      <rect x="72" y="34" width="56" height="12" rx="6" fill={MID} />
      <circle cx="100" cy="76" r="14" fill="#fff" stroke={NAVY} strokeWidth="4" />
      <path d="M100 68v8l6 4" stroke={TEAL} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M82 152v14M118 152v14" stroke={NAVY} strokeWidth="5" strokeLinecap="round" />
      <path d="M82 22V10h-14M118 22V10h14" stroke={TEAL} strokeWidth="5" strokeLinecap="round" fill="none" />
    </>
  ),
  furnace: (
    <>
      <rect x="44" y="30" width="112" height="124" rx="10" fill={PALE} stroke={NAVY} strokeWidth="4" />
      <rect x="58" y="46" width="84" height="40" rx="6" fill="#fff" stroke={NAVY} strokeWidth="3" />
      <path d="M72 62h56M72 72h56" stroke={MID} strokeWidth="4" strokeLinecap="round" />
      <path d="M100 138c-9-8-10-16-2-24 1 6 5 8 8 6 2 5 2 12-6 18z" fill={TEAL} />
      <path d="M58 154v10M142 154v10" stroke={NAVY} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  'frozen-pipe': (
    <>
      <rect x="20" y="78" width="160" height="30" rx="8" fill={PALE} stroke={NAVY} strokeWidth="4" />
      <path d="M60 78v30M140 78v30" stroke={NAVY} strokeWidth="4" />
      {[50, 100, 150].map((x) => (
        <g key={x} stroke={TEAL} strokeWidth="3.5" strokeLinecap="round">
          <path d={`M${x} 40v28M${x - 10} 54h20M${x - 7} 44l14 20M${x + 7} 44l-14 20`} />
        </g>
      ))}
      <path d="M40 130c10 10 20 10 30 0s20-10 30 0 20 10 30 0 20-10 30 0" stroke={TEAL} strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ),
  'ac-vent': (
    <>
      <rect x="28" y="52" width="144" height="76" rx="10" fill={PALE} stroke={NAVY} strokeWidth="4" />
      {[70, 84, 98, 112].map((y) => (
        <path key={y} d={`M44 ${y}h112`} stroke={MID} strokeWidth="4" strokeLinecap="round" />
      ))}
      <path d="M60 148c8 6 16 6 24 0M96 148c8 6 16 6 24 0M132 148c8 6 16 6 24 0" stroke={TEAL} strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ),
  'ac-condenser': (
    <>
      <rect x="36" y="46" width="128" height="104" rx="12" fill={PALE} stroke={NAVY} strokeWidth="4" />
      <circle cx="100" cy="98" r="34" fill="#fff" stroke={NAVY} strokeWidth="4" />
      <g stroke={MID} strokeWidth="5" strokeLinecap="round">
        <path d="M100 98l0-26M100 98l22 13M100 98l-22 13" />
      </g>
      <circle cx="100" cy="98" r="5" fill={TEAL} />
      <path d="M52 150v10M148 150v10" stroke={NAVY} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  pipes: (
    <>
      <path d="M24 60h72v60h80" stroke={NAVY} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M24 60h72v60h80" stroke={PALE} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="78" y="86" width="36" height="14" rx="4" fill={TEAL} stroke={NAVY} strokeWidth="3" />
      <path d="M96 86V70" stroke={NAVY} strokeWidth="4" strokeLinecap="round" />
      <circle cx="96" cy="66" r="7" fill={TEAL} stroke={NAVY} strokeWidth="3" />
    </>
  ),
  thermostat: (
    <>
      <rect x="54" y="30" width="92" height="116" rx="18" fill={PALE} stroke={NAVY} strokeWidth="4" />
      <circle cx="100" cy="84" r="30" fill="#fff" stroke={NAVY} strokeWidth="4" />
      <path d="M100 66v18l10 6" stroke={TEAL} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M80 126h40" stroke={MID} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  building: (
    <>
      <rect x="40" y="50" width="120" height="100" rx="6" fill={PALE} stroke={NAVY} strokeWidth="4" />
      <rect x="62" y="30" width="34" height="20" rx="3" fill="#fff" stroke={NAVY} strokeWidth="3" />
      <rect x="108" y="34" width="30" height="16" rx="3" fill="#fff" stroke={NAVY} strokeWidth="3" />
      {[70, 98, 126].map((x) => (
        <rect key={x} x={x - 8} y="76" width="16" height="22" rx="2" fill={MID} />
      ))}
      <rect x="92" y="116" width="16" height="34" rx="2" fill={TEAL} />
    </>
  ),
}

/** Inline, local artwork for the service pages. With no `alt` the picture is decorative and hidden from screen readers. */
export function ServiceIllustration({ name, alt, className }: { name: IllustrationKey; alt?: string; className?: string }) {
  return (
    <svg viewBox="0 0 200 180" className={className} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} focusable="false">
      {ART[name] ?? ART.pipes}
    </svg>
  )
}
