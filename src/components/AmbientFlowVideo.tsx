'use client'

/**
 * AmbientFlowVideo — the flowing block-print fabric clip, looped and muted
 * as a full-bleed atmospheric layer behind the site's content. Sits inside
 * AmbientBackground's sticky layer, so it stays pinned to the viewport for
 * the whole Manifesto→Footer scroll.
 *
 * Parallax: the video element is rendered taller than its container (160%)
 * and translated upward as the page scrolls, so it visibly travels through
 * its own extra height rather than just wobbling in a fixed box — the box
 * itself can't move since it's pinned, but the oversized video inside it
 * can, which is what actually reads as continuous downward-flowing motion
 * as you scroll rather than a loop stuck in one place.
 */

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function AmbientFlowVideo() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  // The video is 160% of the container's height, so it has 60% of headroom
  // to travel through. Translating it from 0 up to that full headroom as
  // scrollYProgress goes 0→1 means new footage keeps entering from the
  // bottom the entire time you scroll — genuine continuous travel, not a
  // small oscillation.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-38%'])

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.video
        aria-hidden="true"
        className="absolute left-0 w-full object-cover pointer-events-none"
        style={{
          top: 0,
          height: '160%',
          y,
          // Pulled back from 0.55/1.6 — bright patches in the fabric loop
          // were reaching near-white under 'screen' blend, which is exactly
          // where light parchment-coloured text (used everywhere from the
          // Manifesto down) loses contrast and disappears into it. This is
          // now dim enough to stay a background, not compete with content.
          opacity: 0.32,
          filter: 'brightness(1.15)',
          mixBlendMode: 'screen',
        }}
        src="/videos/ambient-flow.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  )
}
