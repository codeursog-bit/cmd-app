import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, error, forbidden, serverError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const orgId = new URL(req.url).searchParams.get('organisationId') || session.organisationId

    const where: any = {}
    if (session.role === 'SUPER_ADMIN' && orgId) where.organisationId = orgId
    else if (session.role !== 'SUPER_ADMIN' && session.churchId) where.id = session.churchId

    const churches = await prisma.church.findMany({
      where,
      include: {
        pastor:  { select: { id: true, firstName: true, lastName: true } },
        _count:  { select: { members: true, departments: true, events: true } },
      },
      orderBy: { name: 'asc' },
    })
    return ok(churches)
  } catch (err) {
    return serverError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'SUPER_ADMIN') return forbidden()

    const { name, address, city, country, phone, email, pastorId, organisationId } = await req.json()
    if (!name) return error('Nom requis')

    const church = await prisma.church.create({
      data: {
        name, address, city, country: country || 'CD',
        phone, email,
        pastorId: pastorId || null,
        organisationId: organisationId || session.organisationId!,
      },
      include: { pastor: { select: { id: true, firstName: true, lastName: true } } },
    })
    return created(church)
  } catch (err) {
    return serverError(err)
  }
}
