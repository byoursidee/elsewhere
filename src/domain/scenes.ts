import { hour } from './time'

export const SCENE_KINDS = [
  'forest',
  'mountain',
  'ocean',
  'city',
  'desert',
  'lake',
  'aurora',
  'rain',
] as const

export type SceneKind = (typeof SCENE_KINDS)[number]
export type SceneOverride = SceneKind | 'auto'

type DayPeriod = 'night' | 'dawn' | 'day' | 'golden' | 'evening'

const regionScenes: Record<string, Record<DayPeriod, SceneKind>> = {
  Asia: { night: 'city', dawn: 'mountain', day: 'city', golden: 'ocean', evening: 'city' },
  Europe: { night: 'rain', dawn: 'lake', day: 'city', golden: 'lake', evening: 'city' },
  America: { night: 'city', dawn: 'mountain', day: 'forest', golden: 'lake', evening: 'city' },
  Australia: { night: 'ocean', dawn: 'ocean', day: 'ocean', golden: 'desert', evening: 'ocean' },
  Pacific: { night: 'ocean', dawn: 'ocean', day: 'ocean', golden: 'ocean', evening: 'ocean' },
  Africa: { night: 'aurora', dawn: 'desert', day: 'desert', golden: 'desert', evening: 'desert' },
  Atlantic: { night: 'ocean', dawn: 'ocean', day: 'ocean', golden: 'ocean', evening: 'ocean' },
  Indian: { night: 'ocean', dawn: 'ocean', day: 'ocean', golden: 'ocean', evening: 'ocean' },
  Antarctica: { night: 'aurora', dawn: 'mountain', day: 'mountain', golden: 'mountain', evening: 'aurora' },
}

const cityScenes: Partial<Record<string, Partial<Record<DayPeriod, SceneKind>>>> = {
  Dubai: { day: 'desert', golden: 'desert' },
  Singapore: { day: 'forest' },
  Tokyo: { dawn: 'mountain' },
  Seoul: { dawn: 'mountain' },
}

export function dayPeriod(h: number): DayPeriod {
  return h < 5 || h >= 21 ? 'night' : h < 8 ? 'dawn' : h < 17 ? 'day' : h < 19 ? 'golden' : 'evening'
}

/**
 * Picks the scene "kind" (which silhouette/photo-pool/audio profile to use) from a coarse
 * region × time-of-day lookup. Deliberately independent of the continuous solar elevation signal —
 * this only chooses *what* the scene looks like, not *how bright* it is.
 */
export function sceneFor(city: string, zone: string, override: SceneOverride = 'auto'): SceneKind {
  if (override !== 'auto') return override
  const p = dayPeriod(hour(zone))
  const region = zone.split('/')[0]
  return cityScenes[city]?.[p] ?? (regionScenes[region] ?? regionScenes.Asia)[p]
}
