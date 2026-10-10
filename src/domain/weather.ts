export type WeatherKind = 'clear' | 'cloudy' | 'overcast' | 'fog' | 'rain' | 'storm' | 'snow'

export interface WeatherSnapshot {
  kind: WeatherKind
  /** 0..1 */
  cloudCover: number
  /** mm in the last hour. */
  precipitation: number
  temperatureC: number
}

export const CLEAR_WEATHER: WeatherSnapshot = { kind: 'clear', cloudCover: 0, precipitation: 0, temperatureC: 20 }

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

/** WMO weather codes (used by Open-Meteo) collapsed to the handful of looks the sky shader knows about. */
const WMO_KIND: Record<number, WeatherKind> = {
  0: 'clear',
  1: 'clear',
  2: 'cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  51: 'rain',
  53: 'rain',
  55: 'rain',
  56: 'rain',
  57: 'rain',
  61: 'rain',
  63: 'rain',
  65: 'rain',
  66: 'rain',
  67: 'rain',
  71: 'snow',
  73: 'snow',
  75: 'snow',
  77: 'snow',
  80: 'rain',
  81: 'rain',
  82: 'rain',
  85: 'snow',
  86: 'snow',
  95: 'storm',
  96: 'storm',
  99: 'storm',
}

/**
 * Open-Meteo's current-conditions endpoint: free, no API key, CORS-enabled — a good fit for a
 * client-only app. Failures are the caller's problem to fall back on (e.g. keep stale data).
 */
export async function fetchWeather(lat: number, lon: number, signal?: AbortSignal): Promise<WeatherSnapshot> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,cloud_cover,precipitation,temperature_2m`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`weather fetch failed: ${res.status}`)
  const data = await res.json()
  const code = data.current?.weather_code ?? 0
  const cloudCover = Math.max(0, Math.min(1, (data.current?.cloud_cover ?? 0) / 100))
  const precipitation = Math.max(0, data.current?.precipitation ?? 0)
  const temperatureC = data.current?.temperature_2m ?? 20
  return { kind: WMO_KIND[code] ?? 'clear', cloudCover, precipitation, temperatureC }
}
