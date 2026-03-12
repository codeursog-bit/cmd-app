'use client'
import React from 'react'
import Link from 'next/link'

interface EventCardProps {
  day: string
  month: string
  title: string
  location: string
  time: string
  description: string
  status: 'À venir' | 'En cours' | 'Terminé'
  slug?: string
  coverUrl?: string | null
  audioUrl?: string | null
  videoUrl?: string | null
}

const IconPin = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>)
const IconClock = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>)

const EventCard: React.FC<EventCardProps> = ({ day, month, title, location, time, description, status, slug, coverUrl, audioUrl, videoUrl }) => {
  const statusColors = { 'À venir': 'bg-brand-600', 'En cours': 'bg-emerald-500', 'Terminé': 'bg-neutral-400' }
  const hasVideo = !!videoUrl
  const hasAudio = !!audioUrl

  return (
    <div className="group flex flex-col bg-white border border-neutral-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Date block */}
      <div className="flex flex-col items-center justify-center bg-brand-950 py-6 text-center border-b border-brand-900">
        <span className="font-display text-5xl font-bold text-white leading-none">{day}</span>
        <span className="mt-2 font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-brand-400">{month}</span>
      </div>

      {/* Image ou placeholder */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-50 border-b border-neutral-100">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
          </div>
        )}
        {/* Badge statut */}
        <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-bold tracking-[0.2em] uppercase text-white ${statusColors[status]}`}>
          {status}
        </div>
        {/* Badges médias */}
        <div className="absolute bottom-2 left-2 flex gap-1.5">
          {hasVideo && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-full">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Vidéo
            </span>
          )}
          {hasAudio && !hasVideo && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-full">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18V5l12-2v13"/></svg>
              Audio
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col p-8">
        <h3 className="font-display text-2xl font-bold text-brand-950 group-hover:text-brand-600 transition-colors leading-tight">{title}</h3>
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-neutral-400"><IconPin /><span>{location}</span></div>
          <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-neutral-400"><IconClock /><span>{time}</span></div>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-neutral-500 line-clamp-3 font-sans">{description}</p>
        <div className="mt-8">
          <Link href={slug ? `/evenements/${slug}` : '#'}
            className="inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase text-brand-600 transition-all hover:text-brand-400 group/link">
            {hasVideo ? 'Voir la vidéo' : hasAudio ? 'Écouter' : "Détails de l'événement"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-1">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default EventCard
