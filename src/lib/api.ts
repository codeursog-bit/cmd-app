import { NextResponse } from 'next/server'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function created<T>(data: T) {
  return ok(data, 201)
}

export function noContent() {
  return new NextResponse(null, { status: 204 })
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function unauthorized() {
  return error('Non autorisé', 401)
}

export function forbidden() {
  return error('Accès refusé', 403)
}

export function notFound(resource = 'Ressource') {
  return error(`${resource} introuvable`, 404)
}

export function serverError(err: unknown) {
  console.error(err)
  const message = err instanceof Error ? err.message : 'Erreur serveur'
  if (message === 'UNAUTHORIZED') return unauthorized()
  return error(message, 500)
}

/** Wrap a route handler with error catching */
export function withError(handler: (...args: any[]) => Promise<NextResponse>) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (err: unknown) {
      return serverError(err)
    }
  }
}

/** Parse pagination from URL */
export function parsePagination(url: URL) {
  const page  = Math.max(1, parseInt(url.searchParams.get('page')  || '1'))
  const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '20'))
  const skip  = (page - 1) * limit
  return { page, limit, skip }
}
