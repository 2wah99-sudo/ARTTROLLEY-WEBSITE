'use client'

import { useEffect, useRef, useState } from 'react'

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

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '20% 0px',
    })
    observer.observe(el)
    return () => observer.disconnect()
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

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      {ORB_CONFIGS.map((orb, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${orb.animClass}`}
          style={{
            width: orb.w,
            height: orb.h,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(ellipse at center, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(80px)',
            animationDelay: orb.delay,
            animationPlayState: inView ? 'running' : 'paused',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  )
}
