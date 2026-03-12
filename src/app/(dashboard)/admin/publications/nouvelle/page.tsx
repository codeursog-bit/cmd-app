'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/hooks/useApi'
import { MediaUpload } from '@/components/ui/MediaUpload'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TYPES    = [['ARTICLE','Article'],['SERMON','Prédication'],['TESTIMONY','Témoignage'],['ANNOUNCEMENT','Annonce']]

export default function NouvellePublicationPage() {
  const { user } = useAuth()
  const router   = useRouter()
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [title, setTitle]     = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [type, setType]       = useState('ARTICLE')
  const [status, setStatus]   = useState('DRAFT')
  const [tags, setTags]       = useState('')
  const [coverUrl, setCover]  = useState('')
  const [audioUrl, setAudio]  = useState('')
  const [videoUrl, setVideo]  = useState('')

  const handleSave = async () => {
    if (!title) { setError('Titre requis'); return }
    if (!content) { setError('Contenu requis'); return }
    setSaving(true); setError(null)
    const tagNames = tags.split(',').map(t => t.trim()).filter(Boolean)
    const { error: err, data } = await apiFetch('/api/posts', 'POST', {
      title, excerpt, content, coverUrl: coverUrl || null, audioUrl: audioUrl || null, videoUrl: videoUrl || null,
      type, status, tagNames, churchId: user?.church?.id,
    })
    setSaving(false)
    if (err) { setError(err); return }
    router.push(`/admin/publications/${(data as { slug: string })?.slug || ''}`)
  }

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link href="/admin/publications" className="flex items-center gap-2 text-neutral-500 hover:text-brand-600 text-sm font-medium transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Retour
        </Link>
        <h1 className="font-sans text-xl font-bold text-neutral-900">Nouvelle publication</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Titre <span className="text-red-400">*</span></label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de la publication..."
                className="w-full border border-neutral-200 rounded-lg px-4 h-12 text-base font-bold focus:outline-none focus:border-brand-500 transition-colors" />
            </div>

            {/* MÉDIAS */}
            <MediaUpload coverUrl={coverUrl} onCoverChange={setCover} audioUrl={audioUrl} onAudioChange={setAudio} videoUrl={videoUrl} onVideoChange={setVideo} />

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Extrait</label>
              <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="Résumé court visible sur les listes..." />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Contenu <span className="text-red-400">*</span></label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={14}
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm font-sans resize-none focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="Rédigez le contenu complet..." />
              <p className="text-[10px] text-neutral-300 mt-1">{content.length} caractères</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
            <h3 className="font-bold text-neutral-800 text-sm mb-4">Paramètres</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Type</label>
                <div className="space-y-1.5">
                  {TYPES.map(([v, l]) => (
                    <div key={v} onClick={() => setType(v)}
                      className={`px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all ${type === v ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold' : 'border-neutral-100 text-neutral-600 hover:border-neutral-200'}`}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Statut</label>
                <div className="space-y-1.5">
                  {[['DRAFT','Brouillon'],['PUBLISHED','Publié']].map(([v, l]) => (
                    <div key={v} onClick={() => setStatus(v)}
                      className={`px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all ${status === v ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold' : 'border-neutral-100 text-neutral-600 hover:border-neutral-200'}`}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Tags</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-3 h-9 text-xs focus:outline-none focus:border-brand-500"
                  placeholder="foi, prière, adoration" />
                <p className="text-[10px] text-neutral-300 mt-1">Séparez par des virgules</p>
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 bg-brand-600 rounded-xl text-sm font-bold text-white hover:bg-brand-700 transition-colors disabled:opacity-50 shadow-sm">
            {saving ? 'Création...' : status === 'PUBLISHED' ? 'Publier' : 'Créer le brouillon'}
          </button>
        </div>
      </div>
    </div>
  )
}
