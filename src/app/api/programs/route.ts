import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, error, serverError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const url = new URL(req.url)
    const churchId  = url.searchParams.get('churchId') || session.churchId
    const activeOnly = url.searchParams.get('active') !== 'false'

    const programs = await prisma.program.findMany({
      where: { churchId: churchId!, ...(activeOnly ? { isActive: true } : {}) },
      include: { department: { select: { id: true, name: true } } },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })
    return ok(programs)
  } catch (err) {
    return serverError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { title, description, dayOfWeek, startTime, endTime, location, departmentId, churchId } = await req.json()
    if (!title) return error('Titre requis')
    const program = await prisma.program.create({
      data: {
        title, description,
        dayOfWeek: dayOfWeek ?? null,
        startTime, endTime, location,
        departmentId: departmentId || null,
        churchId: churchId || session.churchId!,
      },
      include: { department: { select: { id: true, name: true } } },
    })
    return created(program)
  } catch (err) {
    return serverError(err)
  }
}
