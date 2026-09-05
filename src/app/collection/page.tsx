import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import LineReveal from '@/components/LineReveal'
import CollectionFilterGrid from '@/components/CollectionFilterGrid'
import RedAmbientBackground from '@/components/RedAmbientBackground'
import { PRODUCTS } from '@/lib/products'

export const metadata: Metadata = {
  title: 'The Collection — Arttrolley',
  description: 'Every current piece, hand block-printed and naturally dyed in Bagru, Rajasthan.',
}

export default function CollectionPage() {
  return (
    <main className="bg-ink min-h-screen">
      <Nav />

      <RedAmbientBackground>
        <section className="pt-40 pb-20 md:pt-52 md:pb-24 px-6 md:px-10 border-b border-parchment/10">
          <div className="max-w-[1600px] mx-auto">
            <Reveal>
              <p className="label mb-4">The Collection</p>
            </Reveal>
            <LineReveal
              as="h1"
              className="font-serif text-4xl md:text-6xl font-light leading-[1.1] text-parchment max-w-2xl text-balance"
              lines={['Every piece we currently make.', 'Nothing held back for a later drop.']}
            />
            <Reveal delay={0.2}>
              <p className="mt-6 font-sans text-base text-smoke max-w-md">
                {PRODUCTS.length} pieces, each limited by a dye batch and a block&rsquo;s
                lifespan. Once a piece sells through, it does not return in the
                same form.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-20 md:py-28 px-6 md:px-10">
          <div className="max-w-[1600px] mx-auto">
            <CollectionFilterGrid />
          </div>
        </section>
      </RedAmbientBackground>

      <Footer />
    </main>
  )
}
