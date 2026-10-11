import type { SceneKind } from './scenes'

export interface VideoPair {
  day: string
  night: string
}

/**
 * Stock video loops from Mixkit (free, no API key, CORS-enabled — verified directly against
 * assets.mixkit.co, which returns `access-control-allow-origin: *`). Each clip is picked to
 * actually show the right time of day on its own — no color grading applied on our side — but
 * this is still scene-kind-based, not tied to any specific city: Mixkit's library isn't curated
 * by city, so every city sharing a scene kind sees the same pair of clips. A couple are the
 * closest available match rather than a true night shot (noted inline) since not every kind has
 * one in Mixkit's free catalog.
 *
 * 720p: Mixkit's 1080p files run 30-120MB each, too heavy for an autoplaying background loop
 * (worse with up to 5 windows in multi-view); 360p was visibly soft. 720p is the quality/weight
 * balance (roughly 2.5-12MB per clip).
 */
export const videoBackgrounds: Record<SceneKind, VideoPair> = {
  forest: {
    day: 'https://assets.mixkit.co/videos/529/529-720.mp4', // forest stream in sunlight
    night: 'https://assets.mixkit.co/videos/3350/3350-720.mp4', // moon over a snowy forest
  },
  mountain: {
    day: 'https://assets.mixkit.co/videos/4132/4132-720.mp4', // mountainous area in the Alps
    // generic starry night sky, not literally a mountain shot — closest available match
    night: 'https://assets.mixkit.co/videos/4148/4148-720.mp4',
  },
  ocean: {
    day: 'https://assets.mixkit.co/videos/44392/44392-720.mp4', // flying low over the sea
    // sunset over the sea — closest available match, not a true night shot
    night: 'https://assets.mixkit.co/videos/4119/4119-720.mp4',
  },
  city: {
    day: 'https://assets.mixkit.co/videos/4000/4000-720.mp4', // busy city street
    night: 'https://assets.mixkit.co/videos/4308/4308-720.mp4', // aerial view of a city at night
  },
  desert: {
    day: 'https://assets.mixkit.co/videos/4149/4149-720.mp4', // dunes in the Sahara
    night: 'https://assets.mixkit.co/videos/40047/40047-720.mp4', // desert skyline with the moon at night
  },
  lake: {
    day: 'https://assets.mixkit.co/videos/5009/5009-720.mp4', // flying over a sunny bay
    night: 'https://assets.mixkit.co/videos/1704/1704-720.mp4', // starry sky over a calm lake
  },
  aurora: {
    day: 'https://assets.mixkit.co/videos/4040/4040-720.mp4', // aurora borealis at dawn
    night: 'https://assets.mixkit.co/videos/4034/4034-720.mp4', // northern lights, yellow and pink tones
  },
  rain: {
    day: 'https://assets.mixkit.co/videos/48004/48004-720.mp4', // rain falling on the street
    night: 'https://assets.mixkit.co/videos/4332/4332-720.mp4', // Times Square on a rainy night
  },
}

export const VIDEO_CREDIT = { name: 'Mixkit', url: 'https://mixkit.co' }
