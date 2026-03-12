'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useApi, apiFetch } from '@/hooks/useApi'

interface Program { id:string; title:string; description:string|null; dayOfWeek:number|null; startTime:string|null; endTime:string|null; location:string|null; isActive:boolean; department:{id:string;name:string}|null }
interface Dept { id:string; name:string }

const DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
const IconPlus = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>)
const IconPencil = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>)
const IconTrash = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>)

export default function ProgrammesPage() {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<Program | null>(null)
  const [view, setView]           = useState<'list'|'week'>('list')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const [title, setTitle]         = useState('')
  const [description, setDesc]    = useState('')
  const [dayOfWeek, setDay]       = useState<number | ''>('')
  const [startTime, setStart]     = useState('')
  const [endTime, setEnd]         = useState('')
  const [location, setLocation]   = useState('')
  const [deptId, setDeptId]       = useState('')

  const { data: programs, loading, refetch } = useApi<Program[]>(
    user?.church?.id ? `/api/programs?churchId=${user.church.id}&active=false` : null
  )
  const { data: depts } = useApi<Dept[]>(
    user?.church?.id ? `/api/departments?churchId=${user.church.id}` : null
  )

  const openCreate = () => {
    setEditing(null); setTitle(''); setDesc(''); setDay(''); setStart(''); setEnd(''); setLocation(''); setDeptId(''); setError(null); setShowModal(true)
  }
  const openEdit = (p: Program) => {
    setEditing(p); setTitle(p.title); setDesc(p.description||''); setDay(p.dayOfWeek ?? ''); setStart(p.startTime||''); setEnd(p.endTime||''); setLocation(p.location||''); setDeptId(p.department?.id||''); setError(null); setShowModal(true)
  }

  const handleSave = async () => {
    if (!title) { setError('Titre requis'); return }
    setSaving(true); setError(null)
    const url = editing ? `/api/programs/${editing.id}` : '/api/programs'
    const method = editing ? 'PATCH' : 'POST'
    const { error: err } = await apiFetch(url, method, {
      title, description, dayOfWeek: dayOfWeek === '' ? null : Number(dayOfWeek),
      startTime: startTime||null, endTime: endTime||null, location: location||null,
      departmentId: deptId||null, churchId: user?.church?.id,
    })
    setSaving(false)
    if (err) { setError(err); return }
    setShowModal(false); refetch()
  }

  const handleToggle = async (p: Program) => {
    await apiFetch(`/api/programs/${p.id}`, 'PATCH', { isActive: !p.isActive })
    refetch()
  }

  const handleDelete = async (p: Program) => {
    if (!confirm(`Supprimer « ${p.title} » ?`)) return
    await apiFetch(`/api/programs/${p.id}`, 'DELETE')
    refetch()
  }

  const activePrograms   = programs?.filter(p => p.isActive) || []
  const inactivePrograms = programs?.filter(p => !p.isActive) || []

  const programsByDay = DAYS.map((d, i) => ({
    day: d,
    programs: programs?.filter(p => p.dayOfWeek === i && p.isActive) || []
  })).filter(d => d.programs.length > 0)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Programmes</h1>
          <p className="text-neutral-500 text-sm">{programs ? `${activePrograms.length} programme${activePrograms.length>1?'s':''} actif${activePrograms.length>1?'s':''}` : 'Chargement...'}</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-neutral-100 p-1 rounded-lg">
            {[['list','Liste'],['week','Semaine']].map(([v,l]) => (
              <div key={v} onClick={() => setView(v as any)} className={`px-4 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all ${view===v?'bg-white text-brand-600 shadow-sm':'text-neutral-500'}`}>{l}</div>
            ))}
          </div>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all shadow-sm">
            <IconPlus /> Nouveau programme
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          ['Programmes actifs', String(activePrograms.length)],
          ['Réunions / semaine', String(activePrograms.filter(p=>p.dayOfWeek!=null).length)],
          ['Départements couverts', String(new Set(activePrograms.map(p=>p.department?.id).filter(Boolean)).size)],
        ].map(([l,v]) => (
          <div key={l} className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100">
            <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider">{l}</p>
            <p className="font-display text-4xl font-bold text-brand-600 mt-1">{v}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_,i)=><div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse"/>)}</div>
      ) : view === 'list' ? (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-800">Programmes actifs</h3>
            </div>
            <div className="divide-y divide-neutral-50">
              {activePrograms.length ? activePrograms.map(p => (
                <ProgramRow key={p.id} program={p} onEdit={openEdit} onToggle={handleToggle} onDelete={handleDelete} />
              )) : <p className="px-6 py-8 text-neutral-400 text-sm italic">Aucun programme actif.</p>}
            </div>
          </div>
          {inactivePrograms.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100">
                <h3 className="font-bold text-neutral-400">Programmes inactifs</h3>
              </div>
              <div className="divide-y divide-neutral-50">
                {inactivePrograms.map(p => (
                  <ProgramRow key={p.id} program={p} onEdit={openEdit} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
          <div onClick={openCreate} className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 flex items-center justify-center gap-3 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all group">
            <IconPlus /><span className="text-xs font-bold text-neutral-400 group-hover:text-brand-500 uppercase tracking-widest">Ajouter un programme</span>
          </div>
        </>
      ) : (
        // Vue semaine
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="grid grid-cols-7 divide-x divide-neutral-100">
            {DAYS.map((day, i) => {
              const dayProgs = programs?.filter(p => p.dayOfWeek === i && p.isActive) || []
              return (
                <div key={day} className="min-h-40">
                  <div className={`px-3 py-2 border-b border-neutral-100 text-center ${dayProgs.length ? 'bg-brand-50' : ''}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{day.slice(0,3)}</span>
                  </div>
                  <div className="p-2 space-y-2">
                    {dayProgs.map(p => (
                      <div key={p.id} className="bg-brand-600 text-white rounded-lg px-2 py-1.5 text-[10px] font-bold leading-tight cursor-pointer hover:bg-brand-700 transition-colors" onClick={() => openEdit(p)}>
                        <div>{p.title}</div>
                        {p.startTime && <div className="opacity-75">{p.startTime}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-sans text-xl font-bold text-neutral-900 mb-6">{editing ? 'Modifier le programme' : 'Nouveau programme'}</h2>
            {error && <div className="mb-4 bg-red-50 text-red-700 border border-red-100 px-4 py-2 rounded-lg text-sm">{error}</div>}
            <div className="space-y-4">
              {[
                ['Titre', 'text', title, setTitle, 'ex: Culte Dominical Principal', true],
                ['Description', 'text', description, setDesc, 'Brève description...', false],
                ['Lieu', 'text', location, setLocation, 'ex: Grand Sanctuaire', false],
              ].map(([l, type, v, fn, ph, req]) => (
                <div key={l as string}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">{l as string}{req ? <span className="text-red-400 ml-1">*</span> : ''}</label>
                  <input type={type as string} value={v as string} onChange={e => (fn as Function)(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500 transition-colors" placeholder={ph as string}/>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Jour</label>
                  <select value={String(dayOfWeek)} onChange={e => setDay(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500">
                    <option value="">—</option>
                    {DAYS.map((d,i) => <option key={d} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Début</label>
                  <input type="time" value={startTime} onChange={e => setStart(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Fin</label>
                  <input type="time" value={endTime} onChange={e => setEnd(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500"/>
                </div>
              </div>
              {depts?.length && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Département</label>
                  <select value={deptId} onChange={e => setDeptId(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-4 h-11 text-sm focus:outline-none focus:border-brand-500">
                    <option value="">— Aucun —</option>
                    {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-brand-600 rounded-xl text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
                {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgramRow({ program: p, onEdit, onToggle, onDelete }: { program: Program; onEdit: (p:Program)=>void; onToggle: (p:Program)=>void; onDelete: (p:Program)=>void }) {
  const IconPencil = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>)
  const IconTrash  = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>)
  const DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']

  return (
    <div className={`flex items-center gap-4 px-6 py-4 group hover:bg-neutral-50/50 transition-colors ${!p.isActive ? 'opacity-60' : ''}`}>
      <div className="w-24 shrink-0">
        {p.dayOfWeek != null && <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{DAYS[p.dayOfWeek]}</span>}
        {(p.startTime || p.endTime) && (
          <div className="text-[10px] text-neutral-400 font-medium">{p.startTime}{p.endTime ? ` — ${p.endTime}` : ''}</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-neutral-900 truncate">{p.title}</p>
        {p.description && <p className="text-xs text-neutral-400 truncate">{p.description}</p>}
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {p.location && <span className="hidden md:block text-xs text-neutral-500">{p.location}</span>}
        {p.department && <span className="hidden lg:block text-xs font-bold bg-brand-50 text-brand-600 px-2 py-1 rounded-lg">{p.department.name}</span>}
        {/* Toggle */}
        <div onClick={() => onToggle(p)} className="relative cursor-pointer shrink-0">
          <div className={`w-10 h-5 rounded-full transition-colors ${p.isActive ? 'bg-brand-600' : 'bg-neutral-200'}`}/>
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.isActive ? 'translate-x-5' : 'translate-x-0.5'}`}/>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(p)} className="p-1.5 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><IconPencil /></button>
          <button onClick={() => onDelete(p)} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><IconTrash /></button>
        </div>
      </div>
    </div>
  )
}
