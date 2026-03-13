import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'CMD — Communauté des Messagers de Dieu',
  description: "Portail officiel de la Communauté des Messagers de Dieu",
  icons: { icon: '/logo-cmd.png', apple: '/logo-cmd.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
