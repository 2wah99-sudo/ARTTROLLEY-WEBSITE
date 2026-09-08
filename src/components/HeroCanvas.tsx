'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from 'framer-motion'
import { useFrameSequence } from '@/lib/useFrameSequence'
import { useScrubAudio } from '@/lib/useScrubAudio'
import WordmarkStamp from './WordmarkStamp'

gsap.registerPlugin(ScrollTrigger)

const PIN_VH_DESKTOP = 1500
// Mobile scroll distance is shortened (not just re-cropped) — a 1500vh pin
// on a narrow phone means ~15 full-screen swipes to reach the end of the
// same film that takes far fewer on a mouse-wheel desktop scroll, since
// touch-scroll deltas per gesture are smaller. Reusing the same frames but
// mapping them onto a shorter scroll track (per the scroll-site-generator
// skill's own mobile guidance: reduce total scroll height) makes each swipe
// advance further into the film — same asset set, no upscale/crop change,
// just less physical scrolling required to see the whole thing.
const PIN_VH_MOBILE = 550
// The frame sequence itself now physically starts at what used to be frame
// 25 — the old frames 1-24 were deleted and the rest renumbered down
// (frame_0025.webp → frame_0001.webp, etc.), per explicit request, instead
// of keeping all 1342 frames and skipping the first 24 via this offset.
// Kept as a named constant (rather than removing it and inlining 0
// everywhere) so a future "start partway into the reel" request only
// means changing this one line again, not re-deriving remap/clamp logic.
const START_PROGRESS = 0

// The cinematic color grade — CSS `filter` on the canvas plus the
// mix-blend-mode overlay stack below it. This used to be toggled off during
// active scroll and faded back in on idle (a perf guard against filter/blend
// compositing cost on a full-screen viewport), but that toggle mechanism
// caused three separate real bugs in a row (an out-of-sync canvas/overlay
// restore, a mix-blend-mode isolation bug from animating a wrapper's opacity
// that made the whole grade flash white, and a wrong-target-opacity bug that
// blew the film grain out to full intensity) — each fix for the previous bug
// exposed the next one. Per explicit request, the grade is now permanently
// applied at all times, scrolling or not: simpler, and it's what "constant
// color grading on every frame" actually means. If full-screen scroll
// performance regresses because of this, the fix belongs in reducing the
// compositing cost itself (fewer/cheaper layers) — not in reintroducing a
// flicker-prone on/off toggle.
const GRADE_FILTER = 'contrast(1.1) saturate(1.18) brightness(0.97) sepia(0.06)'

export default function HeroCanvas() {
  const prefersReduced = useReducedMotion()
  const sectionRef  = useRef<HTMLElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const cueRef      = useRef<HTMLDivElement>(null)
  const dissolveRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLDivElement>(null)
  // Which frame set to fetch. 'hero' (1920x1080 for the two upgraded
  // segments) is the sharp set; 'hero-mobile' (720p throughout, ~30% less
  // data) is for phones — on a narrow PORTRAIT viewport, cover-mode cropping
  // shows only a narrow horizontal slice of the frame (landscape source,
  // tall canvas), so the extra 1080p detail is largely invisible there while
  // the phone still pays the full download/decode cost. Reported live as new
  // mobile lag right after the 1080p upgrade shipped.
  //
  // Starts at 'hero' unconditionally (not a lazy useState(() => window...)
  // initializer) so it matches this static-exported page's build-time HTML
  // exactly — a lazy initializer reading window.innerWidth would compute a
  // DIFFERENT value on the client than what was baked into the pre-rendered
  // HTML at build time (no `window` then), and that mismatch meant the
  // corrected value never actually reached the img src / hook in testing.
  // Deciding in an effect instead avoids the mismatch entirely: 'hero' is
  // what both server and first client render agree on, and this effect runs
  // immediately after mount to correct it for phones before either the
  // poster image or the frame-loading hook has fetched anything meaningful.
  // 768px matches the same `md:` breakpoint already used for phone-vs-
  // tablet/desktop layout elsewhere in this codebase (Nav.tsx etc.).
  const [frameSet, setFrameSet] = useState<'hero' | 'hero-mobile'>('hero')
  useEffect(() => {
    if (window.innerWidth < 768) setFrameSet('hero-mobile')
  }, [])
  // Switching frameSet changes the section's own height (PIN_VH_MOBILE vs
  // PIN_VH_DESKTOP above) after the ScrollTrigger below has already measured
  // the DOM once at mount. Without this, a phone would keep the desktop
  // pin distance ScrollTrigger originally measured, silently undoing the
  // shorter mobile scroll track.
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [frameSet])
  // 'cover' everywhere — it already fills top-to-bottom EXACTLY with zero
  // gap for this landscape footage in a portrait phone container (the
  // "fit to fit" vertically requested), no letterboxing needed. The
  // requested black side clearance is a separate, simpler thing: an inset
  // margin around the video BOX itself (see the sticky container below),
  // not a change to how the frame fills that box.
  const fitMode = 'cover'
  // Mobile only, explicit "zoom out a bit" request: show more of each
  // frame's width instead of the full ~2.3x cover crop. Modest (0.85, not
  // dramatic) per "a bit" — introduces a small top/bottom gap as an
  // unavoidable trade-off, see useFrameSequence's zoomOut comment.
  const zoomOut = frameSet === 'hero-mobile' ? 0.85 : 1
  const { ready, draw, trim, getLoadedFraction } = useFrameSequence(frameSet, { canvasFilter: GRADE_FILTER, fitMode, zoomOut })
  const [loadPct, setLoadPct] = useState(0)
  const { sync: syncAudio, muted, toggleMuted } = useScrubAudio('/audio/hero.mp3')
  const scrollStartedRef  = useRef(false)
  const lastProgressRef   = useRef(0)
  const lastUpdateTimeRef = useRef(0)
  const velocityRef       = useRef(0)
  const idleTimeoutRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const coastTweenRef     = useRef<gsap.core.Tween | undefined>(undefined)

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
        // Back to a plain `scrub: true` (was briefly a numeric 0.85) now
        // that SmoothScroll.tsx drives GSAP's ticker through Lenis again —
        // the scroll "weight" comes from Lenis's lerp once, upstream, not
        // from a second layer of GSAP-side scrub smoothing stacked on top
        // of it. Double-smoothing there felt mushy/laggy rather than heavy.
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

          // Wordmark fade/lift/scale — was a separate framer-motion
          // useScroll/useTransform pipeline (its own scroll listener running
          // in parallel with this ScrollTrigger). Consolidated onto this
          // single ScrollTrigger instance instead, per the gsap-scrolltrigger
          // skill: one scroll-tracking method, not two competing ones. Keyed
          // to raw self.progress (0 → 0.14 of the pin), matching the
          // original mapping exactly.
          const wordT = Math.min(1, self.progress / 0.14)
          if (wordmarkRef.current) {
            gsap.set(wordmarkRef.current, {
              opacity: 1 - wordT,
              yPercent: -22 * wordT,
              scale: 1 - 0.12 * wordT,
            })
          }

          // Idle debounce before handing off to the momentum coast — no
          // longer also gates a grade restore (grade is always on now).
          idleTimeoutRef.current = setTimeout(() => {
            startCoast(p, velocityRef.current)
          }, 60)
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
    // Debounced (trailing edge, ~150ms) — a raw window resize fires
    // continuously while the user drags the window edge, and each call was
    // synchronously redrawing the canvas at full resolution AND running a
    // full ScrollTrigger.refresh() (re-measures every pin on the page).
    // Waiting for resize events to go quiet before doing that once means a
    // resize drag no longer pays for N of those passes, just one. This only
    // touches how often the resize handler itself fires — none of the
    // hero's own pin/scrub/coast settings above are changed.
    let resizeTimeout: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(resize, 150)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimeout)
      coastTweenRef.current?.kill()
      clearTimeout(idleTimeoutRef.current)
      ctx.revert()
    }
  // NOTE: `ready` deliberately excluded from this dependency array. It used
  // to be here, which meant the ENTIRE ScrollTrigger got torn down and
  // rebuilt from scratch the instant frame 0 finished loading (ready:
  // false→true) — including killing any in-flight coast tween and losing
  // all scroll-position tracking state. If the user started scrolling
  // immediately on page load (common on a slower connection, where frame 0
  // takes a moment to arrive), this fired mid-gesture: a real stutter/reset
  // during active scroll. The effect body never actually reads `ready` —
  // the separate effect right below already handles the ready-triggered
  // first paint — so there was nothing here that needed the rebuild.
  }, [prefersReduced, draw, trim, syncAudio, getLoadedFraction]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Track load progress for the slow-network indicator.
  // Polls via rAF while frames are still arriving; stops once fully loaded.
  useEffect(() => {
    if (!ready) return
    let raf = 0
    const poll = () => {
      const pct = Math.round(getLoadedFraction() * 100)
      setLoadPct(pct)
      if (pct < 100) raf = requestAnimationFrame(poll)
    }
    raf = requestAnimationFrame(poll)
    return () => cancelAnimationFrame(raf)
  }, [ready, getLoadedFraction])

  if (prefersReduced) {
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/frames/${frameSet}/frame_0001.webp`} alt="Arttrolley hero" className="absolute inset-0 w-full h-full object-cover" />
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
      style={{ height: `${frameSet === 'hero-mobile' ? PIN_VH_MOBILE : PIN_VH_DESKTOP}vh` }}
      className="relative bg-ink"
    >
      {/* Full-screen (h-screen) top-to-bottom on every breakpoint — the
          video fills exactly edge-to-edge vertically, no letterbox gap,
          same as desktop. On mobile only, the box itself is narrower than
          the viewport (not full w-full), so the parent <section>'s bg-ink
          shows through as a black clearance strip on the left and right —
          explicit request, distinct from how the frame fills this box
          (still 'cover', unchanged). Desktop is unaffected (w-full again
          from md: up). */}
      <div className="sticky top-0 h-screen overflow-hidden bg-ink w-[calc(100%-2rem)] mx-auto md:w-full md:mx-0">
        {/* Poster fallback — a plain <img>, loaded by the browser's own
            network stack (its own retry/priority/caching, independent of the
            custom fetch pipeline above). Shows instantly on any connection,
            including one where the JS frame sequence is still fetching frame
            0 or failed it outright. The canvas draws on top and is fully
            opaque once it has a frame; until then this is what's visible
            instead of a blank/black hero. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/frames/${frameSet}/frame_0001.webp`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: GRADE_FILTER }}
          fetchPriority="high"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            willChange: 'transform',
            // Reverted from a Canvas 2D ctx.filter experiment (see
            // useFrameSequence.ts's draw() comment) — that moved the grade
            // off this CSS filter to fix desktop scroll jank, but Canvas 2D
            // filter has a history of slow/unoptimized rendering specifically
            // on mobile Safari, and it froze the hero on a real phone within
            // one deploy. CSS filter is reliably GPU-accelerated everywhere,
            // including mobile — a frozen hero is worse than imperfect
            // desktop smoothness, so this is the safe default again.
            filter: 'contrast(1.1) saturate(1.18) brightness(0.97) sepia(0.06)',
          }}
          aria-hidden="true"
        />

        {/* Teal-shadow / amber-highlight split tone — the actual "premium
            film" color-grade move: push shadows cool, highlights warm, so
            the image reads as graded rather than flat-lit footage. This is
            the one remaining color-dodge blend layer; the bottom-anchored
            darkening that used to be its own separate `mixBlendMode:
            multiply` div now lives as a plain (unblended) extra gradient
            layer on the vignette below instead — five stacked full-viewport
            mix-blend-mode layers on top of a canvas that redraws on every
            scroll tick was the dominant cost behind the full-screen
            freeze/lag report: blend-mode compositing scales with on-screen
            pixel area, so it's cheap on a small window and brutal at full
            screen — independent of, and untouched by, the DPR/resolution
            budget in perfTier.ts. Cutting the blend-layer count (5 → 3:
            this split-tone, the merged warm+pulse layer below, and the
            grain layer further down) is the direct fix for that; nothing
            about the canvas draw loop itself changed. */}
        {/* The 3 blend-mode grade layers below render with their own static
            opacity always — no wrapper, no toggle, per explicit request that
            the color grade stay constant on every frame regardless of scroll
            state. (A shared wrapper with an animated opacity was the exact
            cause of the earlier white-flash bug: CSS isolates mix-blend-mode
            children from their real backdrop whenever an ancestor has
            fractional opacity — see GRADE_FILTER comment above for the full
            history. Simplest fix is to never animate opacity here at all.) */}
        <div aria-hidden="true" className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'linear-gradient(160deg, rgba(10,28,32,0.30) 0%, transparent 42%, transparent 58%, rgba(198,142,72,0.16) 100%)',
            mixBlendMode: 'color-dodge',
            opacity: 0.35,
          }} />

        {/* Cinematic warm overlay + ambient pulse, merged into one blended
            layer (was two separate mix-blend-mode divs with near-identical
            radial gradients, one of them animating forever). Both gradients
            now live as stacked background layers on a single div; the pulse
            keyframe still only touches this div's own opacity/scale, so the
            visual read is unchanged — one blend-mode compositing pass
            instead of two, and one live animation instead of two. */}
        {/* Static now — was `animation: hero-pulse 5s ease-in-out infinite`,
            a continuous opacity+scale animation running forever regardless
            of scroll. Any animated property on a mix-blend-mode layer forces
            the browser to recomposite it every animation frame, all the
            time — an always-on cost stacked on top of the canvas's own
            per-scroll-tick redraw. opacity 0.8 is the animation's own
            time-averaged midpoint, so the static look matches what the
            pulse read as on average rather than picking either extreme. */}
        <div aria-hidden="true" className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 55% 40% at 50% 65%, rgba(237,232,224,0.08) 0%, transparent 65%), ' +
              'radial-gradient(ellipse 70% 60% at 50% 75%, rgba(237,232,224,0.10) 0%, transparent 70%)',
            mixBlendMode: 'overlay',
            opacity: 0.8,
          }} />

        {/* Fine film grain — the texture that reads as "shot on film," not
            "rendered." Tiny, low-opacity, tiled noise via SVG data-URI so no
            extra asset request. */}
        <div aria-hidden="true" className="absolute inset-0 z-[4] pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            opacity: 0.05,
            mixBlendMode: 'overlay',
          }} />

        {/* Vignette — plain (unblended) alpha darkening, so it's cheap
            regardless of viewport size. Now carries the bottom-anchored
            radial darken that used to be its own `mixBlendMode: multiply`
            div (see comment above) as a third background layer. */}
        <div className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 80% at 50% 100%, rgba(8,20,24,0.45) 0%, transparent 55%), ' +
              'radial-gradient(ellipse 68% 74% at 50% 50%, transparent 58%, rgba(6,6,6,0.55) 100%), ' +
              'linear-gradient(to right, rgba(6,6,6,0.55), transparent 22%, transparent 78%, rgba(6,6,6,0.55))',
          }} />

        {/* Dream dissolve */}
        <div ref={dissolveRef} className="absolute inset-0 z-[6] pointer-events-none bg-ink opacity-0" />

        {/* Wordmark — opacity/lift/scale now driven by the hero's single
            ScrollTrigger onUpdate (see effect above), not a separate
            framer-motion scroll listener. */}
        <div ref={wordmarkRef} aria-hidden="true"
          className="absolute inset-0 z-[7] flex flex-col items-center justify-center pointer-events-none select-none">
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
        </div>

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

        {/* Thin gold loading bar — visible on slow networks so users know
            frames are arriving, not that the site is broken. Fades away once
            the buffer is fully loaded. Only renders while loadPct < 100. */}
        {loadPct < 100 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 h-[2px] bg-parchment/8 pointer-events-none">
            <div
              className="h-full bg-gold/60 transition-[width] duration-300 ease-linear"
              style={{ width: `${loadPct}%` }}
              aria-hidden="true"
            />
          </div>
        )}

        <div ref={cueRef} className="absolute bottom-[4.5vh] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2.5 pointer-events-none">
          <span className="label text-parchment/50">Scroll</span>
          <span className="block w-px h-8 bg-gradient-to-b from-gold to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}
