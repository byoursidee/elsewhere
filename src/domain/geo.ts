import { solarElevation, type SolarPosition } from './solar'

/** Approximate lat/lon for sun-position mood lighting only — not for anything precision-sensitive. */
export const geoCoords: Record<string, [lat: number, lon: number]> = {
  Dhaka: [23.81, 90.41],
  Tokyo: [35.68, 139.69],
  London: [51.51, -0.13],
  'New York': [40.71, -74.01],
  Paris: [48.85, 2.35],
  Sydney: [-33.87, 151.21],
  Dubai: [25.2, 55.27],
  Singapore: [1.35, 103.82],
  Toronto: [43.65, -79.38],
  Seoul: [37.57, 126.98],
  Berlin: [52.52, 13.4],

  Chattogram: [22.36, 91.78],
  Chittagong: [22.36, 91.78],
  Sylhet: [24.9, 91.87],
  Rajshahi: [24.37, 88.6],
  Khulna: [22.85, 89.56],
  Tangail: [24.25, 89.92],
  Barishal: [22.7, 90.37],
  Rangpur: [25.75, 89.25],
  'Cox’s Bazar': [21.45, 92.01],

  Mumbai: [19.08, 72.88],
  Delhi: [28.61, 77.21],
  'New Delhi': [28.61, 77.21],
  Kolkata: [22.57, 88.36],
  Bengaluru: [12.97, 77.59],
  Chennai: [13.08, 80.27],
  Hyderabad: [17.39, 78.49],

  Kathmandu: [27.72, 85.32],
  Karachi: [24.86, 67.0],
  Lahore: [31.55, 74.34],
  Islamabad: [33.68, 73.05],
  Colombo: [6.93, 79.85],

  Bangkok: [13.76, 100.5],
  Hanoi: [21.03, 105.85],
  'Ho Chi Minh City': [10.82, 106.63],
  Jakarta: [-6.21, 106.85],
  'Kuala Lumpur': [3.14, 101.69],
  Manila: [14.6, 120.98],
  'Hong Kong': [22.32, 114.17],
  Shanghai: [31.23, 121.47],
  Beijing: [39.9, 116.4],
  Taipei: [25.03, 121.57],
  Osaka: [34.69, 135.5],

  Istanbul: [41.01, 28.98],
  Rome: [41.9, 12.5],
  Madrid: [40.42, -3.7],
  Amsterdam: [52.37, 4.9],
  Zurich: [47.38, 8.54],
  Vienna: [48.21, 16.37],
  Stockholm: [59.33, 18.07],
  Oslo: [59.91, 10.75],
  Copenhagen: [55.68, 12.57],
  Dublin: [53.35, -6.26],
  Lisbon: [38.72, -9.14],
  Athens: [37.98, 23.73],
  Moscow: [55.76, 37.62],

  'Los Angeles': [34.05, -118.24],
  'San Francisco': [37.77, -122.42],
  Seattle: [47.61, -122.33],
  Chicago: [41.88, -87.63],
  Boston: [42.36, -71.06],
  'Washington DC': [38.91, -77.04],
  Miami: [25.76, -80.19],
  Houston: [29.76, -95.37],
  Vancouver: [49.28, -123.12],
  Montreal: [45.5, -73.57],
  'Mexico City': [19.43, -99.13],
  'São Paulo': [-23.55, -46.63],
  'Buenos Aires': [-34.6, -58.38],

  Melbourne: [-37.81, 144.96],
  Brisbane: [-27.47, 153.03],
  Perth: [-31.95, 115.86],
  Auckland: [-36.85, 174.76],
  Wellington: [-41.29, 174.78],

  Cairo: [30.04, 31.24],
  Nairobi: [-1.29, 36.82],
  'Cape Town': [-33.92, 18.42],
  Johannesburg: [-26.2, 28.05],
  Lagos: [6.52, 3.38],
  Riyadh: [24.71, 46.68],
  Doha: [25.29, 51.53],
  'Abu Dhabi': [24.47, 54.37],
  Muscat: [23.59, 58.38],
}

const southernZoneRe =
  /^Australia\/|^Antarctica\/|Argentina|Santiago|Sao_Paulo|Montevideo|Asuncion|Johannesburg|Maputo|Windhoek|Gaborone|Harare|Lusaka|Auckland|Fiji|Tongatapu|Easter|Noumea|Guadalcanal|Port_Moresby|Chatham/

function offsetHours(zone: string, date: Date): number {
  const u = date.toLocaleString('en-US', { timeZone: 'UTC' })
  const z = date.toLocaleString('en-US', { timeZone: zone })
  return (new Date(z).getTime() - new Date(u).getTime()) / 3600000
}

/**
 * Stylized fallback for any city without curated coordinates: longitude estimated from the
 * timezone's UTC offset (15°/hour), latitude guessed from a hemisphere heuristic. Not accurate —
 * good enough for mood lighting on a timezone picked via free-text search.
 */
export function estimateGeo(zone: string, date: Date = new Date()): [lat: number, lon: number] {
  const lon = Math.max(-180, Math.min(180, offsetHours(zone, date) * 15))
  return [southernZoneRe.test(zone) ? -25 : 30, lon]
}

export function geoFor(city: string, zone: string): [lat: number, lon: number] {
  return geoCoords[city] ?? estimateGeo(zone)
}

export function solarFor(city: string, zone: string, date: Date = new Date()): SolarPosition {
  const [lat, lon] = geoFor(city, zone)
  return solarElevation(lat, lon, date)
}
