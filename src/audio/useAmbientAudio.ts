import { useStore } from '../store/useStore'
import { ambientAudioEngine } from './AmbientAudioEngine'

function getActiveKind() {
  const s = useStore.getState()
  return s.cityRuntime[s.active]?.sceneKind
}

function getActiveSolar() {
  const s = useStore.getState()
  const r = s.cityRuntime[s.active]
  return r ? { elevation: r.elevation, hourAngle: r.hourAngle } : undefined
}

/** The ONLY place `AmbientAudioEngine.init()` is ever called — must stay wired directly to the
 * mute button's click handler so the AudioContext is created inside a genuine user gesture. */
export function toggleAmbientAudio(): void {
  const { muted, toggleMuted } = useStore.getState()
  ambientAudioEngine.init({ getActiveKind, getActiveSolar })
  toggleMuted()
  ambientAudioEngine.setMuted(!muted)
}
