import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, noContent, notFound, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }

// GET /api/members/:id
export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        departments: { include: { department: { include: { _count: { select: { members: true } } } } } },
        baptisms:    { orderBy: { baptismDate: 'desc' } },
        attendances: { orderBy: { date: 'desc' }, take: 20, include: { event: { select: { title: true, startDate: true } } } },
        church:      { select: { id: true, name: true, city: true } },
      },
    })
    if (!member) return notFound('Membre')
    return ok(member)
  } catch (err) {
    return serverError(err)
  }
}

// PATCH /api/members/:id
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const body = await req.json()
    const { departmentIds, ...data } = body

    const member = await prisma.member.update({
      where: { id: params.id },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      },
    })

    if (departmentIds !== undefined) {
      await prisma.memberDepartment.deleteMany({ where: { memberId: params.id } })
      if (departmentIds.length) {
        await prisma.memberDepartment.createMany({
          data: departmentIds.map((id: string) => ({ memberId: params.id, departmentId: id })),
          skipDuplicates: true,
        })
      }
    }

    return ok(member)
  } catch (err) {
    return serverError(err)
  }
}

// DELETE /api/members/:id
export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    await prisma.member.delete({ where: { id: params.id } })
    return noContent()
  } catch (err) {
    return serverError(err)
  }
}
