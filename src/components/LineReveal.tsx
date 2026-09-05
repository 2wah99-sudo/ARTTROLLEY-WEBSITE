'use client'

/**
 * LineReveal — masked headline reveal in the nabilissa.com vein: each line
 * of text sits inside its own overflow-hidden mask and slides up out of it
 * with a soft blur-to-sharp resolve, staggered line by line, once, as the
 * headline enters the viewport. Distinct from Reveal (a plain fade-up block)
 * and ScrollRevealText (a scroll-scrubbed word brightening, used for body
 * copy) — this one is for headlines and plays a single time on scroll-in
 * rather than tracking live scroll position.
 *
 * Usage: wrap a heading and pass its lines as children, one per line —
 * either literal JSX children (each top-level child becomes one masked
 * line) or a `lines` string array.
 */

import { motion } from 'framer-motion'
import type { CSSProperties, ElementType, ReactNode } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function LineReveal({
  lines,
  children,
  as: Tag = 'div',
  className = '',
  lineClassName = '',
  style,
  delay = 0,
  stagger = 0.12,
}: {
  lines?: string[]
  children?: ReactNode
  as?: ElementType
  className?: string
  lineClassName?: string
  style?: CSSProperties
  delay?: number
  stagger?: number
}) {
  const items: ReactNode[] = lines
    ? lines
    : Array.isArray(children)
      ? children
      : [children]

  return (
    <Tag className={className} style={style}>
      {items.map((item, i) => (
        // The observed element must NOT be the one that translates — a
        // translateY(100%) target starts entirely outside its own
        // overflow-hidden parent's clip rect, so the ancestor-clipped
        // intersection IntersectionObserver computes is permanently empty
        // and whileInView never fires. So the outer span (untransformed)
        // is what's observed and triggers the "visible" variant; the inner
        // span just follows along via variant propagation.
        <motion.span
          key={i}
          className="block overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
        >
          <motion.span
            className={`block will-change-transform ${lineClassName}`}
            variants={{
              hidden: { y: '100%', opacity: 0, filter: 'blur(10px)' },
              visible: { y: '0%', opacity: 1, filter: 'blur(0px)' },
            }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * stagger }}
          >
            {item}
          </motion.span>
        </motion.span>
      ))}
    </Tag>
  )
}
