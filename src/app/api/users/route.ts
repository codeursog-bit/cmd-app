import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, error, forbidden, serverError } from '@/lib/api'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const url = new URL(req.url)
    const churchId = url.searchParams.get('churchId') || session.churchId
    const search   = url.searchParams.get('search') || ''

    const where: any = {
      churches: { some: { churchId } },
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName:  { contains: search, mode: 'insensitive' } },
        { email:     { contains: search, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, avatarUrl: true, createdAt: true,
        churches: { where: { churchId: churchId! }, select: { role: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return ok(users)
  } catch (err) {
    return serverError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (!['SUPER_ADMIN', 'PASTOR'].includes(session.role)) return forbidden()

    const { email, password, firstName, lastName, phone, role, churchId } = await req.json()
    if (!email || !password || !firstName || !lastName) return error('Champs requis manquants')

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return error('Cet email est déjà utilisé')

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: await hashPassword(password),
        firstName, lastName, phone,
        role: role || 'SECRETARY',
        organisationId: session.organisationId,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    })

    const targetChurchId = churchId || session.churchId
    if (targetChurchId) {
      await prisma.userChurch.create({
        data: { userId: user.id, churchId: targetChurchId, role: role || 'SECRETARY' },
      })
    }

    return created(user)
  } catch (err) {
    return serverError(err)
  }
}
