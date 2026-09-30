import { shiftDate, todayKey } from './date'
import type { DayRecord, Records } from './types'

const KEY = 'kcal.records.v1'

export function loadRecords(): Records {
  const seeded = seedFromUrl()
  if (seeded) {
    saveRecords(seeded)
    return seeded
  }
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Records) : {}
  } catch {
    return {}
  }
}

/**
 * 開發用:網址帶 ?seed=<每日剩餘> 時,產生今天往前 30 天、每天剩餘為該值的
 * 示範資料覆蓋現有紀錄(例如 ?seed=50、?seed=-100),然後把參數從網址移除。
 * 基礎菜單三餐合計 650(剩餘 +50),差額用「飯」以 100 為單位補上或扣掉。
 */
function seedFromUrl(): Records | null {
  const params = new URLSearchParams(location.search)
  const raw = params.get('seed')
  if (raw === null) return null
  const net = Number(raw)
  if (!Number.isFinite(net)) return null

  const extraRice = Math.round((net - 50) / 100)
  const day = (): DayRecord => {
    const d: DayRecord = {
      breakfast: { bread: 1, egg: 1, milk: 1 }, // 220
      lunch: { rice: 1, meat: 1, veg: 1 }, // 230
      dinner: { noodle: 1, veg: 1, soup: 1 }, // 200
    }
    if (extraRice > 0) d.dinner.rice = extraRice
    else if (extraRice < 0) {
      // 扣飯:先扣午餐的飯,再把晚餐的麵換掉
      const cut = -extraRice
      delete d.lunch.rice
      if (cut >= 2) delete d.dinner.noodle
    }
    return d
  }

  const records: Records = {}
  const today = todayKey()
  for (let i = 29; i >= 0; i--) records[shiftDate(today, -i)] = day()

  params.delete('seed')
  const q = params.toString()
  history.replaceState(null, '', location.pathname + (q ? `?${q}` : '') + location.hash)
  return records
}

export function saveRecords(records: Records) {
  try {
    localStorage.setItem(KEY, JSON.stringify(records))
  } catch {
    // 私密模式或空間不足時就只存在記憶體裡
  }
}
