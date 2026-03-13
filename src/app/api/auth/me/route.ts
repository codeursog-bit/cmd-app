import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

// GET /api/auth/me
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, avatarUrl: true, phone: true,
        churches: { include: { church: { select: { id: true, name: true, city: true } } } },
        organisation: { select: { id: true, name: true } },
      },
    })
    if (!user) return unauthorized()

    return ok(user)
  } catch (err) {
    return serverError(err)
  }
}

// DELETE /api/auth/me → logout
export async function DELETE() {
  const res = NextResponse.json({ success: true }, { status: 204 })
  res.cookies.set('cmdg_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return res
}
