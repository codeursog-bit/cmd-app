'use client'
import Link from 'next/link'
import { motion } from 'motion/react'

const CHURCHES = [
  { name: 'CMD Pointe-Noire Tchimbamba', note: 'Église mère · ex-Mucodec', lead: "Siège de la communauté" },
  { name: 'CMD Brazzaville', note: 'Capitale', lead: 'Antenne capitale' },
  { name: 'CMD Pointe-Noire Ngoyo', note: 'Quartier Ngoyo', lead: '' },
  { name: 'CMD Pointe-Noire Tiétié', note: 'Quartier Tiétié', lead: '' },
  { name: 'CMD Pointe-Noire Tchibala', note: 'Quartier Tchibala', lead: '' },
  { name: 'CMD Pointe-Noire Matende', note: 'Quartier Matende', lead: '' },
]

const VALUES = [
  { title: 'Excellence', desc: 'Nous croyons que Dieu mérite le meilleur de nous-mêmes dans tout ce que nous entreprenons.' },
  { title: 'Intégrité', desc: "La transparence et l'honnêteté sont au cœur de notre marche avec Dieu et avec les hommes." },
  { title: 'Compassion', desc: "L'amour de Dieu se manifeste par des actions concrètes envers ceux qui souffrent." },
  { title: 'Communion fraternelle', desc: "Nous grandissons ensemble, dans le partage et le soutien mutuel entre frères et sœurs." },
]

const TIMELINE = [
  { year: '1985', text: "Naissance du groupe de prière fondateur à Pointe-Noire, autour d'un appel à l'évangélisation." },
  { year: '1998', text: "Structuration en communauté et ouverture des premiers programmes d'action sociale." },
  { year: '2010', text: "Implantation à Brazzaville et lancement des cultes hebdomadaires retransmis." },
  { year: '2024', text: "Plus de 6 églises actives et une communauté de plus de 500 membres engagés." },
]

const STATS = [
  { value: '40+', label: 'Années de ministère' },
  { value: '6+', label: 'Églises' },
  { value: '500+', label: 'Membres' },
  { value: '50+', label: 'Événements par an' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-950 selection:bg-brand-600 selection:text-white">

      {/* HERO — même patron que /actualites : bandeau sombre + fil d'Ariane + halo orange */}
      <header className="relative flex h-[350px] w-full flex-col justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-sky-950 px-6 md:px-12 overflow-hidden">
        <div className="absolute -right-24 -top-24 w-[400px] h-[400px] bg-accent-600/10 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative mx-auto w-full max-w-7xl">
          <nav className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span className="text-brand-800">/</span>
            <span className="text-white">Notre communauté</span>
          </nav>
          <h1 className="mt-8 font-display text-5xl font-extrabold text-white md:text-7xl lg:text-8xl leading-none">
            Tout sur <span className="text-accent-400">notre communauté</span>
          </h1>
          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-brand-400 uppercase">Histoire, vision, valeurs et implantations de la CMD</p>
        </motion.div>
      </header>

      {/* MISSION */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="font-sans text-accent-600 text-sm tracking-[0.2em] uppercase font-bold">Notre histoire</span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-brand-950 leading-tight mt-3">
                Une vision pour la transformation des nations
              </h2>
              <div className="space-y-6 mt-6 font-sans text-neutral-600 text-base leading-relaxed">
                <p>
                  Fondée en 1985, la Communauté des Messagers de Dieu est née d&apos;un appel profond à proclamer l&apos;Évangile avec puissance et à agir concrètement pour le bien-être de la société congolaise.
                </p>
                <p>
                  Ce qui a commencé comme un petit groupe de prière est devenu aujourd&apos;hui un ministère multi-facettes, touchant des milliers de vies à travers nos églises et nos programmes d&apos;action sociale à Pointe-Noire et Brazzaville.
                </p>
              </div>
              <blockquote className="border-l-4 border-accent-500 pl-5 mt-8 font-display text-lg italic text-brand-900">
                « Allez, faites de toutes les nations des disciples… »
                <footer className="mt-1 font-sans not-italic text-xs text-neutral-400 uppercase tracking-wider">Matthieu 28:19</footer>
              </blockquote>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 border-t-[3px] border-l-[3px] border-accent-500 z-10" />
              <div className="bg-neutral-100 aspect-[4/5] w-full flex items-center justify-center relative rounded-lg overflow-hidden border border-neutral-200">
                <span className="text-neutral-400 italic text-sm px-6 text-center">[Photo : Fondateurs de la CMD]</span>
                <div className="absolute -bottom-4 -right-4 bg-white border border-neutral-200 px-4 py-2 z-20 rounded">
                  <span className="block font-sans font-bold text-brand-950 text-sm uppercase tracking-widest">Depuis 1985</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <section className="bg-brand-950 py-16 border-y border-brand-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 items-center">
            {STATS.map((s, i) => (
              <div key={i} className="flex flex-col items-center lg:items-start lg:px-12 relative">
                <span className="font-display text-5xl text-white font-extrabold leading-none">{s.value}</span>
                <span className="font-sans text-brand-300 text-xs tracking-wider uppercase mt-3">{s.label}</span>
                {i < STATS.length - 1 && <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-brand-800" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARCOURS / TIMELINE */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-sans text-accent-600 text-sm tracking-[0.2em] uppercase font-bold">Notre parcours</span>
            <h2 className="font-display text-4xl font-extrabold text-brand-950 mt-2">Les grandes étapes</h2>
            <div className="w-[60px] h-[3px] bg-accent-500 mx-auto mt-4" />
          </div>
          <div className="max-w-3xl mx-auto space-y-0">
            {TIMELINE.map((t, i) => (
              <div key={i} className="flex gap-8 group">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-brand-950 flex items-center justify-center shrink-0 group-hover:bg-accent-600 transition-colors">
                    <span className="font-display text-xs font-extrabold text-white">{t.year}</span>
                  </div>
                  {i < TIMELINE.length - 1 && <div className="w-[2px] flex-1 bg-brand-100 my-2" />}
                </div>
                <div className="pb-12">
                  <p className="font-sans text-neutral-600 text-base leading-relaxed pt-3">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section className="bg-brand-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-sans text-accent-600 text-sm tracking-[0.2em] uppercase font-bold">Ce qui nous anime</span>
            <h2 className="font-display text-4xl font-extrabold text-brand-950 mt-2">Nos valeurs fondamentales</h2>
            <div className="w-[60px] h-[3px] bg-accent-500 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, idx) => (
              <div key={idx} className="bg-white p-8 border border-brand-100 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-600" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-brand-950 mb-3">{value.title}</h3>
                <p className="font-sans text-neutral-500 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISIONNAIRE */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-16 items-center">
            <div className="relative w-full max-w-sm mx-auto lg:mx-0 aspect-[4/5] bg-brand-900 rounded-2xl overflow-hidden flex items-center justify-center border border-brand-800">
              <span className="text-brand-400 text-sm italic px-6 text-center">[Photo : Pasteur Visionnaire]</span>
              <div className="absolute bottom-0 left-0 right-0 bg-brand-950/90 backdrop-blur-sm px-5 py-4">
                <p className="font-display font-bold text-white text-base leading-tight">Pr. Jean Pasteur YALAKA</p>
                <p className="font-sans text-brand-300 text-xs mt-1 uppercase tracking-wider">Visionnaire des Églises C.M.D</p>
              </div>
            </div>
            <div>
              <span className="font-sans text-accent-600 text-sm tracking-[0.2em] uppercase font-bold">Le visionnaire</span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-brand-950 leading-tight mt-3">
                Porté par un appel, guidé par une vision
              </h2>
              <p className="font-sans text-neutral-600 text-base leading-relaxed mt-6 max-w-2xl">
                Depuis la fondation de la communauté, le Pasteur Jean YALAKA porte la vision d&apos;une Église vivante, ancrée dans la Parole et engagée dans la transformation concrète des vies et de la société. Sa prédication met l&apos;accent sur la restauration, la puissance de Dieu à l&apos;œuvre au quotidien et la communion fraternelle entre les membres.
              </p>
              <Link href="/actualites" className="inline-flex items-center group mt-8">
                <span className="font-sans text-brand-600 font-bold text-sm tracking-widest uppercase border-b border-transparent group-hover:border-brand-600 transition-all">Voir ses enseignements →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NOS ÉGLISES */}
      <section className="bg-brand-950 py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16">
            <div>
              <span className="font-sans text-accent-400 text-sm tracking-[0.2em] uppercase font-bold">Implantations</span>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white mt-2">Nos Églises</h2>
            </div>
            <Link href="/contact" className="font-sans text-sm font-bold text-white/80 hover:text-white tracking-widest uppercase border-b border-transparent hover:border-accent-400 transition-all whitespace-nowrap">
              Trouver la plus proche →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHURCHES.map((c, i) => (
              <div key={i} className="group bg-brand-900 border border-brand-800 rounded-xl p-6 hover:border-accent-500 transition-all">
                <div className="flex items-start gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0 text-accent-500">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <h3 className="font-display font-bold text-white text-base leading-snug group-hover:text-accent-300 transition-colors">{c.name}</h3>
                    <p className="font-sans text-brand-400 text-xs mt-1 uppercase tracking-wide">{c.note}</p>
                    {c.lead && <p className="font-sans text-brand-500 text-xs mt-2">{c.lead}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-24 text-center border-t border-neutral-100">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="font-display text-4xl font-extrabold text-brand-950 mb-4">Envie d&apos;en faire partie ?</h2>
          <p className="font-sans text-neutral-500 text-base leading-relaxed mb-10">
            Rejoins-nous lors d&apos;un prochain culte ou contacte-nous pour en savoir plus sur la vie de la communauté.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/actualites?filter=EVENT" className="border border-brand-700 bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 text-white px-8 py-4 rounded-xl font-sans text-sm font-bold tracking-widest uppercase transition-all">
              Voir nos prochains cultes
            </Link>
            <Link href="/contact" className="border border-brand-600 text-brand-600 hover:bg-brand-50 px-8 py-4 rounded-xl font-sans text-sm font-bold tracking-widest uppercase transition-all">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
