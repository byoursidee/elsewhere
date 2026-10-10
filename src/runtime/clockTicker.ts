import { useStore } from '../store/useStore'
import { solarFor } from '../domain/geo'
import { sceneFor } from '../domain/scenes'
import { ambientAudioEngine } from '../audio/AmbientAudioEngine'

/**
 * Two-speed cadence, kept outside React entirely: every 1s we just bump a counter so clock-text
 * leaf components re-render; every ~15s we recompute solar elevation/scene (it moves imperceptibly
 * over 15s, so there's no need to pay for it every second across up to 5 visible windows).
 */
const SLOW_EVERY_N_TICKS = 15

let intervalId: ReturnType<typeof setInterval> | null = null
let unsubscribe: (() => void) | null = null
let tickCount = 0

function visibleCities(): string[] {
  const { multi, selected, active } = useStore.getState()
  return multi ? selected : [active]
}

export function recomputeSolar(cities: string[] = visibleCities()): void {
  const { places, sceneOverride, setCityRuntime } = useStore.getState()
  for (const city of cities) {
    const zone = places[city]
    if (!zone) continue
    const { elevation, hourAngle } = solarFor(city, zone)
    const sceneKind = sceneFor(city, zone, sceneOverride)
    setCityRuntime(city, { elevation, hourAngle, sceneKind })
  }

  // No-ops until the engine has been unmuted at least once (ctx is null until then).
  const activeRuntime = useStore.getState().cityRuntime[useStore.getState().active]
  if (activeRuntime) {
    ambientAudioEngine.setActiveScene(activeRuntime.sceneKind)
    ambientAudioEngine.tick()
  }
}

export function startClockTicker(): void {
  if (intervalId) return

  recomputeSolar() // populate immediately so first paint isn't blank

  intervalId = setInterval(() => {
    tickCount++
    useStore.getState().bumpClockTick()
    if (tickCount % SLOW_EVERY_N_TICKS === 0) recomputeSolar()
  }, 1000)

  // Recompute right away (don't wait up to 15s) whenever what's visible or how it's scened changes.
  unsubscribe = useStore.subscribe((state, prev) => {
    if (
      state.active !== prev.active ||
      state.multi !== prev.multi ||
      state.selected !== prev.selected ||
      state.sceneOverride !== prev.sceneOverride
    ) {
      recomputeSolar()
    }
  })
}

export function stopClockTicker(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  unsubscribe?.()
  unsubscribe = null
  tickCount = 0
}
