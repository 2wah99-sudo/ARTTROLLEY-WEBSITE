'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Reveal from './Reveal'

/**
 * Two-panel cinematic ambient loop section — one full-bleed video loop per
 * craft chapter, playing silently in the background while editorial text
 * rests on top. Google Flow / Veo 3.1 Lite, Lanczos-upscaled to 1080p.
 *
 * Placed between Craftsmanship and EditorialMoment as a "living" mid-section
 * that keeps the page feeling like film rather than a static gallery.
 */

interface FilmPanelProps {
  videoSrc: string
  label: string
  headline: string
  body: string
  flip?: boolean
}

function FilmPanel({ videoSrc, label, headline, body, flip = false }: FilmPanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])

  return (
    <div
      ref={ref}
      className={`relative h-[70vh] md:h-screen overflow-hidden ${flip ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Looping video background */}
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Ink gradient scrim — heavier on whichever side the text lands */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: flip
            ? 'linear-gradient(to left, rgba(6,6,6,0.88) 0%, rgba(6,6,6,0.4) 45%, transparent 70%), linear-gradient(to top, rgba(6,6,6,0.4) 0%, transparent 40%)'
            : 'linear-gradient(to right, rgba(6,6,6,0.88) 0%, rgba(6,6,6,0.4) 45%, transparent 70%), linear-gradient(to top, rgba(6,6,6,0.4) 0%, transparent 40%)',
        }}
      />

      {/* Text — anchored to bottom of the scrim side */}
      <div
        className={`absolute inset-0 flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-16 ${
          flip ? 'items-end text-right' : 'items-start text-left'
        }`}
      >
        <Reveal>
          <p className="label mb-4 text-gold/80">{label}</p>
          <h3
            className="font-serif font-light text-parchment leading-[1.1] max-w-lg"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)' }}
          >
            {headline}
          </h3>
          <div className="mt-5 w-8 h-px bg-gold/40" />
          <p className="mt-5 font-sans text-sm leading-relaxed text-parchment/60 font-light max-w-[42ch]">
            {body}
          </p>
        </Reveal>
      </div>
    </div>
  )
}

export default function CraftFilm() {
  return (
    <section id="craft-film" className="border-t border-parchment/10">
      <FilmPanel
        videoSrc="/flow-assets/video-indigo-dye-1080p.mp4"
        label="The Dye Vat"
        headline="Colour that the weather decides."
        body="Indigo yields differently on a humid morning than a dry afternoon. Our dyers read the vat the way a winemaker reads a harvest — and no two bolts of cloth are ever identical."
        flip={false}
      />
      <FilmPanel
        videoSrc="/flow-assets/video-zardozi-embroidery-1080p.mp4"
        label="The Needle"
        headline="Eleven thousand passes to finish a motif."
        body="Zardozi is not embroidery. It is architecture. Each loop of gold thread is placed under tension — any slack and the motif loses the depth that catches light the way it should."
        flip={true}
      />
    </section>
  )
}
