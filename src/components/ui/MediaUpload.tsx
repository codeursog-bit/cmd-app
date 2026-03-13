'use client'
import { useState, useRef } from 'react'

interface MediaUploadProps {
  coverUrl: string; onCoverChange: (url: string) => void
  audioUrl: string; onAudioChange: (url: string) => void
  videoUrl: string; onVideoChange: (url: string) => void
}

type Tab = 'image' | 'audio' | 'video'

const TABS: { key: Tab; label: string; icon: string; accept: string; hint: string }[] = [
  { key: 'image', label: 'Image',  accept: 'image/*',  hint: 'JPG, PNG, WebP',  icon: '🖼️' },
  { key: 'audio', label: 'Audio',  accept: 'audio/*',  hint: 'MP3, WAV, M4A',   icon: '🎵' },
  { key: 'video', label: 'Vidéo',  accept: 'video/*',  hint: 'MP4, MOV, WebM',  icon: '🎬' },
]

export function MediaUpload({ coverUrl, onCoverChange, audioUrl, onAudioChange, videoUrl, onVideoChange }: MediaUploadProps) {
  const [tab, setTab]         = useState<Tab>('image')
  const [uploading, setUpl]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const inputRef              = useRef<HTMLInputElement>(null)

  const currentUrl = tab === 'image' ? coverUrl : tab === 'audio' ? audioUrl : videoUrl
  const setUrl = (url: string) => {
    if (tab === 'image') onCoverChange(url)
    else if (tab === 'audio') onAudioChange(url)
    else onVideoChange(url)
  }

  const handleFile = async (file: File) => {
    setError(null)
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) {
      const reader = new FileReader()
      reader.onload = (e) => setUrl(e.target?.result as string)
      reader.readAsDataURL(file)
      return
    }
    setUpl(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'cmd-upload')
      fd.append('folder', 'cmdg')
      const resource = tab === 'image' ? 'image' : tab === 'audio' ? 'video' : 'video'
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resource}/upload`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.secure_url) setUrl(data.secure_url)
      else if (res.status === 400) {
        // Preset non configuré — fallback local
        const reader = new FileReader()
        reader.onload = (e) => { setUrl(e.target?.result as string); setError('⚠️ Cloudinary non configuré — aperçu local') }
        reader.readAsDataURL(file)
      } else setError('Erreur Cloudinary : ' + (data.error?.message || 'inconnu'))
    } catch { setError('Erreur réseau') }
    finally { setUpl(false) }
  }

  const cfg = TABS.find(t => t.key === tab)!

  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Médias (facultatif)</label>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {TABS.map(t => {
          const hasVal = t.key === 'image' ? coverUrl : t.key === 'audio' ? audioUrl : videoUrl
          return (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${tab === t.key ? 'bg-brand-600 border-brand-600 text-white' : 'border-neutral-200 text-neutral-500 hover:border-brand-300'}`}>
              {t.icon} {t.label}
              {hasVal && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          )
        })}
      </div>

      {/* Preview si valeur présente */}
      {currentUrl && (
        <div className="relative mb-3 rounded-xl overflow-hidden border border-neutral-200">
          {tab === 'image' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentUrl} alt="preview" className="w-full h-44 object-cover" />
          )}
          {tab === 'audio' && (
            <div className="p-4 bg-neutral-50">
              <audio controls src={currentUrl} className="w-full" />
            </div>
          )}
          {tab === 'video' && (
            <video controls src={currentUrl} className="w-full h-44 object-cover" />
          )}
          <button onClick={() => setUrl('')}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-lg flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Drop zone */}
      {!currentUrl && (
        <div onClick={() => inputRef.current?.click()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-neutral-200 hover:border-brand-400 rounded-xl p-5 text-center cursor-pointer transition-colors group">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-neutral-500">Upload...</p>
            </div>
          ) : (
            <>
              <p className="text-2xl mb-1">{cfg.icon}</p>
              <p className="text-sm font-bold text-neutral-400 group-hover:text-brand-600 transition-colors">
                Cliquez ou glissez un fichier {cfg.label.toLowerCase()}
              </p>
              <p className="text-xs text-neutral-300 mt-0.5">{cfg.hint} — max 50 MB</p>
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept={cfg.accept} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} className="hidden" />

      {/* Ou URL directe */}
      {!currentUrl && (
        <>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-neutral-100" /><span className="text-[10px] text-neutral-300 font-bold uppercase">ou coller une URL</span><div className="h-px flex-1 bg-neutral-100" />
          </div>
          <input type="url" value={currentUrl} onChange={e => setUrl(e.target.value)}
            placeholder={tab === 'image' ? 'https://... .jpg' : tab === 'audio' ? 'https://... .mp3' : 'https://... .mp4'}
            className="mt-2 w-full border border-neutral-200 rounded-xl px-4 h-9 text-xs focus:outline-none focus:border-brand-500 font-mono" />
        </>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
