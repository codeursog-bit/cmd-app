'use client'
import { useState } from 'react'
import { useApi, apiFetch } from '@/hooks/useApi'
import Link from 'next/link'

interface Enrollment {
  id: string; status: string
  member: {
    id: string; firstName: string; lastName: string; photoUrl: string | null
    baptisms: { id: string; baptismDate: string }[]
  }
}
interface Course {
  id: string; title: string; description: string | null; startDate: string; endDate: string | null
  location: string | null; teacherName: string | null; isActive: boolean
  enrollments: Enrollment[]
  sessions: { id: string; title: string; date: string; notes: string | null; _count: { attendances: number } }[]
  _count: { enrollments: number; sessions: number }
}

const STATUS_COLOR: Record<string, string> = {
  ONGOING:   'bg-sky-50 text-sky-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  DROPPED:   'bg-red-50 text-red-500'
}
const STATUS_FR: Record<string, string> = {
  ONGOING: 'En cours', COMPLETED: 'Terminé', DROPPED: 'Abandonné'
}

export default function CoursBaptemeDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: course, loading, refetch } = useApi<Course>(`/api/baptism-courses/${id}`)
  const { data: membersData } = useApi<{ members: { id: string; firstName: string; lastName: string }[] }>('/api/members?limit=200')

  const [tab, setTab] = useState<'inscrits' | 'seances'>('inscrits')

  // Modals
  const [showAddMember, setAddM]       = useState(false)
  const [showNewSession, setNewS]      = useState(false)
  const [showGenerate, setShowGen]     = useState(false)
  const [showCloseForm, setShowClose]  = useState(false)

  // Inscription
  const [inscriptionMode, setMode]     = useState<'existing' | 'new'>('existing')
  const [selectedMemberIds, setSel]    = useState<string[]>([])
  const [memberSearch, setMSearch]     = useState('')
  const [newFirstName, setNewFirst]    = useState('')
  const [newLastName, setNewLast]      = useState('')
  const [newPhone, setNewPhone]        = useState('')

  // Séance
  const [sessionTitle, setSessTitle]   = useState('')
  const [sessionDate, setSessDate]     = useState('')
  const [sessionNotes, setSessNotes]   = useState('')

  // Génération en masse
  const [genMemberIds, setGenIds]      = useState<string[]>([])
  const [genDate, setGenDate]          = useState('')
  const [genType, setGenType]          = useState('WATER')
  const [genOfficiant, setGenOff]      = useState('')
  const [genLocation, setGenLoc]       = useState('')

  const [saving, setSaving] = useState(false)
  const [genResult, setGenResult] = useState<{ created: number; failed: number } | null>(null)

  const fmt = (d: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d))

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleEnrollExisting = async () => {
    if (!selectedMemberIds.length) return
    setSaving(true)
    await apiFetch(`/api/baptism-courses/${id}/enrollments`, 'POST', { memberIds: selectedMemberIds })
    setSaving(false); setAddM(false); setSel([]); setMSearch(''); refetch()
  }

  const handleEnrollNew = async () => {
    if (!newFirstName || !newLastName) return
    setSaving(true)
    await apiFetch(`/api/baptism-courses/${id}/enrollments`, 'POST', {
      newPerson: { firstName: newFirstName, lastName: newLastName, phone: newPhone || null }
    })
    setSaving(false); setAddM(false); setNewFirst(''); setNewLast(''); setNewPhone(''); refetch()
  }

  const handleStatusChange = async (enrollmentId: string, status: string) => {
    await apiFetch(`/api/baptism-courses/${id}/enrollments`, 'PATCH', { enrollmentId, status })
    refetch()
  }

  const handleCloseFormation = async () => {
    setSaving(true)
    await apiFetch(`/api/baptism-courses/${id}`, 'PATCH', { isActive: false })
    setSaving(false); setShowClose(false); refetch()
  }

  const handleReopenFormation = async () => {
    setSaving(true)
    await apiFetch(`/api/baptism-courses/${id}`, 'PATCH', { isActive: true })
    setSaving(false); refetch()
  }

  const handleCreateSession = async () => {
    if (!sessionTitle || !sessionDate) return
    setSaving(true)
    await apiFetch(`/api/baptism-courses/${id}/sessions`, 'POST', {
      title: sessionTitle, date: sessionDate, notes: sessionNotes,
      attendances: course?.enrollments.map(e => ({ memberId: e.member.id, isPresent: false })) || []
    })
    setSaving(false); setNewS(false); setSessTitle(''); setSessDate(''); setSessNotes(''); refetch()
  }

  const handleGenerate = async () => {
    if (!genMemberIds.length || !genDate) return
    setSaving(true)
    const { data } = await apiFetch(`/api/baptism-courses/${id}`, 'POST', {
      memberIds: genMemberIds, baptismDate: genDate,
      baptismType: genType, officiant: genOfficiant, location: genLocation
    })
    setSaving(false)
    setGenResult(data)
    refetch()
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const enrolledIds = new Set(course?.enrollments.map(e => e.member.id) || [])
  const completedEnrollments = course?.enrollments.filter(e => e.status === 'COMPLETED') || []
  const alreadyBaptized = new Set(
    course?.enrollments.filter(e => e.member.baptisms.length > 0).map(e => e.member.id) || []
  )
  const eligibleForGen = completedEnrollments.filter(e => !alreadyBaptized.has(e.member.id))

  const filteredMembers = (membersData?.members || [])
    .filter(m => !enrolledIds.has(m.id))
    .filter(m => !memberSearch || `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase()))

  const closeAddModal = () => {
    setAddM(false); setSel([]); setMSearch('')
    setNewFirst(''); setNewLast(''); setNewPhone('')
    setMode('existing')
  }

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="h-8 w-48 bg-neutral-100 rounded animate-pulse" />
      <div className="h-64 bg-neutral-100 rounded-2xl animate-pulse" />
    </div>
  )
  if (!course) return (
    <div className="text-center py-32 text-neutral-400">
      Cours introuvable. <Link href="/admin/cours-bapteme" className="text-brand-600 hover:underline">Retour</Link>
    </div>
  )

  return (
    <>
      {/* ── Modal inscription ─────────────────────────────────────────────── */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-neutral-900">Inscrire au cours</p>
              <button onClick={closeAddModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex bg-neutral-100 p-1 rounded-xl mb-5">
              <button onClick={() => setMode('existing')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${inscriptionMode === 'existing' ? 'bg-white text-brand-700 shadow-sm' : 'text-neutral-500'}`}>Membre existant</button>
              <button onClick={() => setMode('new')}      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${inscriptionMode === 'new'      ? 'bg-white text-brand-700 shadow-sm' : 'text-neutral-500'}`}>Nouvelle personne</button>
            </div>

            {inscriptionMode === 'existing' && (
              <>
                <input type="text" placeholder="Rechercher..." value={memberSearch} onChange={e => setMSearch(e.target.value)}
                  className="w-full border border-neutral-200 rounded-xl px-4 h-10 text-sm mb-3 focus:outline-none focus:border-brand-500"/>
                <div className="max-h-52 overflow-y-auto space-y-0.5 mb-4">
                  {filteredMembers.map(m => (
                    <label key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 cursor-pointer">
                      <input type="checkbox" checked={selectedMemberIds.includes(m.id)}
                        onChange={e => setSel(prev => e.target.checked ? [...prev, m.id] : prev.filter(x => x !== m.id))}
                        className="w-4 h-4 accent-brand-600"/>
                      <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">{m.firstName[0]}{m.lastName[0]}</div>
                      <span className="text-sm font-medium text-neutral-700">{m.firstName} {m.lastName}</span>
                    </label>
                  ))}
                  {filteredMembers.length === 0 && <p className="text-sm text-neutral-400 text-center py-6 italic">{memberSearch ? 'Aucun résultat' : 'Tous les membres sont déjà inscrits'}</p>}
                </div>
                <div className="flex gap-3">
                  <button onClick={closeAddModal} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600">Annuler</button>
                  <button onClick={handleEnrollExisting} disabled={saving || !selectedMemberIds.length} className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                    {saving ? '...' : `Inscrire (${selectedMemberIds.length})`}
                  </button>
                </div>
              </>
            )}

            {inscriptionMode === 'new' && (
              <>
                <p className="text-xs text-neutral-400 mb-4">Cette personne sera créée comme membre et inscrite au cours.</p>
                <div className="space-y-3 mb-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Prénom *</label>
                      <input value={newFirstName} onChange={e => setNewFirst(e.target.value)} placeholder="Jean" className="w-full border border-neutral-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-brand-500"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Nom *</label>
                      <input value={newLastName} onChange={e => setNewLast(e.target.value)} placeholder="Mukendi" className="w-full border border-neutral-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-brand-500"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Téléphone <span className="normal-case font-normal">(facultatif)</span></label>
                    <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+242 06 000 0000" className="w-full border border-neutral-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-brand-500"/>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={closeAddModal} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600">Annuler</button>
                  <button onClick={handleEnrollNew} disabled={saving || !newFirstName || !newLastName} className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                    {saving ? '...' : 'Créer et inscrire'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal clôturer formation ──────────────────────────────────────── */}
      {showCloseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <p className="font-bold text-neutral-900 text-lg mb-2">Terminer la formation ?</p>
            <p className="text-sm text-neutral-500 mb-6">La formation sera marquée comme terminée. Vous pourrez ensuite générer les baptêmes pour les participants qui ont complété le cours.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClose(false)} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600">Annuler</button>
              <button onClick={handleCloseFormation} disabled={saving} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50">
                {saving ? '...' : 'Terminer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal génération en masse ─────────────────────────────────────── */}
      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-neutral-900">Générer les baptêmes</p>
              <button onClick={() => { setShowGen(false); setGenResult(null) }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {genResult ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <p className="font-bold text-lg text-neutral-900">{genResult.created} baptême{genResult.created > 1 ? 's' : ''} créé{genResult.created > 1 ? 's' : ''}</p>
                {genResult.failed > 0 && <p className="text-sm text-red-500 mt-1">{genResult.failed} échec(s) — certains membres avaient peut-être déjà un baptême.</p>}
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { setShowGen(false); setGenResult(null) }} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600">Fermer</button>
                  <Link href="/admin/baptemes" className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold text-center hover:bg-brand-700">
                    Voir les baptêmes
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {eligibleForGen.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400">
                    <p className="font-bold text-sm">Aucun participant éligible</p>
                    <p className="text-xs mt-1">Marquez d'abord les participants comme "Terminé" dans la liste des inscrits.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-neutral-400 mb-4">
                      {eligibleForGen.length} participant{eligibleForGen.length > 1 ? 's' : ''} avec statut <span className="font-bold text-emerald-600">Terminé</span> et sans baptême enregistré.
                    </p>

                    {/* Sélection participants */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500">Participants à baptiser</label>
                        <button onClick={() => setGenIds(genMemberIds.length === eligibleForGen.length ? [] : eligibleForGen.map(e => e.member.id))}
                          className="text-xs text-brand-600 font-bold hover:underline">
                          {genMemberIds.length === eligibleForGen.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                        </button>
                      </div>
                      <div className="border border-neutral-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                        {eligibleForGen.map(e => (
                          <label key={e.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 cursor-pointer border-b border-neutral-50 last:border-0">
                            <input type="checkbox" checked={genMemberIds.includes(e.member.id)}
                              onChange={ev => setGenIds(prev => ev.target.checked ? [...prev, e.member.id] : prev.filter(x => x !== e.member.id))}
                              className="w-4 h-4 accent-brand-600"/>
                            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">{e.member.firstName[0]}{e.member.lastName[0]}</div>
                            <span className="text-sm font-medium text-neutral-700">{e.member.firstName} {e.member.lastName}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 mb-5">
                      {/* Type */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Type de baptême</label>
                        <div className="flex bg-neutral-100 p-1 rounded-xl gap-1">
                          {[['WATER', 'Eau'], ['HOLY_SPIRIT', 'Saint-Esprit']].map(([v, l]) => (
                            <button key={v} onClick={() => setGenType(v)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${genType === v ? 'bg-white text-brand-700 shadow-sm' : 'text-neutral-500'}`}>
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Date */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Date du baptême *</label>
                        <input type="date" value={genDate} onChange={e => setGenDate(e.target.value)}
                          className="w-full border border-neutral-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-brand-500"/>
                      </div>
                      {/* Officiant */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Officiant</label>
                        <input value={genOfficiant} onChange={e => setGenOff(e.target.value)} placeholder="Pasteur Jean Mukendi"
                          className="w-full border border-neutral-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-brand-500"/>
                      </div>
                      {/* Lieu */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Lieu</label>
                        <input value={genLocation} onChange={e => setGenLoc(e.target.value)} placeholder="Piscine communautaire CMDG"
                          className="w-full border border-neutral-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-brand-500"/>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setShowGen(false)} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600">Annuler</button>
                      <button onClick={handleGenerate} disabled={saving || !genMemberIds.length || !genDate}
                        className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                        {saving ? 'Génération...' : `Générer (${genMemberIds.length})`}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Page principale ───────────────────────────────────────────────── */}
      <div className="max-w-4xl space-y-6 animate-fade-in">
        <Link href="/admin/cours-bapteme" className="inline-flex items-center gap-2 text-neutral-500 hover:text-brand-600 text-sm font-medium">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Cours de Baptême
        </Link>

        {/* Card info cours */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v10"/><path d="m16 8-4 4-4-4"/><path d="M20 19a8 8 0 0 0-16 0"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-2xl font-bold text-neutral-900">{course.title}</h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${course.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  {course.isActive ? 'En cours' : 'Terminée'}
                </span>
              </div>
              {course.teacherName && <p className="text-sm text-neutral-500 mt-0.5">{course.teacherName}</p>}
              {course.description && <p className="text-sm text-neutral-600 mt-2">{course.description}</p>}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-neutral-400">
                <span className="inline-flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  {fmt(course.startDate)}{course.endDate ? ` → ${fmt(course.endDate)}` : ''}
                </span>
                {course.location && <span className="inline-flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  {course.location}
                </span>}
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-3 text-center">
                <div className="bg-sky-50 rounded-xl p-3"><p className="font-black text-2xl text-sky-700">{course._count.enrollments}</p><p className="text-[10px] text-sky-400">inscrits</p></div>
                <div className="bg-neutral-50 rounded-xl p-3"><p className="font-black text-2xl text-neutral-700">{course._count.sessions}</p><p className="text-[10px] text-neutral-400">séances</p></div>
              </div>
              {/* Actions formation */}
              <div className="flex gap-2 mt-1">
                {!course.isActive && (
                  <button onClick={() => setShowGen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Générer baptêmes
                  </button>
                )}
                {course.isActive ? (
                  <button onClick={() => setShowClose(true)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-amber-200 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-50 transition-colors">
                    Terminer la formation
                  </button>
                ) : (
                  <button onClick={handleReopenFormation}
                    className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200 text-neutral-500 rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors">
                    Rouvrir
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-neutral-100">
          {[{ key: 'inscrits', label: `Inscrits (${course._count.enrollments})` }, { key: 'seances', label: `Séances (${course._count.sessions})` }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as 'inscrits' | 'seances')}
              className={`px-4 py-2.5 text-sm font-bold transition-all border-b-2 -mb-px ${tab === t.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab inscrits */}
        {tab === 'inscrits' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              {completedEnrollments.length > 0 && (
                <p className="text-xs text-neutral-400"><span className="font-bold text-emerald-600">{completedEnrollments.length}</span> terminé{completedEnrollments.length > 1 ? 's' : ''}</p>
              )}
              <div className="ml-auto">
                {course.isActive && (
                  <button onClick={() => setAddM(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Inscrire
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
              {course.enrollments.length ? (
                <div className="divide-y divide-neutral-50">
                  {course.enrollments.map(e => (
                    <div key={e.id} className="flex items-center justify-between p-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sky-700 text-xs font-black">{e.member.firstName[0]}</span>
                        </div>
                        <div>
                          <span className="font-bold text-sm text-neutral-800">{e.member.firstName} {e.member.lastName}</span>
                          {e.member.baptisms.length > 0 && (
                            <span className="ml-2 text-[10px] text-brand-500 font-bold">✓ Baptisé</span>
                          )}
                        </div>
                      </div>
                      {/* Sélecteur de statut */}
                      <select
                        value={e.status}
                        onChange={ev => handleStatusChange(e.id, ev.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-300 ${STATUS_COLOR[e.status]}`}>
                        <option value="ONGOING">En cours</option>
                        <option value="COMPLETED">Terminé</option>
                        <option value="DROPPED">Abandonné</option>
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-neutral-300">
                  <p className="font-bold text-sm">Aucun inscrit</p>
                  <p className="text-xs mt-1">Inscrivez des membres ci-dessus</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab séances */}
        {tab === 'seances' && (
          <div>
            <div className="flex justify-end mb-4">
              {course.isActive && (
                <button onClick={() => setNewS(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nouvelle séance
                </button>
              )}
            </div>
            <div className="space-y-3">
              {course.sessions.length ? course.sessions.map((s, i) => (
                <div key={s.id} className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="font-black text-brand-700 text-sm">{i + 1}</span>
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{s.title}</p>
                      <p className="text-xs text-neutral-400">{fmt(s.date)}</p>
                      {s.notes && <p className="text-xs text-neutral-400 italic mt-0.5">{s.notes}</p>}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-xl text-brand-700">{s._count.attendances}</p>
                    <p className="text-[10px] text-neutral-400">présences</p>
                  </div>
                </div>
              )) : (
                <div className="bg-white rounded-2xl border border-neutral-100 py-16 text-center text-neutral-300">
                  <p className="font-bold text-sm">Aucune séance</p>
                  <p className="text-xs mt-1">Créez la première séance ci-dessus</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal nouvelle séance */}
      {showNewSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-neutral-900">Nouvelle séance</p>
              <button onClick={() => setNewS(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Titre *</label>
                <input value={sessionTitle} onChange={e => setSessTitle(e.target.value)} placeholder="Séance 1 — Introduction"
                  className="w-full border border-neutral-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-brand-500"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Date *</label>
                <input type="datetime-local" value={sessionDate} onChange={e => setSessDate(e.target.value)}
                  className="w-full border border-neutral-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:border-brand-500"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Notes</label>
                <textarea value={sessionNotes} onChange={e => setSessNotes(e.target.value)} rows={2}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:border-brand-500"/>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setNewS(false)} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600">Annuler</button>
              <button onClick={handleCreateSession} disabled={saving || !sessionTitle || !sessionDate}
                className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                {saving ? '...' : 'Créer la séance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}