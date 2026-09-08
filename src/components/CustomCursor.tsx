'use client'

/**
 * CustomCursor — igloo-tier trailing cursor.
 *
 * Two layers:
 *   • Dot  — 5px gold circle, near-instant follow (0.08s lag)
 *   • Ring — 42px parchment ring, cinematic lag (0.48s)
 *
 * Hover states (via data-cursor-label on interactive elements):
 *   • Link / button            → ring expands 1.7×, turns gold
 *   • data-cursor-label="View" → ring expands 2.4×, shows label text
 *   • data-cursor-expand       → ring becomes a crosshair expand
 *
 * Hidden on coarse-pointer (touch) devices and when
 * prefers-reduced-motion is set — native cursor shown instead.
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const ringRef  = useRef<HTMLDivElement>(null)
  const dotRef   = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const isTouch   = window.matchMedia('(pointer: coarse)').matches
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || isReduced) return

    const ring  = ringRef.current
    const dot   = dotRef.current
    const label = labelRef.current
    if (!ring || !dot) return

    // Hide native cursor globally
    document.documentElement.classList.add('has-custom-cursor')

    // — quickTo setters — fast dot, lagging ring
    const dotX  = gsap.quickTo(dot,  'x', { duration: 0.08, ease: 'none' })
    const dotY  = gsap.quickTo(dot,  'y', { duration: 0.08, ease: 'none' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.48, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.48, ease: 'power3.out' })

    // Seed both to the centre so they don't fly in from (0,0) on first move
    const seed = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    gsap.set([dot, ring], { x: seed.x, y: seed.y })

    const onMove = (e: PointerEvent) => {
      dotX(e.clientX);  dotY(e.clientY)
      ringX(e.clientX); ringY(e.clientY)
    }
    document.addEventListener('pointermove', onMove, { passive: true })

    // — hover expand helpers —
    const expand = (el: Element) => {
      const cursorLabel = (el as HTMLElement).dataset.cursorLabel ?? ''
      if (label) label.textContent = cursorLabel

      const hasLabel = cursorLabel.length > 0
      gsap.to(ring, {
        scale: hasLabel ? 2.6 : 1.65,
        borderColor: 'rgba(201,168,76,0.75)',
        backgroundColor: hasLabel ? 'rgba(201,168,76,0.07)' : 'transparent',
        duration: 0.45,
        ease: 'power3.out',
      })
      gsap.to(dot, { scale: 0, duration: 0.25, ease: 'power2.out' })
    }

    const collapse = () => {
      if (label) label.textContent = ''
      gsap.to(ring, {
        scale: 1,
        borderColor: 'rgba(237,232,224,0.30)',
        backgroundColor: 'transparent',
        duration: 0.45,
        ease: 'power3.out',
      })
      gsap.to(dot, { scale: 1, duration: 0.25, ease: 'power2.out' })
    }

    // Event delegation instead of a MutationObserver. The previous approach
    // re-queried and re-attached listeners across the ENTIRE document.body
    // subtree on every single DOM mutation — and Framer Motion mounts/
    // unmounts sections constantly as they scroll into/out of view, so that
    // observer was firing (and doing a full querySelectorAll pass) far more
    // often than the cursor itself needed updates. That main-thread work was
    // competing directly with the cursor's own rAF-driven quickTo updates,
    // which is what read as cursor lag/stutter. Two delegated listeners on
    // `document` cover every current AND future matching element with zero
    // observer overhead and no attach/dataset bookkeeping.
    const HOVER_SELECTOR = 'a, button, [data-magnetic], [data-cursor-expand]'
    let hovered: Element | null = null

    const onPointerOver = (e: PointerEvent) => {
      const el = (e.target as Element)?.closest?.(HOVER_SELECTOR)
      if (!el || el === hovered) return
      hovered = el
      expand(el)
    }
    const onPointerOut = (e: PointerEvent) => {
      if (!hovered) return
      const related = e.relatedTarget as Element | null
      if (related && hovered.contains(related)) return // moved to a child, still "inside"
      hovered = null
      collapse()
    }
    document.addEventListener('pointerover', onPointerOver, { passive: true })
    document.addEventListener('pointerout', onPointerOut, { passive: true })

    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointerout', onPointerOut)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <>
      {/* Outer ring — slow follower */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9998] flex items-center justify-center rounded-full border"
        style={{
          width: 42,
          height: 42,
          marginLeft: -21,
          marginTop: -21,
          borderColor: 'rgba(237,232,224,0.30)',
          willChange: 'transform',
          backdropFilter: 'blur(0px)',
        }}
      >
        <span
          ref={labelRef}
          style={{
            fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
            fontSize: '8px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.9)',
            lineHeight: 1,
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        />
      </div>

      {/* Inner dot — instant follower */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          width: 5,
          height: 5,
          marginLeft: -2.5,
          marginTop: -2.5,
          background: 'rgba(201,168,76,0.9)',
          willChange: 'transform',
        }}
      />
    </>
  )
}
