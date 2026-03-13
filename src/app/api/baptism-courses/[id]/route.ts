import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'
type Ctx = { params: { id: string } }
export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    const course = await prisma.baptismCourse.findUnique({
      where: { id: params.id },
      include: {
        enrollments: { include: { member: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } } },
        sessions: { include: { _count: { select: { attendances: true } } }, orderBy: { date: 'asc' } },
        _count: { select: { enrollments: true, sessions: true } }
      }
    })
    return ok(course)
  } catch (err) { return serverError(err) }
}
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const data = await req.json()
    if (data.startDate) data.startDate = new Date(data.startDate)
    if (data.endDate) data.endDate = new Date(data.endDate)
    const course = await prisma.baptismCourse.update({ where: { id: params.id }, data })
    return ok(course)
  } catch (err) { return serverError(err) }
}
export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    await prisma.baptismCourse.delete({ where: { id: params.id } })
    return ok({ deleted: true })
  } catch (err) { return serverError(err) }
}
