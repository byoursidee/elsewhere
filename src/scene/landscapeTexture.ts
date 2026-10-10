import * as THREE from 'three'
import { landscapePaths } from './landscapePaths'
import type { SceneKind } from '../domain/scenes'

const VIEW_W = 1200
const VIEW_H = 800

/** One canvas per (scene kind, layer) pair, built once and cached module-wide — every window
 * reuses the same texture instances rather than re-rasterizing the same silhouettes per mount. */
const textureCache = new Map<string, THREE.CanvasTexture[]>()

function buildLayerCanvas(kind: SceneKind, index: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = VIEW_W
  canvas.height = VIEW_H
  const ctx = canvas.getContext('2d')!
  const op = landscapePaths[kind][index]
  const path = new Path2D(op.d)
  ctx.globalAlpha = op.opacity ?? 1
  if (op.fill) {
    ctx.fillStyle = op.fill
    ctx.fill(path)
  }
  if (op.stroke) {
    ctx.strokeStyle = op.stroke
    ctx.lineWidth = op.strokeWidth ?? 1
    ctx.stroke(path)
  }
  ctx.globalAlpha = 1
  return canvas
}

/**
 * Each scene's silhouette data is already hand-drawn as separate back-to-front layers (distant
 * ridge, then nearer ridge, etc. — see landscapePaths.ts). Rendering them as ONE flattened texture
 * on a single plane threw that away, which is why the background read as a flat cutout instead of
 * having real depth: this returns one transparent-background texture per layer, ordered back to
 * front, so Landscape.tsx can place each on its own plane at its own distance from the camera —
 * real motion parallax between layers as the camera drifts, not just a single card bobbing around.
 */
export function getLandscapeLayers(kind: SceneKind): THREE.CanvasTexture[] {
  let layers = textureCache.get(kind)
  if (!layers) {
    layers = landscapePaths[kind].map((_, i) => {
      const tex = new THREE.CanvasTexture(buildLayerCanvas(kind, i))
      tex.colorSpace = THREE.SRGBColorSpace
      return tex
    })
    textureCache.set(kind, layers)
  }
  return layers
}

export const LANDSCAPE_ASPECT = VIEW_W / VIEW_H
