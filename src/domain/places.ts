/** Curated quick-pick cities shown by default in the toolbar and "quick location" dropdown. */
export const places: Record<string, string> = {
  Dhaka: 'Asia/Dhaka',
  Tokyo: 'Asia/Tokyo',
  London: 'Europe/London',
  'New York': 'America/New_York',
  Paris: 'Europe/Paris',
  Sydney: 'Australia/Sydney',
  Dubai: 'Asia/Dubai',
  Singapore: 'Asia/Singapore',
  Toronto: 'America/Toronto',
  Seoul: 'Asia/Seoul',
  Berlin: 'Europe/Berlin',
}

/** Broader catalog of cities searchable via the location search box. */
export const cityCatalog: Array<[name: string, zone: string]> = [
  ['Chattogram', 'Asia/Dhaka'],
  ['Chittagong', 'Asia/Dhaka'],
  ['Sylhet', 'Asia/Dhaka'],
  ['Rajshahi', 'Asia/Dhaka'],
  ['Khulna', 'Asia/Dhaka'],
  ['Tangail', 'Asia/Dhaka'],
  ['Barishal', 'Asia/Dhaka'],
  ['Rangpur', 'Asia/Dhaka'],
  ['Cox’s Bazar', 'Asia/Dhaka'],
  ['Mumbai', 'Asia/Kolkata'],
  ['Delhi', 'Asia/Kolkata'],
  ['New Delhi', 'Asia/Kolkata'],
  ['Kolkata', 'Asia/Kolkata'],
  ['Bengaluru', 'Asia/Kolkata'],
  ['Chennai', 'Asia/Kolkata'],
  ['Hyderabad', 'Asia/Kolkata'],
  ['Kathmandu', 'Asia/Kathmandu'],
  ['Karachi', 'Asia/Karachi'],
  ['Lahore', 'Asia/Karachi'],
  ['Islamabad', 'Asia/Karachi'],
  ['Colombo', 'Asia/Colombo'],
  ['Bangkok', 'Asia/Bangkok'],
  ['Hanoi', 'Asia/Ho_Chi_Minh'],
  ['Ho Chi Minh City', 'Asia/Ho_Chi_Minh'],
  ['Jakarta', 'Asia/Jakarta'],
  ['Kuala Lumpur', 'Asia/Kuala_Lumpur'],
  ['Manila', 'Asia/Manila'],
  ['Hong Kong', 'Asia/Hong_Kong'],
  ['Shanghai', 'Asia/Shanghai'],
  ['Beijing', 'Asia/Shanghai'],
  ['Taipei', 'Asia/Taipei'],
  ['Osaka', 'Asia/Tokyo'],
  ['Istanbul', 'Europe/Istanbul'],
  ['Rome', 'Europe/Rome'],
  ['Madrid', 'Europe/Madrid'],
  ['Amsterdam', 'Europe/Amsterdam'],
  ['Zurich', 'Europe/Zurich'],
  ['Vienna', 'Europe/Vienna'],
  ['Stockholm', 'Europe/Stockholm'],
  ['Oslo', 'Europe/Oslo'],
  ['Copenhagen', 'Europe/Copenhagen'],
  ['Dublin', 'Europe/Dublin'],
  ['Lisbon', 'Europe/Lisbon'],
  ['Athens', 'Europe/Athens'],
  ['Moscow', 'Europe/Moscow'],
  ['Los Angeles', 'America/Los_Angeles'],
  ['San Francisco', 'America/Los_Angeles'],
  ['Seattle', 'America/Los_Angeles'],
  ['Chicago', 'America/Chicago'],
  ['Boston', 'America/New_York'],
  ['Washington DC', 'America/New_York'],
  ['Miami', 'America/New_York'],
  ['Houston', 'America/Chicago'],
  ['Vancouver', 'America/Vancouver'],
  ['Montreal', 'America/Toronto'],
  ['Mexico City', 'America/Mexico_City'],
  ['São Paulo', 'America/Sao_Paulo'],
  ['Buenos Aires', 'America/Argentina/Buenos_Aires'],
  ['Melbourne', 'Australia/Melbourne'],
  ['Brisbane', 'Australia/Brisbane'],
  ['Perth', 'Australia/Perth'],
  ['Auckland', 'Pacific/Auckland'],
  ['Wellington', 'Pacific/Auckland'],
  ['Cairo', 'Africa/Cairo'],
  ['Nairobi', 'Africa/Nairobi'],
  ['Cape Town', 'Africa/Johannesburg'],
  ['Johannesburg', 'Africa/Johannesburg'],
  ['Lagos', 'Africa/Lagos'],
  ['Riyadh', 'Asia/Riyadh'],
  ['Doha', 'Asia/Qatar'],
  ['Abu Dhabi', 'Asia/Dubai'],
  ['Muscat', 'Asia/Muscat'],
]

export interface ZoneEntry {
  name: string
  zone: string
  region: string
}

/** Builds the full searchable index: curated places + catalog + every IANA zone as a last resort. */
export function buildZoneIndex(): ZoneEntry[] {
  let zones: string[] = []
  try {
    zones = Intl.supportedValuesOf('timeZone')
  } catch {
    zones = Object.values(places)
  }
  const fromCatalog = cityCatalog.map(([name, zone]) => ({ name, zone, region: zone.replaceAll('_', ' ') }))
  const fromPlaces = Object.entries(places).map(([name, zone]) => ({ name, zone, region: zone.replaceAll('_', ' ') }))
  const fromZones = [...new Set(zones)].map((zone) => ({
    zone,
    name: zone.split('/').pop()!.replace(/_/g, ' '),
    region: zone.split('/').slice(0, -1).join(' / ').replace(/_/g, ' '),
  }))
  return [...fromCatalog, ...fromPlaces, ...fromZones]
}

/** Ranked, deduped search over a zone index, matching the existing location-search UX. */
export function searchZones(index: ZoneEntry[], query: string, limit = 12): ZoneEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const score = (z: ZoneEntry) => {
    const n = z.name.toLowerCase()
    return n === q ? 0 : n.startsWith(q) ? 1 : n.includes(q) ? 2 : 3
  }
  return index
    .filter((z) => `${z.name} ${z.region} ${z.zone}`.toLowerCase().includes(q))
    .sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name))
    .filter((z, i, all) => all.findIndex((v) => v.name === z.name) === i)
    .slice(0, limit)
}
