'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { useScrollPosition } from '@/hooks/useScrollPosition'

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

export const Navbar = () => {
  const scrollY = useScrollPosition()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isScrolled = scrollY > 80
  const pathname = usePathname()

  const navLinks = [
    { name: 'Accueil',     href: '/' },
    { name: 'Blog',        href: '/blog' },
    { name: 'Événements',  href: '/evenements' },
    { name: 'Faire un don', href: '/don' },
    { name: 'Contact',     href: '/contact' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ease-in-out ${isScrolled ? 'bg-white py-4 shadow-md' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="text-brand-600">
              <IconCross className="h-8 w-8" />
            </div>
            <div className="flex flex-col">
              <span className={`font-display text-xl font-bold leading-tight ${isScrolled ? 'text-brand-950' : 'text-white'}`}>CMDG</span>
              <span className={`hidden text-[10px] font-bold tracking-[0.2em] uppercase sm:block ${isScrolled ? 'text-neutral-500' : 'text-brand-200'}`}>
                Communauté des Messagers de Dieu
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative font-sans text-sm font-medium transition-colors hover:text-brand-600 ${isScrolled ? 'text-neutral-700' : 'text-white/90'}`}
              >
                {link.name}
                {pathname === link.href && (
                  <motion.div layoutId="nav-underline" className="absolute -bottom-1 left-0 h-0.5 w-full bg-brand-600" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden lg:block">
            <Link href="/login" className="rounded bg-brand-600 px-6 py-2.5 font-sans text-sm font-medium text-white transition-all hover:bg-brand-500">
              Se connecter
            </Link>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`lg:hidden ${isScrolled ? 'text-brand-950' : 'text-white'}`}>
            {isMenuOpen ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-0 z-40 flex flex-col bg-brand-950 pt-24"
          >
            <div className="flex flex-col items-center gap-0">
              {navLinks.map((link) => (
                <React.Fragment key={link.name}>
                  <Link href={link.href} onClick={() => setIsMenuOpen(false)} className="w-full py-8 text-center font-display text-3xl text-white transition-colors hover:text-brand-400">
                    {link.name}
                  </Link>
                  <div className="h-px w-full max-w-xs bg-brand-800 opacity-50" />
                </React.Fragment>
              ))}
              <div className="mt-12 w-full px-12">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block w-full rounded bg-brand-600 py-4 text-center font-sans text-lg font-medium text-white">
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

export const Footer = () => (
  <footer className="bg-brand-950 pt-20 text-white">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <IconCross className="h-8 w-8 text-brand-600" />
            <span className="font-display text-2xl font-bold tracking-widest">CMDG</span>
          </div>
          <p className="max-w-xs font-sans text-sm leading-relaxed text-brand-300">
            Une communauté dédiée à la proclamation de l'Évangile et à la transformation des vies par la puissance de Dieu.
          </p>
          <div className="flex gap-4">
            {(['Facebook', 'Instagram', 'YouTube', 'TikTok'] as const).map((s) => (
              <a key={s} href="#" className="font-sans text-xs text-brand-400 hover:text-brand-300 transition-colors">{s.slice(0,2)}</a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-6 font-display text-xl font-bold">Navigation</h4>
          <ul className="space-y-4 font-sans text-sm text-neutral-400">
            {[['Accueil','/'],['Blog','/blog'],['Événements','/evenements'],['Contact','/contact']].map(([n,h]) => (
              <li key={n}><Link href={h} className="transition-colors hover:text-brand-400">{n}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-6 font-display text-xl font-bold">Nos Églises</h4>
          <ul className="space-y-4 font-sans text-sm text-neutral-400">
            <li>CMDG Kinshasa - Gombe</li>
            <li>CMDG Kinshasa - Limete</li>
            <li>CMDG Lubumbashi</li>
            <li>CMDG Matadi</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-6 font-display text-xl font-bold">Contact</h4>
          <ul className="space-y-4 font-sans text-sm text-neutral-400">
            <li>123 Avenue de la Paix, Kinshasa, RDC</li>
            <li>+243 81 000 0000</li>
            <li>contact@messagersdedieu.org</li>
          </ul>
        </div>
      </div>
      <div className="mt-20 flex flex-col items-center justify-between border-t border-brand-800 py-8 md:flex-row">
        <p className="font-sans text-xs text-neutral-500">© 2024 Communauté des Messagers de Dieu. Tous droits réservés.</p>
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
