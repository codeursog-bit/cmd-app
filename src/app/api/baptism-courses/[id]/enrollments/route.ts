import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, getSession } from '@/lib/auth'
import { ok, created, error, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'
type Ctx = { params: { id: string } }

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const session = await requireAuth()
    const { memberIds, newPerson } = await req.json()

    // Cas 1 : inscrire des membres existants
    if (memberIds?.length) {
      const enrollments = await Promise.all(
        memberIds.map((memberId: string) =>
          prisma.baptismCourseEnrollment.upsert({
            where: { memberId_courseId: { memberId, courseId: params.id } },
            update: {},
            create: { memberId, courseId: params.id, status: 'ONGOING' }
          })
        )
      )
      return created({ enrollments })
    }

    // Cas 2 : créer un membre à la volée (sans compte, juste prénom/nom)
    if (newPerson?.firstName && newPerson?.lastName) {
      const course = await prisma.baptismCourse.findUnique({ where: { id: params.id } })
      if (!course) return error('Cours introuvable')

      const churchId = course.churchId || session.churchId
      if (!churchId) return error('Église introuvable')

      const member = await prisma.member.create({
        data: {
          firstName: newPerson.firstName,
          lastName:  newPerson.lastName,
          phone:     newPerson.phone || null,
          churchId,
        }
      })

      const enrollment = await prisma.baptismCourseEnrollment.create({
        data: { memberId: member.id, courseId: params.id, status: 'ONGOING' }
      })

      return created({ enrollment, member })
    }

    return error('Données invalides')
  } catch (err) { return serverError(err) }
}