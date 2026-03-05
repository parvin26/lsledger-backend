'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > window.innerHeight * 2
      setIsVisible(shouldShow && !isDismissed)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDismissed])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg"
          style={{ borderColor: 'var(--color-divider)' }}
        >
          <div className="max-w-[1120px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--color-lighthouse-navy)' }}>
                Ready to start building your capability ledger?
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <button
                  type="button"
                  className="hover:brightness-110 text-white px-6 py-2.5 rounded-lg font-medium text-[15px] transition-all shadow-sm whitespace-nowrap"
                  style={{ backgroundColor: 'var(--color-ledger-crimson)' }}
                >
                  Sign up
                </button>
              </Link>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-2 transition-colors ll-hover-text-navy"
                style={{ color: 'var(--color-muted-text)' }}
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
