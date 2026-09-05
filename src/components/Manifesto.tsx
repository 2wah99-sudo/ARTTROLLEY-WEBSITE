'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import FloatingOrbs from './FloatingOrbs'
import GoldenDust from './GoldenDust'
import ScrollRevealText from './ScrollRevealText'

// Block-print inspired geometric SVG motif — a stylised grid of repeating
// diamonds drawn with a single path. Rendered as a faint watermark in the
// top-right corner of the Manifesto, where it reads as printed textile.
function BlockPrintStamp({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`absolute pointer-events-none select-none stamp-breathe ${className}`}
    >
      {/* Outer diamond */}
      <path d="M60 4 L116 60 L60 116 L4 60 Z" stroke="currentColor" strokeWidth="0.8" />
      {/* Inner diamond */}
      <path d="M60 22 L98 60 L60 98 L22 60 Z" stroke="currentColor" strokeWidth="0.8" />
      {/* Center cross */}
      <path d="M60 38 L82 60 L60 82 L38 60 Z" stroke="currentColor" strokeWidth="0.8" />
      {/* Petal marks on outer diamond midpoints */}
      <circle cx="60" cy="4"   r="2.5" fill="currentColor" />
      <circle cx="116" cy="60" r="2.5" fill="currentColor" />
      <circle cx="60" cy="116" r="2.5" fill="currentColor" />
      <circle cx="4" cy="60"   r="2.5" fill="currentColor" />
      {/* Cardinal dot fills */}
      <circle cx="60" cy="60"  r="3"   fill="currentColor" />
      {/* Corner ticks */}
      <path d="M8 8 L18 8 M8 8 L8 18" stroke="currentColor" strokeWidth="0.8" />
      <path d="M112 8 L102 8 M112 8 L112 18" stroke="currentColor" strokeWidth="0.8" />
      <path d="M8 112 L18 112 M8 112 L8 102" stroke="currentColor" strokeWidth="0.8" />
      <path d="M112 112 L102 112 M112 112 L112 102" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  )
}

// Word-by-word stagger reveal for the headline. Splits on spaces and wraps
// each word in its own motion.span with a staggered delay.
function WordReveal({
  text,
  className = '',
  baseDelay = 0,
}: {
  text: string
  className?: string
  baseDelay?: number
}) {
  const words = text.split(' ')
  return (
    <span className={`inline ${className}`} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 28, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-5% 0px -5% 0px' }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
            delay: baseDelay + i * 0.07,
          }}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </span>
  )
}

// Animated gold rule — draws from left to right on scroll-entry.
function AnimatedRule({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="bg-gold/50 h-px"
      initial={{ scaleX: 0, originX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay }}
      style={{ transformOrigin: 'left' }}
    />
  )
}

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // Foreground content drifts up (negative) while the background motif
  // layer drifts down (positive) — opposing directions at different rates
  // is what reads as depth/parallax rather than everything moving together.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-6%'])
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])

  return (
    <section
      ref={ref}
      id="manifesto"
      data-mouse-parallax
      className="relative py-48 md:py-72 px-6 md:px-16 overflow-hidden"
    >
      {/* Atmospheric floating orbs */}
      <FloatingOrbs variant="gold" count={3} />

      {/* Fine golden dust motes */}
      <GoldenDust count={60} className="z-[1]" />

      {/* Background motif layer — scroll-parallaxed opposite the foreground
          content below (bgY vs y), on top of the existing mouse-driven
          depth so the motifs respond to both scroll and cursor. */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none z-[1]">
        <div data-mouse-depth="0.025" className="absolute inset-0">
          <BlockPrintStamp
            className="text-parchment w-[280px] md:w-[420px] top-8 right-4 md:right-12 opacity-100"
          />
        </div>

        {/* Bottom-left mirror motif — opposite depth so they drift apart */}
        <div data-mouse-depth="-0.018" className="absolute inset-0">
          <BlockPrintStamp
            className="text-parchment w-[160px] md:w-[240px] bottom-16 left-4 md:left-12 opacity-100 [animation-delay:-4s]"
          />
        </div>
      </motion.div>

      {/* Chapter marker */}
      <motion.span
        className="absolute top-12 left-6 md:left-16 label text-parchment/20 tabular-nums z-[2]"
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        01&nbsp;/&nbsp;Manifesto
      </motion.span>

      {/* Animated thin gold rule */}
      <div className="relative z-[2] w-10 mb-14 md:mb-20">
        <AnimatedRule />
      </div>

      <motion.div style={{ y }} className="max-w-[1440px] relative z-[2]">
        {/* Word-by-word headline reveal */}
        <h2
          className="font-serif font-light leading-[1.04] text-parchment"
          style={{ fontSize: 'clamp(2.75rem, 8.5vw, 8rem)' }}
        >
          <WordReveal text="Most people buy clothes." baseDelay={0} />
          <br />
          <WordReveal text="You either collect a" baseDelay={0.2} />{' '}
          <motion.em
            className="text-clay not-italic"
            style={{ borderBottom: '2px solid rgba(181,98,42,0.4)' }}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
          >
            legacy
          </motion.em>
          <WordReveal text="," baseDelay={0.6} />
          <br />
          <WordReveal text="or you watch from outside." baseDelay={0.4} />
        </h2>

        <div className="mt-14 md:mt-20 flex flex-col md:flex-row md:items-end md:justify-end gap-8">
          <motion.div
            className="md:max-w-[48ch] md:text-right"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          >
            <ScrollRevealText
              className="prose-body font-sans md:text-lg text-smoke font-light"
              text="Slow fashion, heritage craft preserved by hand, and an uncompromising standard of artisanal luxury — Arttrolley makes clothing the way it was made before speed became the point."
            />
            <a
              href="/collection"
              className="inline-block mt-7 label text-gold/80 hover:text-gold transition-colors duration-500 border-b border-gold/30 hover:border-gold pb-px"
            >
              Enter the collection →
            </a>
          </motion.div>
        </div>

        {/* Full-width animated gold rule at section bottom */}
        <div className="mt-24 md:mt-32">
          <AnimatedRule delay={0.5} />
        </div>
      </motion.div>
    </section>
  )
}
