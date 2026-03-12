// ============================================================
// SYSTÈME DE PERMISSIONS CENTRALISÉ
// ============================================================

export type UserRole = 'SUPER_ADMIN' | 'PASTOR' | 'DEPT_LEADER' | 'MEDIA_MANAGER' | 'BAPTISM_TEACHER' | 'SECRETARY'

export interface SessionUser {
  id: string
  role: UserRole
  churchId?: string
  church?: { id: string; name: string } | null
  organisationId?: string
}

// ── Ce que chaque rôle peut faire ─────────────────────────────
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: {
    label: 'Berger Principal',
    canManageChurches: true,
    canManageAllMembers: true,
    canManageAllDepts: true,
    canManageAllUsers: true,
    canManagePosts: true,
    canManageEvents: true,
    canManageBaptisms: true,
    canManageBaptismCourses: true,
    canManageDonations: true,
    canViewMessages: true,
    canManagePrograms: true,
    canManageSocial: true,
    canCreateUsers: true,
    creatableRoles: ['PASTOR', 'DEPT_LEADER', 'MEDIA_MANAGER', 'BAPTISM_TEACHER', 'SECRETARY'] as UserRole[],
  },
  PASTOR: {
    label: 'Pasteur',
    canManageChurches: false,      // ne peut pas créer d'églises
    canManageAllMembers: false,    // seulement son église
    canManageAllDepts: false,      // seulement son église
    canManageAllUsers: false,
    canManagePosts: true,
    canManageEvents: true,
    canManageBaptisms: true,
    canManageBaptismCourses: true,
    canManageDonations: true,
    canViewMessages: true,
    canManagePrograms: true,
    canManageSocial: true,
    canCreateUsers: true,          // pour son église
    creatableRoles: ['DEPT_LEADER', 'MEDIA_MANAGER', 'BAPTISM_TEACHER', 'SECRETARY'] as UserRole[],
  },
  DEPT_LEADER: {
    label: 'Chef de Département',
    canManageChurches: false,
    canManageAllMembers: false,    // membres de son dept
    canManageAllDepts: false,
    canManageAllUsers: false,
    canManagePosts: false,
    canManageEvents: false,
    canManageBaptisms: false,
    canManageBaptismCourses: false,
    canManageDonations: false,
    canViewMessages: false,
    canManagePrograms: true,       // programmes de son dept
    canManageSocial: false,
    canCreateUsers: false,
    creatableRoles: [] as UserRole[],
  },
  MEDIA_MANAGER: {
    label: 'Gestionnaire Média',
    canManageChurches: false,
    canManageAllMembers: false,
    canManageAllDepts: false,
    canManageAllUsers: false,
    canManagePosts: true,
    canManageEvents: true,
    canManageBaptisms: false,
    canManageBaptismCourses: false,
    canManageDonations: false,
    canViewMessages: false,
    canManagePrograms: false,
    canManageSocial: true,
    canCreateUsers: false,
    creatableRoles: [] as UserRole[],
  },
  BAPTISM_TEACHER: {
    label: 'Enseignant Baptême',
    canManageChurches: false,
    canManageAllMembers: false,
    canManageAllDepts: false,
    canManageAllUsers: false,
    canManagePosts: false,
    canManageEvents: false,
    canManageBaptisms: true,
    canManageBaptismCourses: true,
    canManageDonations: false,
    canViewMessages: false,
    canManagePrograms: false,
    canManageSocial: false,
    canCreateUsers: false,
    creatableRoles: [] as UserRole[],
  },
  SECRETARY: {
    label: 'Secrétaire',
    canManageChurches: false,
    canManageAllMembers: true,     // peut ajouter/modifier membres
    canManageAllDepts: false,
    canManageAllUsers: false,
    canManagePosts: false,
    canManageEvents: false,
    canManageBaptisms: false,
    canManageBaptismCourses: true, // peut inscrire aux cours baptême
    canManageDonations: false,     // peut voir mais pas confirmer
    canViewMessages: false,
    canManagePrograms: false,
    canManageSocial: false,
    canCreateUsers: false,
    creatableRoles: [] as UserRole[],
  },
} as const

export function can(role: UserRole, permission: keyof typeof ROLE_PERMISSIONS['SUPER_ADMIN']) {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false
}

export function isSuperAdmin(role: UserRole) { return role === 'SUPER_ADMIN' }
export function isPastor(role: UserRole) { return role === 'PASTOR' }
export function canManageMedia(role: UserRole) { return role === 'SUPER_ADMIN' || role === 'PASTOR' || role === 'MEDIA_MANAGER' }
export function canManageBaptism(role: UserRole) { return role === 'SUPER_ADMIN' || role === 'PASTOR' || role === 'BAPTISM_TEACHER' }
export function canManageDept(role: UserRole) { return role === 'SUPER_ADMIN' || role === 'PASTOR' || role === 'DEPT_LEADER' }
export function canCreateUsers(role: UserRole) { return role === 'SUPER_ADMIN' || role === 'PASTOR' }

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN:     'Berger Principal',
  PASTOR:          'Pasteur',
  DEPT_LEADER:     'Chef de Département',
  MEDIA_MANAGER:   'Gestionnaire Média',
  BAPTISM_TEACHER: 'Enseignant Baptême',
  SECRETARY:       'Secrétaire',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN:     'bg-amber-50 text-amber-700 border-amber-200',
  PASTOR:          'bg-brand-50 text-brand-700 border-brand-200',
  DEPT_LEADER:     'bg-purple-50 text-purple-700 border-purple-200',
  MEDIA_MANAGER:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  BAPTISM_TEACHER: 'bg-sky-50 text-sky-700 border-sky-200',
  SECRETARY:       'bg-neutral-50 text-neutral-600 border-neutral-200',
}
