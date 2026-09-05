'use client'

/**
 * FullBleedCTA — ERA Residence's "Sea Views" full-bleed call-to-action section.
 * A cinematic full-viewport image with a centred headline and a single CTA.
 * The image has a deep overlay so the text is always legible.
 */

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import LineReveal from './LineReveal'

export default function FullBleedCTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  // Background drifts slower than scroll for a subtle parallax depth cue.
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section ref={sectionRef} className="relative h-[85vh] min-h-[520px] overflow-hidden flex items-center justify-center">
      {/* Background image — clip-path reveal on entry, parallax on scroll */}
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
        viewport={{ once: true }}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src="/frames/hero/frame_180.webp"
          alt="Arttrolley heritage textiles"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y: imgY, scale: 1.16 }}
          aria-hidden="true"
        />
      </motion.div>

      {/* Deep overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(6,6,6,0.35) 0%, rgba(6,6,6,0.65) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <motion.p
          className="label text-gold/70 mb-6"
          style={{ letterSpacing: '0.35em' }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          Limited Availability
        </motion.p>

        <LineReveal
          as="h2"
          className="font-serif font-light text-parchment leading-[1.05]"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
          delay={0.1}
        >
          <span>Wear something</span>
          <span className="text-clay">made to outlast you.</span>
        </LineReveal>

        <motion.div
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        >
          {/* Primary CTA — solid clay button, ERA-style */}
          <a
            href="/collection"
            data-magnetic="0.18"
            className="inline-flex items-center gap-3 px-10 py-4 bg-clay text-ink
                       label hover:bg-gold transition-colors duration-500
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            style={{ letterSpacing: '0.2em', fontSize: '0.7rem' }}
          >
            View Collection
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
              <path d="M0 5h12M8 1l4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          {/* Secondary CTA — ghost / outline style */}
          <a
            href="#inquire"
            data-magnetic="0.15"
            className="inline-flex items-center gap-3 px-10 py-4 border border-parchment/35
                       text-parchment/70 label hover:border-gold/60 hover:text-gold
                       transition-colors duration-500 focus-visible:outline-none"
            style={{ letterSpacing: '0.2em', fontSize: '0.7rem' }}
          >
            Private Inquiry
          </a>
        </motion.div>
      </div>

      {/* Bottom text strip */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-between px-6 md:px-16">
        <p className="label text-parchment/30" style={{ fontSize: '0.6rem', letterSpacing: '0.2em' }}>
          Bagru, Rajasthan · Est. 2024
        </p>
        <p className="label text-parchment/30" style={{ fontSize: '0.6rem', letterSpacing: '0.2em' }}>
          Arttrolley®
        </p>
      </div>
    </section>
  )
}
