'use client'

import { ReactNode } from 'react'
import FloatingOrbs from './FloatingOrbs'

/**
 * RedAmbientBackground — the crimson floating-orb atmosphere used on every
 * page except the homepage (which has its own video-based ambient
 * background). Sticky-pinned behind the page's content for the full scroll.
 */
export default function RedAmbientBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="sticky top-0 h-screen w-full -mb-[100vh] z-0 bg-ink">
        <FloatingOrbs variant="crimson" count={5} className="z-[1]" />
        <div className="absolute inset-0 z-[2] bg-ink/45 pointer-events-none" />
      </div>
      <div className="relative z-[2]">{children}</div>
    </div>
  )
}
