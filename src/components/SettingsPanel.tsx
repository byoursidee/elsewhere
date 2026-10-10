import { useStore } from '../store/useStore'
import { SCENE_KINDS, type SceneKind } from '../domain/scenes'
import type { ClockFont, Layout } from '../store/useStore'
import { toggleAmbientAudio } from '../audio/useAmbientAudio'
import { AutoIcon, SceneIcon, SpeakerOffIcon, SpeakerOnIcon, ViewColumnsIcon, ViewRowsIcon } from './icons'

const LAYOUT_OPTIONS: Array<{ value: Layout; label: string; icon: typeof ViewColumnsIcon }> = [
  { value: 'horizontal', label: 'Side by side', icon: ViewColumnsIcon },
  { value: 'vertical', label: 'Stacked', icon: ViewRowsIcon },
]

const SCENE_LABELS: Record<SceneKind, string> = {
  forest: 'Forest',
  mountain: 'Mountain',
  ocean: 'Ocean',
  city: 'City skyline',
  desert: 'Desert',
  lake: 'Lakeside',
  aurora: 'Northern lights',
  rain: 'Rainy streets',
}

const FONT_OPTIONS: Array<{ value: ClockFont; label: string }> = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic serif' },
  { value: 'mono', label: 'Monospace' },
  { value: 'rounded', label: 'Rounded' },
]

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const sceneOverride = useStore((s) => s.sceneOverride)
  const setSceneOverride = useStore((s) => s.setSceneOverride)
  const font = useStore((s) => s.font)
  const setFont = useStore((s) => s.setFont)
  const muted = useStore((s) => s.muted)
  const layout = useStore((s) => s.layout)
  const setLayout = useStore((s) => s.setLayout)

  return (
    <section id="panel" className={`panel ${open ? 'open' : ''}`}>
      <div className="panel-head">
        <h2>Atmosphere settings</h2>
        <button type="button" className="panel-close" onClick={onClose} aria-label="Close settings" title="Close">
          ×
        </button>
      </div>

      <div className="setting-group">
        <span className="panel-section-label">Multi-view layout</span>
        <div className="icon-picker icon-picker-view">
          {LAYOUT_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={layout === value ? 'active' : ''}
              onClick={() => setLayout(value)}
              aria-pressed={layout === value}
              aria-label={label}
              title={label}
            >
              <Icon />
            </button>
          ))}
        </div>
      </div>

      <div className="setting-group">
        <span className="panel-section-label">Sound</span>
        <button
          type="button"
          className={`sound-toggle ${!muted ? 'active' : ''}`}
          onClick={toggleAmbientAudio}
          aria-pressed={!muted}
          aria-label={muted ? 'Turn ambient sound on' : 'Turn ambient sound off'}
        >
          {muted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
          <span>{muted ? 'Sound off' : 'Sound on'}</span>
        </button>
      </div>

      <div className="setting-group">
        <span className="panel-section-label">Theme</span>
        <div className="icon-picker icon-picker-theme">
          <button
            type="button"
            className={sceneOverride === 'auto' ? 'active' : ''}
            onClick={() => setSceneOverride('auto')}
            aria-pressed={sceneOverride === 'auto'}
            aria-label="Automatic · local time"
            title="Automatic · local time"
          >
            <AutoIcon />
          </button>
          {SCENE_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              className={sceneOverride === k ? 'active' : ''}
              onClick={() => setSceneOverride(k)}
              aria-pressed={sceneOverride === k}
              aria-label={SCENE_LABELS[k]}
              title={SCENE_LABELS[k]}
            >
              <SceneIcon kind={k} />
            </button>
          ))}
        </div>
      </div>

      <div className="setting-group">
        <span className="panel-section-label">Font</span>
        <div className="icon-picker icon-picker-font">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`font-swatch font-${f.value} ${font === f.value ? 'active' : ''}`}
              onClick={() => setFont(f.value)}
              aria-pressed={font === f.value}
              aria-label={f.label}
              title={f.label}
            >
              Aa
            </button>
          ))}
        </div>
      </div>

      <p>
        Backgrounds are a fully procedural, math-driven sky, not photos, so day and night always
        match the actual time. Sun position is approximated for locations outside a curated set.
        Ambient sound is synthesized in-browser, not a recording.
      </p>
    </section>
  )
}
