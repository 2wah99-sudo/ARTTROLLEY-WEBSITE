'use client'

/**
 * CraftProcess — ERA Residence's tabbed amenity interface, translated to
 * Arttrolley's 5-step block-print process.
 *
 * Horizontal tab labels across the top, full-bleed image + text panel below.
 * Active tab slides a gold underline. Image crossfades between steps.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LineReveal from './LineReveal'

const STEPS = [
  {
    num: '01',
    title: 'Block Cutting',
    sub: '2–6 weeks per design',
    body: 'A master carver takes a teak block and removes everything that is not the pattern. Every line is cut by hand; the depth of each groove determines how much dye the block will carry. A single mistake on week three means starting over.',
    img: '/frames/hero/frame_001.webp',
  },
  {
    num: '02',
    title: 'Natural Dye Preparation',
    sub: 'Sunrise, every day',
    body: 'Indigo paste is fermented in clay pots for 72 hours. Pomegranate rind, iron-rich mud, henna leaves and alizarin from dried roots are ground, strained and pH-adjusted. The dye batch dictates the season\'s colour range — there is no re-making it.',
    img: '/frames/hero/frame_100.webp',
  },
  {
    num: '03',
    title: 'Hand Stamping',
    sub: '8 hours per sari length',
    body: 'The artisan charges the block with dye, positions it against the cloth by eye — a skill measured in years, not months — and strikes it once with the heel of the palm. Repeat, across every centimetre, until the length is done.',
    img: '/frames/hero/frame_200.webp',
  },
  {
    num: '04',
    title: 'Wash & Cure',
    sub: '3-day water cycle',
    body: 'Freshly printed cloth is rinsed in the river, dried under the Rajasthan sun, and re-rinsed until the dye locks permanently into the fibre. Skipping any wash strips the colour unevenly. No shortcuts exist here.',
    img: '/frames/hero/frame_300.webp',
  },
  {
    num: '05',
    title: 'Finishing & Inspection',
    sub: '60-point quality check',
    body: 'Every piece is inspected against natural light. A missed stamp, an uneven run of colour, a block alignment that drifted — any of these sends the cloth back for overdyeing or renders it a reject. Only the pieces that pass become Arttrolley.',
    img: '/frames/hero/frame_394.webp',
  },
]

export default function CraftProcess() {
  const [active, setActive] = useState(0)

  return (
    <section id="process" className="relative py-32 md:py-48">
      {/* Section header */}
      <div className="px-6 md:px-16 mb-16 md:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-8"
          style={{ textShadow: '0 2px 14px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.9)' }}
        >
          <div>
            <p className="label text-gold/60 mb-4" style={{ letterSpacing: '0.28em' }}>
              The Process
            </p>
            <LineReveal
              as="h2"
              className="font-serif font-light text-parchment leading-tight"
              style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}
            >
              <span>Five steps,</span>
              {/* Extra-strong shadow: clay (#B5622A) is close in hue to the
                  fabric background's rust tones, so this specific span needs
                  more separation than the section-wide shadow gives it. */}
              <span className="text-clay" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 4px 26px rgba(0,0,0,0.9)' }}>no shortcuts.</span>
            </LineReveal>
          </div>
          <motion.p
            className="font-sans font-light text-smoke/60 md:max-w-[38ch] text-[0.925rem] leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.15 }}
          >
            Bagru block printing is one of the oldest resist-dye techniques in
            the world. It survives because of people who refuse to modernise the
            parts that matter.
          </motion.p>
        </motion.div>
      </div>

      {/* ERA-style tab bar — horizontal labels */}
      <div
        className="px-6 md:px-16 border-b border-parchment/10 mb-0"
        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)' }}
      >
        <div className="flex items-end gap-0 overflow-x-auto no-scrollbar">
          {STEPS.map((step, i) => (
            <button
              key={step.num}
              type="button"
              onClick={() => setActive(i)}
              className={`relative shrink-0 py-5 pr-8 md:pr-12 text-left transition-colors duration-400
                         focus-visible:outline-none group
                         ${i === active ? 'text-parchment' : 'text-parchment/50 hover:text-parchment/75'}`}
            >
              {/* Step number */}
              <span
                className="block label mb-1"
                style={{ fontSize: '0.6rem', letterSpacing: '0.2em' }}
              >
                {step.num}
              </span>
              {/* Step title */}
              <span
                className="block font-serif font-light leading-snug"
                style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.05rem)' }}
              >
                {step.title}
              </span>

              {/* Animated underline */}
              {i === active && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-8 md:right-12 h-[1.5px] bg-gold/70"
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content panel — full-bleed image + text, crossfade between steps */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ minHeight: '520px' }}
        >
          {/* Left — text panel */}
          <div
            className="px-6 md:px-16 py-14 md:py-20 flex flex-col justify-between"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.9)' }}
          >
            <div>
              <p className="label text-gold/50 mb-6" style={{ letterSpacing: '0.22em', fontSize: '0.65rem' }}>
                {STEPS[active].sub}
              </p>
              <h3
                className="font-serif font-light text-parchment leading-tight mb-8"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}
              >
                {STEPS[active].title}
              </h3>
              <p className="font-sans font-light text-smoke/70 text-[0.925rem] leading-[1.85] max-w-[46ch]">
                {STEPS[active].body}
              </p>
            </div>

            {/* Step progress indicator */}
            <div className="mt-12 flex items-center gap-3">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className="focus-visible:outline-none"
                  aria-label={`Step ${i + 1}`}
                >
                  <motion.div
                    className="rounded-full bg-gold"
                    animate={{
                      width: i === active ? 28 : 6,
                      height: 2,
                      opacity: i === active ? 0.7 : 0.2,
                    }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </button>
              ))}
              <span className="ml-2 label text-parchment/25 tabular-nums" style={{ fontSize: '0.6rem' }}>
                {String(active + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Right — full-bleed image */}
          <div className="relative overflow-hidden" style={{ minHeight: '400px' }}>
            <motion.img
              key={STEPS[active].img}
              src={STEPS[active].img}
              alt={STEPS[active].title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: 1.06, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-ink/30 pointer-events-none" />
            {/* Step label overlay */}
            <div className="absolute bottom-8 right-8 text-right pointer-events-none">
              <p className="label text-parchment/40" style={{ fontSize: '0.6rem', letterSpacing: '0.22em' }}>
                Step {STEPS[active].num} / {String(STEPS.length).padStart(2, '0')}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
