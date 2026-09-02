'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import FloatingOrbs from './FloatingOrbs'
import GoldenDust from './GoldenDust'

export default function PrivateAccess() {
  const [sent, setSent] = useState(false)

  return (
    <section className="relative py-44 md:py-64 px-6 md:px-16 border-t border-parchment/10 overflow-hidden">
      {/* Atmospheric layers */}
      <FloatingOrbs variant="mixed" count={5} />
      <GoldenDust count={50} className="z-[1]" />

      {/* Background watermark — animated slow drift */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center font-serif text-parchment pointer-events-none select-none z-[1]"
        style={{ fontSize: 'clamp(5rem, 18vw, 18rem)', opacity: 0.028, letterSpacing: '-0.04em' }}
        animate={{ scale: [1, 1.015, 1], opacity: [0.022, 0.032, 0.022] }}
        transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity }}
      >
        PRIVATE
      </motion.span>

      <div className="relative max-w-[1000px] mx-auto text-center z-[2]">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="label mb-8 text-parchment/30">Private Access</p>
          <h2
            className="font-serif font-light leading-[1.05] text-parchment mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}
          >
            Be first to the rack.
            <br />
            <motion.span
              className="text-clay inline-block"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            >
              Before the doors open.
            </motion.span>
          </h2>
          <p className="font-sans text-sm md:text-base text-smoke mb-14 max-w-sm mx-auto leading-relaxed">
            A private notification before each new drop — nothing else.
            Limited strictly to registered patrons.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-12 h-px bg-gold mx-auto mb-8" />
              <p
                className="font-serif font-light text-parchment"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
              >
                You&rsquo;re on the list.
              </p>
              <p className="label mt-4 text-parchment/35">
                We&rsquo;ll be in touch before the next drop.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const fd    = new FormData(e.currentTarget)
                const email = fd.get('email') as string
                const subject = encodeURIComponent('Private Access Request — Arttrolley')
                const body    = encodeURIComponent(`Please add this email to the private drop list:\n\n${email}`)
                window.location.href = `mailto:2wah99@gmail.com?subject=${subject}&body=${body}`
                setSent(true)
              }}
              className="max-w-[500px] mx-auto"
            >
              <div className="flex border border-parchment/15 focus-within:border-gold/50 transition-colors duration-700 hover:border-parchment/25">
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email address"
                  aria-label="Email address"
                  className="flex-1 bg-transparent px-6 py-4 font-sans text-sm text-parchment placeholder:text-parchment/25 focus:outline-none"
                />
                <motion.button
                  type="submit"
                  className="px-7 py-4 label text-ink bg-parchment hover:bg-gold transition-colors duration-500 shrink-0 focus-visible:outline-none focus-visible:bg-gold relative overflow-hidden group"
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="absolute inset-0 bg-gold/0 group-hover:bg-gold/20 transition-colors duration-300" />
                  <span className="relative">Request →</span>
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
