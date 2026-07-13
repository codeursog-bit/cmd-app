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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const scrollY = useScrollPosition()
  const showStickyBar = scrollY > 220

  const navLinks = [
    { name: 'Accueil',                     href: '/' },
    { name: 'Tout sur notre communauté',   href: '/about' },
    { name: 'Le Prophète',                 href: '/prophete' },
    { name: 'Nos Eglises',                 href: '/eglises' },
    { name: 'Pour vous !',                 href: '/pour-vous' },
    { name: 'Nous Joindre',                href: '/contact' },
  ]

  return (
    <>
      <header className="relative z-50 w-full bg-white">
        {/* ── Bloc logo / titre / sous-titre (desktop) ── */}
        <div className="hidden lg:flex flex-col items-center py-6">
          <Link href="/" className="flex flex-col items-center">
            <img src="/logo-cmd.png" alt="CMD Logo" className="h-20 w-20 object-contain" />
            <h1 className="mt-2 font-orbit text-4xl xl:text-5xl font-bold text-brand-700 tracking-wide text-center">
              COMMUNAUTÉ DES MESSAGERS DE DIEU
            </h1>
            <p className="mt-1 font-sans text-sm font-semibold text-neutral-700 text-center">
              Ministère Mondial d&apos;Évangélisation et d&apos;Actions Sociales
            </p>
          </Link>
        </div>

        {/* ── Ligne de navigation (desktop) ── */}
        <nav className="hidden lg:flex items-center justify-center gap-10 border-t border-neutral-100 py-4">
          {navLinks.map(link => {
            const active = pathname === link.href
            return (
              <Link key={link.name} href={link.href}
                className={`relative font-sans text-sm font-medium transition-colors ${
                  active ? 'text-accent-600 font-bold' : 'text-neutral-700 hover:text-brand-600'
                }`}>
                {link.name}
                {active && <div className="absolute -bottom-2 left-0 h-0.5 w-full bg-accent-500" />}
              </Link>
            )
          })}
        </nav>

        {/* ── Barre compacte (mobile) ── */}
        <div className="flex lg:hidden items-center justify-between px-6 py-3 border-b border-neutral-100">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-cmd.png" alt="CMD Logo" className="h-10 w-10 object-contain" />
            <span className="font-orbit text-lg font-bold text-brand-700">CMD</span>
          </Link>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-brand-950">
            {isMenuOpen ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </header>

      {/* ── Barre fixe avec le logo, visible en permanence au scroll ── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-0 left-0 z-50 w-full bg-white shadow-md">
            <div className="container mx-auto flex items-center justify-between px-6 py-2.5">
              <Link href="/" className="flex items-center gap-2.5">
                <img src="/logo-cmd.png" alt="CMD Logo" className="h-9 w-9 object-contain" />
                <span className="font-orbit text-base font-bold text-brand-700 hidden sm:block">
                  COMMUNAUTÉ DES MESSAGERS DE DIEU
                </span>
              </Link>
              <div className="hidden lg:flex items-center gap-8">
                {navLinks.map(link => {
                  const active = pathname === link.href
                  return (
                    <Link key={link.name} href={link.href}
                      className={`font-sans text-sm font-medium transition-colors ${
                        active ? 'text-accent-600 font-bold' : 'text-neutral-700 hover:text-brand-600'
                      }`}>
                      {link.name}
                    </Link>
                  )
                })}
              </div>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-brand-950">
                {isMenuOpen ? <IconX /> : <IconMenu />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu mobile (overlay plein écran) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-0 z-40 flex flex-col bg-brand-950 pt-24 overflow-y-auto">
            <div className="flex flex-col items-center gap-0">
              {navLinks.map((link) => (
                <React.Fragment key={link.name}>
                  <Link href={link.href} onClick={() => setIsMenuOpen(false)}
                    className="w-full py-6 text-center font-display text-2xl text-white transition-colors hover:text-brand-400">
                    {link.name}
                  </Link>
                  <div className="h-px w-full max-w-xs bg-brand-800 opacity-50" />
                </React.Fragment>
              ))}
              <div className="mt-8 flex flex-col w-full px-12 gap-3 pb-12">
                <Link href="/don" onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center w-full rounded-lg border border-white/70 py-3 text-center font-sans text-base font-bold text-white transition-all duration-300 hover:border-transparent hover:bg-gradient-to-r hover:from-brand-600 hover:to-sky-500">
                  Faire un don
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
export const Footer = () => (
  <footer className="bg-brand-950 text-white">
    <div className="container mx-auto px-6 pt-16 pb-8">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
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
            {[['Accueil','/'],['Notre communauté','/about'],['Le Prophète','/prophete'],['Nos Églises','/eglises'],['Actualités','/actualites'],['Faire un don','/don'],['Contact','/contact']].map(([n,h]) => (
              <li key={n}><Link href={h} className="transition-colors hover:text-brand-400">{n}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-6 font-display text-lg font-bold">Contact</h4>
          <ul className="space-y-3 font-sans text-sm text-neutral-400">
            <li className="flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-brand-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Quartier Tchimbamba ex-mucodec, Pointe-Noire, République du Congo
            </li>
            <li className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +242 06 000 0000
            </li>
            <li className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              contact@messagersdedieu.org
            </li>
            <li className="pt-2">
              <Link href="/eglises" className="inline-flex items-center gap-1.5 text-brand-400 font-bold hover:text-brand-300 transition-colors">
                Voir nos 6 églises →
              </Link>
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
