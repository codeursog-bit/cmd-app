'use client'
import { useState, useEffect } from 'react'
import { useApi, apiFetch } from '@/hooks/useApi'
import { ImageUpload } from '@/components/ui/ImageUpload'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Event {
  id: string; title: string; description: string | null; slug: string; coverUrl: string | null
  startDate: string; endDate: string | null; location: string | null
  onlineUrl: string | null; status: string; isRecurring: boolean
  church: { id: string; name: string }
  _count: { attendances: number }
}

const STATUSES = [['UPCOMING','À venir'],['ONGOING','En cours'],['COMPLETED','Terminé'],['CANCELLED','Annulé']]
const STATUS_COLOR: Record<string, string> = {
  UPCOMING:  'bg-brand-50 text-brand-700',
  ONGOING:   'bg-emerald-50 text-emerald-700',
  COMPLETED: 'bg-neutral-100 text-neutral-500',
  CANCELLED: 'bg-red-50 text-red-600',
}

function SharePanel({ title, text, url, onClose }: { title: string; text: string; url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const enc = encodeURIComponent
  const links = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(text)}`,
    whatsapp: `https://wa.me/?text=${enc(text + '\n\n' + url)}`,
    twitter:  `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
    telegram: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
  }
  const PLATFORMS = [
    { key: 'facebook', label: 'Facebook',  color: 'bg-[#1877F2]', icon: 'F' },
    { key: 'whatsapp', label: 'WhatsApp',  color: 'bg-[#25D366]', icon: 'W' },
    { key: 'twitter',  label: 'X/Twitter', color: 'bg-black',     icon: 'X' },
    { key: 'telegram', label: 'Telegram',  color: 'bg-[#229ED9]', icon: 'T' },
    { key: 'linkedin', label: 'LinkedIn',  color: 'bg-[#0A66C2]', icon: 'in' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-bold text-neutral-900">Partager l&apos;événement</p>
            <p className="text-xs text-neutral-400 truncate max-w-[280px]">{title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="bg-neutral-50 rounded-xl p-4 mb-5 border border-neutral-100">
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-2">Message qui sera partagé</p>
          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line line-clamp-5">{text}</p>
          <p className="text-xs text-brand-600 mt-2 font-medium">{url}</p>
        </div>
        <div className="grid grid-cols-5 gap-2 mb-5">
          {PLATFORMS.map(p => (
            <a key={p.key} href={links[p.key as keyof typeof links]} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-neutral-50 transition-colors group">
              <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center`}>
                <span className="text-white text-xs font-black">{p.icon}</span>
              </div>
              <span className="text-[9px] font-bold text-neutral-400 group-hover:text-neutral-600 text-center">{p.label}</span>
            </a>
          ))}
        </div>
        <button onClick={() => { navigator.clipboard.writeText(text + '\n\n' + url); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
          {copied ? '✓ Copié !' : 'Copier le texte + lien'}
        </button>
      </div>
    </div>
  )
}

export default function EvenementDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { data: event, loading, refetch } = useApi<Event>(`/api/events/${slug}`)
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [shareOpen, setShare] = useState(false)

  const [title, setTitle]      = useState('')
  const [description, setDesc] = useState('')
  const [location, setLoc]     = useState('')
  const [coverUrl, setCover]   = useState('')
  const [startDate, setStart]  = useState('')
  const [endDate, setEnd]      = useState('')
  const [status, setStatus]    = useState('UPCOMING')

  useEffect(() => {
    if (event) {
      setTitle(event.title); setDesc(event.description || ''); setLoc(event.location || '')
      setCover(event.coverUrl || ''); setStart(event.startDate.slice(0, 16))
      setEnd(event.endDate?.slice(0, 16) || ''); setStatus(event.status)
    }
  }, [event])

  const handleSave = async () => {
    setSaving(true); setError(null)
    const { error: err } = await apiFetch(`/api/events/${slug}`, 'PATCH', {
      title, description, location, coverUrl: coverUrl || null, startDate, endDate: endDate || null, status,
    })
    setSaving(false)
    if (err) { setError(err); return }
    setEditing(false); refetch()
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer « ${event?.title} » ?`)) return
    await apiFetch(`/api/events/${slug}`, 'DELETE')
    router.push('/admin/evenements')
  }

  const fmt = (d: string) => new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(d))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ton-site.com'
  const shareText = event ? (() => {
    const dt = new Date(event.startDate)
    const dateStr = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dt)
    const timeStr = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(dt)
    return [
      `📅 ${event.title}`,
      event.description ? `\n${event.description}` : '',
      `\n🗓 ${dateStr} à ${timeStr}`,
      event.location ? `📍 ${event.location}` : '',
    ].filter(Boolean).join('\n')
  })() : ''
  const shareUrl = event ? `${appUrl}/evenements/${event.slug}` : ''

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="h-8 w-48 bg-neutral-100 rounded animate-pulse" />
      <div className="h-64 bg-neutral-100 rounded-2xl animate-pulse" />
    </div>
  )
  if (!event) return (
    <div className="text-center py-32 text-neutral-400 font-bold">
      Événement introuvable. <Link href="/admin/evenements" className="text-brand-600 hover:underline ml-2">Retour</Link>
    </div>
  )

  return (
    <>
      {shareOpen && (
        <SharePanel title={event.title} text={shareText} url={shareUrl} onClose={() => setShare(false)} />
      )}

      <div className="max-w-4xl space-y-8 animate-fade-in">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link href="/admin/evenements" className="flex items-center gap-2 text-neutral-500 hover:text-brand-600 text-sm font-medium transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Retour aux événements
          </Link>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShare(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Partager
            </button>
            {!editing ? (
              <>
                <button onClick={() => setEditing(true)} className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">Modifier</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-sm font-bold text-red-600 hover:bg-red-100 transition-colors">Supprimer</button>
              </>
            ) : (
              <>
                <button onClick={() => { setEditing(false); setError(null) }} className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-600 hover:bg-neutral-50">Annuler</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-brand-600 rounded-lg text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </>
            )}
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          {event.coverUrl && !editing && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.coverUrl} alt={event.title} className="w-full h-64 object-cover" />
          )}
          {!event.coverUrl && <div className="h-2 bg-brand-600" />}

          <div className="p-8">
            {editing ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Titre <span className="text-red-400">*</span></label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <ImageUpload value={coverUrl} onChange={setCover} />
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Description</label>
                  <textarea value={description} onChange={e => setDesc(e.target.value)} rows={3}
                    className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Début</label>
                    <input type="datetime-local" value={startDate} onChange={e => setStart(e.target.value)}
                      className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Fin</label>
                    <input type="datetime-local" value={endDate} onChange={e => setEnd(e.target.value)}
                      className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Lieu</label>
                  <input type="text" value={location} onChange={e => setLoc(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Statut</label>
                  <div className="grid grid-cols-4 gap-2">
                    {STATUSES.map(([v, l]) => (
                      <div key={v} onClick={() => setStatus(v)}
                        className={`py-2 rounded-lg border text-xs font-bold cursor-pointer text-center transition-all ${status === v ? 'bg-brand-600 border-brand-600 text-white' : 'border-neutral-200 text-neutral-500 hover:border-brand-300'}`}>
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="font-display text-3xl font-bold text-neutral-900">{event.title}</h1>
                    <p className="text-sm text-neutral-500 mt-1">{event.church.name}</p>
                  </div>
                  <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_COLOR[event.status]}`}>
                    {STATUSES.find(([v]) => v === event.status)?.[1] || event.status}
                  </span>
                </div>
                {event.description && <p className="text-neutral-600 text-sm leading-relaxed mb-6">{event.description}</p>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t border-neutral-100">
                  {[
                    ['Début', fmt(event.startDate)],
                    event.endDate ? ['Fin', fmt(event.endDate)] : null,
                    event.location ? ['Lieu', event.location] : null,
                    ['Présences', String(event._count.attendances)],
                  ].filter(Boolean).map(item => (
                    <div key={item![0]}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{item![0]}</p>
                      <p className="font-semibold text-sm text-neutral-700 mt-1">{item![1]}</p>
                    </div>
                  ))}
                </div>
                {event.onlineUrl && (
                  <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-5 text-sm font-bold text-brand-600 hover:underline">
                    <span className="inline-flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>Voir le lien en ligne <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></span>
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
