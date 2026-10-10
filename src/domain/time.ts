export function format(tz: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, ...options }).format(new Date())
}

export function hour(tz: string): number {
  return +format(tz, { hour: '2-digit', hourCycle: 'h23' })
}
