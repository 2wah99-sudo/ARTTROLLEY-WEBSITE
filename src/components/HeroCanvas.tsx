'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useFrameSequence } from '@/lib/useFrameSequence'
import { useScrubAudio } from '@/lib/useScrubAudio'
import WordmarkStamp from './WordmarkStamp'

gsap.registerPlugin(ScrollTrigger)

const PIN_VH = 1500
const START_PROGRESS = 0

export default function HeroCanvas() {
  const prefersReduced = useReducedMotion()
  const sectionRef  = useRef<HTMLElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const cueRef      = useRef<HTMLDivElement>(null)
  const dissolveRef = useRef<HTMLDivElement>(null)
  const { ready, draw, trim, getLoadedFraction } = useFrameSequence('hero')
  const { sync: syncAudio, muted, toggleMuted } = useScrubAudio('/audio/hero.mp3')
  const scrollStartedRef  = useRef(false)
  const lastProgressRef   = useRef(0)
  const lastUpdateTimeRef = useRef(0)
  const velocityRef       = useRef(0)
  const idleTimeoutRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const coastTweenRef     = useRef<gsap.core.Tween | undefined>(undefined)

  const { scrollYProgress: heroProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const wordmarkOpacity = useTransform(heroProgress, [0, 0.14], [1, 0])
  const wordmarkY       = useTransform(heroProgress, [0, 0.14], ['0%', '-22%'])
  const wordmarkScale   = useTransform(heroProgress, [0, 0.14], [1, 0.88])

  useEffect(() => {
    if (prefersReduced) return
    const section = sectionRef.current
    const canvas  = canvasRef.current
    if (!section || !canvas) return

    let trigger: ScrollTrigger | undefined
    const remap = (p: number) => START_PROGRESS + p * (1 - START_PROGRESS)

    // Clamp displayed progress to what has actually downloaded. On a real
    // network (production), a fast scroll can outrun the frame buffer —
    // without this, the canvas freezes hard on the last available frame
    // with no indication why. Clamping means it instead tracks a little
    // behind the raw scroll position and catches up as more frames land —
    // reads as "the film is still arriving," not "the site is broken."
    // A small look-ahead margin (0.01 ≈ 6-7 frames) avoids clamping so
    // tightly that it visibly stair-steps on a merely-adequate connection.
    const clampToBuffer = (p: number) => Math.min(p, getLoadedFraction() + 0.01)

    const updateDissolve = (p: number) => {
      if (!dissolveRef.current) return
      const raw = p > 0.94 ? (p - 0.94) / 0.06 : 0
      gsap.set(dissolveRef.current, { opacity: raw * raw })
    }

    const COAST_DISTANCE = 0.06
    const COAST_DURATION = 3.0
    const startCoast = (fromProgress: number, velocity: number) => {
      if (Math.abs(velocity) < 0.00002) return
      const direction = velocity > 0 ? 1 : -1
      const target = Math.min(1, getLoadedFraction() + 0.01, Math.max(START_PROGRESS, fromProgress + direction * COAST_DISTANCE))
      const proxy = { p: fromProgress }
      coastTweenRef.current = gsap.to(proxy, {
        p: target,
        duration: COAST_DURATION,
        ease: 'power2.out',
        onUpdate: () => {
          draw(canvas, proxy.p)
          syncAudio(proxy.p)
          updateDissolve(proxy.p)
        },
      })
    }

    const ctx = gsap.context(() => {
      draw(canvas, START_PROGRESS)

      trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrollStartedRef.current = true
          coastTweenRef.current?.kill()
          clearTimeout(idleTimeoutRef.current)

          const now = performance.now()
          const dt = now - lastUpdateTimeRef.current
          if (dt > 0 && dt < 200) {
            velocityRef.current = (self.progress - lastProgressRef.current) / dt
          }
          lastProgressRef.current = self.progress
          lastUpdateTimeRef.current = now

          const p = clampToBuffer(remap(self.progress))
          draw(canvas, p)
          syncAudio(p)
          updateDissolve(p)

          idleTimeoutRef.current = setTimeout(() => {
            startCoast(p, velocityRef.current)
          }, 100)
        },
        onLeave: () => {
          gsap.to(cueRef.current, { opacity: 0, duration: 0.4 })
          coastTweenRef.current?.kill()
          clearTimeout(idleTimeoutRef.current)
          trim()
        },
        onLeaveBack: () => trim(),
        onEnterBack: () => gsap.to(cueRef.current, { opacity: 1, duration: 0.4 }),
      })
    }, section)

    const resize = () => {
      draw(canvas, trigger?.progress ?? 0)
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      coastTweenRef.current?.kill()
      clearTimeout(idleTimeoutRef.current)
      ctx.revert()
    }
  }, [prefersReduced, draw, trim, ready, syncAudio, getLoadedFraction])

  useEffect(() => {
    if (!prefersReduced && ready && canvasRef.current) draw(canvasRef.current, START_PROGRESS)
  }, [ready, prefersReduced, draw])

  // Idle breathing — slow drift before first scroll
  const breathingRef = useRef(true)
  useEffect(() => {
    if (prefersReduced || !ready) return
    const canvas = canvasRef.current
    if (!canvas) return
    breathingRef.current = true
    let raf = 0
    const start = performance.now()
    const DURATION_MS = 2400
    const AMPLITUDE = 0.01
    const tick = (now: number) => {
      if (scrollStartedRef.current) { breathingRef.current = false; return }
      const t = Math.min(1, (now - start) / DURATION_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      draw(canvas, START_PROGRESS + eased * AMPLITUDE)
      if (t < 1) raf = requestAnimationFrame(tick)
      else breathingRef.current = false
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); breathingRef.current = false }
  }, [ready, prefersReduced, draw])

  if (prefersReduced) {
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/frames/hero/frame_001.webp" alt="Arttrolley hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 text-center px-6">
          <p className="label mb-4">Est. 2024</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light leading-[1.05] text-parchment">Arttrolley</h1>
          <p className="mt-4 font-sans text-base text-smoke tracking-wide">Heritage, thread by thread.</p>
          <a href="#collection" className="mt-10 inline-block border border-clay text-clay label px-8 py-3 hover:bg-clay hover:text-ink active:scale-95 transition-[color,background-color,border-color,transform] duration-500">
            Explore The Collection
          </a>
        </div>
      </section>
    )
  }

  return (
    <section
      id="hero-film"
      ref={sectionRef}
      style={{ height: `${PIN_VH}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ willChange: 'transform' }}
          aria-hidden="true"
        />

        {/* Cinematic warm overlay */}
        <div aria-hidden="true" className="absolute inset-0 z-[2] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 75%, rgba(237,232,224,0.10) 0%, transparent 70%)', mixBlendMode: 'overlay' }} />

        {/* Ambient pulse */}
        <div aria-hidden="true" className="absolute pointer-events-none z-[3]"
          style={{ inset: 0, background: 'radial-gradient(ellipse 55% 40% at 50% 65%, rgba(237,232,224,0.08) 0%, transparent 65%)', mixBlendMode: 'overlay', animation: 'hero-pulse 5s ease-in-out infinite' }} />

        {/* Vignette */}
        <div className="absolute inset-0 z-[5] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 68% 74% at 50% 50%, transparent 58%, rgba(6,6,6,0.55) 100%), linear-gradient(to right, rgba(6,6,6,0.55), transparent 22%, transparent 78%, rgba(6,6,6,0.55))' }} />

        {/* Dream dissolve */}
        <div ref={dissolveRef} className="absolute inset-0 z-[6] pointer-events-none bg-ink opacity-0" />

        {/* Wordmark */}
        <motion.div aria-hidden="true"
          className="absolute inset-0 z-[7] flex flex-col items-center justify-center pointer-events-none select-none"
          style={{ opacity: wordmarkOpacity, y: wordmarkY, scale: wordmarkScale }}>
          <p className="label text-gold/70 mb-6" style={{ letterSpacing: '0.35em' }}>Est. 2024 · Bagru, Rajasthan</p>
          <h1 className="font-wordmark font-normal text-parchment text-center px-4 flex items-baseline justify-center">
            <span className="leading-none" style={{ fontSize: 'clamp(2.2rem, 8vw, 6rem)', letterSpacing: '0.02em' }}>ARTTROLLEY</span>
          </h1>
          <WordmarkStamp className="text-gold/60 w-7 h-7 md:w-9 md:h-9 mt-3 shrink-0" />
          <div className="mt-8 h-px bg-gold/40" style={{ width: 'clamp(80px, 14vw, 180px)' }} />
          <p className="mt-6 font-sans font-light text-parchment/55 text-center"
            style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.95rem)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            Heritage, thread by thread
          </p>
        </motion.div>

        <h1 className="sr-only">Arttrolley — Heritage, thread by thread.</h1>

        <button type="button" onClick={toggleMuted}
          aria-label={muted ? 'Unmute film audio' : 'Mute film audio'}
          className="absolute top-[6vh] right-6 md:right-10 z-10 w-11 h-11 flex items-center justify-center rounded-full border border-parchment/25 text-parchment/70 hover:text-gold hover:border-gold/60 transition-colors duration-500 pointer-events-auto">
          {muted ? (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 6h2.5L8 3v10L4.5 10H2V6Z" fill="currentColor" />
              <path d="M11 5.5 14 10.5M14 5.5 11 10.5" stroke="currentColor" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 6h2.5L8 3v10L4.5 10H2V6Z" fill="currentColor" />
              <path d="M11 5.5c1 .8 1 4.2 0 5M12.8 4c1.8 1.6 1.8 6.4 0 8" stroke="currentColor" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <div ref={cueRef} className="absolute bottom-[4.5vh] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2.5 pointer-events-none">
          <span className="label text-parchment/50">Scroll</span>
          <span className="block w-px h-8 bg-gradient-to-b from-gold to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}
