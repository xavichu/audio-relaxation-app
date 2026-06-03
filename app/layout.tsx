import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '../components/AuthProvider'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const title = 'Serenity – Sleep, Focus & Relax'
const description =
  'A beautiful ambient sound mixer with sleep timer and breathing guide. Mix rain, ocean, fire and binaural beats. Start free, upgrade anytime.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s · Serenity',
  },
  description,
  applicationName: 'Serenity',
  keywords: [
    'relaxation',
    'ambient sounds',
    'white noise',
    'sleep sounds',
    'focus',
    'binaural beats',
    'meditation',
    'breathing exercise',
  ],
  authors: [{ name: 'Serenity' }],
  openGraph: {
    type: 'website',
    url: siteUrl,
    title,
    description,
    siteName: 'Serenity',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#0f0c29',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
