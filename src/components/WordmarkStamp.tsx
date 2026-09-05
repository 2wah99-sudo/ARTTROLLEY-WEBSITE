// A small hand-block hallmark glyph — the same diamond-and-petal motif
// language as Manifesto's BlockPrintStamp watermark, but built for inline
// flow use (no `absolute`) so it can sit as a punctuation mark between two
// words rather than as a background texture.
export default function WordmarkStamp({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path d="M24 2 L46 24 L24 46 L2 24 Z" stroke="currentColor" strokeWidth="1" />
      <path d="M24 12 L36 24 L24 36 L12 24 Z" stroke="currentColor" strokeWidth="1" />
      <circle cx="24" cy="24" r="2.4" fill="currentColor" />
      <circle cx="24" cy="2" r="1.6" fill="currentColor" />
      <circle cx="46" cy="24" r="1.6" fill="currentColor" />
      <circle cx="24" cy="46" r="1.6" fill="currentColor" />
      <circle cx="2" cy="24" r="1.6" fill="currentColor" />
    </svg>
  )
}
