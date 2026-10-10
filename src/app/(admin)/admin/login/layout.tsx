import { Fraunces } from 'next/font/google'

// Login ka display font; baaki admin screens par koi asar nahi.
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap', axes: ['opsz'] })

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className={fraunces.variable}>{children}</div>
}
