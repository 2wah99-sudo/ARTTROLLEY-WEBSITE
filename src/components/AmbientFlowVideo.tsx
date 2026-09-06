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
 *
 * `rangeRef` — passed down from AmbientBackground. Its `useScroll()` used
 * to have no target at all, meaning it tracked the ENTIRE document's scroll
 * progress from pixel 0. On this page that includes the hero's 1000vh pin —
 * so this component was recomputing a real DOM transform on every single
 * scroll tick of hero scrolling, despite not even being visible yet, and
 * despite the resulting 0→~25%-of-total progress being far too small a
 * slice of its [0,1]→['0%','-38%'] mapping to produce the intended visible
 * "continuous flow" during its own section anyway. Scoping to the ambient
 * section's own container fixes both: less always-on work, and the
 * intended travel distance now actually happens across its own section.
 */

import { RefObject } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function AmbientFlowVideo({
  rangeRef,
}: {
  rangeRef: RefObject<HTMLDivElement>
}) {
  const { scrollYProgress } = useScroll({
    target: rangeRef,
    offset: ['start start', 'end end'],
  })
  // The video is 160% of the container's height, so it has 60% of headroom
  // to travel through. Translating it from 0 up to that full headroom as
  // scrollYProgress goes 0→1 means new footage keeps entering from the
  // bottom the entire time you scroll — genuine continuous travel, not a
  // small oscillation.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-38%'])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.video
        aria-hidden="true"
        className="absolute left-0 w-full object-cover pointer-events-none"
        style={{
          top: 0,
          height: '160%',
          y,
          // Restored to the clip's original color — 'screen' blend was
          // washing every bright patch toward white, which is what made it
          // read as a pale, desaturated ghost instead of the actual
          // block-print footage. Plain opacity over the page background
          // keeps it a background layer (content still sits clearly on top)
          // without stripping its color.
          opacity: 0.7,
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
