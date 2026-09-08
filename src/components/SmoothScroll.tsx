"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Site-wide smooth scroll, via the scroll-site-generator skill's Lenis
 * recipe — reinstated per explicit request after an earlier session removed
 * it (native scroll had felt right at the time; the brief has since
 * changed). Lenis now drives GSAP's ticker directly so ScrollTrigger reads
 * its virtualized/lerp'd position instead of raw window scroll — this is
 * also why HeroCanvas.tsx's own ScrollTrigger went back to a plain
 * `scrub: true`: the "weight" now comes from Lenis's lerp once, here, not
 * stacked on top of a second GSAP-side scrub smoothing.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Throttle ScrollTrigger's internal scroll-check loop — per
    // gsap-scrolltrigger skill: limitCallbacks prevents redundant onUpdate
    // calls within the same animation frame; syncInterval:15 caps the
    // internal sync to ~67 checks/sec instead of every native scroll event.
    ScrollTrigger.config({ limitCallbacks: true, syncInterval: 15 });

    let lenis: Lenis | undefined;
    let rafCallback: ((time: number) => void) | undefined;

    if (!reduceMotion) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      lenis.on("scroll", ScrollTrigger.update);

      rafCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(rafCallback);
      gsap.ticker.lagSmoothing(0);
    }

    // ScrollTrigger caches each trigger's pixel start/end once at creation.
    // Fonts and images finishing to load after that point can shift layout
    // (a font swap alone can move every section below it), leaving those
    // cached boundaries stale — the visible symptom is exactly "scrolled
    // all the way, but the pinned film never reaches its last frame,"
    // because the real end-of-section pixel moved and the trigger's cached
    // end didn't. Refreshing once everything has actually settled (window
    // load, plus a short delay for any late webfont swap) re-measures
    // every trigger against final layout.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
    fontsReady?.then(refresh);
    const settleTimer = window.setTimeout(refresh, 1200);

    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(settleTimer);
      if (rafCallback) gsap.ticker.remove(rafCallback);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
