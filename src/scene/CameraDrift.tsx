import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'

const AMPLITUDE_X = 1.3
const AMPLITUDE_Y = 0.55
const PERIOD_SECONDS = 26
const SPEED = (Math.PI * 2) / PERIOD_SECONDS
const ROTATION_AMPLITUDE = MathUtils.degToRad(1.6)

/**
 * A slow, continuous drift — translation (for motion parallax between the near landscape and the
 * far dome/sun) plus a faint rotational pan (the bit that actually reads as "a camera is moving"
 * rather than "a still image with a twinkling sky"). Tuned to be clearly visible within a few
 * seconds of watching, short of ever feeling like the window itself is panning.
 */
export function CameraDrift() {
  useFrame((state) => {
    const t = state.clock.elapsedTime * SPEED
    state.camera.position.x = Math.sin(t) * AMPLITUDE_X
    state.camera.position.y = Math.sin(t * 0.6) * AMPLITUDE_Y
    state.camera.rotation.y = Math.sin(t * 0.5) * ROTATION_AMPLITUDE
    state.camera.rotation.x = Math.sin(t * 0.33) * ROTATION_AMPLITUDE * 0.5
  })
  return null
}
