'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from 'framer-motion'
import DreamDust from './DreamDust'

gsap.registerPlugin(ScrollTrigger)

const PIN_VH         = 350
const COAST_DISTANCE = 0.055  // drift 5.5% after lift
const COAST_DURATION = 3.8    // seconds — eased settle
const LERP_FACTOR    = 0.11   // display-lag lerp — gives video scrub the same
                               // liquid weight that Lenis 0.050 gives the page.
                               // 0.11 ≈ 9 frames to cover half the gap at 60fps,
                               // matching the "oily" coast that award sites feel.

// ── Canvas object-fit: cover ─────────────────────────────────────────────────
// ctx.drawImage doesn't understand object-fit; we compute the source rect that
// replicates CSS object-fit: cover so the video fills the canvas at any ratio.
function drawCover(
  ctx : CanvasRenderingContext2D,
  video: HTMLVideoElement,
  cw  : number,
  ch  : number,
) {
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh) return
  const canvasAR = cw / ch
  const videoAR  = vw / vh
  let sx = 0, sy = 0, sw = vw, sh = vh
  if (videoAR > canvasAR) {
    // Video is wider than canvas — trim left/right
    sw = vh * canvasAR
    sx = (vw - sw) / 2
  } else {
    // Video is taller than canvas — trim top/bottom
    sh = vw / canvasAR
    sy = (vh - sh) / 2
  }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch)
}

export default function AtelierFilm() {
  const prefersReduced = useReducedMotion()
  const sectionRef     = useRef<HTMLElement>(null)
  const videoRef       = useRef<HTMLVideoElement>(null)
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const cueRef         = useRef<HTMLDivElement>(null)
  const dissolveRef    = useRef<HTMLDivElement>(null)

  // ── All progress state lives in refs — no React re-renders on scroll ────
  const targetProgressRef  = useRef(0)   // set by ScrollTrigger / coast tween
  const displayProgressRef = useRef(0)   // lerps toward target, drives currentTime
  const readyRef           = useRef(false)
  const scrollStartedRef   = useRef(false)
  const lastProgressRef    = useRef(0)
  const lastUpdateTimeRef  = useRef(0)
  const velocityRef        = useRef(0)
  const coastTweenRef      = useRef<gsap.core.Tween | undefined>(undefined)
  const idleTimeoutRef     = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const rafRef             = useRef(0)

  // ── Main effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced) return
    const section = sectionRef.current
    const video   = videoRef.current
    const canvas  = canvasRef.current
    if (!section || !video || !canvas) return

    video.pause()
    video.currentTime = 0

    // ── Canvas sizing: match physical pixels ────────────────────────────
    const resize2d = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width  = canvas.offsetWidth  * dpr
      canvas.height = canvas.offsetHeight * dpr
    }
    resize2d()
    const ro = new ResizeObserver(resize2d)
    ro.observe(canvas)

    const ctx2d = canvas.getContext('2d')

    // ── rAF render loop ─────────────────────────────────────────────────
    // Every frame:
    //   1. Lerp displayProgress → targetProgress (the "liquid" effect)
    //   2. Seek the hidden video only when progress has meaningfully changed
    //   3. Draw the current (possibly last-good) video frame to the canvas
    //   4. Update the dream-dissolve overlay
    //
    // Because the canvas always holds the previous frame even while the video
    // is decoding the next one, there are zero black/blank flash artifacts —
    // the single biggest visual difference from a raw <video> element scrub.
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick)
      if (!readyRef.current || !video.duration || !ctx2d) return

      const prev    = displayProgressRef.current
      const next    = prev + (targetProgressRef.current - prev) * LERP_FACTOR
      displayProgressRef.current = next

      // Seek only when progress has changed enough to produce a new frame
      if (Math.abs(next - prev) > 0.00015) {
        video.currentTime = Math.min(1, Math.max(0, next)) * video.duration
      }

      // Always draw — canvas shows last good frame while seek is in-flight
      if (video.readyState >= 2) {
        drawCover(ctx2d, video, canvas.width, canvas.height)
      }

      // Dream dissolve (last 6% of runway → ink fade)
      if (dissolveRef.current) {
        const raw = next > 0.94 ? (next - 0.94) / 0.06 : 0
        dissolveRef.current.style.opacity = String(raw * raw)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    // ── Momentum coast ──────────────────────────────────────────────────
    // Animates targetProgress via a gsap proxy — the lerp loop picks it
    // up smoothly so the coast and the scroll feel identical in character.
    const startCoast = (fromProgress: number, velocity: number) => {
      if (Math.abs(velocity) < 0.00002) return
      const direction = velocity > 0 ? 1 : -1
      const target    = Math.min(1, Math.max(0, fromProgress + direction * COAST_DISTANCE))
      const proxy     = { p: fromProgress }
      coastTweenRef.current = gsap.to(proxy, {
        p: target,
        duration: COAST_DURATION,
        ease: 'power2.out',
        onUpdate: () => { targetProgressRef.current = proxy.p },
      })
    }

    // ── ScrollTrigger ───────────────────────────────────────────────────
    // Only updates targetProgress — the rAF loop handles the actual seek
    // and draw, with the lerp already applied. This separation means the
    // scrub never "jumps" to a raw scroll position.
    let frameScheduled = false

    const scrollCtx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start  : 'top top',
        end    : 'bottom bottom',
        scrub  : true,
        onUpdate: (self) => {
          scrollStartedRef.current = true
          coastTweenRef.current?.kill()
          clearTimeout(idleTimeoutRef.current)

          const now = performance.now()
          const dt  = now - lastUpdateTimeRef.current
          if (dt > 0 && dt < 200) {
            velocityRef.current = (self.progress - lastProgressRef.current) / dt
          }
          lastProgressRef.current   = self.progress
          lastUpdateTimeRef.current = now

          // Double-fire guard: collapse Lenis + native-scroll events per frame
          if (!frameScheduled) {
            frameScheduled = true
            requestAnimationFrame(() => { frameScheduled = false })
            targetProgressRef.current = self.progress
          }

          // 100ms of scroll silence → hand off to coast
          idleTimeoutRef.current = setTimeout(() => {
            startCoast(self.progress, velocityRef.current)
          }, 100)
        },
        onEnter     : () => gsap.to(cueRef.current, { opacity: 1, duration: 0.6 }),
        onLeave     : () => {
          gsap.to(cueRef.current, { opacity: 0, duration: 0.4 })
          coastTweenRef.current?.kill()
          clearTimeout(idleTimeoutRef.current)
        },
        onEnterBack : () => gsap.to(cueRef.current, { opacity: 1, duration: 0.4 }),
      })
    }, section)

    const onCanPlay = () => { readyRef.current = true }
    video.addEventListener('canplay', onCanPlay)
    if (video.readyState >= 2) readyRef.current = true

    return () => {
      cancelAnimationFrame(rafRef.current)
      video.removeEventListener('canplay', onCanPlay)
      coastTweenRef.current?.kill()
      clearTimeout(idleTimeoutRef.current)
      ro.disconnect()
      scrollCtx.revert()
    }
  }, [prefersReduced])

  // ── Idle breathing ─────────────────────────────────────────────────────
  // Advances targetProgress (not currentTime) so the lerp applies — same
  // "film isn't dead on frame 0" behaviour as the hero, same feel.
  useEffect(() => {
    if (prefersReduced) return

    let raf = 0
    const waitForReady = setInterval(() => {
      if (!readyRef.current || !videoRef.current?.duration) return
      clearInterval(waitForReady)

      const DURATION  = 3200
      const AMPLITUDE = 0.025
      const start     = performance.now()

      const breathTick = (now: number) => {
        if (scrollStartedRef.current) return
        const t     = Math.min(1, (now - start) / DURATION)
        const eased = 1 - Math.pow(1 - t, 3)
        targetProgressRef.current = eased * AMPLITUDE
        if (t < 1) raf = requestAnimationFrame(breathTick)
      }
      raf = requestAnimationFrame(breathTick)
    }, 100)

    return () => { clearInterval(waitForReady); cancelAnimationFrame(raf) }
  }, [prefersReduced])

  // ── Reduced-motion fallback ────────────────────────────────────────────
  if (prefersReduced) {
    return (
      <section
        id="atelier-film"
        className="relative h-screen flex items-center justify-center overflow-hidden bg-ink"
      >
        <video
          src="/videos/atelier.mp4"
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 68% 74% at 50% 50%, transparent 58%, rgba(6,6,6,0.5) 100%), ' +
              'linear-gradient(to right, rgba(6,6,6,0.5), transparent 22%, transparent 78%, rgba(6,6,6,0.5))',
          }}
        />
        <h2 className="sr-only">
          The Arttrolley atelier — handblock printing on natural-dyed cloth in Bagru, Rajasthan.
        </h2>
        <div className="absolute top-[6vh] left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
          <p className="label text-parchment/60">The Atelier</p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="atelier-film"
      ref={sectionRef}
      style={{ height: `${PIN_VH}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">

        {/* Hidden <video> — decode source only, never shown directly.
            Keeping it in the DOM lets the browser buffer and decode frames;
            the canvas is what the user sees. */}
        <video
          ref={videoRef}
          src="/videos/atelier.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0 }}
          aria-hidden="true"
        />

        {/* <canvas> — painted on every rAF tick with object-fit: cover math.
            Because it always holds the last successfully decoded frame it
            never flashes black mid-seek, which is the single biggest visual
            difference from a raw <video> scrub on slow-to-decode codecs. */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: 'block' }}
          aria-hidden="true"
        />

        <DreamDust className="z-[4]" />

        {/* Vignette */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 68% 74% at 50% 50%, transparent 58%, rgba(6,6,6,0.55) 100%), ' +
              'linear-gradient(to right, rgba(6,6,6,0.55), transparent 22%, transparent 78%, rgba(6,6,6,0.55))',
          }}
        />

        {/* Dream dissolve — style.opacity driven directly in rAF tick */}
        <div
          ref={dissolveRef}
          className="absolute inset-0 z-[6] pointer-events-none bg-ink"
          style={{ opacity: 0 }}
        />

        <h2 className="sr-only">
          The Arttrolley atelier — handblock printing on natural-dyed cloth in Bagru, Rajasthan.
        </h2>

        <div className="absolute top-[6vh] left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
          <p className="label text-parchment/60">The Atelier</p>
        </div>

        <div
          ref={cueRef}
          className="absolute bottom-[4.5vh] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2.5 pointer-events-none opacity-0"
        >
          <span className="label text-parchment/50">Scroll</span>
          <span className="block w-px h-8 bg-gradient-to-b from-gold to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}
