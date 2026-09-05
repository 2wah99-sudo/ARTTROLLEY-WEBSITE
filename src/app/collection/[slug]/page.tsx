import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import LineReveal from '@/components/LineReveal'
import RedAmbientBackground from '@/components/RedAmbientBackground'
import ProductGallery from '@/components/ProductGallery'
import SizeAndBag from '@/components/SizeAndBag'
import { PRODUCTS, getProduct } from '@/lib/products'

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProduct(params.slug)
  if (!product) return {}
  const SITE_URL = 'https://out-arttrolley.vercel.app'
  return {
    title: product.name,
    description: `${product.note}. ${product.description.slice(0, 120)}…`,
    openGraph: {
      title: `${product.name} — Arttrolley`,
      description: product.note,
      url: `${SITE_URL}/collection/${product.slug}`,
      images: [{ url: product.img, alt: product.name }],
      type: 'website',
    },
  }
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug)
  if (!product) notFound()

  const index = PRODUCTS.findIndex((p) => p.slug === product.slug)
  const next = PRODUCTS[(index + 1) % PRODUCTS.length]

  return (
    <main className="bg-ink min-h-screen">
      <Nav />

      <RedAmbientBackground>
      <section className="pt-32 md:pt-40 pb-24 md:pb-32 px-6 md:px-10">
        <div className="max-w-[1600px] mx-auto">
          <Reveal className="mb-10">
            <a href="/collection" className="label text-parchment/50 hover:text-gold transition-colors duration-500">
              ← Back to Collection
            </a>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <Reveal>
              <ProductGallery images={product.gallery} name={product.name} />
            </Reveal>

            <div>
              <Reveal delay={0.1}>
                <p className="label mb-3 text-gold/70">{product.category}</p>
              </Reveal>
              <LineReveal
                as="h1"
                className="font-serif text-3xl md:text-5xl font-light leading-[1.1] text-parchment"
                lines={[product.name]}
                delay={0.1}
              />
              <Reveal delay={0.3}>
              <p className="mt-3 font-sans text-base text-smoke">{product.note}</p>
              <p className="mt-6 font-serif text-2xl text-parchment/90 tabular-nums">
                ₹{product.price.toLocaleString('en-IN')}
              </p>

              <p className="mt-3 font-sans text-xs text-clay/90 tracking-wide">
                {product.batch} — Only {product.remaining} pieces remaining worldwide
              </p>

              <div className="rule my-8 w-10" />

              <SizeAndBag
                slug={product.slug}
                productName={product.name}
                price={product.price}
                img={product.img}
                sizes={product.sizes}
              />

              <div className="rule my-8 w-10" />

              <p className="font-sans text-base leading-relaxed text-parchment/75 font-light max-w-[52ch]">
                {product.description}
              </p>

              <div className="mt-10 border-t border-parchment/15">
                {product.materials.map((m) => (
                  <div
                    key={m.label}
                    className="grid grid-cols-[120px_1fr] gap-6 py-4 border-b border-parchment/10"
                  >
                    <span className="label text-parchment/50">{m.label}</span>
                    <span className="font-sans text-sm text-parchment/85">{m.value}</span>
                  </div>
                ))}
              </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-10 border-t border-parchment/10">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <span className="label">Next</span>
          <a
            href={`/collection/${next.slug}`}
            className="font-serif text-xl md:text-2xl font-light text-parchment hover:text-gold transition-colors duration-500"
          >
            {next.name} →
          </a>
        </div>
      </section>
      </RedAmbientBackground>

      <Footer />
    </main>
  )
}
