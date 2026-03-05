import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Lighthouse Ledger',
  description: 'Privacy Policy for Lighthouse Ledger - how we collect, use, share and protect your personal data.',
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
