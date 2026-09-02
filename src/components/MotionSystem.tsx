'use client'

/**
 * MotionSystem — cinematic GSAP motion layer (rideradian + igloo tier)
 *
 * 1. Magnetic buttons       — data-magnetic elements pull toward cursor
 * 2. Mouse-parallax         — data-mouse-parallax sections with depth layers
 * 3. Section scale-entry    — every content section breathes in from scale(0.97)
 *                             as it enters the viewport (the "rolling in" weight
 *                             that makes rideradian / premium sites feel physical)
 * 4. Clip image reveals     — data-image-reveal wipe-in on scroll
 * 5. Generic scroll reveals — data-reveal="fade-up|blur-in|scale|…"
 */

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// querySelectorAll + Array.from is used throughout instead of gsap.utils.toArray
// because in this GSAP build toArray(string) returns a NodeList-like object that
// lacks .forEach in some Webpack output modes, causing a runtime crash.
// Array.from(document.querySelectorAll(...)) always yields a true Array.
function qsa(selector: string): HTMLElement[] {
  // No generic angle brackets here — in .tsx files <T> in expression position
  // is parsed as a JSX opening tag, not a type argument, causing a runtime crash.
  // The `as` cast is the TSX-safe equivalent.
  return Array.from(document.querySelectorAll(selector)) as HTMLElement[]
}

export default function MotionSystem() {
  useEffect(() => {
    const isTouch   = window.matchMedia('(pointer: coarse)').matches
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── 1. Magnetic buttons ───────────────────────────────────────────────
    if (!isTouch && !isReduced) {
      qsa('[data-magnetic]').forEach(el => {
        const strength = parseFloat(el.dataset.magnetic || '0.22')
        const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
        const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
        const onMove  = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          xTo((e.clientX - r.left - r.width  / 2) * strength)
          yTo((e.clientY - r.top  - r.height / 2) * strength)
        }
        const onLeave = () => { xTo(0); yTo(0) }
        el.addEventListener('pointermove',  onMove)
        el.addEventListener('pointerleave', onLeave)
      })
    }

    // ── 2. Mouse-parallax sections ────────────────────────────────────────
    if (!isTouch && !isReduced) {
      qsa('[data-mouse-parallax]').forEach(section => {
        const layers = Array.from(section.querySelectorAll('[data-mouse-depth]')) as HTMLElement[]
        const setters = Array.from(layers).map(layer => ({
          xTo: gsap.quickTo(layer, 'x', { duration: 0.9, ease: 'power3.out' }),
          yTo: gsap.quickTo(layer, 'y', { duration: 0.9, ease: 'power3.out' }),
          depth: parseFloat(layer.dataset.mouseDepth || '0.04'),
        }))
        const onMove  = (e: PointerEvent) => {
          const r  = section.getBoundingClientRect()
          const cx = e.clientX - r.left - r.width  / 2
          const cy = e.clientY - r.top  - r.height / 2
          setters.forEach(s => { s.xTo(cx * s.depth); s.yTo(cy * s.depth) })
        }
        const onLeave = () => setters.forEach(s => { s.xTo(0); s.yTo(0) })
        section.addEventListener('pointermove',  onMove)
        section.addEventListener('pointerleave', onLeave)
      })
    }

    if (isReduced) return

    const ctx = gsap.context(() => {

      // ── 3. Section scale-entry (rideradian "rolling in" weight) ──────────
      //    Each content section enters from scale(0.97) → scale(1), reading
      //    as physical mass arriving from slightly below the visual plane.
      //    Excludes the two pinned films — they own their own scroll system.
      qsa('section:not(#hero-film):not(#atelier-film)').forEach(section => {
        gsap.fromTo(
          section,
          { scale: 0.97, autoAlpha: 0.65 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 1.3,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 92%',
              once: true,
            },
          },
        )
      })

      // ── 4. Clip image reveals ─────────────────────────────────────────────
      qsa('[data-image-reveal]').forEach(figure => {
        const img = figure.querySelector('img')
        gsap.set(figure, { autoAlpha: 1, visibility: 'visible' })
        const tl = gsap.timeline({
          scrollTrigger: { trigger: figure, start: 'top 84%', once: true },
        })
        tl.fromTo(
          figure,
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 1.15, ease: 'power4.out' },
        )
        if (img) {
          tl.fromTo(
            img,
            { scale: 1.08, autoAlpha: 0.8 },
            { scale: 1,    autoAlpha: 1,    duration: 1.25, ease: 'power4.out' },
            0,
          )
        }
      })

      // ── 5. Generic scroll reveals ─────────────────────────────────────────
      const presets: Record<string, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
        'fade-up':     { from: { y: 28,  autoAlpha: 0 },                         to: { y: 0, autoAlpha: 1 } },
        'blur-in':     { from: { y: 16,  autoAlpha: 0, filter: 'blur(10px)' },   to: { y: 0, autoAlpha: 1, filter: 'blur(0px)' } },
        'scale':       { from: { scale: 0.96, autoAlpha: 0 },                    to: { scale: 1, autoAlpha: 1 } },
        'slide-left':  { from: { x: 44,  autoAlpha: 0 },                         to: { x: 0, autoAlpha: 1 } },
        'slide-right': { from: { x: -44, autoAlpha: 0 },                         to: { x: 0, autoAlpha: 1 } },
      }

      qsa('[data-reveal]:not([data-reveal-item])').forEach(el => {
        const key    = el.dataset.reveal ?? 'fade-up'
        const preset = presets[key] ?? presets['fade-up']
        const delay  = parseFloat(el.dataset.revealDelay ?? '0')
        gsap.set(el, { autoAlpha: 1, visibility: 'visible' })
        gsap.fromTo(el, preset.from, {
          ...preset.to,
          duration: 0.95,
          ease: 'power4.out',
          delay,
          scrollTrigger: { trigger: el, start: 'top 84%', once: true },
        })
      })

      qsa('[data-reveal-group]').forEach(group => {
        const items = group.querySelectorAll('[data-reveal-item]')
        gsap.set(group, { autoAlpha: 1, visibility: 'visible' })
        gsap.fromTo(
          items,
          { y: 32, autoAlpha: 0, filter: 'blur(6px)' },
          {
            y: 0, autoAlpha: 1, filter: 'blur(0px)',
            duration: 1, ease: 'power4.out', stagger: 0.08,
            scrollTrigger: { trigger: group, start: 'top 82%', once: true },
          },
        )
      })
    })

    return () => ctx.revert()
  }, [])

  return null
}
