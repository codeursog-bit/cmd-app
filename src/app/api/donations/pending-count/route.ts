import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ok, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    // Seul le SUPER_ADMIN reçoit le badge dons
    if (!session || session.role !== 'SUPER_ADMIN') return ok({ count: 0 })
    const count = await prisma.donation.count({ where: { status: 'PENDING' } })
    return ok({ count })
  } catch (err) { return serverError(err) }
}
