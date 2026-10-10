import { Canvas } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { CameraDrift } from './CameraDrift'

/** Shared perf caps for every window's canvas — up to 5 of these can be mounted at once, so each
 * one needs to stay cheap: capped DPR, low-power GPU preference, no post-processing. */
export function SkyCanvas({ children, active = true }: { children: ReactNode; active?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ powerPreference: 'low-power', antialias: false }}
      camera={{ position: [0, 0, 10], fov: 50 }}
      frameloop={active ? 'always' : 'never'}
      style={{ position: 'absolute', inset: 0 }}
    >
      <CameraDrift />
      {children}
    </Canvas>
  )
}
