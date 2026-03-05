'use client'

import { Check, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'

export function Features() {
  const scrollToPhilosophy = () => {
    document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="py-32 px-4 md:px-8 max-w-[1120px] mx-auto">
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-[44px] font-semibold mb-6 tracking-tight" style={{ color: 'var(--color-lighthouse-navy)' }}>
          Is this for you?
        </h2>
        <p className="text-xl leading-relaxed" style={{ color: 'var(--color-deep-slate)' }}>
          Find out if Lighthouse Ledger is right for you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white p-10 rounded-xl shadow-sm border flex flex-col h-full"
          style={{ borderColor: 'var(--color-divider)' }}
        >
          <h3 className="text-2xl font-semibold mb-8 pb-4 border-b" style={{ color: 'var(--color-lighthouse-navy)', borderColor: 'var(--color-divider)' }}>
            Individual users
          </h3>
          <ul className="space-y-5 flex-grow">
            {[
              'You learn more from projects than from classes.',
              'You have repos, decks, or community work that never show up on transcripts.',
              'You want proof of capability, not another certificate.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-signal-blue)' }}>
                  <Check className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="text-[17px] leading-relaxed" style={{ color: 'var(--color-deep-slate)' }}>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--color-divider)' }}>
            <button
              type="button"
              onClick={scrollToPhilosophy}
              className="font-medium text-[15px] flex items-center gap-2 transition-colors"
              style={{ color: 'var(--color-signal-blue)' }}
            >
              Read the full philosophy
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-10 rounded-xl shadow-sm flex flex-col h-full"
          style={{ border: '1px solid var(--color-divider)' }}
        >
          <h3 className="text-2xl font-semibold mb-8 pb-4" style={{ color: 'var(--color-lighthouse-navy)', borderBottom: '1px solid var(--color-divider)' }}>
            Organizations
          </h3>
          <ul className="space-y-5 flex-grow">
            {[
              'You need to verify capabilities of contractors, partners, or team members.',
              'You want evidence-based assessment, not resume screening.',
              'You value structured review over formal credentials.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-signal-blue)' }}>
                  <Check className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="text-[17px] leading-relaxed" style={{ color: 'var(--color-deep-slate)' }}>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--color-divider)' }}>
            <button
              type="button"
              onClick={scrollToPhilosophy}
              className="font-medium text-[15px] flex items-center gap-2 transition-colors"
              style={{ color: 'var(--color-signal-blue)' }}
            >
              Read the full philosophy
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
