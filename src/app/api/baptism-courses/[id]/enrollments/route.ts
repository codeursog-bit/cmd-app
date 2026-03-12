import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, error, serverError } from '@/lib/api'
type Ctx = { params: { id: string } }
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const { memberIds } = await req.json()
    if (!memberIds?.length) return error('Membres requis')
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
  } catch (err) { return serverError(err) }
}
