'use client'

import { motion } from 'motion/react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  const scrollToLedger = () => {
    const el = document.getElementById('example-ledger')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 md:px-8 max-w-[1120px] mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-left order-last md:order-first"
        >
          <h1 className="mb-6 leading-[1.1] max-w-[600px]" style={{ color: 'var(--color-lighthouse-navy)' }}>
            <span className="block text-4xl md:text-[34px] lg:text-[38px] font-bold tracking-tight">
              Record what you can really&nbsp;do.
            </span>
            <span className="block text-5xl md:text-[52px] lg:text-[56px] font-bold tracking-tight mt-1">
              Turn real work into a trustworthy capability&nbsp;ledger.
            </span>
          </h1>

          <div className="space-y-3 mb-10 text-[17px] md:text-[19px] leading-relaxed" style={{ color: 'var(--color-deep-slate)' }}>
            <p>
              Upload evidence from real work, experiments, and community projects.
              <br className="hidden md:block" />
              Get a practitioner review that verifies what you actually understand.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6 relative">
            <Link href="/dashboard">
              <button
                type="button"
                className="hover:brightness-110 active:brightness-95 text-white px-6 py-3.5 rounded-lg font-medium text-[15px] shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                style={{ backgroundColor: 'var(--color-ledger-crimson)' }}
              >
                Sign up
              </button>
            </Link>

            <div className="relative">
              <button
                type="button"
                className="w-full sm:w-auto bg-transparent font-medium text-[15px] px-6 py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                style={{ border: '1px solid var(--color-divider)', color: 'var(--color-lighthouse-navy)' }}
                onClick={scrollToLedger}
              >
                Learn more
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 h-[1px] w-6" style={{ backgroundColor: 'rgba(224, 214, 200, 0.5)' }} />
              <div className="hidden md:block absolute -right-6 top-1/2 w-[1px] h-32 origin-top" style={{ backgroundColor: 'rgba(224, 214, 200, 0.5)' }} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium opacity-80" style={{ color: 'var(--color-deep-slate)' }}>
              No courses, no grades. Just honest records of real capability.
            </p>
            <Link
              href="/about#how-we-verify"
              className="text-sm transition-colors flex items-center gap-1 w-fit"
              style={{ color: 'var(--color-signal-blue)' }}
            >
              How does verification work?
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>

        {/* Right Content - Ledger Metaphor Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative order-first md:order-last"
        >
          <div className="relative w-full max-w-sm mx-auto md:ml-auto md:mr-0">
            <div className="absolute -top-8 left-0 text-sm font-medium tracking-wide uppercase flex items-center gap-2" style={{ color: 'var(--color-muted-text)' }}>
              <div className="hidden md:block w-[1px] h-4" style={{ backgroundColor: 'var(--color-divider)' }} />
              Capability ledger: preview
            </div>

            <motion.div
              className="bg-white rounded-xl shadow-sm p-6 space-y-4 relative z-10"
              style={{ border: '1px solid var(--color-divider)' }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-6 pb-4" style={{ borderBottom: '1px solid var(--color-divider)' }}>
                <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-medium text-sm" style={{ backgroundColor: 'var(--color-lighthouse-navy)' }}>
                  JD
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--color-lighthouse-navy)' }}>Jane Doe</div>
                  <div className="text-xs" style={{ color: 'var(--color-muted-text)' }}>Full‑stack engineer</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-signal-blue)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-lighthouse-navy)' }}>API integration & error handling</span>
                    </div>
                  </div>
                  <div className="pl-5">
                    <div className="flex items-center justify-between text-[10px] mb-1.5 uppercase tracking-wide" style={{ color: 'var(--color-muted-text)' }}>
                      <span>Practitioner‑verified</span>
                      <span>88% confidence</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(224, 214, 200, 0.5)' }}>
                      <motion.div
                        className="h-full"
                        style={{ backgroundColor: 'var(--color-signal-blue)' }}
                        initial={{ width: 0 }}
                        animate={{ width: '88%' }}
                        transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 opacity-40">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-deep-slate)' }} />
                    <div className="h-3 rounded w-32" style={{ backgroundColor: 'rgba(46, 58, 77, 0.2)' }} />
                  </div>
                  <div className="pl-5">
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(229, 231, 235, 0.3)' }}>
                      <div className="h-full w-[60%]" style={{ backgroundColor: 'rgba(46, 58, 77, 0.4)' }} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 opacity-40">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-deep-slate)' }} />
                    <div className="h-3 rounded w-40" style={{ backgroundColor: 'rgba(46, 58, 77, 0.2)' }} />
                  </div>
                  <div className="pl-5">
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(229, 231, 235, 0.3)' }}>
                      <div className="h-full w-[75%]" style={{ backgroundColor: 'rgba(46, 58, 77, 0.4)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="absolute top-2 left-2 right-2 bottom-[-8px] bg-white rounded-xl shadow-sm -z-10" style={{ border: '1px solid var(--color-divider)' }} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
