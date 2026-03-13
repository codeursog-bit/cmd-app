// 'use client'
// import { useState } from 'react'
// import { useApi } from '@/hooks/useApi'

// interface QueueItem {
//   id: string; content: string; status: string; createdAt: string; scheduledAt: string | null
//   socialAccount: { platform: string; accountName: string }
//   post: { title: string; slug: string } | null
//   event: { title: string } | null
// }
// interface Post { id: string; title: string; slug: string; excerpt: string | null; publishedAt: string | null; status: string }
// interface Event { id: string; title: string; slug: string; startDate: string; location: string | null; description: string | null; status: string }

// const STATUS_COLORS: Record<string, string> = {
//   PUBLISHED: 'bg-emerald-50 text-emerald-700',
//   PENDING:   'bg-amber-50 text-amber-700',
//   FAILED:    'bg-red-50 text-red-600',
//   SKIPPED:   'bg-neutral-100 text-neutral-500',
// }
// const STATUS_FR: Record<string, string> = {
//   PUBLISHED: 'Publié', PENDING: 'En attente', FAILED: 'Échec', SKIPPED: 'Ignoré',
// }

// // ── Génère les liens de partage pour chaque plateforme ─────────────────────────
// function buildShareLinks(text: string, url: string) {
//   const encoded = encodeURIComponent(text)
//   const encodedUrl = encodeURIComponent(url)
//   return {
//     facebook:  `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encoded}`,
//     whatsapp:  `https://wa.me/?text=${encoded}%20${encodedUrl}`,
//     twitter:   `https://twitter.com/intent/tweet?text=${encoded}&url=${encodedUrl}`,
//     telegram:  `https://t.me/share/url?url=${encodedUrl}&text=${encoded}`,
//     linkedin:  `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
//     copy:      `${text}\n\n${url}`,
//   }
// }

// // ── Icônes plateformes ─────────────────────────────────────────────────────────
// const PLATFORMS = [
//   { key: 'facebook', label: 'Facebook',  color: 'bg-[#1877F2]', icon: 'F' },
//   { key: 'whatsapp', label: 'WhatsApp',  color: 'bg-[#25D366]', icon: 'W' },
//   { key: 'twitter',  label: 'X/Twitter', color: 'bg-black',     icon: 'X' },
//   { key: 'telegram', label: 'Telegram',  color: 'bg-[#229ED9]', icon: 'T' },
//   { key: 'linkedin', label: 'LinkedIn',  color: 'bg-[#0A66C2]', icon: 'in' },
// ]

// // ── Panneau de partage ─────────────────────────────────────────────────────────
// function SharePanel({ title, text, url, onClose }: {
//   title: string; text: string; url: string; onClose: () => void
// }) {
//   const [copied, setCopied] = useState(false)
//   const links = buildShareLinks(text, url)

//   const handleCopy = () => {
//     navigator.clipboard.writeText(links.copy)
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2000)
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
//         <div className="flex items-center justify-between mb-5">
//           <div>
//             <p className="font-bold text-neutral-900">Partager</p>
//             <p className="text-xs text-neutral-400 truncate max-w-[280px]">{title}</p>
//           </div>
//           <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400">
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//               <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//             </svg>
//           </button>
//         </div>

//         {/* Aperçu du message */}
//         <div className="bg-neutral-50 rounded-xl p-4 mb-5 border border-neutral-100">
//           <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-2">Message</p>
//           <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line line-clamp-4">{text}</p>
//           <p className="text-xs text-brand-600 mt-2 font-medium">{url}</p>
//         </div>

//         {/* Boutons plateformes */}
//         <div className="grid grid-cols-5 gap-2 mb-5">
//           {PLATFORMS.map(p => (
//             <a key={p.key} href={links[p.key as keyof typeof links] as string}
//               target="_blank" rel="noopener noreferrer"
//               className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-neutral-50 transition-colors group">
//               <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center`}>
//                 <span className="text-white text-xs font-black">{p.icon}</span>
//               </div>
//               <span className="text-[9px] font-bold text-neutral-400 group-hover:text-neutral-600 text-center leading-tight">{p.label}</span>
//             </a>
//           ))}
//         </div>

//         {/* Copier */}
//         <button onClick={handleCopy}
//           className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
//           {copied ? '✓ Copié dans le presse-papier !' : 'Copier le texte + lien'}
//         </button>
//       </div>
//     </div>
//   )
// }

// // ── PAGE PRINCIPALE ────────────────────────────────────────────────────────────
// export default function ReseauxSociauxPage() {
//   const [shareItem, setShareItem] = useState<{ title: string; text: string; url: string } | null>(null)

//   const { data: postsData }   = useApi<{ posts: Post[] }>('/api/posts?status=PUBLISHED&limit=10')
//   const { data: eventsData }  = useApi<{ events: Event[] }>('/api/events?limit=10')
//   const { data: queueData, loading: loadQ } = useApi<{ queue: QueueItem[] }>('/api/social-queue?limit=20')

//   const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ton-site.com'

//   const openSharePost = (post: Post) => {
//     const text = [`📖 ${post.title}`, post.excerpt ? `\n${post.excerpt}` : ''].filter(Boolean).join('')
//     setShareItem({ title: post.title, text, url: `${appUrl}/blog/${post.slug}` })
//   }

//   const openShareEvent = (event: Event) => {
//     const dt = new Date(event.startDate)
//     const dateStr = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dt)
//     const timeStr = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(dt)
//     const text = [
//       `📅 ${event.title}`,
//       event.description ? `\n${event.description}` : '',
//       `\n🗓 ${dateStr} à ${timeStr}`,
//       event.location ? `📍 ${event.location}` : '',
//     ].filter(Boolean).join('\n')
//     setShareItem({ title: event.title, text, url: `${appUrl}/evenements/${event.slug}` })
//   }

//   const stats = {
//     total:     queueData?.queue.length || 0,
//     published: queueData?.queue.filter(q => q.status === 'PUBLISHED').length || 0,
//     pending:   queueData?.queue.filter(q => q.status === 'PENDING').length || 0,
//   }

//   return (
//     <>
//       {shareItem && (
//         <SharePanel
//           title={shareItem.title}
//           text={shareItem.text}
//           url={shareItem.url}
//           onClose={() => setShareItem(null)}
//         />
//       )}

//       <div className="space-y-8">
//         <div>
//           <h1 className="font-sans text-2xl font-bold text-neutral-900">Réseaux Sociaux</h1>
//           <p className="text-neutral-500 text-sm mt-1">
//             Partagez vos posts et événements sur Facebook, WhatsApp, Telegram et plus — en un clic, sans token.
//           </p>
//         </div>

//         {/* STATS */}
//         <div className="grid grid-cols-3 gap-4">
//           {[
//             { label: 'Total partagé',  value: stats.total,     color: 'text-neutral-900' },
//             { label: 'Publiés',        value: stats.published, color: 'text-emerald-600' },
//             { label: 'En attente',     value: stats.pending,   color: 'text-amber-600'   },
//           ].map(s => (
//             <div key={s.label} className="bg-white rounded-2xl border border-neutral-100 p-5">
//               <p className={`font-display text-4xl font-bold ${s.color}`}>{s.value}</p>
//               <p className="text-xs text-neutral-400 font-medium mt-1">{s.label}</p>
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

//           {/* PUBLICATIONS À PARTAGER */}
//           <div className="bg-white rounded-2xl border border-neutral-100 p-6">
//             <h3 className="font-bold text-neutral-900 mb-5">Publications récentes</h3>
//             {postsData?.posts.length ? (
//               <div className="space-y-3">
//                 {postsData.posts.map(post => (
//                   <div key={post.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 transition-colors">
//                     <div className="min-w-0">
//                       <p className="font-bold text-sm text-neutral-800 line-clamp-1">{post.title}</p>
//                       {post.excerpt && <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{post.excerpt}</p>}
//                       {post.publishedAt && (
//                         <p className="text-[10px] text-neutral-300 mt-1">
//                           {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(post.publishedAt))}
//                         </p>
//                       )}
//                     </div>
//                     <button onClick={() => openSharePost(post)}
//                       className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors">
//                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                         <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
//                         <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
//                       </svg>
//                       Partager
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-10 text-neutral-300">
//                 <p className="text-sm font-bold">Aucune publication publiée</p>
//                 <p className="text-xs mt-1">Créez et publiez des articles d&apos;abord</p>
//               </div>
//             )}
//           </div>

//           {/* ÉVÉNEMENTS À PARTAGER */}
//           <div className="bg-white rounded-2xl border border-neutral-100 p-6">
//             <h3 className="font-bold text-neutral-900 mb-5">Événements</h3>
//             {eventsData?.events.length ? (
//               <div className="space-y-3">
//                 {eventsData.events.map(ev => {
//                   const dt = new Date(ev.startDate)
//                   const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
//                   return (
//                     <div key={ev.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 transition-colors">
//                       <div className="flex items-center gap-3 min-w-0">
//                         <div className="w-10 h-12 bg-brand-50 border border-brand-100 rounded-lg flex flex-col items-center justify-center shrink-0">
//                           <span className="font-display text-lg font-bold text-brand-700 leading-none">{String(dt.getDate()).padStart(2,'0')}</span>
//                           <span className="text-[8px] font-bold uppercase text-brand-400">{MONTHS[dt.getMonth()]}</span>
//                         </div>
//                         <div className="min-w-0">
//                           <p className="font-bold text-sm text-neutral-800 line-clamp-1">{ev.title}</p>
//                           {ev.location && <p className="text-xs text-neutral-400 mt-0.5">{ev.location}</p>}
//                         </div>
//                       </div>
//                       <button onClick={() => openShareEvent(ev)}
//                         className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors">
//                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                           <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
//                           <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
//                         </svg>
//                         Partager
//                       </button>
//                     </div>
//                   )
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-10 text-neutral-300">
//                 <p className="text-sm font-bold">Aucun événement</p>
//                 <p className="text-xs mt-1">Créez des événements d&apos;abord</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* HISTORIQUE */}
//         {queueData?.queue && queueData.queue.length > 0 && (
//           <div className="bg-white rounded-2xl border border-neutral-100 p-6">
//             <h3 className="font-bold text-neutral-900 mb-5">Historique des partages (via posts/événements)</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               {queueData.queue.map(item => (
//                 <div key={item.id} className="border border-neutral-100 rounded-xl p-3 hover:bg-neutral-50 transition-colors">
//                   <div className="flex items-center justify-between mb-1.5">
//                     <span className="text-xs font-bold text-neutral-500">{item.socialAccount.platform} · {item.socialAccount.accountName}</span>
//                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[item.status] || 'bg-neutral-100 text-neutral-500'}`}>
//                       {STATUS_FR[item.status] || item.status}
//                     </span>
//                   </div>
//                   <p className="text-xs text-neutral-500 line-clamp-1">{item.content}</p>
//                   <p className="text-[10px] text-neutral-300 mt-1">
//                     {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(item.createdAt))}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   )
// }


'use client'
import { useState } from 'react'
import { useApi } from '@/hooks/useApi'

interface QueueItem {
  id: string; content: string; status: string; createdAt: string; scheduledAt: string | null
  socialAccount: { platform: string; accountName: string }
  post: { title: string; slug: string } | null
  event: { title: string } | null
}
interface Post { id: string; title: string; slug: string; excerpt: string | null; publishedAt: string | null; status: string }
interface Event { id: string; title: string; slug: string; startDate: string; location: string | null; description: string | null; status: string }

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: 'bg-emerald-50 text-emerald-700',
  PENDING:   'bg-amber-50 text-amber-700',
  FAILED:    'bg-red-50 text-red-600',
  SKIPPED:   'bg-neutral-100 text-neutral-500',
}
const STATUS_FR: Record<string, string> = {
  PUBLISHED: 'Publié', PENDING: 'En attente', FAILED: 'Échec', SKIPPED: 'Ignoré',
}

function buildShareLinks(text: string, url: string) {
  const enc = encodeURIComponent
  return {
    // ✅ sharer.php sans double slash — fonctionne sur PC, navigateur mobile et app FB
    facebook:  `https://www.facebook.com/sharer.php?u=${enc(url)}`,
    whatsapp:  `https://wa.me/?text=${enc(text)}%20${enc(url)}`,
    twitter:   `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
    telegram:  `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
    linkedin:  `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    copy:      `${text}\n\n${url}`,
  }
}

const PLATFORMS = [
  { key: 'facebook', label: 'Facebook',  color: 'bg-[#1877F2]', icon: 'F' },
  { key: 'whatsapp', label: 'WhatsApp',  color: 'bg-[#25D366]', icon: 'W' },
  { key: 'twitter',  label: 'X/Twitter', color: 'bg-black',     icon: 'X' },
  { key: 'telegram', label: 'Telegram',  color: 'bg-[#229ED9]', icon: 'T' },
  { key: 'linkedin', label: 'LinkedIn',  color: 'bg-[#0A66C2]', icon: 'in' },
]

function SharePanel({ title, text, url, onClose }: {
  title: string; text: string; url: string; onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const links = buildShareLinks(text, url)

  const handleCopy = () => {
    navigator.clipboard.writeText(links.copy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
            <a key={p.key} href={links[p.key as keyof typeof links] as string}
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-neutral-50 transition-colors group">
              <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center`}>
                <span className="text-white text-xs font-black">{p.icon}</span>
              </div>
              <span className="text-[9px] font-bold text-neutral-400 group-hover:text-neutral-600 text-center leading-tight">{p.label}</span>
            </a>
          ))}
        </div>
        <button onClick={handleCopy}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
          {copied ? '✓ Copié dans le presse-papier !' : 'Copier le texte + lien'}
        </button>
      </div>
    </div>
  )
}

export default function ReseauxSociauxPage() {
  const [shareItem, setShareItem] = useState<{ title: string; text: string; url: string } | null>(null)

  const { data: postsData }  = useApi<{ posts: Post[] }>('/api/posts?status=PUBLISHED&limit=10')
  const { data: eventsData } = useApi<{ events: Event[] }>('/api/events?limit=10')
  const { data: queueData, loading: loadQ } = useApi<{ queue: QueueItem[] }>('/api/social-queue?limit=20')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ton-site.com'

  const openSharePost = (post: Post) => {
    const text = [`📖 ${post.title}`, post.excerpt ? `\n${post.excerpt}` : ''].filter(Boolean).join('')
    setShareItem({ title: post.title, text, url: `${appUrl}/blog/${post.slug}` })
  }

  const openShareEvent = (event: Event) => {
    const dt = new Date(event.startDate)
    const dateStr = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dt)
    const timeStr = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(dt)
    const text = [
      `📅 ${event.title}`,
      event.description ? `\n${event.description}` : '',
      `\n🗓 ${dateStr} à ${timeStr}`,
      event.location ? `📍 ${event.location}` : '',
    ].filter(Boolean).join('\n')
    setShareItem({ title: event.title, text, url: `${appUrl}/evenements/${event.slug}` })
  }

  const stats = {
    total:     queueData?.queue.length || 0,
    published: queueData?.queue.filter(q => q.status === 'PUBLISHED').length || 0,
    pending:   queueData?.queue.filter(q => q.status === 'PENDING').length || 0,
  }

  return (
    <>
      {shareItem && (
        <SharePanel title={shareItem.title} text={shareItem.text} url={shareItem.url} onClose={() => setShareItem(null)} />
      )}

      <div className="space-y-8">
        <div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Réseaux Sociaux</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Partagez vos posts et événements sur Facebook, WhatsApp, Telegram et plus — en un clic, sans token.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total partagé',  value: stats.total,     color: 'text-neutral-900' },
            { label: 'Publiés',        value: stats.published, color: 'text-emerald-600' },
            { label: 'En attente',     value: stats.pending,   color: 'text-amber-600'   },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-neutral-100 p-5">
              <p className={`font-display text-4xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-neutral-400 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h3 className="font-bold text-neutral-900 mb-5">Publications récentes</h3>
            {postsData?.posts.length ? (
              <div className="space-y-3">
                {postsData.posts.map(post => (
                  <div key={post.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-neutral-800 line-clamp-1">{post.title}</p>
                      {post.excerpt && <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{post.excerpt}</p>}
                      {post.publishedAt && (
                        <p className="text-[10px] text-neutral-300 mt-1">
                          {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(post.publishedAt))}
                        </p>
                      )}
                    </div>
                    <button onClick={() => openSharePost(post)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                      Partager
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-neutral-300">
                <p className="text-sm font-bold">Aucune publication publiée</p>
                <p className="text-xs mt-1">Créez et publiez des articles d&apos;abord</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h3 className="font-bold text-neutral-900 mb-5">Événements</h3>
            {eventsData?.events.length ? (
              <div className="space-y-3">
                {eventsData.events.map(ev => {
                  const dt = new Date(ev.startDate)
                  const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
                  return (
                    <div key={ev.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-12 bg-brand-50 border border-brand-100 rounded-lg flex flex-col items-center justify-center shrink-0">
                          <span className="font-display text-lg font-bold text-brand-700 leading-none">{String(dt.getDate()).padStart(2,'0')}</span>
                          <span className="text-[8px] font-bold uppercase text-brand-400">{MONTHS[dt.getMonth()]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-neutral-800 line-clamp-1">{ev.title}</p>
                          {ev.location && <p className="text-xs text-neutral-400 mt-0.5">{ev.location}</p>}
                        </div>
                      </div>
                      <button onClick={() => openShareEvent(ev)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                        Partager
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-neutral-300">
                <p className="text-sm font-bold">Aucun événement</p>
                <p className="text-xs mt-1">Créez des événements d&apos;abord</p>
              </div>
            )}
          </div>
        </div>

        {queueData?.queue && queueData.queue.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h3 className="font-bold text-neutral-900 mb-5">Historique des partages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {queueData.queue.map(item => (
                <div key={item.id} className="border border-neutral-100 rounded-xl p-3 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-neutral-500">{item.socialAccount.platform} · {item.socialAccount.accountName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[item.status] || 'bg-neutral-100 text-neutral-500'}`}>
                      {STATUS_FR[item.status] || item.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-1">{item.content}</p>
                  <p className="text-[10px] text-neutral-300 mt-1">
                    {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(item.createdAt))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
