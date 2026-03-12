import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, serverError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const churchId = new URL(req.url).searchParams.get('churchId') || session.churchId
    if (!churchId) return ok({})

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear  = new Date(now.getFullYear(), 0, 1)

    const [
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      upcomingEvents,
      publishedPosts,
      newPostsThisWeek,
      totalBaptisms,
      baptismsThisYear,
      departments,
      recentMembers,
      nextEvents,
      socialAccounts,
    ] = await Promise.all([
      prisma.member.count({ where: { churchId } }),
      prisma.member.count({ where: { churchId, isActive: true } }),
      prisma.member.count({ where: { churchId, joinDate: { gte: startOfMonth } } }),
      prisma.event.count({ where: { churchId, startDate: { gte: now }, status: { not: 'CANCELLED' } } }),
      prisma.post.count({ where: { churchId, status: 'PUBLISHED' } }),
      prisma.post.count({ where: { churchId, createdAt: { gte: new Date(now.getTime() - 7 * 86400000) } } }),
      prisma.baptism.count({ where: { member: { churchId } } }),
      prisma.baptism.count({ where: { member: { churchId }, baptismDate: { gte: startOfYear } } }),
      prisma.department.findMany({
        where: { churchId },
        include: { _count: { select: { members: true } } },
        orderBy: { name: 'asc' },
      }),
      prisma.member.findMany({
        where: { churchId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { departments: { include: { department: { select: { name: true } } }, take: 1 } },
      }),
      prisma.event.findMany({
        where: { churchId, startDate: { gte: now }, status: { not: 'CANCELLED' } },
        orderBy: { startDate: 'asc' },
        take: 4,
        select: { id: true, title: true, startDate: true, location: true },
      }),
      prisma.socialAccount.findMany({
        where: { churchId },
        select: { id: true, platform: true, accountName: true, isActive: true },
      }),
    ])

    return ok({
      kpis: {
        totalMembers, activeMembers, newMembersThisMonth,
        upcomingEvents, publishedPosts, newPostsThisWeek,
        totalBaptisms, baptismsThisYear,
      },
      departments: departments.map(d => ({ id: d.id, name: d.name, color: d.color, count: d._count.members })),
      recentMembers: recentMembers.map(m => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        department: m.departments[0]?.department.name || '—',
        joinedDate: new Intl.DateTimeFormat('fr-FR').format(m.joinDate),
        isActive: m.isActive,
      })),
      nextEvents: nextEvents.map(e => ({
        id: e.id,
        title: e.title,
        date: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(e.startDate).toUpperCase(),
        location: e.location,
      })),
      socialAccounts,
    })
  } catch (err) {
    return serverError(err)
  }
}
