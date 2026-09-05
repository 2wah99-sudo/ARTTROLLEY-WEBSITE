'use client'

/**
 * ParallaxPattern — the dupatta motif (matched to the hero's actual print),
 * tiled across the ambient background and drifting at a slower rate than
 * the foreground content as the page scrolls — true parallax, not just a
 * static watermark. Sits inside AmbientBackground's sticky layer, so the
 * tile itself never leaves the viewport; only its internal position shifts
 * against scroll, giving it depth against the content passing over it.
 */

import { useScroll, useTransform, motion } from 'framer-motion'

export default function ParallaxPattern() {
  // Whole-document scroll progress (0 at top, 1 at bottom) — this section
  // has no local scroll container, so it tracks against the full page.
  const { scrollYProgress } = useScroll()

  // The pattern drifts a fraction of the total scroll distance — slower
  // than 1:1 with the page, which is what reads as "behind" the content
  // rather than pinned to it.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-[2]"
      style={{
        y,
        backgroundImage: 'url(/patterns/dupatta-motif.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: '560px auto',
        opacity: 0.12,
        mixBlendMode: 'screen',
      }}
    />
  )
}
