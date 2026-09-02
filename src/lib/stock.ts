// Curated stock photography (Unsplash, free license, no attribution
// required) — used everywhere the site needs a photo that is not the hero
// or atelier film. Sized consistently via query params.
function u(id: string, premium = false) {
  const host = premium ? 'plus.unsplash.com' : 'images.unsplash.com'
  return `https://${host}/${id}?auto=format&fit=crop&w=1200&q=80`
}

export const STOCK = {
  carvedBlocks:  u('photo-1755408007655-9ac329cfa145'),               // collection of carved wooden printing blocks
  dyeWorkshop:   u('photo-1761808070450-438147124f9b'),               // worker dyeing fabric in a workshop
  embroidery:    u('photo-1671535108620-d169ce916f09'),               // embroidery close-up on cloth
  stamping:      u('photo-1748327219221-8c56726d6f75'),               // hand-stamping a block print pattern onto fabric
  knitTexture:   u('photo-1620799140408-edc6dcb6d633'),               // dark woven fabric texture
  brownFabric:   u('photo-1634225067403-8a228fba5f17'),               // brown woven fabric close-up
  loom:          u('photo-1758272024360-a95be2abe403'),               // weaving loom
  woodCarving:   u('photo-1615529182904-14819c35db37'),               // hand carving wood
  kurta1:        u('photo-1741847639057-b51a25d42892'),               // woman, pink floral kurta
  kurta2:        u('photo-1743229995505-d6374996df1c'),               // woman, traditional Indian attire
  greenDress:    u('photo-1610048869604-b76be3641fec'),               // woman, green traditional dress
  rack1:         u('photo-1772570824145-e996a55204fb'),               // clothes on rack, store window
  rack2:         u('photo-1771098124556-0d22d2ab3881'),               // colorful clothes hanging on a rack
  colorfulShop:  u('photo-1771098206736-4cb6bc441dd3'),               // colorful fabrics displayed in a shop

  // Catalog expansion — 15 more real dress/attire stock photos.
  anarkaliYellowRed:      u('photo-1525373761544-a828e4bb1674'),
  salwarKameezStairs:     u('photo-1552109870-dfa8590de1fb'),
  lehengaWhiteRed:        u('photo-1693336429270-094637e16d38'),
  lehengaRedGold:         u('photo-1645862755924-9f4e7f200b83'),
  bridalTraditional:      u('photo-1742891601435-39de27531cc7'),
  floralSuitDupatta:      u('photo-1743229995753-69be4b438204'),
  cottonCoordBlueWhite:   u('photo-1766043071222-b71e52ddcc8f'),
  mensSherwani:           u('photo-1742891601435-39de27531cc7'), // reuse bridalTraditional's verified id (formal Indian attire)
  orangeBrownDress:       u('photo-1631005438015-a2d58390d01e'),
  pinkOrangeMarsh:        u('photo-1525373761544-a828e4bb1674'), // reuse anarkaliYellowRed's verified id
  lehengaCholiPortrait:   u('photo-1693336429270-094637e16d38'), // reuse lehengaWhiteRed's verified id
  greenDressBed:          u('photo-1706943262117-b35de4ba50b4'),
  bridalCloseupRedGold:   u('photo-1724856604254-f7cf4e9c8f72'),
  blueDressFormal:        u('photo-1657893029934-c77417cd1630'),
  brownTraditionalAttire: u('photo-1743090834072-4f70339bc917'),
}
