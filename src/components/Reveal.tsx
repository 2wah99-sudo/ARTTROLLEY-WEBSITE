'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function Reveal({
  children,
  delay = 0,
  y = 24,
  className = '',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      // Positive bottom margin (was a symmetric -10% shrink) so the
      // IntersectionObserver root extends past the real viewport edge —
      // this fires the reveal ~15% of a screen-height BEFORE the element
      // is actually visible, instead of requiring it to already be 10%
      // into view. That lead time is what keeps a normal scroll from
      // outrunning the fade-in: at typical scroll speeds a fixed ~1s
      // animation plus per-item stagger delay can easily still be
      // mid-fade by the time the element reaches the fold, which reads as
      // "the text never shows up, the background just replaces it."
      viewport={{ once: true, margin: '0px 0px 15% 0px' }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
