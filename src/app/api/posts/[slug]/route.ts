import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/auth'
import { ok, noContent, notFound, serverError } from '@/lib/api'

type Ctx = { params: { slug: string } }

export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    const session = await getSession()
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        tags:   { include: { tag: true } },
        church: { select: { id: true, name: true } },
      },
    })
    if (!post) return notFound('Article')
    if (post.status !== 'PUBLISHED' && !session) return notFound('Article')

    // Incrémenter les vues
    if (post.status === 'PUBLISHED') {
      await prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } })
    }
    return ok(post)
  } catch (err) {
    return serverError(err)
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const body = await req.json()
    const { tagNames, ...data } = body

    const post = await prisma.post.update({
      where: { slug: params.slug },
      data: {
        ...data,
        publishedAt: data.status === 'PUBLISHED' ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : undefined,
      },
    })

    if (tagNames !== undefined) {
      await prisma.postTag.deleteMany({ where: { postId: post.id } })
      for (const name of tagNames) {
        const tagSlug = name.toLowerCase().replace(/\s+/g, '-')
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug }, update: {},
          create: { name, slug: tagSlug },
        })
        await prisma.postTag.create({ data: { postId: post.id, tagId: tag.id } })
      }
    }
    return ok(post)
  } catch (err) {
    return serverError(err)
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    await prisma.post.delete({ where: { slug: params.slug } })
    return noContent()
  } catch (err) {
    return serverError(err)
  }
}
