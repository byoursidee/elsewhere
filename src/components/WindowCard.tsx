import { SkyCanvas } from '../scene/SkyCanvas'
import { SkyScene } from '../scene/SkyScene'
import { Landscape } from '../scene/Landscape'
import { useStore } from '../store/useStore'
import { format, hour } from '../domain/time'
import { moodPhrase } from '../domain/mood'
import { LocationPinIcon } from './icons'
import { WeatherBadge } from './WeatherBadge'

function ClockBlock({ city }: { city: string }) {
  const zone = useStore((s) => s.places[city])
  useStore((s) => s.clockTick) // re-render every 1s tick only
  const runtime = useStore((s) => s.cityRuntime[city])

  return (
    <div className="content">
      <div className="label">{city === 'Dhaka' ? 'YOUR WORLD' : 'A WINDOW INTO TIME'}</div>
      <div className="phase">
        {runtime && zone
          ? (() => {
              const { prefix, word, suffix } = moodPhrase(runtime.elevation, runtime.hourAngle, hour(zone))
              return (
                <>
                  {prefix}
                  <span className="mood-word">{word}</span>
                  {suffix}
                </>
              )
            })()
          : ''}
      </div>
      <div className="clock">
        {zone ? format(zone, { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }) : ''}
      </div>
      <div className="date">
        {zone ? format(zone, { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
      </div>
      <div className="city">
        <LocationPinIcon className="city-icon" />
        {city}
      </div>
    </div>
  )
}

interface WindowCardProps {
  city: string
  multi: boolean
  showRemove: boolean
  showDivider: boolean
  onRemove: () => void
}

export function WindowCard({ city, multi, showRemove, showDivider, onRemove }: WindowCardProps) {
  const night = useStore((s) => (s.cityRuntime[city]?.elevation ?? 0) < 0)

  return (
    <article className={`window ${multi ? 'multi' : ''} ${night ? 'night' : ''}`}>
      <SkyCanvas>
        <SkyScene city={city} />
        <Landscape city={city} />
      </SkyCanvas>
      <div className="glow" aria-hidden="true" />
      <div className="shade" aria-hidden="true" />
      <div className="window-weather">
        <WeatherBadge city={city} />
      </div>
      <ClockBlock city={city} />
      {showRemove && (
        <button className="remove" title="Remove location" aria-label="Remove location" onClick={onRemove}>
          ×
        </button>
      )}
      {showDivider && <div className="divider" />}
    </article>
  )
}
