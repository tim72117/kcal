import { useEffect, useMemo, useState } from 'react'
import { MealCard } from './MealCard'
import { Kid } from './Kid'
import { bodyScoreAt, bodyTimeline, dayIntake, dayRemaining, emptyDay, recordedDates } from './calc'
import { formatDate, shiftDate, todayKey } from './date'
import { loadRecords, saveRecords } from './storage'
import { MEAL_BURN, MEAL_KEYS } from './types'
import type { Meal, MealKey, Records } from './types'
import styles from './App.module.css'

const PLAY_INTERVAL_MS = 350

export function App() {
  const [records, setRecords] = useState<Records>(() => loadRecords())
  const [date, setDate] = useState(todayKey)
  const [playing, setPlaying] = useState(false)
  // 試調體型:非 null 時直接覆蓋顯示的體型分數,方便預覽胖瘦變化,不影響紀錄
  const [preview, setPreview] = useState<number | null>(null)

  useEffect(() => {
    saveRecords(records)
  }, [records])

  const day = records[date] ?? emptyDay()
  const timeline = useMemo(() => bodyTimeline(records), [records])
  const dates = useMemo(() => recordedDates(records), [records])
  const recordScore = bodyScoreAt(timeline, date)
  const score = preview ?? recordScore

  // 時間軸位置:目前日期之前(含)有幾天紀錄
  const sliderIndex = dates.filter((d) => d <= date).length - 1

  // 播放:從第一筆紀錄逐日往後跳,到最後一筆停下
  useEffect(() => {
    if (!playing) return
    if (dates.length === 0) {
      setPlaying(false)
      return
    }
    const id = setInterval(() => {
      setDate((cur) => {
        const next = dates.find((d) => d > cur)
        if (!next) {
          setPlaying(false)
          return cur
        }
        return next
      })
    }, PLAY_INTERVAL_MS)
    return () => clearInterval(id)
  }, [playing, dates])

  const startPlay = () => {
    if (dates.length === 0) return
    setDate(dates[0])
    setPlaying(true)
  }

  const updateMeal = (key: MealKey, meal: Meal) => {
    setRecords((prev) => ({ ...prev, [date]: { ...(prev[date] ?? emptyDay()), [key]: meal } }))
  }

  const intake = dayIntake(day)
  const remaining = dayRemaining(day)
  const isToday = date === todayKey()

  return (
    <div className={styles.root}>
      <aside className={styles.side}>
        <div className={styles.kidCard}>
          <div className={styles.kidHeader}>
            <span className={styles.kidDate}>{formatDate(date)}</span>
            <span className={styles.kidScore}>{describeScore(score)}</span>
          </div>
          <Kid score={score} />
          <div className={styles.meter}>
            <span>瘦</span>
            <div className={styles.meterTrack}>
              <div className={styles.meterDot} style={{ left: `${((score + 1) / 2) * 100}%` }} />
            </div>
            <span>胖</span>
          </div>
          <div className={styles.preview}>
            <label className={styles.previewLabel}>
              試調體型
              <input
                type="range"
                className={styles.slider}
                min={-1}
                max={1}
                step={0.01}
                value={score}
                onChange={(e) => {
                  setPlaying(false)
                  setPreview(Number(e.target.value))
                }}
                aria-label="試調體型"
              />
            </label>
            <span className={styles.previewValue}>{score.toFixed(2)}</span>
            {preview !== null && (
              <button type="button" className={styles.todayBtn} onClick={() => setPreview(null)}>
                回到紀錄
              </button>
            )}
          </div>
          <div className={styles.playback}>
            <button
              type="button"
              className={styles.playBtn}
              onClick={() => {
                setPreview(null)
                playing ? setPlaying(false) : startPlay()
              }}
              disabled={dates.length === 0}
            >
              {playing ? '⏸ 暫停' : '▶ 播放變化'}
            </button>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={Math.max(dates.length - 1, 0)}
              value={Math.max(sliderIndex, 0)}
              disabled={dates.length === 0}
              onChange={(e) => {
                setPlaying(false)
                setPreview(null)
                setDate(dates[Number(e.target.value)])
              }}
              aria-label="時間軸"
            />
            <span className={styles.playCount}>
              {dates.length === 0 ? '尚無紀錄' : `${Math.max(sliderIndex, 0) + 1} / ${dates.length} 天`}
            </span>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.dateBar}>
          <button type="button" className={styles.navBtn} onClick={() => setDate((d) => shiftDate(d, -1))}>
            ‹
          </button>
          <div className={styles.dateText}>
            <span>{formatDate(date)}</span>
            {!isToday && (
              <button type="button" className={styles.todayBtn} onClick={() => setDate(todayKey())}>
                回今天
              </button>
            )}
          </div>
          <button type="button" className={styles.navBtn} onClick={() => setDate((d) => shiftDate(d, 1))}>
            ›
          </button>
        </header>

        <div className={styles.summary}>
          <div>
            <div className={styles.sumLabel}>今日攝取</div>
            <div className={styles.sumValue}>{intake}</div>
          </div>
          <div>
            <div className={styles.sumLabel}>基礎消耗</div>
            <div className={styles.sumValue}>− {MEAL_BURN * 3}</div>
          </div>
          <div>
            <div className={styles.sumLabel}>今日剩餘</div>
            <div className={`${styles.sumValue} ${remaining > 0 ? styles.over : styles.under}`}>
              {remaining > 0 ? `+${remaining}` : remaining}
            </div>
          </div>
        </div>

        {MEAL_KEYS.map((k) => (
          <MealCard key={k} mealKey={k} meal={day[k]} onChange={(m) => updateMeal(k, m)} />
        ))}

        <p className={styles.hint}>熱量為粗估的相對尺度(飯 1 碗 = 100、肉 1 份 = 100),不對應真實數值。</p>
      </main>
    </div>
  )
}

function describeScore(score: number): string {
  if (score > 0.6) return '圓滾滾'
  if (score > 0.25) return '有點肉肉的'
  if (score > -0.25) return '剛剛好'
  if (score > -0.6) return '有點瘦'
  return '太瘦了'
}
