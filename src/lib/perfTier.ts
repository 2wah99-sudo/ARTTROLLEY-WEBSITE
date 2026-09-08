'use client'

/**
 * perfTier — a single, cheap read of "how much can this device/network
 * actually afford" so every heavy visual effect on the site (hero canvas
 * resolution, frame-buffer concurrency, decorative particle counts) can
 * scale itself down together instead of each guessing independently.
 *
 * Why this exists: the hero canvas's devicePixelRatio cap was raised to 2
 * for sharpness on normal-sized windows, but at a full-screen 1920x1080+
 * viewport on a Retina/4K-scaled display, DPR 2 means redrawing a
 * 3840x2160+ frame on every scroll tick — that's the actual cause of the
 * full-screen FPS drop, not a bug in the scroll code itself. The fix isn't
 * "always use a smaller DPR" (that would make the normal case blurry
 * again) — it's computing a pixel BUDGET (total canvas megapixels) and
 * deriving whatever DPR fits that budget at the current viewport size, so
 * a small window still gets full sharpness and a huge one automatically
 * backs off.
 */

export type Tier = 'low' | 'medium' | 'high'

let cached: Tier | null = null

export function getPerfTier(): Tier {
  if (cached) return cached
  if (typeof navigator === 'undefined') return 'high'

  let score = 2 // start at medium

  const cores = navigator.hardwareConcurrency || 4
  if (cores <= 2) score -= 2
  else if (cores <= 4) score -= 1
  else if (cores >= 8) score += 1

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  if (mem !== undefined) {
    if (mem <= 2) score -= 2
    else if (mem <= 4) score -= 1
    else if (mem >= 8) score += 1
  }

  const conn = (navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean; downlink?: number }
  }).connection
  if (conn) {
    if (conn.saveData) score -= 2
    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') score -= 2
    else if (conn.effectiveType === '3g') score -= 1
    if (typeof conn.downlink === 'number' && conn.downlink < 1.5) score -= 1
  }

  const isCoarsePointer = typeof window !== 'undefined' &&
    window.matchMedia?.('(pointer: coarse)').matches
  if (isCoarsePointer) score -= 1 // most phones/tablets — weaker GPUs, metered data far more often

  cached = score <= 0 ? 'low' : score >= 3 ? 'high' : 'medium'
  return cached
}

/**
 * Canvas DPR that fits a total-pixel budget rather than blindly following
 * devicePixelRatio. Budgets are in megapixels of canvas backing-store area
 * (width*height*dpr^2). A small window at DPR 2 stays sharp; a full-screen
 * 4K-scaled window automatically gets a lower effective DPR so it isn't
 * redrawing 8+ megapixels every scroll tick.
 */
export function budgetedDpr(cssWidth: number, cssHeight: number): number {
  const tier = getPerfTier()
  // Ceiling lowered again (was 1.5/2) — a real full-screen freeze was still
  // reported at the old caps. 1.75 on medium/high still reads sharp on a
  // normal window (most displays aren't past ~1.5-2x anyway) but keeps a
  // 3x/4x-scaled full-screen viewport from ever asking for that much.
  // Raised from 1.75 → 2.0 on medium/high: the pixel-budget gate below
  // already caps phones to ~1.87 DPR (1.15 MP / 390×844 CSS px) so raising
  // the ceiling here is harmless on small screens while giving mid-range
  // devices (tablets at 768×1024) headroom they couldn't reach before.
  const rawDpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1.3 : 2.0)
  // Raised again (was 0.85/1.15/1.5) now that the actual causes of the
  // earlier full-screen freeze reports are fixed at the source rather than
  // papered over with a DPR ceiling: the color grade moved off a per-tick
  // CSS filter recompositing pass, blend layers cut 5→3, and a continuously
  // animating overlay layer removed entirely. With those real costs gone,
  // this budget can afford to prioritize sharpness again. It's true the
  // source frames are only 1280x720 (0.92 MP) — upscaling the canvas BUFFER
  // beyond that adds no new detail — but matching the display's actual
  // physical pixel grid still avoids a SECOND blur pass: if the canvas
  // buffer is smaller than the device's real DPR, the browser has to
  // upscale the whole canvas element again on top of the image's own
  // upscale, softening it twice instead of once.
  const budgetMp = tier === 'low' ? 1.2 : tier === 'medium' ? 2.0 : 3.0
  const basePx = Math.max(1, cssWidth * cssHeight)
  const maxDprForBudget = Math.sqrt((budgetMp * 1_000_000) / basePx)
  return Math.max(1, Math.min(rawDpr, maxDprForBudget))
}

/** Network/hardware-scaled tuning for the hero frame-buffer loader. */
export function frameLoaderTuning() {
  const tier = getPerfTier()
  if (tier === 'low') {
    // Tightened further (was 6/6/48): on a genuinely bad connection (rural
    // 3G, a dead-zone 2G fallback), 6 concurrent requests just queue behind
    // each other on the same tiny pipe and each one is more likely to hang
    // past a reasonable timeout. Fewer, more likely to actually land.
    return { MAX_INFLIGHT: 4, AHEAD: 24, BEHIND: 8, KEEP: 40, EVICT_AT: 55, FETCH_CONCURRENCY: 4, EAGER_CAP: 20 }
  }
  if (tier === 'medium') {
    // MAX_INFLIGHT lowered (was 10) — this governs simultaneous DECODE
    // operations (createImageBitmap), not network fetches. Browsers have a
    // real, much smaller internal decode-thread pool than 10; requesting
    // more concurrent decodes than that doesn't add real parallelism, it
    // just queues extra promises that all complete in a pile-up once the
    // real threads free up — measured contributing to a scroll stutter when
    // scrubbing into freshly-unexplored frames. Fewer in-flight decodes at
    // once means each one finishes and hands off to the next sooner instead
    // of all queuing together.
    return { MAX_INFLIGHT: 6, AHEAD: 60, BEHIND: 16, KEEP: 90, EVICT_AT: 115, FETCH_CONCURRENCY: 10, EAGER_CAP: 90 }
  }
  return { MAX_INFLIGHT: 8, AHEAD: 80, BEHIND: 20, KEEP: 120, EVICT_AT: 150, FETCH_CONCURRENCY: 16, EAGER_CAP: 120 }
}

/** Scale a decorative particle/orb count down on weaker tiers. */
export function scaleCount(base: number): number {
  const tier = getPerfTier()
  if (tier === 'low') return Math.max(0, Math.round(base * 0.25))
  if (tier === 'medium') return Math.round(base * 0.6)
  return base
}
