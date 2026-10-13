/**
 * PipeFlow brand palette: ek hi jagah. Tailwind (tailwind.config.ts) aur tests dono isi se padhte hain, isliye
 * rang kabhi alag nahi hote aur contrast ke rules code mein likhe hue hain.
 *
 * Use: ivory aur white surfaces, ink (navy) typography aur structure ke liye, terra (muted terracotta) sirf
 * restrained accent aur important action ke liye. Koi bright blue, neon ya glossy gradient nahi.
 */
export const palette = {
  ivory: '#EEF3FA',
  ink: '#0F2040',
  terra: '#C41E1E',
  /** Hover/pressed state of terra. */
  terraDark: '#A31818',
  /** Terracotta ka halka roop: sirf gehre (ink) background par chhote labels/numbers ke liye. terra khud ink par 2.97:1 hai (fail). */
  terraLight: '#F4A3A3',
  stone: '#CBD7E8',
  white: '#FFFFFF',
  /** Warm stone ka halka tint: photo placeholder aur dividers. */
  mist: '#E1EAF6',
  /** Form field ka border: stone border white par sirf 1.5:1 hai, fields ko kam se kam 3:1 chahiye. */
  field: '#7D766A',
  error: { bg: '#FBEDEB', border: '#E3B2A9', text: '#8C2F22' },
} as const

function channel(hex: string, i: number) {
  const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}
const luminance = (hex: string) => 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2)

/** WCAG 2.x contrast ratio between two #RRGGBB colours. AA text: 4.5, large text and UI parts: 3. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
