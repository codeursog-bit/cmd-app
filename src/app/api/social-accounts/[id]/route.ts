import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, noContent, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const data = await req.json()
    const acc = await prisma.socialAccount.update({ where: { id: params.id }, data,
      select: { id: true, platform: true, accountName: true, isActive: true } })
    return ok(acc)
  } catch (err) { return serverError(err) }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    await prisma.socialAccount.delete({ where: { id: params.id } })
    return noContent()
  } catch (err) { return serverError(err) }
}
