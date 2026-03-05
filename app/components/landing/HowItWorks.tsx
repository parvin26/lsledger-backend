'use client'

import { motion } from 'motion/react'

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Record your evidence',
      description: 'Attach work, notes, GitHub links, or project artifacts.',
      micro: 'Used by early builders to capture work in minutes.',
      time: '~2 min',
    },
    {
      number: '02',
      title: 'Answer practitioner questions',
      description: 'Respond to structured prompts that test your deep understanding.',
      micro: 'Designed and reviewed by real practitioners.',
      time: '~10 min',
    },
    {
      number: '03',
      title: 'Build your capability ledger',
      description: 'Create a verified, shareable record owned entirely by you.',
      micro: 'Shareable when you choose. Always under your control.',
      time: '~1 min',
    },
  ]

  return (
    <section id="how-it-works" className="py-32 px-4 md:px-8 border-y" style={{ backgroundColor: '#F8F9FB', borderColor: 'var(--color-divider)' }}>
      <div className="max-w-[1120px] mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-[44px] font-semibold text-[var(--color-lighthouse-navy)] mb-6 tracking-tight">
            How it works
          </h2>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--color-deep-slate)' }}>
            Three clear steps from evidence to verified capability record.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="mb-8">
                <div className="text-[120px] md:text-[140px] font-bold leading-none" style={{ color: 'rgba(26, 39, 64, 0.1)' }}>
                  {step.number}
                </div>
              </div>

              <div>
                <div className="flex flex-col items-center gap-3 mb-4">
                  <h3 className="text-2xl font-semibold text-[var(--color-lighthouse-navy)]">
                    {step.title}
                  </h3>
                  <span className="text-sm font-medium bg-white px-4 py-1.5 rounded-full border" style={{ color: 'var(--color-signal-blue)', borderColor: 'var(--color-divider)' }}>
                    {step.time}
                  </span>
                </div>

                <p className="text-[16px] leading-relaxed mb-4 max-w-[280px] mx-auto" style={{ color: 'var(--color-deep-slate)' }}>
                  {step.description}
                </p>

                <p className="text-[14px] font-medium italic max-w-[260px] mx-auto" style={{ color: 'rgba(32, 91, 159, 0.8)' }}>
                  {step.micro}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-[70px] right-[-24px] lg:right-[-48px]" style={{ color: 'rgba(26, 39, 64, 0.2)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-[15px] max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(46, 58, 77, 0.7)' }}>
            Total time: ~15 minutes to create your first verified capability entry
          </p>
        </div>
      </div>
    </section>
  )
}
