import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'
import { ok, created, error, serverError } from '@/lib/api'
import { uniqueSlug } from '@/lib/slugify'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const session  = await getSession()
    const search   = searchParams.get('search') || ''
    const type     = searchParams.get('type')
    const status   = searchParams.get('status')
    const churchId = searchParams.get('churchId')
    const page     = parseInt(searchParams.get('page') || '1')
    const limit    = parseInt(searchParams.get('limit') || '20')
    const skip     = (page - 1) * limit
    const where: Record<string, unknown> = {}
    if (search)   where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { excerpt: { contains: search, mode: 'insensitive' } }]
    if (type)     where.type = type
    if (status)   where.status = status
    else if (!session) where.status = 'PUBLISHED'
    if (churchId) where.churchId = churchId
    const [posts, total] = await Promise.all([
      prisma.post.findMany({ where, include: { author: { select: { id: true, firstName: true, lastName: true } }, tags: { include: { tag: true } }, media: true }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.post.count({ where }),
    ])
    return ok({ posts, total, page, limit })
  } catch (err) { return serverError(err) }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { title, excerpt, content, coverUrl, audioUrl, videoUrl, type, status, churchId, tagNames } = await req.json()
    if (!title || !content) return error('Titre et contenu requis')
    const slug = uniqueSlug(title)
    const post = await prisma.post.create({
      data: { title, excerpt, content, coverUrl, audioUrl, videoUrl, type: type || 'ARTICLE', status: status || 'DRAFT', slug, authorId: session.userId, churchId: churchId || session.churchId, publishedAt: status === 'PUBLISHED' ? new Date() : undefined }
    })
    if (tagNames?.length) {
      for (const name of tagNames) {
        const tagSlug = name.toLowerCase().replace(/\s+/g, '-')
        const tag = await prisma.tag.upsert({ where: { slug: tagSlug }, update: {}, create: { name, slug: tagSlug } })
        await prisma.postTag.create({ data: { postId: post.id, tagId: tag.id } })
      }
    }
    return created(post)
  } catch (err) { return serverError(err) }
}
