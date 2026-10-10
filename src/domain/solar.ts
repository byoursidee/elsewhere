export interface SolarPosition {
  /** Degrees above (+) or below (-) the horizon. */
  elevation: number
  /**
   * Degrees of local solar time from solar noon.
   * Negative = morning (sun still rising toward noon), positive = afternoon/evening (sun past noon).
   * This sign convention is load-bearing: the sky shader and the mood-text logic both branch on it
   * to tell dawn from dusk at the same elevation, so keep it consistent everywhere it's consumed.
   */
  hourAngle: number
}

/**
 * NOAA's simplified solar position algorithm (Spencer declination series + equation of time).
 * Ignores atmospheric refraction and horizon obstruction — this drives mood/visuals, not astronomy.
 */
export function solarElevation(lat: number, lon: number, date: Date): SolarPosition {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1)
  const dayOfYear = (date.getTime() - start) / 86400000
  const utcHour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (utcHour - 12) / 24)

  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma)

  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma))

  let trueSolar = utcHour * 60 + eqtime + 4 * lon
  trueSolar = ((trueSolar % 1440) + 1440) % 1440
  const hourAngle = trueSolar / 4 - 180

  const latRad = (lat * Math.PI) / 180
  const haRad = (hourAngle * Math.PI) / 180
  const sinElev = Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad)
  const elevation = (Math.asin(Math.max(-1, Math.min(1, sinElev))) * 180) / Math.PI

  return { elevation, hourAngle }
}
