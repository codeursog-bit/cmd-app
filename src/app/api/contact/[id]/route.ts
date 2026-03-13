import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, notFound, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json()
    const msg = await prisma.contactMessage.update({
      where: { id: params.id },
      data: { status },
    })
    return ok(msg)
  } catch (err) {
    return serverError(err)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.contactMessage.delete({ where: { id: params.id } })
    return ok({ deleted: true })
  } catch (err) {
    return serverError(err)
  }
}
