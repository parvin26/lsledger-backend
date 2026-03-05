'use client'

import { motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import Link from 'next/link'

export function Philosophy() {
  const isNot = [
    'Not a degree or certification',
    'Not a gatekeeper',
    'Not a replacement for universities',
  ]

  const is = [
    'Evidence from real work',
    'Practitioner-level verification',
    'A record you own and control',
  ]

  return (
    <section id="philosophy" className="py-32 px-4 md:px-8 relative overflow-hidden" style={{ backgroundColor: 'var(--color-lighthouse-navy)', color: 'white' }}>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-[1120px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Our Philosophy
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-[52px] font-semibold leading-[1.15] mb-8 tracking-tight" style={{ color: 'white' }}>
              We believe real capability can be verified without formal credentials: through evidence, structured review, and honest boundaries.
            </h2>
            <p className="text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Non-traditional learners deserve the same rigor and respect as formal students. This system is built to prove that.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-2xl font-semibold mb-6 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                Lighthouse Ledger is not
              </h3>
              <ul className="space-y-4">
                {isNot.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <X className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} style={{ color: 'var(--color-beacon-red)' }} />
                    <span className="text-lg" style={{ color: 'rgba(255,255,255,0.9)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-2xl font-semibold mb-6 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                Lighthouse Ledger is
              </h3>
              <ul className="space-y-4">
                {is.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} style={{ color: 'var(--color-signal-blue)' }} />
                    <span className="text-lg" style={{ color: 'rgba(255,255,255,0.9)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="mt-16 pt-12 grid md:grid-cols-2 gap-8 max-w-2xl mx-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Link href="/about#how-we-verify" className="text-center font-medium transition-opacity hover:opacity-90" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Verifiable Capabilities
            </Link>
            <Link href="/about#how-we-verify" className="text-center font-medium transition-opacity hover:opacity-90" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Evidence
            </Link>
            <Link href="/about#how-we-verify" className="text-center font-medium transition-opacity hover:opacity-90" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Review
            </Link>
            <Link href="/about#how-we-verify" className="text-center font-medium transition-opacity hover:opacity-90" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Boundaries
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
