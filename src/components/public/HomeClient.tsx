'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'
import { apiFetch } from '@/hooks/useApi'
import PostCard from '@/components/public/PostCard'
import NewsTicker from '@/components/public/NewsTicker'

interface Post {
  id: string; title: string; excerpt: string | null; type: string; slug: string
  author: { firstName: string; lastName: string }; publishedAt: string | null
  coverUrl: string | null; audioUrl: string | null; videoUrl: string | null
}
interface Event {
  id: string; title: string; slug: string; startDate: string
  location: string | null; description: string | null; status: string
}

const HERO_VIDEOS = [
  { src: '/videos/church-bg.mp4', duration: 20000 },
]

function HeroVideo() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading]   = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const goTo = (index: number) => {
    clearTimeout(timerRef.current)
    setFading(true)
    setTimeout(() => { setCurrent(index); setFading(false) }, 700)
  }
  const goNext = () => goTo((current + 1) % HERO_VIDEOS.length)

  useEffect(() => {
    if (HERO_VIDEOS.length <= 1) return
    timerRef.current = setTimeout(goNext, HERO_VIDEOS[current].duration)
    return () => clearTimeout(timerRef.current)
  }, [current])

  return (
    <video key={HERO_VIDEOS[current].src} autoPlay muted loop={HERO_VIDEOS.length === 1} playsInline preload="auto"
      className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <source src={HERO_VIDEOS[current].src} type="video/mp4" />
    </video>
  )
}

export default function HomeClient() {
  const [email, setEmail]     = useState('')
  const [firstName, setFirst] = useState('')
  const [sent, setSent]       = useState(false)

  const { data: postsData }        = useApi<{ posts: Post[] }>('/api/posts?limit=3&status=PUBLISHED')
  const { data: upcomingData }     = useApi<{ events: Event[] }>('/api/events?status=UPCOMING&limit=6')
  const { data: recentEventsData } = useApi<{ events: Event[] }>('/api/events?status=COMPLETED&limit=3')

  const handleSubscribe = async () => {
    if (!email || !firstName) return
    await apiFetch('/api/newsletter', 'POST', { email, firstName })
    setSent(true)
  }

  const stats = [
    { value: '40+', label: 'Années de ministère' },
    { value: '6+',   label: 'Églises' },
    { value: '500+',label: 'Membres' },
    { value: '50+', label: 'Événements par an' },
  ]

  const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
  const upcoming = upcomingData?.events || []
  const featured  = upcoming[0]
  const rest      = upcoming.slice(1, 4)
  const recent    = recentEventsData?.events || []

  const posts = postsData?.posts || []
  const tickerItems = [
    { id: 'announce-1', label: 'Lancement de la préparation du Retour au réveil Charismatique' },
    ...posts.map(p => ({ id: p.id, label: p.title })),
    ...upcoming.slice(0, 3).map(e => ({ id: e.id, label: `À venir : ${e.title}` })),
  ]

  const featuredDate = featured ? new Date(featured.startDate) : null

  return (
    <div className="min-h-screen bg-white selection:bg-brand-500 selection:text-white">

      {/* HERO — bannière événement (esprit de l'image, format desktop) */}
      <section className="relative w-full min-h-[92vh] overflow-hidden flex items-center pt-24">
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/95 via-brand-900/90 to-brand-800/80 z-0" />
        {/* Touches orange décoratives */}
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] bg-accent-600/20 rounded-full blur-3xl z-0" />

        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-12 items-center">

            {/* Colonne portrait / identité */}
            <div className="flex flex-col items-start">
              <div className="relative w-full aspect-[4/5] max-w-sm bg-brand-800/60 border border-brand-700 rounded-2xl overflow-hidden flex items-center justify-center">
                <span className="text-brand-400 text-sm italic px-6 text-center">[Photo : Pasteur / Visionnaire]</span>
                <div className="absolute bottom-0 left-0 right-0 bg-brand-950/90 backdrop-blur-sm px-5 py-4">
                  <p className="font-display font-bold text-white text-base leading-tight">Pr. Jean Pasteur YALAKA</p>
                  <p className="font-sans text-brand-300 text-xs mt-1 uppercase tracking-wider">Visionnaire des Églises C.M.D</p>
                </div>
              </div>
              <div className="mt-8 hidden lg:block">
                <span className="font-sans font-light tracking-[0.3em] text-brand-300 text-xs uppercase">Communauté des</span>
                <p className="font-display font-extrabold text-3xl text-white leading-none mt-1">MESSAGERS DE DIEU</p>
              </div>
            </div>

            {/* Colonne événement */}
            <div>
              <h1 className="font-display font-extrabold text-4xl md:text-6xl xl:text-7xl leading-[0.95] text-white">
                Grande Culte de<br />
                <span className="text-accent-400">Pentecôte</span>
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-8">
                {featuredDate ? (
                  <div className="flex flex-col items-center justify-center bg-accent-600 rounded-xl px-6 py-3 shadow-lg shadow-accent-900/30">
                    <span className="font-sans text-white text-xs font-bold uppercase tracking-widest">
                      {['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][featuredDate.getDay()]}
                    </span>
                    <span className="font-display text-2xl font-extrabold text-white leading-none mt-1">
                      {String(featuredDate.getDate()).padStart(2, '0')} {MONTHS[featuredDate.getMonth()]}
                    </span>
                    <span className="font-sans text-white/80 text-xs">{featuredDate.getFullYear()}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center bg-accent-600 rounded-xl px-6 py-3">
                    <span className="font-sans text-white text-xs font-bold uppercase tracking-widest">Dim</span>
                    <span className="font-display text-2xl font-extrabold text-white leading-none mt-1">24 Mai</span>
                    <span className="font-sans text-white/80 text-xs">2026</span>
                  </div>
                )}
                <Link href="/contact"
                  className="bg-white hover:bg-brand-50 text-brand-900 px-8 py-4 rounded-xl font-sans text-sm font-bold tracking-wide uppercase transition-all shadow-lg">
                  Tu es notre invité !
                </Link>
              </div>

              <div className="mt-10 border-t border-brand-700/60 pt-8">
                <span className="font-sans text-accent-400 text-xs font-bold uppercase tracking-[0.25em]">Au programme</span>
                <p className="font-sans text-brand-200 text-sm md:text-base leading-relaxed mt-3 max-w-xl">
                  {featured?.description || 'Moments de Restauration · Moments de Prières · Moments de Louange et Adoration · Sainte Cène · Partage de la parole · Communion Fraternelle · Et bien plus encore…'}
                </p>
              </div>

              <div className="flex gap-4 mt-10">
                <Link href="/actualites?filter=EVENT" className="font-sans text-sm font-bold text-white/80 hover:text-white tracking-widest uppercase border-b border-transparent hover:border-accent-400 transition-all">
                  Voir tout l&apos;agenda →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER ACTUALITÉS — remplace le bandeau "Dernières nouvelles" de l'image */}
      <NewsTicker items={tickerItems} />

      {/* STATS */}
      <section className="bg-brand-950 py-12 border-b border-brand-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 items-center">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center lg:items-start lg:px-12 relative">
                <span className="font-display text-5xl text-white font-extrabold leading-none">{s.value}</span>
                <span className="font-sans text-brand-300 text-xs tracking-wider uppercase mt-3">{s.label}</span>
                {i < stats.length - 1 && <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-brand-800" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BIENVENUE */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 border-t-[3px] border-l-[3px] border-accent-500 z-10" />
              <div className="bg-neutral-200 aspect-[4/5] w-full flex items-center justify-center relative rounded-lg overflow-hidden">
                <span className="text-neutral-400 text-sm italic">[Photo : l&apos;assemblée en culte]</span>
                <div className="absolute -bottom-4 -right-4 bg-white border border-neutral-200 px-4 py-2 z-20 rounded">
                  <span className="block font-sans font-bold text-brand-950 text-sm uppercase tracking-widest">Depuis 1985</span>
                </div>
              </div>
            </div>
            <div className="lg:pl-12">
              <span className="font-sans text-accent-600 text-sm tracking-[0.2em] uppercase font-bold">Bienvenue</span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-brand-950 leading-tight mt-3">
                Tu es aussi un enfant de Dieu…<br className="hidden md:block" /> notre communauté est aussi la tienne !
              </h2>
              <p className="font-sans text-neutral-600 text-base leading-relaxed mt-6">
                Ici, tu n&apos;es pas venu(e) par hasard. Dieu t&apos;a conduit(e) dans ce lieu pour un but précis.
                La CMD est une famille spirituelle où règnent l&apos;amour, la communion fraternelle, la croissance dans la foi et la manifestation de la puissance de Dieu.
              </p>
              <blockquote className="border-l-4 border-accent-500 pl-5 my-8 font-display text-lg italic text-brand-900">
                « Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d&apos;eux. »
                <footer className="mt-1 font-sans not-italic text-xs text-neutral-400 uppercase tracking-wider">Matthieu 18:20</footer>
              </blockquote>
              <div className="w-full h-[1px] bg-brand-100 mb-8" />
              <Link href="/about" className="inline-flex items-center group">
                <span className="font-sans text-brand-600 font-bold text-sm tracking-widest uppercase border-b border-transparent group-hover:border-brand-600 transition-all">Découvrir notre histoire →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLICATIONS */}
      <section className="bg-brand-950 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <span className="font-sans text-accent-400 text-sm tracking-[0.2em] uppercase font-bold">Fil d&apos;actualité</span>
            <h2 className="font-display text-5xl text-white font-extrabold mt-2">Actualités &amp; Enseignements</h2>
            <div className="w-[60px] h-[3px] bg-accent-500 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {posts.length ? posts.map(p => (
              <PostCard key={p.id} category={p.type} title={p.title} excerpt={p.excerpt || ''}
                author={`${p.author.firstName} ${p.author.lastName}`}
                date={p.publishedAt ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(p.publishedAt)) : ''}
                slug={p.slug} coverUrl={p.coverUrl} audioUrl={p.audioUrl} videoUrl={p.videoUrl} />
            )) : Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-brand-900 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Link href="/actualites" className="border border-accent-500 text-accent-400 px-8 py-3 font-sans text-sm font-bold tracking-widest uppercase hover:bg-accent-600 hover:text-white transition-all rounded-lg">
              Voir toutes les publications
            </Link>
          </div>
        </div>
      </section>

      {/* ÉVÉNEMENTS */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16">
            <div>
              <span className="font-sans text-accent-600 text-sm tracking-[0.2em] uppercase font-bold">Agenda</span>
              <h2 className="font-display text-5xl font-extrabold text-brand-950 mt-2">Événements</h2>
            </div>
            <Link href="/actualites?filter=EVENT" className="font-sans text-sm font-bold text-brand-600 tracking-widest uppercase border-b border-transparent hover:border-brand-600 transition-all whitespace-nowrap">
              Voir tout l&apos;agenda →
            </Link>
          </div>

          {featured ? (
            <>
              <Link href={`/evenements/${featured.slug}`}
                className="group relative flex flex-col lg:flex-row overflow-hidden bg-brand-950 mb-4 hover:shadow-2xl transition-all duration-500 rounded-2xl">
                <div className="flex flex-col items-center justify-center bg-accent-600 px-10 py-12 shrink-0 min-w-[180px]">
                  <span className="font-display text-8xl font-extrabold text-white leading-none">
                    {String(new Date(featured.startDate).getDate()).padStart(2, '0')}
                  </span>
                  <span className="font-sans text-white/80 text-sm font-bold uppercase tracking-[0.3em] mt-2">
                    {MONTHS[new Date(featured.startDate).getMonth()]} {new Date(featured.startDate).getFullYear()}
                  </span>
                </div>
                <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-accent-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Prochain événement</span>
                      {featured.location && (
                        <span className="text-brand-400 text-xs">{featured.location}</span>
                      )}
                    </div>
                    <h3 className="font-display text-3xl lg:text-4xl font-extrabold text-white leading-tight group-hover:text-accent-300 transition-colors">
                      {featured.title}
                    </h3>
                    {featured.description && (
                      <p className="text-brand-300 text-sm leading-relaxed mt-4 max-w-xl line-clamp-2">{featured.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-8 text-[11px] font-bold uppercase tracking-widest text-brand-400 group-hover:text-accent-200 transition-colors">
                    Voir les détails →
                  </div>
                </div>
              </Link>

              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-16">
                  {rest.map(ev => {
                    const dt = new Date(ev.startDate)
                    return (
                      <Link key={ev.id} href={`/evenements/${ev.slug}`}
                        className="group flex gap-4 p-5 border border-neutral-100 hover:border-accent-200 hover:bg-accent-50/50 transition-all rounded-xl">
                        <div className="w-12 h-14 bg-brand-50 border border-brand-100 flex flex-col items-center justify-center shrink-0 rounded-lg">
                          <span className="font-display text-xl font-extrabold text-brand-700 leading-none">{String(dt.getDate()).padStart(2, '0')}</span>
                          <span className="text-[9px] font-bold uppercase text-brand-400">{MONTHS[dt.getMonth()]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-neutral-900 line-clamp-2 group-hover:text-accent-600 transition-colors">{ev.title}</p>
                          <p className="text-xs text-neutral-400 mt-1">{ev.location || ''}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-neutral-300 mb-16">
              <p className="font-bold text-lg">Aucun événement à venir pour le moment</p>
            </div>
          )}

          {recent.length > 0 && (
            <>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-[2px] bg-neutral-200" />
                <span className="font-sans text-xs font-bold uppercase tracking-[0.3em] text-neutral-400 whitespace-nowrap">Événements récents</span>
                <div className="flex-1 h-[1px] bg-neutral-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recent.map(ev => {
                  const dt = new Date(ev.startDate)
                  return (
                    <Link key={ev.id} href={`/evenements/${ev.slug}`}
                      className="group flex gap-4 p-5 border border-neutral-100 hover:border-neutral-200 transition-all opacity-60 hover:opacity-100 rounded-xl">
                      <div className="w-12 h-14 bg-neutral-100 flex flex-col items-center justify-center shrink-0 rounded-lg">
                        <span className="font-display text-xl font-extrabold text-neutral-500 leading-none">{String(dt.getDate()).padStart(2, '0')}</span>
                        <span className="text-[9px] font-bold uppercase text-neutral-400">{MONTHS[dt.getMonth()]}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300 mb-1 block">Terminé</span>
                        <p className="font-bold text-sm text-neutral-600 line-clamp-2 group-hover:text-neutral-900 transition-colors">{ev.title}</p>
                        {ev.location && <p className="text-xs text-neutral-400 mt-1">{ev.location}</p>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA newsletter */}
      <section className="bg-brand-950 py-24">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <span className="font-sans text-accent-400 text-sm tracking-[0.2em] uppercase font-bold">Rejoignez-nous</span>
          <h2 className="font-display text-5xl font-extrabold text-white mt-3 leading-tight">Rejoignez notre communauté</h2>
          <p className="font-sans text-brand-300 text-base mt-4 leading-relaxed">
            Que vous cherchiez une famille spirituelle, un lieu de croissance ou simplement à en savoir plus.
          </p>
          {sent ? (
            <div className="mt-12 py-6 bg-emerald-900/50 border border-emerald-700 rounded-xl text-emerald-300 font-bold">Merci ! Nous vous contacterons bientôt.</div>
          ) : (
            <div className="mt-12 flex flex-col sm:flex-row gap-3">
              <input type="text" placeholder="Votre prénom" value={firstName} onChange={e => setFirst(e.target.value)}
                className="flex-1 h-12 px-6 bg-brand-900 border border-brand-800 text-white placeholder-brand-600 font-sans text-sm focus:outline-none focus:border-accent-500 transition-colors rounded-lg" />
              <input type="email" placeholder="Votre adresse email" value={email} onChange={e => setEmail(e.target.value)}
                className="flex-1 h-12 px-6 bg-brand-900 border border-brand-800 text-white placeholder-brand-600 font-sans text-sm focus:outline-none focus:border-accent-500 transition-colors rounded-lg" />
              <div onClick={handleSubscribe}
                className="h-12 bg-accent-600 hover:bg-accent-500 text-white flex items-center justify-center px-8 font-sans text-xs font-bold tracking-widest uppercase transition-all cursor-pointer whitespace-nowrap rounded-lg">
                Je veux en savoir plus
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
