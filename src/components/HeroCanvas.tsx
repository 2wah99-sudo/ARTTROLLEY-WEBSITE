'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useFrameSequence } from '@/lib/useFrameSequence'
import { useScrubAudio } from '@/lib/useScrubAudio'
import WordmarkStamp from './WordmarkStamp'

gsap.registerPlugin(ScrollTrigger)

const PIN_VH = 2000 // scroll distance in vh. Higher = more scroll needed, film advances slower per input — gives the decode pipeline more real time per frame to catch up before it needs it.

// The confirmed opening shot (formerly frame_025 of 540) is now physically
// frame_001 — every frame before it was deleted from public/frames/hero and
// the sequence renumbered, so there is nothing before the start to remap
// away from. START_PROGRESS stays as a named constant (0) so the coast/idle
// code below reads the same either way.
const START_FRAME_INDEX = 0
const START_PROGRESS = 0

// The film is a finished brand piece with its own title cards baked into
// the pixels — "ORIGIN OF COLOUR", "THREAD BY THREAD", "HAND BLOCK",
// "ARTTROLLEY", "THE STAR COLLECTION", "EXPLORE NOW". It does not need (and
// visibly clashes with) a second, HTML-drawn caption track on top of it.
// The only chrome here is a vignette for edge legibility and a scroll cue.

export default function HeroCanvas() {
  const prefersReduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const cueRef      = useRef<HTMLDivElement>(null)
  const dissolveRef = useRef<HTMLDivElement>(null)
  const { ready, draw, trim } = useFrameSequence('hero')
  const { sync: syncAudio, muted, toggleMuted } = useScrubAudio('/audio/hero.mp3')
  // Flips true on the first real scroll movement. Read by the idle-breathing
  // loop below to know when to stop drawing — scroll then owns the canvas.
  const scrollStartedRef = useRef(false)
  // Momentum-coast bookkeeping: velocity/direction of the last scroll tick,
  // and handles for the idle-detect timeout / in-flight coast tween (see
  // onUpdate below).
  const lastProgressRef = useRef(0)
  const lastUpdateTimeRef = useRef(0)
  const velocityRef = useRef(0) // progress units per ms
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const coastTweenRef = useRef<gsap.core.Tween | undefined>(undefined)

  useEffect(() => {
    if (prefersReduced) return
    const section = sectionRef.current
    const canvas  = canvasRef.current
    if (!section || !canvas) return

    let trigger: ScrollTrigger | undefined

    // Identity when START_PROGRESS is 0 (frames before the confirmed starter
    // no longer exist on disk, so there's nothing to remap away from) — kept
    // as a function so a future START_PROGRESS > 0 would still be honoured
    // without touching every call site below.
    const remap = (p: number) => START_PROGRESS + p * (1 - START_PROGRESS)

    // Dream dissolve: fade to black over the last 6% of the hero so it hands
    // off to the atelier film as a short, punchy cross-fade instead of a
    // hard cut — or the long, draggy flat-black hold a wider window
    // produces. Eased (power2-in) rather than linear so the black creeps in
    // slowly at first and accelerates into the cut, reading as an
    // intentional film dissolve rather than a mechanical opacity ramp.
    // Shared by both the live-scroll draw and the momentum coast below.
    const updateDissolve = (p: number) => {
      if (!dissolveRef.current) return
      const raw = p > 0.94 ? (p - 0.94) / 0.06 : 0
      gsap.set(dissolveRef.current, { opacity: raw * raw })
    }

    // Momentum coast: once scroll input actually stops (not just between
    // ticks — Lenis's own lerp already re-fires onUpdate every frame while
    // it's still gliding), keep drifting the frame forward in the direction
    // it was already moving, easing to a stop over ~2s instead of freezing
    // the instant the real scroll position settles. A fixed-duration eased
    // tween (not raw velocity integration) so the settle always takes about
    // the same couple of seconds regardless of how hard the gesture was —
    // integrating real velocity made the travel distance (and so the
    // perceived duration) wildly inconsistent between a light nudge and a
    // hard flick. Any new scroll input kills it immediately, no fighting.
    const COAST_DISTANCE = 0.11 // ~11% of the film — heavier drift still
    const COAST_DURATION = 5.0 // seconds — longer, weightier settle after lift
    const startCoast = (fromProgress: number, velocity: number) => {
      if (Math.abs(velocity) < 0.00002) return // stopped without momentum — nothing to coast
      const direction = velocity > 0 ? 1 : -1
      const target = Math.min(1, Math.max(START_PROGRESS, fromProgress + direction * COAST_DISTANCE))
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

    // Double-fire guard: SmoothScroll.tsx fires ScrollTrigger.update() from
    // both the Lenis "scroll" event and a native scroll listener (safety
    // net) — both can land in the same animation frame, running the
    // expensive draw()/decode-scheduling work in onUpdate twice per frame
    // instead of once. Tied to rAF (not a millisecond guess) so it's exactly
    // "once per frame" at any display refresh rate — 60Hz, 120Hz, whatever —
    // with zero risk of swallowing a legitimate later update the way a
    // fixed-ms threshold could at very high refresh rates.
    let frameScheduled = false
    const ctx = gsap.context(() => {
      draw(canvas, START_PROGRESS)

      trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        // `true`, not a decimal — Lenis (SmoothScroll.tsx) already eases
        // the raw scroll input before ScrollTrigger ever sees it. A numeric
        // scrub value adds a SECOND, independent easing layer on top of
        // that already-smoothed position — two cascading lag sources
        // instead of one. That compounded lag is what read as "stuck":
        // fast/reverse scrolling felt laggy, and stopping right at the
        // pin boundary could leave the canvas short of the final frame
        // because the scrub tween was still asymptotically catching up.
        // `true` ties the canvas 1:1 to Lenis's own (already smooth)
        // position — one smoothing layer, no compounding, always reaches
        // the true endpoint. The momentum coast above is a separate,
        // opt-in-on-idle layer — it never runs while real updates are
        // still arriving, so it can't reintroduce that old compounding bug.
        scrub: true,
        // Recompute pin start/end on any ScrollTrigger.refresh() (font
        // swaps, image loads, resize) rather than trusting cached pixel
        // bounds from creation time — cheap, only runs on refresh not scroll.
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrollStartedRef.current = true
          coastTweenRef.current?.kill() // live input always wins over a coast in flight
          clearTimeout(idleTimeoutRef.current)

          const now = performance.now()
          const dt = now - lastUpdateTimeRef.current
          if (dt > 0 && dt < 200) {
            velocityRef.current = (self.progress - lastProgressRef.current) / dt
          }
          lastProgressRef.current = self.progress
          lastUpdateTimeRef.current = now

          if (!frameScheduled) {
            frameScheduled = true
            requestAnimationFrame(() => { frameScheduled = false })
            draw(canvas, remap(self.progress))
            syncAudio(remap(self.progress))
            updateDissolve(remap(self.progress))
          }

          // No further onUpdate within 100ms means the scroll gesture has
          // actually ended (Lenis fires every frame while still gliding) —
          // hand off to the momentum coast from here.
          idleTimeoutRef.current = setTimeout(() => {
            startCoast(remap(self.progress), velocityRef.current)
          }, 100)
        },
        // Release this film's decoded bitmaps once it is off screen. Both
        // films stay mounted for the whole page, and a decoded frame costs
        // ~3.5 MB — a dormant hero holding a full window is memory the
        // atelier's decoder wants while it is the one actually scrubbing.
        // Blobs are retained, so scrolling back re-decodes cheaply.
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

    // Kept outside gsap.context — its callback's return value isn't a
    // cleanup hook the way a React effect's is, so a listener added there
    // and "returned" for cleanup was never actually being removed: every
    // remount (Fast Refresh, route back to home, etc.) stacked another
    // live 'resize' listener that re-ran draw()/ScrollTrigger.refresh().
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
  }, [prefersReduced, draw, trim, ready, syncAudio])

  // Fade the frame-0 draw in the moment frame data is ready (avoids a flash
  // of the canvas background before the first decode lands).
  useEffect(() => {
    if (!prefersReduced && ready && canvasRef.current) draw(canvasRef.current, START_PROGRESS)
  }, [ready, prefersReduced, draw])

  // Idle "breathing" loop — before the visitor has scrolled at all, the hero
  // shouldn't sit dead on frame 0. A slow, self-driven drift forward through
  // the opening beat (dust settling, her first step into the light) reads as
  // "this is already alive," not "this is a still image." Eases forward
  // ONCE from 0 to a few dozen frames in, then holds there — never reverses.
  // (An earlier version oscillated 0→forward→back→0 on a repeating cycle,
  // which read as the film visibly playing backward every few seconds —
  // exactly the bug this replaces.) The very first scroll tick flips
  // scrollStartedRef and this loop stops for good; scroll owns the canvas
  // from then on, exactly as the "responsive once you touch it" ask wants.
  // Idle breathing loop — re-enabled with the double-exposure fix:
  // a `breathingRef` flag gates the async decode-repaint path so it can
  // never fire into a frame the breathing rAF just wrote. When the breathing
  // loop owns the canvas (breathingRef.current === true) the async decode
  // callback in useFrameSequence is already prevented from overwriting it
  // because draw() is called from here exclusively. Once scroll takes over
  // the flag is cleared and the breathing loop exits, so scroll owns the
  // canvas from then on with zero interference.
  // Scroll progress of the hero section — drives the wordmark dissolve
  const { scrollYProgress: heroProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  // Wordmark fades + rises + shrinks over the first 14% of the hero runway
  const wordmarkOpacity = useTransform(heroProgress, [0, 0.14], [1, 0])
  const wordmarkY       = useTransform(heroProgress, [0, 0.14], ['0%', '-22%'])
  const wordmarkScale   = useTransform(heroProgress, [0, 0.14], [1, 0.88])

  const breathingRef = useRef(true)
  useEffect(() => {
    if (prefersReduced || !ready) return
    const canvas = canvasRef.current
    if (!canvas) return
    breathingRef.current = true
    let raf = 0
    const start = performance.now()
    const DURATION_MS = 2400
    const AMPLITUDE = 0.01 // ~1% of the film — subtler opening drift, down from 0.025
    const tick = (now: number) => {
      if (scrollStartedRef.current) { breathingRef.current = false; return }
      const t = Math.min(1, (now - start) / DURATION_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      draw(canvas, START_PROGRESS + eased * AMPLITUDE)
      if (t < 1) raf = requestAnimationFrame(tick)
      else breathingRef.current = false // settled — hand draw authority back to scroll/decode
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
          // No color filter here (CSS or ctx.filter) — both were tried to
          // add contrast/saturation and both cost enough per-frame on a
          // canvas that redraws continuously during scroll to read as
          // stuttering/skipping. The footage plays with its own native
          // grade now, same as it was shot.
          style={{ willChange: 'transform' }}
          aria-hidden="true"
        />

        {/* ── Cinematic colour-grade layer ────────────────────────────────
            Neutral warm toning around the model. `overlay` (not `screen`)
            so it doesn't lift the shadows on this low-key footage —
            `screen` was washing the blacks toward grey, which is what read
            as "faded". Overlay barely touches near-black pixels and only
            lifts midtones/highlights. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 75%, rgba(237,232,224,0.10) 0%, transparent 70%)',
            mixBlendMode: 'overlay',
          }}
        />

        {/* ── Ambient pulse ────────────────────────────────────────────────
            Barely-there breathing haze — gives the frozen first frame a
            sense of depth and life without any colour tint. Same overlay
            fix as above, for the same reason.                             */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none z-[3]"
          style={{
            inset: 0,
            background: 'radial-gradient(ellipse 55% 40% at 50% 65%, rgba(237,232,224,0.08) 0%, transparent 65%)',
            mixBlendMode: 'overlay',
            animation: 'hero-pulse 5s ease-in-out infinite',
          }}
        />


        {/* Vignette — frames the film, keeps its own edge-set captions
            readable without a second opaque scrim fighting the footage. */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 68% 74% at 50% 50%, transparent 58%, rgba(6,6,6,0.55) 100%), ' +
              'linear-gradient(to right, rgba(6,6,6,0.55), transparent 22%, transparent 78%, rgba(6,6,6,0.55))',
          }}
        />

        {/* Dream dissolve — fades to black across the last stretch of the
            hero's scrub, so the handoff into the atelier film reads as a
            soft cross-fade rather than a hard cut. Opacity driven above. */}
        <div
          ref={dissolveRef}
          className="absolute inset-0 z-[6] pointer-events-none bg-ink opacity-0"
        />

        {/* ── Rideradian-style hero wordmark ──────────────────────────────
            Giant centered brand name that owns the first frame, then
            gracefully dissolves away as the visitor scrolls into the film.
            Opacity, y, and scale all driven by heroProgress (0→14% of the
            hero's 350vh runway). z-[7] sits above the dissolve layer so it
            fades with the film, not before it.                              */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 z-[7] flex flex-col items-center justify-center pointer-events-none select-none"
          style={{ opacity: wordmarkOpacity, y: wordmarkY, scale: wordmarkScale }}
        >
          {/* Eyebrow */}
          <p
            className="label text-gold/70 mb-6"
            style={{ letterSpacing: '0.35em' }}
          >
            Est. 2024 · Bagru, Rajasthan
          </p>

          {/* Main wordmark — one whole, unbroken word at a single size.
              (Breaking it into two chunks read as disjointed; a
              dropped-cap "A" was tried and then equalised on request.)
              font-wordmark (self-hosted Yeseva One) keeps it visually
              distinct from the Fraunces serif used for every other
              headline on the site. */}
          <h1
            className="font-wordmark font-normal text-parchment text-center px-4 flex items-baseline justify-center"
          >
            <span
              className="leading-none"
              style={{ fontSize: 'clamp(2.2rem, 8vw, 6rem)', letterSpacing: '0.02em' }}
            >
              ARTTROLLEY
            </span>
          </h1>

          {/* Hallmark seal — the hand-block stamp glyph as a small hanging
              mark beneath the wordmark, in place of a plain hairline rule.
              Reads as a maker's seal, not decoration for its own sake. */}
          <WordmarkStamp className="text-gold/60 w-7 h-7 md:w-9 md:h-9 mt-3 shrink-0" />

          {/* Hairline gold rule */}
          <div
            className="mt-8 h-px bg-gold/40"
            style={{ width: 'clamp(80px, 14vw, 180px)' }}
          />

          {/* Tagline */}
          <p
            className="mt-6 font-sans font-light text-parchment/55 text-center"
            style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.95rem)', letterSpacing: '0.25em', textTransform: 'uppercase' }}
          >
            Heritage, thread by thread
          </p>
        </motion.div>

        {/* Screen-reader summary — the canvas itself is aria-hidden */}
        <h1 className="sr-only">Arttrolley — Heritage, thread by thread. Handcrafted block-print kurtis, dyed in natural indigo and rust, printed with hand-carved teak blocks.</h1>

        <button
          type="button"
          onClick={toggleMuted}
          aria-label={muted ? 'Unmute film audio' : 'Mute film audio'}
          className="absolute top-[6vh] right-6 md:right-10 z-10 w-11 h-11 flex items-center justify-center rounded-full border border-parchment/25 text-parchment/70 hover:text-gold hover:border-gold/60 transition-colors duration-500 pointer-events-auto"
        >
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

        <div
          ref={cueRef}
          className="absolute bottom-[4.5vh] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2.5 pointer-events-none"
        >
          <span className="label text-parchment/50">Scroll</span>
          <span className="block w-px h-8 bg-gradient-to-b from-gold to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}
