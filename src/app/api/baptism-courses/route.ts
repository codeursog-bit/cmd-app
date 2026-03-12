import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'
import { ok, created, error, serverError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return error('Non autorisé', 401)
    const { searchParams } = new URL(req.url)
    const churchId = searchParams.get('churchId') || session.churchId
    const courses = await prisma.baptismCourse.findMany({
      where: churchId ? { churchId } : {},
      include: { _count: { select: { enrollments: true, sessions: true } } },
      orderBy: { startDate: 'desc' }
    })
    return ok({ courses })
  } catch (err) { return serverError(err) }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { title, description, startDate, endDate, location, teacherName, churchId } = await req.json()
    if (!title || !startDate) return error('Titre et date de début requis')
    const course = await prisma.baptismCourse.create({
      data: { title, description, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, location, teacherName, churchId: churchId || session.churchId! }
    })
    return created(course)
  } catch (err) { return serverError(err) }
}
