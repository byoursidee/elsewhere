import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SunMoonProps {
  elevationRef: RefObject<number>
  hourAngleRef: RefObject<number>
  /** 0..1; omitted by callers that don't model weather. */
  cloudCoverRef?: RefObject<number>
}

const SUN_DISTANCE = 40
const CORE_RADIUS = 1.6
const GLOW_SCALE = 16

let glowTexture: THREE.CanvasTexture | null = null

/** Soft radial falloff for the glow sprite — built once, reused by every window's sun/moon. */
function getGlowTexture(): THREE.CanvasTexture {
  if (glowTexture) return glowTexture
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.45)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  glowTexture = new THREE.CanvasTexture(canvas)
  return glowTexture
}

/**
 * Direction for a body at (altitude, azimuth) degrees in world space, facing the way the camera
 * faces by default (down -Z, az=0 straight ahead, az=90 to the right). Altitude plugs directly
 * into the same degrees-above-horizon the sky shader's `vDir.y` is built from, so the body always
 * sits exactly on the dome's own horizon band at altitude 0 — not an independently-tuned constant
 * that can drift out of sync with it.
 */
function altAzDir(out: THREE.Vector3, altitudeDeg: number, azimuthDeg: number): THREE.Vector3 {
  const alt = THREE.MathUtils.degToRad(altitudeDeg)
  const az = THREE.MathUtils.degToRad(azimuthDeg)
  const cosAlt = Math.cos(alt)
  return out.set(Math.sin(az) * cosAlt, Math.sin(alt), -Math.cos(az) * cosAlt)
}

/**
 * The sun/moon as a literal 3D object — the camera's actual focal point for "what part of the day
 * is it," not a flat disc painted into the sky shader. Placed by true altitude/azimuth (unprojected
 * into real 3D depth) so it sits inside the dome and gets correctly occluded by the landscape near
 * the horizon, same as a real sunset would — and tracks the sun by day, crossing over to a mirrored
 * position (opposite side of the sky, elevation flipped) that reads as the moon by night.
 */
export function SunMoon({ elevationRef, hourAngleRef, cloudCoverRef }: SunMoonProps) {
  const coreRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Sprite>(null)
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null)
  const glowMaterialRef = useRef<THREE.SpriteMaterial>(null)

  const glowMap = useMemo(() => getGlowTexture(), [])
  const sunDir = useMemo(() => new THREE.Vector3(), [])
  const moonDir = useMemo(() => new THREE.Vector3(), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const sunColor = useMemo(() => new THREE.Color('#fff3cf'), [])
  const moonColor = useMemo(() => new THREE.Color('#eaf0ff'), [])
  const tmpColor = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    const elevation = elevationRef.current
    const hourAngle = hourAngleRef.current
    // 0 = full day, 1 = full night — same ±8° crossover band the sky shader mixes day/night on,
    // so the body's position and color cross over at the same rate the sky does.
    const night = 1 - THREE.MathUtils.clamp((elevation + 8) / 16, 0, 1)

    altAzDir(sunDir, elevation, hourAngle)
    altAzDir(moonDir, -elevation, hourAngle + 180)
    pos.copy(sunDir).lerp(moonDir, night).normalize().multiplyScalar(SUN_DISTANCE)

    coreRef.current?.position.copy(pos)
    glowRef.current?.position.copy(pos)

    const cloudDim = 1 - (cloudCoverRef?.current ?? 0) * 0.85
    tmpColor.copy(sunColor).lerp(moonColor, night)
    if (coreMaterialRef.current) {
      coreMaterialRef.current.color.copy(tmpColor)
      coreMaterialRef.current.opacity = cloudDim
    }
    if (glowMaterialRef.current) {
      glowMaterialRef.current.color.copy(tmpColor)
      glowMaterialRef.current.opacity = 0.8 * cloudDim
    }
  })

  return (
    <>
      <mesh ref={coreRef}>
        <sphereGeometry args={[CORE_RADIUS, 16, 16]} />
        <meshBasicMaterial ref={coreMaterialRef} transparent />
      </mesh>
      <sprite ref={glowRef} scale={[GLOW_SCALE, GLOW_SCALE, 1]}>
        <spriteMaterial
          ref={glowMaterialRef}
          map={glowMap}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </>
  )
}
