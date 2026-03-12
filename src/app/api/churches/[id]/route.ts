import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, noContent, notFound, forbidden, serverError } from '@/lib/api'

type Ctx = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const church = await prisma.church.findUnique({
      where: { id: params.id },
      include: {
        pastor:      { select: { id: true, firstName: true, lastName: true, email: true } },
        departments: { include: { _count: { select: { members: true } } } },
        _count:      { select: { members: true, events: true, programs: true } },
      },
    })
    if (!church) return notFound('Église')
    return ok(church)
  } catch (err) {
    return serverError(err)
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const session = await requireAuth()
    if (session.role !== 'SUPER_ADMIN' && session.churchId !== params.id) return forbidden()
    const data = await req.json()
    const church = await prisma.church.update({ where: { id: params.id }, data })
    return ok(church)
  } catch (err) {
    return serverError(err)
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    const session = await requireAuth()
    if (session.role !== 'SUPER_ADMIN') return forbidden()
    await prisma.church.delete({ where: { id: params.id } })
    return noContent()
  } catch (err) {
    return serverError(err)
  }
}
