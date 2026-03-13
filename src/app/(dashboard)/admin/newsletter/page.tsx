'use client'
import { useState } from 'react'
import { useApi, apiFetch } from '@/hooks/useApi'

interface Subscriber { id: string; email: string; firstName: string | null; isActive: boolean; createdAt: string }
interface Data { subscribers: Subscriber[]; total: number }

export default function NewsletterPage() {
  const { data, loading, refetch } = useApi<Data>('/api/newsletter')
  const [search, setSearch] = useState('')
  const [removing, setRemoving] = useState<string | null>(null)

  const subscribers = (data?.subscribers || []).filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.firstName || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleRemove = async (email: string) => {
    if (!confirm(`Désinscrire ${email} ?`)) return
    setRemoving(email)
    await apiFetch('/api/newsletter/unsubscribe', 'POST', { email })
    setRemoving(null)
    refetch()
  }

  const fmt = (d: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Newsletter</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {data?.total ?? 0} abonné{(data?.total ?? 0) > 1 ? 's' : ''} actif{(data?.total ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          type="text"
          placeholder="Rechercher par email ou prénom..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white"
        />
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <p className="font-bold">Aucun abonné{search ? ' trouvé' : ' pour le moment'}</p>
            <p className="text-sm mt-1">Les inscriptions via le site apparaîtront ici.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                {['Prénom', 'Email', 'Inscrit le', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-neutral-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr key={s.id} className={`border-b border-neutral-50 hover:bg-neutral-50 transition-colors ${i % 2 === 0 ? '' : 'bg-neutral-50/30'}`}>
                  <td className="px-5 py-3.5 text-sm font-medium text-neutral-800">
                    {s.firstName || <span className="text-neutral-300 italic">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-neutral-600">{s.email}</td>
                  <td className="px-5 py-3.5 text-sm text-neutral-400">{fmt(s.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleRemove(s.email)}
                      disabled={removing === s.email}
                      className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
                    >
                      {removing === s.email ? 'Retrait...' : 'Désinscrire'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
