'use client'

import { useId, useState } from 'react'
import Reveal from './Reveal'
import { MinimalToggle } from './ui/toggle'
import { PRODUCTS, type Category } from '@/lib/products'

const FILTERS: Array<'All Pieces' | Category> = [
  'All Pieces',
  'Handloom Kurtis',
  'Embroidered Drops',
  'Limited Archive',
]

export default function CollectionFilterGrid() {
  const [active, setActive] = useState<(typeof FILTERS)[number]>('All Pieces')
  const [compact, setCompact] = useState(false)
  const compactId = useId()
  const items = active === 'All Pieces' ? PRODUCTS : PRODUCTS.filter((p) => p.category === active)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 mb-16">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              aria-pressed={active === f}
              className={`label transition-colors duration-500 ${
                active === f ? 'text-gold' : 'text-parchment/50 hover:text-parchment/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <label htmlFor={compactId} className="flex items-center gap-3 cursor-pointer select-none">
          <span className="label text-parchment/50">Compact View</span>
          <MinimalToggle
            id={compactId}
            checked={compact}
            onChange={(e) => setCompact(e.target.checked)}
          />
        </label>
      </div>

      <div
        className={
          compact
            ? 'grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12'
            : 'grid grid-cols-1 md:grid-cols-6 gap-x-8 gap-y-20'
        }
      >
        {items.map((p, i) => {
          const wide = !compact && i % 5 === 0
          return (
            <Reveal
              key={p.slug}
              delay={(i % 3) * 0.08}
              className={wide ? 'md:col-span-4' : compact ? '' : 'md:col-span-2'}
            >
              <a href={`/collection/${p.slug}`} className="group block">
                <div className={`relative overflow-hidden bg-ink/40 ${wide ? 'aspect-[16/10]' : 'aspect-[3/4]'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-700" />
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <h2 className={`font-serif font-light text-parchment ${compact ? 'text-base' : 'text-xl'}`}>{p.name}</h2>
                  <span className="font-sans text-sm text-parchment/70 tabular-nums whitespace-nowrap ml-4">
                    ₹{p.price.toLocaleString('en-IN')}
                  </span>
                </div>
                {!compact && (
                  <div className="mt-2 flex items-baseline justify-between border-b border-parchment/10 pb-4">
                    <p className="font-sans text-sm text-smoke">{p.note}</p>
                    <span className="label text-gold/70 border-b border-transparent group-hover:border-gold transition-colors duration-500 whitespace-nowrap ml-4">
                      Acquire
                    </span>
                  </div>
                )}
              </a>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
