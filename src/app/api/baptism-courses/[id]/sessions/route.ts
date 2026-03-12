import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, error, serverError } from '@/lib/api'
type Ctx = { params: { id: string } }
export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    const sessions = await prisma.baptismCourseSession.findMany({
      where: { courseId: params.id },
      include: { attendances: true, _count: { select: { attendances: true } } },
      orderBy: { date: 'asc' }
    })
    return ok({ sessions })
  } catch (err) { return serverError(err) }
}
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const { title, date, notes, attendances } = await req.json()
    if (!title || !date) return error('Titre et date requis')
    const session = await prisma.baptismCourseSession.create({ data: { title, date: new Date(date), notes, courseId: params.id } })
    if (attendances?.length) {
      await prisma.baptismCourseAttendance.createMany({
        data: attendances.map((a: { memberId: string; isPresent: boolean }) => ({ sessionId: session.id, memberId: a.memberId, isPresent: a.isPresent })),
        skipDuplicates: true,
      })
    }
    return created(session)
  } catch (err) { return serverError(err) }
}
