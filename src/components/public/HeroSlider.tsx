'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'

interface Post {
  id: string; title: string; excerpt: string | null; type: string; slug: string
  author: { firstName: string; lastName: string }; publishedAt: string | null
  coverUrl: string | null; videoUrl: string | null
}
interface Event {
  id: string; title: string; slug: string; startDate: string
  location: string | null; description: string | null; coverUrl: string | null; videoUrl: string | null
}

interface Slide {
  id: string
  kind: 'post' | 'event'
  title: string
  body: string
  coverUrl: string | null
  videoUrl: string | null
  href: string
  caption: string
  subCaption: string
  ctaLabel: string
  badgeDay?: string
  badgeDate?: string
  badgeYear?: string
  category?: string
}

const TYPE_LABELS: Record<string, string> = { ARTICLE: 'Article', SERMON: 'Prédication', TESTIMONY: 'Témoignage', ANNOUNCEMENT: 'Annonce' }
const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
const DAYS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']

const FALLBACK_SLIDE: Slide = {
  id: 'fallback',
  kind: 'event',
  title: 'Bienvenue à la CMD',
  body: 'Moments de Restauration · Moments de Prières · Moments de Louange et Adoration · Sainte Cène · Partage de la parole · Communion Fraternelle · Et bien plus encore…',
  coverUrl: null,
  videoUrl: null,
  href: '/actualites',
  caption: 'Pr. Jean Pasteur YALAKA',
  subCaption: 'Visionnaire des Églises C.M.D',
  ctaLabel: 'Tu es notre invité !',
}

export default function HeroSlider() {
  const { data: postsData }  = useApi<{ posts: Post[] }>('/api/posts?limit=5&status=PUBLISHED')
  const { data: eventsData } = useApi<{ events: Event[] }>('/api/events?limit=5')

  const [index, setIndex]   = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const slides: Slide[] = (() => {
    const posts = (postsData?.posts || []).map(p => ({
      kind: 'post' as const,
      id: p.id,
      title: p.title,
      body: p.excerpt || '',
      coverUrl: p.coverUrl,
      videoUrl: p.videoUrl,
      href: `/blog/${p.slug}`,
      caption: `${p.author.firstName} ${p.author.lastName}`,
      subCaption: TYPE_LABELS[p.type] || p.type,
      ctaLabel: 'Découvrir',
      category: TYPE_LABELS[p.type] || p.type,
      rawDate: p.publishedAt ? new Date(p.publishedAt).getTime() : 0,
    }))

    const events = (eventsData?.events || []).map(e => {
      const dt = new Date(e.startDate)
      return {
        kind: 'event' as const,
        id: e.id,
        title: e.title,
        body: e.description || 'Moments de Restauration · Moments de Prières · Moments de Louange et Adoration · Sainte Cène · Partage de la parole · Communion Fraternelle · Et bien plus encore…',
        coverUrl: e.coverUrl,
        videoUrl: e.videoUrl,
        href: `/evenements/${e.slug}`,
        caption: 'Pr. Jean Pasteur YALAKA',
        subCaption: 'Visionnaire des Églises C.M.D',
        ctaLabel: 'Tu es notre invité !',
        badgeDay: DAYS[dt.getDay()],
        badgeDate: `${String(dt.getDate()).padStart(2, '0')} ${MONTHS[dt.getMonth()]}`,
        badgeYear: String(dt.getFullYear()),
        rawDate: dt.getTime(),
      }
    })

    const merged = [...events, ...posts].sort((a, b) => b.rawDate - a.rawDate).slice(0, 5)
    return merged.length ? merged : [FALLBACK_SLIDE]
  })()

  const goTo = useCallback((i: number) => setIndex(((i % slides.length) + slides.length) % slides.length), [slides.length])
  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  useEffect(() => {
    if (slides.length <= 1) return
    timerRef.current = setTimeout(next, 7000)
    return () => clearTimeout(timerRef.current)
  }, [index, slides.length, next])

  const slide = slides[index] || FALLBACK_SLIDE

  return (
    <section className="relative w-full bg-brand-950 overflow-hidden">
      {/* Touches orange décoratives */}
      <div className="absolute -right-32 -top-32 w-[500px] h-[500px] bg-accent-600/20 rounded-full blur-3xl z-0" />

      {/* Flèches */}
      {slides.length > 1 && (
        <>
          <button onClick={prev} aria-label="Précédent"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={next} aria-label="Suivant"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>
      )}

      <div className="relative z-10 container mx-auto px-6 py-14 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-10 lg:gap-14 items-center">

          {/* Colonne image / vidéo */}
          <div className="flex flex-col items-start">
            <div className="relative w-full aspect-[4/5] max-w-sm bg-brand-800/60 border border-brand-700 rounded-2xl overflow-hidden flex items-center justify-center">
              {slide.videoUrl ? (
                <video key={slide.videoUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                  <source src={slide.videoUrl} type="video/mp4" />
                </video>
              ) : slide.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={slide.coverUrl} src={slide.coverUrl} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <span className="text-brand-400 text-sm italic px-6 text-center">[Photo : Pasteur / Visionnaire]</span>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-brand-950/90 backdrop-blur-sm px-5 py-4 z-10">
                <p className="font-display font-bold text-white text-base leading-tight">{slide.caption}</p>
                <p className="font-sans text-brand-300 text-xs mt-1 uppercase tracking-wider">{slide.subCaption}</p>
              </div>
            </div>
          </div>

          {/* Colonne contenu */}
          <div>
            <h1 className="font-orbit font-bold text-3xl md:text-5xl xl:text-6xl leading-[1.05] text-white">
              {slide.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              {slide.kind === 'event' ? (
                <div className="flex flex-col items-center justify-center bg-accent-600 rounded-xl px-6 py-3 shadow-lg shadow-accent-900/30">
                  <span className="font-sans text-white text-xs font-bold uppercase tracking-widest">{slide.badgeDay}</span>
                  <span className="font-orbit text-xl font-bold text-white leading-none mt-1">{slide.badgeDate}</span>
                  <span className="font-sans text-white/80 text-xs">{slide.badgeYear}</span>
                </div>
              ) : (
                <span className="px-4 py-2 bg-accent-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg">{slide.category}</span>
              )}
              <Link href={slide.href}
                className="bg-white hover:bg-brand-50 text-brand-900 px-8 py-4 rounded-xl font-sans text-sm font-bold tracking-wide uppercase transition-all shadow-lg">
                {slide.ctaLabel}
              </Link>
            </div>

            <div className="mt-10 border-t border-brand-700/60 pt-8">
              <span className="font-sans text-accent-400 text-xs font-bold uppercase tracking-[0.25em]">
                {slide.kind === 'event' ? 'Au programme' : 'À lire'}
              </span>
              <p className="font-sans text-brand-200 text-sm md:text-base leading-relaxed mt-3 max-w-xl line-clamp-3">
                {slide.body}
              </p>
            </div>

            <div className="flex gap-4 mt-10">
              <Link href="/actualites" className="font-sans text-sm font-bold text-white/80 hover:text-white tracking-widest uppercase border-b border-transparent hover:border-accent-400 transition-all">
                Voir toutes les actualités →
              </Link>
            </div>
          </div>
        </div>

        {/* Dots */}
        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {slides.map((s, i) => (
              <button key={s.id} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-accent-500' : 'w-2 bg-white/30 hover:bg-white/50'}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
