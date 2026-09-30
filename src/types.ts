export type MealKey = 'breakfast' | 'lunch' | 'dinner'

export const MEAL_KEYS: MealKey[] = ['breakfast', 'lunch', 'dinner']

export const MEAL_LABELS: Record<MealKey, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
}

/** 每餐的基礎消耗(kcal),當餐攝取要先扣掉這個值才是剩餘。 */
export const MEAL_BURN = 200

export interface FoodItem {
  id: string
  name: string
  unit: string
  kcal: number
  emoji: string
}

/** 一餐 = 每種食物的份數,只存 >0 的項目。 */
export type Meal = Record<string, number>

export type DayRecord = Record<MealKey, Meal>

/** 日期字串 YYYY-MM-DD → 當天三餐 */
export type Records = Record<string, DayRecord>
