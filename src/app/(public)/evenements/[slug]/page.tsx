import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PublicLayout from '@/components/public/PublicLayout'

interface Props { params: Promise<{ slug: string }> }

const STATUS_LABELS: Record<string,string> = { UPCOMING:'À venir', ONGOING:'En cours', COMPLETED:'Terminé', CANCELLED:'Annulé' }
const STATUS_COLORS: Record<string,string> = { UPCOMING:'bg-brand-50 text-brand-700', ONGOING:'bg-emerald-50 text-emerald-700', COMPLETED:'bg-neutral-100 text-neutral-500', CANCELLED:'bg-red-50 text-red-600' }
const MONTHS_FR = ['JANVIER','FÉVRIER','MARS','AVRIL','MAI','JUIN','JUILLET','AOÛT','SEPTEMBRE','OCTOBRE','NOVEMBRE','DÉCEMBRE']

// ── Metadata Open Graph ───────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { title: true, description: true, coverUrl: true, startDate: true, church: { select: { name: true } } }
  })
  if (!event) return { title: 'Événement introuvable' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmdg.org'
  const fmtDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(event.startDate)
  const description = event.description || `${event.title} — ${fmtDate} · ${event.church.name}`
  const images = event.coverUrl ? [{ url: event.coverUrl, width: 1200, height: 630, alt: event.title }] : []

  return {
    title: `${event.title} — CMDG`,
    description,
    openGraph: {
      title: event.title,
      description,
      url: `${appUrl}/evenements/${slug}`,
      siteName: 'CMDG — Communauté des Messagers de Dieu',
      images,
      type: 'website',
    },
    twitter: {
      card: event.coverUrl ? 'summary_large_image' : 'summary',
      title: event.title,
      description,
      images: event.coverUrl ? [event.coverUrl] : [],
    },
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getYoutubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m?.[1] || null
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function EvenementPublicPage({ params }: Props) {
  const { slug } = await params
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { church: { select: { name: true } }, _count: { select: { attendances: true } } }
  })

  if (!event) notFound()

  const fmtDate = (d: Date | string) => new Intl.DateTimeFormat('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(new Date(d))
  const fmtTime = (d: Date | string) => new Intl.DateTimeFormat('fr-FR', { hour:'2-digit', minute:'2-digit' }).format(new Date(d))
  const dt   = new Date(event.startDate)
  const ytId = event.videoUrl ? getYoutubeId(event.videoUrl) : null

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">

        {/* ── Hero ── */}
        <div className="bg-brand-950 pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Link href="/evenements" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-200 text-sm font-medium mb-8 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Retour aux événements
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-start">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${STATUS_COLORS[event.status]}`}>
                    {STATUS_LABELS[event.status] || event.status}
                  </span>
                  {event.isRecurring && (
                    <span className="px-3 py-1 bg-brand-800 text-brand-300 rounded-full text-xs font-bold uppercase tracking-widest">Récurrent</span>
                  )}
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">{event.title}</h1>
                {event.description && <p className="text-brand-300 text-lg leading-relaxed">{event.description}</p>}
                <p className="text-brand-500 text-sm mt-3">{event.church.name}</p>
              </div>
              {/* Date card */}
              <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 text-center min-w-[140px]">
                <p className="text-brand-400 text-[10px] font-bold uppercase tracking-widest mb-2">{MONTHS_FR[dt.getMonth()]}</p>
                <p className="font-display text-6xl font-bold text-white leading-none">{String(dt.getDate()).padStart(2,'0')}</p>
                <p className="text-brand-400 text-xs font-bold mt-2">{dt.getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Image de couverture (si pas de vidéo) ── */}
        {event.coverUrl && !ytId && !event.videoUrl && (
          <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.coverUrl} alt={event.title} className="w-full h-72 object-cover rounded-2xl shadow-xl" />
          </div>
        )}

        {/* ── Vidéo ── */}
        {event.videoUrl && (
          <div className="max-w-4xl mx-auto px-6 mt-8">
            {ytId ? (
              <div className="relative w-full rounded-2xl overflow-hidden shadow-xl" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title={event.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video controls src={event.videoUrl} className="w-full rounded-2xl shadow-xl" poster={event.coverUrl || undefined}>
                Votre navigateur ne supporte pas la vidéo.
              </video>
            )}
            <p className="text-xs text-neutral-400 mt-2 text-center">Vidéo · {event.title}</p>
          </div>
        )}

        {/* ── Audio ── */}
        {event.audioUrl && (
          <div className="max-w-4xl mx-auto px-6 mt-8">
            <div className="bg-brand-950 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-800 rounded-xl flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate mb-2">{event.title}</p>
                <audio controls src={event.audioUrl} className="w-full h-8" style={{ accentColor: '#3b82f6' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Infos pratiques ── */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              ['📅 Date', fmtDate(event.startDate)],
              ['🕐 Heure', `${fmtTime(event.startDate)}${event.endDate ? ` – ${fmtTime(event.endDate)}` : ''}`],
              event.location ? ['📍 Lieu', event.location] : null,
            ].filter(Boolean).map(item => (
              <div key={item![0]} className="bg-neutral-50 border border-neutral-100 rounded-xl p-5">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{item![0]}</p>
                <p className="font-semibold text-neutral-800">{item![1]}</p>
              </div>
            ))}
          </div>

          {/* Contenu */}
          {event.content && (
            <div className="mb-12">
              {event.content.split('\n').filter(Boolean).map((p, i) => (
                <p key={i} className="text-neutral-700 leading-relaxed text-[17px] mb-4">{p}</p>
              ))}
            </div>
          )}

          {/* Lien en ligne */}
          {event.onlineUrl && event.status !== 'COMPLETED' && (
            <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 flex items-center justify-between mb-12">
              <div>
                <p className="font-bold text-brand-900">Événement disponible en ligne</p>
                <p className="text-sm text-brand-600 mt-1">Suivez l&apos;événement en direct sur :</p>
              </div>
              <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer"
                className="px-5 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm whitespace-nowrap">
                Rejoindre →
              </a>
            </div>
          )}

          <div className="text-center">
            <Link href="/evenements" className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Tous les événements
            </Link>
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
