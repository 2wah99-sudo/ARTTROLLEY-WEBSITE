'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'

interface Props {
  slug: string
  productName: string
  price: number
  img: string
  sizes: string[]
}

export default function SizeAndBag({ slug, productName, price, img, sizes }: Props) {
  const { add } = useCart()
  const [size, setSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    if (!size) return
    add({ slug, name: productName, price, img, size })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      <p className="label mb-3 text-parchment/50">Size</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setSize(s); setAdded(false) }}
            aria-pressed={size === s}
            className={`min-w-[3rem] px-4 py-2.5 text-sm font-sans border rounded-full transition-colors duration-500 ${
              size === s
                ? 'border-gold text-gold bg-gold/10'
                : 'border-parchment/25 text-parchment/70 hover:border-parchment/50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!size}
        aria-disabled={!size}
        className={`w-full sm:w-auto px-12 py-4 label transition-colors duration-500 disabled:opacity-40 disabled:cursor-not-allowed ${
          added
            ? 'bg-gold text-ink'
            : 'bg-parchment text-ink hover:bg-gold'
        }`}
      >
        {added ? `Added — ${productName} (${size})` : 'Add to Bag'}
      </button>
      {!size && (
        <p className="mt-3 font-sans text-xs text-parchment/65">Select a size to continue.</p>
      )}

      <div className="mt-4">
        <a
          href="/#inquire"
          className="label text-parchment/50 hover:text-gold transition-colors duration-500 border-b border-transparent hover:border-gold pb-0.5"
        >
          Inquire for Private Sizing
        </a>
      </div>
    </div>
  )
}
