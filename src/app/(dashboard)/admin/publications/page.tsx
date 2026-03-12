'use client'
import { useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useApi, apiFetch } from '@/hooks/useApi'
import Link from 'next/link'

interface Post { id:string; title:string; slug:string; type:string; status:string; viewCount:number; publishedAt:string|null; createdAt:string; author:{firstName:string;lastName:string} }
interface ApiResp { posts:Post[]; total:number; page:number; totalPages:number }

const TYPE_FR: Record<string,string> = { ARTICLE:'Article', SERMON:'Prédication', TESTIMONY:'Témoignage', ANNOUNCEMENT:'Annonce' }
const STATUS_COLOR: Record<string,string> = { PUBLISHED:'bg-emerald-50 text-emerald-700', DRAFT:'bg-amber-50 text-amber-700', ARCHIVED:'bg-neutral-100 text-neutral-500' }
const STATUS_FR: Record<string,string> = { PUBLISHED:'Publié', DRAFT:'Brouillon', ARCHIVED:'Archivé' }

const IconPlus   = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>)
const IconSearch = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>)
const IconEye    = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>)
const IconTrash  = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>)

export default function PublicationsPage() {
  const { user }  = useAuth()
  const [status, setStatus]   = useState('')
  const [type, setType]       = useState('')
  const [search, setSearch]   = useState('')
  const [debSearch, setDeb]   = useState('')
  const [page, setPage]       = useState(1)

  const handleSearch = useCallback((v:string) => {
    setSearch(v)
    clearTimeout((handleSearch as any)._t)
    ;(handleSearch as any)._t = setTimeout(() => { setDeb(v); setPage(1) }, 400)
  }, [])

  const q = new URLSearchParams({
    ...(user?.church?.id ? { churchId: user.church.id } : {}),
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(debSearch ? { search: debSearch } : {}),
    page: String(page), limit: '12',
  }).toString()

  const { data, loading, refetch } = useApi<ApiResp>(`/api/posts?${q}`)

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Supprimer « ${title} » ?`)) return
    await apiFetch(`/api/posts/${slug}`, 'DELETE')
    refetch()
  }

  const fmtDate = (d: string) => new Intl.DateTimeFormat('fr-FR', { day:'numeric', month:'short', year:'numeric' }).format(new Date(d))

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Publications</h1>
          <p className="text-neutral-500 text-sm">{data ? `${data.total} publication${data.total>1?'s':''}` : 'Chargement...'}</p>
        </div>
        <Link href="/admin/publications/nouvelle" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all shadow-sm">
          <IconPlus /> Nouvelle publication
        </Link>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-3 flex items-center text-neutral-400 pointer-events-none"><IconSearch /></div>
          <input type="text" placeholder="Rechercher une publication..." value={search} onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand-300 transition-colors"/>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-lg">
          {[['','Tout'],['PUBLISHED','Publié'],['DRAFT','Brouillon'],['ARCHIVED','Archivé']].map(([v,l]) => (
            <div key={v} onClick={() => { setStatus(v); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all ${status===v?'bg-white text-brand-600 shadow-sm':'text-neutral-500 hover:text-neutral-700'}`}>{l}</div>
          ))}
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-lg">
          {[['','Type'],['ARTICLE','Article'],['SERMON','Prédication'],['TESTIMONY','Témoignage'],['ANNOUNCEMENT','Annonce']].map(([v,l]) => (
            <div key={v} onClick={() => { setType(v); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all ${type===v?'bg-white text-brand-600 shadow-sm':'text-neutral-500 hover:text-neutral-700'}`}>{l}</div>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                {['Titre','Type','Auteur','Vues','Date','Statut',''].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? Array(8).fill(0).map((_,i) => (
                <tr key={i}>{Array(7).fill(0).map((_,j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-neutral-100 rounded animate-pulse"/></td>)}</tr>
              )) : data?.posts.map(p => (
                <tr key={p.id} className="group hover:bg-brand-50/20 transition-colors">
                  <td className="px-6 py-4 max-w-xs">
                    <Link href={`/publications/${p.slug}`} className="font-bold text-sm text-neutral-900 hover:text-brand-600 transition-colors line-clamp-1">{p.title}</Link>
                  </td>
                  <td className="px-6 py-4"><span className="text-xs font-bold bg-neutral-100 text-neutral-600 px-2 py-1 rounded-lg">{TYPE_FR[p.type]||p.type}</span></td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{p.author.firstName} {p.author.lastName[0]}.</td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{p.viewCount.toLocaleString('fr-FR')}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{p.publishedAt ? fmtDate(p.publishedAt) : fmtDate(p.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[p.status]||'bg-neutral-100 text-neutral-500'}`}>
                      {STATUS_FR[p.status]||p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/publications/${p.slug}`} className="p-1.5 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><IconEye /></Link>
                      <button onClick={() => handleDelete(p.slug, p.title)} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><IconTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !data?.posts.length && (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-neutral-400 text-sm italic">Aucune publication.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Page {data.page} / {data.totalPages} — {data.total} résultats</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold disabled:opacity-40 hover:bg-neutral-50">←</button>
              <button onClick={() => setPage(p => Math.min(data.totalPages,p+1))} disabled={page===data.totalPages} className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold disabled:opacity-40 hover:bg-neutral-50">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
