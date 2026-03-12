'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/hooks/useApi'

const tabs = ['Profil','Sécurité','Mon Église']

export default function ParametresPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('Profil')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState<string|null>(null)

  // Profil
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [phone, setPhone]         = useState('')

  // Sécurité
  const [currentPwd, setCurrentPwd]   = useState('')
  const [newPwd, setNewPwd]           = useState('')
  const [confirmPwd, setConfirmPwd]   = useState('')
  const [showPwd, setShowPwd]         = useState(false)

  useEffect(() => {
    if (user) { setFirstName(user.firstName); setLastName(user.lastName) }
  }, [user])

  const handleSaveProfile = async () => {
    if (!firstName || !lastName) { setError('Prénom et nom requis'); return }
    setSaving(true); setError(null)
    const { error: err } = await apiFetch(`/api/users/${user?.id}`, 'PATCH', { firstName, lastName, phone })
    setSaving(false)
    if (err) { setError(err); return }
    setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  const handleSavePassword = async () => {
    if (!newPwd) { setError('Nouveau mot de passe requis'); return }
    if (newPwd !== confirmPwd) { setError('Les mots de passe ne correspondent pas'); return }
    if (newPwd.length < 8) { setError('Minimum 8 caractères'); return }
    setSaving(true); setError(null)
    const { error: err } = await apiFetch(`/api/users/${user?.id}`, 'PATCH', { password: newPwd })
    setSaving(false)
    if (err) { setError(err); return }
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  const initials = user ? `${user.firstName?.[0]}${user.lastName?.[0]}` : 'JD'
  const roleLabel = { SUPER_ADMIN:'Berger Principal', PASTOR:'Pasteur', DEPT_LEADER:'Responsable de Département', SECRETARY:'Secrétaire' }[user?.role||''] || 'Admin'

  const Field = ({label,type='text',value,onChange,placeholder,disabled=false}:{label:string;type?:string;value:string;onChange:(v:string)=>void;placeholder?:string;disabled?:boolean}) => (
    <div>
      <label className="block font-sans text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500 transition-colors disabled:bg-neutral-50 disabled:text-neutral-400"/>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h1 className="font-sans text-2xl font-bold text-neutral-900">Paramètres</h1>
        <p className="text-neutral-500 text-sm">Gérez votre profil et les préférences de l&apos;application.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        {/* Sidebar tabs */}
        <div className="space-y-1">
          {tabs.map(t => (
            <div key={t} onClick={() => { setTab(t); setError(null); setSaved(false) }}
              className={`px-4 py-3 rounded-xl cursor-pointer font-sans text-sm font-bold transition-all ${tab===t?'bg-brand-600 text-white':'text-neutral-600 hover:bg-neutral-100'}`}>
              {t}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
          {error && <div className="mb-4 bg-red-50 border border-red-100 text-red-700 px-4 py-2 rounded-xl text-sm">{error}</div>}
          {saved && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold">✓ Modifications enregistrées</div>}

          {/* PROFIL */}
          {tab === 'Profil' && (
            <div className="space-y-6">
              <h2 className="font-bold text-neutral-900 text-lg">Informations personnelles</h2>
              {/* Avatar */}
              <div className="flex items-center gap-5 pb-6 border-b border-neutral-100">
                <div className="w-20 h-20 rounded-2xl bg-brand-950 flex items-center justify-center shadow-sm">
                  <span className="font-display text-3xl font-bold text-brand-300">{initials}</span>
                </div>
                <div>
                  <p className="font-bold text-neutral-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-neutral-500">{roleLabel}</p>
                  <p className="text-xs text-brand-500 font-medium mt-1">{user?.church?.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <Field label="Prénom" value={firstName} onChange={setFirstName}/>
                <Field label="Nom de famille" value={lastName} onChange={setLastName}/>
              </div>
              <Field label="Email" type="email" value={user?.email||''} onChange={()=>{}} disabled placeholder="Modifiable via l'administrateur"/>
              <Field label="Téléphone" type="tel" value={phone} onChange={setPhone} placeholder="+243 81 234 5678"/>
              <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors disabled:opacity-50">
                {saving ? 'Enregistrement...' : 'Sauvegarder'}
              </button>
            </div>
          )}

          {/* SÉCURITÉ */}
          {tab === 'Sécurité' && (
            <div className="space-y-6">
              <h2 className="font-bold text-neutral-900 text-lg">Changer le mot de passe</h2>
              <div className="relative">
                <label className="block font-sans text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Nouveau mot de passe</label>
                <input type={showPwd?'text':'password'} value={newPwd} onChange={e=>setNewPwd(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500 pr-12" placeholder="••••••••"/>
                <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-4 top-[34px] text-neutral-400 hover:text-neutral-600 transition-colors">
                  {showPwd
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Confirmer le mot de passe</label>
                <input type={showPwd?'text':'password'} value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500" placeholder="••••••••"/>
              </div>
              {newPwd && (
                <div className="flex gap-1 mt-1">
                  {[8,12,16].map(n => (
                    <div key={n} className={`flex-1 h-1.5 rounded-full transition-colors ${newPwd.length>=n?'bg-emerald-400':'bg-neutral-100'}`}/>
                  ))}
                </div>
              )}
              <button onClick={handleSavePassword} disabled={saving||!newPwd||!confirmPwd} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors disabled:opacity-50">
                {saving ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </button>

              <div className="pt-6 border-t border-neutral-100">
                <h3 className="font-bold text-red-600 text-sm mb-2">Zone de danger</h3>
                <p className="text-xs text-neutral-500 mb-3">La désactivation de votre compte est irréversible sans l&apos;intervention d&apos;un administrateur.</p>
                <button className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors">Désactiver mon compte</button>
              </div>
            </div>
          )}

          {/* MON ÉGLISE */}
          {tab === 'Mon Église' && (
            <div className="space-y-6">
              <h2 className="font-bold text-neutral-900 text-lg">Informations de l&apos;église</h2>
              {user?.church ? (
                <>
                  <div className="bg-brand-50 border border-brand-100 rounded-xl px-5 py-4">
                    <p className="font-bold text-brand-800 text-lg">{user.church.name}</p>
                    <p className="text-sm text-brand-500 font-medium">{roleLabel}</p>
                  </div>
                  <p className="text-sm text-neutral-500">Pour modifier les informations de l&apos;église (adresse, logo, horaires), contactez un administrateur ou accédez à la page <strong>Gestion des Églises</strong>.</p>
                </>
              ) : (
                <p className="text-neutral-400 italic text-sm">Aucune église associée à votre compte.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
