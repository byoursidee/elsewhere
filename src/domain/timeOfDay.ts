export type TimeBand = 'night' | 'morning' | 'noon' | 'afternoon'

/** Coarse day-arc bucket for chip icons/colors — deliberately simpler than mood.ts's phrase bands. */
export function timeBand(elevation: number, hourAngle: number): TimeBand {
  if (elevation < 0) return 'night'
  if (hourAngle < -15) return 'morning'
  if (hourAngle > 15) return 'afternoon'
  return 'noon'
}

/** [start, end] gradient stops per band, used to tint toolbar chips with their city's local time of day. */
export const TIME_BAND_COLORS: Record<TimeBand, [string, string]> = {
  night: ['#5b7fc4', '#30488f'],
  morning: ['#ffcf8a', '#ff9d6e'],
  noon: ['#ffb469', '#ff8a5c'],
  afternoon: ['#ff9a6e', '#e8724f'],
}
