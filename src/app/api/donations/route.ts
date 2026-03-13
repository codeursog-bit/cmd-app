import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ok, created, error, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return error('Non autorisé', 401)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page   = parseInt(searchParams.get('page') || '1')
    const limit  = parseInt(searchParams.get('limit') || '20')
    const skip   = (page - 1) * limit

    // Seul le SUPER_ADMIN voit tous les dons (ils vont tous à son église de toute façon)
    // Un pasteur ne peut pas accéder à cette page — on renvoie vide
    if (session.role !== 'SUPER_ADMIN') return error('Accès réservé au Berger Principal', 403)

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.donation.count({ where }),
    ])
    const stats = await prisma.donation.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { amount: true }, _count: true,
    })
    return ok({ donations, total, page, limit, stats: { total: stats._sum.amount || 0, count: stats._count } })
  } catch (err) { return serverError(err) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, currency, donorName, donorEmail, donorPhone, donorMessage, purpose, paymentMethod } = body

    if (!amount || !donorName || !donorEmail) return error('Champs requis manquants')

    // L'église principale est définie côté serveur — un visiteur ne peut pas choisir une autre église
    const mainChurchId = process.env.MAIN_CHURCH_ID
    if (!mainChurchId) return error('Page de don non configurée. Contactez l\'administrateur.')

    // Vérifier que l'église existe et appartient bien au berger principal
    const church = await prisma.church.findFirst({
      where: { id: mainChurchId },
      include: { pastor: { select: { role: true } } }
    })
    if (!church) return error('Église introuvable')

    const reference = `DON-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`
    const donation = await prisma.donation.create({
      data: { amount: parseFloat(amount), currency: currency || 'USD', donorName, donorEmail, donorPhone, donorMessage, purpose, paymentMethod, reference, churchId: mainChurchId }
    })
    return created(donation)
  } catch (err) { return serverError(err) }
}
