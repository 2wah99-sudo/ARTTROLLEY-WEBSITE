"use client";

import { useEffect, useRef, useState } from "react";
import { budgetedDpr, frameLoaderTuning } from "./perfTier";

type Frame =
  | { kind: "bitmap"; img: ImageBitmap }
  | { kind: "element"; img: HTMLImageElement; url: string };

// Decoded-bitmap memory cap. Two of the hero's three segments were upgraded
// from 1280x720 (0.92 MP) source frames to 1920x1080 (2.07 MP) masters for
// sharpness — but the frame cache (KEEP/EVICT_AT in perfTier.ts) keeps up to
// 90-150 DECODED bitmaps resident for smooth scrubbing, sized for the
// ORIGINAL 0.92 MP frames. Nobody re-checked that budget after the
// resolution upgrade: at 1080p, resident memory for that same frame count is
// ~1.1GB (150 frames x ~7.9MB each) instead of ~490MB — a real, measured
// regression that's a very plausible cause of mid-scroll stalling (memory
// pressure, GC pauses) reported after that upgrade shipped. Capping every
// decoded bitmap at MAX_DECODE_MP keeps memory identical to the pre-upgrade
// budget regardless of source resolution, while still capturing real
// sharpness benefit from the bigger source: downscaling 1080p to ~720p
// during decode is a supersampled resize (higher-quality antialiasing) that
// reads sharper than the original native-720p footage ever did, even though
// the RESIDENT bitmap ends up the same size either way.
// 1920x1080 (2.07 MP) downscaled to fit this budget lands at 1366x768
// (1.05 MP) — precomputed once since every upgraded frame shares the exact
// same source resolution, letting the resize happen in the SAME
// createImageBitmap call as the decode itself (one decode pass) rather than
// decoding at full 1080p and resizing as a second pass (two passes). Halves
// the decode work per upgraded frame, which matters when several frames
// need decoding back-to-back during a fast scroll — measured contributing
// to a ~250-300ms stall on exactly this kind of decode burst.
const HERO_UPGRADED_SIZE = { w: 1920, h: 1080 };
const HERO_DECODE_TARGET = (() => {
  const mp = (HERO_UPGRADED_SIZE.w * HERO_UPGRADED_SIZE.h) / 1_000_000;
  const scale = Math.sqrt(1.05 / mp);
  return {
    width: Math.round(HERO_UPGRADED_SIZE.w * scale),
    height: Math.round(HERO_UPGRADED_SIZE.h * scale),
  };
})();
// Frame index 843 is the exact boundary where the hero's source frames drop
// back to 1280x720 (segment C, never upgraded) — see frameAnchor() above,
// which documents the same three segments. Frames below that index are
// known to be the 1920x1080 masters and get the resize target baked
// directly into their decode call; at or above it, frames are already
// 720p-scale and decode at their native size, exactly as before this
// resolution upgrade existed.
const HERO_UPGRADED_BOUNDARY = 843;

async function decodeBlob(blob: Blob, frameIndex?: number, hasUpgradedFrames?: boolean): Promise<Frame> {
  try {
    // hasUpgradedFrames must be checked too, not just the index range — the
    // 'hero-mobile' frame set has NO 1080p frames at all (every index is
    // already 720p, including 0-842). A real bug: this used to resize-decode
    // by index alone, which meant mobile was upscaling its OWN already-
    // correct 720p frames up to the 1080p-downscale target size for no
    // reason — wasted decode work and a pointless upscale, on the one frame
    // set that most needs to stay light.
    const needsDownscale = !!hasUpgradedFrames && frameIndex !== undefined && frameIndex < HERO_UPGRADED_BOUNDARY;
    const img = needsDownscale
      ? await createImageBitmap(blob, {
          resizeWidth: HERO_DECODE_TARGET.width,
          resizeHeight: HERO_DECODE_TARGET.height,
          resizeQuality: "high",
        })
      : await createImageBitmap(blob);
    return { kind: "bitmap", img };
  } catch {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("img decode failed"));
      img.src = url;
    });
    return { kind: "element", img, url };
  }
}

function releaseFrame(f: Frame) {
  if (f.kind === "bitmap") f.img.close();
  else URL.revokeObjectURL(f.url);
}

// Fetch with a hang-timeout and retry-with-backoff. A raw `fetch()` on a bad
// connection can hang far longer than a user will wait, or fail outright on
// one dropped packet — and previously a single such failure meant that frame
// stayed null FOREVER (see advanceLoadedMark below), permanently freezing
// the buffer-loaded fraction and, with it, the hero. This wrapper aborts a
// hung request after TIMEOUT_MS and retries with backoff before giving up,
// so a transient blip on a weak network self-heals instead of wedging.
const FETCH_TIMEOUT_MS = 6000;
const MAX_BACKOFF_MS = 2000; // uncapped exponential backoff let frame-0's 5
                              // retries take 90+ seconds to give up on a dead
                              // URL — capped so a permanent failure resolves
                              // in well under 30s even in the worst case.
async function fetchWithRetry(url: string, retries: number): Promise<Blob> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.blob();
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, Math.min(400 * Math.pow(3, attempt), MAX_BACKOFF_MS)));
      }
    }
  }
  throw lastErr;
}

// ─── Per-segment crop anchor ────────────────────────────────────────────────
// The hero film is stitched from several distinct shots with different
// framing, not one continuous take — confirmed by directly sampling frames
// across the sequence:
//   • Frames 0-459: close-up shots. The subject drifts noticeably right of
//     center as the segment progresses (~47% of frame width at the start,
//     ~59% by the end) — a dead-center crop clips her face on the right
//     edge on portrait phones (which show only the center ~26% of the
//     frame's width once scaled to cover a tall screen).
//   • Frames 460-842: has a ~66px solid-black dead band across the TOP of
//     every frame in this segment (confirmed by row-brightness scan — not a
//     bug, baked into the source), no matching band at the bottom. A crop
//     anchor tuned for the other segments would waste vertical crop budget
//     preserving that dead space instead of cropping into it first.
//   • Frames 843-1317: the wide overhead fabric-fan shot (this is also
//     where the Google-Veo watermark patch lives) — the subject sits lower
//     and more vertically centered in frame than the close-up segments.
// A single global anchor cannot keep the subject in frame across all three;
// this table picks a per-segment anchor validated by inspecting samples from
// each. anchorX/anchorY of 0.5 reproduce plain dead-center cropping.
type FrameAnchor = { anchorX: number; anchorY: number };
function frameAnchor(frameIndex: number, _totalFrames: number): FrameAnchor {
  // NOTE: anchorY only has any effect at all on landscape/wide viewports —
  // on a portrait phone the source's height is scaled to fit the canvas
  // EXACTLY (zero vertical overflow, cover is 100% a horizontal crop there),
  // confirmed by direct measurement. So these anchorY values are tuned for
  // laptop/desktop framing specifically; anchorX matters on both.
  //
  // Nudged up from an earlier pass (0.20/0.34/0.25) after live-testing found
  // the fixed nav bar (Nav.tsx, 64px tall, near-opaque backdrop-blur once
  // scrolled past 40px — permanent for virtually the whole scroll) was
  // overlapping the subject's face on short/wide laptop viewports, where
  // that top strip is a bigger fraction of the frame. These values leave
  // more headroom so the face sits below the nav's safe-exclusion zone.
  if (frameIndex < 460) return { anchorX: 0.55, anchorY: 0.30 }; // close-ups, right-drifting
  if (frameIndex < 843) return { anchorX: 0.50, anchorY: 0.42 }; // top dead-band segment
  return { anchorX: 0.50, anchorY: 0.33 };                       // wide fabric-fan shot
}

// ─── Tuning ───────────────────────────────────────────────────────────────────
// AHEAD=80 keeps ~2.7s of 30fps film pre-decoded ahead of the playhead —
// hard to outrun even on a fast scroll. KEEP=120 holds 4s of decoded frames
// resident so backward scrub never cold-misses. FETCH_CONCURRENCY=16 fills
// the blob buffer as fast as the network allows on page load.
//
// All of the above are the HIGH-tier numbers. On a slow connection or weak
// device these get scaled down via frameLoaderTuning() below — firing 16
// concurrent fetches on a throttled/metered connection just queues behind
// itself and starves the frames that actually need to arrive first, and
// keeping 120 decoded bitmaps resident is real memory pressure on a low-end
// phone. The tuning is read once per mount, not per frame — cheap.
const {
  MAX_INFLIGHT,
  AHEAD,
  BEHIND,
  KEEP,
  EVICT_AT,
  FETCH_CONCURRENCY: STATIC_FETCH_CONCURRENCY,
} = frameLoaderTuning();

// Real-time throughput probe. The tier above is a one-time guess from
// hardware (cores, memory) and, where supported, navigator.connection — but
// Safari/iOS exposes no Network Information API at all, so a good iPhone on
// a single bar of LTE gets scored purely on its (fast) CPU and sails through
// as "high tier" with full concurrency, which just floods a genuinely slow
// pipe. Measuring how long frame 0 actually took to arrive catches this
// regardless of platform or static tier, and only ever scales concurrency
// DOWN from the hardware-based ceiling — never up past what the device
// tier already allows, since a weak device shouldn't get more inflight
// requests just because one fetch happened to be fast.
function adaptiveConcurrency(staticCeiling: number, throughputKBps: number): number {
  if (throughputKBps < 80) return Math.min(staticCeiling, 2);   // sub-1Mbps-ish
  if (throughputKBps < 200) return Math.min(staticCeiling, 4);  // slow 3G-ish
  if (throughputKBps < 500) return Math.min(staticCeiling, 8);  // decent 3G/weak 4G
  return staticCeiling;                                          // fast enough — trust the tier
}

type Api = {
  draw: (canvas: HTMLCanvasElement | null, progress: number) => void;
  trim: () => void;
  getLoadedFraction: () => number;
};

export function useFrameSequence(name: string, options?: { canvasFilter?: string; fitMode?: "cover" | "contain"; zoomOut?: number }) {
  const canvasFilter = options?.canvasFilter ?? "none";
  // Same ref pattern as hasUpgradedFramesRef below — draw() is created once
  // inside apiRef.current and never rebuilt, so a plain const would freeze
  // at whatever fitMode HeroCanvas passed on the very first render.
  // HeroCanvas picks 'contain' vs 'cover' from the same post-mount device
  // check that flips frameSet, so this needs to stay live the same way.
  const fitModeRef = useRef(options?.fitMode ?? "cover");
  fitModeRef.current = options?.fitMode ?? "cover";
  // 1 = full cover (current default), <1 = show more of the frame's width
  // by scaling down from cover by this ratio — explicit "zoom out a bit"
  // request. Unavoidable trade-off for a landscape source in a portrait
  // canvas: showing more width means the scaled image no longer exactly
  // fills the canvas height, so a small dark gap appears top/bottom too.
  const zoomOutRef = useRef(options?.zoomOut ?? 1);
  zoomOutRef.current = options?.zoomOut ?? 1;
  // Only the 'hero' frame set has any 1920x1080 frames at all — 'hero-mobile'
  // (and any other future named set) is 720p throughout, so the decode-time
  // downscale in decodeBlob() must never fire for it. See decodeBlob's
  // hasUpgradedFrames param.
  //
  // A REF, not a plain const: HeroCanvas starts `name` at 'hero' on every
  // render (matching the static-exported HTML, avoiding the hydration
  // mismatch documented there) and corrects it to 'hero-mobile' via an
  // effect shortly after mount on phones. But apiRef.current below — which
  // holds the decode() function actually used during scroll — is created
  // ONCE on the first render and never rebuilt. A plain const captured into
  // that one-time closure would freeze at whatever `name` was on that FIRST
  // render (always 'hero'), permanently missing the later correction to
  // 'hero-mobile' for the rest of the session. The ref is re-assigned on
  // every render, so decode() reading `.current` always sees the latest.
  const hasUpgradedFramesRef = useRef(name === "hero");
  hasUpgradedFramesRef.current = name === "hero";
  const blobs        = useRef<(Blob | null)[]>([]);
  const frames       = useRef<Map<number, Frame>>(new Map());
  const decoding     = useRef<Set<number>>(new Set());
  const countRef     = useRef(0);
  const lastProgress = useRef(0);
  const lastCanvas   = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnIdx = useRef<number>(-1);
  const lastTargetIdx= useRef<number>(-1);
  const dirRef       = useRef<1 | -1>(1);
  const [ready, setReady] = useState(false);
  // Highest contiguous frame index fetched from disk/CDN so far. On
  // localhost this races to `count-1` near-instantly; on a real network
  // (production) it climbs gradually. Exposed so the caller can clamp
  // scroll-driven progress to what has actually arrived — without this,
  // a fast scroll on a slow connection outruns the buffer and the canvas
  // reads as "stuck" holding the last available frame indefinitely.
  const loadedUpToRef = useRef(0);
  // Indices that failed to fetch even after retries — tracked separately so
  // advanceLoadedMark can skip past them instead of blocking the whole
  // buffer-loaded fraction on one permanently-dead frame (see fetchWithRetry
  // comment above). Playback falls back to the nearest decoded neighbor for
  // these via nearestDecoded(), so one missing frame is invisible in practice.
  const failedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    let alive = true;

    (async () => {
      const m = await fetch(`frames/${name}/manifest.json`).then((r) => r.json());
      if (!alive) return;
      countRef.current = m.count;
      blobs.current = new Array(m.count).fill(null);
      // Digit width read from the manifest's own pattern token (%03d, %04d,
      // ...) instead of a hardcoded "%03d" literal — a hero re-shoot at a
      // higher frame count (e.g. 60fps → 1000+ frames) needs 4-digit
      // filenames, and the old hardcoded replace silently produced wrong
      // URLs (404s) the moment the count crossed 999.
      const digitMatch = /%0(\d)d/.exec(m.pattern);
      const digits = digitMatch ? Number(digitMatch[1]) : 3;
      const token = `%0${digits}d`;
      const url = (i: number) =>
        m.pattern.replace(token, String(i + 1).padStart(digits, "0"));

      // Advances past both successfully-fetched AND permanently-failed
      // indices — a single dead frame (all retries exhausted) must never
      // block every frame after it from counting toward the loaded fraction,
      // or clampToBuffer freezes scroll progress there for the rest of the
      // session. This was the actual cause of "hero gets stuck" on flaky
      // networks: one bad frame anywhere in the sequence poisoned the count.
      // Defined up front (not inline further down) so both the warm-up batch
      // and the eager/worker loops below can all call it consistently.
      const advanceLoadedMark = () => {
        let i = loadedUpToRef.current + 1;
        while (i < m.count && (blobs.current[i] || failedRef.current.has(i))) i++;
        loadedUpToRef.current = i - 1;
      };

      // Frame 0 first — paint canvas immediately. Extra retries here (3) since
      // this one frame gates first paint entirely; worth waiting out a flaky
      // connection rather than giving up and showing nothing. (Capped so the
      // worst case is ~28s, not 90+ — see MAX_BACKOFF_MS above. The poster
      // <img> fallback covers the entire wait either way.)
      //
      // NOT timed for the bandwidth probe below — a single frame-0 fetch is
      // the WORST possible sample: DNS lookup, TCP handshake, and TLS
      // negotiation all happen inside that one request, plus TCP slow-start
      // means the first request over a fresh connection is inherently far
      // slower than steady-state, even on a genuinely fast line. An earlier
      // version measured exactly this single cold request and used it to
      // throttle concurrency for the whole session — invisible on localhost
      // (loopback has no handshake at all) but on the real deployment it
      // read every connection as artificially slow and throttled a fine
      // connection into visible scroll jank. Fixed by warming up on a small
      // batch (see WARMUP_COUNT below) before ever making that call.
      try {
        const b0 = await fetchWithRetry(url(0), 3);
        if (!alive) return;
        blobs.current[0] = b0;
        const f = await decodeBlob(b0, 0, hasUpgradedFramesRef.current);
        if (!alive) return releaseFrame(f);
        frames.current.set(0, f);
      } catch { failedRef.current.add(0); /* poster <img> fallback covers this */ }
      if (!alive) return;
      setReady(true);

      // Warm-up batch: fetch the next few frames at the FULL static
      // concurrency (no throttling yet — we don't have enough information to
      // throttle correctly) and measure aggregate throughput across all of
      // them together. Averaging over several requests dilutes the one-time
      // connection-setup cost from any single one, giving a realistic
      // steady-state reading instead of a cold-start-biased one.
      const WARMUP_COUNT = Math.min(6, m.count - 1);
      let FETCH_CONCURRENCY = STATIC_FETCH_CONCURRENCY;
      if (WARMUP_COUNT > 0) {
        const warmupStart = performance.now();
        let warmupBytes = 0;
        await Promise.all(
          Array.from({ length: WARMUP_COUNT }, async (_, w) => {
            const i = w + 1; // frames 1..WARMUP_COUNT
            try {
              const b = await fetchWithRetry(url(i), 2);
              if (!alive) return;
              blobs.current[i] = b;
              warmupBytes += b.size;
              advanceLoadedMark();
            } catch {
              if (alive) { failedRef.current.add(i); advanceLoadedMark(); }
            }
          })
        );
        if (!alive) return;
        const elapsedMs = performance.now() - warmupStart;
        const kbps = (warmupBytes / 1024) / Math.max(0.001, elapsedMs / 1000);
        FETCH_CONCURRENCY = adaptiveConcurrency(STATIC_FETCH_CONCURRENCY, kbps);
      }

      // Eagerly fetch AND decode the first 120 frames before the user scrolls.
      // This is the key to smooth scrubbing: the opening stretch of the film
      // is always resident in decoded form so scroll-start never cold-misses.
      //
      // CRITICAL: loadedUpToRef (which gates how far the caller lets scroll
      // progress via getLoadedFraction) must advance PER FRAME as each blob
      // actually arrives -- not once, after the entire eager batch settles.
      // The previous version set loadedUpToRef only after `await
      // Promise.all(...)` for all 120 eager fetches completed. On localhost
      // that Promise.all resolves near-instantly so the bug was invisible;
      // on a real network, the whole batch can take several seconds (worse
      // if even one of the 120 requests is slow), and for that entire
      // window getLoadedFraction() reported ~0 -- clamping scroll to
      // ~frame 10 the whole time. That is precisely the "stuck after 1-2
      // frames" production symptom. Advancing the mark after every single
      // blob fixes it: the buffer fraction now climbs continuously from
      // the first frame onward instead of jumping once at the very end.
      // EAGER_CAP scales down with frameLoaderTuning() on slow/weak devices —
      // eagerly fetching+decoding 120 frames on a throttled connection just
      // means the opening scroll stretch sits half-loaded for far longer.
      // Scaled down further when the frame-0 probe measured a genuinely slow
      // pipe — same reasoning as adaptiveConcurrency: eagerly queuing 90-120
      // frames behind a real 3G connection just means the opening scroll
      // stretch sits half-loaded far longer, on top of the already-reduced
      // static-tier cap.
      const EAGER_STATIC = frameLoaderTuning().EAGER_CAP;
      const EAGER = Math.min(
        FETCH_CONCURRENCY < STATIC_FETCH_CONCURRENCY ? Math.min(EAGER_STATIC, 20) : EAGER_STATIC,
        m.count
      );
      const eagerFetch = async (i: number) => {
        try {
          // Skip re-fetching a blob the warm-up batch already landed —
          // WARMUP_COUNT frames (1..6) are typically already in `blobs` by
          // the time this loop reaches them, since the loop below still
          // walks that same index range.
          let b = blobs.current[i];
          if (!b) {
            b = await fetchWithRetry(url(i), 2);
            if (!alive) return;
            blobs.current[i] = b;
            advanceLoadedMark();
          }
          // Decode immediately while still within eager window
          if (i < EAGER && decoding.current.size < MAX_INFLIGHT && !frames.current.has(i)) {
            decoding.current.add(i);
            decodeBlob(b, i, hasUpgradedFramesRef.current)
              .then((f) => { if (alive) frames.current.set(i, f); else releaseFrame(f); })
              .catch(() => {})
              .finally(() => decoding.current.delete(i));
          }
        } catch {
          if (alive) { failedRef.current.add(i); advanceLoadedMark(); }
        }
      };
      // Fetch+decode first 120 frames with full concurrency
      await Promise.all(Array.from({ length: Math.min(FETCH_CONCURRENCY, EAGER) }, async (_, w) => {
        let i = 1 + w;
        while (alive && i < EAGER) {
          await eagerFetch(i);
          i += FETCH_CONCURRENCY;
        }
      }));

      // Then fetch remaining blobs in order (no decode — decode window handles that).
      let next = EAGER;
      const worker = async () => {
        while (alive) {
          const i = next++;
          if (i >= m.count) return;
          try {
            const b = await fetchWithRetry(url(i), 2);
            if (!alive) return;
            blobs.current[i] = b;
            advanceLoadedMark();
          } catch {
            if (alive) { failedRef.current.add(i); advanceLoadedMark(); }
          }
        }
      };
      await Promise.all(Array.from({ length: FETCH_CONCURRENCY }, () => worker()));
    })();

    return () => {
      alive = false;
      frames.current.forEach(releaseFrame);
      frames.current.clear();
      decoding.current.clear();
      blobs.current = [];
    };
  }, [name]);

  const apiRef = useRef<Api | null>(null);
  if (!apiRef.current) {
    function decode(i: number) {
      if (i < 0 || i >= countRef.current) return;
      if (frames.current.has(i) || decoding.current.has(i)) return;
      if (!blobs.current[i]) return;
      if (decoding.current.size >= MAX_INFLIGHT) return;
      decoding.current.add(i);
      decodeBlob(blobs.current[i]!, i, hasUpgradedFramesRef.current)
        .then((f) => {
          if (!blobs.current.length) return releaseFrame(f);
          frames.current.set(i, f);
          if (countRef.current > 0) {
            const target = Math.round(
              Math.min(1, Math.max(0, lastProgress.current)) * (countRef.current - 1)
            );
            if (target === i && lastCanvas.current) {
              draw(lastCanvas.current, lastProgress.current);
            }
          }
        })
        .catch(() => {})
        .finally(() => decoding.current.delete(i));
    }

    function manageWindow(center: number) {
      decode(center);
      const dir = dirRef.current;
      for (let d = 1; d <= AHEAD; d++) {
        if (decoding.current.size >= MAX_INFLIGHT) break;
        decode(center + dir * d);
        if (d <= BEHIND) decode(center - dir * d);
      }
      if (frames.current.size > EVICT_AT) {
        for (const [idx, f] of frames.current) {
          if (Math.abs(idx - center) > KEEP) {
            releaseFrame(f);
            frames.current.delete(idx);
          }
        }
      }
    }

    function nearestDecoded(i: number): Frame | null {
      if (frames.current.has(i)) return frames.current.get(i)!;
      const back = dirRef.current >= 0 ? -1 : 1;
      const JUMP_CAP = 12;
      for (let d = 1; d <= JUMP_CAP; d++) {
        const j = i + back * d;
        if (j < 0 || j >= countRef.current) break;
        if (frames.current.has(j)) return frames.current.get(j)!;
      }
      if (lastDrawnIdx.current >= 0 && frames.current.has(lastDrawnIdx.current)) {
        return frames.current.get(lastDrawnIdx.current)!;
      }
      for (let d = 1; d < countRef.current; d++) {
        if (frames.current.has(i - d)) return frames.current.get(i - d)!;
        if (frames.current.has(i + d)) return frames.current.get(i + d)!;
      }
      return null;
    }

    function draw(canvas: HTMLCanvasElement | null, progress: number) {
      if (!canvas || countRef.current === 0) return;
      lastProgress.current = progress;
      lastCanvas.current = canvas;
      const i = Math.round(
        Math.min(1, Math.max(0, progress)) * (countRef.current - 1)
      );
      if (lastTargetIdx.current >= 0) {
        if (i > lastTargetIdx.current) dirRef.current = 1;
        else if (i < lastTargetIdx.current) dirRef.current = -1;
      }
      lastTargetIdx.current = i;
      manageWindow(i);
      const frame = nearestDecoded(i);
      if (!frame) return;
      lastDrawnIdx.current = i;
      const src = frame.img;
      // Pixel-BUDGETED dpr, not a flat cap: a flat "min(devicePixelRatio, 2)"
      // looks sharp on a normal-sized window but means a full-screen
      // 1920x1080+ viewport on a Retina/4K-scaled display redraws a
      // 3840x2160+ canvas every scroll tick — that's what caused real FPS
      // drops specifically in full-screen. budgetedDpr targets a total
      // canvas-megapixel ceiling instead, so it stays at full DPR sharpness
      // on a normal window and automatically backs off only once the
      // viewport itself gets big enough to blow the pixel budget.
      const dpr = budgetedDpr(canvas.clientWidth, canvas.clientHeight);
      const cw = Math.round(canvas.clientWidth * dpr);
      const ch = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // High-quality resampling: without this the browser's default
      // bilinear scale of the source frame up to canvas resolution reads
      // soft/blurry, undermining the "high resolution" feel entirely.
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      // REVERTED: an earlier version baked the grade into this draw call via
      // Canvas 2D `ctx.filter` instead of a CSS filter on the <canvas>
      // element, to remove a per-scroll-tick compositing pass that was
      // causing jank on a real full-size desktop browser window. That traded
      // a desktop smoothness problem for a much worse one: Canvas 2D
      // `ctx.filter` has a long history of falling back to slow, unoptimized
      // (sometimes software) rendering specifically on mobile Safari/iOS —
      // reported live as the hero going completely frozen on a real phone,
      // right after that change shipped. A frozen hero on mobile is a far
      // worse outcome than imperfect desktop scroll smoothness, so this
      // reverts to the CSS-filter approach (see the <canvas> element's style
      // in HeroCanvas.tsx), which is reliably GPU-accelerated on every
      // platform including mobile. `canvasFilter` is intentionally unused
      // here now; kept as a no-op passthrough rather than removing the
      // option entirely, in case a properly platform-gated version (desktop
      // only, verified against a real device rather than an emulated one)
      // is worth revisiting later.
      void canvasFilter;
      // Opaque ink fill, NOT clearRect. A poster <img> (frame_0001.webp,
      // browser object-cover) sits behind this canvas as an instant-paint
      // fallback, and clearRect would leave the canvas transparent wherever
      // it hasn't drawn the frame, letting the poster bleed through there.
      // Painting solid ink first makes the canvas fully opaque the instant it
      // has any frame to draw, hiding the poster completely.
      ctx.fillStyle = "#060606";
      ctx.fillRect(0, 0, cw, ch);
      // Fit mode: 'cover' (default, desktop) fills the entire canvas,
      // cropping whatever doesn't fit — sharper-reading but throws away
      // most of the frame's width on a tall phone screen. 'contain'
      // (mobile, by explicit request) scales to show the ENTIRE frame with
      // no cropping at all, top/bottom or left/right; since this footage is
      // landscape (16:9) and the canvas is portrait, the limiting dimension
      // is width, so the letterbox bars land above/below the image, not on
      // the sides — a consequence of the source's own aspect ratio, not a
      // choice made here. The '#060606' fill above already paints those
      // bars solid ink, matching the requested black margins for free.
      const isContain = fitModeRef.current === "contain";
      // zoomOut < 1 scales down from full cover by that ratio — explicit
      // "zoom out a bit" request, shows more of each frame's width at the
      // cost of a small top/bottom gap (see zoomOutRef declaration above).
      const zoomOut = zoomOutRef.current;
      const s = isContain
        ? Math.min(cw / src.width, ch / src.height)
        : Math.max(cw / src.width, ch / src.height) * zoomOut;
      // frameAnchor's per-segment values pick which part of an OVERSIZED
      // (cover-cropped) frame to keep — meaningless once contain-fit (or a
      // zoomed-out cover) leaves vertical slack, where centering (0.5) is
      // simply correct instead.
      const { anchorX, anchorY: segAnchorY } = isContain ? { anchorX: 0.5, anchorY: 0.5 } : frameAnchor(i, countRef.current);
      const anchorY = (!isContain && zoomOut < 1) ? 0.5 : segAnchorY;
      const w = src.width * s;
      const h = src.height * s;
      ctx.drawImage(src, (cw - w) * anchorX, (ch - h) * anchorY, w, h);
    }

    function trim() {
      const center = lastDrawnIdx.current;
      for (const [idx, f] of frames.current) {
        if (center < 0 || Math.abs(idx - center) > 8) {
          releaseFrame(f);
          frames.current.delete(idx);
        }
      }
    }

    // getLoadedFraction: 0..1, how much of the film is safely scrubbable
    // right now (contiguous from the start). The caller clamps display
    // progress to this so a fast scroll on a slow connection catches up
    // gracefully instead of freezing on the last available frame with no
    // visible explanation. Defined here (not at hook-body scope) so it
    // shares apiRef's stable identity across renders — a fresh closure
    // every render would thrash any effect that depends on it.
    function getLoadedFraction() {
      return countRef.current > 0
        ? Math.min(1, (loadedUpToRef.current + 1) / countRef.current)
        : 0;
    }

    apiRef.current = { draw, trim, getLoadedFraction };
  }

  return {
    ready,
    draw: apiRef.current.draw,
    trim: apiRef.current.trim,
    lastProgress,
    getLoadedFraction: apiRef.current.getLoadedFraction,
  };
}
