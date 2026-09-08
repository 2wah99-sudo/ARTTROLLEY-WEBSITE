'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import FloatingOrbs from './FloatingOrbs'
import GoldenDust from './GoldenDust'
import LineReveal from './LineReveal'
import TextScrim from './TextScrim'

export default function InquireForm() {
  const [sent, setSent] = useState(false)

  return (
    <section
      id="inquire"
      className="relative py-32 md:py-48 px-6 md:px-10 border-t border-parchment/10 overflow-hidden"
    >
      <FloatingOrbs variant="mixed" count={4} />
      <GoldenDust count={35} className="z-[1]" />

      <div className="max-w-[720px] mx-auto text-center relative z-[2]">
        <TextScrim inset="-inset-x-6 -inset-y-10 md:-inset-x-16 md:-inset-y-16" />
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* text-shadow throughout this section — it sits over the
              AmbientFlowVideo fabric loop (restored to full color), and its
              light cream floral passages were blending straight into
              parchment/smoke-colored text and form labels. */}
          <p className="label mb-4 text-gold/80" style={{ textShadow: '0 2px 14px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.9)' }}>Private Appointment</p>
          <LineReveal
            as="h2"
            className="font-serif text-3xl md:text-5xl font-light leading-tight text-parchment mb-6"
            lines={['Custom pieces, made to order.']}
            style={{ textShadow: '0 4px 22px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.85)' }}
          />
          <p
            className="font-sans text-base text-parchment/80 mb-14 max-w-md mx-auto"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.75), 0 1px 4px rgba(0,0,0,0.9)' }}
          >
            We take a limited number of bespoke commissions each season —
            custom block motifs, dye depth, and sizing. Tell us what you
            have in mind.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          {sent ? (
            <motion.div
              className="border border-gold/30 py-12 px-8"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-serif text-xl text-parchment mb-2">Received.</p>
              <p className="font-sans text-sm text-smoke">
                A member of the studio will reply within three working days.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                const name    = fd.get('name')    as string
                const email   = fd.get('email')   as string
                const message = fd.get('message') as string
                const subject = encodeURIComponent(`Bespoke Commission Inquiry — ${name}`)
                const body    = encodeURIComponent(
                  `Name: ${name}\nEmail: ${email}\n\nPiece in mind:\n${message}`
                )
                window.location.href = `mailto:2wah99@gmail.com?subject=${subject}&body=${body}`
                setSent(true)
              }}
              className="text-left space-y-8"
            >
              {/* Animated top border on the form */}
              <motion.div
                className="h-px bg-gold/20 origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <label className="block group">
                  <span className="label block mb-2 group-focus-within:text-gold transition-colors duration-300" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.85)' }}>Name</span>
                  <input
                    required
                    type="text"
                    name="name"
                    autoComplete="name"
                    className="w-full bg-transparent border-b border-parchment/25 pb-2 font-sans text-parchment
                               focus:outline-none focus-visible:border-gold transition-colors duration-500"
                  />
                </label>
                <label className="block group">
                  <span className="label block mb-2 group-focus-within:text-gold transition-colors duration-300" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.85)' }}>Email</span>
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    className="w-full bg-transparent border-b border-parchment/25 pb-2 font-sans text-parchment
                               focus:outline-none focus-visible:border-gold transition-colors duration-500"
                  />
                </label>
              </div>
              <label className="block group">
                <span className="label block mb-2 group-focus-within:text-gold transition-colors duration-300" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.85)' }}>
                  Tell us about the piece
                </span>
                <textarea
                  rows={4}
                  name="message"
                  className="w-full bg-transparent border-b border-parchment/25 pb-2 font-sans text-parchment
                             focus:outline-none focus-visible:border-gold transition-colors duration-500 resize-none"
                />
              </label>
              <div className="pt-4 text-center">
                <motion.button
                  type="submit"
                  data-magnetic="0.18"
                  data-cursor-label="Send"
                  className="border border-clay text-clay label px-10 py-3.5 hover:bg-clay hover:text-ink
                             active:scale-95 transition-[color,background-color,border-color,transform] duration-700
                             relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Shimmer sweep on button hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                                   translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative">Submit Inquiry</span>
                </motion.button>
              </div>

              <motion.div
                className="h-px bg-gold/20 origin-right"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              />
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
