'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useApi, apiFetch } from '@/hooks/useApi'

interface Event { id:string; title:string; slug:string; startDate:string; _count:{attendances:number} }
interface Member { id:string; firstName:string; lastName:string; isActive:boolean; departments:{department:{name:string}}[] }
interface Attendance { memberId:string; isPresent:boolean }

export default function PresencesPage() {
  const { user } = useAuth()
  const [selectedEvent, setSelectedEvent] = useState<Event|null>(null)
  const [attendances, setAttendances]     = useState<Record<string,boolean>>({})
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)
  const [search, setSearch]               = useState('')

  const { data: eventsData } = useApi<{events:Event[]}>(
    user?.church?.id ? `/api/events?churchId=${user.church.id}&limit=20` : null
  )
  const { data: membersData } = useApi<{members:Member[]}>(
    user?.church?.id ? `/api/members?churchId=${user.church.id}&status=active&limit=200` : null
  )
  const { data: existingAttendances, refetch } = useApi<{attendances:Attendance[]}>(
    selectedEvent ? `/api/attendances?eventId=${selectedEvent.id}&limit=500` : null
  )

  // Sync existing attendances when event selected
  const handleSelectEvent = (ev: Event) => {
    setSelectedEvent(ev)
    setSaved(false)
    const map: Record<string,boolean> = {}
    existingAttendances?.attendances.forEach(a => { map[a.memberId] = a.isPresent })
    setAttendances(map)
  }

  const toggleMember = (id: string) => {
    setAttendances(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const markAll = (val: boolean) => {
    const all: Record<string,boolean> = {}
    membersData?.members.forEach(m => { all[m.id] = val })
    setAttendances(all)
  }

  const handleSave = async () => {
    if (!selectedEvent || !membersData) return
    setSaving(true)
    const records = membersData.members.map(m => ({ memberId: m.id, isPresent: attendances[m.id] ?? false }))
    const { error } = await apiFetch('/api/attendances', 'POST', {
      eventId: selectedEvent.id,
      date: selectedEvent.startDate,
      records,
    })
    setSaving(false)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000); refetch() }
  }

  const filteredMembers = membersData?.members.filter(m =>
    !search || `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase())
  ) || []

  const presentCount = Object.values(attendances).filter(Boolean).length
  const total = membersData?.members.length || 0
  const rate = total ? Math.round((presentCount / total) * 100) : 0

  const fmt = (d:string) => new Intl.DateTimeFormat('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }).format(new Date(d))

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-sans text-2xl font-bold text-neutral-900">Feuille de Présences</h1>
        <p className="text-neutral-500 text-sm">Enregistrez les présences pour chaque culte ou événement.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar événements */}
        <div className="space-y-4">
          <h3 className="font-bold text-neutral-700 text-sm uppercase tracking-widest">Choisir un événement</h3>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {eventsData?.events.length ? eventsData.events.map(ev => (
              <div key={ev.id} onClick={() => handleSelectEvent(ev)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedEvent?.id===ev.id?'border-brand-600 bg-brand-50':'border-neutral-200 hover:border-brand-200 bg-white'}`}>
                <p className={`font-bold text-sm ${selectedEvent?.id===ev.id?'text-brand-700':'text-neutral-900'}`}>{ev.title}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{fmt(ev.startDate)}</p>
                <p className="text-[10px] text-neutral-300 mt-1">{ev._count.attendances} présences enregistrées</p>
              </div>
            )) : (
              <p className="text-sm text-neutral-400 italic">Aucun événement disponible.</p>
            )}
          </div>
        </div>

        {/* Feuille d'appel */}
        <div>
          {!selectedEvent ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400">
              <div className="text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-neutral-200">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <path d="m9 14 2 2 4-4"/>
                </svg>
                <p className="font-bold text-sm">Sélectionnez un événement</p>
                <p className="text-xs mt-1">pour commencer la feuille d&apos;appel</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-neutral-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-neutral-900">{selectedEvent.title}</h2>
                    <p className="text-sm text-neutral-500">{fmt(selectedEvent.startDate)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Taux */}
                    <div className="text-center">
                      <div className="font-display text-3xl font-bold text-brand-600">{rate}%</div>
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{presentCount}/{total}</div>
                    </div>
                    <button onClick={handleSave} disabled={saving}
                      className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 shadow-sm">
                      {saving ? 'Enregistrement...' : 'Sauvegarder'}
                    </button>
                  </div>
                </div>
                {saved && <div className="mt-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold">✓ Présences enregistrées !</div>}
              </div>

              {/* Toolbar */}
              <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center gap-4">
                <input type="text" placeholder="Filtrer par nom..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-48 border border-neutral-200 rounded-lg px-3 h-8 text-xs focus:outline-none focus:border-brand-300 bg-white"/>
                <button onClick={() => markAll(true)} className="text-xs font-bold text-emerald-600 hover:underline">Tout cocher</button>
                <button onClick={() => markAll(false)} className="text-xs font-bold text-red-400 hover:underline">Tout décocher</button>
              </div>

              {/* Liste */}
              <div className="divide-y divide-neutral-50 max-h-[50vh] overflow-y-auto">
                {filteredMembers.map(m => {
                  const isPresent = attendances[m.id] ?? false
                  return (
                    <div key={m.id} onClick={() => toggleMember(m.id)}
                      className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-all hover:bg-neutral-50 ${isPresent?'bg-emerald-50/30':''}`}>
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isPresent?'bg-emerald-500 border-emerald-500':'border-neutral-300'}`}>
                        {isPresent && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                        {m.firstName[0]}{m.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-neutral-900">{m.firstName} {m.lastName}</p>
                        <p className="text-xs text-neutral-400 truncate">{m.departments[0]?.department.name || '—'}</p>
                      </div>
                      <span className={`text-xs font-bold ${isPresent?'text-emerald-600':'text-neutral-300'}`}>
                        {isPresent ? 'Présent' : 'Absent'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
