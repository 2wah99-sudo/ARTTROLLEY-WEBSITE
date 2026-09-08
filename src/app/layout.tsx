import type { Metadata } from 'next'
import localFont from 'next/font/local'
import SmoothScroll from '@/components/SmoothScroll'
import Preloader from '@/components/Preloader'
import CustomCursor from '@/components/CustomCursor'
import MotionSystem from '@/components/MotionSystem'
import { CartProvider } from '@/context/CartContext'
import CartDrawer from '@/components/CartDrawer'
import './globals.css'

// Self-hosted (next/font/local), same reasoning as Yeseva One below: this
// sandbox's Node process can't complete a TLS handshake to
// fonts.googleapis.com, so next/font/google silently falls back to a
// metrics-only placeholder in every local build (dev AND production/static
// export — confirmed by testing both). Vercel's build servers don't have
// that restriction, so the real font loaded there — meaning the site's
// headline/body typography was genuinely rendering differently between
// local and deployed this whole session. Self-hosting removes the runtime
// fetch entirely, so local and deployed now render identically.
const fraunces = localFont({
  src: [
    { path: './fonts/Fraunces-Normal-300.ttf', weight: '300', style: 'normal' },
    { path: './fonts/Fraunces-Normal-400.ttf', weight: '400', style: 'normal' },
    { path: './fonts/Fraunces-Normal-500.ttf', weight: '500', style: 'normal' },
    { path: './fonts/Fraunces-Italic-300.ttf', weight: '300', style: 'italic' },
    { path: './fonts/Fraunces-Italic-400.ttf', weight: '400', style: 'italic' },
    { path: './fonts/Fraunces-Italic-500.ttf', weight: '500', style: 'italic' },
  ],
  variable: '--font-fraunces',
  display: 'swap',
})

const dmSans = localFont({
  src: [
    { path: './fonts/DMSans-300.ttf', weight: '300', style: 'normal' },
    { path: './fonts/DMSans-400.ttf', weight: '400', style: 'normal' },
    { path: './fonts/DMSans-500.ttf', weight: '500', style: 'normal' },
  ],
  variable: '--font-dm-sans',
  display: 'swap',
})

// Reserved for the hero wordmark only. Closest free equivalent to "Casta"
// (a commercial/boutique display face, not on Google Fonts — no licensed
// file available to load exactly) — Yeseva One is the standard free
// substitute for that same bold, curvy, high-contrast vintage-display
// category. Self-hosted via next/font/local (the .ttf lives in
// src/app/fonts/) instead of next/font/google — this dev sandbox's Node
// process can't complete the TLS handshake to fonts.googleapis.com, so
// every next/font/google face in this project has silently been falling
// back to its metrics-only placeholder locally all session (still fine in
// production, where that fetch succeeds) — self-hosting sidesteps that
// entirely, in both places, since the file ships in the repo and needs no
// runtime fetch at all. Nowhere else on the site uses this — that
// exclusivity is what keeps it feeling like a mark instead of just
// another heading.
const yesevaOne = localFont({
  src: './fonts/YesevaOne-Regular.ttf',
  variable: '--font-yeseva',
  display: 'swap',
  weight: '400',
})

const SITE_URL = 'https://out-arttrolley.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Arttrolley — Heritage, thread by thread.',
    template: '%s | Arttrolley',
  },
  description:
    'Handcrafted block-print kurtis and embroidered garments from Bagru, Rajasthan. Slow fashion rooted in artisan tradition — natural dyes, hand-carved teak blocks, eleven pairs of hands per piece.',
  keywords: [
    'hand block print kurtis',
    'Indian ethnic wear',
    'Bagru block print',
    'artisan fashion',
    'natural dye clothing',
    'handloom cotton',
    'Indian handcraft',
    'slow fashion India',
    'lehenga',
    'anarkali',
  ],
  authors: [{ name: 'Arttrolley' }],
  creator: 'Arttrolley',
  publisher: 'Arttrolley',
  category: 'fashion',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Arttrolley',
    title: 'Arttrolley — Heritage, thread by thread.',
    description:
      'Handcrafted block-print kurtis and embroidered garments from Bagru, Rajasthan. Natural dyes, hand-carved teak blocks, slow fashion.',
    images: [
      {
        url: '/flow-assets/model-courtyard-kurti-2k.webp',
        width: 2704,
        height: 3380,
        alt: 'Arttrolley — hand block-print kurti in a Rajasthan courtyard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arttrolley — Heritage, thread by thread.',
    description: 'Handcrafted block-print kurtis from Bagru, Rajasthan. Natural dyes, 20-piece curated collection.',
    images: ['/flow-assets/model-courtyard-kurti-2k.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} ${yesevaOne.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-ink text-parchment font-sans">
        <Preloader />
        {/* Premium cursor + cinematic motion system — rendered above everything */}
        <CustomCursor />
        <MotionSystem />
        {/* Mobile-only editorial frame — a thin inset gold border around the
            full viewport, fixed so it stays put through scroll. Phones show
            content edge-to-edge by default, which on a site this rich
            (full-bleed hero film, saturated color grade) reads as content
            spilling off an unfinished canvas rather than a considered,
            boutique layout. A slim frame gives it the deliberate,
            gallery-mounted feel the desktop version already gets from its
            surrounding negative space. md:hidden — desktop/tablet already
            has enough breathing room around content that this would be
            redundant there. pointer-events-none + a high z-index keep it
            purely decorative, never intercepting taps. */}
        <div
          aria-hidden="true"
          className="md:hidden fixed inset-2 z-[60] pointer-events-none border border-gold/25"
        />
        <CartProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
