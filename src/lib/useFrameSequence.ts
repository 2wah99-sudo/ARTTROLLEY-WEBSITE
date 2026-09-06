"use client";

import { useEffect, useRef, useState } from "react";

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

// ─── Tuning ───────────────────────────────────────────────────────────────────
// AHEAD=80 keeps ~2.7s of 30fps film pre-decoded ahead of the playhead —
// hard to outrun even on a fast scroll. KEEP=120 holds 4s of decoded frames
// resident so backward scrub never cold-misses. FETCH_CONCURRENCY=16 fills
// the blob buffer as fast as the network allows on page load.
const MAX_INFLIGHT      = 14;
const AHEAD             = 80;
const BEHIND            = 20;
const KEEP              = 120;
const EVICT_AT          = 150;
const FETCH_CONCURRENCY = 16;

type Api = {
  draw: (canvas: HTMLCanvasElement | null, progress: number) => void;
  trim: () => void;
  getLoadedFraction: () => number;
};

export function useFrameSequence(name: string) {
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

  useEffect(() => {
    let alive = true;

    (async () => {
      const m = await fetch(`frames/${name}/manifest.json`).then((r) => r.json());
      if (!alive) return;
      countRef.current = m.count;
      blobs.current = new Array(m.count).fill(null);
      const url = (i: number) =>
        m.pattern.replace("%03d", String(i + 1).padStart(3, "0"));

      // Frame 0 first — paint canvas immediately.
      try {
        const b0 = await fetch(url(0)).then((r) => r.blob());
        if (!alive) return;
        blobs.current[0] = b0;
        const f = await decodeBlob(b0);
        if (!alive) return releaseFrame(f);
        frames.current.set(0, f);
      } catch { /* draw loop retries */ }
      if (!alive) return;
      setReady(true);

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
      const EAGER = Math.min(120, m.count);
      const advanceLoadedMark = () => {
        let i = loadedUpToRef.current + 1;
        while (i < m.count && blobs.current[i]) i++;
        loadedUpToRef.current = i - 1;
      };
      const eagerFetch = async (i: number) => {
        try {
          const b = await fetch(url(i)).then((r) => r.blob());
          if (!alive) return;
          blobs.current[i] = b;
          advanceLoadedMark();
          // Decode immediately while still within eager window
          if (i < EAGER && decoding.current.size < MAX_INFLIGHT && !frames.current.has(i)) {
            decoding.current.add(i);
            decodeBlob(b)
              .then((f) => { if (alive) frames.current.set(i, f); else releaseFrame(f); })
              .catch(() => {})
              .finally(() => decoding.current.delete(i));
          }
        } catch { /* stays null */ }
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
            const b = await fetch(url(i)).then((r) => r.blob());
            if (!alive) return;
            blobs.current[i] = b;
            advanceLoadedMark();
          } catch { /* stays null; film holds on miss */ }
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
      decodeBlob(blobs.current[i]!)
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
      const s = Math.max(cw / src.width, ch / src.height);
      const w = src.width * s;
      const h = src.height * s;
      const anchorY = 0.18;
      ctx.drawImage(src, (cw - w) / 2, (ch - h) * anchorY, w, h);
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
