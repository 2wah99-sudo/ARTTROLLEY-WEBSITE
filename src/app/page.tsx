import Nav            from '@/components/Nav'
import ScrollCounter  from '@/components/ScrollCounter'
import HeroCanvas     from '@/components/HeroCanvas'
import MarqueeTicker  from '@/components/MarqueeTicker'
import AmbientBackground from '@/components/AmbientBackground'

// ── ERA Residence pattern imports ─────────────────────────────────────────────
import ThreePillars      from '@/components/ThreePillars'
import Manifesto         from '@/components/Manifesto'
import HorizontalGallery from '@/components/HorizontalGallery'
import CraftProcess      from '@/components/CraftProcess'
import FullBleedCTA      from '@/components/FullBleedCTA'

// ── Existing sections ─────────────────────────────────────────────────────────
import CollectionGrid    from '@/components/CollectionGrid'
import Craftsmanship     from '@/components/Craftsmanship'
import CraftFilm         from '@/components/CraftFilm'
import EditorialMoment   from '@/components/EditorialMoment'
import MacroBand         from '@/components/MacroBand'
import NumbersStrip      from '@/components/NumbersStrip'
import SpecSheet         from '@/components/SpecSheet'
import Voices            from '@/components/Voices'
import TiltedCollage     from '@/components/TiltedCollage'
import InquireForm       from '@/components/InquireForm'
import PrivateAccess     from '@/components/PrivateAccess'
import Footer            from '@/components/Footer'

export default function Home() {
  return (
    <main id="top" className="bg-ink">
      <Nav />
      <ScrollCounter />

      {/* ── 1. HERO — cinematic scroll-scrubbed film ──────────────────────── */}
      <HeroCanvas />

      {/* ── Marquee: hero → manifesto ─────────────────────────────────────── */}
      <MarqueeTicker />

      <AmbientBackground>

        {/* ── 2. MANIFESTO — brand statement ───────────────────────────────── */}
        <Manifesto />

        {/* ── 3. THREE PILLARS — ERA "Three Reasons" cards ─────────────────── */}
        <ThreePillars />

        {/* ── Marquee: pillars → collection ─────────────────────────────────── */}
        <MarqueeTicker
          words={['The Collection', 'Handcrafted', 'Block Printed', 'Limited Pieces', 'Natural Fibres', 'Artisan Made', 'Slow Fashion', 'Heritage Weave']}
          speed={42}
          reverse
        />

        {/* ── 4. COLLECTION GRID — product teaser ───────────────────────────── */}
        <CollectionGrid />

        {/* ── Tilted collage — the collection laid out at an angle ──────────── */}
        <TiltedCollage />

        {/* ── 5. HORIZONTAL DRAG GALLERY — ERA "Drag to see more" ───────────── */}
        <HorizontalGallery />

        {/* ── Marquee: gallery → craft process ──────────────────────────────── */}
        <MarqueeTicker
          words={['The Craft', 'Block Cutting', 'Natural Dye Vats', 'Hand Stamping', 'Sun Drying', 'Wash & Cure', 'Bagru Process', 'Generations of Mastery']}
          speed={48}
        />

        {/* ── 6. CRAFT PROCESS — ERA expandable amenity-style accordion ─────── */}
        <CraftProcess />

        {/* ── 7. CRAFTSMANSHIP — visual craft section ───────────────────────── */}
        <Craftsmanship />

        {/* ── Iris transition — soft circular bloom between chapters ────────── */}

        {/* ── 8. CRAFT FILM — pinned video ──────────────────────────────────── */}
        <CraftFilm />

        {/* ── 9. FULL-BLEED CTA — ERA "Sea Views" section ───────────────────── */}
        <FullBleedCTA />

        {/* ── 10. EDITORIAL MOMENT ─────────────────────────────────────────── */}
        <EditorialMoment />

        {/* ── 11. MACRO BAND ───────────────────────────────────────────────── */}
        <MacroBand />

        {/* ── 12. NUMBERS STRIP ────────────────────────────────────────────── */}
        <NumbersStrip />

        {/* ── 13. SPEC SHEET ───────────────────────────────────────────────── */}
        <SpecSheet />

        {/* ── Marquee: specs → testimonials ─────────────────────────────────── */}
        <MarqueeTicker
          words={['Customer Stories', 'Loved & Worn', 'Heritage Pieces', 'Real Reviews', "Collector's Voice", 'Arttrolley Family']}
          speed={50}
          reverse
        />

        {/* ── 14. VOICES — testimonials ────────────────────────────────────── */}
        <Voices />

        {/* ── 15. INQUIRE FORM ─────────────────────────────────────────────── */}
        <InquireForm />

        {/* ── 16. PRIVATE ACCESS ───────────────────────────────────────────── */}
        <PrivateAccess />

        {/* ── 17. FOOTER ───────────────────────────────────────────────────── */}
        <Footer />

      </AmbientBackground>
    </main>
  )
}
