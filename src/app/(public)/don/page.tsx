'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'

const PURPOSES = ['Offrande générale', 'Dîme', 'Projet de construction', 'Mission évangélisation', 'Aide sociale', 'Jeunesse', 'Autre']

const IconSmartphone = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>)
const IconBank = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="21" x2="21" y2="21"/><line x1="5" y1="21" x2="5" y2="10"/><line x1="19" y1="21" x2="19" y2="10"/><polygon points="12 3 21 9 3 9"/><line x1="10" y1="21" x2="10" y2="10"/><line x1="14" y1="21" x2="14" y2="10"/></svg>)
const IconCash = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>)
const IconCheck = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>)
const IconArrowRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>)
const IconArrowLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>)
const IconAlert = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>)

const METHODS = [
  { key: 'mobile_money', label: 'Mobile Money', icon: IconSmartphone },
  { key: 'virement',     label: 'Virement bancaire', icon: IconBank },
  { key: 'especes',      label: "Espèces à l'église", icon: IconCash },
]

const DEFAULT_CHURCH_ID = process.env.NEXT_PUBLIC_DEFAULT_CHURCH_ID || ''

export default function DonPage() {
  const [step, setStep]       = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [amount, setAmount]        = useState('')
  const [currency, setCurrency]    = useState('USD')
  const [purpose, setPurpose]      = useState('Offrande générale')
  const [customPurpose, setCustom] = useState('')
  const [method, setMethod]        = useState('mobile_money')
  const [name, setName]            = useState('')
  const [email, setEmail]          = useState('')
  const [phone, setPhone]          = useState('')
  const [message, setMessage]      = useState('')
  const [ref, setRef]              = useState('')

  const activeMethod = METHODS.find(m => m.key === method)

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
    <div className="min-h-screen bg-white font-sans text-neutral-950 selection:bg-brand-600 selection:text-white">

      {/* HERO — même patron que toutes les autres pages */}
      <header className="relative flex h-[350px] w-full flex-col justify-center bg-brand-950 px-6 md:px-12 pt-20 overflow-hidden">
        <div className="absolute -right-24 -top-24 w-[400px] h-[400px] bg-accent-600/10 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative mx-auto w-full max-w-7xl">
          <nav className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span className="text-brand-800">/</span>
            <span className="text-white">Faire un don</span>
          </nav>
          <h1 className="mt-8 font-display text-5xl font-extrabold text-white md:text-7xl leading-none">
            Faire un <span className="text-accent-400">don</span>
          </h1>
          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-brand-400 uppercase max-w-xl">
            Votre générosité soutient l&apos;évangélisation et l&apos;action sociale de la CMD
          </p>
        </motion.div>
      </header>

      <section className="bg-brand-50 py-24 px-6">
        <div className="max-w-xl mx-auto">

          {/* ÉTAPE 3 — Confirmation */}
          {step === 3 ? (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-10 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                <IconCheck />
              </div>
              <h2 className="font-display text-3xl font-extrabold text-brand-950 mb-3">Merci, {name} !</h2>
              <p className="font-sans text-neutral-500 mb-6 leading-relaxed">
                Votre intention de don a été enregistrée.<br />
                Référence : <strong className="font-mono text-brand-700">{ref}</strong>
              </p>

              <div className="bg-accent-50 border border-accent-100 rounded-xl p-6 text-left mb-8">
                <p className="font-sans font-bold text-accent-700 text-xs uppercase tracking-widest mb-4">Instructions de paiement</p>
                {method === 'mobile_money' && (
                  <div className="flex gap-3">
                    <span className="text-accent-600 shrink-0 mt-0.5"><IconSmartphone /></span>
                    <div className="text-sm text-neutral-600 space-y-1.5">
                      <p>Envoyez <strong className="text-brand-950">{amount} {currency}</strong> au numéro :</p>
                      <p className="font-mono text-lg font-bold text-brand-950">+242 06 000 00 00</p>
                      <p>Mentionnez la référence <strong>{ref}</strong> en note.</p>
                    </div>
                  </div>
                )}
                {method === 'virement' && (
                  <div className="flex gap-3">
                    <span className="text-accent-600 shrink-0 mt-0.5"><IconBank /></span>
                    <div className="text-sm text-neutral-600 space-y-1.5">
                      <p>Effectuez un virement de <strong className="text-brand-950">{amount} {currency}</strong></p>
                      <p>IBAN : <strong className="font-mono text-brand-950">XXXX XXXX XXXX XXXX</strong></p>
                      <p>Motif : <strong>{ref}</strong></p>
                    </div>
                  </div>
                )}
                {method === 'especes' && (
                  <div className="flex gap-3">
                    <span className="text-accent-600 shrink-0 mt-0.5"><IconCash /></span>
                    <div className="text-sm text-neutral-600 space-y-1.5">
                      <p>Remettez <strong className="text-brand-950">{amount} {currency}</strong> directement à l&apos;église.</p>
                      <p>Présentez votre référence : <strong>{ref}</strong></p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-neutral-400">Un email de confirmation sera envoyé à <strong>{email}</strong></p>
              <button onClick={() => { setStep(1); setAmount(''); setName(''); setEmail(''); setPhone(''); setMessage('') }}
                className="mt-6 px-6 py-3 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
                Faire un autre don
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
              {/* Progress */}
              <div className="flex border-b border-neutral-100">
                {['Montant & motif', 'Vos informations'].map((s, i) => (
                  <div key={i} className={`flex-1 py-5 text-center text-[11px] font-bold uppercase tracking-widest transition-colors ${
                    step === i + 1 ? 'text-brand-700 border-b-2 border-accent-500' : step > i + 1 ? 'text-emerald-600' : 'text-neutral-400'
                  }`}>
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] mr-1.5 ${
                      step === i + 1 ? 'bg-brand-600 text-white' : step > i + 1 ? 'bg-emerald-500 text-white' : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      {step > i + 1 ? <span className="scale-75 inline-block"><IconCheck /></span> : i + 1}
                    </span>
                    {s}
                  </div>
                ))}
              </div>

              <div className="p-8">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                    <IconAlert /> {error}
                  </div>
                )}

                {/* ÉTAPE 1 */}
                {step === 1 && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Montant</label>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {['5', '10', '20', '50'].map(v => (
                          <button key={v} type="button" onClick={() => setAmount(v)}
                            className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                              amount === v ? 'bg-brand-600 border-brand-600 text-white' : 'border-neutral-200 text-neutral-600 hover:border-brand-300'
                            }`}>
                            {v} $
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1"
                          placeholder="Autre montant..."
                          className="flex-1 border border-neutral-200 rounded-xl px-4 h-12 text-sm focus:outline-none focus:border-accent-500 transition-colors" />
                        <select value={currency} onChange={e => setCurrency(e.target.value)}
                          className="border border-neutral-200 rounded-xl px-3 h-12 text-sm focus:outline-none focus:border-accent-500">
                          <option>USD</option><option>EUR</option><option>CDF</option><option>XAF</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Motif</label>
                      <div className="grid grid-cols-2 gap-2">
                        {PURPOSES.map(p => (
                          <button key={p} type="button" onClick={() => setPurpose(p)}
                            className={`px-4 py-3 rounded-xl border text-xs font-bold text-left transition-all ${
                              purpose === p ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-neutral-100 text-neutral-500 hover:border-brand-200'
                            }`}>
                            {p}
                          </button>
                        ))}
                      </div>
                      {purpose === 'Autre' && (
                        <input type="text" value={customPurpose} onChange={e => setCustom(e.target.value)}
                          placeholder="Précisez le motif..."
                          className="mt-3 w-full border border-neutral-200 rounded-xl px-4 h-12 text-sm focus:outline-none focus:border-accent-500" />
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Mode de paiement</label>
                      <div className="space-y-2">
                        {METHODS.map(m => {
                          const Icon = m.icon
                          return (
                            <button key={m.key} type="button" onClick={() => setMethod(m.key)}
                              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-bold text-left transition-all ${
                                method === m.key ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-neutral-100 text-neutral-600 hover:border-brand-200'
                              }`}>
                              <span className={method === m.key ? 'text-brand-600' : 'text-neutral-400'}><Icon /></span>
                              {m.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <button onClick={() => { if (!amount || parseFloat(amount) <= 0) { setError('Entrez un montant valide'); return }; setError(null); setStep(2) }}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-accent-600 hover:bg-accent-500 text-white rounded-xl font-sans font-bold text-sm tracking-wide uppercase transition-all">
                      Continuer <IconArrowRight />
                    </button>
                  </div>
                )}

                {/* ÉTAPE 2 */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-500">Récapitulatif</p>
                      <p className="font-display text-3xl font-extrabold text-brand-950 mt-1">{amount} {currency}</p>
                      <p className="text-xs text-brand-500 mt-1 flex items-center gap-1.5">
                        {purpose === 'Autre' ? customPurpose : purpose} · {activeMethod && (
                          <span className="inline-flex items-center gap-1"><activeMethod.icon />{activeMethod.label}</span>
                        )}
                      </p>
                    </div>

                    {[
                      { label: 'Nom complet *', value: name, set: setName, type: 'text', placeholder: 'Jean Dupont' },
                      { label: 'Email *', value: email, set: setEmail, type: 'email', placeholder: 'jean@exemple.com' },
                      { label: 'Téléphone', value: phone, set: setPhone, type: 'tel', placeholder: '+242 06 000 00 00' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">{f.label}</label>
                        <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                          className="w-full border border-neutral-200 rounded-xl px-4 h-12 text-sm focus:outline-none focus:border-accent-500 transition-colors" />
                      </div>
                    ))}

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Message (facultatif)</label>
                      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Un mot d'encouragement..."
                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-accent-500 transition-colors" />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setStep(1)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
                        <IconArrowLeft /> Retour
                      </button>
                      <button onClick={handleSubmit} disabled={loading}
                        className="flex-1 py-3.5 bg-accent-600 hover:bg-accent-500 text-white rounded-xl font-bold text-sm tracking-wide uppercase transition-all disabled:opacity-50">
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
