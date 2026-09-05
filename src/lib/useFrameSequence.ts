"use client";

import { useEffect, useRef, useState } from "react";

/** A decoded frame is either an ImageBitmap (fast path) or an <img> fallback. */
type Frame =
  | { kind: "bitmap"; img: ImageBitmap }
  | { kind: "element"; img: HTMLImageElement; url: string };

async function decodeBlob(blob: Blob): Promise<Frame> {
  try {
    const img = await createImageBitmap(blob);
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

// ─── Tuning ──────────────────────────────────────────────────────────────────
// A decoded frame costs width*height*4 bytes as an ImageBitmap — ~3.5 MB at
// this film's PREVIOUS resolution, versus ~25 KB for its compressed WebP
// blob. That 140x ratio is the whole reason these numbers look conservative:
// holding blobs is nearly free, holding decoded bitmaps is not.
//
// The previous design ran a background sweep that decoded EVERY frame so a
// fast scroll would always land on something ready. At 3.5 MB/frame that is
// ~1.9 GB for the hero alone against a ~2.1 GB heap ceiling — and both films
// are mounted at once. The cache ballooned until eviction fought it every
// frame, and the resulting memory pressure slowed the very decodes it was
// trying to get ahead of. That is what read as "sticking" at high speed.
//
// The replacement: keep every blob (cheap), decode only a tight window around
// the playhead, and bias that window toward the direction of travel — frames
// behind you during a fast forward fling are wasted decode slots competing
// for the queue.
//
// Both films moved from 1600×900 to 2560×1440 frames (5.49 MB → 14.06 MB per
// decoded bitmap, a 2.56x jump) to fix visible upscale blur. Every constant
// below that bounds RESIDENT decoded frames (KEEP, EVICT_AT, AHEAD, BEHIND)
// is scaled down by that same 2.56x so the peak decoded working set — and so
// the "never stuck, never wrong-jump" scrub feel — lands back where it was
// before the resolution bump, not 2.56x heavier. MAX_INFLIGHT is trimmed too,
// since each in-flight decode is now costlier CPU work, not just memory.
//
// Hero briefly moved to a true native 1920×1080 render, then back to
// 2560×1440 by request — both films are back to being equally heavy
// (14.06 MB/decoded-frame) as of this comment, so there's no "heavier of
// the two" asymmetry to size around anymore; both get the same budget below.
//
// A subsequent attempt to loosen KEEP/EVICT_AT/AHEAD/BEHIND/MAX_INFLIGHT
// (to trade more resident memory for a deeper decode lookahead) measured as
// an improvement in this dev environment's own automated scroll-timing
// probe, but the user reported it felt LESS smooth on their real device —
// that probe's timing characteristics evidently don't transfer to actual
// hardware here, so the looser numbers were reverted back to these tighter
// ones without re-attempting that trade. If decode-catch-up lag comes up
// again, the fix belongs on the asset side (smaller/faster-to-decode
// frames) rather than further tuning this window blind.
// Production tuning pass: the 16/55/55/120/145 window above traded memory
// for lookahead depth, but a wider decode window means more competition for
// the one decode that's actually on screen — tightened back down so the
// currently-visible frame always wins the queue instead of waiting behind
// dozens of frames the viewer hasn't reached yet.
const MAX_INFLIGHT = 8; // concurrent decodes
const AHEAD  = 30; // frames pre-decoded ahead of the playhead
const BEHIND = 20; // frames held behind the playhead (for backward scrub)
const KEEP   = 60; // resident decoded window
const EVICT_AT = 75; // sweep only when the map grows past this
const FETCH_CONCURRENCY = 8; // in-order blob fetches (network, not memory)

type Api = {
  draw: (canvas: HTMLCanvasElement | null, progress: number) => void;
  trim: () => void;
};

/**
 * Loads a WebP frame sequence and exposes a draw(canvas, progress) scrubber.
 *
 * Anti-jump strategy:
 *   1. Blobs are fetched in index order with bounded concurrency, so the
 *      frames a viewer reaches first are the ones that arrive first. Frame 0
 *      is fetched and decoded before anything else and flips `ready`, so the
 *      canvas paints immediately instead of staying blank until the whole
 *      film has downloaded.
 *   2. A direction-aware decode window keeps frames ready ahead of the
 *      playhead, with a short tail behind for reversals.
 *   3. Decode concurrency is capped. Past a certain depth a queue only adds
 *      latency to the one frame actually on screen.
 *   4. nearestDecoded falls back to a frame slightly BEHIND the playhead
 *      (relative to travel direction — one already shown), capped at
 *      JUMP_CAP, then holds the last drawn frame. The canvas may sit still
 *      for a tick under an extreme fling; it never jumps to the wrong scene.
 *   5. The lastDrawn frame is repainted when a fresh decode lands on the
 *      current target.
 */
export function useFrameSequence(name: string) {
  const blobs = useRef<(Blob | null)[]>([]);
  const frames = useRef<Map<number, Frame>>(new Map());
  const decoding = useRef<Set<number>>(new Set());
  const countRef = useRef(0);
  const lastProgress = useRef(0);
  const lastCanvas = useRef<HTMLCanvasElement | null>(null);
  // The last frame index we successfully rendered — used as the no-jump
  // fallback when the exact target isn't decoded yet.
  const lastDrawnIdx = useRef<number>(-1);
  // The last index we *aimed* at, whether or not it was ready. Direction is
  // derived from this rather than lastDrawnIdx, which stalls during a miss
  // and would otherwise report the wrong travel direction.
  const lastTargetIdx = useRef<number>(-1);
  const dirRef = useRef<1 | -1>(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      const m = await fetch(`frames/${name}/manifest.json`).then((r) => r.json());
      if (!alive) return;
      countRef.current = m.count;
      blobs.current = new Array(m.count).fill(null);
      const url = (i: number) =>
        m.pattern.replace("%03d", String(i + 1).padStart(3, "0"));

      // Frame 0 first, on its own, so the canvas has something to paint as
      // early as possible rather than waiting on the full sequence.
      try {
        const b0 = await fetch(url(0)).then((r) => r.blob());
        if (!alive) return;
        blobs.current[0] = b0;
        const f = await decodeBlob(b0);
        if (!alive) return releaseFrame(f);
        frames.current.set(0, f);
      } catch {
        /* the draw loop will retry via the decode window */
      }
      if (!alive) return;
      setReady(true);

      // Remaining blobs, in order, bounded concurrency. In-order matters:
      // it means a viewer scrolling normally is always chasing blobs that
      // have already landed, instead of a random scatter across the film.
      let next = 1;
      const worker = async () => {
        while (alive) {
          const i = next++;
          if (i >= m.count) return;
          try {
            const b = await fetch(url(i)).then((r) => r.blob());
            if (!alive) return;
            blobs.current[i] = b;
          } catch {
            /* a missed blob simply stays undecodable; the film holds instead */
          }
        }
      };
      await Promise.all(
        Array.from({ length: FETCH_CONCURRENCY }, () => worker())
      );
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
      // Hard concurrency cap. Queueing more decodes than the browser can
      // service does not make them finish sooner; it delays the one frame
      // that is actually on screen behind work for frames already scrolled past.
      if (decoding.current.size >= MAX_INFLIGHT) return;
      decoding.current.add(i);
      decodeBlob(blobs.current[i]!)
        .then((f) => {
          if (!blobs.current.length) return releaseFrame(f); // unmounted
          frames.current.set(i, f);
          // If this frame is exactly where the playhead is sitting right now
          // (user stopped scrolling while decode was in flight), repaint so
          // we don't stay on the fallback frame.
          if (countRef.current > 0) {
            const target = Math.round(
              Math.min(1, Math.max(0, lastProgress.current)) *
                (countRef.current - 1)
            );
            if (target === i && lastCanvas.current) {
              draw(lastCanvas.current, lastProgress.current);
            }
          }
        })
        .catch(() => {})
        .finally(() => decoding.current.delete(i));
    }

    /**
     * Pre-decode a window around the playhead, biased toward travel direction.
     *
     * The bias is the point: during a fast forward fling, every decode slot
     * spent on a frame behind the playhead is a slot not spent on one the
     * viewer is about to reach.
     */
    function manageWindow(center: number) {
      // The exact frame first — it is the only one that can be drawn now.
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

    /**
     * Return the best available frame for index i.
     *
     * Priority:
     *   1. Exact frame i — perfect, use it.
     *   2. A frame within JUMP_CAP *behind* the playhead in travel terms —
     *      one already shown, so being a few ms stale is invisible.
     *   3. lastDrawnIdx — the canvas holds still for one tick.
     *      NEVER jump ahead or far back: that's the visible "jump".
     */
    function nearestDecoded(i: number): Frame | null {
      if (frames.current.has(i)) return frames.current.get(i)!;

      // Step against the direction of travel: those are frames the viewer has
      // already seen. Searching *with* travel risks showing a frame from a
      // scene they have not reached yet.
      const back = dirRef.current >= 0 ? -1 : 1;
      const JUMP_CAP = 12;
      for (let d = 1; d <= JUMP_CAP; d++) {
        const j = i + back * d;
        if (j < 0 || j >= countRef.current) break;
        if (frames.current.has(j)) return frames.current.get(j)!;
      }

      // Hold the last rendered frame — freeze rather than jump.
      if (lastDrawnIdx.current >= 0 && frames.current.has(lastDrawnIdx.current)) {
        return frames.current.get(lastDrawnIdx.current)!;
      }

      // Last resort: scan any direction (only reached on the very first draw
      // before anything is decoded, or after a cold cache miss).
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

      // Travel direction, from the target rather than what actually rendered
      // (which stalls on a miss and would misreport direction).
      if (lastTargetIdx.current >= 0) {
        if (i > lastTargetIdx.current) dirRef.current = 1;
        else if (i < lastTargetIdx.current) dirRef.current = -1;
      }
      lastTargetIdx.current = i;

      manageWindow(i);
      const frame = nearestDecoded(i);
      if (!frame) return;

      // Record what we actually drew so we can hold it on the next miss.
      lastDrawnIdx.current = i;

      const src = frame.img;
      // Capped at 1.5 (was 2) — full retina density buys little visible
      // sharpness on a scroll-scrubbed film but scales draw cost quadratically.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const cw = Math.round(canvas.clientWidth * dpr);
      const ch = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, cw, ch);
      // No per-frame color filter (CSS or ctx.filter) — both were tried and
      // both cost real time on a canvas redrawn continuously during scroll,
      // which is what read as stuttering/skipping. The footage keeps its
      // own native colour as shot; grade it in the source asset if a look
      // is wanted, not live in the draw loop.
      const s = Math.max(cw / src.width, ch / src.height);
      const w = src.width * s;
      const h = src.height * s;
      // Cover-fit crops evenly top/bottom by default (anchor 0.5), which on
      // tall/narrow viewports cuts into the model's eyes and hair — the
      // subject sits in the upper half of the source frame, not dead
      // centre. Anchoring closer to the top keeps her whole head in frame;
      // horizontal stays centred since the crop there is symmetric on the
      // subject.
      const anchorY = 0.18;
      ctx.drawImage(src, (cw - w) / 2, (ch - h) * anchorY, w, h);
    }

    /**
     * Drop this film's decoded frames down to a handful around the playhead,
     * keeping every blob. Called when a film scrolls out of view: both films
     * are mounted for the whole page, and a dormant one holding a full window
     * of ~3.5 MB bitmaps is memory the visible film's decoder wants back.
     * Re-entry re-decodes from the retained blobs, which is cheap.
     */
    function trim() {
      const center = lastDrawnIdx.current;
      for (const [idx, f] of frames.current) {
        if (center < 0 || Math.abs(idx - center) > 8) {
          releaseFrame(f);
          frames.current.delete(idx);
        }
      }
    }

    apiRef.current = { draw, trim };
  }

  return {
    ready,
    draw: apiRef.current.draw,
    trim: apiRef.current.trim,
    lastProgress,
  };
}
