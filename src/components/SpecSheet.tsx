'use client'

import { motion } from 'framer-motion'
import FloatingOrbs from './FloatingOrbs'
import LineReveal from './LineReveal'

const DNA = [
  {
    n: '01',
    label: 'Material',
    value: '100% Organic Handloom Cotton',
    detail: '140 GSM, hand-spun charkha yarn, pit-loom woven',
  },
  {
    n: '02',
    label: 'Dye Profile',
    value: 'Natural, Plant-Based Dyes',
    detail: 'Indigo, iron-and-jaggery rust, pomegranate-rind ochre',
  },
  {
    n: '03',
    label: 'Construction',
    value: 'Hand-Finished Embroidery & Block-Print',
    detail: 'Hand-carved teak blocks, Dabu resist, single artisan per garment',
  },
  {
    n: '04',
    label: 'Maintenance',
    value: 'Specialized Dry Clean',
    detail: 'Or hand wash cold, dry flat, iron reverse — professional archive care recommended',
  },
]

export default function SpecSheet() {
  return (
    <section
      id="fabric-dna"
      className="relative py-32 md:py-40 px-6 md:px-10 border-t border-parchment/10 overflow-hidden"
    >
      <FloatingOrbs variant="gold" count={3} />

      <div className="max-w-[1600px] mx-auto relative z-[2]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="label mb-3">Fabric DNA — No. AT-014</p>
          <LineReveal
            as="h2"
            className="font-serif text-3xl md:text-4xl font-light text-parchment mb-4 max-w-xl"
            lines={['Every detail, disclosed.']}
          />
          <p className="font-sans text-sm text-smoke mb-16 max-w-md">
            No shortcuts hidden behind a marketing gloss.
          </p>
        </motion.div>

        {/* Animated top border that draws across */}
        <motion.div
          className="h-px bg-parchment/15 mb-0 origin-left"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-parchment/15">
          {DNA.map((d, i) => (
            <motion.div
              key={d.label}
              className="shimmer-card h-full border-r border-b border-parchment/15 p-8 md:p-10
                         hover:bg-parchment/[0.02] transition-colors duration-500 group"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
            >
              <span className="label text-gold/80 tabular-nums group-hover:text-gold transition-colors duration-500">
                {d.n}
              </span>

              {/* Animated gold accent bar */}
              <motion.div
                className="mt-4 h-px bg-gold/30 origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.08 }}
                style={{ width: '2.5rem' }}
              />

              <p className="label mt-6 text-parchment/50">{d.label}</p>
              <p className="mt-3 font-serif text-xl font-light text-parchment leading-snug group-hover:text-parchment transition-colors duration-300">
                {d.value}
              </p>
              <p className="mt-4 font-sans text-sm text-smoke leading-relaxed group-hover:text-parchment/60 transition-colors duration-500">
                {d.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
