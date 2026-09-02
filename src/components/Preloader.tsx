'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from 'framer-motion'
import { GooeyLoader } from '@/components/ui/loader-10'

// Minimum hold so the entrance reads as intentional, not a flash.
// Max wait caps a slow font/asset load so visitors aren't trapped.
const MIN_HOLD_MS = 1800
const MAX_WAIT_MS = 3500

/**
 * Full-screen preloader: ARTTROLLEY wordmark on pure black with a gooey
 * liquid loader beneath it (white + red blobs). Curtain-rises away once
 * fonts are ready (or MAX_WAIT_MS expires), revealing the hero film already
 * underneath. Locks body scroll while visible.
 */
export default function Preloader() {
  const prefersReduced = useReducedMotion()
  const [done, setDone] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Lock scroll while preloader is on screen
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Exit: curtain-rise (clip-path) once fonts ready or timeout
  useEffect(() => {
    let cancelled = false
    const start = performance.now()

    const finish = () => {
      if (cancelled) return
      const elapsed = performance.now() - start
      const wait = Math.max(0, MIN_HOLD_MS - elapsed)
      window.setTimeout(() => {
        if (cancelled) return
        const root = rootRef.current
        if (prefersReduced || !root) { setDone(true); return }
        gsap.to(root, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 1.05,
          ease: 'power3.inOut',
          onComplete: () => setDone(true),
        })
      }, wait)
    }

    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready
    const readyPromise = fontsReady
      ? Promise.race([fontsReady, new Promise(r => setTimeout(r, MAX_WAIT_MS))])
      : Promise.resolve()
    readyPromise.then(finish)

    return () => { cancelled = true }
  }, [prefersReduced])

  if (done) return null

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center gap-10"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      role="status"
      aria-live="polite"
      aria-label="Loading Arttrolley"
    >
      {/* Wordmark */}
      <div className="flex flex-col items-center gap-3 select-none">
        <h1
          className="font-serif tracking-widest2 text-white uppercase"
          style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', letterSpacing: '0.35em' }}
          aria-hidden="true"
        >
          ARTTROLLEY<span className="text-red-500">.</span>
        </h1>
        <p
          className="text-white/30 uppercase"
          style={{ fontSize: '0.6rem', letterSpacing: '0.3em' }}
        >
          Est. 2024 · Bagru, Rajasthan
        </p>
      </div>

      {/* Gooey liquid loader — white blob rolls into red blob */}
      <GooeyLoader
        primaryColor="#ffffff"
        secondaryColor="#ef4444"
        borderColor="#ef4444"
        className="scale-90"
      />
    </div>
  )
}
