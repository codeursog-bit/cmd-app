'use client'
import Link from 'next/link'
import { motion } from 'motion/react'

const CHURCHES = [
  {
    name: 'CMD Pointe-Noire Tchimbamba',
    tag: 'Église mère · ex-Mucodec',
    address: 'Quartier Tchimbamba ex-Mucodec, Pointe-Noire',
    phone: '+242 06 000 0000',
    schedule: 'Dimanche 9h & 16h · Mercredi 18h',
    pastor: 'Pr. Jean Pasteur YALAKA',
  },
  {
    name: 'CMD Brazzaville',
    tag: 'Antenne capitale',
    address: 'Brazzaville, République du Congo',
    phone: '+242 06 000 0001',
    schedule: 'Dimanche 9h30',
    pastor: 'Pasteur local',
  },
  {
    name: 'CMD Pointe-Noire Ngoyo',
    tag: 'Quartier Ngoyo',
    address: 'Ngoyo, Pointe-Noire',
    phone: '+242 06 000 0002',
    schedule: 'Dimanche 9h',
    pastor: 'Pasteur local',
  },
  {
    name: 'CMD Pointe-Noire Tiétié',
    tag: 'Quartier Tiétié',
    address: 'Tiétié, Pointe-Noire',
    phone: '+242 06 000 0003',
    schedule: 'Dimanche 9h',
    pastor: 'Pasteur local',
  },
  {
    name: 'CMD Pointe-Noire Tchibala',
    tag: 'Quartier Tchibala',
    address: 'Tchibala, Pointe-Noire',
    phone: '+242 06 000 0004',
    schedule: 'Dimanche 9h',
    pastor: 'Pasteur local',
  },
  {
    name: 'CMD Pointe-Noire Matende',
    tag: 'Quartier Matende',
    address: 'Matende, Pointe-Noire',
    phone: '+242 06 000 0005',
    schedule: 'Dimanche 9h',
    pastor: 'Pasteur local',
  },
]

const IconPin = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>)
const IconClock = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>)
const IconPhone = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>)
const IconUser = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)

export default function EglisesPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-950 selection:bg-brand-600 selection:text-white">

      {/* HERO */}
      <header className="relative flex h-[350px] w-full flex-col justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-sky-950 px-6 md:px-12 pt-20 overflow-hidden">
        <div className="absolute -right-24 -top-24 w-[400px] h-[400px] bg-accent-600/10 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative mx-auto w-full max-w-7xl">
          <nav className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span className="text-brand-800">/</span>
            <span className="text-white">Nos Églises</span>
          </nav>
          <h1 className="mt-8 font-display text-5xl font-extrabold text-white md:text-7xl leading-none">
            Nos <span className="text-accent-400">Églises</span>
          </h1>
          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-brand-400 uppercase">6 implantations à Pointe-Noire et Brazzaville</p>
        </motion.div>
      </header>

      {/* LISTE DES ÉGLISES */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {CHURCHES.map((c, i) => (
              <div key={i} className="group bg-white border border-neutral-100 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-brand-100 transition-all">
                <div className="aspect-[16/9] bg-neutral-100 flex items-center justify-center border-b border-neutral-100 relative">
                  <span className="text-neutral-400 italic text-xs px-4 text-center">[Photo : {c.name}]</span>
                  <div className="absolute top-3 left-3 px-3 py-1 bg-brand-950/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {c.tag}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-extrabold text-brand-950 leading-snug group-hover:text-brand-600 transition-colors">{c.name}</h3>
                  <div className="mt-5 space-y-3 text-sm text-neutral-500">
                    <div className="flex items-start gap-3"><span className="text-accent-600 mt-0.5 shrink-0"><IconPin /></span><span>{c.address}</span></div>
                    <div className="flex items-center gap-3"><span className="text-accent-600 shrink-0"><IconClock /></span><span>{c.schedule}</span></div>
                    <div className="flex items-center gap-3"><span className="text-accent-600 shrink-0"><IconPhone /></span><span>{c.phone}</span></div>
                    <div className="flex items-center gap-3"><span className="text-accent-600 shrink-0"><IconUser /></span><span>{c.pastor}</span></div>
                  </div>
                  <Link href="/contact" className="inline-flex items-center gap-2 mt-6 text-brand-600 text-xs font-bold uppercase tracking-widest hover:text-accent-600 transition-colors">
                    Nous contacter
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-brand-950 to-sky-950 py-24 text-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <span className="font-sans text-accent-400 text-sm tracking-[0.2em] uppercase font-bold">Une église près de chez vous</span>
          <h2 className="font-display text-4xl font-extrabold text-white mt-3">Vous ne savez pas où aller ?</h2>
          <p className="font-sans text-brand-300 text-base mt-4 leading-relaxed">
            Contactez-nous et nous vous orienterons vers l&apos;église la plus proche de chez vous.
          </p>
          <Link href="/contact" className="inline-block mt-10 border border-brand-700 bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 text-white px-10 py-4 rounded-xl font-sans text-sm font-bold tracking-widest uppercase transition-all">
            Nous contacter →
          </Link>
        </div>
      </section>
    </div>
  )
}
