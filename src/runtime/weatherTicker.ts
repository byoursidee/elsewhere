import { useStore } from '../store/useStore'
import { geoFor } from '../domain/geo'
import { fetchWeather } from '../domain/weather'

/** Weather doesn't change fast enough (nor does the free tier want hammering) to poll more than this. */
const REFRESH_MS = 10 * 60 * 1000

const inFlight = new Set<string>()
let intervalId: ReturnType<typeof setInterval> | null = null
let unsubscribe: (() => void) | null = null

function visibleCities(): string[] {
  const { multi, selected, active } = useStore.getState()
  return multi ? selected : [active]
}

async function refreshCity(city: string): Promise<void> {
  if (inFlight.has(city)) return
  const { places, setWeather } = useStore.getState()
  const zone = places[city]
  if (!zone) return
  inFlight.add(city)
  try {
    const [lat, lon] = geoFor(city, zone)
    const snapshot = await fetchWeather(lat, lon)
    setWeather(city, snapshot)
  } catch {
    // Leave whatever weather (or none) is already in the store rather than flash a wrong state.
  } finally {
    inFlight.delete(city)
  }
}

export function startWeatherTicker(): void {
  if (intervalId) return

  for (const city of visibleCities()) void refreshCity(city)

  intervalId = setInterval(() => {
    for (const city of visibleCities()) void refreshCity(city)
  }, REFRESH_MS)

  // A newly visible city (switched active, added to multi-view) shouldn't wait up to 10 minutes
  // for its first fetch.
  unsubscribe = useStore.subscribe((state, prev) => {
    if (state.active !== prev.active || state.multi !== prev.multi || state.selected !== prev.selected) {
      for (const city of visibleCities()) {
        if (!state.weather[city]) void refreshCity(city)
      }
    }
  })
}

export function stopWeatherTicker(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  unsubscribe?.()
  unsubscribe = null
}
