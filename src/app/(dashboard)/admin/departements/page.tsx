'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useApi, apiFetch } from '@/hooks/useApi'
import Link from 'next/link'

interface Dept {
  id: string; name: string; description: string | null; color: string | null
  leader: { id: string; firstName: string; lastName: string } | null
  _count: { members: number; programs: number }
}

const IconPlus = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>)
const IconPencil = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>)
const IconTrash = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>)

export default function DepartementsPage() {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<Dept | null>(null)
  const [name, setName]           = useState('')
  const [description, setDesc]    = useState('')
  const [color, setColor]         = useState('#1e50a2')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const { data, loading, refetch } = useApi<Dept[]>(
    user?.church?.id ? `/api/departments?churchId=${user.church.id}` : null
  )

  const openCreate = () => { setEditing(null); setName(''); setDesc(''); setColor('#1e50a2'); setError(null); setShowModal(true) }
  const openEdit   = (d: Dept) => { setEditing(d); setName(d.name); setDesc(d.description || ''); setColor(d.color || '#1e50a2'); setError(null); setShowModal(true) }

  const handleSave = async () => {
    if (!name.trim()) { setError('Nom requis'); return }
    setSaving(true); setError(null)
    const url    = editing ? `/api/departments/${editing.id}` : '/api/departments'
    const method = editing ? 'PATCH' : 'POST'
    const { error: err } = await apiFetch(url, method, { name, description, color, churchId: user?.church?.id })
    setSaving(false)
    if (err) { setError(err); return }
    setShowModal(false); refetch()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer le département « ${name} » ? Tous ses membres seront désassignés.`)) return
    await apiFetch(`/api/departments/${id}`, 'DELETE')
    refetch()
  }

  const COLORS = ['#0a1628','#1e50a2','#2563eb','#3b82f6','#93c5fd','#1a3d6e','#102a52','#64748b']

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Départements</h1>
          <p className="text-neutral-500 text-sm">{data ? `${data.length} département${data.length > 1 ? 's' : ''}` : 'Chargement...'}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all shadow-sm">
          <IconPlus /> Nouveau département
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_,i) => <div key={i} className="h-40 bg-neutral-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : data?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map(d => (
            <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-all group">
              <div className="h-2" style={{ backgroundColor: d.color || '#1e50a2' }} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-sans font-bold text-neutral-900 text-base">{d.name}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(d)} className="p-1.5 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><IconPencil /></button>
                    <button onClick={() => handleDelete(d.id, d.name)} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><IconTrash /></button>
                  </div>
                </div>
                {d.description && <p className="text-sm text-neutral-500 leading-relaxed mb-4 line-clamp-2">{d.description}</p>}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
                  <div className="flex gap-4 text-xs text-neutral-500">
                    <span><strong className="text-neutral-800">{d._count.members}</strong> membres</span>
                    <span><strong className="text-neutral-800">{d._count.programs}</strong> programmes</span>
                  </div>
                  {d.leader && (
                    <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">
                      {d.leader.firstName} {d.leader.lastName[0]}.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {/* Add card */}
          <div onClick={openCreate} className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all group min-h-[160px]">
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-neutral-300 group-hover:border-brand-400 flex items-center justify-center text-neutral-300 group-hover:text-brand-500 transition-colors"><IconPlus /></div>
            <span className="text-xs font-bold text-neutral-400 group-hover:text-brand-500 uppercase tracking-widest transition-colors">Ajouter un département</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 text-neutral-400">
          <p className="font-bold text-lg mb-4">Aucun département</p>
          <button onClick={openCreate} className="text-brand-600 font-bold text-sm hover:underline">Créer le premier département →</button>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <h2 className="font-sans text-xl font-bold text-neutral-900 mb-6">{editing ? 'Modifier le département' : 'Nouveau département'}</h2>
            {error && <div className="mb-4 bg-red-50 text-red-700 border border-red-100 px-4 py-2 rounded-lg text-sm">{error}</div>}
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Nom <span className="text-red-400">*</span></label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500 transition-colors" placeholder="ex: Louange & Adoration"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Description</label>
                <textarea value={description} onChange={e => setDesc(e.target.value)} rows={2}
                  className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors resize-none" placeholder="Description courte..."/>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Couleur</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-brand-600 scale-110' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-brand-600 rounded-xl text-sm font-bold text-white hover:bg-brand-700 transition-colors disabled:opacity-50">
                {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
