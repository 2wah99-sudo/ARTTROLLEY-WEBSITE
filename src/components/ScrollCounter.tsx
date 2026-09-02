'use client'

/**
 * ScrollCounter — ERA Residence's signature fixed section counter.
 * A small two-digit number (`01`, `02`…) pinned to the left edge of the
 * viewport that increments as the user scrolls through major sections.
 * Watches elements via IntersectionObserver; the topmost visible section wins.
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// data-section="N" on each section element drives the counter.
// Sections are observed in order and the highest one in the viewport wins.
const SECTIONS = [
  { id: 'manifesto',   label: 'Manifesto' },
  { id: 'collection',  label: 'Collection' },
  { id: 'process',     label: 'Process' },
  { id: 'craft',       label: 'Craft' },
  { id: 'stories',     label: 'Stories' },
]

export default function ScrollCounter() {
  const [active, setActive] = useState(0) // index into SECTIONS

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const visible = new Set<string>()

    const update = () => {
      // Pick the first (lowest index) section that is visible
      for (let i = 0; i < SECTIONS.length; i++) {
        if (visible.has(SECTIONS[i].id)) {
          setActive(i)
          return
        }
      }
    }

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visible.add(id)
          } else {
            visible.delete(id)
          }
          update()
        },
        { threshold: 0.15 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const num = String(active + 1).padStart(2, '0')
  const label = SECTIONS[active]?.label ?? ''

  return (
    <div
      className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-50
                 hidden md:flex flex-col items-center gap-4 pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Vertical line above */}
      <div className="w-px h-16 bg-parchment/15" />

      {/* Counter number — slides when it changes */}
      <div className="relative overflow-hidden h-[1.4em]">
        <AnimatePresence mode="wait">
          <motion.span
            key={num}
            className="block font-serif font-light text-parchment/40 tabular-nums"
            style={{ fontSize: '0.75rem', letterSpacing: '0.12em' }}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {num}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Section label — rotated 90° */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={label}
            className="block label text-parchment/25 origin-center"
            style={{
              fontSize: '0.55rem',
              letterSpacing: '0.22em',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Dots for each section */}
      <div className="flex flex-col items-center gap-2">
        {SECTIONS.map((s, i) => (
          <motion.div
            key={s.id}
            className="rounded-full"
            animate={{
              width:  i === active ? 2 : 2,
              height: i === active ? 16 : 4,
              backgroundColor: i === active ? 'rgba(181,149,93,0.7)' : 'rgba(239,230,213,0.2)',
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>

      {/* Vertical line below */}
      <div className="w-px h-16 bg-parchment/15" />
    </div>
  )
}
