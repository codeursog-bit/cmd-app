'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'
import { apiFetch } from '@/hooks/useApi'
import NewsTicker from '@/components/public/NewsTicker'
import HeroSlider from '@/components/public/HeroSlider'

interface Post {
  id: string; title: string; excerpt: string | null; type: string; slug: string
  author: { firstName: string; lastName: string }; publishedAt: string | null
  coverUrl: string | null; audioUrl: string | null; videoUrl: string | null
}
interface Event {
  id: string; title: string; slug: string; startDate: string
  location: string | null; description: string | null; status: string
}

const TYPE_LABELS: Record<string, string> = { ARTICLE: 'Article', SERMON: 'Prédication', TESTIMONY: 'Témoignage', ANNOUNCEMENT: 'Annonce' }

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

  return (
    <div className="min-h-screen bg-white selection:bg-brand-500 selection:text-white">

      {/* HERO — slider dynamique alimenté par les dernières actualités */}
      <HeroSlider />

      {/* TICKER ACTUALITÉS — remplace le bandeau "Dernières nouvelles" de l'image */}
      <NewsTicker items={tickerItems} />

      {/* BIENVENUE */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative pb-4 pr-4">
              <div className="absolute -top-4 -left-4 w-10 h-10 border-t-[3px] border-l-[3px] border-accent-500 z-10" />
              <div className="bg-neutral-200 aspect-[4/5] w-full flex items-center justify-center relative rounded-lg overflow-hidden">
                <span className="text-neutral-400 text-sm italic">[Photo : l&apos;assemblée en culte]</span>
              </div>
              <div className="absolute bottom-0 right-0 bg-white border border-neutral-200 shadow-lg px-5 py-2.5 z-20 rounded">
                <span className="block font-sans font-bold text-brand-950 text-sm uppercase tracking-widest whitespace-nowrap">Depuis 1985</span>
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

      {/* FIL D'ACTUALITÉ — style feed façon Facebook */}
      <section className="bg-neutral-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-sans text-accent-600 text-sm tracking-[0.2em] uppercase font-bold">Fil d&apos;actualité</span>
            <h2 className="font-display text-5xl text-brand-950 font-extrabold mt-2">Actualités &amp; Enseignements</h2>
            <div className="w-[60px] h-[3px] bg-accent-500 mx-auto mt-4" />
          </div>

          <div className="max-w-2xl mx-auto space-y-5">
            {posts.length ? posts.map(p => {
              const initials = `${p.author.firstName?.[0] || ''}${p.author.lastName?.[0] || ''}`.toUpperCase()
              const timeAgo = (() => {
                if (!p.publishedAt) return ''
                const diffMs = Date.now() - new Date(p.publishedAt).getTime()
                const h = Math.floor(diffMs / 3_600_000)
                if (h < 1) return "à l'instant"
                if (h < 24) return `il y a ${h} h`
                const d = Math.floor(h / 24)
                if (d < 7) return `il y a ${d} j`
                return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date(p.publishedAt))
              })()
              return (
                <Link key={p.id} href={`/blog/${p.slug}`}
                  className="group block bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 px-5 pt-5">
                    <div className="w-11 h-11 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {initials || 'CM'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans font-bold text-sm text-brand-950 truncate">{p.author.firstName} {p.author.lastName}</p>
                      <p className="font-sans text-xs text-neutral-400">{timeAgo} · <span className="text-accent-600 font-semibold">{TYPE_LABELS[p.type] || p.type}</span></p>
                    </div>
                  </div>

                  <div className="px-5 pt-3 pb-4">
                    <p className="font-display text-lg font-bold text-brand-950 leading-snug group-hover:text-brand-600 transition-colors">{p.title}</p>
                    {p.excerpt && <p className="font-sans text-sm text-neutral-600 mt-1.5 leading-relaxed line-clamp-3">{p.excerpt}</p>}
                  </div>

                  {(p.coverUrl || p.videoUrl) && (
                    <div className="w-full aspect-video bg-neutral-100 border-t border-neutral-100 overflow-hidden">
                      {p.videoUrl ? (
                        <video src={p.videoUrl} muted className="w-full h-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.coverUrl || ''} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                    </div>
                  )}
                </Link>
              )
            }) : Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-xl h-40 animate-pulse" />
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link href="/actualites" className="border border-brand-500 text-brand-600 px-8 py-3 font-sans text-sm font-bold tracking-widest uppercase hover:border-transparent hover:bg-gradient-to-r hover:from-brand-600 hover:to-sky-500 hover:text-white transition-all rounded-lg">
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
                        className="group flex gap-4 p-5 border border-neutral-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all rounded-xl">
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
      <section className="bg-gradient-to-b from-brand-950 to-sky-950 py-24">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <span className="font-sans text-accent-400 text-sm tracking-[0.2em] uppercase font-bold">Rejoignez-nous</span>
          <h2 className="font-display text-5xl font-extrabold text-white mt-3 leading-tight">Rejoignez notre communauté</h2>
          <p className="font-sans text-brand-300 text-base mt-4 leading-relaxed">
            Que vous cherchiez une famille spirituelle, un lieu de croissance ou simplement à en savoir plus.
          </p>
          {sent ? (
            <div className="mt-12 py-6 bg-emerald-900/50 border border-emerald-700 rounded-xl text-emerald-300 font-bold">Merci ! Nous vous contacterons bientôt.</div>
          ) : (
            <div className="mt-12 flex flex-col md:flex-row gap-3 w-full">
              <input type="text" placeholder="Votre prénom" value={firstName} onChange={e => setFirst(e.target.value)}
                className="w-full md:flex-1 md:min-w-0 h-12 px-5 bg-brand-900 border border-brand-800 text-white placeholder-brand-500 font-sans text-sm focus:outline-none focus:border-sky-400 transition-colors rounded-lg" />
              <input type="email" placeholder="Votre adresse email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full md:flex-1 md:min-w-0 h-12 px-5 bg-brand-900 border border-brand-800 text-white placeholder-brand-500 font-sans text-sm focus:outline-none focus:border-sky-400 transition-colors rounded-lg" />
              <div onClick={handleSubscribe}
                className="w-full md:w-auto h-12 border border-brand-700 bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 text-white flex items-center justify-center px-8 font-sans text-xs font-bold tracking-widest uppercase transition-all cursor-pointer whitespace-nowrap rounded-lg shrink-0">
                Je veux en savoir plus
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
