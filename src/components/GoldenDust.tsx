'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { scaleCount } from '@/lib/perfTier'

/**
 * GoldenDust — A richer, gold-toned variant of DreamDust for the editorial
 * below-fold sections. Larger mote count, warm amber-gold fill, slower drift
 * so it reads as suspended fabric-dust in raking gallery light. Screen-blend
 * mode means it only ever brightens — it can never darken content below.
 */
export default function GoldenDust({
  count = 80,
  className = '',
}: {
  count?: number
  className?: string
}) {
  const prefersReduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (prefersReduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0,
      h = 0,
      raf = 0
    // Only animate while this canvas is actually on screen — with up to
    // half a dozen of these mounted across the page, an unconditional rAF
    // loop per instance is the single biggest source of scroll jank.
    let visible = false

    type Mote = {
      x: number
      y: number
      r: number
      vy: number
      vx: number
      a: number
      aDir: number
      aSpeed: number
      gold: number // 0 = warm white, 1 = deep gold
    }

    let motes: Mote[] = []

    const resize = () => {
      w = canvas.width = canvas.clientWidth
      h = canvas.height = canvas.clientHeight
    }

    // Scaled down on weak/slow devices — with up to half a dozen of these
    // mounted down the page, the per-instance mote count multiplies fast.
    const effectiveCount = scaleCount(count);

    const init = () => {
      motes = Array.from({ length: effectiveCount }, () => {
        const gold = Math.random()
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2.2 + 0.4,
          vy: Math.random() * 0.08 + 0.01,
          vx: (Math.random() - 0.5) * 0.06,
          a: Math.random() * 0.25 + 0.04,
          aDir: Math.random() > 0.5 ? 1 : -1,
          aSpeed: Math.random() * 0.002 + 0.0005,
          gold,
        }
      })
    }

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      motes.forEach((m) => {
        m.y -= m.vy
        m.x += m.vx
        m.a += m.aDir * m.aSpeed
        if (m.a < 0.02 || m.a > 0.35) m.aDir *= -1

        if (m.y < -5) { m.y = h + 5; m.x = Math.random() * w }
        if (m.x < -5) m.x = w + 5
        if (m.x > w + 5) m.x = -5

        // Interpolate between warm white and deep gold
        const r = Math.round(237 - m.gold * 36)  // 237 → 201
        const g = Math.round(232 - m.gold * 64)  // 232 → 168
        const b = Math.round(224 - m.gold * 148) // 224 → 76

        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${m.a})`
        ctx.fill()
      })
      raf = requestAnimationFrame(tick)
    }

    resize()
    init()

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) {
          cancelAnimationFrame(raf)
          raf = requestAnimationFrame(tick)
        } else {
          cancelAnimationFrame(raf)
          ctx.clearRect(0, 0, w, h)
        }
      },
      { threshold: 0 }
    )
    observer.observe(canvas)

    // Debounced (trailing edge, ~150ms) — a raw window resize fires
    // continuously while the user drags the window edge, and each call was
    // synchronously re-measuring the canvas AND reallocating the whole
    // mote array. Waiting for resize events to go quiet before doing that
    // work once means a resize drag no longer pays for N reinits, just one.
    let resizeTimeout: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => { resize(); init() }, 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimeout)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [prefersReduced, count])

  if (prefersReduced) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
