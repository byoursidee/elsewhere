import type { SceneKind } from '../domain/scenes'

export interface PathOp {
  d: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
}

const rainStreaks = Array.from({ length: 38 }, (_, i) => `M${i * 36} 0l-130 800`).join(' ')

/** Same hand-drawn silhouette path data as the original vanilla app's vectorScene(), just reused
 * here as Path2D draw ops onto an offscreen canvas instead of inline SVG markup. */
export const landscapePaths: Record<SceneKind, PathOp[]> = {
  forest: [
    { d: 'M0 560L100 440 190 560 310 360 430 560 550 390 710 560 900 400 1050 560 1200 440V800H0Z', fill: '#163c36' },
    { d: 'M0 690L90 490 160 690 280 450 400 690 540 420 660 690 800 470 940 690 1080 420 1200 690V800H0Z', fill: '#092c2d' },
  ],
  mountain: [
    { d: 'M0 650L300 230 480 480 700 170 990 540 1110 310 1200 480V800H0Z', fill: '#46677a' },
    {
      d: 'M195 375L300 230 405 375 340 349 300 305 265 357Z M605 300L700 170 790 305 742 278 700 231 665 290Z',
      fill: '#e4eef2',
    },
    { d: 'M0 720L400 520 700 680 1040 480 1200 610V800H0Z', fill: '#163b4e' },
  ],
  ocean: [
    { d: 'M0 470Q200 455 400 472T800 470T1200 475V800H0Z', fill: '#176d86' },
    { d: 'M0 570Q140 540 280 565T560 560T850 570T1200 558', stroke: '#d9f1e8', strokeWidth: 9, opacity: 0.6 },
    { d: 'M0 700Q160 660 320 690T700 688T1200 700', stroke: '#c9e7e5', strokeWidth: 12, opacity: 0.3 },
  ],
  city: [
    {
      d: 'M0 800V490H80V390H170V570H240V320H350V500H420V260H510V530H590V350H710V540H780V300H890V530H960V400H1050V550H1130V350H1200V800Z',
      fill: '#14273e',
    },
    {
      d: 'M35 540h20m65-95h20m150-65h20m150-40h20m175 65h20m170-45h20m190 100h20',
      stroke: '#f5c886',
      strokeWidth: 11,
    },
  ],
  desert: [
    { d: 'M0 610Q250 350 540 560T1200 490V800H0Z', fill: '#c98c5d' },
    { d: 'M0 700Q250 510 600 670T1200 580V800H0Z', fill: '#9f604a' },
    { d: 'M0 780Q260 630 650 740T1200 660V800H0Z', fill: '#794b43' },
  ],
  lake: [
    { d: 'M0 510L170 320 350 500 550 280 800 520 1020 330 1200 500V800H0Z', fill: '#365f68' },
    { d: 'M0 535H1200V800H0Z', fill: '#276b7a' },
    {
      d: 'M0 640Q230 620 480 645T1000 640T1200 650M0 720Q280 705 550 728T1200 720',
      stroke: '#b7d7c9',
      strokeWidth: 7,
      opacity: 0.35,
    },
  ],
  aurora: [
    { d: 'M-100 250Q300 -50 650 160T1300 60', stroke: '#5be4b0', strokeWidth: 100, opacity: 0.34 },
    { d: 'M-100 200Q350 0 720 230T1300 100', stroke: '#80b8f0', strokeWidth: 65, opacity: 0.22 },
    { d: 'M0 680L150 540 270 660 440 490 600 650 790 520 990 690 1200 540V800H0Z', fill: '#081c2c' },
  ],
  rain: [
    {
      d: 'M0 800V450H110V350H220V570H330V290H460V480H550V390H660V540H780V310H900V480H1040V360H1200V800Z',
      fill: '#15283d',
    },
    { d: rainStreaks, stroke: '#c4e1f1', strokeWidth: 3, opacity: 0.22 },
  ],
}
