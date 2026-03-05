'use client'

import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function FinalCTA() {
  return (
    <section
      className="py-32 px-4 md:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom right, var(--color-lighthouse-navy), var(--color-lighthouse-navy), #0F1B2E)', color: 'white' }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-[1120px] mx-auto text-center relative z-10"
      >
        <h2 className="text-4xl md:text-5xl lg:text-[52px] font-semibold mb-6 tracking-tight max-w-4xl mx-auto leading-[1.15]" style={{ color: 'white' }}>
          Ready to make your real work count?
        </h2>

        <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Sign up today and start building your capability ledger.
        </p>

        <div className="flex flex-col items-center justify-center gap-4">
          <Link href="/dashboard">
            <button
              type="button"
              className="hover:brightness-110 active:brightness-95 px-8 py-4 rounded-lg font-semibold text-[16px] shadow-lg transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
              style={{ backgroundColor: 'var(--color-ledger-crimson)', color: 'white' }}
            >
              Sign up
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>

          <Link href="/login" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Already have an account? Log in
          </Link>
        </div>

        <div className="mt-12 pt-12 border-t max-w-2xl mx-auto" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Trusted by early builders, MSME owners, and self-taught learners worldwide
          </p>
        </div>
      </motion.div>
    </section>
  )
}
