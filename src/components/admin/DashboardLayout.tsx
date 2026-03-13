'use client'
import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const IconDashboard = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>)
const IconMembers = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>)
const IconDepartments = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>)
const IconAttendance = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>)
const IconEvents = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="3" x2="21" y1="10" y2="10"/></svg>)
const IconPublications = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>)
const IconPrograms = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>)
const IconBaptisms = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"/><path d="m16 8-4 4-4-4"/></svg>)
const IconChurches = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M10 21V10l-2 2V8l4-4 4 4v4l-2-2v11"/></svg>)
const IconUsers = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>)
const IconCourses = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"/><path d="m16 8-4 4-4-4"/><path d="M20 19a8 8 0 0 0-16 0"/></svg>)
const IconDons = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>)
const IconMessages = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>)
const IconNewsletter = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>)
const IconSocial = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>)
const IconSettings = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>)
const IconLock = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>)
const IconBell = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>)
const IconLogout = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>)
const IconMenu = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>)
const IconCross = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M7 7h10"/></svg>)
const IconChevronRight = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>)

const NavItem = ({ to, icon, label, active, locked, badge }: { to: string; icon: React.ReactNode; label: string; active?: boolean; locked?: boolean; badge?: number }) => (
  <Link href={locked ? '#' : to}
    className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all group ${active ? 'bg-brand-700 text-white font-medium' : 'text-brand-300 hover:text-white hover:bg-brand-800'} ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}>
    <div className="flex items-center gap-3">
      <div className={active ? 'text-white' : 'text-brand-400 group-hover:text-white'}>{icon}</div>
      <span className="font-sans text-sm">{label}</span>
    </div>
    {locked && <IconLock />}
    {!locked && badge != null && badge > 0 && (
      <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </Link>
)

const NavGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1 mb-6">
    <h3 className="text-brand-600 text-[10px] font-bold uppercase tracking-widest px-3 mb-2">{label}</h3>
    {children}
  </div>
)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingDons, setPendingDons] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [newSubscribers, setNewSubscribers] = useState(0)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/')
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isPastor     = user?.role === 'PASTOR'
  const isMedia      = user?.role === 'MEDIA_MANAGER'
  const isBaptism    = user?.role === 'BAPTISM_TEACHER'
  const isDept       = user?.role === 'DEPT_LEADER'
  const isSecretary  = user?.role === 'SECRETARY'
  const canSeeDons   = isSuperAdmin
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'JD'
  const fullName = user ? `${user.firstName} ${user.lastName}` : '—'
  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: 'Berger Principal', PASTOR: 'Pasteur', DEPT_LEADER: 'Chef de Département',
    MEDIA_MANAGER: 'Gestionnaire Média', BAPTISM_TEACHER: 'Enseignant Baptême', SECRETARY: 'Secrétaire',
  }
  const roleLabel = ROLE_LABELS[user?.role || ''] || 'Admin'

  // Badge dons en attente
  const fetchPending = useCallback(async () => {
    if (!canSeeDons) return
    try {
      const res = await fetch('/api/donations/pending-count')
      const json = await res.json()
      setPendingDons(json.data?.count ?? 0)
    } catch { /* silencieux */ }
  }, [canSeeDons])

  // Badge messages non lus + abonnés newsletter
  const fetchNotifs = useCallback(async () => {
    if (!isSuperAdmin && !isPastor) return
    try {
      const [msgRes, subRes] = await Promise.all([
        fetch('/api/contact?status=UNREAD&limit=1'),
        fetch('/api/newsletter'),
      ])
      const msgJson = await msgRes.json()
      const subJson = await subRes.json()
      setUnreadMessages(msgJson.data?.unreadCount ?? 0)
      setNewSubscribers(subJson.data?.total ?? 0)
    } catch { /* silencieux */ }
  }, [isSuperAdmin, isPastor])

  useEffect(() => {
    fetchPending()
    fetchNotifs()
    const interval = setInterval(() => { fetchPending(); fetchNotifs() }, 60_000)
    return () => clearInterval(interval)
  }, [fetchPending, fetchNotifs])

  return (
    <div className="flex h-screen bg-neutral-50 font-sans text-neutral-900 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-brand-950/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 w-[260px] bg-brand-950 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-brand-900">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo-cmd.png" alt="CMD" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="font-display text-2xl font-bold text-white leading-none">CMD</h1>
              <span className="text-brand-400 text-[10px] font-bold uppercase tracking-widest">Administration</span>
            </div>
          </div>
          {user?.church && (
            <div className="bg-brand-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-brand-400 uppercase font-bold tracking-wider">Église active</span>
                <span className="block text-xs text-white font-medium">{user.church.name}</span>
              </div>
              <div className="text-brand-400"><IconChevronRight /></div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <NavGroup label="VUE GÉNÉRALE">
            <NavItem to="/admin/dashboard" icon={<IconDashboard />} label="Tableau de bord" active={isActive('/admin/dashboard')} />
          </NavGroup>

          {/* COMMUNAUTÉ — visible par tous sauf media */}
          {!isMedia && (
            <NavGroup label="COMMUNAUTÉ">
              <NavItem to="/admin/membres" icon={<IconMembers />} label="Membres" active={isActive('/admin/membres')} />
              {!isSecretary && <NavItem to="/admin/departements" icon={<IconDepartments />} label="Départements" active={isActive('/admin/departements')} />}
              {!isSecretary && <NavItem to="/admin/presences" icon={<IconAttendance />} label="Présences" active={isActive('/admin/presences')} />}
            </NavGroup>
          )}

          {/* MINISTÈRE — masqué pour dept leader, baptism teacher, secretary */}
          {(isSuperAdmin || isPastor || isMedia) && (
            <NavGroup label="MINISTÈRE">
              <NavItem to="/admin/evenements" icon={<IconEvents />} label="Événements" active={isActive('/admin/evenements')} />
              <NavItem to="/admin/publications" icon={<IconPublications />} label="Publications" active={isActive('/admin/publications')} />
              {(isSuperAdmin || isPastor) && <NavItem to="/admin/programmes" icon={<IconPrograms />} label="Programmes" active={isActive('/admin/programmes')} />}
            </NavGroup>
          )}

          {/* ADMINISTRATION */}
          {!isMedia && !isDept && (
            <NavGroup label="ADMINISTRATION">
              {(isSuperAdmin || isPastor || isBaptism || isSecretary) && (
                <>
                  <NavItem to="/admin/baptemes" icon={<IconBaptisms />} label="Baptêmes" active={isActive('/admin/baptemes')} />
                  <NavItem to="/admin/cours-bapteme" icon={<IconCourses />} label="Cours de Baptême" active={isActive('/admin/cours-bapteme')} />
                </>
              )}
              {canSeeDons && (
                <NavItem to="/admin/dons" icon={<IconDons />} label="Dons" active={isActive('/admin/dons')} badge={pendingDons} />
              )}
              {(isSuperAdmin || isPastor) && (
                <>
                  <NavItem to="/admin/eglises" icon={<IconChurches />} label="Églises" active={isActive('/admin/eglises')} locked={!isSuperAdmin} />
                  <NavItem to="/admin/utilisateurs" icon={<IconUsers />} label="Utilisateurs" active={isActive('/admin/utilisateurs')} />
                </>
              )}
            </NavGroup>
          )}

          {/* PARAMÈTRES */}
          {(isSuperAdmin || isPastor) && (
            <NavGroup label="PARAMÈTRES">
              <NavItem to="/admin/messages" icon={<IconMessages />} label="Messages" active={isActive('/admin/messages')} badge={unreadMessages} />
              <NavItem to="/admin/newsletter" icon={<IconNewsletter />} label="Newsletter" active={isActive('/admin/newsletter')} badge={newSubscribers} />
              <NavItem to="/admin/reseaux-sociaux" icon={<IconSocial />} label="Réseaux Sociaux" active={isActive('/admin/reseaux-sociaux')} />
              <NavItem to="/admin/parametres" icon={<IconSettings />} label="Paramètres" active={isActive('/admin/parametres')} />
            </NavGroup>
          )}
        </nav>

        <div className="p-4 border-t border-brand-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-brand-300 font-bold border border-brand-700">{initials}</div>
            <div>
              <span className="block text-sm text-white font-medium">{fullName}</span>
              <span className="block text-[10px] text-brand-500 font-bold uppercase tracking-widest">{roleLabel}</span>
            </div>
          </div>
          <div onClick={logout} className="flex items-center gap-2 text-brand-400 hover:text-red-400 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors px-1">
            <IconLogout /><span>Déconnexion</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-neutral-500 hover:text-brand-600 transition-colors" onClick={() => setSidebarOpen(true)}><IconMenu /></button>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-neutral-400 hover:text-brand-600 transition-colors">
              <IconBell />
              <span className="absolute top-0 right-0 w-2 h-2 bg-brand-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-[1px] bg-neutral-200" />
            <Link href="/admin/parametres" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold border border-neutral-200 group-hover:border-brand-300 transition-all text-xs">{initials}</div>
              <span className="hidden sm:block text-xs font-bold text-neutral-900 group-hover:text-brand-600 transition-colors">{fullName}</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-neutral-50 custom-scrollbar">{children}</main>
      </div>
    </div>
  )
}
