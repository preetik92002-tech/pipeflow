/**
 * Har navigation par naya instance banta hai, isliye naya page ek chhota (0.35s) fade-in leta hai.
 * Kuch bhi block nahi hota: content turant DOM mein hai, sirf opacity/transform animate hote hain,
 * aur reduced-motion users ke liye koi animation nahi (CSS mein).
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>
}
