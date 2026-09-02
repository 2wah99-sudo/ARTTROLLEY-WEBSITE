import Link from 'next/link'

export const metadata = {
  title: 'Page Not Found',
}

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-6">
      <div className="text-center max-w-md">
        <p className="label mb-6 text-parchment/40">Arttrolley</p>
        <h1 className="font-serif text-6xl md:text-7xl font-light text-parchment mb-6">
          404
        </h1>
        <p className="font-sans text-base text-smoke mb-10 leading-relaxed">
          This page has been retired — like a block after four hundred
          impressions. The piece you&rsquo;re looking for may have moved.
        </p>
        <Link
          href="/"
          className="inline-block border border-clay text-clay label px-10 py-3.5 hover:bg-clay hover:text-ink transition-colors duration-700"
        >
          Return to the Collection
        </Link>
      </div>
    </main>
  )
}
