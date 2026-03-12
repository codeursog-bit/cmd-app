'use client'

import { useApi, apiFetch } from '@/hooks/useApi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Member {
  id:string; firstName:string; lastName:string; gender:string|null; birthDate:string|null
  phone:string|null; email:string|null; address:string|null; notes:string|null
  isActive:boolean; joinDate:string; photoUrl:string|null
  departments: { department:{id:string;name:string;color:string|null}; isLeader:boolean }[]
  baptisms: { id:string; baptismType:string; baptismDate:string; officiant:string|null; certificateNo:string|null }[]
  attendances: { id:string; date:string; isPresent:boolean; event:{title:string;startDate:string}|null }[]
  church: { id:string; name:string; city:string|null }
}

const Back = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>)
const IconPencil = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>)
const IconTrash = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6m4-6v6m-5-9V4h6v2"/></svg>)

const Skeleton = ({cls}:{cls:string}) => <div className={`bg-neutral-100 animate-pulse rounded ${cls}`}/>

export default function MemberProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: member, loading } = useApi<Member>(`/api/members/${id}`)
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Supprimer ce membre ? Cette action est irréversible.')) return
    setDeleting(true)
    const { error } = await apiFetch(`/api/members/${id}`, 'DELETE')
    if (!error) router.push('/admin/membres')
    else { alert(error); setDeleting(false) }
  }

  const fmt = (d:string) => new Intl.DateTimeFormat('fr-FR').format(new Date(d))

  if (loading) return (
    <div className="space-y-8 animate-fade-in">
      <Skeleton cls="h-8 w-48"/><Skeleton cls="h-48 w-full rounded-2xl"/><Skeleton cls="h-64 w-full rounded-2xl"/>
    </div>
  )

  if (!member) return (
    <div className="text-center py-32 text-neutral-400">
      <p className="text-lg font-bold">Membre introuvable</p>
      <Link href="/admin/membres" className="mt-4 inline-block text-brand-600 font-bold hover:underline">← Retour à la liste</Link>
    </div>
  )

  const initials = `${member.firstName[0]}${member.lastName[0]}`
  const waterBaptism  = member.baptisms.find(b => b.baptismType === 'WATER')
  const spiritBaptism = member.baptisms.find(b => b.baptismType === 'HOLY_SPIRIT')
  const presenceRate  = member.attendances.length ? Math.round(member.attendances.filter(a=>a.isPresent).length/member.attendances.length*100) : null

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/membres" className="flex items-center gap-2 text-neutral-500 hover:text-brand-600 transition-colors text-sm font-medium">
          <Back /> Retour aux membres
        </Link>
        <div className="flex items-center gap-3">
          <Link href={`/membres/${id}/edit`} className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
            <IconPencil /> Modifier
          </Link>
          <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-4 py-2 border border-red-100 bg-red-50 rounded-lg text-sm font-bold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50">
            <IconTrash /> {deleting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-950 to-brand-700"/>
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-brand-950 border-4 border-white flex items-center justify-center shadow-lg shrink-0">
              <span className="font-display text-3xl font-bold text-brand-300">{initials}</span>
            </div>
            <div className="pb-2">
              <h1 className="font-sans text-2xl font-bold text-neutral-900">{member.firstName} {member.lastName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${member.isActive?'bg-emerald-50 text-emerald-700':'bg-neutral-100 text-neutral-500'}`}>
                  {member.isActive ? 'Actif' : 'Inactif'}
                </span>
                {member.departments.map(d => (
                  <span key={d.department.id} className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100">
                    {d.department.name}{d.isLeader ? ' · Responsable' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-neutral-100">
            {[
              ['Église', member.church.name],
              ['Arrivée', fmt(member.joinDate)],
              ['Genre', member.gender === 'MALE' ? 'Homme' : member.gender === 'FEMALE' ? 'Femme' : '—'],
              ['Date de naissance', member.birthDate ? fmt(member.birthDate) : '—'],
            ].map(([l,v]) => (
              <div key={l}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{l}</p>
                <p className="font-sans font-bold text-sm text-neutral-800 mt-1">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CONTACTS */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <h3 className="font-sans font-bold text-neutral-900 mb-4">Coordonnées</h3>
          <div className="space-y-3">
            {[['Téléphone', member.phone],['Email', member.email],['Adresse', member.address]].map(([l,v]) => (
              <div key={l}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{l}</p>
                <p className="text-sm text-neutral-700 mt-0.5">{v || '—'}</p>
              </div>
            ))}
          </div>
          {member.notes && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Notes</p>
              <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{member.notes}</p>
            </div>
          )}
        </div>

        {/* BAPTISMS */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <h3 className="font-sans font-bold text-neutral-900 mb-4">Baptêmes</h3>
          <div className="space-y-4">
            {[{type:'Baptême d\'eau', b:waterBaptism},{type:'Baptême du Saint-Esprit', b:spiritBaptism}].map(({type,b}) => (
              <div key={type} className={`p-4 rounded-xl border ${b?'border-brand-200 bg-brand-50':'border-dashed border-neutral-200'}`}>
                <p className="text-xs font-bold text-neutral-600">{type}</p>
                {b ? (
                  <>
                    <p className="font-bold text-brand-700 text-sm mt-1">{fmt(b.baptismDate)}</p>
                    {b.officiant && <p className="text-xs text-neutral-500 mt-0.5">Officiant : {b.officiant}</p>}
                    {b.certificateNo && (
                      <Link href={`/baptemes/${b.id}`} className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-brand-600 hover:underline">
                        Certificat n° {b.certificateNo}
                      </Link>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-neutral-400 italic mt-1">Non enregistré</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PRESENCE */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-bold text-neutral-900">Présences</h3>
            {presenceRate !== null && (
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${presenceRate>=75?'bg-emerald-50 text-emerald-700':presenceRate>=50?'bg-amber-50 text-amber-700':'bg-red-50 text-red-600'}`}>
                {presenceRate}%
              </span>
            )}
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {member.attendances.length ? member.attendances.slice(0,10).map(a => (
              <div key={a.id} className="flex items-center justify-between text-xs py-2 border-b border-neutral-50 last:border-0">
                <span className="text-neutral-600">{a.event?.title || 'Culte'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">{fmt(a.date)}</span>
                  <span className={`w-2 h-2 rounded-full ${a.isPresent?'bg-emerald-400':'bg-red-400'}`}/>
                </div>
              </div>
            )) : <p className="text-sm text-neutral-400 italic">Aucune présence enregistrée.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
