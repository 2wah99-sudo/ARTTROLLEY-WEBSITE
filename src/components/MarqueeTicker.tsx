'use client'

/**
 * MarqueeTicker — a full-width continuously scrolling text strip.
 *
 * Seen on ERA Residence, Rideradian, and every award-tier luxury site as a
 * section separator.  Duplicates the word list twice so the loop is seamless.
 * Pure CSS animation — no JS, no rAF, nothing to pause or jank.
 */

const DEFAULT_WORDS = [
  'Handblock Printed',
  'Natural Dyes',
  'Bagru Heritage',
  'Artisan Craft',
  'Limited Edition',
  'Slow Fashion',
  'Rajasthan',
  'Heritage Textile',
]

interface MarqueeTickerProps {
  words?: string[]
  /** Speed: px/s of the rightward drift.  Lower = slower. Default 55. */
  speed?: number
  /** Thin gold rule on top, bottom, or both.  Default: both */
  rules?: 'top' | 'bottom' | 'both' | 'none'
  className?: string
  /** Reverse direction */
  reverse?: boolean
}

export default function MarqueeTicker({
  words    = DEFAULT_WORDS,
  speed    = 55,
  rules    = 'both',
  className = '',
  reverse   = false,
}: MarqueeTickerProps) {
  // Repeat enough times that at any screen width the strip is always full
  const repeated = [...words, ...words, ...words, ...words]

  // Each word + separator is roughly 22ch wide; calculate one full cycle's
  // pixel width so the animation duration is speed-correct regardless of
  // word count.  22ch ≈ 220px at 10px base; 4 sets cancel out any remainder.
  const singleSetPx = words.length * 260   // conservative estimate
  const duration    = singleSetPx / speed  // seconds for one full cycle

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Top rule */}
      {(rules === 'top' || rules === 'both') && (
        <div className="absolute top-0 left-0 right-0 h-px bg-parchment/12" />
      )}

      <div
        className="flex whitespace-nowrap py-4"
        style={{
          // Inline keyframe via style tag below; the div itself just clips
        }}
      >
        <div
          className="flex items-center gap-0 shrink-0"
          style={{
            animation: `marquee-ticker ${duration}s linear infinite${reverse ? ' reverse' : ''}`,
            willChange: 'transform',
          }}
        >
          {repeated.map((word, i) => (
            <span key={i} className="flex items-center">
              <span
                className="label text-parchment/28 uppercase"
                style={{ letterSpacing: '0.22em', fontSize: '0.65rem' }}
              >
                {word}
              </span>
              {/* Gold diamond separator */}
              <span
                className="mx-10 text-gold/40"
                style={{ fontSize: '0.4rem' }}
              >
                ◆
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Bottom rule */}
      {(rules === 'bottom' || rules === 'both') && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-parchment/12" />
      )}

      {/* Keyframe injected once via a style element */}
      <style>{`
        @keyframes marquee-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-${singleSetPx}px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-ticker-inner { animation-play-state: paused !important; }
        }
      `}</style>
    </div>
  )
}
