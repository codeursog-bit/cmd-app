'use client'
import { useState } from 'react'
import { useApi, apiFetch } from '@/hooks/useApi'

interface ContactMessage {
  id: string; name: string; email: string; subject: string | null
  message: string; status: string; createdAt: string
}
interface MessagesData { messages: ContactMessage[]; total: number; unreadCount: number }

const STATUS_OPTIONS = [
  { key: '',         label: 'Tous' },
  { key: 'UNREAD',   label: 'Non lus' },
  { key: 'READ',     label: 'Lus' },
  { key: 'REPLIED',  label: 'Répondus' },
  { key: 'ARCHIVED', label: 'Archivés' },
]
const STATUS_COLORS: Record<string, string> = {
  UNREAD:   'bg-brand-50 text-brand-700 border-brand-200',
  READ:     'bg-neutral-50 text-neutral-500 border-neutral-200',
  REPLIED:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  ARCHIVED: 'bg-neutral-100 text-neutral-400 border-neutral-200',
}
const STATUS_FR: Record<string, string> = {
  UNREAD: 'Non lu', READ: 'Lu', REPLIED: 'Répondu', ARCHIVED: 'Archivé',
}
const STATUS_NEXT: Record<string, { label: string; value: string }[]> = {
  UNREAD:   [{ label: 'Marquer lu', value: 'READ' }, { label: 'Archiver', value: 'ARCHIVED' }],
  READ:     [{ label: 'Marquer répondu', value: 'REPLIED' }, { label: 'Archiver', value: 'ARCHIVED' }],
  REPLIED:  [{ label: 'Archiver', value: 'ARCHIVED' }],
  ARCHIVED: [{ label: 'Restaurer', value: 'READ' }],
}

export default function MessagesPage() {
  const [filter, setFilter]     = useState('')
  const [selected, setSelected] = useState<ContactMessage | null>(null)

  const url = `/api/contact${filter ? `?status=${filter}` : ''}`
  const { data, loading, refetch } = useApi<MessagesData>(url)

  const handleStatus = async (id: string, status: string) => {
    await apiFetch(`/api/contact/${id}`, 'PATCH', { status })
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce message définitivement ?')) return
    await apiFetch(`/api/contact/${id}`, 'DELETE')
    if (selected?.id === id) setSelected(null)
    refetch()
  }

  const handleReply = (email: string, subject: string | null) => {
    window.open(`mailto:${email}?subject=RE: ${encodeURIComponent(subject || 'Votre message')}`)
  }

  const fmt = (d: string) => new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(d))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Messages</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Formulaire de contact du site public
            {data?.unreadCount ? <span className="ml-2 px-2 py-0.5 bg-brand-600 text-white text-xs font-bold rounded-full">{data.unreadCount} non lus</span> : null}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map(opt => (
          <button key={opt.key} onClick={() => setFilter(opt.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${filter === opt.key ? 'bg-brand-600 border-brand-600 text-white' : 'border-neutral-200 text-neutral-500 hover:border-brand-300 hover:text-brand-600'}`}>
            {opt.label}
            {opt.key === 'UNREAD' && data?.unreadCount ? ` (${data.unreadCount})` : ''}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Liste */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />)}
            </div>
          ) : data?.messages.length ? (
            <div className="divide-y divide-neutral-50">
              {data.messages.map(msg => (
                <div key={msg.id}
                  onClick={() => { setSelected(msg); if (msg.status === 'UNREAD') handleStatus(msg.id, 'READ') }}
                  className={`p-4 cursor-pointer transition-colors hover:bg-neutral-50 ${selected?.id === msg.id ? 'bg-brand-50 hover:bg-brand-50' : ''} ${msg.status === 'UNREAD' ? 'border-l-4 border-l-brand-500' : 'border-l-4 border-l-transparent'}`}>
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                        <span className="text-brand-700 text-xs font-black">{msg.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm truncate ${msg.status === 'UNREAD' ? 'font-black text-neutral-900' : 'font-bold text-neutral-700'}`}>{msg.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{msg.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[msg.status]}`}>
                        {STATUS_FR[msg.status]}
                      </span>
                      <span className="text-[10px] text-neutral-300">{fmt(msg.createdAt)}</span>
                    </div>
                  </div>
                  {msg.subject && <p className="text-xs font-bold text-neutral-600 ml-10 mb-0.5">{msg.subject}</p>}
                  <p className="text-xs text-neutral-400 ml-10 line-clamp-2">{msg.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-neutral-300">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <p className="font-bold text-sm">Aucun message</p>
              <p className="text-xs mt-1">Les messages du formulaire de contact apparaîtront ici</p>
            </div>
          )}
        </div>

        {/* Détail message */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 sticky top-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                  <span className="text-brand-700 text-sm font-black">{selected.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-black text-neutral-900">{selected.name}</p>
                  <a href={`mailto:${selected.email}`} className="text-xs text-brand-600 hover:underline">{selected.email}</a>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {selected.subject && (
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Sujet</p>
                <p className="font-bold text-neutral-800">{selected.subject}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Message</p>
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>

            <p className="text-[10px] text-neutral-300 mb-5">{fmt(selected.createdAt)}</p>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => handleReply(selected.email, selected.subject)}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                </svg>
                Répondre par email
              </button>

              <div className="grid grid-cols-2 gap-2">
                {STATUS_NEXT[selected.status]?.map(action => (
                  <button key={action.value}
                    onClick={() => handleStatus(selected.id, action.value)}
                    className="py-2 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
                    {action.label}
                  </button>
                ))}
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="py-2 border border-red-100 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center text-neutral-300 hidden lg:flex flex-col items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <p className="font-bold text-sm">Sélectionnez un message</p>
          </div>
        )}
      </div>
    </div>
  )
}
