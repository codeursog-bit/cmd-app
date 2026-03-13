'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function UnsubscribePage() {
  const params = useSearchParams()
  const email = params.get('email') || ''
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!email) { setState('error'); return }
    fetch('/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then(r => r.json())
      .then(d => setState(d.success ? 'success' : 'error'))
      .catch(() => setState('error'))
  }, [email])

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
        {state === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-neutral-500">Désinscription en cours...</p>
          </div>
        )}
        {state === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-neutral-900 mb-3">Désinscription confirmée</h1>
            <p className="text-neutral-500 text-sm mb-6">Vous ne recevrez plus d'emails de la newsletter CMD.</p>
            <Link href="/" className="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors">
              Retour au site
            </Link>
          </>
        )}
        {state === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-neutral-900 mb-3">Une erreur est survenue</h1>
            <p className="text-neutral-500 text-sm mb-6">Impossible de traiter votre demande. Essayez à nouveau.</p>
            <Link href="/" className="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors">
              Retour au site
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
