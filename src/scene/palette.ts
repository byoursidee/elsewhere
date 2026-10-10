import type { SceneKind } from '../domain/scenes'

export interface SkyPalette {
  dayTop: string
  dayHorizon: string
  nightTop: string
  nightHorizon: string
  /** Multiplicative tint applied on top of the universal day/night gradient — keeps per-kind
   * character without a full day/night color table per scene kind (would be an 8x4 combinatorial
   * table for very little visible gain over a cheap multiply). */
  tint: string
}

const DEFAULT_NIGHT_TOP = '#050a1a'
const DEFAULT_NIGHT_HORIZON = '#152a4a'

export const skyPalettes: Record<SceneKind, SkyPalette> = {
  forest: {
    dayTop: '#2f6fb3',
    dayHorizon: '#bfe3c8',
    nightTop: DEFAULT_NIGHT_TOP,
    nightHorizon: '#122a28',
    tint: '#eaf5ea',
  },
  mountain: {
    dayTop: '#3f7bb8',
    dayHorizon: '#d7e8ef',
    nightTop: DEFAULT_NIGHT_TOP,
    nightHorizon: '#1b2f4b',
    tint: '#f0f4f8',
  },
  ocean: {
    dayTop: '#2d84b8',
    dayHorizon: '#cdeadf',
    nightTop: DEFAULT_NIGHT_TOP,
    nightHorizon: '#0f3a4e',
    tint: '#ebf7f6',
  },
  city: {
    dayTop: '#3c5c8f',
    dayHorizon: '#e3c3a8',
    nightTop: DEFAULT_NIGHT_TOP,
    nightHorizon: DEFAULT_NIGHT_HORIZON,
    tint: '#f2eee8',
  },
  desert: {
    dayTop: '#4f87c6',
    dayHorizon: '#f3cf97',
    nightTop: '#140c1f',
    nightHorizon: '#3a2440',
    tint: '#fbeedd',
  },
  lake: {
    dayTop: '#3577ab',
    dayHorizon: '#d4e9dd',
    nightTop: DEFAULT_NIGHT_TOP,
    nightHorizon: '#163a46',
    tint: '#edf6f1',
  },
  aurora: {
    dayTop: '#2c6f9e',
    dayHorizon: '#bcdde0',
    nightTop: '#04122a',
    nightHorizon: '#123a3a',
    tint: '#e9fbf2',
  },
  rain: {
    dayTop: '#4a6480',
    dayHorizon: '#c7d2d9',
    nightTop: '#0a1420',
    nightHorizon: DEFAULT_NIGHT_HORIZON,
    tint: '#e8edf0',
  },
}
