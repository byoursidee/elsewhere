import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { SkyMesh } from './SkyMesh'
import type { SceneKind } from '../domain/scenes'

/** Wires a city's live solar runtime (from the store) into a store-agnostic SkyMesh via refs,
 * so continuous Three.js animation never depends on React's 1s/15s update rate. */
export function SkyScene({ city }: { city: string }) {
  const elevationRef = useRef(0)
  const hourAngleRef = useRef(0)
  const cloudCoverRef = useRef(0)
  const precipRef = useRef(0)
  const sceneKind = useStore((s) => s.cityRuntime[city]?.sceneKind ?? 'city')

  useEffect(() => {
    const sync = (state: ReturnType<typeof useStore.getState>) => {
      const r = state.cityRuntime[city]
      if (r) {
        elevationRef.current = r.elevation
        hourAngleRef.current = r.hourAngle
      }
      const w = state.weather[city]
      cloudCoverRef.current = w?.cloudCover ?? 0
      // Normalize mm/hour into a 0..1 shader intensity; 4mm/h is already a heavy downpour.
      precipRef.current = w && (w.kind === 'rain' || w.kind === 'storm') ? Math.min(1, w.precipitation / 4) : 0
    }
    sync(useStore.getState())
    return useStore.subscribe(sync)
  }, [city])

  return (
    <SkyMesh
      elevationRef={elevationRef}
      hourAngleRef={hourAngleRef}
      cloudCoverRef={cloudCoverRef}
      precipRef={precipRef}
      sceneKind={sceneKind as SceneKind}
    />
  )
}
