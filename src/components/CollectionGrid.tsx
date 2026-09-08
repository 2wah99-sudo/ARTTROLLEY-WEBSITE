'use client'

/**
 * CollectionGrid — ERA Residence apartment-card style.
 * Each product is a large numbered card:
 *   - Full-bleed background image
 *   - Text overlay bottom-left: number, name, specs (fabric, dye, edition)
 *   - Hover reveals price + "Acquire →" CTA
 *   - Layout: 2-column desktop, staggered sizing
 */

import { motion } from 'framer-motion'
import LineReveal from './LineReveal'
import TextScrim from './TextScrim'
import { PRODUCTS } from '@/lib/products'

const TEASER = PRODUCTS.slice(0, 4)

// Specs to show per card — pulled from product or stubbed
const SPECS: Record<string, { fabric: string; dye: string; edition: string }> = {
  default: { fabric: 'Handloom Cotton', dye: 'Natural Dye', edition: 'Limited Run' },
}

function getSpecs(slug: string) {
  return SPECS[slug] ?? SPECS.default
}

function ProductCard({
  p,
  index,
  tall,
}: {
  p: (typeof TEASER)[number]
  index: number
  tall: boolean
}) {
  const num = String(index + 1).padStart(2, '0')
  const specs = getSpecs(p.slug)

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px 15% 0px' }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      className={tall ? 'row-span-2' : ''}
    >
      <a href={`/collection/${p.slug}`} className="group block h-full">
        <div
          className={`relative overflow-hidden ${tall ? 'h-full min-h-[640px]' : 'h-[420px]'}`}
          data-cursor-expand
          data-cursor-label="View"
        >
          {/* Background image with clip-path reveal */}
          <motion.div
            className="absolute inset-0"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
            viewport={{ once: true, margin: '0px 0px 15% 0px' }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.img}
              alt={p.name}
              className="w-full h-full object-cover
                         transition-transform duration-[2s] ease-[cubic-bezier(0.22,1,0.36,1)]
                         group-hover:scale-[1.06]"
            />
          </motion.div>

          {/* Gradient overlay — deepens toward bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/5
                          group-hover:from-ink/95 transition-colors duration-700" />

          {/* ERA-style: top-right chapter number */}
          <div className="absolute top-6 right-6 font-serif text-parchment/25 tabular-nums select-none"
               style={{ fontSize: '0.7rem', letterSpacing: '0.18em' }}>
            {num}
          </div>

          {/* Bottom content — ERA bottom-left overlay style */}
          <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9">
            {/* Specs row */}
            <div className="flex items-center gap-4 mb-4">
              <span className="label text-gold/60" style={{ fontSize: '0.6rem', letterSpacing: '0.22em' }}>
                {specs.fabric}
              </span>
              <span className="w-px h-3 bg-parchment/20" />
              <span className="label text-gold/60" style={{ fontSize: '0.6rem', letterSpacing: '0.22em' }}>
                {specs.dye}
              </span>
              <span className="w-px h-3 bg-parchment/20" />
              <span className="label text-gold/60" style={{ fontSize: '0.6rem', letterSpacing: '0.22em' }}>
                {specs.edition}
              </span>
            </div>

            {/* Product name */}
            <h3
              className="font-serif font-light text-parchment leading-tight mb-4
                         group-hover:text-gold/90 transition-colors duration-500"
              style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)' }}
            >
              {p.name}
            </h3>

            {/* Note */}
            <p className="font-sans font-light text-smoke/70 text-sm leading-relaxed mb-5">
              {p.note}
            </p>

            {/* Hairline rule + price/CTA row */}
            <div className="border-t border-parchment/15 pt-5 flex items-center justify-between">
              <span className="font-serif font-light text-parchment/60 tabular-nums"
                    style={{ fontSize: '0.9rem' }}>
                ₹{p.price.toLocaleString('en-IN')}
              </span>
              <span
                className="label text-gold/0 group-hover:text-gold/80 transition-colors duration-500
                           flex items-center gap-2"
                style={{ fontSize: '0.65rem', letterSpacing: '0.22em' }}
              >
                Acquire
                <svg width="20" height="8" viewBox="0 0 20 8" fill="none" aria-hidden="true">
                  <path d="M0 4h17M13 1l3 3-3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  )
}

export default function CollectionGrid() {
  return (
    <section
      id="collection"
      className="relative py-32 md:py-48 px-6 md:px-16 border-t border-parchment/8"
    >
      {/* Section header — ERA style. text-shadow inherits below: this header
          sits over AmbientBackground's fabric loop and had no shadow. */}
      <div
        className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16 md:mb-20"
        style={{ textShadow: '0 4px 22px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.9)' }}
      >
        <TextScrim inset="-inset-x-6 -inset-y-8 md:-inset-x-16 md:-inset-y-12" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="label text-gold/60 mb-4" style={{ letterSpacing: '0.28em' }}>
            The Curated Collection
          </p>
          <LineReveal
            as="h2"
            className="font-serif font-light text-parchment leading-tight"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}
          >
            <span>{PRODUCTS.length} pieces.</span>
            <span className="text-clay" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 4px 26px rgba(0,0,0,0.9)' }}>No repeats.</span>
          </LineReveal>
        </motion.div>

        <motion.a
          href="/collection"
          className="self-start md:self-auto inline-flex items-center gap-3
                     label text-parchment/50 hover:text-gold transition-colors duration-500
                     border-b border-parchment/15 hover:border-gold/50 pb-1"
          style={{ fontSize: '0.7rem', letterSpacing: '0.2em' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          View Full Collection
          <svg width="24" height="8" viewBox="0 0 24 8" fill="none" aria-hidden="true">
            <path d="M0 4h21M17 1l3 3-3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.a>
      </div>

      {/* ERA-style asymmetric grid: tall left card + 2 right cards stacked */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {/* Card 0 — tall, spans 2 rows on the left */}
        {TEASER[0] && (
          <div className="md:row-span-2">
            <ProductCard p={TEASER[0]} index={0} tall />
          </div>
        )}

        {/* Cards 1 & 2 — stacked on the right */}
        {TEASER[1] && <ProductCard p={TEASER[1]} index={1} tall={false} />}
        {TEASER[2] && <ProductCard p={TEASER[2]} index={2} tall={false} />}

        {/* Card 3 — full width below */}
        {TEASER[3] && (
          <div className="md:col-span-2">
            <a href={`/collection/${TEASER[3].slug}`} className="group block">
              <motion.div
                className="relative h-[340px] md:h-[440px] overflow-hidden"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                data-cursor-expand
                data-cursor-label="View"
              >
                <motion.div
                  className="absolute inset-0"
                  initial={{ clipPath: 'inset(0 0 100% 0)' }}
                  whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={TEASER[3].img}
                    alt={TEASER[3].name}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-[1.04]"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-ink/10
                                group-hover:from-ink/90 transition-colors duration-700" />

                <div className="absolute left-8 md:left-12 bottom-8 md:bottom-10 flex items-end gap-16">
                  <div>
                    <p className="label text-gold/50 mb-3" style={{ fontSize: '0.6rem', letterSpacing: '0.24em' }}>
                      {getSpecs(TEASER[3].slug).fabric} · {getSpecs(TEASER[3].slug).edition}
                    </p>
                    <h3 className="font-serif font-light text-parchment group-hover:text-gold/90 transition-colors duration-500"
                        style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)' }}>
                      {TEASER[3].name}
                    </h3>
                  </div>
                  <span className="label text-gold/0 group-hover:text-gold/70 transition-colors duration-600 hidden md:flex items-center gap-2"
                        style={{ fontSize: '0.65rem', letterSpacing: '0.22em' }}>
                    Acquire
                    <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
                      <path d="M0 4h17M13 1l3 3-3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>

                <div className="absolute top-6 right-8 font-serif text-parchment/20 tabular-nums"
                     style={{ fontSize: '0.7rem', letterSpacing: '0.18em' }}>
                  04
                </div>
              </motion.div>
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
