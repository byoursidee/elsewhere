import { useRef, useState } from 'react'
import { SkyCanvas } from './SkyCanvas'
import { SkyMesh } from './SkyMesh'
import { SCENE_KINDS, type SceneKind } from '../domain/scenes'

/** Phase-3 verification harness: sweep elevation/hourAngle by hand, independent of the store/ticker,
 * to confirm the shader is continuous and correct before wiring it to real solar data. Dev-only. */
export function SkyDebugHarness() {
  const [elevation, setElevation] = useState(20)
  const [hourAngle, setHourAngle] = useState(-30)
  const [sceneKind, setSceneKind] = useState<SceneKind>('city')
  const elevationRef = useRef(elevation)
  const hourAngleRef = useRef(hourAngle)
  elevationRef.current = elevation
  hourAngleRef.current = hourAngle

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
      <SkyCanvas>
        <SkyMesh elevationRef={elevationRef} hourAngleRef={hourAngleRef} sceneKind={sceneKind} />
      </SkyCanvas>
      <div
        data-testid="sky-debug-controls"
        style={{
          position: 'absolute',
          left: 16,
          bottom: 16,
          background: '#000a',
          color: '#fff',
          padding: 16,
          borderRadius: 12,
          fontFamily: 'monospace',
          width: 320,
        }}
      >
        <label>
          elevation: {elevation.toFixed(1)}°
          <input
            data-testid="elevation-slider"
            type="range"
            min={-90}
            max={90}
            step={0.5}
            value={elevation}
            onChange={(e) => setElevation(+e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        <label>
          hourAngle: {hourAngle.toFixed(1)}°
          <input
            data-testid="hourangle-slider"
            type="range"
            min={-180}
            max={180}
            step={1}
            value={hourAngle}
            onChange={(e) => setHourAngle(+e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        <label>
          scene kind:
          <select
            data-testid="scene-kind-select"
            value={sceneKind}
            onChange={(e) => setSceneKind(e.target.value as SceneKind)}
            style={{ width: '100%' }}
          >
            {SCENE_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
