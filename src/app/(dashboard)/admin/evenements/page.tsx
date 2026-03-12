'use client'
import { useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useApi, apiFetch } from '@/hooks/useApi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Event {
  id: string; title: string; slug: string; startDate: string; endDate: string | null
  location: string | null; status: string; isRecurring: boolean
  _count: { attendances: number }
}
interface ApiResp { events: Event[]; total: number; page: number; totalPages: number }

const MONTHS_FR = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC']
const STATUS_COLOR: Record<string,string> = {
  UPCOMING: 'bg-brand-50 text-brand-700',
  ONGOING:  'bg-emerald-50 text-emerald-700',
  COMPLETED:'bg-neutral-100 text-neutral-500',
  CANCELLED:'bg-red-50 text-red-600',
}
const STATUS_FR: Record<string,string> = { UPCOMING:'À venir', ONGOING:'En cours', COMPLETED:'Terminé', CANCELLED:'Annulé' }

const IconPlus  = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>)
const IconSearch= () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>)
const IconEye   = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>)
const IconTrash = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>)

export default function EvenementsPage() {
  const { user }  = useAuth()
  const router    = useRouter()
  const [status, setStatus]     = useState('')
  const [search, setSearch]     = useState('')
  const [debSearch, setDeb]     = useState('')
  const [page, setPage]         = useState(1)

  const handleSearch = useCallback((v: string) => {
    setSearch(v)
    clearTimeout((handleSearch as any)._t)
    ;(handleSearch as any)._t = setTimeout(() => { setDeb(v); setPage(1) }, 400)
  }, [])

  const q = new URLSearchParams({
    ...(user?.church?.id ? { churchId: user.church.id } : {}),
    ...(status ? { status } : {}),
    ...(debSearch ? { search: debSearch } : {}),
    page: String(page), limit: '12',
  }).toString()

  const { data, loading, refetch } = useApi<ApiResp>(`/api/events?${q}`)

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Supprimer l'événement « ${title} » ?`)) return
    await apiFetch(`/api/events/${slug}`, 'DELETE')
    refetch()
  }

  const fmtDate = (d: string) => {
    const dt = new Date(d)
    return `${String(dt.getDate()).padStart(2,'0')} ${MONTHS_FR[dt.getMonth()]} ${dt.getFullYear()}`
  }
  const fmtTime = (d: string) => new Intl.DateTimeFormat('fr-FR', { hour:'2-digit', minute:'2-digit' }).format(new Date(d))

  const Sk = () => (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 animate-pulse">
      <div className="h-5 bg-neutral-100 rounded w-3/4 mb-3"/>
      <div className="h-3 bg-neutral-50 rounded w-1/2"/>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Événements</h1>
          <p className="text-neutral-500 text-sm">{data ? `${data.total} événement${data.total>1?'s':''}` : 'Chargement...'}</p>
        </div>
        <Link href="/admin/evenements/nouveau" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all shadow-sm">
          <IconPlus /> Nouvel événement
        </Link>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-3 flex items-center text-neutral-400 pointer-events-none"><IconSearch /></div>
          <input type="text" placeholder="Rechercher un événement..." value={search} onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand-300 transition-colors"/>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-lg">
          {[['','Tous'],['UPCOMING','À venir'],['ONGOING','En cours'],['COMPLETED','Terminés'],['CANCELLED','Annulés']].map(([v,l]) => (
            <div key={v} onClick={() => { setStatus(v); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${status===v?'bg-white text-brand-600 shadow-sm':'text-neutral-500 hover:text-neutral-700'}`}>{l}</div>
          ))}
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_,i) => <Sk key={i}/>)}
        </div>
      ) : data?.events.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.events.map(ev => {
            const dt = new Date(ev.startDate)
            return (
              <div key={ev.id} className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-all group">
                <div className="h-2 bg-brand-600"/>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 bg-brand-50 rounded-xl flex flex-col items-center justify-center border border-brand-100 shrink-0">
                        <span className="font-display text-2xl font-bold text-brand-700 leading-none">{String(dt.getDate()).padStart(2,'0')}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-brand-400">{MONTHS_FR[dt.getMonth()]}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-neutral-900 leading-tight line-clamp-2">{ev.title}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">{fmtTime(ev.startDate)}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[ev.status]||'bg-neutral-100 text-neutral-500'}`}>
                      {STATUS_FR[ev.status]||ev.status}
                    </span>
                  </div>
                  {ev.location && <p className="text-xs text-neutral-400 mb-3 flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    {ev.location}
                  </p>}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-50">
                    <span className="text-xs text-neutral-400">{ev._count.attendances} présences</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/evenements/${ev.slug}`} className="p-1.5 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><IconEye /></Link>
                      <button onClick={() => handleDelete(ev.slug, ev.title)} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><IconTrash /></button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {/* Add card */}
          <Link href="/admin/evenements/nouveau" className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-brand-400 hover:bg-brand-50 transition-all group min-h-[180px]">
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-neutral-300 group-hover:border-brand-400 flex items-center justify-center text-neutral-300 group-hover:text-brand-500 transition-colors"><IconPlus /></div>
            <span className="text-xs font-bold text-neutral-400 group-hover:text-brand-500 uppercase tracking-widest">Créer un événement</span>
          </Link>
        </div>
      ) : (
        <div className="text-center py-32 text-neutral-400">
          <p className="font-bold text-lg mb-4">Aucun événement</p>
          <Link href="/admin/evenements/nouveau" className="text-brand-600 font-bold text-sm hover:underline">Créer le premier événement →</Link>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-4 py-2 rounded-lg border border-neutral-200 text-sm font-bold disabled:opacity-40 hover:bg-neutral-50">←</button>
          <span className="text-sm text-neutral-500 px-4">Page {data.page} / {data.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(data.totalPages,p+1))} disabled={page===data.totalPages} className="px-4 py-2 rounded-lg border border-neutral-200 text-sm font-bold disabled:opacity-40 hover:bg-neutral-50">→</button>
        </div>
      )}
    </div>
  )
}
