"use client";

import { ReactNode, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// Throttle ScrollTrigger's internal scroll-check loop — per gsap-scrolltrigger
// skill: limitCallbacks prevents redundant onUpdate calls within the same
// animation frame; syncInterval:15 caps the internal sync to ~67 checks/sec
// instead of every native scroll event, dramatically reducing draw() call
// frequency without any perceptible loss of responsiveness.
ScrollTrigger.config({ limitCallbacks: true, syncInterval: 15 });

/**
 * Lenis smooth scroll wired into GSAP's ticker so ScrollTrigger and Lenis
 * share one clock — the standard recipe for buttery scrub animations.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // lerp: 0.12 — time constant ~7 frames (115ms) instead of 11 frames.
    // Enough smoothing for the premium feel, fast enough that a quick fling
    // actually reaches the target rather than stalling mid-film.
    // wheelMultiplier raised slightly so a hard scroll covers more ground.
    // lerp: 0.065 — the igloo-tier silk. Half the previous 0.12 value.
    // At 0.12 the scroll felt responsive but had a mechanical stop; at 0.065
    // each wheel tick glides to rest over ~15 frames rather than ~7,
    // which is exactly the "liquid" quality that premium portfolios feel like.
    // wheelMultiplier 0.85 slightly slows raw distance so the extra glide
    // time doesn't overshoot on a single fast flick.
    // lerp: 0.050 — rideradian-tier silk. Each wheel tick glides to rest
    // over ~20 frames (~320ms), giving the physical weight that makes
    // premium automotive/luxury portfolio sites feel like they move through oil.
    // 0.068 — halfway between the previous 0.09 (responsive but light) and
    // the 0.065 "liquid" sweet spot. Gives each wheel tick a ~14-frame
    // glide to rest (~225ms at 60Hz) — the "weight" the user asked for —
    // without tipping into the 0.050 territory that previously read as
    // genuinely laggy rather than heavy. wheelMultiplier 0.90 shaves a
    // little raw distance so the extra glide time doesn't overshoot on a
    // single hard flick.
    const lenis = new Lenis({ lerp: 0.062, smoothWheel: true, wheelMultiplier: 0.88 });

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Redundant safety net: ScrollTrigger.update() was wired only to
    // Lenis's own "scroll" event. If that event has any gap (a missed
    // emission, a virtual-scroll desync, anything that moves window.scrollY
    // without Lenis's own path firing) ScrollTrigger never hears about it
    // and every pinned canvas — hero, atelier — freezes on its last frame
    // while the page keeps visibly scrolling underneath. A native `scroll`
    // listener fires unconditionally whenever scrollY actually changes,
    // from any source, so this closes that gap without touching Lenis's
    // own smoothing behavior at all.
    const onNativeScroll = () => ScrollTrigger.update();
    window.addEventListener("scroll", onNativeScroll, { passive: true });

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
      window.removeEventListener("scroll", onNativeScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
