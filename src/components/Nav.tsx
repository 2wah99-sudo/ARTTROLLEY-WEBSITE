'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'

const LINKS = [
  { label: 'Manifesto',      href: '/#manifesto' },
  { label: 'The Collection', href: '/collection' },
  { label: 'The Craft',      href: '/#craft' },
]

export default function Nav() {
  const { count, openCart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // The film owns the screen undistracted while it plays — the nav fades
  // in only once the reader has scrolled past it (or immediately, if
  // reduced-motion swapped the film for the static hero, which has no
  // pinned scroll runway to wait out).
  const [pastFilm, setPastFilm] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const navRef = useRef<HTMLElement>(null)

  // Nav is visible and interactive from the very first frame now — no more
  // waiting for the hero film to finish. `inert` stays cleared permanently;
  // kept as an imperative DOM write (not a JSX prop) per the note below,
  // in case a future gating need brings this back.
  useEffect(() => {
    const el = navRef.current as (HTMLElement & { inert: boolean }) | null
    if (el) el.inert = false
  }, [])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const film = document.getElementById('hero-film')
    const filmHeight = film?.offsetHeight ?? 0

    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      setPastFilm(filmHeight === 0 || window.scrollY > filmHeight - window.innerHeight * 0.6)

      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile nav on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Lock body scroll while mobile nav is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? 'bg-ink/95 backdrop-blur-sm border-b border-parchment/10'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 md:px-10 h-16">
          <a href="/" className="font-serif text-base tracking-widest2 text-parchment uppercase shrink-0">
            Arttrolley<span className="text-clay">.</span>
          </a>

          {/* Desktop centre links */}
          <ul className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  data-magnetic="0.15"
                  className="label text-parchment/70 hover:text-gold transition-colors duration-500 focus-visible:outline-none focus-visible:text-gold"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-6 shrink-0">
            <button
              type="button"
              aria-label="Search"
              className="text-parchment/60 hover:text-gold transition-colors duration-500 focus-visible:outline-none focus-visible:text-gold"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" />
                <path d="M11 11L14.5 14.5" stroke="currentColor" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Saved pieces"
              className="hidden sm:inline-block text-parchment/60 hover:text-gold transition-colors duration-500 focus-visible:outline-none focus-visible:text-gold"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 2.5h10a.5.5 0 0 1 .5.5v11l-5.5-3.2L2.5 14V3a.5.5 0 0 1 .5-.5Z" stroke="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              data-magnetic="0.20"
              data-cursor-label="Bag"
              aria-label={`Bag${mounted && count > 0 ? `, ${count} item${count !== 1 ? 's' : ''}` : ''}`}
              onClick={openCart}
              className="label text-parchment/60 hover:text-gold transition-colors duration-500 focus-visible:outline-none focus-visible:text-gold"
            >
              Bag{' '}
              <span
                suppressHydrationWarning
                className={mounted && count > 0 ? 'text-gold' : 'text-parchment/60'}
              >
                [{mounted ? count : 0}]
              </span>
            </button>

            {/* Mobile hamburger — only visible below md */}
            <button
              type="button"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex flex-col gap-[5px] justify-center items-center w-8 h-8 text-parchment/70 hover:text-gold transition-colors duration-500 focus-visible:outline-none focus-visible:text-gold"
            >
              <span
                className={`block w-5 h-px bg-current transition-transform duration-300 origin-center ${mobileOpen ? 'translate-y-[6px] rotate-45' : ''}`}
              />
              <span
                className={`block w-5 h-px bg-current transition-opacity duration-300 ${mobileOpen ? 'opacity-0' : ''}`}
              />
              <span
                className={`block w-5 h-px bg-current transition-transform duration-300 origin-center ${mobileOpen ? '-translate-y-[6px] -rotate-45' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Scroll progress rule — ERA-style thin gold line under the nav */}
        <div className="h-px bg-parchment/8 relative overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gold/60"
            style={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      </motion.nav>

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-ink/80 md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              id="mobile-nav"
              role="dialog"
              aria-label="Navigation"
              aria-modal="true"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-ink border-l border-parchment/10 flex flex-col pt-24 pb-12 px-8 md:hidden"
            >
              <nav aria-label="Mobile navigation">
                <ul className="flex flex-col gap-8">
                  {LINKS.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        onClick={() => setMobileOpen(false)}
                        className="font-serif text-2xl font-light text-parchment/80 hover:text-gold transition-colors duration-500 focus-visible:outline-none focus-visible:text-gold"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-auto">
                <div className="rule w-8 mb-6" />
                <p className="label text-parchment/35">Arttrolley · Craft Edition</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
