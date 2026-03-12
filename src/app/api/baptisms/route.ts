import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, error, serverError, parsePagination } from '@/lib/api'
import { certNumber } from '@/lib/slugify'

// GET /api/baptisms?churchId=&type=&search=&page=
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const url     = new URL(req.url)
    const { skip, limit, page } = parsePagination(url)

    const churchId = url.searchParams.get('churchId') || session.churchId
    const type     = url.searchParams.get('type')
    const search   = url.searchParams.get('search')
    const month    = url.searchParams.get('month')
    const year     = url.searchParams.get('year')

    const where: any = { member: { churchId } }
    if (type === 'WATER')        where.baptismType = 'WATER'
    if (type === 'HOLY_SPIRIT')  where.baptismType = 'HOLY_SPIRIT'
    if (search) {
      where.member = {
        ...where.member,
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName:  { contains: search, mode: 'insensitive' } },
        ],
      }
    }
    if (year) {
      const y = parseInt(year)
      where.baptismDate = {
        gte: new Date(y, month ? parseInt(month) - 1 : 0, 1),
        lt:  new Date(y, month ? parseInt(month) : 12, 1),
      }
    }

    const [total, baptisms] = await Promise.all([
      prisma.baptism.count({ where }),
      prisma.baptism.findMany({
        where,
        skip, take: limit,
        orderBy: { baptismDate: 'desc' },
        include: {
          member: { select: { id: true, firstName: true, lastName: true, photoUrl: true, gender: true } },
        },
      }),
    ])

    // Stats
    const stats = await prisma.baptism.groupBy({
      by: ['baptismType'],
      where: { member: { churchId } },
      _count: true,
    })

    return ok({ baptisms, total, page, totalPages: Math.ceil(total / limit), stats })
  } catch (err) {
    return serverError(err)
  }
}

// POST /api/baptisms
export async function POST(req: NextRequest) {
  try {
    await requireAuth()
    const { memberId, baptismType, baptismDate, officiant, location, notes } = await req.json()

    if (!memberId || !baptismDate) return error('Membre et date requis')

    const baptism = await prisma.baptism.create({
      data: {
        memberId,
        baptismType: baptismType || 'WATER',
        baptismDate: new Date(baptismDate),
        officiant,
        location,
        notes,
        certificateNo: certNumber(),
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return created(baptism)
  } catch (err) {
    return serverError(err)
  }
}
