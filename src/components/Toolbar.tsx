import type { CSSProperties } from 'react'
import { useStore } from '../store/useStore'
import { solarFor } from '../domain/geo'
import { timeBand, TIME_BAND_COLORS } from '../domain/timeOfDay'
import { TimeBandIcon } from './icons'

const HOME_CITY = 'Dhaka'

export function Toolbar({ onAddLocation }: { onAddLocation: () => void }) {
  const selected = useStore((s) => s.selected)
  const active = useStore((s) => s.active)
  const multi = useStore((s) => s.multi)
  const places = useStore((s) => s.places)
  const selectActive = useStore((s) => s.selectActive)
  const removeSelected = useStore((s) => s.removeSelected)
  useStore((s) => s.clockTick) // keep each chip's time-of-day band current

  return (
    <nav className="toolbar">
      {selected.map((city) => {
        const zone = places[city]
        const { elevation, hourAngle } = zone ? solarFor(city, zone) : { elevation: 0, hourAngle: 0 }
        const band = timeBand(elevation, hourAngle)
        const [bandA, bandB] = TIME_BAND_COLORS[band]

        return (
          <div
            key={city}
            className={`toolbar-chip ${!multi && active === city ? 'active' : ''}`}
            style={{ '--band-a': bandA, '--band-b': bandB } as CSSProperties}
          >
            <button type="button" className="toolbar-chip-label" onClick={() => selectActive(city)}>
              <TimeBandIcon band={band} className="toolbar-chip-icon" />
              {city}
            </button>
            {city !== HOME_CITY && (
              <button
                type="button"
                className="toolbar-chip-remove"
                aria-label={`Remove ${city}`}
                title={`Remove ${city}`}
                onClick={(e) => {
                  e.stopPropagation()
                  removeSelected(city)
                }}
              >
                ×
              </button>
            )}
          </div>
        )
      })}
      <button type="button" className="toolbar-add" onClick={onAddLocation} aria-label="Add location" title="Add location">
        +
      </button>
    </nav>
  )
}
