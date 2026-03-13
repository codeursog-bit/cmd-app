'use client'
import { useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useApi } from '@/hooks/useApi'
import Link from 'next/link'

interface Baptism {
  id:string; baptismType:string; baptismDate:string; officiant:string|null; certificateNo:string|null; location:string|null
  member:{id:string;firstName:string;lastName:string;gender:string|null}
}
interface ApiResp { baptisms:Baptism[]; total:number; page:number; totalPages:number; stats:{baptismType:string;_count:number}[] }

const IconPlus = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>)
const IconSearch = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>)

export default function BaptismsPage() {
  const { user } = useAuth()
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch]         = useState('')
  const [debSearch, setDeb]         = useState('')
  const [page, setPage]             = useState(1)

  const handleSearch = useCallback((v:string) => {
    setSearch(v)
    clearTimeout((handleSearch as any)._t)
    ;(handleSearch as any)._t = setTimeout(() => { setDeb(v); setPage(1) }, 400)
  }, [])

  const q = new URLSearchParams({
    ...(user?.church?.id ? {churchId:user.church.id} : {}),
    ...(typeFilter ? {type:typeFilter} : {}),
    ...(debSearch ? {search:debSearch} : {}),
    page:String(page), limit:'15',
  }).toString()

  const { data, loading } = useApi<ApiResp>(`/api/baptisms?${q}`)

  const totalWater  = data?.stats?.find(s=>s.baptismType==='WATER')?._count ?? 0
  const totalSpirit = data?.stats?.find(s=>s.baptismType==='HOLY_SPIRIT')?._count ?? 0

  const fmt = (d:string) => new Intl.DateTimeFormat('fr-FR').format(new Date(d))
  const Sk = () => <tr>{Array(6).fill(0).map((_,i)=><td key={i} className="px-6 py-4"><div className="h-4 bg-neutral-100 rounded animate-pulse"/></td>)}</tr>

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Registre des Baptêmes</h1>
          <p className="text-neutral-500 text-sm">{data ? `${data.total} baptêmes enregistrés` : 'Chargement...'}</p>
        </div>
        <Link href="/admin/baptemes/nouveau" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all shadow-sm">
          <IconPlus /> Enregistrer un baptême
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        {[
          ['Total', String(data ? totalWater + totalSpirit : '—'), ''],
          ['Baptêmes d\'eau', String(totalWater || '—'), 'text-brand-600'],
          ['Baptêmes du S.-Esprit', String(totalSpirit || '—'), 'text-brand-400'],
        ].map(([l,v,c]) => (
          <div key={l} className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100">
            <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider">{l}</p>
            <p className={`font-display text-4xl font-bold mt-1 ${c||'text-neutral-800'}`}>{v}</p>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-3 flex items-center text-neutral-400 pointer-events-none"><IconSearch /></div>
          <input type="text" placeholder="Rechercher un membre..." value={search} onChange={e=>handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand-300 transition-colors"/>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-lg">
          {[['','Tous'],['WATER','Eau'],['HOLY_SPIRIT','Saint-Esprit']].map(([v,l]) => (
            <div key={v} onClick={()=>{setTypeFilter(v);setPage(1)}}
              className={`px-4 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all ${typeFilter===v?'bg-white text-brand-600 shadow-sm':'text-neutral-500 hover:text-neutral-700'}`}>{l}</div>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                {['Membre','Type','Date','Officiant','Lieu','N° Certificat',''].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? Array(8).fill(0).map((_,i)=><Sk key={i}/>) :
                data?.baptisms.map(b => (
                  <tr key={b.id} className="hover:bg-brand-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/membres/${b.member.id}`} className="flex items-center gap-3 hover:text-brand-600 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                          {b.member.firstName[0]}{b.member.lastName[0]}
                        </div>
                        <span className="font-bold text-sm text-neutral-900">{b.member.firstName} {b.member.lastName}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${b.baptismType==='WATER'?'bg-brand-50 text-brand-700':'bg-brand-900 text-brand-300'}`}>
                        {b.baptismType==='WATER' ? 'Eau' : 'Saint-Esprit'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{fmt(b.baptismDate)}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500">{b.officiant||'—'}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500 max-w-32 truncate">{b.location||'—'}</td>
                    <td className="px-6 py-4 text-xs font-mono text-neutral-400">{b.certificateNo||'—'}</td>
                    <td className="px-6 py-4 text-right">
                      <a href={`/admin/baptemes/carte/${b.id}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-brand-600 hover:underline">Certificat</a>
                    </td>
                  </tr>
                ))
              }
              {!loading && !data?.baptisms.length && (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-neutral-400 text-sm italic">Aucun baptême enregistré.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Page {data.page} / {data.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold disabled:opacity-40 hover:bg-neutral-50">←</button>
              <button onClick={()=>setPage(p=>Math.min(data.totalPages,p+1))} disabled={page===data.totalPages} className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold disabled:opacity-40 hover:bg-neutral-50">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
