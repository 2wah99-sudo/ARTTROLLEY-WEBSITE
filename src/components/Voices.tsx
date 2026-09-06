'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Reveal from './Reveal'
import GoldenDust from './GoldenDust'
import FloatingOrbs from './FloatingOrbs'

const QUOTES = [
  {
    text: 'You can feel where the block pressed harder. That unevenness is the whole point.',
    attr: 'Early owner, Bengaluru',
  },
  {
    text: 'Nothing about this reads as mass-produced — which is exactly why it took eleven weeks to arrive.',
    attr: 'Early owner, London',
  },
  {
    text: 'The indigo faded the way raw denim fades. On purpose, and beautifully.',
    attr: 'Early owner, Mumbai',
  },
]

export default function Voices() {
  const [active, setActive] = useState(0)

  return (
    <section id="stories" className="relative py-32 md:py-48 px-6 md:px-16 border-t border-parchment/10 overflow-hidden">
      {/* Atmospheric orbs */}
      <FloatingOrbs variant="mixed" count={3} />

      {/* Fine golden motes */}
      <GoldenDust count={45} className="z-[1]" />

      {/* Giant decorative open-quote watermark — animated drift */}
      <span
        aria-hidden="true"
        className="absolute -top-8 left-4 md:left-12 font-serif text-parchment leading-none pointer-events-none select-none quote-drift z-[1]"
        style={{ fontSize: 'clamp(8rem, 22vw, 22rem)', opacity: 0.045 }}
      >
        &ldquo;
      </span>

      {/* Decorative closing quote — bottom right, opposite drift phase */}
      <span
        aria-hidden="true"
        className="absolute bottom-4 right-4 md:right-12 font-serif text-parchment leading-none pointer-events-none select-none z-[1]"
        style={{
          fontSize: 'clamp(4rem, 10vw, 10rem)',
          opacity: 0.025,
          animation: 'quote-drift 14s ease-in-out infinite reverse',
        }}
      >
        &rdquo;
      </span>

      {/* text-shadow inherits to the header, quote and attribution below —
          this section sits over AmbientBackground's fabric loop and had no
          shadow anywhere. */}
      <div
        className="max-w-[1200px] mx-auto relative z-[2]"
        style={{ textShadow: '0 3px 18px rgba(0,0,0,0.8), 0 1px 5px rgba(0,0,0,0.9)' }}
      >
        {/* Header row */}
        <Reveal className="mb-20 md:mb-28 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <p className="label mb-3 text-gold/70">Voices</p>
            <p className="font-serif text-xl font-light text-parchment/75">
              What people notice after the first wash.
            </p>
          </div>

          {/* Navigation ticks */}
          <div className="flex items-center gap-5" role="group" aria-label="Navigate quotes">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Quote ${i + 1}`}
                aria-pressed={active === i}
                className={`h-px transition-all duration-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                  active === i ? 'w-12 bg-gold' : 'w-6 bg-parchment/25 hover:bg-parchment/50'
                }`}
              />
            ))}
          </div>
        </Reveal>

        {/* Quote body */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <blockquote>
              <p
                className="font-serif font-light text-parchment leading-[1.2]"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 3.75rem)' }}
              >
                &ldquo;{QUOTES[active].text}&rdquo;
              </p>
              <footer className="mt-10 flex items-center gap-5">
                {/* Animated gold rule */}
                <motion.div
                  className="h-px bg-gold/50"
                  initial={{ width: 0 }}
                  animate={{ width: '2rem' }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
                <cite className="label not-italic text-parchment/65 tracking-widest">
                  {QUOTES[active].attr}
                </cite>
              </footer>
            </blockquote>
          </motion.div>
        </AnimatePresence>

        {/* Auto-advance dots */}
        <div className="mt-16 flex items-center gap-2">
          {QUOTES.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
              animate={{
                width: active === i ? 28 : 6,
                backgroundColor: active === i ? 'rgba(201,168,76,0.7)' : 'rgba(237,232,224,0.15)',
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: 4, borderRadius: 2 }}
              aria-label={`Go to quote ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
