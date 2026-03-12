import React from 'react'
import Link from 'next/link'

export interface PostCardProps {
  category: string
  title: string
  excerpt: string
  author: string
  date: string
  slug: string
  coverUrl?: string | null
  audioUrl?: string | null
  videoUrl?: string | null
}

const PostCard: React.FC<PostCardProps> = ({ category, title, excerpt, author, date, slug, coverUrl, audioUrl, videoUrl }) => {
  const hasVideo = !!videoUrl
  const hasAudio = !!audioUrl

  return (
    <div className="group bg-brand-900 rounded-none overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-600/20">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-brand-800 border-b border-brand-700">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
          </div>
        )}
        {/* Badges médias */}
        <div className="absolute bottom-2 left-2 flex gap-1.5">
          {hasVideo && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-full backdrop-blur-sm">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Vidéo
            </span>
          )}
          {hasAudio && !hasVideo && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-full backdrop-blur-sm">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18V5l12-2v13"/></svg>
              Audio
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center text-brand-400 text-xs uppercase tracking-wider font-sans">
          <span className="mr-2 text-brand-600">|</span>
          {category}
        </div>
        <h3 className="font-display text-xl font-bold text-white mt-3 leading-snug group-hover:text-brand-300 transition-colors">
          {title}
        </h3>
        <p className="font-sans text-sm text-brand-300 mt-2 line-clamp-3 leading-relaxed">{excerpt}</p>
        <div className="flex items-center gap-2 mt-4 text-[10px] uppercase tracking-widest">
          <span className="text-brand-400 font-medium">{author}</span>
          <span className="text-brand-700">·</span>
          <span className="text-brand-600">{date}</span>
        </div>
        <div className="mt-6">
          <Link href={`/blog/${slug}`}
            className="text-brand-400 text-xs font-sans hover:text-white transition-colors flex items-center gap-2 group/link">
            {hasVideo ? 'Regarder' : hasAudio ? 'Écouter' : 'Lire la suite'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-1">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PostCard
