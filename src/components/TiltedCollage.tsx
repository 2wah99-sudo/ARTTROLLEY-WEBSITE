'use client'

/**
 * TiltedCollage — a loosely-scattered bento grid of product photography,
 * each card sitting at its own small rotation and settling upright on
 * hover, like prints laid out on a table rather than a rigid grid. Cards
 * stagger in on scroll from their tilted rest angle.
 */

import { motion } from 'framer-motion'
import { PRODUCTS } from '@/lib/products'

const LAYOUT = [
  { rotate: -3,  span: 'md:col-span-2 md:row-span-2', top: '2%' },
  { rotate: 4,   span: '',                             top: '8%' },
  { rotate: -5,  span: '',                             top: '-4%' },
  { rotate: 2,   span: 'md:col-span-2',                top: '3%' },
  { rotate: -2,  span: '',                             top: '5%' },
  { rotate: 5,   span: '',                             top: '-2%' },
]

export default function TiltedCollage() {
  const pieces = PRODUCTS.slice(0, 6)

  return (
    <section className="relative py-32 md:py-48 px-6 md:px-16 border-t border-parchment/8 overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-24"
          style={{ textShadow: '0 4px 22px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.9)' }}
        >
          <p className="label text-gold/60 mb-4" style={{ letterSpacing: '0.28em' }}>
            At a Glance
          </p>
          <h2
            className="font-serif font-light text-parchment leading-tight max-w-2xl"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}
          >
            The collection,<br />
            <em className="text-clay not-italic" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 4px 26px rgba(0,0,0,0.9)' }}>laid out by hand.</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {pieces.map((p, i) => {
            const L = LAYOUT[i % LAYOUT.length]
            return (
              <motion.a
                key={p.slug}
                href={`/collection/${p.slug}`}
                className={`group relative block ${L.span}`}
                style={{ top: L.top }}
                data-cursor-expand
                data-cursor-label="View"
                initial={{ opacity: 0, rotate: L.rotate * 2.4, y: 40 }}
                whileInView={{ opacity: 1, rotate: L.rotate, y: 0 }}
                viewport={{ once: true, margin: '-8% 0px' }}
                whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: (i % 6) * 0.08 }}
              >
                <div className="relative aspect-[3/4] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <p className="font-serif font-light text-parchment text-sm md:text-base group-hover:text-gold/90 transition-colors duration-500">
                      {p.name}
                    </p>
                  </div>
                </div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
