import type { Metadata } from 'next'
import { Nunito, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800', '900'],
  variable: '--font-nunito',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['800'],
  style: ['italic'],
  variable: '--font-barlow',
})

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
      <body className={`${nunito.variable} ${barlowCondensed.variable}`}>
        {children}
      </body>
    </html>
  )
}
