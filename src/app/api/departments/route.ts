import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, error, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const churchId = new URL(req.url).searchParams.get('churchId') || session.churchId
    const depts = await prisma.department.findMany({
      where: { churchId: churchId! },
      include: {
        leader:  { select: { id: true, firstName: true, lastName: true } },
        members: { include: { member: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } } },
        _count:  { select: { members: true, programs: true } },
      },
      orderBy: { name: 'asc' },
    })
    return ok(depts)
  } catch (err) {
    return serverError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { name, description, color, leaderId, churchId } = await req.json()
    if (!name) return error('Nom requis')
    const dept = await prisma.department.create({
      data: {
        name, description, color,
        leaderId: leaderId || null,
        churchId: churchId || session.churchId!,
      },
      include: { leader: { select: { id: true, firstName: true, lastName: true } }, _count: { select: { members: true } } },
    })
    return created(dept)
  } catch (err) {
    return serverError(err)
  }
}
