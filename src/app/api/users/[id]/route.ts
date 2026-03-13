import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, hashPassword } from '@/lib/auth'
import { ok, noContent, notFound, forbidden, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    const session = await requireAuth()
    if (session.userId !== params.id && !['SUPER_ADMIN','PASTOR'].includes(session.role)) return forbidden()
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, phone: true, avatarUrl: true, isActive: true, createdAt: true,
        churches: { include: { church: { select: { id: true, name: true } } } },
      },
    })
    if (!user) return notFound('Utilisateur')
    return ok(user)
  } catch (err) { return serverError(err) }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const session = await requireAuth()
    if (session.userId !== params.id && !['SUPER_ADMIN','PASTOR'].includes(session.role)) return forbidden()
    const { password, ...data } = await req.json()
    const updateData: any = { ...data }
    if (password) updateData.password = await hashPassword(password)
    const user = await prisma.user.update({ where: { id: params.id }, data: updateData,
      select: { id: true, email: true, firstName: true, lastName: true, role: true } })
    return ok(user)
  } catch (err) { return serverError(err) }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    const session = await requireAuth()
    if (!['SUPER_ADMIN','PASTOR'].includes(session.role)) return forbidden()
    await prisma.user.delete({ where: { id: params.id } })
    return noContent()
  } catch (err) { return serverError(err) }
}
