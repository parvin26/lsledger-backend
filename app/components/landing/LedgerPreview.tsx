'use client'

import { motion } from 'motion/react'
import { Check, ArrowUpRight, Github, FileText, Layout } from 'lucide-react'
import Link from 'next/link'

export function LedgerPreview() {
  const records = [
    {
      title: 'API Integration & Error Handling',
      date: 'Oct 12, 2025',
      type: 'Code',
      icon: Github,
      confidence: 85,
      evidence: 'PR #42, Unit Tests',
    },
    {
      title: 'User Research Synthesis',
      date: 'Sep 28, 2025',
      type: 'Strategy',
      icon: FileText,
      confidence: 92,
      evidence: 'Miro Board, Interview Notes',
    },
    {
      title: 'Design System Implementation',
      date: 'Sep 15, 2025',
      type: 'Design',
      icon: Layout,
      confidence: 78,
      evidence: 'Figma File, Storybook',
    },
  ]

  return (
    <section id="example-ledger" className="py-32 px-4 md:px-8 bg-white border-y" style={{ borderColor: 'var(--color-divider)' }}>
      <div className="max-w-[900px] mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-[44px] font-semibold mb-6 tracking-tight" style={{ color: 'var(--color-lighthouse-navy)' }}>
            What a capability ledger looks like
          </h2>
          <p className="text-xl text-[var(--color-deep-slate)] leading-relaxed max-w-2xl mx-auto">
            A clean, verified history of what you can do. Grounded in real evidence.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border overflow-hidden"
          style={{ borderColor: 'var(--color-divider)' }}
        >
          <div className="border-b p-6 flex justify-between items-center bg-white" style={{ borderColor: 'var(--color-divider)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-medium" style={{ backgroundColor: 'var(--color-lighthouse-navy)' }}>
                JD
              </div>
              <div>
                <div className="font-semibold" style={{ color: 'var(--color-lighthouse-navy)' }}>Jane Doe</div>
                <div className="text-sm text-[var(--color-muted-text)]">Full Stack Engineer</div>
              </div>
            </div>
            <div className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--color-signal-blue)' }}>
              <Check className="w-4 h-4" />
              Verified Account
            </div>
          </div>

          <div className="divide-y divide-[var(--color-divider)]">
            {records.map((record, i) => {
              const RecordIcon = record.icon
              return (
              <motion.div
                key={i}
                className="p-6 transition-colors group cursor-pointer ll-hover-bg-sand"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded bg-[var(--color-sand-background)] text-[var(--color-deep-slate)] mt-0.5">
                      <RecordIcon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-1" style={{ color: 'var(--color-lighthouse-navy)' }}>
                        {record.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-[var(--color-muted-text)]">
                        <span>{record.date}</span>
                        <span>•</span>
                        <span>{record.evidence}</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/dashboard" className="opacity-0 group-hover:opacity-100 transition-opacity p-2" style={{ color: 'var(--color-signal-blue)' }}>
                    <ArrowUpRight className="w-5 h-5" />
                  </Link>
                </div>

                <div className="pl-[52px]">
                  <div className="flex items-center justify-between text-xs font-medium text-[var(--color-muted-text)] mb-2">
                    <span>Practitioner Verification</span>
                    <span>{record.confidence}% Confidence</span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(229, 231, 235, 0.3)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: 'var(--color-signal-blue)' }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${record.confidence}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                    />
                  </div>
                </div>
              </motion.div>
            )
            })}
          </div>

          <div className="p-4 text-center border-t" style={{ backgroundColor: 'rgba(246, 241, 232, 0.2)', borderColor: 'var(--color-divider)' }}>
            <Link href="/dashboard" className="text-sm font-medium transition-colors ll-hover-text-navy" style={{ color: 'var(--color-deep-slate)' }}>
              View full ledger history
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
