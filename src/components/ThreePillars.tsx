'use client'

/**
 * ThreePillars — "Three Reasons" card section lifted from ERA Residence.
 * Three full-height cards, each with a number, title, body and a hairline
 * rule that draws on scroll-entry.  On hover the card lifts slightly and the
 * gold accent mark slides into view.  Desktop: 3-column grid.
 * Mobile: single-column stacked.
 */

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion'

function IconHeritageCraft() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <rect x="8" y="28" width="32" height="12" rx="1" stroke="currentColor" strokeWidth="0.9" />
      <path d="M16 28V16a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="24" cy="22" r="3" stroke="currentColor" strokeWidth="0.9" />
      <path d="M20 35h8" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  )
}

function IconNaturalDyes() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <path d="M24 8c0 0-12 10-12 20a12 12 0 0 0 24 0C36 18 24 8 24 8Z" stroke="currentColor" strokeWidth="0.9" />
      <path d="M24 38V24M18 30l6-6M30 30l-6-6" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  )
}

function IconLimitedEdition() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <rect x="10" y="14" width="28" height="22" rx="1" stroke="currentColor" strokeWidth="0.9" />
      <path d="M10 20h28M18 14v-4M30 14v-4" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M16 27h4M16 31h8M28 27h4" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  )
}

const PILLARS = [
  {
    num: '01',
    title: 'Heritage Craft',
    sub: 'Bagru, Rajasthan',
    body:
      'Every piece begins with a hand-carved teak block, cut by artisans whose craft has passed through five generations of a single family in Bagru.',
    Icon: IconHeritageCraft,
  },
  {
    num: '02',
    title: 'Natural Dyes',
    sub: 'Earth & Plant',
    body:
      'Indigo from fermented leaves, rust from pomegranate rind, black from iron-rich mud — every colour sourced from the land surrounding the village.',
    Icon: IconNaturalDyes,
  },
  {
    num: '03',
    title: 'Limited Edition',
    sub: 'Never Mass-Made',
    body:
      'Each collection is capped at a numbered run. When the dye vats are washed and the blocks are oiled, that chapter closes permanently.',
    Icon: IconLimitedEdition,
  },
]

// TiltCard — cursor-reactive 3D tilt + a spotlight that follows the pointer,
// the signature "expensive-feeling" hover treatment on sites like Linear,
// Stripe and Vercel. Rotation is spring-damped so it settles like a physical
// object rather than snapping to the pointer; the spotlight is driven by the
// same raw motion values via a CSS custom-property template so it repaints
// as a GPU-composited gradient instead of a per-frame React re-render.
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5) // 0..1 across card width
  const mouseY = useMotionValue(0.5) // 0..1 across card height

  const springConfig = { stiffness: 150, damping: 18, mass: 0.5 }
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), springConfig)

  const spotlightX = useTransform(mouseX, (v) => `${v * 100}%`)
  const spotlightY = useTransform(mouseY, (v) => `${v * 100}%`)
  const spotlightBackground = useMotionTemplate`radial-gradient(480px circle at ${spotlightX} ${spotlightY}, rgba(201,168,76,0.10), transparent 65%)`

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  const handlePointerLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={className}
    >
      {/* Spotlight — sits above the base fill, below the content */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: spotlightBackground }}
      />
      {children}
    </motion.div>
  )
}

const cardVariants = {
  hidden:  { opacity: 0, y: 36 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: i * 0.15 },
  }),
}

export default function ThreePillars() {
  return (
    <section className="relative px-6 md:px-16 py-32 md:py-48">
      {/* Section label */}
      <motion.p
        className="label text-gold/60 mb-16 md:mb-20"
        style={{ letterSpacing: '0.28em', textShadow: '0 2px 12px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.95)' }}
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        Why Arttrolley
      </motion.p>

      {/* 3-column grid — ERA Residence "Three Reasons" */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-parchment/8">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.num}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-6% 0px' }}
            whileHover={{ y: -6, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
            className="group"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <TiltCard className="relative bg-ink/40 p-10 md:p-14 flex flex-col gap-8
                       cursor-default overflow-hidden">
              {/* Gold sweep on hover — slides in from left */}
              <span
                className="absolute inset-y-0 left-0 w-px bg-gold/0
                           group-hover:bg-gold/50 transition-colors duration-700"
              />

              {/* Number + icon row */}
              <div className="relative flex items-start justify-between">
                <span
                  className="font-serif text-5xl font-light text-parchment/12 leading-none select-none"
                  aria-hidden="true"
                >
                  {p.num}
                </span>
                <span className="text-gold/50 group-hover:text-gold/80 transition-colors duration-500">
                  <p.Icon />
                </span>
              </div>

              {/* Animated gold rule — draws in from left on scroll */}
              <motion.div
                className="relative h-px bg-gold/35"
                style={{ transformOrigin: 'left' }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 + 0.3 }}
              />

              {/* Text */}
              <div className="relative flex flex-col gap-3">
                <p className="label text-gold/60 tracking-[0.22em]">{p.sub}</p>
                <h3
                  className="font-serif font-light text-parchment leading-tight"
                  style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)' }}
                >
                  {p.title}
                </h3>
              </div>

              <p className="relative font-sans font-light text-smoke/80 leading-relaxed text-[0.925rem]">
                {p.body}
              </p>

              {/* Bottom CTA arrow — fades in on hover */}
              <div className="relative mt-auto pt-4">
                <span
                  className="inline-flex items-center gap-2 label text-gold/0
                             group-hover:text-gold/70 transition-colors duration-500"
                >
                  Discover
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                    <path d="M0 5h12M8 1l4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
