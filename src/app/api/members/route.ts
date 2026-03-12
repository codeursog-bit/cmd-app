import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, error, serverError, parsePagination } from '@/lib/api'

// GET /api/members?churchId=&search=&dept=&status=&gender=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const url = new URL(req.url)
    const { skip, limit, page } = parsePagination(url)

    const churchId = url.searchParams.get('churchId') || session.churchId
    const search   = url.searchParams.get('search') || ''
    const dept     = url.searchParams.get('dept')
    const status   = url.searchParams.get('status')
    const gender   = url.searchParams.get('gender')

    const where: any = { churchId }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName:  { contains: search, mode: 'insensitive' } },
        { email:     { contains: search, mode: 'insensitive' } },
        { phone:     { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status === 'active')   where.isActive = true
    if (status === 'inactive') where.isActive = false
    if (gender === 'MALE')     where.gender = 'MALE'
    if (gender === 'FEMALE')   where.gender = 'FEMALE'
    if (dept)  where.departments = { some: { department: { name: { contains: dept, mode: 'insensitive' } } } }

    const [total, members] = await Promise.all([
      prisma.member.count({ where }),
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          departments: { include: { department: { select: { id: true, name: true, color: true } } } },
          baptisms:    { select: { id: true, baptismType: true, baptismDate: true }, orderBy: { baptismDate: 'desc' }, take: 1 },
          _count:      { select: { attendances: true } },
        },
      }),
    ])

    return ok({ members, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    return serverError(err)
  }
}

// POST /api/members
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body    = await req.json()

    const { firstName, lastName, gender, birthDate, phone, email, address, notes,
            departmentIds, churchId } = body

    if (!firstName || !lastName) return error('Prénom et nom requis')

    const targetChurchId = churchId || session.churchId
    if (!targetChurchId) return error('Église requise')

    const member = await prisma.member.create({
      data: {
        firstName, lastName,
        gender:    gender || undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        phone, email, address, notes,
        churchId:  targetChurchId,
      },
    })

    if (departmentIds?.length) {
      await prisma.memberDepartment.createMany({
        data: departmentIds.map((id: string) => ({ memberId: member.id, departmentId: id })),
        skipDuplicates: true,
      })
    }

    const full = await prisma.member.findUnique({
      where: { id: member.id },
      include: { departments: { include: { department: true } } },
    })

    return created(full)
  } catch (err) {
    return serverError(err)
  }
}
