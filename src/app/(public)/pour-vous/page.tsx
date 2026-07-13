'use client'
import Link from 'next/link'
import { motion } from 'motion/react'

const RESOURCES = [
  {
    title: 'Nouveau ici ?',
    desc: "Tu es venu(e) pour la première fois ou tu découvres la CMD ? Découvre qui nous sommes et comment nous rejoindre.",
    cta: 'Découvrir la communauté',
    href: '/about',
  },
  {
    title: 'Demander une prière',
    desc: "Une épreuve, un besoin, une action de grâce ? Partage ta requête, notre équipe de prière intercède pour toi.",
    cta: 'Envoyer ma demande',
    href: '/contact',
  },
  {
    title: "S'inscrire au baptême",
    desc: "Tu veux faire le pas du baptême d'eau ou recevoir le baptême du Saint-Esprit ? Inscris-toi à la prochaine session.",
    cta: "M'inscrire",
    href: '/contact',
  },
  {
    title: 'Rejoindre un département',
    desc: "Louange, accueil, media, action sociale... trouve ta place et sers dans la communauté selon tes dons.",
    cta: 'Voir les départements',
    href: '/contact',
  },
  {
    title: 'Faire un don',
    desc: "Soutiens le ministère et les actions sociales de la CMD par tes dons et tes dîmes.",
    cta: 'Faire un don',
    href: '/don',
  },
  {
    title: 'Partager un témoignage',
    desc: "Dieu a fait quelque chose dans ta vie ? Partage ton témoignage pour encourager la communauté.",
    cta: 'Témoigner',
    href: '/contact',
  },
]

const FAQ = [
  { q: 'Comment se déroule un culte à la CMD ?', a: "Louange et adoration, partage de la Parole, moment de prière et communion fraternelle, dans une ambiance chaleureuse et accueillante." },
  { q: 'Puis-je venir sans être membre ?', a: "Bien sûr. Nos cultes et événements sont ouverts à tous, membres ou simples visiteurs." },
  { q: 'Comment devenir membre officiellement ?', a: "Après quelques cultes et un temps d'échange avec un responsable, tu peux rejoindre un parcours de nouveaux membres dans ton église locale." },
]

export default function PourVousPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-950 selection:bg-brand-600 selection:text-white">

      {/* HERO */}
      <header className="relative flex h-[350px] w-full flex-col justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-sky-950 px-6 md:px-12 overflow-hidden">
        <div className="absolute -right-24 -top-24 w-[400px] h-[400px] bg-accent-600/10 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative mx-auto w-full max-w-7xl">
          <nav className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span className="text-brand-800">/</span>
            <span className="text-white">Pour vous</span>
          </nav>
          <h1 className="mt-8 font-display text-5xl font-extrabold text-white md:text-7xl leading-none">
            Pour <span className="text-accent-400">vous</span>
          </h1>
          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-brand-400 uppercase">Tout ce dont tu as besoin, au même endroit</p>
        </motion.div>
      </header>

      {/* RESSOURCES */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="font-sans text-accent-600 text-sm tracking-[0.2em] uppercase font-bold">Un prochain pas</span>
            <h2 className="font-display text-4xl font-extrabold text-brand-950 mt-2">Quelle que soit ta situation aujourd&apos;hui</h2>
            <p className="font-sans text-neutral-500 text-base mt-4 leading-relaxed">
              Que tu découvres la CMD ou que tu fasses déjà partie de la famille, voici comment aller plus loin.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {RESOURCES.map((r, i) => (
              <div key={i} className="group bg-white border border-neutral-100 rounded-xl p-8 hover:shadow-xl hover:-translate-y-1 hover:border-brand-100 transition-all flex flex-col">
                <div className="w-11 h-11 rounded-lg bg-accent-100 flex items-center justify-center mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-600" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-brand-950 mb-3">{r.title}</h3>
                <p className="font-sans text-neutral-500 text-sm leading-relaxed flex-1">{r.desc}</p>
                <Link href={r.href} className="inline-flex items-center gap-2 mt-6 text-brand-600 text-xs font-bold uppercase tracking-widest group-hover:text-accent-600 transition-colors">
                  {r.cta}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-brand-50 py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <span className="font-sans text-accent-600 text-sm tracking-[0.2em] uppercase font-bold">Questions fréquentes</span>
            <h2 className="font-display text-4xl font-extrabold text-brand-950 mt-2">Tu te poses ces questions ?</h2>
          </div>
          <div className="space-y-6">
            {FAQ.map((f, i) => (
              <div key={i} className="bg-white border border-brand-100 rounded-xl p-8">
                <h3 className="font-display text-lg font-extrabold text-brand-950 mb-2">{f.q}</h3>
                <p className="font-sans text-neutral-500 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-brand-950 to-sky-950 py-24 text-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="font-display text-4xl font-extrabold text-white mt-3">Une question qui n&apos;est pas listée ici ?</h2>
          <p className="font-sans text-brand-300 text-base mt-4 leading-relaxed">
            Écris-nous directement, un membre de notre équipe te répondra rapidement.
          </p>
          <Link href="/contact" className="inline-block mt-10 border border-brand-700 bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 text-white px-10 py-4 rounded-xl font-sans text-sm font-bold tracking-widest uppercase transition-all">
            Nous contacter →
          </Link>
        </div>
      </section>
    </div>
  )
}
