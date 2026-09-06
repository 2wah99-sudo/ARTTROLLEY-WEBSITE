'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import FloatingOrbs from './FloatingOrbs'

function CountUp({
  target,
  duration = 1.8,
  suffix = '',
}: {
  target: number
  duration?: number
  suffix?: string
}) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const spanRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(spanRef, { once: true, margin: '-15% 0px -15% 0px' })

  useEffect(() => {
    if (!inView || target === 0) {
      setCount(target)
      setDone(true)
      return
    }
    const start = Date.now()
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.round(eased * target))
      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setDone(true)
      }
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return (
    <span
      ref={spanRef}
      className={done ? 'number-glow' : ''}
    >
      {count}{suffix}
    </span>
  )
}

const STATS = [
  { n: 11,  suffix: '',  label: 'Days to carve\none teak block' },
  { n: 400, suffix: '',  label: 'Impressions before\na block retires' },
  { n: 11,  suffix: '',  label: 'Pairs of hands\nper garment' },
  { n: 0,   suffix: '',  label: 'Synthetic dyes\never used' },
]

export default function NumbersStrip() {
  return (
    <section className="relative border-t border-b border-parchment/10 overflow-hidden">
      {/* Orbs behind the strip */}
      <FloatingOrbs variant="gold" count={3} />

      {/* Subtle horizontal scan line — decorative */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent z-[1]"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent z-[1]"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />

      {/* text-shadow inherits to every number + caption below — this strip
          sits over AmbientBackground's fabric loop and had no shadow at
          all, so both the big numbers and (especially) the small captions
          were blending straight into the busy pattern. */}
      <div
        className="relative z-[2] max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-parchment/10"
        style={{ textShadow: '0 3px 18px rgba(0,0,0,0.8), 0 1px 5px rgba(0,0,0,0.9)' }}
      >
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="group py-20 md:py-28 px-8 md:px-12 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: i * 0.09 }}
          >
            {/* Number */}
            <div
              className="font-serif font-light text-parchment leading-none tabular-nums relative"
              style={{ fontSize: 'clamp(4rem, 6.5vw, 7rem)' }}
            >
              {/* Glow halo behind number */}
              <div className="absolute inset-0 rounded-full blur-2xl bg-gold/0 group-hover:bg-gold/8 transition-all duration-700 scale-150" />
              <span className="relative">
                <CountUp target={s.n} suffix={s.suffix} />
              </span>
            </div>

            {/* Hand-drawn swoosh — a single stroke that draws itself in under
                the number, like a pen underlining the figure once it settles. */}
            <svg width="72" height="20" viewBox="0 0 72 20" fill="none" className="mt-4" aria-hidden="true">
              <motion.path
                d="M4 6 C 20 16, 52 16, 68 5"
                stroke="rgba(201,168,76,0.65)"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: i * 0.09 + 0.7 }}
              />
            </svg>

            <p className="mt-5 font-sans text-xs text-parchment/75 leading-relaxed whitespace-pre-line max-w-[18ch] group-hover:text-parchment/90 transition-colors duration-500">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
