'use client'

import { Hero } from './Hero'
import { TrustSignals } from './TrustSignals'
import { Features } from './Features'
import { MicroCTA } from './MicroCTA'
import { Philosophy } from './Philosophy'
import { LedgerPreview } from './LedgerPreview'
import { HowItWorks } from './HowItWorks'
import { FinalCTA } from './FinalCTA'
import { StickyCTA } from './StickyCTA'

export function Home() {
  return (
    <main className="min-w-0 w-full overflow-x-hidden">
      <Hero />
      <TrustSignals />
      <Features />
      <MicroCTA />
      <Philosophy />
      <LedgerPreview />
      <HowItWorks />
      <FinalCTA />
      <StickyCTA />
    </main>
  )
}
