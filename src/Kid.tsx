import { useEffect, useRef, useState } from 'react'
import styles from './Kid.module.css'

interface Props {
  /** 體型分數 -1(最瘦)~ 1(最胖) */
  score: number
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t

export function Kid({ score }: Props) {
  // 顯示用的分數會平滑追上目標值。SVG path 的 d 無法用 CSS transition,
  // 所以自己用 rAF 做緩動,播放時間軸時體型才會「長」出來而不是跳動。
  const [shown, setShown] = useState(score)
  const shownRef = useRef(score)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const cur = shownRef.current
      const next = Math.abs(score - cur) < 0.002 ? score : mix(cur, score, 0.12)
      shownRef.current = next
      setShown(next)
      if (next !== score) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])

  const f = shown
  const fat = Math.max(f, 0) // 只在變胖時生效的量
  const thin = Math.max(-f, 0) // 只在變瘦時生效的量

  // ---- 幾何參數 ----
  const cx = 160
  const headCy = 118
  const headRx = 56 * (1 + 0.14 * fat - 0.06 * thin)
  const headRy = 56 * (1 + 0.04 * fat)
  const jawRx = headRx * (0.86 + 0.1 * fat)
  const jawRy = headRy * (0.62 + 0.12 * fat)

  const shoulderY = 196
  const hipY = 306
  // 變胖時身體整體長成一顆蛋:肩膀微幅加寬,最寬處落在腹部(約 6 成高度),
  // 褲子寬度跟著肚子走、不急縮,衣襬微微下垂蓋過褲頭;不然最寬處卡在
  // 褲頭上方、再收進窄褲子,看起來像腰上塞了一坨。
  const shoulderHalf = 44 * (1 + 0.18 * fat - 0.14 * thin)
  const bellyY = shoulderY + (hipY - shoulderY) * 0.62
  const bellyHalf = 42 * (1 + 0.85 * fat - 0.25 * thin)
  const hipHalf = 46 * (1 + 0.62 * fat - 0.14 * thin)
  const hemDrop = 5 * fat // 衣襬下垂量

  const torso = [
    `M ${cx - shoulderHalf} ${shoulderY}`,
    `C ${cx - shoulderHalf - 2} ${shoulderY + 30}, ${cx - bellyHalf} ${bellyY - 42}, ${cx - bellyHalf} ${bellyY}`,
    `C ${cx - bellyHalf} ${bellyY + 28}, ${cx - hipHalf - 3} ${hipY - 8}, ${cx - hipHalf} ${hipY + hemDrop}`,
    `Q ${cx} ${hipY + hemDrop + 8 * fat}, ${cx + hipHalf} ${hipY + hemDrop}`,
    `C ${cx + hipHalf + 3} ${hipY - 8}, ${cx + bellyHalf} ${bellyY + 28}, ${cx + bellyHalf} ${bellyY}`,
    `C ${cx + bellyHalf} ${bellyY - 42}, ${cx + shoulderHalf + 2} ${shoulderY + 30}, ${cx + shoulderHalf} ${shoulderY}`,
    'Z',
  ].join(' ')

  const shortsY = hipY - 18
  const shortsH = 42
  const shorts = [
    `M ${cx - hipHalf + 2} ${shortsY}`,
    `L ${cx + hipHalf - 2} ${shortsY}`,
    `L ${cx + hipHalf + 4} ${shortsY + shortsH}`,
    `L ${cx + 6} ${shortsY + shortsH}`,
    `L ${cx} ${shortsY + shortsH - 8}`,
    `L ${cx - 6} ${shortsY + shortsH}`,
    `L ${cx - hipHalf - 4} ${shortsY + shortsH}`,
    'Z',
  ].join(' ')

  const armW = 15 * (1 + 0.5 * fat - 0.22 * thin)
  const legW = 19 * (1 + 0.5 * fat - 0.22 * thin)
  const legX = hipHalf * 0.48
  const legTop = shortsY + shortsH - 6
  const legBottom = 396

  // 手臂:肩膀起、往外撐開到肚子旁邊,肚子越大手張得越開
  const armStartX = shoulderHalf - 4
  const armStartY = shoulderY + 12
  const armEndX = bellyHalf + 16
  const armEndY = bellyY + 26

  // 表情:越胖笑得越開,太瘦就有點沒精神
  const mouthCurve = 14 + 8 * fat - 12 * thin
  const eyeRy = 7.5 * (1 - 0.25 * fat)

  const hairPath = [
    `M ${cx - headRx - 4} ${headCy - 4}`,
    `C ${cx - headRx - 6} ${headCy - 50}, ${cx - 30} ${headCy - 76}, ${cx + 4} ${headCy - 72}`,
    `C ${cx + 40} ${headCy - 78}, ${cx + headRx + 6} ${headCy - 50}, ${cx + headRx + 4} ${headCy - 4}`,
    `C ${cx + headRx - 8} ${headCy - 22}, ${cx + 36} ${headCy - 34}, ${cx + 18} ${headCy - 30}`,
    `C ${cx + 8} ${headCy - 44}, ${cx - 6} ${headCy - 46}, ${cx - 16} ${headCy - 30}`,
    `C ${cx - 34} ${headCy - 34}, ${cx - headRx + 8} ${headCy - 20}, ${cx - headRx - 4} ${headCy - 4} Z`,
  ].join(' ')

  const cowlick = [
    `M ${cx + 2} ${headCy - 70}`,
    `C ${cx + 6} ${headCy - 92}, ${cx + 26} ${headCy - 96}, ${cx + 30} ${headCy - 84}`,
    `C ${cx + 18} ${headCy - 86}, ${cx + 10} ${headCy - 78}, ${cx + 2} ${headCy - 70} Z`,
  ].join(' ')

  return (
    <div className={styles.wrap}>
      <svg viewBox="0 0 320 440" className={styles.svg} role="img" aria-label="小孩體型示意">
        <defs>
          <radialGradient id="skin" cx="45%" cy="38%" r="70%">
            <stop offset="0" stopColor="#ffe3cf" />
            <stop offset="1" stopColor="#f2b892" />
          </radialGradient>
          <linearGradient id="shirt" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#ffd45c" />
            <stop offset="1" stopColor="#f2a83b" />
          </linearGradient>
          <linearGradient id="shorts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5f8fd6" />
            <stop offset="1" stopColor="#3f6bb3" />
          </linearGradient>
          <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5b3a29" />
            <stop offset="1" stopColor="#3a2417" />
          </linearGradient>
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#7a5a3c" stopOpacity="0.35" />
            <stop offset="1" stopColor="#7a5a3c" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 地面陰影 */}
        <ellipse cx={cx} cy={412} rx={70 + 30 * fat} ry={12} fill="url(#shadow)" />

        <g className={styles.bob}>
          {/* 腿 */}
          <g stroke="#f2b892" strokeWidth={legW} strokeLinecap="round">
            <line x1={cx - legX} y1={legTop} x2={cx - legX} y2={legBottom} />
            <line x1={cx + legX} y1={legTop} x2={cx + legX} y2={legBottom} />
          </g>
          {/* 鞋 */}
          <g fill="#e05252">
            <ellipse cx={cx - legX - 3} cy={legBottom + 4} rx={legW * 0.85} ry={9} />
            <ellipse cx={cx + legX + 3} cy={legBottom + 4} rx={legW * 0.85} ry={9} />
          </g>
          <g fill="#fff" opacity="0.9">
            <ellipse cx={cx - legX - 3} cy={legBottom + 8} rx={legW * 0.75} ry={3.5} />
            <ellipse cx={cx + legX + 3} cy={legBottom + 8} rx={legW * 0.75} ry={3.5} />
          </g>

          {/* 手臂 */}
          <g strokeLinecap="round">
            <line
              x1={cx - armStartX}
              y1={armStartY}
              x2={cx - armEndX}
              y2={armEndY}
              stroke="#f2b892"
              strokeWidth={armW}
            />
            <line
              x1={cx + armStartX}
              y1={armStartY}
              x2={cx + armEndX}
              y2={armEndY}
              stroke="#f2b892"
              strokeWidth={armW}
            />
            {/* 袖子:沿手臂方向、只蓋上半段 */}
            <line
              x1={cx - armStartX}
              y1={armStartY - 2}
              x2={cx - mix(armStartX, armEndX, 0.35)}
              y2={mix(armStartY, armEndY, 0.35)}
              stroke="#f2a83b"
              strokeWidth={armW + 8}
            />
            <line
              x1={cx + armStartX}
              y1={armStartY - 2}
              x2={cx + mix(armStartX, armEndX, 0.35)}
              y2={mix(armStartY, armEndY, 0.35)}
              stroke="#f2a83b"
              strokeWidth={armW + 8}
            />
          </g>

          {/* 褲子(畫在衣服後面,衣襬才能蓋過褲頭) */}
          <path d={shorts} fill="url(#shorts)" />
          {/* 身體 */}
          <path d={torso} fill="url(#shirt)" />
          {/* 衣服上的小圖案,跟著肚子一起往下、變大 */}
          <circle cx={cx} cy={shoulderY + 52 + 10 * fat} r={12 + 5 * fat} fill="#fff" opacity="0.85" />
          <circle cx={cx} cy={shoulderY + 52 + 10 * fat} r={6 + 2.5 * fat} fill="#e05252" opacity="0.9" />

          {/* 脖子 */}
          <rect
            x={cx - 12 - 6 * fat}
            y={headCy + headRy - 12}
            width={24 + 12 * fat}
            height={26}
            rx={8}
            fill="#f2b892"
          />

          {/* 頭 + 下巴/臉頰 */}
          <ellipse cx={cx} cy={headCy} rx={headRx} ry={headRy} fill="url(#skin)" />
          <ellipse cx={cx} cy={headCy + 22 + 4 * fat} rx={jawRx} ry={jawRy} fill="url(#skin)" />

          {/* 耳朵 */}
          <ellipse cx={cx - headRx + 2} cy={headCy + 6} rx={9} ry={12} fill="#f5c3a2" />
          <ellipse cx={cx + headRx - 2} cy={headCy + 6} rx={9} ry={12} fill="#f5c3a2" />

          {/* 頭髮 */}
          <path d={hairPath} fill="url(#hair)" />
          <path d={cowlick} fill="url(#hair)" />

          {/* 眼睛 */}
          <ellipse cx={cx - 22} cy={headCy + 4} rx={7} ry={eyeRy} fill="#2b1d16" />
          <ellipse cx={cx + 22} cy={headCy + 4} rx={7} ry={eyeRy} fill="#2b1d16" />
          <circle cx={cx - 19.5} cy={headCy + 1} r={2.4} fill="#fff" />
          <circle cx={cx + 24.5} cy={headCy + 1} r={2.4} fill="#fff" />

          {/* 眉毛 */}
          <g stroke="#4a3223" strokeWidth={2.5} strokeLinecap="round" fill="none">
            <path d={`M ${cx - 30} ${headCy - 12 + 2 * thin} q 8 ${-4 + 3 * thin} 16 ${2 * thin}`} />
            <path d={`M ${cx + 14} ${headCy - 12 + 4 * thin} q 8 ${-4 + 3 * thin} 16 ${-2 * thin}`} />
          </g>

          {/* 腮紅 */}
          <ellipse
            cx={cx - 36 - 6 * fat}
            cy={headCy + 24}
            rx={10 + 4 * fat}
            ry={5.5}
            fill="#ff8a80"
            opacity={0.45 + 0.25 * fat}
          />
          <ellipse
            cx={cx + 36 + 6 * fat}
            cy={headCy + 24}
            rx={10 + 4 * fat}
            ry={5.5}
            fill="#ff8a80"
            opacity={0.45 + 0.25 * fat}
          />

          {/* 嘴巴 */}
          <path
            d={`M ${cx - 12 - 4 * fat} ${headCy + 30} q ${12 + 4 * fat} ${mouthCurve} ${24 + 8 * fat} 0`}
            fill={mouthCurve > 8 ? '#c94d4d' : 'none'}
            stroke="#8a3b3b"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* 太瘦時的汗滴 */}
          {thin > 0.4 && (
            <path
              d={`M ${cx + headRx - 6} ${headCy - 26} q 6 10 0 16 q -6 -6 0 -16 Z`}
              fill="#7ec8ff"
              opacity={Math.min(1, (thin - 0.4) * 3)}
            />
          )}
        </g>
      </svg>
    </div>
  )
}
