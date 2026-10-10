import { useEffect, useMemo, useRef, useState } from 'react'
import { buildZoneIndex, searchZones, type ZoneEntry } from '../domain/places'
import { useStore } from '../store/useStore'

const DEFAULT_SUGGESTIONS = ['Dhaka', 'Tokyo', 'London', 'New York', 'Paris', 'Dubai']

interface LocationSearchModalProps {
  onClose: () => void
}

export function LocationSearchModal({ onClose }: LocationSearchModalProps) {
  const [query, setQuery] = useState('')
  const places = useStore((s) => s.places)
  const addPlace = useStore((s) => s.addPlace)
  const addSelected = useStore((s) => s.addSelected)
  const setActive = useStore((s) => s.setActive)
  const inputRef = useRef<HTMLInputElement>(null)

  const index = useMemo(() => buildZoneIndex(), [])
  const results = query.trim() ? searchZones(index, query) : []

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function selectZone(z: ZoneEntry) {
    let name = z.name
    if (places[name] && places[name] !== z.zone) name = `${z.name} (${z.region})`
    addPlace(name, z.zone)
    addSelected(name)
    setActive(name)
    onClose()
  }

  function selectDefault(name: string) {
    const z = index.find((x) => x.name === name)
    if (z) selectZone(z)
  }

  return (
    <div
      className="search-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="search-modal">
        <input
          type="search"
          placeholder="Search cities or time zones…"
          autoComplete="off"
          aria-label="Search locations"
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (results.length) selectZone(results[0])
              else if (!query.trim()) selectDefault(DEFAULT_SUGGESTIONS[0])
            }
          }}
        />
        <div className="search-results" role="listbox">
          {!query.trim()
            ? DEFAULT_SUGGESTIONS.map((name) => (
                <button key={name} type="button" onClick={() => selectDefault(name)}>
                  {name}
                </button>
              ))
            : results.map((z) => (
                <button key={z.zone + z.name} type="button" onClick={() => selectZone(z)}>
                  <span>{z.name}</span>
                  <small>{z.region}</small>
                </button>
              ))}
        </div>
      </div>
    </div>
  )
}
