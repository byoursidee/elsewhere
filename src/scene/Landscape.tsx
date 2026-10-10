import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { getLandscapeLayers, LANDSCAPE_ASPECT } from './landscapeTexture'
import type { SceneKind } from '../domain/scenes'

const NEAR_Z = 0.1
const LAYER_SPACING = 5

/**
 * Ground-level silhouette for a scene kind, rendered as several depth layers (distant ridge
 * through near ridge — each scene's path data is already hand-drawn that way, see
 * landscapePaths.ts) instead of one flattened card. Each layer sits at its own distance from the
 * camera, so CameraDrift's sway produces real motion parallax between them — layers shift past
 * each other at different rates, which is what actually reads as depth instead of a single flat
 * cutout bobbing around.
 *
 * Darkens with elevation/cloud cover on the normal (slow) React render cycle — this doesn't
 * animate continuously, so it doesn't need the ref/useFrame treatment the sky shader uses.
 */
export function Landscape({ city }: { city: string }) {
  const { camera, size } = useThree()
  const sceneKind = useStore((s) => s.cityRuntime[city]?.sceneKind ?? 'city') as SceneKind
  const elevation = useStore((s) => s.cityRuntime[city]?.elevation ?? 20)
  const cloudCover = useStore((s) => s.weather[city]?.cloudCover ?? 0)

  const layers = useMemo(() => getLandscapeLayers(sceneKind), [sceneKind])

  const dark = Math.max(0, Math.min(1, (-elevation) / 14)) + cloudCover * 0.2
  const shade = 1 - Math.min(1, dark) * 0.72 // keep a faint readable silhouette even at full night, not pitch black
  const color = useMemo(() => new THREE.Color(shade, shade, shade), [shade])

  const fovRad = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov ?? 50)
  const aspect = size.width / size.height
  const layerCount = layers.length

  return (
    <>
      {layers.map((texture, i) => {
        // Each layer sized to exactly fill the camera's frustum width AT ITS OWN DISTANCE, not a
        // single shared viewport size — that's what keeps every layer reading as "the same width
        // of scene" despite sitting at different depths.
        const z = NEAR_Z - (layerCount - 1 - i) * LAYER_SPACING
        const distance = camera.position.z - z
        const frustumHeight = 2 * Math.tan(fovRad / 2) * distance
        const width = frustumHeight * aspect
        const height = width / LANDSCAPE_ASPECT
        const y = -frustumHeight / 2 + height / 2
        return (
          <mesh key={i} position={[0, y, z]} scale={[width, height, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={texture} color={color} transparent />
          </mesh>
        )
      })}
    </>
  )
}
