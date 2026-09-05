'use client'

/**
 * IrisTransition — a soft circular glow that blooms open on black as you
 * scroll past it, standing in for a hard cut between two sections. A brief
 * breath of pure dark with one warm point of light expanding, rather than
 * an instant jump from one chapter's imagery to the next.
 */

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function IrisTransition() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1.4, 0.3])
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.5, 0.85, 1], [0, 1, 1, 1, 0])

  return (
    <div ref={ref} className="relative h-[40vh] md:h-[55vh] bg-ink overflow-hidden flex items-center justify-center">
      <motion.div
        aria-hidden="true"
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '60vmin',
          height: '60vmin',
          scale,
          opacity,
          background: 'radial-gradient(circle, rgba(201,168,76,0.16) 0%, rgba(181,98,42,0.08) 45%, transparent 72%)',
          filter: 'blur(2px)',
        }}
      />
    </div>
  )
}
