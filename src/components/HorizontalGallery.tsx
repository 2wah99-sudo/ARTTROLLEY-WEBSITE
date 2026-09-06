'use client'

/**
 * HorizontalGallery — ERA Residence's "Drag to see more" gallery.
 *
 * A full-viewport-width strip of editorial images that the user drags
 * horizontally.  Momentum is carried after release so it feels physical.
 * Custom cursor label changes to "Drag" when over the strip.
 * GSAP-free — all inertia is handled with pointer events + rAF so there
 * is no extra import weight.
 */

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import LineReveal from './LineReveal'

// Replace these with real Arttrolley editorial images once available.
// For now use the product images that already exist.
const IMAGES = [
  { src: '/frames/hero/frame_001.webp', label: 'The Making' },
  { src: '/frames/hero/frame_050.webp', label: 'Block Print' },
  { src: '/frames/hero/frame_100.webp', label: 'Dye Vat' },
  { src: '/frames/hero/frame_150.webp', label: 'Wash & Cure' },
  { src: '/frames/hero/frame_200.webp', label: 'Hand Press' },
  { src: '/frames/hero/frame_250.webp', label: 'Sun Dry' },
  { src: '/frames/hero/frame_300.webp', label: 'Final Form' },
]

export default function HorizontalGallery() {
  const trackRef  = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX    = useRef(0)
  const scrollLeft = useRef(0)
  const velRef    = useRef(0)
  const lastX     = useRef(0)
  const lastT     = useRef(0)
  const rafRef    = useRef(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const updateProgress = () => {
      const max = track.scrollWidth - track.clientWidth
      setProgress(max > 0 ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 0)
    }

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true
      startX.current     = e.pageX - track.offsetLeft
      scrollLeft.current = track.scrollLeft
      lastX.current      = e.pageX
      lastT.current       = performance.now()
      velRef.current     = 0
      cancelAnimationFrame(rafRef.current)
      track.style.cursor = 'grabbing'
      track.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const x    = e.pageX - track.offsetLeft
      const walk = (x - startX.current) * 1.2
      const now  = performance.now()
      const dt   = Math.max(1, now - lastT.current)
      // Instantaneous velocity in px/frame (~16.7ms), smoothed toward the
      // new sample so a single jittery pointer event doesn't dominate the
      // release momentum.
      const instVel = ((e.pageX - lastX.current) / dt) * 16.7
      velRef.current = velRef.current * 0.7 + instVel * 0.3
      lastX.current  = e.pageX
      lastT.current  = now
      track.scrollLeft = scrollLeft.current - walk
      updateProgress()
    }

    const onPointerUp = () => {
      if (!isDragging.current) return
      isDragging.current = false
      track.style.cursor = 'grab'

      // Momentum coast — exponential decay, physical-feeling deceleration
      let vel = velRef.current * 0.9
      const coast = () => {
        if (Math.abs(vel) < 0.4) return
        track.scrollLeft -= vel
        vel *= 0.945
        updateProgress()
        rafRef.current = requestAnimationFrame(coast)
      }
      rafRef.current = requestAnimationFrame(coast)
    }

    const onScroll = () => updateProgress()

    track.addEventListener('pointerdown', onPointerDown)
    track.addEventListener('pointermove', onPointerMove)
    track.addEventListener('pointerup',   onPointerUp)
    track.addEventListener('pointerleave', onPointerUp)
    track.addEventListener('scroll', onScroll, { passive: true })
    updateProgress()

    return () => {
      track.removeEventListener('pointerdown', onPointerDown)
      track.removeEventListener('pointermove', onPointerMove)
      track.removeEventListener('pointerup',   onPointerUp)
      track.removeEventListener('pointerleave', onPointerUp)
      track.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <section className="relative py-32 md:py-48 overflow-hidden">
      {/* Header row — text-shadow inherits to the label/heading/drag-hint
          below, all sitting over AmbientBackground's fabric loop. */}
      <div
        className="px-6 md:px-16 flex items-end justify-between mb-12"
        style={{ textShadow: '0 2px 14px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.9)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="label text-gold/60 mb-3" style={{ letterSpacing: '0.28em' }}>
            Editorial
          </p>
          <LineReveal
            as="h2"
            className="font-serif font-light text-parchment leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
            lines={['Inside the Atelier']}
          />
        </motion.div>

        {/* "Drag to explore" label — era-residence pattern */}
        <motion.div
          className="hidden md:flex items-center gap-3 text-parchment/35 select-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <span className="label" style={{ fontSize: '0.65rem', letterSpacing: '0.2em' }}>
            Drag to explore
          </span>
          {/* Arrow right */}
          <svg width="36" height="10" viewBox="0 0 36 10" fill="none" aria-hidden="true">
            <path d="M0 5h32M27 1l4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>

      {/* Draggable track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-scroll no-scrollbar pl-6 md:pl-16 pr-6"
        style={{
          cursor: 'grab',
          userSelect: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
        data-cursor-label="Drag"
        data-cursor-expand
      >
        {IMAGES.map((img, i) => (
          <motion.div
            key={i}
            className="relative shrink-0 overflow-hidden"
            style={{ width: 'clamp(260px, 34vw, 520px)', aspectRatio: '3/4' }}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '0px -15%' }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.label}
              draggable="false"
              className="w-full h-full object-cover pointer-events-none
                         transition-transform duration-[1.6s] ease-[cubic-bezier(0.22,1,0.36,1)]
                         group-hover:scale-[1.05]"
            />

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent pointer-events-none" />

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
              <p className="label text-parchment/60" style={{ letterSpacing: '0.2em', fontSize: '0.65rem' }}>
                {String(i + 1).padStart(2, '0')} / {img.label}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Trailing spacer */}
        <div className="shrink-0 w-6 md:w-16" />
      </div>

      {/* Scroll progress bar — thin gold line that grows as the user drags */}
      <div className="px-6 md:px-16 mt-8">
        <div className="h-px bg-parchment/8 relative overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gold/50"
            style={{ width: `${Math.max(100 / IMAGES.length, progress * 100)}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      </div>
    </section>
  )
}
