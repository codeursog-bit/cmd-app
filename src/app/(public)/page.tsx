'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'
import { apiFetch } from '@/hooks/useApi'
import PostCard from '@/components/public/PostCard'

interface Post {
  id: string; title: string; excerpt: string | null; type: string; slug: string
  author: { firstName: string; lastName: string }; publishedAt: string | null
}
interface Event {
  id: string; title: string; slug: string; startDate: string
  location: string | null; description: string | null; status: string
}

const HERO_VIDEOS = [
  { src: '/videos/church-bg.mp4', duration: 20000 },
  // { src: '/videos/worship.mp4',   duration: 18000 },
  // { src: '/videos/community.mp4', duration: 22000 },
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
    <>
      <video
        key={HERO_VIDEOS[current].src}
        autoPlay muted loop={HERO_VIDEOS.length === 1} playsInline preload="auto"
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}
      >
        <source src={HERO_VIDEOS[current].src} type="video/mp4" />
      </video>
      {HERO_VIDEOS.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_VIDEOS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default function HomePage() {
  const [email, setEmail]     = useState('')
  const [firstName, setFirst] = useState('')
  const [sent, setSent]       = useState(false)

  const { data: postsData }        = useApi<{ posts: Post[] }>('/api/posts?limit=3&status=PUBLISHED')
  const { data: upcomingData }     = useApi<{ events: Event[] }>('/api/events?upcoming=true&limit=6')
  const { data: recentEventsData } = useApi<{ events: Event[] }>('/api/events?status=COMPLETED&limit=3')

  const handleSubscribe = async () => {
    if (!email || !firstName) return
    await apiFetch('/api/contact', 'POST', {
      name: firstName, email,
      subject: 'Inscription newsletter',
      message: `${firstName} souhaite rejoindre la communauté.`,
    })
    setSent(true)
  }

  const stats = [
    { value: '12+',  label: 'Années de ministère' },
    { value: '7',    label: 'Églises' },
    { value: '500+', label: 'Membres' },
    { value: '50+',  label: 'Événements par an' },
  ]

  const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
  const upcoming = upcomingData?.events || []
  const featured  = upcoming[0]
  const rest      = upcoming.slice(1, 4)
  const recent    = recentEventsData?.events || []

  return (
    <div className="min-h-screen bg-white selection:bg-brand-500 selection:text-white">

      {/* HERO */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/85 to-[#0d1f3c]/60 z-10" />
        <div className="relative z-20 container mx-auto px-6 text-center flex flex-col items-center">
          <div className="w-12 h-[1px] bg-brand-400 mb-8" />
          <span className="font-sans font-light tracking-[0.3em] text-brand-300 text-sm md:text-base uppercase mb-4">COMMUNAUTÉ DES</span>
          <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-9xl text-white leading-none mb-6">MESSAGERS DE DIEU</h1>
          <div className="w-full max-w-md h-[1px] bg-brand-500/50 mb-6" />
          <p className="font-sans text-brand-300 tracking-widest text-sm md:text-lg">Ministère d&apos;Évangélisation et d&apos;Action Sociale</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <Link href="/contact" className="bg-brand-600 hover:bg-brand-500 text-white px-10 py-4 font-sans text-sm font-bold tracking-widest uppercase transition-all">Nous rejoindre</Link>
            <Link href="/about" className="border border-white/30 hover:bg-white hover:text-brand-900 text-white px-10 py-4 font-sans text-sm font-bold tracking-widest uppercase transition-all backdrop-blur-sm">En savoir plus</Link>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-60">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5"/></svg>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-brand-950 py-12 border-y border-brand-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 items-center">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center lg:items-start lg:px-12 relative">
                <span className="font-display text-5xl text-white font-bold leading-none">{s.value}</span>
                <span className="font-sans text-brand-300 text-xs tracking-wider uppercase mt-3">{s.label}</span>
                {i < stats.length - 1 && <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-brand-800" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 border-t-[3px] border-l-[3px] border-brand-600 z-10" />
              <div className="bg-neutral-200 aspect-[4/5] w-full flex items-center justify-center relative">
                <span className="text-neutral-400 text-sm italic">[Photo : l&apos;assemblée en culte]</span>
                <div className="absolute -bottom-4 -right-4 bg-white border border-neutral-200 px-4 py-2 z-20">
                  <span className="block font-sans font-bold text-brand-950 text-sm uppercase tracking-widest">Depuis 2012</span>
                </div>
              </div>
            </div>
            <div className="lg:pl-12">
              <span className="font-sans text-brand-600 text-sm tracking-[0.2em] uppercase">Notre Mission</span>
              <h2 className="font-display text-4xl font-bold text-brand-950 leading-tight mt-3">Porteurs d&apos;une vision,<br/>bâtisseurs d&apos;une communauté</h2>
              <p className="font-sans text-neutral-600 text-base leading-relaxed mt-6">Depuis plus de 12 ans, la Communauté des Messagers de Dieu porte un message d&apos;espérance, de réconciliation et de transformation sociale. Nous croyons que l&apos;Évangile change les familles, les quartiers et les nations.</p>
              <div className="w-full h-[1px] bg-brand-100 my-8" />
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
            <h2 className="font-display text-5xl text-white font-bold">Actualités &amp; Enseignements</h2>
            <div className="w-[60px] h-[3px] bg-brand-600 mx-auto mt-4" />
            <p className="font-sans text-brand-300 text-sm tracking-wide mt-4 uppercase">Ressources pour votre croissance spirituelle</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {postsData?.posts.length ? postsData.posts.map(p => (
              <PostCard key={p.id} category={p.type} title={p.title} excerpt={p.excerpt || ''}
                author={`${p.author.firstName} ${p.author.lastName}`}
                date={p.publishedAt ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(p.publishedAt)) : ''}
                slug={p.slug} />
            )) : Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-brand-900 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Link href="/blog" className="border border-brand-500 text-brand-400 px-8 py-3 font-sans text-sm font-bold tracking-widest uppercase hover:bg-brand-600 hover:text-white transition-all">
              Voir toutes les publications
            </Link>
          </div>
        </div>
      </section>

      {/* ÉVÉNEMENTS */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16">
            <div>
              <span className="font-sans text-brand-600 text-sm tracking-[0.2em] uppercase">Agenda</span>
              <h2 className="font-display text-5xl font-bold text-brand-950 mt-2">Événements</h2>
            </div>
            <Link href="/evenements" className="font-sans text-sm font-bold text-brand-600 tracking-widest uppercase border-b border-transparent hover:border-brand-600 transition-all whitespace-nowrap">
              Voir tout l&apos;agenda →
            </Link>
          </div>

          {/* ÉVÉNEMENT VEDETTE */}
          {featured ? (
            <>
              <Link href={`/evenements/${featured.slug}`}
                className="group relative flex flex-col lg:flex-row overflow-hidden bg-brand-950 mb-4 hover:shadow-2xl transition-all duration-500">
                <div className="flex flex-col items-center justify-center bg-brand-600 px-10 py-12 shrink-0 min-w-[180px]">
                  <span className="font-display text-8xl font-bold text-white leading-none">
                    {String(new Date(featured.startDate).getDate()).padStart(2, '0')}
                  </span>
                  <span className="font-sans text-brand-200 text-sm font-bold uppercase tracking-[0.3em] mt-2">
                    {MONTHS[new Date(featured.startDate).getMonth()]} {new Date(featured.startDate).getFullYear()}
                  </span>
                  <div className="w-8 h-[2px] bg-brand-300 mt-4" />
                  <span className="font-sans text-brand-200 text-xs mt-3">
                    {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(featured.startDate))}
                  </span>
                </div>
                <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Prochain événement</span>
                      {featured.location && (
                        <span className="text-brand-400 text-xs flex items-center gap-1">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          {featured.location}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-3xl lg:text-4xl font-bold text-white leading-tight group-hover:text-brand-300 transition-colors">
                      {featured.title}
                    </h3>
                    {featured.description && (
                      <p className="text-brand-300 text-sm leading-relaxed mt-4 max-w-xl line-clamp-2">{featured.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-8 text-[11px] font-bold uppercase tracking-widest text-brand-400 group-hover:text-brand-200 transition-colors">
                    Voir les détails
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </div>
                </div>
              </Link>

              {/* PROCHAINS (2e → 4e) */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-16">
                  {rest.map(ev => {
                    const dt = new Date(ev.startDate)
                    return (
                      <Link key={ev.id} href={`/evenements/${ev.slug}`}
                        className="group flex gap-4 p-5 border border-neutral-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all">
                        <div className="w-12 h-14 bg-brand-50 border border-brand-100 flex flex-col items-center justify-center shrink-0">
                          <span className="font-display text-xl font-bold text-brand-700 leading-none">{String(dt.getDate()).padStart(2, '0')}</span>
                          <span className="text-[9px] font-bold uppercase text-brand-400">{MONTHS[dt.getMonth()]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-neutral-900 line-clamp-2 group-hover:text-brand-600 transition-colors">{ev.title}</p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(dt)}
                            {ev.location ? ` · ${ev.location}` : ''}
                          </p>
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
              <p className="text-sm mt-2">Revenez bientôt !</p>
            </div>
          )}

          {/* ÉVÉNEMENTS RÉCENTS */}
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
                      className="group flex gap-4 p-5 border border-neutral-100 hover:border-neutral-200 transition-all opacity-60 hover:opacity-100">
                      <div className="w-12 h-14 bg-neutral-100 flex flex-col items-center justify-center shrink-0">
                        <span className="font-display text-xl font-bold text-neutral-500 leading-none">{String(dt.getDate()).padStart(2, '0')}</span>
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

      {/* CTA */}
      <section className="bg-brand-950 py-24">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <span className="font-sans text-brand-400 text-sm tracking-[0.2em] uppercase">Rejoignez-nous</span>
          <h2 className="font-display text-5xl font-bold text-white mt-3 leading-tight">Rejoignez notre communauté</h2>
          <p className="font-sans text-brand-300 text-base mt-4 leading-relaxed">
            Que vous cherchiez une famille spirituelle, un lieu de croissance ou simplement à en savoir plus — nous sommes là pour vous accueillir.
          </p>
          {sent ? (
            <div className="mt-12 py-6 bg-emerald-900/50 border border-emerald-700 rounded-xl text-emerald-300 font-bold">Merci ! Nous vous contacterons bientôt.</div>
          ) : (
            <div className="mt-12 flex flex-col sm:flex-row gap-3">
              <input type="text" placeholder="Votre prénom" value={firstName} onChange={e => setFirst(e.target.value)}
                className="flex-1 h-12 px-6 bg-brand-900 border border-brand-800 text-white placeholder-brand-600 font-sans text-sm focus:outline-none focus:border-brand-500 transition-colors" />
              <input type="email" placeholder="Votre adresse email" value={email} onChange={e => setEmail(e.target.value)}
                className="flex-1 h-12 px-6 bg-brand-900 border border-brand-800 text-white placeholder-brand-600 font-sans text-sm focus:outline-none focus:border-brand-500 transition-colors" />
              <div onClick={handleSubscribe}
                className="h-12 bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center px-8 font-sans text-xs font-bold tracking-widest uppercase transition-all cursor-pointer whitespace-nowrap">
                Je veux en savoir plus
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
