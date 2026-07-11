'use client'
import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { useApi } from '@/hooks/useApi'
import ActuCard from '@/components/public/ActuCard'

const IconSearch = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>)

interface Post {
  id: string; title: string; excerpt: string | null; type: string; slug: string
  publishedAt: string | null; coverUrl: string | null; audioUrl: string | null; videoUrl: string | null
}
interface Event {
  id: string; title: string; slug: string; startDate: string; location: string | null
  description: string | null; status: string; coverUrl: string | null; audioUrl: string | null; videoUrl: string | null
}

const TYPE_LABELS: Record<string, string> = { ARTICLE: 'Article', SERMON: 'Prédication', TESTIMONY: 'Témoignage', ANNOUNCEMENT: 'Annonce' }
const MONTHS_FR = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC']

type Filter = 'TOUT' | 'ARTICLE' | 'SERMON' | 'TESTIMONY' | 'ANNOUNCEMENT' | 'EVENT'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'TOUT', label: 'Tout' },
  { value: 'EVENT', label: 'Événements' },
  { value: 'ARTICLE', label: 'Articles' },
  { value: 'SERMON', label: 'Prédications' },
  { value: 'TESTIMONY', label: 'Témoignages' },
  { value: 'ANNOUNCEMENT', label: 'Annonces' },
]

function ActualitesContent() {
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState<Filter>('TOUT')
  const [search, setSearch] = useState('')
  const [visible, setVisible] = useState(9)

  useEffect(() => {
    const f = searchParams.get('filter') as Filter | null
    if (f && FILTERS.some(x => x.value === f)) setFilter(f)
  }, [searchParams])

  const { data: postsData, loading: postsLoading } = useApi<{ posts: Post[] }>('/api/posts?status=PUBLISHED&limit=50')
  const { data: eventsData, loading: eventsLoading } = useApi<{ events: Event[] }>('/api/events?limit=50')

  const items = useMemo(() => {
    const posts = (postsData?.posts || []).map(p => ({
      kind: 'post' as const,
      id: p.id,
      title: p.title,
      excerpt: p.excerpt || '',
      category: TYPE_LABELS[p.type] || p.type,
      typeFilter: p.type as Filter,
      date: p.publishedAt ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(p.publishedAt)) : '',
      rawDate: p.publishedAt ? new Date(p.publishedAt).getTime() : 0,
      href: `/blog/${p.slug}`,
      coverUrl: p.coverUrl, audioUrl: p.audioUrl, videoUrl: p.videoUrl,
    }))

    const now = Date.now()
    const events = (eventsData?.events || []).map(e => {
      const dt = new Date(e.startDate)
      return {
        kind: 'event' as const,
        id: e.id,
        title: e.title,
        excerpt: e.description || '',
        category: 'Événement',
        typeFilter: 'EVENT' as Filter,
        date: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(dt),
        rawDate: dt.getTime(),
        href: `/evenements/${e.slug}`,
        coverUrl: e.coverUrl, audioUrl: e.audioUrl, videoUrl: e.videoUrl,
        location: e.location,
        eventDay: String(dt.getDate()).padStart(2, '0'),
        eventMonth: MONTHS_FR[dt.getMonth()],
        eventStatus: (dt.getTime() >= now ? 'À venir' : 'Terminé') as 'À venir' | 'Terminé',
      }
    })

    const all = [...posts, ...events].sort((a, b) => b.rawDate - a.rawDate)

    return all.filter(item => {
      const matchesFilter = filter === 'TOUT' || item.typeFilter === filter
      const q = search.trim().toLowerCase()
      const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.excerpt.toLowerCase().includes(q)
      return matchesFilter && matchesSearch
    })
  }, [postsData, eventsData, filter, search])

  const loading = postsLoading || eventsLoading
  const shown = items.slice(0, visible)

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-950 selection:bg-brand-600 selection:text-white">
      <header className="relative flex h-[350px] w-full flex-col justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-sky-950 px-6 md:px-12 pt-20 overflow-hidden">
        <div className="absolute -right-24 -top-24 w-[400px] h-[400px] bg-accent-600/10 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative mx-auto w-full max-w-7xl">
          <nav className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-400">
            <a href="/" className="hover:text-white transition-colors">Accueil</a>
            <span className="text-brand-800">/</span>
            <span className="text-white">Actualités</span>
          </nav>
          <h1 className="mt-8 font-display text-5xl font-extrabold text-white md:text-7xl lg:text-8xl leading-none">
            <span className="text-accent-400">Actualités</span> &amp; Agenda
          </h1>
          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-brand-400 uppercase">Publications, prédications, témoignages et événements de la communauté</p>
        </motion.div>
      </header>

      {/* FILTER BAR */}
      <div className="border-b border-neutral-100 bg-white sticky top-16 z-30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row md:px-12">
          <div className="flex flex-wrap items-center gap-4">
            {FILTERS.map(f => (
              <button key={f.value} onClick={() => { setFilter(f.value); setVisible(9) }}
                className={`text-[10px] font-bold tracking-[0.2em] uppercase pb-1 border-b-2 transition-all whitespace-nowrap ${
                  filter === f.value ? 'border-accent-500 text-brand-950' : 'border-transparent text-neutral-400 hover:text-neutral-600'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-full max-w-xs">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"><IconSearch /></div>
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setVisible(9) }}
              className="w-full border-b border-neutral-200 bg-transparent py-2 pl-12 pr-6 text-xs outline-none focus:border-accent-500 transition-colors" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-24 md:px-12">
        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => <div key={i} className="h-80 bg-neutral-100 rounded-xl animate-pulse" />)}
          </div>
        ) : shown.length ? (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map(item => (
                <ActuCard key={`${item.kind}-${item.id}`}
                  kind={item.kind} category={item.category} title={item.title} excerpt={item.excerpt}
                  date={item.date} href={item.href} coverUrl={item.coverUrl} audioUrl={item.audioUrl} videoUrl={item.videoUrl}
                  location={'location' in item ? item.location : undefined}
                  eventDay={'eventDay' in item ? item.eventDay : undefined}
                  eventMonth={'eventMonth' in item ? item.eventMonth : undefined}
                  eventStatus={'eventStatus' in item ? item.eventStatus : undefined}
                />
              ))}
            </div>
            {visible < items.length && (
              <div className="flex justify-center mt-16">
                <button onClick={() => setVisible(v => v + 9)}
                  className="border border-brand-600 text-brand-600 px-8 py-3 font-sans text-sm font-bold tracking-widest uppercase hover:bg-brand-600 hover:text-white transition-all rounded-lg">
                  Voir plus
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32 text-neutral-400">Aucun résultat pour cette recherche.</div>
        )}
      </main>

      <section className="bg-gradient-to-b from-brand-950 to-sky-950 py-24 text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl text-white font-extrabold mb-8">Restez informé de nos actualités</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <input type="email" placeholder="Votre email" className="bg-brand-900 border border-brand-800 px-6 py-3 text-sm text-white outline-none focus:border-accent-500 w-full rounded-lg" />
            <button className="border border-brand-700 bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 text-white px-8 py-3 text-xs font-bold tracking-widest uppercase transition-all rounded-lg whitespace-nowrap">S&apos;abonner</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ActualitesPage() {
  return (
    <Suspense fallback={null}>
      <ActualitesContent />
    </Suspense>
  )
}
