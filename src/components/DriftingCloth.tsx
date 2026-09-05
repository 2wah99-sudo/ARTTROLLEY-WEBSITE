'use client'

/**
 * DriftingCloth — the "fish tank" layer for the ambient background.
 *
 * The ask: a background that stays visually alive and constant while the
 * page scrolls past it — like looking into an aquarium, the water (here,
 * the Auralis flow) never stops moving and the fish (here, drifting bolts
 * of hand-block-printed cloth) keep swimming regardless of where you are
 * in the tank. Because this sits inside AmbientBackground's `sticky`
 * layer, it is pinned to the viewport for the ENTIRE Manifesto→Footer
 * scroll — these ribbons are always the same distance from your eye, only
 * ever drifting on their own loop, never tied to scroll position at all.
 *
 * Each ribbon is a single soft flowing SVG path styled as a length of
 * printed fabric (a faint repeating diamond motif traces its spine, the
 * same block-print language as the rest of the brand) that glides on a
 * slow Lissajous-style drift + gentle rotation, screen-blended so it only
 * ever adds light. Pure CSS animation — GPU-composited, no rAF loop.
 */

const RIBBONS = [
  { top: '10%', left: '-8%',  width: 480, rotate: -12, animClass: 'cloth-drift-1', alpha: 0.30, delay: '0s' },
  { top: '55%', left: '62%',  width: 400, rotate: 18,  animClass: 'cloth-drift-2', alpha: 0.24, delay: '-9s' },
  { top: '32%', left: '34%',  width: 540, rotate: -6,  animClass: 'cloth-drift-3', alpha: 0.20, delay: '-17s' },
  { top: '76%', left: '2%',   width: 360, rotate: 24,  animClass: 'cloth-drift-4', alpha: 0.26, delay: '-24s' },
]

function ClothRibbon({ width, alpha }: { width: number; alpha: number }) {
  // A single thin, trailing bolt-of-fabric silhouette — an open ribbon
  // (stroke, not a filled blob) so it reads as cloth caught mid-drift
  // rather than a solid wave shape. A faint dashed line traces its spine
  // as the block-print stitching detail.
  const gold = `rgba(201,168,76,${alpha})`
  const goldFaint = `rgba(201,168,76,${alpha * 0.5})`
  return (
    <svg viewBox="0 0 400 90" width={width} aria-hidden="true">
      <path
        d="M0 45 C 50 20, 90 70, 140 42 S 230 15, 280 44 S 360 68, 400 45"
        stroke={gold}
        strokeWidth="26"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M0 45 C 50 20, 90 70, 140 42 S 230 15, 280 44 S 360 68, 400 45"
        stroke={goldFaint}
        strokeWidth="1"
        strokeDasharray="1 9"
        fill="none"
      />
    </svg>
  )
}

export default function DriftingCloth() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
      {RIBBONS.map((r, i) => (
        <div
          key={i}
          className={`absolute ${r.animClass}`}
          style={{
            top: r.top,
            left: r.left,
            transform: `rotate(${r.rotate}deg)`,
            animationDelay: r.delay,
            mixBlendMode: 'screen',
          }}
        >
          <ClothRibbon width={r.width} alpha={r.alpha} />
        </div>
      ))}
    </div>
  )
}
