'use client'

/**
 * ScrollRevealText — a paragraph that brightens word by word as it scrolls
 * through the viewport, rather than fading in all at once. Each word tracks
 * its own slice of the container's scroll progress, so the reveal reads as
 * scrubbing through the sentence with the reader's own scroll gesture —
 * scroll back up and the words dim again in reverse, exactly in step.
 */

import { useRef, type CSSProperties } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'

function Word({ children, progress, range }: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
}) {
  // Floor raised 0.18 -> 0.45 — the "dim until read" effect is nice on a
  // plain background, but at 0.18 it was reading as fully invisible against
  // AmbientBackground's fabric loop, not just "dim."
  const opacity = useTransform(progress, range, [0.45, 1])
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}
      {' '}
    </motion.span>
  )
}

export default function ScrollRevealText({
  text,
  className = '',
  style,
}: {
  text: string
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    // Reveal completes once the paragraph has travelled through the
    // middle two-thirds of the viewport — starts a beat before it's
    // centered, finishes a beat after, so it never feels rushed.
    offset: ['start 0.85', 'start 0.35'],
  })

  const words = text.split(' ')

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((word, i) => {
        const start = i / words.length
        const end = (i + 1) / words.length
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        )
      })}
    </p>
  )
}
