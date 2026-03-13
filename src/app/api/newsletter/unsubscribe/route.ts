import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, error, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return error('Email requis')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any
    await db.newsletterSubscriber.updateMany({
      where: { email: email.toLowerCase() },
      data: { isActive: false }
    })
    return ok({ message: 'Désinscription effectuée' })
  } catch (err) {
    return serverError(err)
  }
}
