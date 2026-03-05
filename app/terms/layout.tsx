import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Lighthouse Ledger',
  description: 'Terms of Service for Lighthouse Ledger - evidence-first capability record and review system.',
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
