import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../components/AuthProvider'

export const metadata: Metadata = {
  title: 'Serenity – Sleep, Focus & Relax',
  description: 'A beautiful ambient sound mixer with sleep timer and breathing guide. Start free, upgrade anytime.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
