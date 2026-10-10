import { useStore } from '../store/useStore'
import { GridIcon, SingleViewIcon } from './icons'

export function Controls({ onToggleSettings }: { onToggleSettings: () => void }) {
  const multi = useStore((s) => s.multi)
  const toggleMulti = useStore((s) => s.toggleMulti)
  return (
    <div className="controls">
      <button
        id="viewBtn"
        className="floating"
        title={multi ? 'Switch to single view' : 'Switch to multi-view'}
        aria-label={multi ? 'Switch to single view' : 'Switch to multi-view'}
        onClick={toggleMulti}
      >
        {multi ? <SingleViewIcon /> : <GridIcon />}
      </button>
      <button id="settingsBtn" className="floating" title="Settings" aria-label="Settings" onClick={onToggleSettings}>
        ⚙
      </button>
    </div>
  )
}
