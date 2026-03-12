import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, noContent, notFound, serverError } from '@/lib/api'

type Ctx = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const prog = await prisma.program.findUnique({ where: { id: params.id }, include: { department: true } })
    if (!prog) return notFound('Programme')
    return ok(prog)
  } catch (err) { return serverError(err) }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    const data = await req.json()
    const prog = await prisma.program.update({ where: { id: params.id }, data })
    return ok(prog)
  } catch (err) { return serverError(err) }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    await requireAuth()
    await prisma.program.delete({ where: { id: params.id } })
    return noContent()
  } catch (err) { return serverError(err) }
}
