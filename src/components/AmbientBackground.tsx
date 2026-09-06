'use client'

import { ReactNode, useRef } from 'react'
import AmbientFlowVideo from './AmbientFlowVideo'

/**
 * One shared WebGL background for every section from the Manifesto through
 * the footer — deliberately a single Auralis canvas rather than one per
 * section. Sticky positioning keeps this one canvas pinned behind the whole
 * scroll range without interfering with the Hero/Atelier films above.
 *
 * A FloatingOrbs layer on top of Auralis adds large slow-moving light blobs
 * that give depth and a "heavy" atmospheric motion the static shader alone
 * can't produce.
 */
export default function AmbientBackground({ children }: { children: ReactNode }) {
  // Passed down to AmbientFlowVideo so its scroll-driven parallax scopes to
  // THIS section's own scroll range (Manifesto through Footer) instead of
  // the whole document from pixel 0 — see AmbientFlowVideo.tsx for why that
  // was a real, measured cost during hero scrolling despite this video not
  // even being visible yet at that point.
  const rangeRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative" ref={rangeRef}>
      {/* Sticky canvas — stays pinned while children scroll over it */}
      <div className="sticky top-0 h-screen w-full -mb-[100vh] z-0 bg-ink">
        {/* AI-generated flowing block-print fabric loop — the actual
            "parallax background video" ask, muted/looped/screen-blended
            above the shader, below the dimming overlay so it stays subtle. */}
        <AmbientFlowVideo rangeRef={rangeRef} />

        {/* Ink overlay — raised again (was /55) alongside dimming the video
            itself; the two together are what actually fixes legibility —
            one dimmer layer alone still let bright fabric passages compete
            with parchment-coloured headlines and body copy in Manifesto,
            Craft, and everything else this background sits behind.
            Bracket syntax, not `/72` — Tailwind's default opacity scale
            only has fixed steps (…70, 75, 80…); a bare `/72` silently
            compiles to NO background at all instead of erroring, which is
            exactly what was quietly defeating this fix. */}
        <div className="absolute inset-0 z-[2] bg-ink/[0.72] pointer-events-none" />
      </div>
      <div className="relative z-[2]">{children}</div>
    </div>
  )
}
