'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import DreamDust from './DreamDust'

/**
 * A full-bleed editorial image moment — the courtyard model shot (Google
 * Flow / Nano Banana 2, locally upscaled to ~2K), placed as its own
 * cinematic beat between the craft chapters and the texture band. A slow
 * parallax drift on the image keeps it feeling alive rather than static.
 * DreamDust adds a fine film-grain haze for a more cinematic feel.
 */
export default function EditorialMoment() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  // Caption slides and fades in from below as section enters
  const captionY = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [32, 0, 0, -24])
  const captionOpacity = useTransform(scrollYProgress, [0.05, 0.25, 0.75, 0.95], [0, 1, 1, 0])

  return (
    <section ref={ref} className="relative h-[85vh] md:h-screen overflow-hidden border-t border-parchment/10">
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/flow-assets/model-courtyard-kurti-2k.webp"
          alt="Arttrolley kurti, worn in a sunlit Rajasthan courtyard"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Film-grain haze */}
      <DreamDust className="z-[2]" />

      {/* Scrim for caption legibility */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(6,6,6,0.88) 0%, rgba(6,6,6,0.12) 45%, transparent 65%), ' +
            'linear-gradient(to right, rgba(6,6,6,0.40), transparent 32%, transparent 72%, rgba(6,6,6,0.18))',
        }}
      />

      {/* Scroll-driven caption */}
      <motion.div
        style={{ y: captionY, opacity: captionOpacity }}
        className="absolute inset-0 z-[4] flex flex-col justify-end px-6 md:px-16 pb-16 md:pb-24"
      >
        <p className="label mb-4 text-gold/80">Worn, Not Displayed</p>
        <h2
          className="font-serif font-light text-parchment leading-[1.1] max-w-2xl"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 3.5rem)' }}
        >
          Every print is designed to move the way the wearer does.
        </h2>

        {/* Animated rule under headline */}
        <motion.div
          className="mt-6 h-px bg-gold/40 origin-left"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          style={{ width: '4rem' }}
        />
      </motion.div>
    </section>
  )
}
