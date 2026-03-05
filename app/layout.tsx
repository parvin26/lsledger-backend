import React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { BetaNotice } from '@/app/components/BetaNotice'
import { Header } from '@/app/components/landing/Header'
import { Footer } from '@/app/components/landing/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Lighthouse Ledger',
  description: 'Learning record and review system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen flex flex-col font-sans antialiased w-full overflow-x-hidden`} style={{ backgroundColor: '#ffffff', color: 'var(--color-deep-slate)' }}>
        <Header />
        <div className="flex-grow pt-20 min-w-0 w-full">{children}</div>
        <Footer />
        <BetaNotice />
      </body>
    </html>
  )
}
