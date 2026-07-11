'use client'
import Link from 'next/link'
import { motion } from 'motion/react'

const MINISTRY_AXES = [
  { title: 'Prédication de la Parole', desc: "Un enseignement biblique clair, appliqué à la vie quotidienne, pour bâtir des disciples affermis." },
  { title: 'Guérison & délivrance', desc: "Une prière d'autorité qui libère, restaure et relève ceux qui souffrent dans leur corps ou leur âme." },
  { title: 'Formation de leaders', desc: "Un accompagnement des serviteurs de Dieu pour multiplier les porteurs de vision dans chaque église." },
]

const MILESTONES = [
  { year: '1985', text: "Appel au ministère et lancement du tout premier groupe de prière à Pointe-Noire." },
  { year: '2005', text: "Ordination pastorale et élargissement du ministère d'évangélisation à travers le pays." },
  { year: '2018', text: "Structuration de la vision C.M.D en réseau d'églises avec des départements dédiés." },
  { year: 'Aujourd\u2019hui', text: "Visionnaire de 6 églises actives, prédicateur régulier et père spirituel de la communauté." },
]

export default function ProphetePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-950 selection:bg-brand-600 selection:text-white">

      {/* HERO */}
      <header className="relative flex h-[350px] w-full flex-col justify-center bg-brand-950 px-6 md:px-12 pt-20 overflow-hidden">
        <div className="absolute -right-24 -top-24 w-[400px] h-[400px] bg-accent-600/10 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative mx-auto w-full max-w-7xl">
          <nav className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span className="text-brand-800">/</span>
            <span className="text-white">Le Prophète</span>
          </nav>
          <h1 className="mt-8 font-display text-5xl font-extrabold text-white md:text-7xl leading-none">
            Le <span className="text-accent-400">Prophète</span>
          </h1>
          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-brand-400 uppercase">Visionnaire des Églises C.M.D</p>
        </motion.div>
      </header>

      {/* PORTRAIT + INTRO */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-16 items-start">
            <div className="relative w-full max-w-sm mx-auto lg:mx-0 aspect-[4/5] bg-brand-900 rounded-2xl overflow-hidden flex items-center justify-center border border-brand-800 lg:sticky lg:top-32">
              <span className="text-brand-400 text-sm italic px-6 text-center">[Photo : Pr. Jean Pasteur YALAKA]</span>
              <div className="absolute bottom-0 left-0 right-0 bg-brand-950/90 backdrop-blur-sm px-5 py-4">
                <p className="font-display font-bold text-white text-base leading-tight">Pr. Jean Pasteur YALAKA</p>
                <p className="font-sans text-brand-300 text-xs mt-1 uppercase tracking-wider">Visionnaire des Églises C.M.D</p>
              </div>
            </div>

            <div>
              <span className="font-sans text-accent-600 text-sm tracking-[0.2em] uppercase font-bold">Un homme, un appel</span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-brand-950 leading-tight mt-3">
                Un serviteur au cœur de père, une vision pour les nations
              </h2>
              <div className="space-y-6 mt-6 font-sans text-neutral-600 text-base leading-relaxed">
                <p>
                  Depuis plus de 40 ans, le Pasteur Jean YALAKA porte la vision de la Communauté des Messagers de Dieu : une Église vivante, ancrée dans la Parole, où chaque personne peut rencontrer Dieu et découvrir son identité en Christ.
                </p>
                <p>
                  Reconnu pour une prédication accessible et puissante, il met un accent particulier sur la restauration des familles, la formation de disciples engagés et l&apos;action sociale concrète au service des communautés les plus vulnérables.
                </p>
                <p>
                  Il accompagne aujourd&apos;hui un réseau de 6 églises, formant des pasteurs et des responsables de département dans une logique de multiplication plutôt que de centralisation.
                </p>
              </div>
              <blockquote className="border-l-4 border-accent-500 pl-5 mt-8 font-display text-lg italic text-brand-900">
                « Je ne prêche pas une religion, je transmets une relation vivante avec Dieu. »
                <footer className="mt-1 font-sans not-italic text-xs text-neutral-400 uppercase tracking-wider">Pr. Jean Pasteur YALAKA</footer>
              </blockquote>
              <div className="flex flex-wrap gap-4 mt-10">
                <Link href="/actualites?filter=SERMON" className="bg-accent-600 hover:bg-accent-500 text-white px-8 py-4 rounded-xl font-sans text-sm font-bold tracking-widest uppercase transition-all">
                  Écouter ses prédications
                </Link>
                <Link href="/contact" className="border border-brand-600 text-brand-600 hover:bg-brand-50 px-8 py-4 rounded-xl font-sans text-sm font-bold tracking-widest uppercase transition-all">
                  Demander une rencontre
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AXES DE MINISTÈRE */}
      <section className="bg-brand-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-sans text-accent-600 text-sm tracking-[0.2em] uppercase font-bold">Son ministère</span>
            <h2 className="font-display text-4xl font-extrabold text-brand-950 mt-2">Les axes de son appel</h2>
            <div className="w-[60px] h-[3px] bg-accent-500 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MINISTRY_AXES.map((a, i) => (
              <div key={i} className="bg-white p-8 border border-brand-100 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-600" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-brand-950 mb-3">{a.title}</h3>
                <p className="font-sans text-neutral-500 text-sm leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARCOURS */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-sans text-accent-600 text-sm tracking-[0.2em] uppercase font-bold">Parcours</span>
            <h2 className="font-display text-4xl font-extrabold text-brand-950 mt-2">Les grandes étapes de son ministère</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            {MILESTONES.map((m, i) => (
              <div key={i} className="flex gap-8 group">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-brand-950 flex items-center justify-center shrink-0 group-hover:bg-accent-600 transition-colors">
                    <span className="font-display text-[11px] font-extrabold text-white text-center leading-tight px-1">{m.year}</span>
                  </div>
                  {i < MILESTONES.length - 1 && <div className="w-[2px] flex-1 bg-brand-100 my-2" />}
                </div>
                <div className="pb-12">
                  <p className="font-sans text-neutral-600 text-base leading-relaxed pt-3">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-950 py-24 text-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <span className="font-sans text-accent-400 text-sm tracking-[0.2em] uppercase font-bold">Suivez son enseignement</span>
          <h2 className="font-display text-4xl font-extrabold text-white mt-3">Retrouvez toutes ses prédications</h2>
          <p className="font-sans text-brand-300 text-base mt-4 leading-relaxed">
            Articles, prédications et témoignages sont regroupés dans notre fil d&apos;actualité.
          </p>
          <Link href="/actualites?filter=SERMON" className="inline-block mt-10 bg-accent-600 hover:bg-accent-500 text-white px-10 py-4 rounded-xl font-sans text-sm font-bold tracking-widest uppercase transition-all">
            Voir les prédications →
          </Link>
        </div>
      </section>
    </div>
  )
}
