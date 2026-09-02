'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'

function formatPrice(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

function buildWhatsAppMessage(items: ReturnType<typeof useCart>['items'], total: number) {
  const lines = items.map(
    (i) => `• ${i.name} (${i.size}) × ${i.quantity} = ${formatPrice(i.price * i.quantity)}`
  )
  const msg =
    `Hi, I'd like to order from Arttrolley:\n\n` +
    lines.join('\n') +
    `\n\nTotal: ${formatPrice(total)}\n\nPlease confirm availability and share payment details.`
  // TODO: replace with real WhatsApp number before launch
  return `https://wa.me/919999999999?text=${encodeURIComponent(msg)}`
}

export default function CartDrawer() {
  const { items, open, total, count, remove, setQty, closeCart } = useCart()

  // Trap body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Escape key close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeCart])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="cart-drawer"
            role="dialog"
            aria-label="Your bag"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-ink border-l border-parchment/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-parchment/10">
              <h2 className="font-serif font-light text-parchment text-lg">
                Your Bag {count > 0 && <span className="text-gold/70 text-sm ml-2">[{count}]</span>}
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close bag"
                className="text-parchment/50 hover:text-gold transition-colors duration-300 focus-visible:outline-none focus-visible:text-gold"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                  <div className="w-10 h-10 rounded-full border border-parchment/20 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M2 2h2l2 8h6l2-6H5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="6.5" cy="12.5" r="1" fill="currentColor" />
                      <circle cx="11.5" cy="12.5" r="1" fill="currentColor" />
                    </svg>
                  </div>
                  <p className="font-sans text-sm text-parchment/40">Your bag is empty.</p>
                  <a
                    href="/collection"
                    onClick={closeCart}
                    className="label text-gold/70 hover:text-gold transition-colors duration-300 border-b border-gold/30 hover:border-gold pb-0.5"
                  >
                    Browse the Collection
                  </a>
                </div>
              ) : (
                <ul className="px-8 divide-y divide-parchment/8">
                  {items.map((item) => (
                    <li key={`${item.slug}::${item.size}`} className="py-6 flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-20 h-24 shrink-0 overflow-hidden bg-ink/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <a
                          href={`/collection/${item.slug}`}
                          onClick={closeCart}
                          className="font-serif font-light text-parchment hover:text-gold transition-colors duration-300 text-sm leading-snug"
                        >
                          {item.name}
                        </a>
                        <p className="label mt-1 text-parchment/40 text-xs">Size: {item.size}</p>
                        <p className="font-sans text-sm text-gold/80 mt-2">{formatPrice(item.price)}</p>

                        {/* Qty */}
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => setQty(item.slug, item.size, item.quantity - 1)}
                            className="w-7 h-7 border border-parchment/20 text-parchment/50 hover:border-gold hover:text-gold transition-colors duration-300 flex items-center justify-center text-base leading-none focus-visible:outline-none"
                          >
                            −
                          </button>
                          <span className="font-sans text-sm text-parchment w-4 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => setQty(item.slug, item.size, item.quantity + 1)}
                            className="w-7 h-7 border border-parchment/20 text-parchment/50 hover:border-gold hover:text-gold transition-colors duration-300 flex items-center justify-center text-base leading-none focus-visible:outline-none"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => remove(item.slug, item.size)}
                            className="ml-auto label text-parchment/30 hover:text-clay transition-colors duration-300 text-xs focus-visible:outline-none"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer — checkout */}
            {items.length > 0 && (
              <div className="px-8 py-8 border-t border-parchment/10 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="label text-parchment/50">Subtotal</span>
                  <span className="font-serif font-light text-parchment text-lg">{formatPrice(total)}</span>
                </div>
                <p className="font-sans text-xs text-parchment/35 leading-relaxed">
                  Shipping and taxes calculated at checkout. All pieces are made by hand and shipped from Bagru, Rajasthan.
                </p>

                {/* Primary CTA — full checkout with address */}
                <a
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-parchment text-ink label text-center py-4 hover:bg-gold active:scale-[0.98] transition-[background-color,transform] duration-500 focus-visible:outline-none focus-visible:bg-gold"
                >
                  Proceed to Checkout →
                </a>

                <a
                  href={buildWhatsAppMessage(items, total)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border border-parchment/25 text-parchment/60 label text-center py-3.5 hover:border-gold hover:text-gold transition-colors duration-500 focus-visible:outline-none focus-visible:text-gold"
                >
                  Quick Order via WhatsApp
                </a>

                <p className="font-sans text-xs text-parchment/25 text-center">
                  100% handmade · Natural dyes · Ships in 5–7 days
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
