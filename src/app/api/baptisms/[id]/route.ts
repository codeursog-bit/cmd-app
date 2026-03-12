import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, noContent, notFound, serverError } from '@/lib/api'

type Ctx = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const baptism = await prisma.baptism.findUnique({
      where: { id: params.id },
      include: {
        member: {
          select: {
            id: true, firstName: true, lastName: true,
            photoUrl: true, gender: true,
            church: { select: { id: true, name: true } },
          },
        },
      },
    })
    if (!baptism) return notFound('Baptême')
    return ok(baptism)
  } catch (err) {
    return serverError(err)
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const data = await req.json()
    const baptism = await prisma.baptism.update({
      where: { id: params.id },
      data: { ...data, baptismDate: data.baptismDate ? new Date(data.baptismDate) : undefined },
    })
    return ok(baptism)
  } catch (err) {
    return serverError(err)
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    await prisma.baptism.delete({ where: { id: params.id } })
    return noContent()
  } catch (err) {
    return serverError(err)
  }
}
