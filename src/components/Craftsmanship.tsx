'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import FloatingOrbs from './FloatingOrbs'

// AI-generated (Google Flow / Nano Banana 2) bespoke craft photography,
// replacing the earlier generic Unsplash stock — locally upscaled to ~2K.
const CHAPTERS = [
  {
    n: '01',
    tag: 'The Block',
    head: 'Carved by hand, four generations deep.',
    body: 'G47 works with a single family of block-carvers in Bagru, whose workshop has cut printing blocks since 1932. Each teak block takes upward of eleven days to carve, and is retired after roughly four hundred impressions — worn grain changes the print, and we would rather retire a block than let the motif drift.',
    img: '/flow-assets/craft-block-carving-2k.webp',
    reverse: false,
  },
  {
    n: '02',
    tag: 'The Dye',
    head: 'Mixed the week it is used, never before.',
    body: 'Indigo fermented in clay vats, rust drawn from iron filings and jaggery, pomegranate rind boiled down for the ochre. Nothing is synthetic, and no two garments carry the exact same depth of colour — the dye knows the weather better than we do.',
    img: '/flow-assets/craft-indigo-dye-2k.webp',
    reverse: true,
  },
  {
    n: '03',
    tag: 'The Stitch',
    head: 'Eleven pairs of hands, one garment.',
    body: 'This is, by design, a slow way to make clothing. A single kurti passes through eleven pairs of hands before it reaches you — printing, dyeing, drying, embroidery, finishing. We have made peace with what that costs in speed, in exchange for what it returns in permanence.',
    img: '/flow-assets/craft-embroidery-2k.webp',
    reverse: false,
  },
]

// Parallax image with a diagonal light-beam sweep on hover
function CraftImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      data-image-reveal
      data-cursor-expand
      data-cursor-label="View"
      className="relative aspect-[4/5] overflow-hidden bg-ink/40 group cursor-default"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-[1.8s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
      />

      {/* Diagonal beam sweep on hover */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: 'hidden' }}
      >
        <div
          className="absolute top-0 bottom-0 w-[60%]"
          style={{
            background:
              'linear-gradient(105deg, transparent 30%, rgba(201,168,76,0.10) 50%, transparent 70%)',
            left: '-40%',
            transition: 'none',
          }}
        />
      </div>

      {/* Subtle vignette that sharpens on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-700" />

      {/* Gold bottom-edge line — draws in on hover */}
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-gold/50 w-0 group-hover:w-full
                   transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)]"
      />
    </div>
  )
}

// Chapter watermark number that scales up slightly on scroll
function ChapterWatermark({ n }: { n: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 0.07])

  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      className="absolute -top-8 -left-4 font-serif font-light text-parchment leading-none select-none pointer-events-none tabular-nums"
      style={{
        fontSize: 'clamp(5rem, 12vw, 12rem)',
        scale,
        opacity,
      }}
    >
      {n}
    </motion.span>
  )
}

export default function Craftsmanship() {
  return (
    <section id="craft" className="relative py-32 md:py-48 border-t border-parchment/10 overflow-hidden">
      {/* Atmospheric background orbs */}
      <FloatingOrbs variant="crimson" count={4} />

      {/* Section header */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 mb-20 md:mb-32 relative z-[2]">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="label mb-4 text-parchment/40">The Craft &amp; Atelier</p>
          <h2
            className="font-serif font-light text-parchment max-w-3xl"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 4rem)', lineHeight: 1.1 }}
          >
            Proof, not a promise. Every piece is an artifact of heritage craft.
          </h2>
        </motion.div>

        {/* Wide animated gold rule */}
        <motion.div
          className="mt-8 h-px bg-gold/30 origin-left"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>

      {/* Chapters */}
      <div className="flex flex-col gap-32 md:gap-44 relative z-[2]">
        {CHAPTERS.map((c, ci) => (
          <div
            key={c.tag}
            className={`max-w-[1600px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center px-6 md:px-16 ${
              c.reverse ? 'md:[&>*:first-child]:order-2' : ''
            }`}
          >
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: c.reverse ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <CraftImage src={c.img} alt={c.tag} />
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: c.reverse ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            >
              <div className="relative">
                <ChapterWatermark n={c.n} />

                <p className="label mb-5 text-gold/70 relative">{c.tag}</p>
                {/* Diagonal wipe reveal — a ghost duplicate of the headline
                    sits underneath at low opacity while the real text sweeps
                    in from behind a diagonal clip edge, so mid-transition you
                    briefly see both the settling text and its own afterimage. */}
                <div className="relative" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)' }}>
                  <h3
                    aria-hidden="true"
                    className="font-serif font-light text-parchment/10 leading-[1.1] absolute inset-0 select-none"
                  >
                    {c.head}
                  </h3>
                  <motion.h3
                    className="font-serif font-light text-parchment leading-[1.1] relative"
                    initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
                    whileInView={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  >
                    {c.head}
                  </motion.h3>
                </div>

                {/* Animated gold rule */}
                <motion.div
                  className="mt-7 h-px bg-gold/40 origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.3 + ci * 0.05,
                  }}
                  style={{ width: '2rem' }}
                />

                <p className="prose-body mt-7 font-sans text-parchment/65 font-light max-w-[48ch]">
                  {c.body}
                </p>

                {/* Chapter progress indicator */}
                <div className="mt-10 flex items-center gap-3">
                  {CHAPTERS.map((_, k) => (
                    <div
                      key={k}
                      className={`h-px transition-all duration-500 ${
                        k === ci ? 'w-10 bg-gold/70' : 'w-4 bg-parchment/15'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}
