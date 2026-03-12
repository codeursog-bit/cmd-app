'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useApi, apiFetch } from '@/hooks/useApi'
import Link from 'next/link'

interface Church { id:string; name:string; city:string|null; country:string; phone:string|null; email:string|null; pastor:{id:string;firstName:string;lastName:string}|null; _count:{members:number;departments:number;events:number} }
interface User { id:string; firstName:string; lastName:string; role:string }

const IconPlus = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>)

export default function EglisesPage() {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<Church | null>(null)
  const [name, setName]           = useState('')
  const [city, setCity]           = useState('')
  const [address, setAddress]     = useState('')
  const [phone, setPhone]         = useState('')
  const [email, setEmail]         = useState('')
  const [pastorId, setPastorId]   = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string|null>(null)

  const { data: churches, loading, refetch } = useApi<Church[]>(
    user?.role === 'SUPER_ADMIN' ? '/api/churches' : null
  )
  const { data: users } = useApi<User[]>(user?.church?.id ? `/api/users?churchId=${user.church.id}` : null)

  if (user && user.role !== 'SUPER_ADMIN') return (
    <div className="flex items-center justify-center h-64 text-neutral-400 text-sm font-medium">Accès réservé au Berger Principal.</div>
  )

  const openCreate = () => { setEditing(null); setName(''); setCity(''); setAddress(''); setPhone(''); setEmail(''); setPastorId(''); setError(null); setShowModal(true) }
  const openEdit   = (c: Church) => { setEditing(c); setName(c.name); setCity(c.city||''); setAddress(''); setPhone(c.phone||''); setEmail(c.email||''); setPastorId(c.pastor?.id||''); setError(null); setShowModal(true) }

  const handleSave = async () => {
    if (!name) { setError('Nom requis'); return }
    setSaving(true); setError(null)
    const url = editing ? `/api/churches/${editing.id}` : '/api/churches'
    const method = editing ? 'PATCH' : 'POST'
    const { error: err } = await apiFetch(url, method, { name, city, address, phone, email, pastorId: pastorId || null })
    setSaving(false)
    if (err) { setError(err); return }
    setShowModal(false); refetch()
  }

  const handleDelete = async (c: Church) => {
    if (!confirm(`Supprimer l'église « ${c.name} » ? Cette action supprimera toutes les données associées.`)) return
    await apiFetch(`/api/churches/${c.id}`, 'DELETE')
    refetch()
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Gestion des Églises</h1>
          <p className="text-neutral-500 text-sm">{churches ? `${churches.length} église${churches.length>1?'s':''}` : 'Chargement...'}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all shadow-sm">
          <IconPlus /> Nouvelle église
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(4).fill(0).map((_,i) => <div key={i} className="h-48 bg-neutral-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : churches?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {churches.map(c => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-neutral-900">{c.name}</h3>
                  <p className="text-sm text-neutral-500">{c.city ? `${c.city}, ` : ''}{c.country}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(c)} className="p-2 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                  </button>
                  <button onClick={() => handleDelete(c)} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  </button>
                </div>
              </div>
              {c.pastor && (
                <div className="mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 text-[10px] font-bold">
                    {c.pastor.firstName[0]}{c.pastor.lastName[0]}
                  </div>
                  <span className="text-xs text-neutral-600">Pasteur : <strong>{c.pastor.firstName} {c.pastor.lastName}</strong></span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-50 text-center">
                {[['Membres',c._count.members],['Depts',c._count.departments],['Événements',c._count.events]].map(([l,v]) => (
                  <div key={l}>
                    <p className="font-display text-2xl font-bold text-brand-600">{v}</p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div onClick={openCreate} className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all group min-h-[200px]">
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-neutral-300 group-hover:border-brand-400 flex items-center justify-center text-neutral-300 group-hover:text-brand-500"><IconPlus /></div>
            <span className="text-xs font-bold text-neutral-400 group-hover:text-brand-500 uppercase tracking-widest">Ajouter une église</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 text-neutral-400">
          <p className="font-bold text-lg mb-4">Aucune église</p>
          <button onClick={openCreate} className="text-brand-600 font-bold text-sm hover:underline">Créer la première église →</button>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <h2 className="font-sans text-xl font-bold text-neutral-900 mb-6">{editing ? "Modifier l'église" : 'Nouvelle église'}</h2>
            {error && <div className="mb-4 bg-red-50 text-red-700 border border-red-100 px-4 py-2 rounded-lg text-sm">{error}</div>}
            <div className="space-y-4">
              {[['Nom', name, setName, true, 'Temple de la Grâce'],['Ville', city, setCity, false, 'Kinshasa'],['Téléphone', phone, setPhone, false, '+243 8x xxx xxxx'],['Email', email, setEmail, false, 'contact@eglise.org']].map(([l,v,fn,req,ph]) => (
                <div key={l as string}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">{l as string}{req ? <span className="text-red-400 ml-1">*</span> : ''}</label>
                  <input type="text" value={v as string} onChange={e => (fn as Function)(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500" placeholder={ph as string}/>
                </div>
              ))}
              {users && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Pasteur responsable</label>
                  <select value={pastorId} onChange={e => setPastorId(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500">
                    <option value="">— Aucun —</option>
                    {users.filter(u => ['PASTOR','SUPER_ADMIN'].includes(u.role)).map(u => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-brand-600 rounded-xl text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
                {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
