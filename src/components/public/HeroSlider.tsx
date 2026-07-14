'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'

interface Post {
  id: string; slug: string; title: string; publishedAt: string | null
  coverUrl: string | null; videoUrl: string | null
}
interface Event {
  id: string; slug: string; title: string; startDate: string
  coverUrl: string | null; videoUrl: string | null
}

interface Slide {
  id: string
  href: string
  title: string
  coverUrl: string | null
  videoUrl: string | null
  rawDate: number
}

export default function HeroSlider() {
  const { data: postsData }  = useApi<{ posts: Post[] }>('/api/posts?limit=5&status=PUBLISHED')
  const { data: eventsData } = useApi<{ events: Event[] }>('/api/events?limit=5')

  const [index, setIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const slides: Slide[] = (() => {
    const posts = (postsData?.posts || [])
      .filter(p => p.coverUrl || p.videoUrl)
      .map(p => ({
        id: p.id, href: `/blog/${p.slug}`, title: p.title,
        coverUrl: p.coverUrl, videoUrl: p.videoUrl,
        rawDate: p.publishedAt ? new Date(p.publishedAt).getTime() : 0,
      }))

    const events = (eventsData?.events || [])
      .filter(e => e.coverUrl || e.videoUrl)
      .map(e => ({
        id: e.id, href: `/evenements/${e.slug}`, title: e.title,
        coverUrl: e.coverUrl, videoUrl: e.videoUrl,
        rawDate: new Date(e.startDate).getTime(),
      }))

    return [...events, ...posts].sort((a, b) => b.rawDate - a.rawDate).slice(0, 5)
  })()

  const goTo = useCallback((i: number) => setIndex(((i % slides.length) + slides.length) % slides.length), [slides.length])
  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  useEffect(() => {
    if (slides.length <= 1) return
    timerRef.current = setTimeout(next, 7000)
    return () => clearTimeout(timerRef.current)
  }, [index, slides.length, next])

  // Rien à afficher : aucune actualité avec image/vidéo n'existe encore en base
  // → on affiche un visuel par défaut pour visualiser la forme du bandeau
  if (!slides.length) {
    return (
      <section className="relative w-full aspect-[21/9] md:aspect-[3/1] overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-sky-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/logo-cmd.png" alt="CMD" className="h-20 md:h-28 w-auto object-contain opacity-30" />
        </div>
      </section>
    )
  }

  const slide = slides[index]

  return (
    <section className="relative w-full aspect-[21/9] md:aspect-[3/1] bg-brand-950 overflow-hidden">
      <Link href={slide.href} className="absolute inset-0 block">
        {slide.videoUrl ? (
          <video key={slide.videoUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src={slide.videoUrl} type="video/mp4" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={slide.coverUrl || slide.id} src={slide.coverUrl || ''} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
        )}
      </Link>

      {/* Flèches */}
      {slides.length > 1 && (
        <>
          <button onClick={prev} aria-label="Précédent"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-brand-950 shadow-md transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={next} aria-label="Suivant"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-brand-950 shadow-md transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          {/* Points */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((s, i) => (
              <button key={s.id} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}