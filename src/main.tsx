import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useStore } from './store/useStore.ts'
import { ambientAudioEngine } from './audio/AmbientAudioEngine.ts'

if (import.meta.env.DEV) {
  // Dev-only test hooks, stripped from production builds.
  ;(window as unknown as { __store: typeof useStore }).__store = useStore
  ;(window as unknown as { __audio: typeof ambientAudioEngine }).__audio = ambientAudioEngine
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
