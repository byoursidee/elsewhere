export const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vDir;
void main() {
  vUv = uv;
  // Local position on the (unit, pre-scale) sphere IS the direction from its center — a real
  // geometric "up" the fragment shader can use for the horizon, not a screen-space approximation.
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/**
 * The sky dome: color, cloud, star and rain are ALL direct functions of uElevation/uCloudCover/
 * uPrecip — there's no separate "overlay" that can desync from them. The sun/moon itself is NOT
 * drawn here; it's a real 3D mesh (see SunMoon.tsx) so it can be the camera's actual focal object
 * and get correctly occluded by the landscape near the horizon.
 */
export const fragmentShader = /* glsl */ `
precision mediump float;

uniform float uElevation;   // degrees, -90..90
uniform float uTime;        // seconds, continuous — drives twinkle/drift, independent of uElevation updates
uniform float uCloudCover;  // 0..1, fraction of sky obscured
uniform float uPrecip;      // 0..1, normalized rain/storm intensity
uniform vec3 uDayTop;
uniform vec3 uDayHorizon;
uniform vec3 uNightTop;
uniform vec3 uNightHorizon;
uniform vec3 uTint;

varying vec2 vUv;
varying vec3 vDir;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  // 0 = full day, 1 = full night, centered on the horizon so sunset/sunrise actually reads as transitional.
  float night = 1.0 - smoothstep(-8.0, 8.0, uElevation);

  vec3 topColor = mix(uDayTop, uNightTop, night);
  vec3 horizonColor = mix(uDayHorizon, uNightHorizon, night);
  // vDir.y is -1 straight down, 0 at the horizon, +1 straight up — the real horizon of the dome.
  float up = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 sky = mix(horizonColor, topColor, pow(up, 0.7));

  // The night/day MIX above saturates at +-8 deg so sunrise/sunset reads as a transition — but
  // that means every elevation beyond it rendered IDENTICALLY (9am looked like 2pm; 9pm looked
  // like 3am). These two continuous tints restore depth across the full +-90 deg range on top of
  // that base mix, so the sky keeps changing from dawn through noon and from dusk through midnight.
  float dayHeight = clamp((uElevation - 8.0) / 72.0, 0.0, 1.0); // 0 just past dawn/dusk, 1 at solar noon
  vec3 lowSunTint = vec3(1.06, 0.93, 0.82);
  vec3 highSunTint = vec3(0.97, 1.0, 1.08);
  sky *= mix(vec3(1.0), mix(lowSunTint, highSunTint, dayHeight), 1.0 - night);

  float nightDepth = clamp((-uElevation - 8.0) / 60.0, 0.0, 1.0); // 0 just past dusk, 1 at deep midnight
  vec3 duskAfterglow = vec3(1.12, 0.97, 0.9);
  vec3 deepNight = vec3(0.78, 0.82, 0.92);
  sky *= mix(vec3(1.0), mix(duskAfterglow, deepNight, nightDepth), night);

  // Cloud mottle: a coarse drifting hash field, independent of the star grid's finer scale.
  // Its mask also dims stars below so overcast skies actually hide them, not just grey the backdrop.
  vec2 cloudUv = vUv * vec2(10.0, 5.0) + vec2(uTime * 0.01, 0.0);
  vec2 cloudCell = floor(cloudUv);
  float cloudNoise = hash(cloudCell) * 0.5 + hash(cloudCell + vec2(1.0, 0.0)) * 0.25 + hash(cloudCell + vec2(0.0, 1.0)) * 0.25;
  float cloudMask = smoothstep(0.3, 0.9, cloudNoise) * uCloudCover;
  vec3 overcastColor = mix(topColor, vec3(0.55, 0.57, 0.6), 0.5) * (1.0 - night * 0.6);
  sky = mix(sky, overcastColor, cloudMask * 0.75);
  float cloudDim = 1.0 - cloudMask * 0.85;

  // Stars: a sparse hashed grid wrapped around the whole dome, opacity gated by night, cloud cover,
  // and staying above the horizon (a star grid that wrapped below it would read as a glitch).
  vec2 starUv = vUv * vec2(140.0, 70.0);
  vec2 cell = floor(starUv);
  vec2 cellUv = fract(starUv);
  float seed = hash(cell);
  float present = step(0.986, seed);
  float d = length(cellUv - 0.5);
  float twinkle = 0.55 + 0.45 * sin(uTime * (1.3 + seed * 2.5) + seed * 40.0);
  float aboveHorizon = step(0.0, vDir.y + 0.05);
  // Fewer/dimmer stars right after dusk than at deep midnight — the sky's still adjusting.
  float star = present * smoothstep(0.1, 0.0, d) * twinkle * night * cloudDim * aboveHorizon * mix(0.4, 1.0, nightDepth);
  sky += vec3(star);

  sky *= uTint;

  // Rain streaks: a sparse hash grid stretched vertically and scrolled downward fast, independent
  // of the star/cloud grids so none of their cell boundaries line up and read as a repeating tile.
  vec2 rainUv = vUv * vec2(160.0, 32.0) + vec2(0.0, -uTime * 1.2);
  vec2 rainCell = floor(rainUv);
  vec2 rainCellUv = fract(rainUv);
  float rainSeed = hash(rainCell + vec2(17.0, 3.0));
  float rainPresent = step(0.9, rainSeed);
  float streak = rainPresent * smoothstep(0.08, 0.0, abs(rainCellUv.x - 0.5)) * smoothstep(1.0, 0.4, rainCellUv.y);
  sky += vec3(0.75, 0.8, 0.85) * streak * uPrecip * 0.5;
  sky *= 1.0 - uPrecip * 0.35; // overall gloom under heavier rain/storm

  gl_FragColor = vec4(sky, 1.0);
}
`
