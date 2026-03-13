import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, error, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://votre-domaine.vercel.app'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

function buildEmailHtml(post: {
  title: string; excerpt: string | null; type: string; slug: string;
  coverUrl: string | null; author: { firstName: string; lastName: string }
}, email: string) {
  const postUrl = `${APP_URL}/blog/${post.slug}`
  const unsubUrl = `${APP_URL}/unsubscribe?email=${encodeURIComponent(email)}`
  const typeLabels: Record<string, string> = {
    ARTICLE: 'Article', SERMON: 'Prédication', TESTIMONY: 'Témoignage', ANNOUNCEMENT: 'Annonce'
  }
  const typeLabel = typeLabels[post.type] || post.type
  const authorName = `${post.author.firstName} ${post.author.lastName}`

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${post.title}</title></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:#0a1628;padding:32px 40px;border-radius:12px 12px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td>
              <div style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:2px;">✝ CMD</div>
              <div style="color:#6b93d6;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Communauté des Messagers de Dieu</div>
            </td>
            <td align="right">
              <span style="background:#1e3a5f;color:#6b93d6;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:6px 14px;border-radius:20px;">${typeLabel}</span>
            </td>
          </tr></table>
        </td></tr>
        ${post.coverUrl ? `<tr><td><img src="${post.coverUrl}" alt="${post.title}" width="600" style="width:100%;max-height:280px;object-fit:cover;display:block;" /></td></tr>` : ''}
        <tr><td style="background:#ffffff;padding:48px 40px;">
          <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#0a1628;line-height:1.3;">${post.title}</h1>
          <p style="margin:0 0 24px;color:#4a5568;font-size:14px;">Par <strong style="color:#0a1628;">${authorName}</strong></p>
          ${post.excerpt ? `<p style="margin:0 0 32px;color:#374151;font-size:16px;line-height:1.7;border-left:4px solid #3b82f6;padding-left:20px;">${post.excerpt}</p>` : ''}
          <a href="${postUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:8px;font-size:15px;font-weight:700;">
            Lire la publication →
          </a>
        </td></tr>
        <tr><td style="background:#ffffff;padding:0 40px;"><div style="height:1px;background:#e5e7eb;"></div></td></tr>
        <tr><td style="background:#ffffff;padding:28px 40px 40px;border-radius:0 0 12px 12px;">
          <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;text-align:center;">Vous recevez cet email car vous êtes abonné à la newsletter CMD.</p>
          <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
            <a href="${unsubUrl}" style="color:#6b7280;text-decoration:underline;">Se désinscrire</a>
            &nbsp;·&nbsp;
            <a href="${APP_URL}" style="color:#6b7280;text-decoration:underline;">Visiter notre site</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth()
    const { postSlug } = await req.json()
    if (!postSlug) return error('postSlug requis')

    const post = await prisma.post.findUnique({
      where: { slug: postSlug },
      include: { author: { select: { firstName: true, lastName: true } } }
    })
    if (!post) return error('Publication introuvable')
    if (post.status !== 'PUBLISHED') return error('La publication doit être publiée')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any
    const subscribers: { email: string }[] = await db.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true }
    })
    if (subscribers.length === 0) return error('Aucun abonné actif')

    if (!process.env.RESEND_API_KEY) return error('RESEND_API_KEY non configuré')

    // Import dynamique pour éviter les erreurs si resend pas installé localement
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    let sent = 0
    let failed = 0

    // Envoi par batch de 50
    for (let i = 0; i < subscribers.length; i += 50) {
      const batch = subscribers.slice(i, i + 50)
      const results = await Promise.allSettled(
        batch.map((sub: { email: string }) =>
          resend.emails.send({
            from: `CMD Newsletter <${FROM_EMAIL}>`,
            to: sub.email,
            subject: `📖 ${post.title} — CMD`,
            html: buildEmailHtml(post, sub.email),
          })
        )
      )
      results.forEach(r => r.status === 'fulfilled' ? sent++ : failed++)
    }

    return ok({ sent, failed, total: subscribers.length })
  } catch (err) {
    return serverError(err)
  }
}
