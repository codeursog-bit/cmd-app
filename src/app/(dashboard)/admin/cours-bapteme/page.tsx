'use client'
import { useState } from 'react'
import { useApi, apiFetch } from '@/hooks/useApi'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

interface Course { id: string; title: string; description: string | null; startDate: string; endDate: string | null; location: string | null; teacherName: string | null; isActive: boolean; _count: { enrollments: number; sessions: number } }

export default function CoursBaptemePage() {
  const { user } = useAuth()
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [title, setTitle]     = useState('')
  const [desc, setDesc]       = useState('')
  const [startDate, setStart] = useState('')
  const [endDate, setEnd]     = useState('')
  const [location, setLoc]    = useState('')
  const [teacher, setTeacher] = useState('')

  const { data, loading, refetch } = useApi<{ courses: Course[] }>('/api/baptism-courses')

  const handleCreate = async () => {
    if (!title || !startDate) return
    setSaving(true)
    await apiFetch('/api/baptism-courses', 'POST', { title, description: desc, startDate, endDate: endDate || null, location, teacherName: teacher, churchId: user?.church?.id })
    setSaving(false); setShowNew(false); setTitle(''); setDesc(''); setStart(''); setEnd(''); setLoc(''); setTeacher('')
    refetch()
  }

  const fmt = (d: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Cours de Baptême</h1>
          <p className="text-neutral-500 text-sm mt-1">Gérez les cours, inscriptions et présences</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouveau cours
        </button>
      </div>

      {/* Modal nouveau cours */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="font-bold text-neutral-900">Nouveau cours de baptême</p>
              <button onClick={() => setShowNew(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Titre *', value: title, set: setTitle, type: 'text', placeholder: 'Cours de baptême — Juin 2026' },
                { label: 'Enseignant', value: teacher, set: setTeacher, type: 'text', placeholder: 'Nom du responsable' },
                { label: 'Lieu', value: location, set: setLoc, type: 'text', placeholder: 'Salle principale' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">{f.label}</label>
                  <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                    className="w-full border border-neutral-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-brand-500" />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full border border-neutral-200 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:border-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{ label: 'Date début *', value: startDate, set: setStart }, { label: 'Date fin', value: endDate, set: setEnd }].map(f => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">{f.label}</label>
                    <input type="date" value={f.value} onChange={e => f.set(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-brand-500" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50">Annuler</button>
              <button onClick={handleCreate} disabled={saving || !title || !startDate}
                className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 disabled:opacity-50">
                {saving ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des cours */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : data?.courses.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.courses.map(c => (
            <Link key={c.id} href={`/admin/cours-bapteme/${c.id}`}
              className="bg-white rounded-2xl border border-neutral-100 p-5 hover:shadow-md transition-all hover:border-brand-200 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v10"/><path d="m16 8-4 4-4-4"/><path d="M20 19a8 8 0 0 0-16 0"/>
                  </svg>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400'}`}>
                  {c.isActive ? 'Actif' : 'Terminé'}
                </span>
              </div>
              <h3 className="font-bold text-neutral-900 group-hover:text-brand-700 transition-colors mb-1">{c.title}</h3>
              {c.teacherName && <p className="text-xs text-neutral-400 mb-3"><span className="inline-flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{c.teacherName}</span></p>}
              <div className="text-xs text-neutral-400 space-y-1">
                <p><span className="inline-flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>{fmt(c.startDate)}{c.endDate ? ` → ${fmt(c.endDate)}` : ''}</span></p>
                {c.location && <p><span className="inline-flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>{c.location}</span></p>}
              </div>
              <div className="flex gap-4 mt-4 pt-4 border-t border-neutral-50">
                <div className="text-center">
                  <p className="font-black text-xl text-brand-700">{c._count.enrollments}</p>
                  <p className="text-[10px] text-neutral-400">inscrits</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-xl text-neutral-700">{c._count.sessions}</p>
                  <p className="text-[10px] text-neutral-400">séances</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-100 py-20 text-center text-neutral-300">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
            <path d="M12 2v10"/><path d="m16 8-4 4-4-4"/><path d="M20 19a8 8 0 0 0-16 0"/>
          </svg>
          <p className="font-bold text-sm">Aucun cours de baptême</p>
          <p className="text-xs mt-1">Créez votre premier cours ci-dessus</p>
        </div>
      )}
    </div>
  )
}
