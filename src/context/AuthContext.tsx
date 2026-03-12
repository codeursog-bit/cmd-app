'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface SessionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  avatarUrl?: string | null
  church?: { id: string; name: string } | null
}

interface AuthCtx {
  user: SessionUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({
  user: null, loading: true,
  login: async () => null,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data) setUser(j.data) })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string): Promise<string | null> => {
    const res  = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }), credentials: 'include' })
    const json = await res.json()
    if (!res.ok) return json.error || 'Identifiants invalides'
    setUser(json.data.user)
    return null
  }

  const logout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE', credentials: 'include' })
    setUser(null)
    router.push('/login')
  }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
