import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, noContent, notFound, serverError } from '@/lib/api'

type Ctx = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const dept = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        leader:  { select: { id: true, firstName: true, lastName: true } },
        members: {
          include: { member: { select: { id: true, firstName: true, lastName: true, photoUrl: true, phone: true, email: true } } },
          orderBy: { joinedAt: 'desc' },
        },
        programs: { where: { isActive: true } },
        _count:  { select: { members: true, programs: true } },
      },
    })
    if (!dept) return notFound('Département')
    return ok(dept)
  } catch (err) {
    return serverError(err)
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const data = await req.json()
    const dept = await prisma.department.update({ where: { id: params.id }, data })
    return ok(dept)
  } catch (err) {
    return serverError(err)
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    await prisma.department.delete({ where: { id: params.id } })
    return noContent()
  } catch (err) {
    return serverError(err)
  }
}
