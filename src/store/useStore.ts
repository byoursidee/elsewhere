import { create } from 'zustand'
import type { SceneKind, SceneOverride } from '../domain/scenes'
import type { WeatherSnapshot } from '../domain/weather'
import { places as curatedPlaces } from '../domain/places'

export type ClockFont = 'modern' | 'classic' | 'mono' | 'rounded'
export type Layout = 'horizontal' | 'vertical'

export interface CityRuntime {
  elevation: number
  hourAngle: number
  sceneKind: SceneKind
}

interface AppState {
  /** city name -> IANA zone; starts from the curated list, grows via location search. */
  places: Record<string, string>
  active: string
  selected: string[]
  multi: boolean
  /** How multi-view arranges its windows: side by side, or stacked. Takes effect once multi-view is on. */
  layout: Layout
  sceneOverride: SceneOverride
  font: ClockFont
  muted: boolean
  /** Bumped every 1s by the clock ticker; clock-text components subscribe to just this. */
  clockTick: number
  cityRuntime: Record<string, CityRuntime>
  /** Latest fetched conditions per city; absent until the weather ticker's first fetch resolves. */
  weather: Record<string, WeatherSnapshot>

  setActive: (city: string) => void
  /** Toolbar chip click: switch to this city, always collapsing out of multi-view. */
  selectActive: (city: string) => void
  toggleMulti: () => void
  setLayout: (layout: Layout) => void
  setSceneOverride: (scene: SceneOverride) => void
  setFont: (font: ClockFont) => void
  toggleMuted: () => void
  addPlace: (name: string, zone: string) => void
  addSelected: (city: string) => void
  removeSelected: (city: string) => void
  bumpClockTick: () => void
  setCityRuntime: (city: string, runtime: CityRuntime) => void
  setWeather: (city: string, snapshot: WeatherSnapshot) => void
}

export const useStore = create<AppState>((set) => ({
  places: { ...curatedPlaces },
  active: 'Dhaka',
  selected: ['Dhaka', 'Tokyo', 'London'],
  multi: false,
  layout: 'horizontal',
  sceneOverride: 'auto',
  font: 'modern',
  muted: true,
  clockTick: 0,
  cityRuntime: {},
  weather: {},

  setActive: (city) => set({ active: city }),
  selectActive: (city) => set({ active: city, multi: false }),

  toggleMulti: () =>
    set((s) => {
      const multi = !s.multi
      let selected = s.selected
      if (multi && !selected.includes(s.active)) {
        selected = [s.active, ...selected.filter((c) => c !== s.active)].slice(0, 5)
      }
      return { multi, selected }
    }),

  setLayout: (layout) => set({ layout }),
  setSceneOverride: (sceneOverride) => set({ sceneOverride }),
  setFont: (font) => set({ font }),
  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  addPlace: (name, zone) => set((s) => ({ places: { ...s.places, [name]: zone } })),

  addSelected: (city) =>
    set((s) => {
      if (s.selected.includes(city) || s.selected.length >= 5) return s
      return { selected: [...s.selected, city], multi: true }
    }),

  removeSelected: (city) => set((s) => ({ selected: s.selected.filter((c) => c !== city) })),

  bumpClockTick: () => set((s) => ({ clockTick: s.clockTick + 1 })),

  setCityRuntime: (city, runtime) =>
    set((s) => ({ cityRuntime: { ...s.cityRuntime, [city]: runtime } })),

  setWeather: (city, snapshot) =>
    set((s) => ({ weather: { ...s.weather, [city]: snapshot } })),
}))
