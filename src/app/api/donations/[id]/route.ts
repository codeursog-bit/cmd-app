import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ok, error, serverError } from '@/lib/api'
type Ctx = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPER_ADMIN') return error('Accès réservé au Berger Principal', 403)
    const { status } = await req.json()
    const d = await prisma.donation.update({
      where: { id: params.id },
      data: { status, confirmedAt: status === 'CONFIRMED' ? new Date() : undefined }
    })
    return ok(d)
  } catch (err) { return serverError(err) }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPER_ADMIN') return error('Accès réservé au Berger Principal', 403)
    await prisma.donation.delete({ where: { id: params.id } })
    return ok({ deleted: true })
  } catch (err) { return serverError(err) }
}
