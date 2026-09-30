import { FOODS } from './foods'
import { mealIntake, mealRemaining } from './calc'
import { MEAL_BURN, MEAL_LABELS } from './types'
import type { Meal, MealKey } from './types'
import styles from './MealCard.module.css'

interface Props {
  mealKey: MealKey
  meal: Meal
  onChange: (meal: Meal) => void
}

export function MealCard({ mealKey, meal, onChange }: Props) {
  const intake = mealIntake(meal)
  const remaining = mealRemaining(meal)

  const setQty = (id: string, qty: number) => {
    const next = { ...meal }
    if (qty <= 0) delete next[id]
    else next[id] = qty
    onChange(next)
  }

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.title}>{MEAL_LABELS[mealKey]}</h2>
        <div className={styles.stats}>
          <span>
            攝取 <b>{intake}</b>
          </span>
          <span className={styles.burn}>− {MEAL_BURN}</span>
          <span className={remaining > 0 ? styles.over : styles.under}>
            剩餘 <b>{remaining > 0 ? `+${remaining}` : remaining}</b>
          </span>
        </div>
      </header>
      <div className={styles.grid}>
        {FOODS.map((f) => {
          const qty = meal[f.id] ?? 0
          return (
            <div key={f.id} className={qty > 0 ? styles.chipActive : styles.chip}>
              <button type="button" className={styles.chipMain} onClick={() => setQty(f.id, qty + 1)}>
                <span className={styles.emoji}>{f.emoji}</span>
                <span className={styles.name}>{f.name}</span>
                <span className={styles.kcal}>
                  {f.kcal}/{f.unit}
                </span>
              </button>
              {qty > 0 && (
                <div className={styles.qtyRow}>
                  <button type="button" className={styles.qtyBtn} onClick={() => setQty(f.id, qty - 1)} aria-label="減一">
                    −
                  </button>
                  <span className={styles.qty}>
                    {qty} {f.unit}
                  </span>
                  <button type="button" className={styles.qtyBtn} onClick={() => setQty(f.id, qty + 1)} aria-label="加一">
                    +
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
