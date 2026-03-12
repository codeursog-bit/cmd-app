'use client'
import { useState } from 'react'
import { useApi, apiFetch } from '@/hooks/useApi'

interface Donation { id: string; amount: number; currency: string; donorName: string; donorEmail: string; donorPhone: string | null; purpose: string | null; status: string; paymentMethod: string | null; reference: string | null; donorMessage: string | null; createdAt: string; confirmedAt: string | null }
interface DonationsData { donations: Donation[]; total: number; stats: { total: number; count: number } }

const STATUS_COLORS: Record<string, string> = { PENDING: 'bg-amber-50 text-amber-700 border-amber-200', CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200', CANCELLED: 'bg-red-50 text-red-500 border-red-100' }
const STATUS_FR: Record<string, string> = { PENDING: 'En attente', CONFIRMED: 'Confirmé', CANCELLED: 'Annulé' }
const METHOD_FR: Record<string, string> = { mobile_money: '📱 Mobile Money', virement: '🏦 Virement', especes: '💵 Espèces' }

export default function DonsPage() {
  const [filter, setFilter]     = useState('')
  const [selected, setSelected] = useState<Donation | null>(null)

  const url = `/api/donations${filter ? `?status=${filter}` : ''}`
  const { data, loading, refetch } = useApi<DonationsData>(url)

  const handleStatus = async (id: string, status: string) => {
    await apiFetch(`/api/donations/${id}`, 'PATCH', { status })
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
    refetch()
  }

  const fmt = (d: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
  const fmtAmount = (a: number, c: string) => `${new Intl.NumberFormat('fr-FR').format(a)} ${c}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Dons</h1>
          <p className="text-neutral-500 text-sm mt-1">Donations reçues via le site public</p>
        </div>
        <a href="/don" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Voir la page publique
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total reçu (confirmé)', value: data ? fmtAmount(data.stats.total, 'USD') : '—', color: 'text-emerald-600' },
          { label: 'Dons confirmés', value: String(data?.stats.count || 0), color: 'text-emerald-600' },
          { label: 'Total dons', value: String(data?.total || 0), color: 'text-neutral-900' },
          { label: 'En attente', value: String(data?.donations.filter(d => d.status === 'PENDING').length || 0), color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-neutral-100 p-5">
            <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-neutral-400 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {[{ key: '', label: 'Tous' }, { key: 'PENDING', label: 'En attente' }, { key: 'CONFIRMED', label: 'Confirmés' }, { key: 'CANCELLED', label: 'Annulés' }].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${filter === f.key ? 'bg-brand-600 border-brand-600 text-white' : 'border-neutral-200 text-neutral-500 hover:border-brand-300'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Liste */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />)}</div>
          ) : data?.donations.length ? (
            <div className="divide-y divide-neutral-50">
              {data.donations.map(don => (
                <div key={don.id} onClick={() => setSelected(don)}
                  className={`p-4 cursor-pointer hover:bg-neutral-50 transition-colors ${selected?.id === don.id ? 'bg-brand-50' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-brand-700 text-xs font-black">{don.donorName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-neutral-800">{don.donorName}</p>
                        <p className="text-xs text-neutral-400">{don.purpose || 'Offrande'} · {fmt(don.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="font-black text-base text-neutral-900">{fmtAmount(don.amount, don.currency)}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[don.status]}`}>
                        {STATUS_FR[don.status]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-neutral-300">
              <p className="text-4xl mb-3">💝</p>
              <p className="font-bold text-sm">Aucun don pour l&apos;instant</p>
              <p className="text-xs mt-1">Partagez le lien de donation sur votre site</p>
            </div>
          )}
        </div>

        {/* Détail */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 sticky top-6 space-y-5">
            <div className="flex items-center justify-between">
              <p className="font-black text-2xl text-neutral-900">{fmtAmount(selected.amount, selected.currency)}</p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[selected.status]}`}>{STATUS_FR[selected.status]}</span>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Donateur', selected.donorName],
                ['Email', selected.donorEmail],
                selected.donorPhone ? ['Téléphone', selected.donorPhone] : null,
                ['Motif', selected.purpose || 'Non précisé'],
                ['Méthode', selected.paymentMethod ? METHOD_FR[selected.paymentMethod] || selected.paymentMethod : '—'],
                ['Référence', selected.reference || '—'],
                ['Date', fmt(selected.createdAt)],
                selected.confirmedAt ? ['Confirmé le', fmt(selected.confirmedAt)] : null,
              ].filter(Boolean).map(item => (
                <div key={item![0]} className="flex justify-between gap-2 py-2 border-b border-neutral-50">
                  <span className="text-neutral-400 font-medium shrink-0">{item![0]}</span>
                  <span className="font-bold text-neutral-700 text-right">{item![1]}</span>
                </div>
              ))}
            </div>
            {selected.donorMessage && (
              <div className="bg-neutral-50 rounded-xl p-3">
                <p className="text-xs font-bold text-neutral-400 mb-1">Message</p>
                <p className="text-sm text-neutral-600 italic">&ldquo;{selected.donorMessage}&rdquo;</p>
              </div>
            )}
            {selected.status === 'PENDING' && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button onClick={() => handleStatus(selected.id, 'CONFIRMED')}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors">
                  ✓ Confirmer
                </button>
                <button onClick={() => handleStatus(selected.id, 'CANCELLED')}
                  className="py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors">
                  ✗ Annuler
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center text-neutral-300 hidden lg:flex flex-col items-center justify-center">
            <p className="text-4xl mb-3">💝</p>
            <p className="font-bold text-sm">Sélectionnez un don</p>
          </div>
        )}
      </div>
    </div>
  )
}
