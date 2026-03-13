import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'
import { error, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return error('Email et mot de passe requis')

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        churches: { include: { church: true }, take: 1 },
        organisation: true,
      },
    })

    if (!user || !user.isActive) return error('Identifiants invalides', 401)

    const valid = await comparePassword(password, user.password)
    if (!valid) return error('Identifiants invalides', 401)

    const primaryChurch = user.churches[0]?.church

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      churchId: primaryChurch?.id,
      organisationId: user.organisationId ?? undefined,
    })

    const res = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
          church: primaryChurch ? { id: primaryChurch.id, name: primaryChurch.name } : null,
        },
        token,
      },
    })

    res.cookies.set('cmdg_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return res
  } catch (err) {
    return serverError(err)
  }
}
