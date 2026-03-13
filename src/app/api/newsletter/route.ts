import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, error, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

// POST /api/newsletter — inscription
export async function POST(req: NextRequest) {
  try {
    const { email, firstName } = await req.json()
    if (!email || !email.includes('@')) return error('Email invalide')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any
    const existing = await db.newsletterSubscriber.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      if (existing.isActive) return error('Cet email est déjà inscrit')
      // Réactiver si désinscrit
      await db.newsletterSubscriber.update({ where: { email: email.toLowerCase() }, data: { isActive: true, firstName } })
      return ok({ message: 'Inscription réactivée' })
    }

    await db.newsletterSubscriber.create({
      data: { email: email.toLowerCase(), firstName: firstName || null }
    })
    return ok({ message: 'Inscription réussie' })
  } catch (err) {
    return serverError(err)
  }
}

// GET /api/newsletter — liste (admin seulement)
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db2 = prisma as any
    const subscribers = await db2.newsletterSubscriber.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    return ok({ subscribers, total: subscribers.length })
  } catch (err) {
    return serverError(err)
  }
}
