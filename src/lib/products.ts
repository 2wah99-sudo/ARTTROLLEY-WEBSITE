// All product images reference Google Flow / Nano Banana 2 generated assets
// stored in public/flow-assets/products/. Craft photography (block carving,
// dye, embroidery) doubles as gallery shots until per-product shots are ready.

export type Category = 'Handloom Kurtis' | 'Embroidered Drops' | 'Limited Archive'

export interface Product {
  slug: string
  name: string
  note: string
  price: number
  img: string
  gallery: string[]
  description: string
  materials: { label: string; value: string }[]
  category: Category
  sizes: string[]
  batch: string
  remaining: number
}

// Google Flow / Nano Banana 2 generated images — downloaded at 2K from Flow
const CRAFT = {
  block:       '/flow-assets/craft-block-carving-2k.webp',
  dye:         '/flow-assets/craft-indigo-dye-2k.webp',
  emb:         '/flow-assets/craft-embroidery-2k.webp',
  embDetail:   '/flow-assets/craft-embroidery-detail-2k.webp',
  model:       '/flow-assets/model-courtyard-kurti-2k.webp',
  // Second, no-reference generation pass (2026-09-07) — added specifically
  // to break up how often the five images above repeat across galleries
  // (some were showing up 8-10 times each). Rotated into the same slots
  // below rather than appended only at the end, so the repetition is
  // actually reduced, not just given more members that still go unused.
  hands:       '/flow-assets/craft-process/craft-artisan-hands.jpg',
  stamp:       '/flow-assets/craft-process/craft-teak-stamp.jpg',
  blocksRow:   '/flow-assets/craft-process/craft-teak-blocks-row.jpg',
  blocksArchive: '/flow-assets/craft-process/craft-blocks-archive.jpg',
  loom:        '/flow-assets/craft-process/craft-loom-weave.jpg',
  zardozi:     '/flow-assets/craft-process/craft-zardozi-embroidery.jpg',
}
// Product photography — Flow Nano Banana 2, 2K upscaled
const PROD = {
  flatlay:     '/flow-assets/products/product-nilgiri-kurti-flatlay-2k.webp',
  portraitA:   '/flow-assets/products/product-nilgiri-kurti-portrait-2k.webp',
  portraitB:   '/flow-assets/products/product-nilgiri-kurti-portrait-b-2k.webp',
  lehengaBoutique: '/flow-assets/products/product-lehenga-boutique-2k.webp',
  kurtCourtyard:   '/flow-assets/products/product-kurti-courtyard-2k.webp',
  kurtCourtyardB:  '/flow-assets/products/product-kurti-courtyard-b-2k.webp',
  zardoziDetail:   '/flow-assets/products/product-zardozi-detail-2k.webp',
  dyeVat:          '/flow-assets/products/product-dye-vat-hands-2k.webp',
  // Unique product shots — Flow Nano Banana 2, generated Aug 30 2026
  ochrePanel:      '/flow-assets/products/product-ochre-panel-set-2k.webp',
  charkha:         '/flow-assets/products/product-charkha-coord-2k.webp',
  teakWrap:        '/flow-assets/products/product-teak-motif-wrap-2k.webp',
  marigoldAnarkali:'/flow-assets/products/product-marigold-anarkali-2k.webp',
  bagruSalwar:     '/flow-assets/products/product-bagru-salwar-set-2k.webp',
  kanjeevaram:     '/flow-assets/products/product-kanjeevaram-bridal-drape-2k.webp',
  terracottaKurti: '/flow-assets/products/product-terracotta-block-kurti-2k.webp',
  sunsetDupatta:   '/flow-assets/products/product-sunset-dupatta-drape-2k.webp',
  emeraldKurti:    '/flow-assets/products/product-emerald-handloom-kurti-2k.webp',
  midnightKurti:   '/flow-assets/products/product-midnight-formal-kurti-2k.webp',
  umberDrape:      '/flow-assets/products/product-umber-zari-drape-2k.webp',
  bagruSherwani:   '/flow-assets/products/product-bagru-mens-sherwani-2k.webp',
  ivoryLehenga:    '/flow-assets/products/product-ivory-zari-lehenga-2k.webp',
  roseGardenSuit:  '/flow-assets/products/product-rose-garden-suit-2k.webp',
}

export const PRODUCTS: Product[] = [
  {
    slug: 'nilgiri-kurti',
    name: 'Nilgiri Kurti',
    note: 'Indigo dabu, hand-carved star motif',
    price: 6800,
    img: PROD.flatlay,
    gallery: [PROD.flatlay, PROD.portraitA, PROD.portraitB, CRAFT.dye],
    description:
      'The piece that opens every collection. A single hand-carved teak block, pressed in natural indigo across raw handloom cotton, star motif centred on the chest and mirrored at the hem. No two runs carry the same depth of blue — the dye batch decides that, not us.',
    materials: [
      { label: 'Fabric',   value: '100% Handloom Cotton, 140 GSM' },
      { label: 'Print',    value: 'Hand Block, Dabu resist, single block' },
      { label: 'Dye',      value: 'Natural indigo, fermented in clay vats' },
      { label: 'Fit',      value: 'Relaxed straight, side slits' },
      { label: 'Care',     value: 'Hand wash cold, dry flat, iron reverse' },
      { label: 'Made in',  value: 'Bagru, Rajasthan' },
    ],
    category: 'Handloom Kurtis',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    batch: 'Batch 07',
    remaining: 22,
  },
  {
    slug: 'bagru-straight',
    name: 'Bagru Straight',
    note: 'Rust block-print, mirror embroidery',
    price: 7200,
    img: PROD.kurtCourtyard,
    gallery: [PROD.kurtCourtyard, CRAFT.emb, CRAFT.block],
    description:
      'Rust drawn from iron filings and jaggery, block-printed in a dense repeat, finished with hand-set mirror embroidery along the collar. The straight cut lets the print run uninterrupted from shoulder to hem.',
    materials: [
      { label: 'Fabric',      value: '100% Handloom Cotton, 140 GSM' },
      { label: 'Print',       value: 'Hand Block, dense repeat' },
      { label: 'Dye',         value: 'Natural rust — iron filings, jaggery' },
      { label: 'Embroidery',  value: 'Hand-set mirror work, collar' },
      { label: 'Fit',         value: 'Straight, no side slits' },
      { label: 'Care',        value: 'Hand wash cold, dry flat, iron reverse' },
    ],
    category: 'Embroidered Drops',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    batch: 'Batch 05',
    remaining: 18,
  },
  {
    slug: 'ochre-panel-set',
    name: 'Ochre Panel Set',
    note: 'Pomegranate dye, exposed panel seams',
    price: 8400,
    img: PROD.ochrePanel,
    gallery: [PROD.ochrePanel, CRAFT.hands, CRAFT.model],
    description:
      'A two-piece set in pomegranate-rind ochre, cut in four panels with the seams left exposed and top-stitched in indigo thread — construction as decoration, not hidden inside a lining.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, 150 GSM' },
      { label: 'Print',   value: 'Hand Block, four-panel construction' },
      { label: 'Dye',     value: 'Natural ochre — pomegranate rind' },
      { label: 'Set',     value: 'Kurti + straight pant, sold together' },
      { label: 'Care',    value: 'Hand wash cold, dry flat, iron reverse' },
    ],
    category: 'Embroidered Drops',
    sizes: ['S', 'M', 'L'],
    batch: 'Batch 03',
    remaining: 11,
  },
  {
    slug: 'charkha-coord',
    name: 'Charkha Co-ord',
    note: 'Raw handloom, minimal thread trim',
    price: 5600,
    img: PROD.charkha,
    gallery: [PROD.charkha, CRAFT.stamp, CRAFT.blocksRow],
    description:
      'Undyed, unprinted, and deliberately plain — this co-ord is here for the yarn. Spun on a charkha, woven on a pit-loom, finished with a single line of indigo thread trim at the cuff. The quietest piece in the studio.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, raw/undyed' },
      { label: 'Yarn',    value: 'Hand-spun on charkha' },
      { label: 'Trim',    value: 'Single indigo thread line, cuff only' },
      { label: 'Set',     value: 'Kurti + straight pant, sold together' },
      { label: 'Care',    value: 'Hand wash cold, dry flat' },
    ],
    category: 'Handloom Kurtis',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    batch: 'Batch 09',
    remaining: 31,
  },
  {
    slug: 'teak-motif-wrap',
    name: 'Teak Motif Wrap',
    note: 'Layered indigo, floating panel drape',
    price: 9200,
    img: PROD.teakWrap,
    gallery: [PROD.teakWrap, CRAFT.block, CRAFT.embDetail],
    description:
      'Three layers of indigo, each dyed separately and block-printed before the panels are joined, so the depth of blue changes as the drape moves. The most technically demanding piece we make.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, 140 GSM, 3-ply panel' },
      { label: 'Print',   value: 'Hand Block, layered registration' },
      { label: 'Dye',     value: 'Natural indigo, three separate baths' },
      { label: 'Fit',     value: 'Wrap, floating outer panel' },
      { label: 'Care',    value: 'Hand wash cold, dry flat, iron reverse' },
    ],
    category: 'Embroidered Drops',
    sizes: ['S', 'M', 'L'],
    batch: 'Batch 02',
    remaining: 7,
  },
  {
    slug: 'studio-edit-06',
    name: 'Studio Edit 06',
    note: 'Limited run — nine pieces, hand-numbered',
    price: 11400,
    img: PROD.zardoziDetail,
    gallery: [PROD.zardoziDetail, CRAFT.blocksArchive, CRAFT.loom],
    description:
      'Nine pieces, hand-numbered on the inside seam. Each season\'s studio edit takes one motif to its most elaborate version — this run pairs the star block with a full embroidered star field across the yoke.',
    materials: [
      { label: 'Fabric',      value: '100% Handloom Cotton, 150 GSM' },
      { label: 'Print',       value: 'Hand Block, star motif' },
      { label: 'Embroidery',  value: 'Full star field, yoke, hand needle-set' },
      { label: 'Run size',    value: '9 pieces, hand-numbered' },
      { label: 'Care',        value: 'Hand wash cold, dry flat, iron reverse' },
    ],
    category: 'Limited Archive',
    sizes: ['S', 'M', 'L'],
    batch: 'Batch 04',
    remaining: 4,
  },
  {
    slug: 'marigold-anarkali',
    name: 'Marigold Anarkali',
    note: 'Floor-length, hand-block floral repeat',
    price: 12800,
    img: PROD.marigoldAnarkali,
    gallery: [PROD.marigoldAnarkali, CRAFT.dye, CRAFT.emb],
    description:
      'A floor-length anarkali in marigold yellow and rust, block-printed in a dense floral repeat that runs unbroken from yoke to hem. Cut full through the skirt so it moves with every step — the closest thing we make to a festival piece.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, 150 GSM' },
      { label: 'Print',   value: 'Hand Block, dense floral repeat' },
      { label: 'Dye',     value: 'Natural — marigold yellow, rust' },
      { label: 'Fit',     value: 'Anarkali, floor length, fitted yoke' },
      { label: 'Care',    value: 'Hand wash cold, dry flat, iron reverse' },
    ],
    category: 'Embroidered Drops',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    batch: 'Batch 06',
    remaining: 15,
  },
  {
    slug: 'bagru-salwar-set',
    name: 'Bagru Salwar Set',
    note: 'Two-piece, dabu resist, everyday weight',
    price: 6200,
    img: PROD.bagruSalwar,
    gallery: [PROD.bagruSalwar, CRAFT.zardozi, CRAFT.model],
    description:
      'The set we recommend to anyone new to hand block-print — a kameez and salwar in a lightweight dabu-resist cotton, sized for daily wear rather than an occasion. Nothing precious about it, which is exactly the point.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, 120 GSM' },
      { label: 'Print',   value: 'Hand Block, Dabu resist' },
      { label: 'Set',     value: 'Kameez + salwar, sold together' },
      { label: 'Fit',     value: 'Relaxed, gathered ankle' },
      { label: 'Care',    value: 'Hand wash cold, dry flat' },
    ],
    category: 'Handloom Kurtis',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    batch: 'Batch 10',
    remaining: 27,
  },
  {
    slug: 'ivory-zari-lehenga',
    name: 'Ivory Zari Lehenga',
    note: 'Hand-block ivory, zari-edged panels',
    price: 18400,
    img: PROD.ivoryLehenga,
    gallery: [PROD.ivoryLehenga, CRAFT.hands, CRAFT.stamp],
    description:
      'Ivory block-print skirt panels edged in hand-laid zari thread, paired with a rust dupatta carrying the same star motif that opens every Arttrolley collection. Built for a long day of standing, dancing, and being looked at.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, 150 GSM' },
      { label: 'Print',   value: 'Hand Block, panel construction' },
      { label: 'Trim',    value: 'Hand-laid zari, panel edges' },
      { label: 'Set',     value: 'Lehenga + choli + dupatta' },
      { label: 'Care',    value: 'Specialised dry clean' },
    ],
    category: 'Limited Archive',
    sizes: ['XS', 'S', 'M', 'L'],
    batch: 'Batch 01',
    remaining: 6,
  },
  {
    slug: 'vermillion-bridal-lehenga',
    name: 'Vermillion Bridal Lehenga',
    note: 'Rust-red, full embroidered bodice',
    price: 24600,
    img: PROD.lehengaBoutique,
    gallery: [PROD.lehengaBoutique, PROD.zardoziDetail, CRAFT.emb],
    description:
      'The most elaborate piece in the studio. A rust-red lehenga with a fully hand-embroidered bodice, gold thread worked into the same star field as our Studio Edit kurtis, scaled up to bridal proportions. Made to order, six weeks lead time.',
    materials: [
      { label: 'Fabric',      value: '100% Handloom Cotton base, silk lining' },
      { label: 'Embroidery',  value: 'Full bodice, hand needle-set, gold thread' },
      { label: 'Dye',         value: 'Natural rust — iron filings, jaggery' },
      { label: 'Lead time',   value: 'Made to order, 6 weeks' },
      { label: 'Care',        value: 'Specialised dry clean' },
    ],
    category: 'Limited Archive',
    sizes: ['XS', 'S', 'M', 'L'],
    batch: 'Made to order',
    remaining: 3,
  },
  {
    slug: 'kanjeevaram-bridal-drape',
    name: 'Kanjeevaram Bridal Drape',
    note: 'South Indian silhouette, gold border',
    price: 21200,
    img: PROD.kanjeevaram,
    gallery: [PROD.kanjeevaram, CRAFT.blocksRow, CRAFT.dye],
    description:
      'A nod to the South Indian silk drape, reworked in our own block-printed cotton with a woven gold border. Heavier than the rest of the collection by design — this is a piece meant to stand still in, not walk fast in.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, 180 GSM' },
      { label: 'Border',  value: 'Woven gold zari border' },
      { label: 'Print',   value: 'Hand Block, temple motif' },
      { label: 'Drape',   value: 'South Indian pleat style' },
      { label: 'Care',    value: 'Specialised dry clean' },
    ],
    category: 'Limited Archive',
    sizes: ['S', 'M', 'L'],
    batch: 'Batch 02',
    remaining: 8,
  },
  {
    slug: 'rose-garden-suit',
    name: 'Rose Garden Suit Set',
    note: 'Floral block-print, matching dupatta',
    price: 8900,
    img: PROD.roseGardenSuit,
    gallery: [PROD.roseGardenSuit, CRAFT.blocksArchive, CRAFT.emb],
    description:
      'A three-piece suit set — kurti, pant, and dupatta — carrying the same rose motif across all three, hand-carved as one continuous block so the pattern lines up wherever the pieces meet. Soft, warm-weather cotton throughout.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, 130 GSM' },
      { label: 'Print',   value: 'Hand Block, rose motif, matched repeat' },
      { label: 'Set',     value: 'Kurti + pant + dupatta' },
      { label: 'Fit',     value: 'Relaxed straight' },
      { label: 'Care',    value: 'Hand wash cold, dry flat, iron reverse' },
    ],
    category: 'Embroidered Drops',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    batch: 'Batch 08',
    remaining: 19,
  },
  {
    slug: 'indigo-summer-coord',
    name: 'Indigo Summer Co-ord',
    note: 'Two-tone indigo, breathable weave',
    price: 6800,
    img: PROD.dyeVat,
    gallery: [PROD.dyeVat, CRAFT.dye, CRAFT.block],
    description:
      'A lightweight co-ord in a two-tone indigo check, woven loose enough to breathe through a Bagru summer. The print sits close to raw thread on this one — less about the motif, more about the weave underneath it.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, 110 GSM' },
      { label: 'Weave',   value: 'Open weave, two-tone check' },
      { label: 'Dye',     value: 'Natural indigo, dip-dyed' },
      { label: 'Set',     value: 'Top + trouser, sold together' },
      { label: 'Care',    value: 'Hand wash cold, dry flat' },
    ],
    category: 'Handloom Kurtis',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    batch: 'Batch 11',
    remaining: 24,
  },
  {
    slug: 'bagru-mens-sherwani',
    name: "Bagru Men's Sherwani",
    note: 'Hand-block, mirror-set collar',
    price: 15600,
    img: PROD.bagruSherwani,
    gallery: [PROD.bagruSherwani, CRAFT.loom, CRAFT.embDetail],
    description:
      'The men\'s line stays small and deliberate — one sherwani per season. This run is block-printed in a muted repeat with a mirror-set collar, cut long and straight, built from the same cloth and the same hands as everything else we make.',
    materials: [
      { label: 'Fabric',      value: '100% Handloom Cotton, 160 GSM' },
      { label: 'Print',       value: 'Hand Block, muted repeat' },
      { label: 'Embroidery',  value: 'Mirror-set collar, hand needle-set' },
      { label: 'Fit',         value: 'Straight, knee length' },
      { label: 'Care',        value: 'Specialised dry clean' },
    ],
    category: 'Embroidered Drops',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    batch: 'Batch 03',
    remaining: 11,
  },
  {
    slug: 'terracotta-block-kurti',
    name: 'Terracotta Block Kurti',
    note: 'Warm rust dye, contrast piping',
    price: 5900,
    img: PROD.terracottaKurti,
    gallery: [PROD.terracottaKurti, CRAFT.zardozi, CRAFT.hands],
    description:
      'Warm terracotta over raw cotton, finished with a thin contrast piping along the placket — a small, deliberate detail that keeps this from reading as plain. One of the more wearable pieces in the studio, built for repeat use.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, 130 GSM' },
      { label: 'Print',   value: 'Hand Block, single motif' },
      { label: 'Dye',     value: 'Natural terracotta — iron, jaggery' },
      { label: 'Trim',    value: 'Contrast piping, placket' },
      { label: 'Care',    value: 'Hand wash cold, dry flat' },
    ],
    category: 'Handloom Kurtis',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    batch: 'Batch 12',
    remaining: 33,
  },
  {
    slug: 'sunset-dupatta-drape',
    name: 'Sunset Dupatta Drape',
    note: 'Ombre block-print, hand-rolled edge',
    price: 7400,
    img: PROD.sunsetDupatta,
    gallery: [PROD.sunsetDupatta, CRAFT.stamp, CRAFT.block],
    description:
      'A kurti and dupatta set in a soft sunset gradient — pink bleeding into ochre — achieved by dipping the same block-printed cloth twice, at two depths, in the same dye bath. The dupatta finishes in a hand-rolled edge, no machine hem anywhere on the piece.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, 140 GSM' },
      { label: 'Print',   value: 'Hand Block, double-dip ombre' },
      { label: 'Edge',    value: 'Hand-rolled, dupatta only' },
      { label: 'Set',     value: 'Kurti + dupatta' },
      { label: 'Care',    value: 'Hand wash cold, dry flat, iron reverse' },
    ],
    category: 'Embroidered Drops',
    sizes: ['S', 'M', 'L'],
    batch: 'Batch 07',
    remaining: 14,
  },
  {
    slug: 'rani-pink-lehenga-choli',
    name: 'Rani Pink Lehenga Choli',
    note: 'Deep pink, hand-set mirror work',
    price: 19800,
    img: PROD.kurtCourtyardB,
    gallery: [PROD.kurtCourtyardB, PROD.zardoziDetail, CRAFT.blocksRow],
    description:
      'Rani pink, a shade reserved for the pieces we\'re proudest of. Mirror work is hand-set across the choli in a star field that echoes our original block motif, scaled to catch light as the skirt moves.',
    materials: [
      { label: 'Fabric',      value: '100% Handloom Cotton, 150 GSM' },
      { label: 'Dye',         value: 'Natural — rani pink' },
      { label: 'Embroidery',  value: 'Hand-set mirror work, choli' },
      { label: 'Set',         value: 'Lehenga + choli' },
      { label: 'Care',        value: 'Specialised dry clean' },
    ],
    category: 'Limited Archive',
    sizes: ['XS', 'S', 'M', 'L'],
    batch: 'Batch 05',
    remaining: 9,
  },
  {
    slug: 'emerald-handloom-kurti',
    name: 'Emerald Handloom Kurti',
    note: 'Deep green, minimal block detail',
    price: 6100,
    img: PROD.emeraldKurti,
    gallery: [PROD.emeraldKurti, CRAFT.blocksArchive, CRAFT.model],
    description:
      'A deep emerald ground with a single, restrained block motif at the hem — most of this piece is left to the colour. The green comes from a pomegranate-leaf and iron bath, deeper and cooler than anything else we dye.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, 140 GSM' },
      { label: 'Dye',     value: 'Natural — pomegranate leaf, iron' },
      { label: 'Print',   value: 'Hand Block, hem only' },
      { label: 'Fit',     value: 'Relaxed straight, side slits' },
      { label: 'Care',    value: 'Hand wash cold, dry flat, iron reverse' },
    ],
    category: 'Handloom Kurtis',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    batch: 'Batch 09',
    remaining: 21,
  },
  {
    slug: 'midnight-formal-kurti',
    name: 'Midnight Formal Kurti',
    note: 'Navy ground, silver thread edge',
    price: 8200,
    img: PROD.midnightKurti,
    gallery: [PROD.midnightKurti, CRAFT.emb, CRAFT.dye],
    description:
      'Our darkest indigo, dyed past blue into near-navy, edged in a fine silver thread at the collar and cuff. Built for the pieces that need to read as formal without leaving the block-print language behind.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, 150 GSM' },
      { label: 'Dye',     value: 'Natural indigo, extended bath' },
      { label: 'Trim',    value: 'Silver thread, collar and cuff' },
      { label: 'Fit',     value: 'Fitted straight' },
      { label: 'Care',    value: 'Hand wash cold, dry flat, iron reverse' },
    ],
    category: 'Embroidered Drops',
    sizes: ['XS', 'S', 'M', 'L'],
    batch: 'Batch 13',
    remaining: 17,
  },
  {
    slug: 'umber-zari-drape',
    name: 'Umber Zari Drape',
    note: 'Earth-tone, zari-shot border',
    price: 9600,
    img: PROD.umberDrape,
    gallery: [PROD.umberDrape, CRAFT.loom, CRAFT.zardozi],
    description:
      'Umber and warm brown, block-printed in a dense repeat with a zari-shot border along the hem and dupatta edge — a quieter, earth-toned counterpoint to the brighter festive pieces in the archive.',
    materials: [
      { label: 'Fabric',  value: '100% Handloom Cotton, 150 GSM' },
      { label: 'Print',   value: 'Hand Block, dense repeat' },
      { label: 'Border',  value: 'Zari-shot, hem and dupatta edge' },
      { label: 'Set',     value: 'Kurti + dupatta' },
      { label: 'Care',    value: 'Hand wash cold, dry flat, iron reverse' },
    ],
    category: 'Embroidered Drops',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    batch: 'Batch 14',
    remaining: 12,
  },
]

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug)
}
