import { useStore } from '../store/useStore'
import type { WeatherKind } from '../domain/weather'
import { celsiusToFahrenheit } from '../domain/weather'
import { WeatherIcon } from './icons'

const KIND_LABEL: Record<WeatherKind, string> = {
  clear: 'Clear',
  cloudy: 'Cloudy',
  overcast: 'Overcast',
  fog: 'Foggy',
  rain: 'Raining',
  storm: 'Stormy',
  snow: 'Snowing',
}

/** Only renders once the weather ticker has actually resolved a snapshot for this city — and never
 * prints a non-finite temperature (e.g. a snapshot carried over from before temperatureC existed). */
export function WeatherBadge({ city }: { city: string }) {
  const weather = useStore((s) => s.weather[city])

  if (!weather || !Number.isFinite(weather.temperatureC)) return null

  const celsius = Math.round(weather.temperatureC)
  const fahrenheit = Math.round(celsiusToFahrenheit(weather.temperatureC))

  return (
    <div className="weather-badge">
      <WeatherIcon kind={weather.kind} />
      <span>{KIND_LABEL[weather.kind]}</span>
      <span className="weather-badge-temp">
        {celsius}°C / {fahrenheit}°F
      </span>
    </div>
  )
}
