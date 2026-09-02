'use client'

import { useEffect, useRef } from 'react'

/**
 * Drives a pinned scroll-scrub section with the same technique as the
 * skill's proven vanilla reference (scrubber-main.js): a single always-on
 * requestAnimationFrame loop that reads scroll position directly every
 * frame, rather than a GSAP ScrollTrigger `onUpdate` callback that only
 * fires off the back of a Lenis `scroll` event.
 *
 * That distinction matters under fast scrolling: an event-driven callback
 * can only run as often as its trigger event is dispatched, and a very
 * fast fling is exactly the condition where event delivery has the least
 * slack. A self-sustaining rAF loop never depends on that — it samples
 * scrollY on its own clock every frame, so there is no event chain that
 * can fall behind and leave the canvas showing a stale frame.
 */
export function useScrollScrub(
  sectionRef: React.RefObject<HTMLElement>,
  onProgress: (progress: number) => void,
  opts?: { onEnter?: () => void; onLeave?: () => void }
) {
  const onProgressRef = useRef(onProgress)
  onProgressRef.current = onProgress
  const optsRef = useRef(opts)
  optsRef.current = opts

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let raf = 0
    let inSection: boolean | null = null
    let lastProgress = -1
    let smooth = 0
    let lastT = performance.now()

    function tick(now: number) {
      const dt = Math.min((now - lastT) / 1000, 0.5) || 0.016
      lastT = now
      const rect = section!.getBoundingClientRect()
      const max = section!.offsetHeight - window.innerHeight
      const target = max > 0 ? Math.min(1, Math.max(0, -rect.top / max)) : 0
      // Weighted, time-based smoothing toward the raw scroll-derived target
      // — the same technique the skill's own vanilla reference uses. Without
      // it the frame directly mirrors raw scroll position 1:1, which reads
      // as twitchy/too-sensitive, and also asks the decoder to jump across
      // hundreds of frames instantly on a fast fling instead of catching up
      // progressively as the eased value travels toward the target.
      // Higher multiplier = tighter tracking of scroll position.
      // 18 keeps a tiny bit of smoothing to avoid single-frame noise
      // while following fast flings almost immediately.
      const k = 1 - Math.exp(-dt * 18)
      smooth += (target - smooth) * k
      if (Math.abs(target - smooth) < 0.0004) smooth = target
      const progress = smooth
      // The loop itself is unconditional (that's the whole point — it never
      // depends on a scroll event firing), but the expensive work behind
      // the callback (frame decode scheduling, canvas draw) only needs to
      // run when the position actually moved. At rest this keeps the tick
      // to a cheap rect read instead of 60fps of redundant canvas work.
      if (progress !== lastProgress) {
        lastProgress = progress
        onProgressRef.current(progress)
      }

      const nowIn = rect.top <= 0 && rect.bottom >= 0
      if (nowIn !== inSection) {
        inSection = nowIn
        if (nowIn) optsRef.current?.onEnter?.()
        else optsRef.current?.onLeave?.()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onResize = () => {}
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [sectionRef])
}
