/**
 * A shared atmospheric background layer for sections that follow the two
 * scrubbed films — without it, the cut from cinematic footage to a flat
 * `bg-ink` reads as abrupt. This carries a little of the films' mood
 * forward: a soft top-anchored glow (echoing the warm practical lighting
 * in the atelier corridor), a faint film-grain texture for continuity
 * with the footage grain, and — optionally — a very low-opacity blurred
 * craft-texture photo for depth. Purely decorative, aria-hidden, and
 * absolutely positioned so it never affects layout or interaction.
 */
export default function SectionAtmosphere({
  image,
  glow = 'gold',
}: {
  image?: string
  glow?: 'gold' | 'clay'
}) {
  const glowColor = glow === 'clay' ? '181,98,42' : '201,168,76'

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.07] scale-110"
          style={{ filter: 'blur(6px) saturate(0.7)' }}
        />
      )}

      {/* Top-anchored radial glow — a quiet echo of the films' practical light */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 1100px 700px at 50% -5%, rgba(${glowColor},0.09), transparent 62%)`,
        }}
      />

      {/* Bottom vignette for depth, matching the films' edge framing */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, transparent 75%, rgba(6,6,6,0.5) 100%)',
        }}
      />

      {/* Film grain — continuity with the scrubbed footage's own grain */}
      <div
        className="absolute inset-0 opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '160px 160px',
        }}
      />
    </div>
  )
}
