import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, noContent, notFound, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

type Ctx = { params: { slug: string } }

export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    const event = await prisma.event.findUnique({
      where: { slug: params.slug },
      include: {
        church: { select: { id: true, name: true, city: true } },
        attendances: { include: { member: { select: { id: true, firstName: true, lastName: true } } }, take: 50 },
        _count: { select: { attendances: true } },
      },
    })
    if (!event) return notFound('Événement')
    return ok(event)
  } catch (err) {
    return serverError(err)
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const data = await req.json()
    const event = await prisma.event.update({
      where: { slug: params.slug },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate:   data.endDate   ? new Date(data.endDate)   : undefined,
      },
    })
    return ok(event)
  } catch (err) {
    return serverError(err)
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    await prisma.event.delete({ where: { slug: params.slug } })
    return noContent()
  } catch (err) {
    return serverError(err)
  }
}
