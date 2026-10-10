import { useEffect, useState } from 'react'
import { Stage } from './components/Stage'
import { Toolbar } from './components/Toolbar'
import { Controls } from './components/Controls'
import { SettingsPanel } from './components/SettingsPanel'
import { LocationSearchModal } from './components/LocationSearchModal'
import { startClockTicker, stopClockTicker } from './runtime/clockTicker'
import { startWeatherTicker, stopWeatherTicker } from './runtime/weatherTicker'
import { useStore } from './store/useStore'
import { format } from './domain/time'

function HomeBadge() {
  useStore((s) => s.clockTick)
  return (
    <div className="home">
      <small>YOUR TIME · DHAKA</small>
      <strong>{format('Asia/Dhaka', { hour: 'numeric', minute: '2-digit', hour12: true })}</strong>
      <small className="home-date">{format('Asia/Dhaka', { weekday: 'short', month: 'short', day: 'numeric' })}</small>
    </div>
  )
}

export default function App() {
  const font = useStore((s) => s.font)
  const [panelOpen, setPanelOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    startClockTicker()
    startWeatherTicker()
    return () => {
      stopClockTicker()
      stopWeatherTicker()
    }
  }, [])

  return (
    <div className={`font-${font}`}>
      <Stage />
      <div className="top">
        Elsewhere<span>.</span>
      </div>
      <div className="top-right">
        <HomeBadge />
      </div>
      <Toolbar onAddLocation={() => setSearchOpen(true)} />
      <Controls onToggleSettings={() => setPanelOpen((v) => !v)} />
      <SettingsPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
      {searchOpen && <LocationSearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
