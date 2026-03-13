'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { apiFetch } from '@/hooks/useApi'

// ── Icônes SVG ────────────────────────────────────────────────────────────────
const IconCross = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M7 7h10" />
  </svg>
)
const IconMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
  </svg>
)
const IconX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconHeart = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14m-7-7 7 7-7 7"/>
  </svg>
)
const IconFacebook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)
const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
  </svg>
)
const IconYoutube = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
  </svg>
)
const IconTiktok = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
)

// ── Navbar ────────────────────────────────────────────────────────────────────
export const Navbar = () => {
  const scrollY = useScrollPosition()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isScrolled = scrollY > 60
  const pathname = usePathname()

  // Pages avec fond clair (contact, etc.) — la navbar doit toujours être visible
  const lightPages = ['/contact', '/don', '/about']
  const isLightPage = lightPages.some(p => pathname.startsWith(p))
  const isDark = !isScrolled && !isLightPage

  const navLinks = [
    { name: 'Accueil',    href: '/' },
    { name: 'Blog',       href: '/blog' },
    { name: 'Événements', href: '/evenements' },
    { name: 'Contact',    href: '/contact' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ease-in-out ${
        isScrolled || isLightPage ? 'bg-white py-3 shadow-md' : 'bg-transparent py-5'
      }`}>
        <div className="container mx-auto flex items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo-cmd.png" alt="CMD Logo" className="h-12 w-12 object-contain" />
            <div className="flex flex-col">
              <span className={`font-display text-xl font-bold leading-tight ${isDark ? 'text-white' : 'text-brand-950'}`}>CMD</span>
              <span className={`hidden text-[10px] font-bold tracking-[0.2em] uppercase sm:block ${isDark ? 'text-brand-300' : 'text-neutral-500'}`}>
                Communauté des Messagers de Dieu
              </span>
            </div>
          </Link>

          {/* Links desktop */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}
                className={`relative font-sans text-sm font-medium transition-colors hover:text-brand-600 ${isDark ? 'text-white/90' : 'text-neutral-700'}`}>
                {link.name}
                {pathname === link.href && (
                  <motion.div layoutId="nav-underline" className="absolute -bottom-1 left-0 h-0.5 w-full bg-brand-600" />
                )}
              </Link>
            ))}
          </div>

          {/* CTA desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/don"
              className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 font-sans text-sm font-bold transition-all ${
                isDark
                  ? 'border-brand-400 text-brand-300 hover:bg-brand-800'
                  : 'border-brand-600 text-brand-600 hover:bg-brand-50'
              }`}>
              <IconHeart />
              Faire un don
            </Link>
            <Link href="/login"
              className="rounded-lg bg-brand-600 px-5 py-2 font-sans text-sm font-bold text-white transition-all hover:bg-brand-700 shadow-sm">
              Se connecter
            </Link>
          </div>

          {/* Burger mobile */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden ${isDark ? 'text-white' : 'text-brand-950'}`}>
            {isMenuOpen ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-0 z-40 flex flex-col bg-brand-950 pt-24">
            <div className="flex flex-col items-center gap-0">
              {navLinks.map((link) => (
                <React.Fragment key={link.name}>
                  <Link href={link.href} onClick={() => setIsMenuOpen(false)}
                    className="w-full py-7 text-center font-display text-3xl text-white transition-colors hover:text-brand-400">
                    {link.name}
                  </Link>
                  <div className="h-px w-full max-w-xs bg-brand-800 opacity-50" />
                </React.Fragment>
              ))}
              <div className="mt-8 flex flex-col w-full px-12 gap-3">
                <Link href="/don" onClick={() => setIsMenuOpen(false)}
                  className="block w-full rounded-lg border border-brand-400 py-3 text-center font-sans text-base font-bold text-brand-300">
                  Faire un don
                </Link>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}
                  className="block w-full rounded-lg bg-brand-600 py-3 text-center font-sans text-base font-bold text-white">
                  Se connecter
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Newsletter (fonctionnelle) ────────────────────────────────────────────────
const NewsletterSection = () => {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setState('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) { setState('success'); setEmail('') }
      else { setState('error'); setTimeout(() => setState('idle'), 3000) }
    } catch {
      setState('error'); setTimeout(() => setState('idle'), 3000)
    }
  }

  return (
    <div className="bg-brand-900 border-t border-brand-800 py-14">
      <div className="container mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-800 rounded-2xl mb-5">
          <IconMail />
        </div>
        <h3 className="font-display text-2xl font-bold text-white mb-2">Restez connecté</h3>
        <p className="text-brand-300 text-sm mb-7 max-w-sm mx-auto">Recevez nos prédications, témoignages et annonces directement dans votre boîte mail.</p>

        {state === 'success' ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-900/50 border border-emerald-700 rounded-xl text-emerald-300 text-sm font-bold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Merci ! Vous êtes bien inscrit(e).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="flex-1 px-4 py-3 rounded-xl bg-brand-800 border border-brand-700 text-white placeholder:text-brand-500 text-sm focus:outline-none focus:border-brand-400 transition-colors"
            />
            <button type="submit" disabled={state === 'loading'}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 whitespace-nowrap">
              {state === 'loading' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><IconArrow /> S&apos;abonner</>
              )}
            </button>
          </form>
        )}
        {state === 'error' && <p className="text-red-400 text-xs mt-3">Une erreur s&apos;est produite. Réessayez.</p>}
      </div>
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
export const Footer = () => (
  <footer className="bg-brand-950 text-white">
    <NewsletterSection />
    <div className="container mx-auto px-6 pt-16 pb-8">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <img src="/logo-cmd.png" alt="CMD Logo" className="h-12 w-12 object-contain" />
            <span className="font-display text-2xl font-bold tracking-widest">CMD</span>
          </div>
          <p className="max-w-xs font-sans text-sm leading-relaxed text-brand-300">
            Une communauté dédiée à la proclamation de l&apos;Évangile et à la transformation des vies par la puissance de Dieu.
          </p>
          <div className="flex gap-3">
            {[
              { icon: <IconFacebook />, href: '#', label: 'Facebook' },
              { icon: <IconInstagram />, href: '#', label: 'Instagram' },
              { icon: <IconYoutube />, href: '#', label: 'YouTube' },
              { icon: <IconTiktok />, href: '#', label: 'TikTok' },
            ].map(s => (
              <a key={s.label} href={s.href} title={s.label}
                className="w-8 h-8 rounded-lg bg-brand-800 hover:bg-brand-700 flex items-center justify-center text-brand-400 hover:text-brand-200 transition-colors">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-6 font-display text-lg font-bold">Navigation</h4>
          <ul className="space-y-3 font-sans text-sm text-neutral-400">
            {[['Accueil','/'],['Blog','/blog'],['Événements','/evenements'],['Faire un don','/don'],['Contact','/contact']].map(([n,h]) => (
              <li key={n}><Link href={h} className="transition-colors hover:text-brand-400">{n}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-6 font-display text-lg font-bold">Nos Églises</h4>
          <ul className="space-y-3 font-sans text-sm text-neutral-400">
            <li>CMD Pointe-Noire - Centre</li>
            <li>CMD Brazzaville - Plateau</li>
            <li>CMD Lubumbashi</li>
            <li>CMD Matadi</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 font-display text-lg font-bold">Contact</h4>
          <ul className="space-y-3 font-sans text-sm text-neutral-400">
            <li className="flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-brand-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Avenue de la Paix, Pointe-Noire, République du Congo
            </li>
            <li className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +243 81 000 0000
            </li>
            <li className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              contact@messagersdedieu.org
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center justify-between border-t border-brand-800 pt-8 pb-4 md:flex-row">
        <p className="font-sans text-xs text-neutral-500">© {new Date().getFullYear()} Communauté des Messagers de Dieu. Tous droits réservés.</p>
        <div className="mt-4 flex gap-6 font-sans text-xs text-neutral-500 md:mt-0">
          <a href="#" className="hover:text-brand-400">Confidentialité</a>
          <a href="#" className="hover:text-brand-400">Mentions Légales</a>
        </div>
      </div>
    </div>
  </footer>
)

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}
