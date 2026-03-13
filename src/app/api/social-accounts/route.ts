import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, error, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const churchId = new URL(req.url).searchParams.get('churchId') || session.churchId
    const accounts = await prisma.socialAccount.findMany({
      where: { churchId: churchId! },
      select: { id: true, platform: true, accountName: true, isActive: true, expiresAt: true, createdAt: true },
      orderBy: { platform: 'asc' },
    })
    return ok(accounts)
  } catch (err) { return serverError(err) }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { platform, accountName, accessToken, refreshToken, expiresAt, churchId } = await req.json()
    if (!platform || !accessToken) return error('Plateforme et token requis')
    const account = await prisma.socialAccount.upsert({
      where: { churchId_platform: { churchId: churchId || session.churchId!, platform } },
      update: { accountName, accessToken, refreshToken, expiresAt: expiresAt ? new Date(expiresAt) : null, isActive: true },
      create: { platform, accountName, accessToken, refreshToken, expiresAt: expiresAt ? new Date(expiresAt) : null, churchId: churchId || session.churchId! },
      select: { id: true, platform: true, accountName: true, isActive: true },
    })
    return created(account)
  } catch (err) { return serverError(err) }
}
