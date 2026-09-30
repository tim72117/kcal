import { FOOD_MAP } from './foods'
import { MEAL_BURN, MEAL_KEYS } from './types'
import type { DayRecord, Meal, Records } from './types'

export function mealIntake(meal: Meal): number {
  return Object.entries(meal).reduce((sum, [id, qty]) => sum + (FOOD_MAP[id]?.kcal ?? 0) * qty, 0)
}

export function mealHasFood(meal: Meal): boolean {
  return Object.values(meal).some((q) => q > 0)
}

/** 當餐剩餘 = 攝取 - 基礎消耗,可能為負(吃太少)。 */
export function mealRemaining(meal: Meal): number {
  return mealIntake(meal) - MEAL_BURN
}

export function dayIntake(day: DayRecord): number {
  return MEAL_KEYS.reduce((s, k) => s + mealIntake(day[k]), 0)
}

export function dayRemaining(day: DayRecord): number {
  return MEAL_KEYS.reduce((s, k) => s + mealRemaining(day[k]), 0)
}

export function dayHasFood(day: DayRecord): boolean {
  return MEAL_KEYS.some((k) => mealHasFood(day[k]))
}

export function emptyDay(): DayRecord {
  return { breakfast: {}, lunch: {}, dinner: {} }
}

/** 每 1 kcal 的剩餘會讓體型分數改變多少;分數 clamp 在 -1(最瘦)~ 1(最胖)。 */
const BODY_SENSITIVITY = 1 / 1500

export function clampBody(v: number): number {
  return Math.max(-1, Math.min(1, v))
}

/** 有填過食物的日期,由舊到新。 */
export function recordedDates(records: Records): string[] {
  return Object.keys(records)
    .filter((d) => dayHasFood(records[d]))
    .sort()
}

/**
 * 逐日累積的體型分數:回傳 date → 「該日結束時」的分數。
 * 沒填任何東西的日子不計(視為沒紀錄,而不是餓了一整天)。
 */
export function bodyTimeline(records: Records): Map<string, number> {
  const out = new Map<string, number>()
  let score = 0
  for (const d of recordedDates(records)) {
    score = clampBody(score + dayRemaining(records[d]) * BODY_SENSITIVITY)
    out.set(d, score)
  }
  return out
}

/** 取得「到某日為止」的體型分數(含當日;若當日沒紀錄則取之前最後一筆)。 */
export function bodyScoreAt(timeline: Map<string, number>, date: string): number {
  let score = 0
  for (const [d, s] of timeline) {
    if (d > date) break
    score = s
  }
  return score
}
