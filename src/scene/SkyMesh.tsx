import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SceneKind } from '../domain/scenes'
import { skyPalettes } from './palette'
import { vertexShader, fragmentShader } from './skyShader'
import { SunMoon } from './SunMoon'

/** Big enough to enclose the camera (which sits near the origin) with headroom; well under the
 * default camera's far plane. */
const DOME_RADIUS = 60

interface SkyUniforms {
  [key: string]: THREE.IUniform
  uElevation: THREE.IUniform<number>
  uTime: THREE.IUniform<number>
  uCloudCover: THREE.IUniform<number>
  uPrecip: THREE.IUniform<number>
  uDayTop: THREE.IUniform<THREE.Color>
  uDayHorizon: THREE.IUniform<THREE.Color>
  uNightTop: THREE.IUniform<THREE.Color>
  uNightHorizon: THREE.IUniform<THREE.Color>
  uTint: THREE.IUniform<THREE.Color>
}

interface SkyMeshProps {
  /** Pushed into the shader (and the sun/moon mesh) every frame via useFrame — never read through
   * a React re-render. */
  elevationRef: RefObject<number>
  hourAngleRef: RefObject<number>
  /** 0..1; omitted by callers (e.g. the debug harness) that don't model weather. */
  cloudCoverRef?: RefObject<number>
  precipRef?: RefObject<number>
  sceneKind: SceneKind
}

/** Pure, store-agnostic sky renderer: a dome whose color is a direct function of elevation/cloud/
 * rain, plus a real 3D sun/moon object (SunMoon) that's the camera's actual focal point. */
export function SkyMesh({ elevationRef, hourAngleRef, cloudCoverRef, precipRef, sceneKind }: SkyMeshProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo<SkyUniforms>(
    () => ({
      uElevation: { value: 0 },
      uTime: { value: 0 },
      uCloudCover: { value: 0 },
      uPrecip: { value: 0 },
      uDayTop: { value: new THREE.Color() },
      uDayHorizon: { value: new THREE.Color() },
      uNightTop: { value: new THREE.Color() },
      uNightHorizon: { value: new THREE.Color() },
      uTint: { value: new THREE.Color() },
    }),
    [],
  )

  useEffect(() => {
    const p = skyPalettes[sceneKind]
    uniforms.uDayTop.value.set(p.dayTop)
    uniforms.uDayHorizon.value.set(p.dayHorizon)
    uniforms.uNightTop.value.set(p.nightTop)
    uniforms.uNightHorizon.value.set(p.nightHorizon)
    uniforms.uTint.value.set(p.tint)
  }, [sceneKind, uniforms])

  useFrame((state) => {
    const m = materialRef.current
    if (!m) return
    m.uniforms.uElevation.value = elevationRef.current
    m.uniforms.uTime.value = state.clock.elapsedTime
    m.uniforms.uCloudCover.value = cloudCoverRef?.current ?? 0
    m.uniforms.uPrecip.value = precipRef?.current ?? 0
  })

  return (
    <>
      <mesh scale={[DOME_RADIUS, DOME_RADIUS, DOME_RADIUS]}>
        <sphereGeometry args={[1, 48, 32]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          side={THREE.BackSide}
        />
      </mesh>
      <SunMoon elevationRef={elevationRef} hourAngleRef={hourAngleRef} cloudCoverRef={cloudCoverRef} />
    </>
  )
}
