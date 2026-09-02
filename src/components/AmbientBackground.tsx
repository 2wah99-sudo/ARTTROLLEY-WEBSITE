'use client'

import { ReactNode } from 'react'
import Auralis from './ui/auralis'
import FloatingOrbs from './FloatingOrbs'

// Blood red — deep crimson/maroon palette as requested.
// #8b0000 (dark red), #b22222 (firebrick), #7a0000 (near-black red),
// #dc143c (crimson) — saturated blood-red range, no orange or gold.
const AURALIS_COLORS = ['#8b0000', '#b22222', '#7a0000', '#dc143c']

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
  return (
    <div className="relative">
      {/* Sticky canvas — stays pinned while children scroll over it */}
      <div className="sticky top-0 h-screen w-full -mb-[100vh] z-0">
        <Auralis
          height="100%"
          colors={AURALIS_COLORS}
          speed={0.22}
          grain={0.28}
          className="absolute inset-0"
        />
        {/* Large floating orbs — blood-red depth layer */}
        <FloatingOrbs variant="crimson" count={5} className="z-[1]" />
        {/* Ink overlay — slightly more transparent than before so the WebGL
            and orbs read through. Was bg-ink/60; now bg-ink/50. */}
        <div className="absolute inset-0 z-[2] bg-ink/50 pointer-events-none" />
      </div>
      <div className="relative z-[2]">{children}</div>
    </div>
  )
}
