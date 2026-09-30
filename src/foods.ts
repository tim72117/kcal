import type { FoodItem } from './types'

// 熱量只是粗估的相對尺度(飯一碗 100、肉一份 100 為基準),
// 不對應真實營養數值,目的只是讓小孩的體型有個可比較的變化依據。
export const FOODS: FoodItem[] = [
  { id: 'rice', name: '飯', unit: '碗', kcal: 100, emoji: '🍚' },
  { id: 'noodle', name: '麵', unit: '碗', kcal: 120, emoji: '🍜' },
  { id: 'bread', name: '麵包', unit: '片', kcal: 80, emoji: '🍞' },
  { id: 'meat', name: '肉', unit: '份', kcal: 100, emoji: '🍖' },
  { id: 'fried', name: '炸物', unit: '份', kcal: 200, emoji: '🍗' },
  { id: 'egg', name: '蛋', unit: '顆', kcal: 60, emoji: '🥚' },
  { id: 'veg', name: '青菜', unit: '份', kcal: 30, emoji: '🥬' },
  { id: 'fruit', name: '水果', unit: '份', kcal: 50, emoji: '🍎' },
  { id: 'soup', name: '湯', unit: '碗', kcal: 50, emoji: '🍲' },
  { id: 'milk', name: '牛奶', unit: '杯', kcal: 80, emoji: '🥛' },
  { id: 'drink', name: '含糖飲料', unit: '杯', kcal: 150, emoji: '🧋' },
  { id: 'dessert', name: '甜點', unit: '份', kcal: 200, emoji: '🍰' },
]

export const FOOD_MAP: Record<string, FoodItem> = Object.fromEntries(FOODS.map((f) => [f.id, f]))
