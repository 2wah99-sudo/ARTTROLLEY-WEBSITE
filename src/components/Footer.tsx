'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import FloatingOrbs from './FloatingOrbs'
import TextScrim from './TextScrim'

const CLIENT_LINKS = [
  { label: 'Client Care',           href: 'mailto:2wah99@gmail.com' },
  { label: 'Private Viewings',      href: '/#inquire' },
  { label: 'Shipping & Provenance', href: '/#fabric-dna' },
  { label: 'Terms',                 href: null }, // pending — legal copy not yet drafted
]

const STUDIO_LINKS = [
  { label: 'Instagram',    href: null }, // pending — handle not yet live
  { label: 'Journal',      href: null }, // pending — no posts published yet
  { label: 'Studio Notes', href: null }, // pending — no posts published yet
]

const CURRENCIES = ['INR ₹', 'USD $', 'GBP £']

export default function Footer() {
  const [currency, setCurrency] = useState(CURRENCIES[0])

  return (
    <footer className="relative border-t border-parchment/10 px-6 md:px-16 overflow-hidden">
      <FloatingOrbs variant="gold" count={2} />

      {/* Animated gold accent at the very top of the footer */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* text-shadow inherits to every descendant text node in one shot —
          the footer sits over the AmbientFlowVideo fabric loop (restored to
          full color), and its light cream floral passages were blending
          straight into the parchment/smoke link and label text throughout. */}
      <div
        className="max-w-[1600px] mx-auto relative z-[2]"
        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.95)' }}
      >
        <TextScrim inset="-inset-6 md:-inset-10" strength={0.6} />
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 md:gap-20 pt-20 md:pt-24 pb-16 border-b border-parchment/[0.08]">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <a
              href="/"
              className="font-serif text-2xl md:text-3xl tracking-widest2 text-parchment uppercase block mb-6 hover:text-gold transition-colors duration-500"
            >
              Arttrolley<span className="text-clay">.</span>
            </a>
            <p className="font-sans text-sm text-smoke leading-relaxed max-w-[30ch]">
              An independent design house working in hand block-print and
              natural dye, based in Bagru, Rajasthan.
            </p>
            {/* Animated gold rule */}
            <motion.div
              className="mt-8 h-px bg-gold/40 origin-left"
              initial={{ width: 0 }}
              whileInView={{ width: '2rem' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            />
          </motion.div>

          {/* Client column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.07 }}
          >
            <p className="label mb-7 text-parchment/65">Client</p>
            <ul className="space-y-5">
              {CLIENT_LINKS.map((l) => (
                <li key={l.label}>
                  {l.href ? (
                    <a
                      href={l.href}
                      className="font-sans text-sm text-parchment/75 hover:text-gold transition-colors duration-500 focus-visible:outline-none focus-visible:text-gold"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="font-sans text-sm text-parchment/45 cursor-default select-none"
                      title="Coming soon"
                    >
                      {l.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Studio column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.13 }}
          >
            <p className="label mb-7 text-parchment/65">Studio</p>
            <ul className="space-y-5">
              {STUDIO_LINKS.map((l) => (
                <li key={l.label}>
                  {l.href ? (
                    <a
                      href={l.href}
                      className="font-sans text-sm text-parchment/75 hover:text-gold transition-colors duration-500 focus-visible:outline-none focus-visible:text-gold"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="font-sans text-sm text-parchment/45 cursor-default select-none"
                      title="Coming soon"
                    >
                      {l.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Currency column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.19 }}
          >
            <p className="label mb-7 text-parchment/65">Currency</p>
            <div className="space-y-4">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`block font-sans text-sm transition-colors duration-500 focus-visible:outline-none ${
                    currency === c ? 'text-gold' : 'text-parchment/70 hover:text-parchment/80'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Copyright bar */}
        <div className="py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="font-sans text-xs text-parchment/60">
            © {new Date().getFullYear()} Arttrolley Studio. All rights reserved.
          </p>
          <p className="label text-parchment/60">
            Made in Bagru, Rajasthan · Heritage craft since 1932
          </p>
        </div>
      </div>
    </footer>
  )
}
