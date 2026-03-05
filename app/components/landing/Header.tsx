'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'

/* Use lg (1024px) breakpoint so 768-1023px viewports get mobile layout.
   Prevents cramped desktop nav and overlap on fold/tablet devices. */
const DESKTOP_BREAKPOINT = 1024

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false) /* mobile-first: avoid cramped desktop nav flash on narrow viewports */
  const pathname = usePathname()
  const router = useRouter()

  const isAbout = pathname === '/about'

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (GUEST_MODE_ENABLED) {
      setSignedIn(true)
      return
    }
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session)
    }).catch(() => {
      setSignedIn(false)
    })
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToHowItWorks = () => {
    if (pathname !== '/') {
      router.push('/')
      setTimeout(() => {
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
    }
    setIsOpen(false)
  }

  const handleTryNow = () => {
    if (GUEST_MODE_ENABLED || signedIn) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
      style={{
        width: '100%',
        maxWidth: '100%',
        backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : '#ffffff',
        boxShadow: scrolled ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      <div className="max-w-[1120px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between min-w-0">
        <Link href="/" className="flex items-center gap-2 group min-w-0 shrink-0">
          <img src="/logo.svg" alt="" className="h-20 w-[100px] flex-shrink-0 object-contain" width={100} height={80} />
          <span className="font-semibold text-lg tracking-tight truncate" style={{ color: 'var(--color-lighthouse-navy)' }}>
            Lighthouse Ledger
          </span>
        </Link>

        {/* Desktop Menu - only when viewport >= 1024px (avoids cramped nav at 768-1023px) */}
        {isDesktop ? (
        <div className="flex items-center gap-6 shrink-0">
          <Link
            href="/about"
            className={`text-[15px] font-medium transition-colors ${isAbout ? 'll-text-navy' : 'll-text-slate'}`}
            style={isAbout ? { color: 'var(--color-lighthouse-navy)' } : { color: 'var(--color-deep-slate)' }}
          >
            About
          </Link>
          <button
            type="button"
            onClick={scrollToHowItWorks}
            className="text-[15px] font-medium transition-colors flex items-center gap-1"
            style={{ color: 'var(--color-deep-slate)' }}
          >
            How it works
            <ChevronDown className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px]" style={{ backgroundColor: 'var(--color-divider)' }} />

          <button
            type="button"
            onClick={handleTryNow}
            className="hover:brightness-110 active:brightness-95 text-white px-5 py-2.5 rounded-lg text-[15px] font-medium transition-all shadow-sm"
            style={{ backgroundColor: 'var(--color-ledger-crimson)' }}
          >
            {signedIn ? 'Dashboard' : 'Sign in'}
          </button>
        </div>
        ) : (
        <>
        {/* Mobile Menu Button */}
        <button
          type="button"
          className="p-2 flex-shrink-0"
          style={{ color: 'var(--color-deep-slate)' }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        </>
        )}
      </div>

      {/* Mobile Menu - overlay with backdrop so content is clearly behind it */}
      <AnimatePresence>
        {!isDesktop && isOpen && (
          <>
            {/* Backdrop - covers viewport below header, closes menu on tap */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 right-0 bottom-0"
              style={{
                top: 80,
                backgroundColor: 'rgba(0,0,0,0.3)',
                zIndex: 40,
              }}
              onClick={() => setIsOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full overflow-hidden"
              style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid var(--color-divider)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50,
              }}
            >
            <div className="px-4 py-6 flex flex-col gap-4">
              <Link
                href="/about"
                className={`py-3 border-b ${isAbout ? 'font-bold' : 'font-medium'}`}
                style={{ borderColor: 'var(--color-divider)', color: isAbout ? 'var(--color-lighthouse-navy)' : 'var(--color-deep-slate)' }}
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <button
                type="button"
                className="text-left font-medium py-3 border-b"
                style={{ borderColor: 'var(--color-divider)', color: 'var(--color-deep-slate)' }}
                onClick={scrollToHowItWorks}
              >
                How it works
              </button>
              <button
                type="button"
                onClick={() => {
                  handleTryNow()
                  setIsOpen(false)
                }}
                className="w-full hover:brightness-110 text-white py-3 rounded-lg font-medium mt-2"
                style={{ backgroundColor: 'var(--color-ledger-crimson)' }}
              >
                {signedIn ? 'Dashboard' : 'Sign in'}
              </button>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
