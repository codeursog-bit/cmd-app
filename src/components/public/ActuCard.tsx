import React from 'react'
import Link from 'next/link'

export interface ActuCardProps {
  kind: 'post' | 'event'
  category: string
  title: string
  excerpt: string
  date: string
  href: string
  coverUrl?: string | null
  audioUrl?: string | null
  videoUrl?: string | null
  location?: string | null
  eventDay?: string
  eventMonth?: string
  eventStatus?: 'À venir' | 'Terminé'
}

const ActuCard: React.FC<ActuCardProps> = ({
  kind, category, title, excerpt, date, href, coverUrl, audioUrl, videoUrl,
  location, eventDay, eventMonth, eventStatus,
}) => {
  const hasVideo = !!videoUrl
  const hasAudio = !!audioUrl

  return (
    <Link href={href} className="group flex flex-col bg-white border border-neutral-100 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-100">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-50 border-b border-neutral-100">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
          </div>
        )}

        {/* Badge date pour les événements */}
        {kind === 'event' && eventDay && (
          <div className="absolute top-3 left-3 flex flex-col items-center justify-center bg-accent-600 rounded-lg px-3 py-1.5 shadow-md">
            <span className="font-display text-lg font-extrabold text-white leading-none">{eventDay}</span>
            <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-white/80">{eventMonth}</span>
          </div>
        )}

        {/* Badge catégorie pour les posts */}
        {kind === 'post' && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-brand-950/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
            {category}
          </div>
        )}

        {/* Statut événement */}
        {kind === 'event' && eventStatus && (
          <div className={`absolute top-3 right-3 px-3 py-1 text-[9px] font-bold tracking-[0.2em] uppercase text-white rounded-full ${eventStatus === 'À venir' ? 'bg-accent-600' : 'bg-neutral-400'}`}>
            {eventStatus}
          </div>
        )}

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

      <div className="flex flex-col flex-1 p-6">
        {kind === 'event' && (
          <div className="flex items-center text-accent-600 text-xs uppercase tracking-wider font-sans font-bold mb-2">
            Événement{location ? ` · ${location}` : ''}
          </div>
        )}
        <h3 className="font-display text-xl font-extrabold text-brand-950 leading-snug group-hover:text-brand-600 transition-colors">
          {title}
        </h3>
        <p className="font-sans text-sm text-neutral-500 mt-2 line-clamp-2 leading-relaxed flex-1">{excerpt}</p>
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-50">
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">{date}</span>
          <span className="text-brand-600 text-xs font-sans font-bold flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            {kind === 'event' ? 'Détails' : hasVideo ? 'Regarder' : hasAudio ? 'Écouter' : 'Lire'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ActuCard
