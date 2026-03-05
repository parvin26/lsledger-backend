import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact us | Lighthouse Ledger',
  description: 'Contact the Lighthouse Ledger team - info@lhledger.com',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
