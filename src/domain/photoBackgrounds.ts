import type { SceneKind } from './scenes'

/**
 * Placeholder stock photos standing in for real curated photography, one per scene kind. Lorem
 * Picsum is free, keyless, and CORS-enabled — but it has no category search, so these are NOT
 * guaranteed to actually depict the scene kind they're assigned to. The seed only pins each kind
 * to a stable, reproducible image. Swap in real photo URLs here once you have them.
 *
 * 2400x1600 matches LANDSCAPE_ASPECT (1200/800 = 1.5) exactly, so the plane it's mapped onto in
 * Landscape.tsx doesn't stretch it, at a resolution that still looks sharp full-bleed.
 */
export const photoBackgrounds: Record<SceneKind, string> = {
  forest: 'https://picsum.photos/seed/elsewhere-forest/2400/1600',
  mountain: 'https://picsum.photos/seed/elsewhere-mountain/2400/1600',
  ocean: 'https://picsum.photos/seed/elsewhere-ocean/2400/1600',
  city: 'https://picsum.photos/seed/elsewhere-city/2400/1600',
  desert: 'https://picsum.photos/seed/elsewhere-desert/2400/1600',
  lake: 'https://picsum.photos/seed/elsewhere-lake/2400/1600',
  aurora: 'https://picsum.photos/seed/elsewhere-aurora/2400/1600',
  rain: 'https://picsum.photos/seed/elsewhere-rain/2400/1600',
}

export const PHOTO_CREDIT = { name: 'Lorem Picsum', url: 'https://picsum.photos' }
