import type { Metadata } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import SmoothScroll from '@/components/SmoothScroll'
import Preloader from '@/components/Preloader'
import CustomCursor from '@/components/CustomCursor'
import MotionSystem from '@/components/MotionSystem'
import { CartProvider } from '@/context/CartContext'
import CartDrawer from '@/components/CartDrawer'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['300', '400', '500'],
  // italic added for the hero/atelier storyline overlay's poetic line —
  // otherwise identical to the site's existing serif everywhere else.
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500'],
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
        url: '/flow-assets/model-courtyard-kurti-2k.png',
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
    images: ['/flow-assets/model-courtyard-kurti-2k.png'],
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
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
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
        <CartProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
