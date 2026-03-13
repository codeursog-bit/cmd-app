import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, error, serverError, parsePagination } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const url = new URL(req.url)
    const { skip, limit, page } = parsePagination(url)
    const eventId  = url.searchParams.get('eventId')
    const memberId = url.searchParams.get('memberId')
    const churchId = url.searchParams.get('churchId') || session.churchId

    const where: any = { member: { churchId } }
    if (eventId)  where.eventId  = eventId
    if (memberId) where.memberId = memberId

    const [total, attendances] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.findMany({
        where, skip, take: limit,
        orderBy: { date: 'desc' },
        include: {
          member: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
          event:  { select: { id: true, title: true, startDate: true } },
        },
      }),
    ])
    return ok({ attendances, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    return serverError(err)
  }
}

// POST - enregistrer présences en bulk pour un événement
export async function POST(req: NextRequest) {
  try {
    await requireAuth()
    const { eventId, date, records } = await req.json()
    // records: [{ memberId, isPresent, note }]
    if (!records?.length) return error('Aucun enregistrement fourni')

    const attendanceDate = date ? new Date(date) : new Date()

    const results = await Promise.all(
      records.map(async (r: { memberId: string; isPresent?: boolean; note?: string }) => {
        return prisma.attendance.upsert({
          where: { memberId_eventId_date: { memberId: r.memberId, eventId: eventId || null, date: attendanceDate } },
          update: { isPresent: r.isPresent ?? true, note: r.note },
          create: { memberId: r.memberId, eventId: eventId || null, date: attendanceDate, isPresent: r.isPresent ?? true, note: r.note },
        })
      })
    )

    return created({ count: results.length, attendances: results })
  } catch (err) {
    return serverError(err)
  }
}
