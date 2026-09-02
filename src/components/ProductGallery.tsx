'use client'

import { useState } from 'react'

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden bg-ink/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={name}
          className="w-full h-full object-cover transition-opacity duration-700"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${name}`}
              className={`relative w-16 h-20 overflow-hidden border transition-colors duration-500 ${
                i === active ? 'border-gold' : 'border-parchment/15 hover:border-parchment/40'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
