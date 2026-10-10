import type { SceneKind } from '../domain/scenes'
import type { TimeBand } from '../domain/timeOfDay'
import type { WeatherKind } from '../domain/weather'

function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function AutoIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </Svg>
  )
}

export function GridIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </Svg>
  )
}

export function SingleViewIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
    </Svg>
  )
}

export function ViewColumnsIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="7" height="16" rx="2" />
      <rect x="14" y="4" width="7" height="16" rx="2" />
    </Svg>
  )
}

export function ViewRowsIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <rect x="4" y="3" width="16" height="7" rx="2" />
      <rect x="4" y="14" width="16" height="7" rx="2" />
    </Svg>
  )
}

export function SpeakerOnIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M16.5 9.5a4 4 0 0 1 0 5" />
      <path d="M19 7a7 7 0 0 1 0 10" />
    </Svg>
  )
}

export function SpeakerOffIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M16 9l5 6M21 9l-5 6" />
    </Svg>
  )
}

export function LocationPinIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M12 21s7-7.6 7-12.4A7 7 0 0 0 5 8.6C5 13.4 12 21 12 21Z" />
      <circle cx="12" cy="8.6" r="2.3" />
    </Svg>
  )
}

export function TimeBandIcon({ band, className }: { band: TimeBand; className?: string }) {
  switch (band) {
    case 'night':
      return (
        <Svg className={className}>
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" fill="currentColor" stroke="none" />
          <circle cx="18.5" cy="6" r=".9" fill="currentColor" stroke="none" />
        </Svg>
      )
    case 'morning':
      return (
        <Svg className={className}>
          <path d="M3 17h18" />
          <path d="M7 17a5 5 0 0 1 10 0" />
          <path d="M12 8v2.3M8.4 10.3l1.3 1.3M15.6 10.3l-1.3 1.3" />
        </Svg>
      )
    case 'noon':
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
        </Svg>
      )
    case 'afternoon':
      return (
        <Svg className={className}>
          <path d="M3 17h18" />
          <path d="M7 17a5 5 0 0 1 10 0" />
        </Svg>
      )
  }
}

export function WeatherIcon({ kind, className }: { kind: WeatherKind; className?: string }) {
  switch (kind) {
    case 'clear':
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
        </Svg>
      )
    case 'cloudy':
      return (
        <Svg className={className}>
          <circle cx="8.5" cy="7.5" r="2.6" />
          <path d="M8.5 3.2v1.3M5.4 5.4l.9.9M12.7 5.4l-.9.9" />
          <path d="M7 17.5a4 4 0 0 1-.4-7.96A5.5 5.5 0 0 1 17.5 10a3.5 3.5 0 0 1 .5 7.48Z" />
        </Svg>
      )
    case 'overcast':
      return (
        <Svg className={className}>
          <path d="M6.5 17a4 4 0 0 1-.4-7.96A5.5 5.5 0 0 1 17 9a3.5 3.5 0 0 1 .5 7.98Z" />
        </Svg>
      )
    case 'fog':
      return (
        <Svg className={className}>
          <path d="M6.5 13a4 4 0 0 1-.3-7.96A5.5 5.5 0 0 1 17 5a3.5 3.5 0 0 1 .5 6.98Z" opacity=".75" />
          <path d="M4 16.5h16M6 20h12" />
        </Svg>
      )
    case 'rain':
      return (
        <Svg className={className}>
          <path d="M7 11a4 4 0 0 1 .3-7.98A5.5 5.5 0 0 1 18 6a3.5 3.5 0 0 1-.5 7Z" />
          <path d="M8 17l-1.3 2.4M12 17l-1.3 2.4M16 17l-1.3 2.4" />
        </Svg>
      )
    case 'storm':
      return (
        <Svg className={className}>
          <path d="M7 10a4 4 0 0 1 .3-7.98A5.5 5.5 0 0 1 18 4a3.5 3.5 0 0 1-.5 7Z" />
          <path d="M13 11l-3 5h3l-2 5" />
        </Svg>
      )
    case 'snow':
      return (
        <Svg className={className}>
          <path d="M7 11a4 4 0 0 1 .3-7.98A5.5 5.5 0 0 1 18 6a3.5 3.5 0 0 1-.5 7Z" />
          <path d="M8 17v4M6.3 18.2l3.4 1.6M10.3 18.2l-3.4 1.6" />
          <path d="M16 17v4M14.3 18.2l3.4 1.6M18.3 18.2l-3.4 1.6" />
        </Svg>
      )
  }
}

export function SceneIcon({ kind, className }: { kind: SceneKind; className?: string }) {
  switch (kind) {
    case 'forest':
      return (
        <Svg className={className}>
          <path d="M12 3 16 10H8Z" />
          <path d="M12 8 17 16H7Z" />
          <path d="M12 15v5" />
        </Svg>
      )
    case 'mountain':
      return (
        <Svg className={className}>
          <path d="M3 18 9 7 13 13 16 8 21 18Z" />
        </Svg>
      )
    case 'ocean':
      return (
        <Svg className={className}>
          <path d="M2 10c2.5-2 5-2 7 0s5 2 7 0 5-2 7 0" />
          <path d="M2 16c2.5-2 5-2 7 0s5 2 7 0 5-2 7 0" />
        </Svg>
      )
    case 'city':
      return (
        <Svg className={className}>
          <rect x="3" y="12" width="3" height="8" />
          <rect x="8" y="7" width="3" height="13" />
          <rect x="13" y="14" width="3" height="6" />
          <rect x="18" y="9" width="3" height="11" />
        </Svg>
      )
    case 'desert':
      return (
        <Svg className={className}>
          <circle cx="17" cy="6" r="2.2" fill="currentColor" stroke="none" />
          <path d="M2 17c3-4 6-4 9-1s6 3 9-1" />
        </Svg>
      )
    case 'lake':
      return (
        <Svg className={className}>
          <path d="M3 10h18" />
          <path d="M3 15c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />
        </Svg>
      )
    case 'aurora':
      return (
        <Svg className={className}>
          <path d="M2 14c2-6 4 6 6 0s4-6 6 0 4 6 6 0" opacity=".9" />
          <path d="M2 9c2-5 4 5 6 0s4-5 6 0 4 5 6 0" opacity=".5" />
        </Svg>
      )
    case 'rain':
      return (
        <Svg className={className}>
          <path d="M7 11a4 4 0 0 1 .3-7.98A5.5 5.5 0 0 1 18 6a3.5 3.5 0 0 1-.5 7Z" />
          <path d="M8 17l-1.3 2.4M12 17l-1.3 2.4M16 17l-1.3 2.4" />
        </Svg>
      )
  }
}
