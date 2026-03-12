'use client'
import { useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useApi } from '@/hooks/useApi'
import Link from 'next/link'
import { apiFetch } from '@/hooks/useApi'

const IconPlus = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>)
const IconSearch = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>)
const IconChevronLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>)
const IconChevronRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>)
const IconEye = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>)

interface Member {
  id: string; firstName: string; lastName: string; email: string | null
  phone: string | null; isActive: boolean; gender: string | null
  joinDate: string
  departments: { department: { id: string; name: string; color: string | null } }[]
}

interface MembersResponse { members: Member[]; total: number; page: number; totalPages: number }

const Skeleton = () => (
  <tr>{Array(7).fill(0).map((_,i)=><td key={i} className="px-6 py-4"><div className="h-4 bg-neutral-100 rounded animate-pulse"/></td>)}</tr>
)

export default function MembersListPage() {
  const { user } = useAuth()
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('all')
  const [page, setPage]         = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  const handleSearch = useCallback((v: string) => {
    setSearch(v)
    clearTimeout((handleSearch as any)._t)
    ;(handleSearch as any)._t = setTimeout(() => { setDebouncedSearch(v); setPage(1) }, 400)
  }, [])

  const query = new URLSearchParams({
    ...(user?.church?.id ? { churchId: user.church.id } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status !== 'all' ? { status } : {}),
    page: String(page), limit: '15',
  }).toString()

  const { data, loading, refetch } = useApi<MembersResponse>(`/api/members?${query}`)

  const fmt = (d: string) => new Intl.DateTimeFormat('fr-FR').format(new Date(d))

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Membres</h1>
          <p className="text-neutral-500 text-sm">
            {data ? `${data.total} membres enregistrés` : 'Chargement...'}
          </p>
        </div>
        <Link href="/admin/membres/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all shadow-sm">
          <IconPlus /> Ajouter un membre
        </Link>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-3 flex items-center text-neutral-400 pointer-events-none"><IconSearch /></div>
          <input type="text" placeholder="Rechercher par nom, email..." value={search} onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand-300 transition-colors"/>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-lg">
          {[['all','Tous'],['active','Actifs'],['inactive','Inactifs']].map(([v,l]) => (
            <div key={v} onClick={() => { setStatus(v); setPage(1) }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all ${status===v?'bg-white text-brand-600 shadow-sm':'text-neutral-500 hover:text-neutral-700'}`}>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>{['','Nom','Département','Email','Téléphone','Arrivée','Statut',''].map(h=>(
                <th key={h} className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? Array(8).fill(0).map((_,i) => <Skeleton key={i} />) :
                data?.members.map(m => (
                  <tr key={m.id} className="group hover:bg-brand-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                        {m.firstName[0]}{m.lastName[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/membres/${m.id}`} className="font-bold text-sm text-neutral-900 hover:text-brand-600 transition-colors">
                        {m.firstName} {m.lastName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {m.departments[0]?.department.name || <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">{m.email || '—'}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500">{m.phone || '—'}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500">{fmt(m.joinDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${m.isActive?'bg-emerald-50 text-emerald-700':'bg-neutral-100 text-neutral-500'}`}>
                        {m.isActive?'Actif':'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/membres/${m.id}`} className="text-neutral-400 hover:text-brand-600 cursor-pointer transition-colors inline-block" title="Voir">
                        <IconEye />
                      </Link>
                    </td>
                  </tr>
                ))
              }
              {!loading && !data?.members.length && (
                <tr><td colSpan={8} className="px-6 py-20 text-center text-neutral-400 text-sm italic">Aucun membre trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium">
              Page {data.page} sur {data.totalPages} — {data.total} résultats
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 disabled:opacity-40 hover:bg-neutral-50 transition-colors">
                <IconChevronLeft />
              </button>
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${page===p?'bg-brand-600 text-white':'border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(data.totalPages, p+1))} disabled={page === data.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 disabled:opacity-40 hover:bg-neutral-50 transition-colors">
                <IconChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
