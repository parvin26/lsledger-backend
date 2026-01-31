import React from 'react'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
