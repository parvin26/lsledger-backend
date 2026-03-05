'use client'

import { motion } from 'motion/react'
import { Check, X, ArrowRight } from 'lucide-react'
import { FinalCTA } from '@/app/components/landing/FinalCTA'

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1120px] mx-auto py-20 px-4 md:px-8"
        style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}
      >
        {/* Intro Block */}
        <section className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-7" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: 'var(--color-lighthouse-navy)' }}>
              About Lighthouse Ledger
            </h1>
            <p className="text-xl md:text-2xl leading-relaxed" style={{ color: 'var(--color-deep-slate)' }}>
              Why this system exists and who it is for.
            </p>
            <p className="text-lg leading-relaxed pt-4" style={{ color: 'var(--color-deep-slate)' }}>
              Lighthouse Ledger was created for people whose most important learning does not happen in classrooms. Founders, MSME owners, youth, and self-taught builders learn through work, experiments, and community projects.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="bg-white p-8 rounded-xl shadow-sm" style={{ border: '1px solid var(--color-divider)' }}>
              <h3 className="text-lg font-semibold mb-4 pb-2" style={{ color: 'var(--color-lighthouse-navy)', borderBottom: '1px solid var(--color-divider)' }}>
                Who this is for
              </h3>
              <ul className="space-y-3">
                {[
                  'Founders & makers',
                  'Self-taught developers',
                  'Small business owners',
                  'Community builders',
                  'Non-traditional learners',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3" style={{ color: 'var(--color-deep-slate)' }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-lighthouse-navy)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Story & Problem */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div
            className="bg-white p-8 md:p-12 rounded-xl shadow-sm grid md:grid-cols-2 gap-12 items-center"
            style={{ border: '1px solid var(--color-divider)' }}
          >
            <div>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>
                The problem
              </h2>
              <p className="leading-relaxed" style={{ color: 'var(--color-deep-slate)' }}>
                Real capability rarely appears on formal transcripts. Traditional credentials are slow, expensive, and often out of reach. Existing digital badges mostly track attendance, not understanding.
              </p>
            </div>
            <div
              className="rounded-xl p-6 flex flex-col gap-4"
              style={{ backgroundColor: 'var(--color-sand-background)', border: '1px solid rgba(224, 214, 200, 0.5)' }}
            >
              <div className="flex items-center justify-between opacity-50">
                <span className="text-sm font-medium">Classrooms</span>
                <X className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-beacon-red)' }} />
              </div>
              <div className="h-[1px]" style={{ backgroundColor: 'var(--color-divider)' }} />
              <div className="flex items-center justify-between opacity-50">
                <span className="text-sm font-medium">Multiple choice</span>
                <X className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-beacon-red)' }} />
              </div>
              <div className="h-[1px]" style={{ backgroundColor: 'var(--color-divider)' }} />
              <div className="flex items-center justify-between font-medium" style={{ color: 'var(--color-lighthouse-navy)' }}>
                <span>Real work & evidence</span>
                <Check className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--color-lighthouse-navy)' }} />
              </div>
            </div>
          </div>

          <div
            className="text-white p-8 md:p-12 rounded-xl shadow-sm"
            style={{ backgroundColor: 'var(--color-lighthouse-navy)' }}
          >
            <h2 className="text-2xl font-semibold mb-4">Our response</h2>
            <p className="text-lg leading-relaxed max-w-3xl" style={{ opacity: 0.9 }}>
              Lighthouse Ledger is a learning record and review system that listens to evidence first. We ask structured, practitioner-level questions to test how you think, what you understand, and how you would apply it.
            </p>
          </div>
        </section>

        {/* How we verify - with massive numerals */}
        <section
          id="how-we-verify"
          className="py-20 px-8 rounded-xl"
          style={{ backgroundColor: 'var(--color-sand-background)', border: '1px solid var(--color-divider)' }}
        >
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 tracking-tight" style={{ color: 'var(--color-lighthouse-navy)' }}>
              How we verify capability
            </h2>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--color-deep-slate)' }}>
              Four principles guiding our verification process.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
            {[
              {
                number: '01',
                title: 'Evidence first',
                desc: 'We start with what you have actually done. Proof of work over paper certificates.',
              },
              {
                number: '02',
                title: 'Structured questions',
                desc: 'Practitioner prompts test your depth of understanding and practical application.',
              },
              {
                number: '03',
                title: 'Confidence band',
                desc: 'Clear signals of verification strength for each record, building trust over time.',
              },
              {
                number: '04',
                title: 'Owned by you',
                desc: 'A portable ledger you control entirely. Shareable only when you choose.',
              },
            ].map((card, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="mb-6">
                  <div className="text-[80px] md:text-[100px] font-bold leading-none" style={{ color: 'rgba(26, 39, 64, 0.1)' }}>
                    {card.number}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-lighthouse-navy)' }}>
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed max-w-[240px] mx-auto" style={{ color: 'var(--color-deep-slate)' }}>
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Long term vision */}
        <section id="philosophy" className="pl-8 py-4" style={{ borderLeft: '4px solid var(--color-ledger-crimson)' }}>
          <p className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--color-ledger-crimson)' }}>
            Long-term ambition
          </p>
          <blockquote className="text-2xl md:text-3xl font-medium leading-tight mb-6" style={{ color: 'var(--color-lighthouse-navy)' }}>
            &quot;To prove that non-traditional learners can be assessed with the same seriousness as formal students.&quot;
          </blockquote>
          <p className="text-lg max-w-2xl" style={{ color: 'var(--color-deep-slate)' }}>
            We are laying the groundwork for stackable, verifiable micro-credentials that one day plug into wider education, employment, and digital public infrastructure.
          </p>
        </section>

        {/* Boundaries & Status */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Boundaries */}
          <section
            className="bg-white p-8 rounded-xl shadow-sm h-full flex flex-col"
            style={{ border: '1px solid var(--color-divider)' }}
          >
            <h2 className="text-2xl font-semibold mb-8" style={{ color: 'var(--color-lighthouse-navy)' }}>
              What Lighthouse Ledger will never be
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-grow">
              <div className="space-y-4">
                {['Not a replacement for universities', 'Not a gatekeeper'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0" style={{ color: 'var(--color-beacon-red)' }}>
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <span className="font-medium text-sm" style={{ color: 'var(--color-deep-slate)' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {['Not making hiring decisions', 'Not an automated AI judge'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0" style={{ color: 'var(--color-beacon-red)' }}>
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <span className="font-medium text-sm" style={{ color: 'var(--color-deep-slate)' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Where we are now */}
          <section
            className="p-8 rounded-xl h-full flex flex-col justify-center text-center shadow-sm"
            style={{ backgroundColor: 'var(--color-sand-background)', border: '1px solid var(--color-divider)' }}
          >
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>
              Where we are now
            </h3>
            <p className="mb-8 max-w-sm mx-auto" style={{ color: 'var(--color-deep-slate)' }}>
              This is an early test version. Sign in is limited to invited users as we learn with our first cohort.
            </p>
            <div>
              <button
                type="button"
                className="text-xs font-bold text-white uppercase tracking-wider px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
                style={{ backgroundColor: 'var(--color-ledger-crimson)' }}
                onClick={() => alert('Updates subscription coming soon')}
              >
                Get updates
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </section>
        </div>
      </motion.div>

      {/* Final CTA */}
      <FinalCTA />
    </div>
  )
}
