import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, error, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()
    if (!name || !email || !message) return error('Nom, email et message requis')

    const contact = await prisma.contactMessage.create({
      data: { name, email, subject: subject || null, message }
    })

    return ok({ message: 'Message envoyé avec succès', id: contact.id })
  } catch (err) {
    return serverError(err)
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page   = parseInt(searchParams.get('page') || '1')
    const limit  = parseInt(searchParams.get('limit') || '20')
    const skip   = (page - 1) * limit

    const where = status ? { status: status as 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED' } : {}

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.contactMessage.count({ where }),
    ])

    const unreadCount = await prisma.contactMessage.count({ where: { status: 'UNREAD' } })

    return ok({ messages, total, page, limit, unreadCount })
  } catch (err) {
    return serverError(err)
  }
}
