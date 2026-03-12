'use client'
import { useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useApi, apiFetch } from '@/hooks/useApi'

interface UserItem { id:string; email:string; firstName:string; lastName:string; role:string; isActive:boolean; createdAt:string; churches:{role:string}[] }

const ROLES = ['SUPER_ADMIN','PASTOR','DEPT_LEADER','SECRETARY']
const ROLE_FR: Record<string,string> = { SUPER_ADMIN:'Berger Principal', PASTOR:'Pasteur', DEPT_LEADER:'Responsable', SECRETARY:'Secrétaire' }
const ROLE_COLOR: Record<string,string> = { SUPER_ADMIN:'bg-brand-950 text-white', PASTOR:'bg-brand-600 text-white', DEPT_LEADER:'bg-brand-100 text-brand-700', SECRETARY:'bg-neutral-100 text-neutral-600' }

const IconPlus   = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>)
const IconSearch = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>)

export default function UtilisateursPage() {
  const { user }  = useAuth()
  const [search, setSearch]     = useState('')
  const [debSearch, setDeb]     = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string|null>(null)

  const [newEmail, setNewEmail]     = useState('')
  const [newFirst, setNewFirst]     = useState('')
  const [newLast, setNewLast]       = useState('')
  const [newPhone, setNewPhone]     = useState('')
  const [newRole, setNewRole]       = useState('SECRETARY')
  const [newPwd, setNewPwd]         = useState('')

  const handleSearch = useCallback((v:string) => {
    setSearch(v)
    clearTimeout((handleSearch as any)._t)
    ;(handleSearch as any)._t = setTimeout(() => setDeb(v), 400)
  }, [])

  const q = new URLSearchParams({
    ...(user?.church?.id ? { churchId: user.church.id } : {}),
    ...(debSearch ? { search: debSearch } : {}),
  }).toString()

  const { data: users, loading, refetch } = useApi<UserItem[]>(`/api/users?${q}`)

  const handleCreate = async () => {
    if (!newEmail || !newFirst || !newLast || !newPwd) { setError('Tous les champs marqués * sont requis'); return }
    setSaving(true); setError(null)
    const { error: err } = await apiFetch('/api/users', 'POST', {
      email: newEmail, firstName: newFirst, lastName: newLast, phone: newPhone,
      role: newRole, password: newPwd, churchId: user?.church?.id,
    })
    setSaving(false)
    if (err) { setError(err); return }
    setShowModal(false); setNewEmail(''); setNewFirst(''); setNewLast(''); setNewPhone(''); setNewPwd(''); setNewRole('SECRETARY')
    refetch()
  }

  const handleToggle = async (u: UserItem) => {
    await apiFetch(`/api/users/${u.id}`, 'PATCH', { isActive: !u.isActive })
    refetch()
  }

  const fmt = (d:string) => new Intl.DateTimeFormat('fr-FR').format(new Date(d))

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Utilisateurs</h1>
          <p className="text-neutral-500 text-sm">{users ? `${users.length} compte${users.length>1?'s':''}` : 'Chargement...'}</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(null) }} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all shadow-sm">
          <IconPlus /> Nouvel utilisateur
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-3 flex items-center text-neutral-400 pointer-events-none"><IconSearch /></div>
          <input type="text" placeholder="Rechercher par nom ou email..." value={search} onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand-300 transition-colors"/>
        </div>
      </div>

      {/* CARDS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_,i)=><div key={i} className="h-40 bg-neutral-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : users?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(u => (
            <div key={u.id} className={`bg-white rounded-2xl shadow-sm border p-6 transition-all ${u.isActive?'border-neutral-100 hover:shadow-md':'border-neutral-100 opacity-60'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-neutral-900">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-neutral-400 truncate max-w-[140px]">{u.email}</p>
                  </div>
                </div>
                <div onClick={() => handleToggle(u)} className="relative cursor-pointer shrink-0">
                  <div className={`w-9 h-5 rounded-full transition-colors ${u.isActive?'bg-brand-600':'bg-neutral-200'}`}/>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${u.isActive?'translate-x-[18px]':'translate-x-0.5'}`}/>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${ROLE_COLOR[u.role]||'bg-neutral-100 text-neutral-600'}`}>
                  {ROLE_FR[u.role]||u.role}
                </span>
                <span className="text-[10px] text-neutral-300 font-medium">Depuis {fmt(u.createdAt)}</span>
              </div>
            </div>
          ))}
          <div onClick={() => setShowModal(true)} className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all group min-h-[160px]">
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-neutral-300 group-hover:border-brand-400 flex items-center justify-center text-neutral-300 group-hover:text-brand-500"><IconPlus /></div>
            <span className="text-xs font-bold text-neutral-400 group-hover:text-brand-500 uppercase tracking-widest">Ajouter un utilisateur</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 text-neutral-400">
          <p className="font-bold text-lg mb-4">Aucun utilisateur</p>
          <button onClick={() => setShowModal(true)} className="text-brand-600 font-bold text-sm hover:underline">Créer le premier compte →</button>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-sans text-xl font-bold text-neutral-900 mb-6">Nouvel utilisateur</h2>
            {error && <div className="mb-4 bg-red-50 text-red-700 border border-red-100 px-4 py-2 rounded-lg text-sm">{error}</div>}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[['Prénom','text',newFirst,setNewFirst,'Jean-Paul',true],['Nom','text',newLast,setNewLast,'Mutombo',true]].map(([l,t,v,fn,ph,req]) => (
                  <div key={l as string}>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">{l as string}{req?<span className="text-red-400 ml-1">*</span>:''}</label>
                    <input type={t as string} value={v as string} onChange={e => (fn as Function)(e.target.value)}
                      className="w-full border border-neutral-200 rounded-lg px-4 h-10 text-sm focus:outline-none focus:border-brand-500" placeholder={ph as string}/>
                  </div>
                ))}
              </div>
              {[['Email *','email',newEmail,setNewEmail,'user@cmdg.org'],['Téléphone','tel',newPhone,setNewPhone,'+243 8x...'],['Mot de passe *','password',newPwd,setNewPwd,'Min. 8 caractères']].map(([l,t,v,fn,ph]) => (
                <div key={l as string}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">{l as string}</label>
                  <input type={t as string} value={v as string} onChange={e => (fn as Function)(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-4 h-10 text-sm focus:outline-none focus:border-brand-500" placeholder={ph as string}/>
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Rôle</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.filter(r => user?.role === 'SUPER_ADMIN' || r !== 'SUPER_ADMIN').map(r => (
                    <div key={r} onClick={() => setNewRole(r)} className={`px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer text-center transition-all ${newRole===r?'bg-brand-600 border-brand-600 text-white':'border-neutral-200 text-neutral-500 hover:border-brand-300'}`}>
                      {ROLE_FR[r]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setError(null) }} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50">Annuler</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 bg-brand-600 rounded-xl text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
                {saving ? 'Création...' : 'Créer le compte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
