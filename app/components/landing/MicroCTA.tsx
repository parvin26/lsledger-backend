'use client'

import { motion } from 'motion/react'
import Link from 'next/link'

export function MicroCTA() {
  return (
    <section className="py-24 px-4 md:px-8" style={{ backgroundColor: 'rgba(255, 240, 245)', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)' }}>
      <div className="max-w-[1120px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-6 tracking-tight" style={{ color: 'var(--color-lighthouse-navy)' }}>
            Start verifying, all the time.
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--color-deep-slate)' }}>
            Lighthouse Ledger makes it easy for individuals and organizations to verify capabilities.
          </p>
          <Link href="/dashboard">
            <button
              type="button"
              className="hover:brightness-110 active:brightness-95 text-white px-8 py-4 rounded-lg font-semibold text-[16px] shadow-lg transition-all uppercase tracking-wide"
              style={{ backgroundColor: 'var(--color-ledger-crimson)' }}
            >
              Sign up / Get started
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
