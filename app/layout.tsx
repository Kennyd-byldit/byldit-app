import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BYLDit.ai — Turn stalled dreams into finished builds',
  description: 'AI-powered vehicle build and restoration platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
