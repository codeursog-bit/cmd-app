'use client'
import { useState } from 'react'


const PURPOSES = ['Offrande générale','Dîme','Projet de construction','Mission évangélisation','Aide sociale','Jeunesse','Autre']
const METHODS  = [{ key: 'mobile_money', label: '📱 Mobile Money' },{ key: 'virement', label: '🏦 Virement bancaire' },{ key: 'especes', label: '💵 Espèces (à l\'église)' }]

// On utilise la première église — en prod, passez l'id en env ou récupérez-le
const DEFAULT_CHURCH_ID = process.env.NEXT_PUBLIC_DEFAULT_CHURCH_ID || ''

export default function DonPage() {
  const [step, setStep]       = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [amount, setAmount]       = useState('')
  const [currency, setCurrency]   = useState('USD')
  const [purpose, setPurpose]     = useState('Offrande générale')
  const [customPurpose, setCustom]= useState('')
  const [method, setMethod]       = useState('mobile_money')
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [phone, setPhone]         = useState('')
  const [message, setMessage]     = useState('')
  const [ref, setRef]             = useState('')

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) { setError('Montant invalide'); return }
    if (!name || !email) { setError('Nom et email requis'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount), currency, donorName: name, donorEmail: email,
          donorPhone: phone, donorMessage: message,
          purpose: purpose === 'Autre' ? customPurpose : purpose,
          paymentMethod: method, churchId: DEFAULT_CHURCH_ID,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur'); return }
      setRef(data.data?.reference || '')
      setStep(3)
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-950 to-brand-900 text-white py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-brand-300 text-sm font-bold uppercase tracking-widest mb-3">Donner</p>
          <h1 className="font-display text-5xl font-bold mb-4">Faire un don</h1>
          <p className="text-brand-200 text-lg leading-relaxed">
            Votre générosité soutient la mission de CMDG — l&apos;évangélisation et l&apos;action sociale.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 bg-neutral-50 min-h-screen">
        <div className="max-w-xl mx-auto">

          {/* Étape 3 — Confirmation */}
          {step === 3 && (
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="font-display text-3xl font-bold text-neutral-900 mb-3">Merci, {name} !</h2>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Votre intention de don a été enregistrée.<br />
                Référence : <strong className="font-mono text-brand-700">{ref}</strong>
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-left mb-6">
                <p className="font-bold text-amber-800 mb-3">Instructions de paiement</p>
                {method === 'mobile_money' && (
                  <div className="text-sm text-amber-700 space-y-1">
                    <p>📱 Envoyez <strong>{amount} {currency}</strong> au numéro :</p>
                    <p className="font-mono text-lg font-bold">+243 XX XXX XXXX</p>
                    <p>Mentionnez la référence <strong>{ref}</strong> en note.</p>
                  </div>
                )}
                {method === 'virement' && (
                  <div className="text-sm text-amber-700 space-y-1">
                    <p>🏦 Effectuez un virement de <strong>{amount} {currency}</strong></p>
                    <p>IBAN : <strong className="font-mono">XXXX XXXX XXXX XXXX</strong></p>
                    <p>Motif : <strong>{ref}</strong></p>
                  </div>
                )}
                {method === 'especes' && (
                  <div className="text-sm text-amber-700">
                    <p>💵 Remettez <strong>{amount} {currency}</strong> directement à l&apos;église.</p>
                    <p>Présentez votre référence : <strong>{ref}</strong></p>
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-400">Un email de confirmation sera envoyé à <strong>{email}</strong></p>
              <button onClick={() => { setStep(1); setAmount(''); setName(''); setEmail(''); setPhone(''); setMessage('') }}
                className="mt-5 px-6 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
                Faire un autre don
              </button>
            </div>
          )}

          {/* Étapes 1 & 2 */}
          {step !== 3 && (
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              {/* Progress */}
              <div className="flex border-b border-neutral-100">
                {['Montant & motif','Vos informations'].map((s, i) => (
                  <div key={i} className={`flex-1 py-4 text-center text-xs font-bold transition-colors ${step === i + 1 ? 'text-brand-700 border-b-2 border-brand-600' : step > i + 1 ? 'text-emerald-600' : 'text-neutral-400'}`}>
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] mr-1.5 ${step === i + 1 ? 'bg-brand-600 text-white' : step > i + 1 ? 'bg-emerald-500 text-white' : 'bg-neutral-100 text-neutral-400'}`}>{step > i + 1 ? '✓' : i + 1}</span>
                    {s}
                  </div>
                ))}
              </div>

              <div className="p-8">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">{error}</div>}

                {/* ÉTAPE 1 */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Montants rapides */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Montant</label>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {['5','10','20','50'].map(v => (
                          <button key={v} type="button" onClick={() => setAmount(v)}
                            className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${amount === v ? 'bg-brand-600 border-brand-600 text-white' : 'border-neutral-200 text-neutral-600 hover:border-brand-300'}`}>
                            {v} $
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1"
                          placeholder="Autre montant..."
                          className="flex-1 border border-neutral-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-brand-500 transition-colors" />
                        <select value={currency} onChange={e => setCurrency(e.target.value)}
                          className="border border-neutral-200 rounded-xl px-3 h-11 text-sm focus:outline-none focus:border-brand-500">
                          <option>USD</option><option>EUR</option><option>CDF</option><option>XAF</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Motif</label>
                      <div className="grid grid-cols-2 gap-2">
                        {PURPOSES.map(p => (
                          <button key={p} type="button" onClick={() => setPurpose(p)}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all ${purpose === p ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-neutral-100 text-neutral-500 hover:border-brand-200'}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                      {purpose === 'Autre' && (
                        <input type="text" value={customPurpose} onChange={e => setCustom(e.target.value)}
                          placeholder="Précisez le motif..."
                          className="mt-2 w-full border border-neutral-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-brand-500" />
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Mode de paiement</label>
                      <div className="space-y-2">
                        {METHODS.map(m => (
                          <button key={m.key} type="button" onClick={() => setMethod(m.key)}
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-bold text-left transition-all ${method === m.key ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-neutral-100 text-neutral-600 hover:border-brand-200'}`}>
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button onClick={() => { if (!amount || parseFloat(amount) <= 0) { setError('Entrez un montant valide'); return }; setError(null); setStep(2) }}
                      className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-sm transition-colors">
                      Continuer →
                    </button>
                  </div>
                )}

                {/* ÉTAPE 2 */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                      <p className="text-xs text-brand-600 font-bold">Récapitulatif</p>
                      <p className="text-2xl font-black text-brand-800 mt-1">{amount} {currency}</p>
                      <p className="text-xs text-brand-500">{purpose === 'Autre' ? customPurpose : purpose} · {METHODS.find(m => m.key === method)?.label}</p>
                    </div>

                    {[
                      { label: 'Nom complet *', value: name, set: setName, type: 'text', placeholder: 'Jean Dupont' },
                      { label: 'Email *', value: email, set: setEmail, type: 'email', placeholder: 'jean@exemple.com' },
                      { label: 'Téléphone', value: phone, set: setPhone, type: 'tel', placeholder: '+243 XXX XXX XXX' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">{f.label}</label>
                        <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                          className="w-full border border-neutral-200 rounded-xl px-4 h-11 text-sm focus:outline-none focus:border-brand-500 transition-colors" />
                      </div>
                    ))}

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Message (facultatif)</label>
                      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Un mot d'encouragement..."
                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-brand-500 transition-colors" />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setStep(1)} className="flex-1 py-3 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
                        ← Retour
                      </button>
                      <button onClick={handleSubmit} disabled={loading}
                        className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-sm transition-colors disabled:opacity-50">
                        {loading ? 'Envoi...' : 'Confirmer le don'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
