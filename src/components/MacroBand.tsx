'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

// Google Flow / Nano Banana 2 craft photography — no external stock images
const MACRO_FRAMES = [
  '/flow-assets/macro-block-impression-2k.png',
  '/flow-assets/macro-dye-lift-2k.png',
  '/flow-assets/macro-embroidery-frame-2k.png',
  '/flow-assets/macro-mirror-work-2k.png',
  '/flow-assets/macro-boutique-mirror-2k.png',
]

const MARQUEE = 'HAND BLOCK · NATURAL DYE · ARTISAN CRAFT · BAGRU, RAJASTHAN · HERITAGE SINCE 1932 · '

export default function MacroBand() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  // Images scroll left faster than page
  const x = useTransform(scrollYProgress, [0, 1], ['2%', '-30%'])
  // Marquee scrolls right (opposite direction) — slower
  const mx = useTransform(scrollYProgress, [0, 1], ['0%', '8%'])
  // Second marquee line — same direction as images, faster
  const mx2 = useTransform(scrollYProgress, [0, 1], ['0%', '-6%'])

  return (
    <section ref={ref} className="relative py-20 md:py-28 overflow-hidden border-t border-parchment/10">

      {/* Top scrolling text strip — moves opposite to images */}
      <div className="mb-8 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div style={{ x: mx }} className="flex whitespace-nowrap w-max">
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="font-serif font-light text-parchment/[0.10] pr-8"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5rem)' }}
            >
              {MARQUEE}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Horizontal image strip with parallax */}
      <motion.div style={{ x }} className="flex gap-4 md:gap-6 px-6 md:px-16 w-max">
        {MACRO_FRAMES.map((src, i) => (
          <div
            key={src}
            className="relative group overflow-hidden flex-shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              loading="lazy"
              className={`h-[40vh] md:h-[56vh] w-auto object-cover ${i % 2 === 0 ? '' : 'md:mt-14'}
                          transition-[filter,transform] duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)]
                          group-hover:scale-[1.04] group-hover:saturate-110`}
              style={{ filter: 'saturate(0.85) contrast(1.06)' }}
            />
            {/* Gold overlay on hover */}
            <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/[0.04] transition-colors duration-700" />
            {/* Bottom gold line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold/0 group-hover:bg-gold/40 transition-colors duration-700" />
          </div>
        ))}
      </motion.div>

      {/* Bottom scrolling text strip — moves with images */}
      <div className="mt-8 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div style={{ x: mx2 }} className="flex whitespace-nowrap w-max">
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="label text-parchment/[0.07] pr-16 tracking-[0.4em]"
              style={{ fontSize: 'clamp(0.6rem, 1.2vw, 1rem)' }}
            >
              {MARQUEE}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
