import { PHOTOS } from '@/lib/media/photos'
import { CmsImage } from './CmsImage'

/** Google-Maps-style map of the Denver / Boulder area with a faint photo behind it. Illustrative, not to scale. */
export function FrontRangeMap({ className = '' }: { className?: string }) {
  const cities: [string, number, number][] = [
    ['Longmont', 228, 70], ['Lafayette', 262, 150], ['Broomfield', 236, 196], ['Brighton', 392, 150], ['Arvada', 214, 240],
    ['Westminster', 292, 206], ['Thornton', 368, 214], ['Golden', 170, 292], ['Lakewood', 232, 310], ['Aurora', 400, 292],
    ['Littleton', 262, 372], ['Centennial', 356, 360], ['Parker', 430, 398], ['Castle Rock', 330, 456],
  ]
  const label = { fontFamily: 'Roboto, Inter, system-ui, sans-serif', paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3.5, strokeLinejoin: 'round' } as const
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 ${className}`}>
      <div className="absolute inset-0" aria-hidden="true">
        <CmsImage src={PHOTOS.denverAerial.src} decorative sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
      </div>
      <svg viewBox="0 0 600 520" className="relative block h-auto w-full" role="img" aria-label="Map of the Denver and Boulder service area">
        {/* land (slightly see-through so the photo behind shows faintly) */}
        <rect width="600" height="520" fill="#EEF0F2" fillOpacity="0.88" />
        {/* parks and water */}
        <g fillOpacity="0.9">
          <ellipse cx="96" cy="330" rx="86" ry="130" fill="#CFE8CB" />
          <ellipse cx="500" cy="170" rx="70" ry="48" fill="#D9EDD5" />
          <ellipse cx="196" cy="452" rx="74" ry="38" fill="#D9EDD5" />
          <ellipse cx="420" cy="320" rx="26" ry="14" fill="#A8D4F5" />
          <ellipse cx="128" cy="96" rx="34" ry="16" fill="#A8D4F5" />
        </g>
        <path d="M250 20 C268 120 292 210 286 300 S262 440 280 510" fill="none" stroke="#A8D4F5" strokeWidth="7" strokeLinecap="round" />
        {/* local streets */}
        <g stroke="#fff" strokeWidth="2.2" fill="none">
          {Array.from({ length: 12 }, (_, i) => <path key={`h${i}`} d={`M0 ${36 + i * 42} H600`} />)}
          {Array.from({ length: 14 }, (_, i) => <path key={`v${i}`} d={`M${16 + i * 44} 0 V520`} />)}
        </g>
        {/* highways: outline then fill, like a road map */}
        <g fill="none" strokeLinecap="round">
          {[
            'M312 20 C310 140 306 250 304 330 S300 470 296 510',
            'M20 292 C140 286 240 282 330 284 S520 282 590 288',
            'M306 270 C282 220 220 170 156 130',
          ].map((d) => (
            <g key={d}>
              <path d={d} stroke="#E0A82E" strokeWidth="9" />
              <path d={d} stroke="#F9D26B" strokeWidth="6" />
            </g>
          ))}
          <path d="M420 110 C486 220 486 340 410 440" stroke="#fff" strokeWidth="6" />
          <path d="M420 110 C486 220 486 340 410 440" stroke="#C9CDD2" strokeWidth="2" strokeDasharray="1 7" />
        </g>
        {/* service area */}
        <circle cx="306" cy="270" r="214" fill="#1F5FAD" fillOpacity="0.1" stroke="#1F5FAD" strokeWidth="4" />
        {/* labels */}
        <g fill="#3C4043" fontSize="12.5" fontWeight="500">
          {cities.map(([name, x, y]) => (
            <g key={name}>
              <circle cx={x} cy={y} r="3.5" fill="#70757A" stroke="#fff" strokeWidth="1.5" />
              <text x={x + 8} y={y + 4} style={label}>{name}</text>
            </g>
          ))}
          <text x="124" y="206" style={{ ...label, fontStyle: 'italic' }} fill="#5F6368" fontSize="12">Front Range foothills</text>
        </g>
        {/* Boulder and Denver markers */}
        {([['Boulder', 182, 152], ['Denver', 306, 272]] as const).map(([name, x, y]) => (
          <g key={name} transform={`translate(${x} ${y})`}>
            <path d="M0 0 C-14 -16 -16 -34 0 -38 C16 -34 14 -16 0 0Z" fill="#EA4335" stroke="#B3261E" strokeWidth="1.5" />
            <circle cx="0" cy="-24" r="5" fill="#fff" />
            <text x="16" y="-12" style={label} fill="#202124" fontSize="16" fontWeight="700">{name}</text>
          </g>
        ))}
        {/* map controls */}
        <g transform="translate(548 20)" fontFamily="Roboto, Inter, sans-serif" fontSize="22" fill="#5F6368">
          <rect width="34" height="68" rx="4" fill="#fff" stroke="#DADCE0" />
          <line x1="4" y1="34" x2="30" y2="34" stroke="#DADCE0" />
          <text x="17" y="24" textAnchor="middle">+</text>
          <text x="17" y="58" textAnchor="middle">−</text>
        </g>
        <text x="590" y="508" textAnchor="end" fontSize="9" fill="#5F6368" fontFamily="Roboto, Inter, sans-serif">Illustrative map · not to scale</text>
      </svg>
    </div>
  )
}
