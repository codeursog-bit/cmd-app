'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/hooks/useApi'
import { MediaUpload } from '@/components/ui/MediaUpload'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STATUSES = [['UPCOMING','À venir'],['ONGOING','En cours']]

export default function NouvelEvenementPage() {
  const { user } = useAuth()
  const router   = useRouter()
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [title, setTitle]         = useState('')
  const [description, setDesc]    = useState('')
  const [location, setLoc]        = useState('')
  const [onlineUrl, setOnline]    = useState('')
  const [startDate, setStart]     = useState('')
  const [endDate, setEnd]         = useState('')
  const [status, setStatus]       = useState('UPCOMING')
  const [coverUrl, setCover]      = useState('')
  const [audioUrl, setAudio]      = useState('')
  const [videoUrl, setVideo]      = useState('')

  const handleSave = async () => {
    if (!title) { setError('Titre requis'); return }
    if (!startDate) { setError('Date de début requise'); return }
    setSaving(true); setError(null)
    const { error: err, data } = await apiFetch('/api/events', 'POST', {
      title, description, location, onlineUrl: onlineUrl || null,
      coverUrl: coverUrl || null, audioUrl: audioUrl || null, videoUrl: videoUrl || null,
      startDate, endDate: endDate || null, status, churchId: user?.church?.id,
    })
    setSaving(false)
    if (err) { setError(err); return }
    router.push(`/admin/evenements/${(data as { slug: string })?.slug || ''}`)
  }

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link href="/admin/evenements" className="flex items-center gap-2 text-neutral-500 hover:text-brand-600 text-sm font-medium transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Retour
        </Link>
        <h1 className="font-sans text-xl font-bold text-neutral-900">Nouvel événement</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 space-y-5">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Titre <span className="text-red-400">*</span></label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nom de l'événement..."
            className="w-full border border-neutral-200 rounded-lg px-4 h-12 text-base font-bold focus:outline-none focus:border-brand-500 transition-colors" />
        </div>

        {/* MÉDIAS */}
        <MediaUpload coverUrl={coverUrl} onCoverChange={setCover} audioUrl={audioUrl} onAudioChange={setAudio} videoUrl={videoUrl} onVideoChange={setVideo} />

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Description</label>
          <textarea value={description} onChange={e => setDesc(e.target.value)} rows={3}
            className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-brand-500 transition-colors"
            placeholder="Décrivez l'événement..." />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Date début <span className="text-red-400">*</span></label>
            <input type="datetime-local" value={startDate} onChange={e => setStart(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Date fin</label>
            <input type="datetime-local" value={endDate} onChange={e => setEnd(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Lieu</label>
            <input type="text" value={location} onChange={e => setLoc(e.target.value)} placeholder="Salle principale..."
              className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Lien en ligne</label>
            <input type="url" value={onlineUrl} onChange={e => setOnline(e.target.value)} placeholder="https://youtube.com/live/..."
              className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Statut</label>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map(([v, l]) => (
              <div key={v} onClick={() => setStatus(v)}
                className={`px-3 py-2 rounded-lg border text-sm cursor-pointer text-center font-bold transition-all ${status === v ? 'bg-brand-600 border-brand-600 text-white' : 'border-neutral-100 text-neutral-600 hover:border-neutral-200'}`}>
                {l}
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3.5 bg-brand-600 rounded-xl text-sm font-bold text-white hover:bg-brand-700 transition-colors disabled:opacity-50 shadow-sm">
          {saving ? 'Création...' : 'Créer l\'événement'}
        </button>
      </div>
    </div>
  )
}
