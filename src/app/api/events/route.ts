import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, error, serverError } from '@/lib/api'
import { uniqueSlug } from '@/lib/slugify'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search   = searchParams.get('search') || ''
    const status   = searchParams.get('status')
    const churchId = searchParams.get('churchId')
    const page     = parseInt(searchParams.get('page') || '1')
    const limit    = parseInt(searchParams.get('limit') || '20')
    const skip     = (page - 1) * limit
    const where: Record<string, unknown> = {}
    if (search)   where.OR = [{ title: { contains: search, mode: 'insensitive' } }]
    if (status)   where.status = status
    if (churchId) where.churchId = churchId
    const [events, total] = await Promise.all([
      prisma.event.findMany({ where, include: { church: { select: { id: true, name: true } }, _count: { select: { attendances: true } }, media: true }, orderBy: { startDate: 'desc' }, skip, take: limit }),
      prisma.event.count({ where }),
    ])
    return ok({ events, total, page, limit })
  } catch (err) { return serverError(err) }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { title, description, content, coverUrl, audioUrl, videoUrl, location, onlineUrl, startDate, endDate, status, churchId } = await req.json()
    if (!title || !startDate) return error('Titre et date de début requis')
    const slug = uniqueSlug(title)
    const event = await prisma.event.create({
      data: { title, description, content, coverUrl, audioUrl, videoUrl, location, onlineUrl, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, status: status || 'UPCOMING', slug, churchId: churchId || session.churchId! }
    })
    return created(event)
  } catch (err) { return serverError(err) }
}
