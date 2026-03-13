'use client'
import { useState, useEffect } from 'react'
import { useApi, apiFetch } from '@/hooks/useApi'
import { ImageUpload } from '@/components/ui/ImageUpload'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Post {
  id: string; title: string; slug: string; excerpt: string | null; content: string | null
  coverUrl: string | null; type: string; status: string; viewCount: number; publishedAt: string | null
  author: { firstName: string; lastName: string }
  tags: { tag: { name: string } }[]
}

const TYPES    = [['ARTICLE','Article'],['SERMON','Prédication'],['TESTIMONY','Témoignage'],['ANNOUNCEMENT','Annonce']]
const STATUSES = [['DRAFT','Brouillon'],['PUBLISHED','Publié'],['ARCHIVED','Archivé']]
const STATUS_COLOR: Record<string, string> = {
  PUBLISHED: 'bg-emerald-50 text-emerald-700',
  DRAFT:     'bg-amber-50 text-amber-700',
  ARCHIVED:  'bg-neutral-100 text-neutral-500',
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
            <p className="font-bold text-neutral-900">Partager</p>
            <p className="text-xs text-neutral-400 truncate max-w-[280px]">{title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="bg-neutral-50 rounded-xl p-4 mb-5 border border-neutral-100">
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-2">Message</p>
          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line line-clamp-4">{text}</p>
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

export default function PublicationEditPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { data: post, loading, refetch } = useApi<Post>(`/api/posts/${slug}`)
  const router = useRouter()
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [saved, setSaved]     = useState(false)
  const [shareOpen, setShare] = useState(false)
  const [sendingNewsletter, setSendingNewsletter] = useState(false)
  const [newsletterResult, setNewsletterResult] = useState<string | null>(null)

  const [title, setTitle]     = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverUrl, setCover]  = useState('')
  const [type, setType]       = useState('ARTICLE')
  const [status, setStatus]   = useState('DRAFT')
  const [tags, setTags]       = useState('')

  const sendNewsletter = async () => {
    if (!post) return
    if (!confirm(`Envoyer "${post.title}" à tous les abonnés newsletter ?`)) return
    setSendingNewsletter(true)
    setNewsletterResult(null)
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postSlug: post.slug }),
      })
      const data = await res.json()
      if (data.success) setNewsletterResult(`✓ Envoyé à ${data.data.sent} abonné(s)`)
      else setNewsletterResult('✗ ' + (data.error || 'Erreur'))
    } catch { setNewsletterResult('✗ Erreur réseau') }
    finally { setSendingNewsletter(false) }
  }

  useEffect(() => {
    if (post) {
      setTitle(post.title); setExcerpt(post.excerpt || ''); setContent(post.content || '')
      setCover(post.coverUrl || ''); setType(post.type); setStatus(post.status)
      setTags(post.tags.map(t => t.tag.name).join(', '))
    }
  }, [post])

  const handleSave = async () => {
    if (!title) { setError('Titre requis'); return }
    setSaving(true); setError(null)
    const tagNames = tags.split(',').map(t => t.trim()).filter(Boolean)
    const { error: err } = await apiFetch(`/api/posts/${slug}`, 'PATCH', {
      title, excerpt, content, coverUrl: coverUrl || null, type, status, tagNames,
      publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : undefined,
    })
    setSaving(false)
    if (err) { setError(err); return }
    setSaved(true); setTimeout(() => setSaved(false), 3000); refetch()
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer « ${post?.title} » ?`)) return
    await apiFetch(`/api/posts/${slug}`, 'DELETE')
    router.push('/admin/publications')
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ton-site.com'
  const shareText = post ? [`📖 ${post.title}`, post.excerpt ? `\n${post.excerpt}` : ''].filter(Boolean).join('') : ''
  const shareUrl  = post ? `${appUrl}/blog/${post.slug}` : ''

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="h-8 w-48 bg-neutral-100 rounded animate-pulse" />
      <div className="h-96 bg-neutral-100 rounded-2xl animate-pulse" />
    </div>
  )
  if (!post) return (
    <div className="text-center py-32 text-neutral-400 font-bold">
      Publication introuvable. <Link href="/admin/publications" className="text-brand-600 hover:underline ml-2">Retour</Link>
    </div>
  )

  return (
    <>
      {shareOpen && post?.status === 'PUBLISHED' && (
        <SharePanel title={post.title} text={shareText} url={shareUrl} onClose={() => setShare(false)} />
      )}

      <div className="max-w-4xl space-y-8 animate-fade-in">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link href="/admin/publications" className="flex items-center gap-2 text-neutral-500 hover:text-brand-600 text-sm font-medium transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Retour aux publications
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[post.status]}`}>
              {STATUSES.find(([v]) => v === post.status)?.[1]}
            </span>
            <span className="text-xs text-neutral-400">{post.viewCount} vues</span>
            {post.status === 'PUBLISHED' && (
              <>
                <button onClick={() => setShare(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Partager
                </button>
                <button onClick={sendNewsletter} disabled={sendingNewsletter}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors">
                  {sendingNewsletter ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  )}
                  Envoyer newsletter
                </button>
              </>
            )}
            <button onClick={handleDelete} className="px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-sm font-bold text-red-600 hover:bg-red-100 transition-colors">
              Supprimer
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
        {newsletterResult && (
          <div className={`px-4 py-3 rounded-xl text-sm font-bold ${newsletterResult.startsWith('✓') ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {newsletterResult}
          </div>
        )}
        {saved  && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold">✓ Publication mise à jour</div>}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Titre <span className="text-red-400">*</span></label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-4 h-12 text-base font-bold focus:outline-none focus:border-brand-500 transition-colors" />
              </div>
              <ImageUpload value={coverUrl} onChange={setCover} />
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Extrait</label>
                <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
                  className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="Résumé court visible sur les listes..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Contenu</label>
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
                    {STATUSES.map(([v, l]) => (
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
              {saving ? 'Sauvegarde...' : status === 'PUBLISHED' ? 'Publier' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
