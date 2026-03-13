'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApi, apiFetch } from '@/hooks/useApi'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

interface Member { id: string; firstName: string; lastName: string }

export default function NouveauBaptemePage() {
  const router = useRouter()
  const { user } = useAuth()

  const [memberId, setMemberId]     = useState('')
  const [memberSearch, setSearch]   = useState('')
  const [baptismType, setType]      = useState('WATER')
  const [baptismDate, setDate]      = useState('')
  const [officiant, setOfficiant]   = useState('')
  const [location, setLocation]     = useState('')
  const [notes, setNotes]           = useState('')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const churchId = user?.church?.id
  const q = new URLSearchParams({ ...(churchId ? { churchId } : {}), ...(memberSearch ? { search: memberSearch } : {}), limit: '20' }).toString()
  const { data } = useApi<{ members: Member[] }>(`/api/members?${q}`)

  const selectedMember = data?.members.find(m => m.id === memberId)

  const handleSubmit = async () => {
    if (!memberId) { setError('Sélectionnez un membre'); return }
    if (!baptismDate) { setError('La date est requise'); return }
    setSaving(true); setError(null)
    const { error: err } = await apiFetch('/api/baptisms', 'POST', {
      memberId, baptismType, baptismDate, officiant, location, notes
    })
    setSaving(false)
    if (err) { setError(err); return }
    router.push('/admin/baptemes')
  }

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/baptemes" className="flex items-center gap-2 text-neutral-500 hover:text-brand-600 text-sm font-medium transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Retour
        </Link>
      </div>

      <div>
        <h1 className="font-sans text-2xl font-bold text-neutral-900">Enregistrer un baptême</h1>
        <p className="text-neutral-500 text-sm mt-1">Le numéro de certificat sera généré automatiquement</p>
      </div>

      {error && <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 space-y-6">

        {/* Membre */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Membre *</label>
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : memberSearch}
            onChange={e => { setSearch(e.target.value); setMemberId('') }}
            className="w-full border border-neutral-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-brand-500 transition-colors"
          />
          {!memberId && memberSearch && data?.members.length ? (
            <div className="mt-1 border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
              {data.members.map(m => (
                <div key={m.id} onClick={() => { setMemberId(m.id); setSearch('') }}
                  className="px-4 py-3 text-sm cursor-pointer hover:bg-brand-50 hover:text-brand-700 flex items-center gap-3 border-b border-neutral-50 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                    {m.firstName[0]}{m.lastName[0]}
                  </div>
                  {m.firstName} {m.lastName}
                </div>
              ))}
            </div>
          ) : null}
          {!memberId && memberSearch && data?.members.length === 0 && (
            <p className="mt-2 text-xs text-neutral-400 italic">Aucun membre trouvé</p>
          )}
        </div>

        {/* Type de baptême */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Type de baptême *</label>
          <div className="flex bg-neutral-100 p-1 rounded-xl w-fit gap-1">
            {[['WATER', 'Baptême d\'eau'], ['HOLY_SPIRIT', 'Baptême du Saint-Esprit']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setType(v)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${baptismType === v ? 'bg-white text-brand-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Date du baptême *</label>
          <input type="date" value={baptismDate} onChange={e => setDate(e.target.value)}
            className="w-full border border-neutral-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-brand-500 transition-colors"/>
        </div>

        {/* Officiant */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Officiant</label>
          <input type="text" value={officiant} onChange={e => setOfficiant(e.target.value)} placeholder="Nom du pasteur / officiant"
            className="w-full border border-neutral-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-brand-500 transition-colors"/>
        </div>

        {/* Lieu */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Lieu</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Piscine, salle principale..."
            className="w-full border border-neutral-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-brand-500 transition-colors"/>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Observations, témoignage..."
            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-brand-500 transition-colors"/>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link href="/admin/baptemes"
            className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors text-center">
            Annuler
          </Link>
          <button onClick={handleSubmit} disabled={saving || !memberId || !baptismDate}
            className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors disabled:opacity-50">
            {saving ? 'Enregistrement...' : 'Enregistrer le baptême'}
          </button>
        </div>
      </div>
    </div>
  )
}