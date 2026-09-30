/** 以本地時區產生 YYYY-MM-DD。 */
export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function shiftDate(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d + days)
  return toDateKey(dt)
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export function formatDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return `${y}/${m}/${d}(${WEEKDAYS[dt.getDay()]})`
}
