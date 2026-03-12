'use client'
import { useAuth } from '@/context/AuthContext'
import { useApi } from '@/hooks/useApi'
import Link from 'next/link'

const IconUsers = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M18 3.13a4 4 0 0 1 0 7.75"/></svg>)
const IconCalendar = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>)
const IconFileText = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>)
const IconDroplets = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16.3c2.2 0 4-1.8 4-4 0-3.3-4-8-4-8s-4 4.7-4 8c0 2.2 1.8 4 4 4z"/><path d="M17 16.3c2.2 0 4-1.8 4-4 0-3.3-4-8-4-8s-4 4.7-4 8c0 2.2 1.8 4 4 4z"/></svg>)
const IconPin = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>)
const ArrowRight = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>)

interface DashboardData {
  kpis: { totalMembers: number; activeMembers: number; newMembersThisMonth: number; upcomingEvents: number; publishedPosts: number; newPostsThisWeek: number; totalBaptisms: number; baptismsThisYear: number }
  departments: { id: string; name: string; color: string | null; count: number }[]
  recentMembers: { id: string; name: string; department: string; joinedDate: string; isActive: boolean }[]
  nextEvents: { id: string; title: string; date: string; location: string | null }[]
  socialAccounts: { id: string; platform: string; accountName: string; isActive: boolean }[]
}

const Skeleton = ({ className }: { className: string; key?: number }) => (
  <div className={`bg-neutral-100 animate-pulse rounded ${className}`} />
)

export default function DashboardPage() {
  const { user } = useAuth()
  const churchId = user?.church?.id
  const dashUrl = !user ? null : churchId ? `/api/dashboard?churchId=${churchId}` : user.role === 'SUPER_ADMIN' ? '/api/dashboard' : null
  const { data, loading } = useApi<DashboardData>(dashUrl)

  const currentDate = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())
  const kpis = data?.kpis

  const DEPT_COLORS = ['bg-brand-600','bg-brand-400','bg-brand-300','bg-brand-700','bg-neutral-300','bg-brand-800']
  const totalDeptMembers = data?.departments.reduce((s,d) => s + d.count, 0) || 1

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-semibold text-neutral-900">Bonjour, {user?.firstName} 👋</h1>
          <p className="text-neutral-500 text-sm capitalize">{currentDate}</p>
        </div>
        {user?.church && (
          <div className="inline-flex items-center px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold tracking-wide">
            {user.church.name}
          </div>
        )}
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? Array(4).fill(0).map((_,i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <Skeleton className="h-4 w-24 mb-3" /><Skeleton className="h-10 w-20" />
          </div>
        )) : [
          { label:'Membres actifs', value: kpis?.activeMembers ?? '—', trend: kpis?.newMembersThisMonth ? `+${kpis.newMembersThisMonth} ce mois` : undefined, icon:<IconUsers /> },
          { label:'Événements à venir', value: kpis?.upcomingEvents ?? '—', trend:'Prochains 30 jours', icon:<IconCalendar /> },
          { label:'Publications', value: kpis?.publishedPosts ?? '—', trend: kpis?.newPostsThisWeek ? `+${kpis.newPostsThisWeek} cette semaine` : undefined, icon:<IconFileText /> },
          { label:'Baptêmes (année)', value: kpis?.baptismsThisYear ?? '—', trend:`Total: ${kpis?.totalBaptisms ?? '—'}`, icon:<IconDroplets /> },
        ].map((kpi, idx) => (
          <div key={idx} className="group relative bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md hover:-translate-y-px transition-all duration-300">
            <span className="text-neutral-500 text-sm font-medium">{kpi.label}</span>
            <span className="font-display text-5xl text-brand-600 font-bold mt-2 block">{String(kpi.value)}</span>
            {kpi.trend && <span className="text-[10px] font-bold mt-2 block text-emerald-600">{kpi.trend}</span>}
            <div className="absolute top-6 right-6 text-brand-300 group-hover:text-brand-600 transition-colors">{kpi.icon}</div>
          </div>
        ))}
      </div>

      {/* EVENTS + MEMBERS */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Membres récents</h3>
          <div className="overflow-x-auto flex-1">
            {loading ? (
              <div className="space-y-3">{Array(5).fill(0).map((_,i)=><Skeleton key={i} className="h-10 w-full"/>)}</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead><tr className="border-b border-neutral-100">
                  {['Nom','Département','Arrivée','Statut'].map(h => <th key={h} className="pb-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-neutral-50">
                  {data?.recentMembers.map(m => (
                    <tr key={m.id} className="group hover:bg-neutral-50/50 transition-colors">
                      <td className="py-4">
                        <Link href={`/admin/membres/${m.id}`} className="flex items-center gap-3 hover:text-brand-600 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 text-xs font-bold border border-brand-100">
                            {m.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                          </div>
                          <span className="text-sm font-bold text-neutral-900">{m.name}</span>
                        </Link>
                      </td>
                      <td className="py-4 text-sm text-neutral-600">{m.department}</td>
                      <td className="py-4 text-sm text-neutral-500">{m.joinedDate}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${m.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                          {m.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-50">
            <Link href="/admin/membres" className="text-brand-600 text-sm font-bold hover:underline inline-flex items-center gap-2">Voir tous les membres <ArrowRight /></Link>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Prochains événements</h3>
          <div className="space-y-4 flex-1">
            {loading ? Array(4).fill(0).map((_,i) => <Skeleton key={i} className="h-16 w-full"/>) :
              data?.nextEvents.map(ev => (
                <div key={ev.id} className="pl-4 border-l-4 border-brand-600 py-1">
                  <div className="text-brand-600 text-[10px] font-bold tracking-widest uppercase mb-1">{ev.date}</div>
                  <div className="text-sm text-neutral-900 font-bold mb-1">{ev.title}</div>
                  {ev.location && <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] font-medium"><IconPin />{ev.location}</div>}
                </div>
              ))
            }
            {!loading && !data?.nextEvents.length && <p className="text-neutral-400 text-sm italic">Aucun événement à venir.</p>}
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-50">
            <Link href="/admin/evenements" className="text-brand-600 text-sm font-bold hover:underline inline-flex items-center gap-2">Voir le calendrier <ArrowRight /></Link>
          </div>
        </div>
      </div>

      {/* DEPARTMENTS */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <h3 className="text-lg font-bold text-neutral-900 mb-6">Répartition par départements</h3>
        {loading ? <Skeleton className="h-4 w-full mb-6" /> : (
          <>
            <div className="flex h-4 w-full rounded-full overflow-hidden mb-6">
              {data?.departments.map((d, i) => (
                <div key={d.id} className={`${DEPT_COLORS[i % DEPT_COLORS.length]} h-full`}
                  style={{ width: `${(d.count / totalDeptMembers) * 100}%` }} />
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data?.departments.map((d, i) => (
                <div key={d.id} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${DEPT_COLORS[i % DEPT_COLORS.length]}`} />
                      <span className="text-neutral-700 font-medium">{d.name}</span>
                    </div>
                    <span className="text-neutral-900 font-bold">{d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
