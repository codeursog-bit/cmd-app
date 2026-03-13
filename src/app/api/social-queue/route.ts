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
    const status = url.searchParams.get('status')

    const where: any = { socialAccount: { church: { users: { some: { userId: session.userId } } } } }
    if (status) where.status = status

    const [total, queue] = await Promise.all([
      prisma.socialPublishQueue.count({ where }),
      prisma.socialPublishQueue.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          socialAccount: { select: { platform: true, accountName: true } },
          post:  { select: { id: true, title: true, slug: true } },
          event: { select: { id: true, title: true } },
        },
      }),
    ])
    return ok({ queue, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) { return serverError(err) }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth()
    const { socialAccountIds, content, mediaUrls, scheduledAt, postId, eventId } = await req.json()
    if (!socialAccountIds?.length || !content) return error('Comptes et contenu requis')

    const items = await Promise.all(
      socialAccountIds.map((id: string) =>
        prisma.socialPublishQueue.create({
          data: {
            socialAccountId: id,
            content,
            mediaUrls: mediaUrls || [],
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            postId: postId || null,
            eventId: eventId || null,
            status: scheduledAt ? 'PENDING' : 'PENDING',
          },
        })
      )
    )
    return created({ count: items.length, items })
  } catch (err) { return serverError(err) }
}
