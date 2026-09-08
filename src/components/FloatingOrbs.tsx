'use client'

import { useEffect, useRef, useState } from 'react'
import { getPerfTier, type Tier } from '@/lib/perfTier'

/**
 * FloatingOrbs — Large, heavily-blurred radial-gradient spheres that drift
 * slowly across the background of a section. Pure CSS animations, near-zero
 * JS overhead — but with a dozen-plus instances stacked down the page, a
 * blur(80px) filter that keeps compositing while fully off screen is real
 * cost. An IntersectionObserver pauses the animation (and skips the blur
 * repaint) whenever the section isn't in view.
 *
 * Usage: drop as a direct child inside a `relative overflow-hidden` section.
 * z-index is intentionally 0 — sit below content without a z-[n] override.
 */
export default function FloatingOrbs({
  variant = 'gold',
  count = 4,
  className = '',
}: {
  variant?: 'gold' | 'crimson' | 'mixed'
  count?: number
  className?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  // Deferred to post-mount: getPerfTier() reads navigator/connection, which
  // don't exist during SSR — calling it directly in the render body gave
  // the server ('high', its safe fallback) and the client (the real
  // hardware/network tier) different output on the very first render,
  // which is a hydration mismatch (React warns and remounts the tree).
  // Starting at 'high' matches what the server actually rendered, then
  // correcting to the real tier in an effect keeps that first render
  // identical and only adjusts afterward.
  const [tier, setTier] = useState<Tier>('high')

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '20% 0px',
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setTier(getPerfTier())
  }, [])
  const ORB_CONFIGS = [
    {
      color:
        variant === 'crimson'
          ? 'rgba(139,0,0,0.18)'       // blood red #8b0000
          : variant === 'mixed'
          ? 'rgba(201,168,76,0.09)'
          : 'rgba(201,168,76,0.09)',
      w: 700,
      h: 500,
      top: '5%',
      left: '-8%',
      animClass: 'orb-drift-1',
      delay: '0s',
    },
    {
      color:
        variant === 'crimson'
          ? 'rgba(178,34,34,0.14)'     // firebrick #b22222
          : variant === 'mixed'
          ? 'rgba(181,98,42,0.09)'
          : 'rgba(201,168,76,0.07)',
      w: 900,
      h: 700,
      top: '40%',
      left: '55%',
      animClass: 'orb-drift-2',
      delay: '-7s',
    },
    {
      color:
        variant === 'crimson'
          ? 'rgba(122,0,0,0.16)'       // near-black red #7a0000
          : variant === 'mixed'
          ? 'rgba(220,20,60,0.07)'
          : 'rgba(181,98,42,0.08)',
      w: 600,
      h: 600,
      top: '70%',
      left: '20%',
      animClass: 'orb-drift-3',
      delay: '-13s',
    },
    {
      color:
        variant === 'crimson'
          ? 'rgba(220,20,60,0.10)'     // crimson #dc143c
          : variant === 'mixed'
          ? 'rgba(201,168,76,0.07)'
          : 'rgba(201,168,76,0.06)',
      w: 500,
      h: 400,
      top: '20%',
      left: '75%',
      animClass: 'orb-drift-4',
      delay: '-4s',
    },
    {
      color:
        variant === 'crimson'
          ? 'rgba(139,0,0,0.12)'       // dark blood red
          : variant === 'mixed'
          ? 'rgba(139,0,0,0.07)'
          : 'rgba(181,98,42,0.05)',
      w: 800,
      h: 350,
      top: '85%',
      left: '60%',
      animClass: 'orb-drift-5',
      delay: '-19s',
    },
  ].slice(0, count)

  // blur(80px) over a 700-900px element is a real per-frame compositor cost
  // — with a dozen-plus FloatingOrbs instances down the page, a weak GPU
  // (most of what "worse conditions" means in practice) pays for this even
  // while paused-but-visible. Halve both the blur radius and orb count on
  // low tier rather than cutting the effect entirely — it stays visible,
  // just cheaper to paint. `tier` comes from state (see above) so it starts
  // at the SSR-safe 'high' value and only downgrades after mount.
  const orbs = tier === 'low' ? ORB_CONFIGS.slice(0, Math.ceil(count / 2)) : ORB_CONFIGS
  const blurPx = tier === 'low' ? 40 : 80

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${orb.animClass}`}
          style={{
            width: orb.w,
            height: orb.h,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(ellipse at center, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${blurPx}px)`,
            animationDelay: orb.delay,
            animationPlayState: inView ? 'running' : 'paused',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  )
}
