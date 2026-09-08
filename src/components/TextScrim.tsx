'use client'

/**
 * TextScrim — a soft, local dark vignette sized to sit behind one text
 * block, not a whole section. Every section from Manifesto through the
 * Footer shares one continuously-playing fabric-print video as its
 * background (AmbientBackground.tsx), kept at full original vibrancy per
 * explicit direction — so darkening the whole background is off the table.
 * This is the alternative: engineer contrast locally, right where text
 * actually sits, fading to fully transparent at the edges so it reads as
 * depth/shadow rather than a visible panel. Drop it as the FIRST child of
 * a `position: relative` (or `relative z-[n]`) wrapper around any text
 * block that needs to survive sitting on that background.
 *
 * `inset` controls how far the vignette extends past the text's own
 * bounding box (more room = softer falloff); `strength` is the darkest
 * point's opacity (0–1).
 */
export default function TextScrim({
  inset = '-inset-x-6 -inset-y-8 md:-inset-x-12 md:-inset-y-12',
  strength = 0.68,
  className = '',
}: {
  inset?: string
  strength?: number
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute -z-10 pointer-events-none ${inset} ${className}`}
      style={{
        background: `radial-gradient(ellipse 95% 90% at 50% 50%, rgba(6,6,6,${strength}) 0%, rgba(6,6,6,${strength * 0.6}) 45%, transparent 75%)`,
      }}
    />
  )
}
