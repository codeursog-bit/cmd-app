import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, error, serverError } from '@/lib/api'
import { certNumber } from '@/lib/slugify'

export const dynamic = 'force-dynamic'
type Ctx = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    const course = await prisma.baptismCourse.findUnique({
      where: { id: params.id },
      include: {
        enrollments: {
          include: {
            member: {
              select: {
                id: true, firstName: true, lastName: true, photoUrl: true,
                baptisms: { select: { id: true, baptismDate: true } }
              }
            }
          },
          orderBy: { enrolledAt: 'asc' }
        },
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
    if (data.endDate)   data.endDate   = new Date(data.endDate)
    const course = await prisma.baptismCourse.update({ where: { id: params.id }, data })
    return ok(course)
  } catch (err) { return serverError(err) }
}

// POST /api/baptism-courses/[id]/generate-baptisms
// Corps : { memberIds: string[], baptismDate: string, baptismType: string, officiant?: string, location?: string }
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const { memberIds, baptismDate, baptismType, officiant, location } = await req.json()

    if (!memberIds?.length) return error('Aucun membre sélectionné')
    if (!baptismDate)       return error('Date requise')

    const results = await Promise.allSettled(
      memberIds.map((memberId: string) =>
        prisma.baptism.create({
          data: {
            memberId,
            baptismType: baptismType || 'WATER',
            baptismDate: new Date(baptismDate),
            officiant:   officiant || null,
            location:    location  || null,
            certificateNo: certNumber(),
          },
          include: { member: { select: { id: true, firstName: true, lastName: true } } }
        })
      )
    )

    const created_list = results.filter(r => r.status === 'fulfilled').map(r => (r as any).value)
    const failed       = results.filter(r => r.status === 'rejected').length

    return created({ created: created_list.length, failed, baptisms: created_list })
  } catch (err) { return serverError(err) }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    await prisma.baptismCourse.delete({ where: { id: params.id } })
    return ok({ deleted: true })
  } catch (err) { return serverError(err) }
}