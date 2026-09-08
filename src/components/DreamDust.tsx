'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * A slow, soft-glow floating-dust canvas layered over a film section for a
 * dreamier, more atmospheric read — the same ambient touch used on the
 * Built By Ruturaj build. Screen-blended so it only ever brightens, never
 * darkens, the footage underneath. Fully inert under reduced motion.
 */
export default function DreamDust({ className = '' }: { className?: string }) {
  const prefersReduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (prefersReduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0, raf = 0
    let visible = false
    type Dust = { x: number; y: number; r: number; vy: number; vx: number; a: number }
    let dust: Dust[] = []

    const resize = () => {
      w = canvas.width = canvas.clientWidth
      h = canvas.height = canvas.clientHeight
    }
    const init = () => {
      dust = Array.from({ length: 42 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        vy: Math.random() * 0.1 + 0.02,
        vx: (Math.random() - 0.5) * 0.04,
        a: Math.random() * 0.35 + 0.06,
      }))
    }
    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      dust.forEach((p) => {
        p.y -= p.vy
        p.x += p.vx
        if (p.y < 0) p.y = h
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(237,232,224,${p.a})`
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

    // Debounced (trailing edge, ~150ms) — see GoldenDust.tsx for the same
    // fix and rationale: a raw resize handler re-measures the canvas on
    // every single event fired while the user drags the window edge.
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
  }, [prefersReduced])

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
