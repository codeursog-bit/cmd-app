import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, getSession } from '@/lib/auth'
import { ok, created, error, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'
type Ctx = { params: { id: string } }

// POST — inscrire membre(s) ou nouvelle personne
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const session = await requireAuth()
    const { memberIds, newPerson } = await req.json()

    if (memberIds?.length) {
      const enrollments = await Promise.all(
        memberIds.map((memberId: string) =>
          prisma.baptismCourseEnrollment.upsert({
            where:  { memberId_courseId: { memberId, courseId: params.id } },
            update: {},
            create: { memberId, courseId: params.id, status: 'ONGOING' }
          })
        )
      )
      return created({ enrollments })
    }

    if (newPerson?.firstName && newPerson?.lastName) {
      const course = await prisma.baptismCourse.findUnique({ where: { id: params.id } })
      if (!course) return error('Cours introuvable')
      const churchId = course.churchId || session.churchId
      if (!churchId) return error('Église introuvable')
      const member = await prisma.member.create({
        data: { firstName: newPerson.firstName, lastName: newPerson.lastName, phone: newPerson.phone || null, churchId }
      })
      const enrollment = await prisma.baptismCourseEnrollment.create({
        data: { memberId: member.id, courseId: params.id, status: 'ONGOING' }
      })
      return created({ enrollment, member })
    }

    return error('Données invalides')
  } catch (err) { return serverError(err) }
}

// PATCH — changer le statut d'un ou plusieurs inscrits
// Corps : { enrollmentId: string, status: 'ONGOING'|'COMPLETED'|'DROPPED' }
// ou     : { memberIds: string[], status: string } pour mise à jour en masse
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const { enrollmentId, memberIds, status } = await req.json()

    if (!status) return error('Statut requis')

    if (enrollmentId) {
      const enrollment = await prisma.baptismCourseEnrollment.update({
        where: { id: enrollmentId },
        data:  { status }
      })
      return ok(enrollment)
    }

    if (memberIds?.length) {
      await prisma.baptismCourseEnrollment.updateMany({
        where: { courseId: params.id, memberId: { in: memberIds } },
        data:  { status }
      })
      return ok({ updated: memberIds.length })
    }

    return error('enrollmentId ou memberIds requis')
  } catch (err) { return serverError(err) }
}