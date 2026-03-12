'use client'
import { useState, useEffect, useCallback } from 'react'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(url: string | null, options?: RequestInit) {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: !!url, error: null })

  const fetchData = useCallback(async () => {
    if (!url) return
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch(url, { ...options, credentials: 'include' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur serveur')
      setState({ data: json.data, loading: false, error: null })
    } catch (e: any) {
      setState({ data: null, loading: false, error: e.message })
    }
  }, [url])

  useEffect(() => { fetchData() }, [fetchData])

  return { ...state, refetch: fetchData }
}

/** Mutation helper (POST/PATCH/DELETE) */
export async function apiFetch<T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status === 204) return { data: null, error: null }
    const json = await res.json()
    if (!res.ok) return { data: null, error: json.error || 'Erreur serveur' }
    return { data: json.data, error: null }
  } catch (e: any) {
    return { data: null, error: e.message }
  }
}
