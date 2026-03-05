'use client'

import { motion } from 'motion/react'

export function TrustSignals() {
  const personas = [
    {
      title: 'Micro and small business owners',
      points: [
        'You run a shop, side business or informal enterprise.',
        "Most of what you've learned is from running the business, not from courses.",
        'You want to show that you can manage money, operations and customers with real evidence, not just a CV line.',
      ],
    },
    {
      title: 'Executives and corporate practitioners',
      points: [
        'You lead teams or projects in a large organisation.',
        'You solve complex problems on the job, but your CV only shows titles and years.',
        'You want a way to document specific decisions and outcomes in a structured, reviewable way.',
      ],
    },
    {
      title: 'Self‑taught and mid‑level learners',
      points: [
        'You learn from YouTube, online content or side projects – for example, teaching yourself to code or analyse data.',
        "You use these skills to improve processes at work, but they don't show up in formal credentials.",
        'You want to connect your learning and projects to a clear capability record.',
      ],
    },
  ]

  return (
    <section className="py-32 px-4 md:px-8" style={{ backgroundColor: 'var(--color-sand-background)', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)' }}>
      <div className="max-w-[1120px] mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-[44px] font-semibold mb-6 tracking-tight" style={{ color: 'var(--color-lighthouse-navy)' }}>
            Who Lighthouse Ledger is for
          </h2>
          <p className="text-xl max-w-3xl leading-relaxed" style={{ color: 'var(--color-deep-slate)' }}>
            From MSME owners to corporate executives to self-taught learners. Your real work matters, regardless of how you learned it.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {personas.map((persona, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-xl shadow-sm flex flex-col"
              style={{ border: '1px solid var(--color-divider)' }}
            >
              <h3 className="text-xl font-semibold mb-6 pb-4" style={{ color: 'var(--color-lighthouse-navy)', borderBottom: '1px solid var(--color-divider)' }}>
                {persona.title}
              </h3>

              <ul className="space-y-4 flex-grow">
                {persona.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: 'var(--color-signal-blue)' }} />
                    <span className="text-[15px] leading-relaxed" style={{ color: 'var(--color-deep-slate)' }}>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-[15px] max-w-4xl mx-auto leading-relaxed" style={{ color: 'var(--color-deep-slate)' }}>
            <span className="font-semibold" style={{ color: 'var(--color-lighthouse-navy)' }}>Equal respect for all learning contexts:</span> The same engine supports a market trader in Lagos, a mid‑level manager in Kuala Lumpur learning to code from YouTube, or a corporate executive in London documenting complex projects.
          </p>
        </div>
      </div>
    </section>
  )
}
