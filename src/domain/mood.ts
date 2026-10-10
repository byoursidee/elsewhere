export interface MoodPhrase {
  prefix: string
  word: string
  suffix: string
}

/**
 * Specific night-time word from the LOCAL clock hour — solar elevation alone can't distinguish
 * midnight from 9pm, and at high latitudes it can stay dark well into the local morning (polar
 * night), where "It's night here" would read as simply wrong.
 */
function nightWord(localHour: number): string {
  if (localHour >= 8 && localHour < 18) return 'the polar night'
  if (localHour === 0 || localHour === 1) return 'midnight'
  if (localHour >= 2 && localHour <= 3) return 'the dead of night'
  if (localHour >= 4 && localHour <= 6) return 'the small hours'
  return 'night'
}

/**
 * Specific daylight word from the LOCAL clock hour — solar elevation alone can't distinguish 9am
 * from 2pm, and at high latitudes the sun can stay up through the local night (the midnight sun).
 */
function dayWord(localHour: number): string {
  if (localHour >= 22 || localHour < 5) return 'the midnight sun'
  if (localHour >= 5 && localHour < 8) return 'early morning'
  if (localHour >= 8 && localHour < 12) return 'morning'
  if (localHour === 12) return 'midday'
  if (localHour >= 13 && localHour < 17) return 'afternoon'
  if (localHour >= 17 && localHour < 19) return 'late afternoon'
  return 'evening'
}

/**
 * Mood phrase from a continuous solar position plus the LOCAL clock hour at that place. Elevation
 * still drives the transitional dawn/dusk/golden-hour bands near the horizon (those are inherently
 * about the sun, not the clock) and mirrors the sky shader's day/night split; the broad interior of
 * day and night is worded from localHour so it's specific to what time it actually is there.
 * Weather is shown separately (see WeatherBadge), so this sentence stays just the time of day.
 */
export function moodPhrase(elevation: number, hourAngle: number, localHour: number): MoodPhrase {
  return elevation < -12
    ? { prefix: "It's ", word: nightWord(localHour), suffix: ' here' }
    : elevation < 0
      ? hourAngle < 0
        ? { prefix: "It's ", word: 'dawn', suffix: ' here' }
        : { prefix: "It's ", word: 'dusk', suffix: ' here' }
      : elevation < 6
        ? hourAngle < 0
          ? { prefix: "It's early ", word: 'morning', suffix: ' here' }
          : { prefix: "It's ", word: 'golden hour', suffix: ' here' }
        : { prefix: "It's ", word: dayWord(localHour), suffix: ' here' }
}
