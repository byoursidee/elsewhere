import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { getLandscapeLayers, getPhotoTexture, getVideoTexture, LANDSCAPE_ASPECT } from './landscapeTexture'
import { skyPalettes } from './palette'
import type { SceneKind } from '../domain/scenes'

const WHITE = new THREE.Color(1, 1, 1)

const NEAR_Z = 0.1
const LAYER_SPACING = 5

/** Same shape as the sky shader's day/night crossover, so a photo's tint and the dome's gradient
 * agree on what "night" means at any given elevation. */
function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

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
 *
 * Settings can swap this for a single photo or video plane instead — same sizing/darkening, just
 * one texture instead of N depth layers, since a flat photo/video can't be split into back-to-front
 * ridges the way the hand-drawn vector data can.
 */
export function Landscape({ city }: { city: string }) {
  const { camera, size } = useThree()
  const sceneKind = useStore((s) => s.cityRuntime[city]?.sceneKind ?? 'city') as SceneKind
  const elevation = useStore((s) => s.cityRuntime[city]?.elevation ?? 20)
  const cloudCover = useStore((s) => s.weather[city]?.cloudCover ?? 0)
  const landscapeStyle = useStore((s) => s.landscapeStyle)

  const night = 1 - smoothstep(-8, 8, elevation)
  const isNight = night >= 0.5

  const vectorLayers = useMemo(() => getLandscapeLayers(sceneKind), [sceneKind])
  const photoTexture = useMemo(() => getPhotoTexture(sceneKind), [sceneKind])
  const videoTexture = useMemo(
    () => (landscapeStyle === 'video' ? getVideoTexture(sceneKind, isNight) : null),
    [landscapeStyle, sceneKind, isNight],
  )
  const layers =
    landscapeStyle === 'video' ? [videoTexture!] : landscapeStyle === 'photo' ? [photoTexture] : vectorLayers

  const dark = Math.max(0, Math.min(1, (-elevation) / 14)) + cloudCover * 0.2
  const shade = 1 - Math.min(1, dark) * 0.72 // keep a faint readable silhouette even at full night, not pitch black

  const color = useMemo(() => {
    // Video is picked as a real day/night clip already, so it gets NO color filtering on our
    // side — the whole point was to stop faking it and show the real thing.
    if (landscapeStyle === 'video') return WHITE
    // A generic stock photo has no inherent relationship to the current sky color at all — a plain
    // grayscale dimmer (fine for the hand-tinted vector art) leaves it looking like a daytime photo
    // that's merely dark, not a photo lit by the scene's actual time of day. Washing it toward the
    // SAME horizon color the dome is painting right now at least ties its hue to the moment, even
    // though a real photo's own baked-in shadows/highlights still won't truly match.
    if (landscapeStyle === 'photo') {
      const palette = skyPalettes[sceneKind]
      return new THREE.Color(palette.dayHorizon).lerp(new THREE.Color(palette.nightHorizon), night).multiplyScalar(shade)
    }
    return new THREE.Color(shade, shade, shade)
  }, [landscapeStyle, sceneKind, night, shade])

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
