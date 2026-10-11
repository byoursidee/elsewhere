import type { SceneKind } from '../domain/scenes'

export type Band = 'night' | 'dawn' | 'day' | 'dusk'

/** Same elevation/hourAngle split the rest of the app uses for day/night and dawn/dusk — keeps
 * the audio's idea of "what time is it" consistent with the sky and the mood text. */
export function bandFor(elevation: number, hourAngle: number): Band {
  if (elevation < -8) return 'night'
  if (elevation < 6) return hourAngle < 0 ? 'dawn' : 'dusk'
  return 'day'
}

export type SoundType =
  | 'birdChorus'
  | 'birdSingle'
  | 'owl'
  | 'cricket'
  | 'seagull'
  | 'waveCrash'
  | 'trafficSwell'
  | 'windGust'
  | 'frog'
  | 'thunder'
  | 'chime'
  | 'shimmer'

export interface BandSound {
  /** The sound a human would actually recognize as "that's what this time of day sounds like." */
  primary: SoundType
  /** How often it fires, in ms — randomized within the range each time. */
  intervalMs: [number, number]
  /** A rarer second layer for texture (e.g. an owl under a cricket chorus). */
  secondary?: SoundType
  secondaryChance?: number
}

/**
 * The actual "what time is it" signal. The filtered noise bed (AmbientAudioEngine's `beds`) is
 * just a texture — a human can't tell dawn from midnight from a lowpass cutoff moving a few
 * hundred Hz. These are the discrete, recognizable events (dawn chorus, crickets, traffic,
 * gulls...) that a human ear actually reads as "morning" or "night," tuned per scene kind so a
 * forest's night sounds different from a city's.
 */
export const SOUND_SCHEDULE: Record<SceneKind, Record<Band, BandSound>> = {
  forest: {
    dawn: { primary: 'birdChorus', intervalMs: [1200, 2200] },
    day: { primary: 'birdSingle', intervalMs: [4000, 8000], secondary: 'windGust', secondaryChance: 0.3 },
    dusk: { primary: 'birdSingle', intervalMs: [5000, 9000] },
    night: { primary: 'cricket', intervalMs: [900, 1800], secondary: 'owl', secondaryChance: 0.12 },
  },
  mountain: {
    dawn: { primary: 'birdSingle', intervalMs: [3500, 6500], secondary: 'windGust', secondaryChance: 0.4 },
    day: { primary: 'windGust', intervalMs: [2800, 5200] },
    dusk: { primary: 'windGust', intervalMs: [4000, 7000] },
    night: { primary: 'windGust', intervalMs: [6000, 11000], secondary: 'owl', secondaryChance: 0.15 },
  },
  lake: {
    dawn: { primary: 'birdChorus', intervalMs: [1800, 3200], secondary: 'waveCrash', secondaryChance: 0.3 },
    day: { primary: 'waveCrash', intervalMs: [2600, 4600], secondary: 'birdSingle', secondaryChance: 0.3 },
    dusk: { primary: 'frog', intervalMs: [2200, 4000] },
    night: { primary: 'frog', intervalMs: [900, 1700], secondary: 'cricket', secondaryChance: 0.4 },
  },
  ocean: {
    dawn: { primary: 'seagull', intervalMs: [3200, 6000] },
    day: { primary: 'waveCrash', intervalMs: [2200, 3800], secondary: 'seagull', secondaryChance: 0.45 },
    dusk: { primary: 'waveCrash', intervalMs: [2600, 4400], secondary: 'seagull', secondaryChance: 0.15 },
    night: { primary: 'waveCrash', intervalMs: [3400, 5600] },
  },
  city: {
    dawn: { primary: 'trafficSwell', intervalMs: [4500, 8000] },
    day: { primary: 'trafficSwell', intervalMs: [1400, 2600] },
    dusk: { primary: 'trafficSwell', intervalMs: [1100, 2000] },
    night: { primary: 'trafficSwell', intervalMs: [6000, 11000] },
  },
  desert: {
    dawn: { primary: 'chime', intervalMs: [3000, 5500], secondary: 'windGust', secondaryChance: 0.3 },
    day: { primary: 'windGust', intervalMs: [2600, 4800] },
    dusk: { primary: 'chime', intervalMs: [3200, 5800] },
    night: { primary: 'windGust', intervalMs: [5000, 9000], secondary: 'cricket', secondaryChance: 0.3 },
  },
  aurora: {
    dawn: { primary: 'shimmer', intervalMs: [3500, 6000] },
    day: { primary: 'windGust', intervalMs: [5000, 9000] },
    dusk: { primary: 'shimmer', intervalMs: [3000, 5200] },
    night: { primary: 'shimmer', intervalMs: [1800, 3400], secondary: 'windGust', secondaryChance: 0.25 },
  },
  rain: {
    dawn: { primary: 'thunder', intervalMs: [7000, 13000] },
    day: { primary: 'thunder', intervalMs: [5500, 10000] },
    dusk: { primary: 'thunder', intervalMs: [4000, 8000] },
    night: { primary: 'thunder', intervalMs: [9000, 16000] },
  },
}
