import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink:      '#060606',
        parchment:'#EDE8E0',
        clay:     '#B5622A',
        gold:     '#C9A84C',
        smoke:    'rgba(237,232,224,0.55)',
      },
      fontFamily: {
        serif:    ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans:     ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        // Hero wordmark only — see the Yeseva_One import in layout.tsx (the
        // closest free stand-in for "Casta", a commercial display face not
        // available on Google Fonts). Fallback chain reaches for other
        // bold/curvy display serifs before Georgia, so the mark still looks
        // distinct from the site's Fraunces even where the webfont hasn't
        // loaded.
        wordmark: ['var(--font-yeseva)', 'Didot', 'Georgia', 'serif'],
      },
      letterSpacing: {
        widest2: '0.25em',
      },
    },
  },
  plugins: [],
}

export default config
