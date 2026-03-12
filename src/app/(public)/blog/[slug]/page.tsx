import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'


interface Props { params: Promise<{ slug: string }> }

const TYPE_LABELS: Record<string, string> = {
  ARTICLE: 'Article', SERMON: 'Prédication', TESTIMONY: 'Témoignage', ANNOUNCEMENT: 'Annonce'
}

// ── Metadata Open Graph (pour Facebook, Instagram, WhatsApp, Twitter…) ────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug, status: 'PUBLISHED' },
    select: { title: true, excerpt: true, coverUrl: true, publishedAt: true, author: { select: { firstName: true, lastName: true } } }
  })
  if (!post) return { title: 'Article introuvable' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmdg.org'
  const description = post.excerpt || `Lisez "${post.title}" sur CMDG.`
  const images = post.coverUrl ? [{ url: post.coverUrl, width: 1200, height: 630, alt: post.title }] : []

  return {
    title: `${post.title} — CMDG`,
    description,
    openGraph: {
      title: post.title,
      description,
      url: `${appUrl}/blog/${slug}`,
      siteName: 'CMDG — Communauté des Messagers de Dieu',
      images,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [`${post.author.firstName} ${post.author.lastName}`],
    },
    twitter: {
      card: post.coverUrl ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      images: post.coverUrl ? [post.coverUrl] : [],
    },
  }
}


// ── Boutons de partage (Server Component compatible) ─────────────────────────
function ShareButtons({ url, title, excerpt }: { url: string; title: string; excerpt: string }) {
  const enc = encodeURIComponent
  const text = `${title}\n${excerpt}`
  const platforms = [
    { href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, color: 'bg-[#1877F2]', label: 'f' },
    { href: `https://wa.me/?text=${enc(text + '\n\n' + url)}`,          color: 'bg-[#25D366]', label: 'W' },
    { href: `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`,  color: 'bg-[#229ED9]', label: 'T' },
    { href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`, color: 'bg-black', label: 'X' },
  ]
  return (
    <div className="flex items-center gap-2">
      <span className="text-brand-500 text-xs font-bold uppercase tracking-widest mr-1">Partager</span>
      {platforms.map(p => (
        <a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer"
          className={`w-8 h-8 ${p.color} rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity`}>
          <span className="text-white text-xs font-black">{p.label}</span>
        </a>
      ))}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(d: Date | string) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d))
}

function renderContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('## '))  return <h2 key={i} className="font-display text-2xl font-bold text-brand-950 mt-8 mb-3">{line.slice(3)}</h2>
    if (line.startsWith('### ')) return <h3 key={i} className="font-sans font-bold text-lg text-neutral-800 mt-6 mb-2">{line.slice(4)}</h3>
    if (line.startsWith('> '))  return <blockquote key={i} className="border-l-4 border-brand-400 pl-5 my-5 italic text-neutral-600 text-lg">{line.slice(2)}</blockquote>
    if (line.startsWith('- '))  return <li key={i} className="ml-5 text-neutral-700 leading-relaxed list-disc">{line.slice(2)}</li>
    if (line.startsWith('---')) return <hr key={i} className="my-8 border-neutral-200" />
    if (!line.trim())           return <div key={i} className="h-4" />
    const parts = line.split(/\*\*(.*?)\*\*/g)
    const formatted = parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)
    return <p key={i} className="text-neutral-700 leading-relaxed text-[17px] mb-1">{formatted}</p>
  })
}

// Détecte si l'URL est un embed YouTube
function getYoutubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m?.[1] || null
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function BlogSlugPage({ params }: Props) {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug, status: 'PUBLISHED' },
    include: {
      author: { select: { firstName: true, lastName: true } },
      tags: { include: { tag: true } },
      church: { select: { name: true } },
    }
  })

  if (!post) notFound()

  const words    = post.content?.trim().split(/\s+/).length || 0
  const readTime = Math.max(1, Math.ceil(words / 200))
  const ytId     = post.videoUrl ? getYoutubeId(post.videoUrl) : null

  return (

      <article className="min-h-screen bg-white">

        {/* ── Hero ── */}
        <div className="bg-brand-950 pt-24 pb-16 px-6">
          <div className="max-w-3xl mx-auto">
            <Link href="/blog" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-200 text-sm font-medium mb-8 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Retour au blog
            </Link>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-brand-800 text-brand-300 text-xs font-bold uppercase tracking-widest rounded-full">{TYPE_LABELS[post.type] || post.type}</span>
              {post.publishedAt && <span className="text-brand-500 text-sm">{fmt(post.publishedAt)}</span>}
              <span className="text-brand-600 text-sm">{readTime} min de lecture</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-6">{post.title}</h1>
            {post.excerpt && <p className="text-brand-300 text-xl leading-relaxed">{post.excerpt}</p>}
            <div className="flex items-center justify-between gap-4 mt-8 pt-8 border-t border-brand-900 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-800 border border-brand-700 flex items-center justify-center text-brand-300 font-bold text-sm">
                  {post.author.firstName[0]}{post.author.lastName[0]}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{post.author.firstName} {post.author.lastName}</p>
                  <p className="text-brand-500 text-xs">{post.church?.name}</p>
                </div>
              </div>
              <ShareButtons url={`${process.env.NEXT_PUBLIC_APP_URL || ''}/blog/${post.slug}`} title={post.title} excerpt={post.excerpt || ''} />
            </div>
          </div>
        </div>

        {/* ── Image de couverture ── */}
        {post.coverUrl && !ytId && (
          <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverUrl} alt={post.title} className="w-full h-72 object-cover rounded-2xl shadow-xl" />
          </div>
        )}

        {/* ── Vidéo ── */}
        {post.videoUrl && (
          <div className="max-w-3xl mx-auto px-6 mt-8">
            {ytId ? (
              <div className="relative w-full rounded-2xl overflow-hidden shadow-xl" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title={post.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video controls src={post.videoUrl} className="w-full rounded-2xl shadow-xl" poster={post.coverUrl || undefined}>
                Votre navigateur ne supporte pas la vidéo.
              </video>
            )}
            <p className="text-xs text-neutral-400 mt-2 text-center">Vidéo · {post.title}</p>
          </div>
        )}

        {/* ── Audio ── */}
        {post.audioUrl && (
          <div className="max-w-3xl mx-auto px-6 mt-8">
            <div className="bg-brand-950 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-800 rounded-xl flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate mb-2">{post.title}</p>
                <audio controls src={post.audioUrl} className="w-full h-8" style={{ accentColor: '#3b82f6' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Contenu texte ── */}
        <div className="max-w-3xl mx-auto px-6 py-16">
          {post.content ? (
            <div className="prose-cmdg">{renderContent(post.content)}</div>
          ) : (
            <p className="text-neutral-400 italic">Contenu non disponible.</p>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-16 pt-8 border-t border-neutral-100">
              {post.tags.map(t => (
                <span key={t.tag.slug} className="px-3 py-1.5 bg-brand-50 text-brand-600 rounded-full text-xs font-bold">{t.tag.name}</span>
              ))}
            </div>
          )}

          {/* Auteur */}
          <div className="mt-12 p-8 bg-neutral-50 rounded-2xl border border-neutral-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-950 flex items-center justify-center text-brand-300 font-bold text-lg shrink-0">
                {post.author.firstName[0]}{post.author.lastName[0]}
              </div>
              <div>
                <p className="font-bold text-neutral-900">{post.author.firstName} {post.author.lastName}</p>
                <p className="text-sm text-neutral-500">{post.church?.name || 'CMDG'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Tous les articles
            </Link>
          </div>
        </div>

      </article>

  )
}
