/**
 * Small SVG helpers for the mixing-length diagrams: labels with sub/superscripts
 * (plain SVG text, no foreignObject) and arrows with drawn heads (no <marker> ids needed).
 */

type Seg = { t: string; k: 'n' | 'sub' | 'sup' }

/** Parse "v̄_x", "v'_y", "τ^t_{yx}", "λ dv̄_x/dy" into normal / subscript / superscript runs. */
function parse(s: string): Seg[] {
  const out: Seg[] = []
  let buf = ''
  const flush = () => {
    if (buf) out.push({ t: buf, k: 'n' })
    buf = ''
  }
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if ((c === '_' || c === '^') && i + 1 < s.length) {
      flush()
      let t: string
      if (s[i + 1] === '{') {
        const j = s.indexOf('}', i + 2)
        const end = j < 0 ? s.length : j
        t = s.slice(i + 2, end)
        i = end
      } else {
        t = s[i + 1]
        i += 1
        while (i + 1 < s.length && /[̀-ͯ]/.test(s[i + 1])) {
          t += s[i + 1]
          i += 1
        }
      }
      out.push({ t, k: c === '_' ? 'sub' : 'sup' })
    } else buf += c
  }
  flush()
  return out
}

/** SVG text with simple TeX-like sub/superscripts: `_x`, `_{yx}`, `^t`, `^{+}`. Use "v̄" for v̄. */
export function SvgTex({
  x,
  y,
  s,
  size = 12,
  anchor = 'start',
  className = 'fill-ink-2',
  weight,
  fill,
}: {
  x: number
  y: number
  s: string
  size?: number
  anchor?: 'start' | 'middle' | 'end'
  className?: string
  weight?: number | string
  fill?: string
}) {
  const segs = parse(s)
  const shift = { n: 0, sub: size * 0.32, sup: -size * 0.42 }
  let cur = 0
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} className={fill ? undefined : className} fill={fill} fontWeight={weight}>
      {segs.map((g, i) => {
        const target = shift[g.k]
        const dy = target - cur
        cur = target
        return (
          <tspan key={i} dy={dy !== 0 ? dy : undefined} fontSize={g.k === 'n' ? undefined : size * 0.72}>
            {g.t}
          </tspan>
        )
      })}
    </text>
  )
}

/** Straight arrow with a filled head (optionally double-headed). Colours may be CSS variables. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = 'var(--ink-2)',
  width = 1.6,
  head = 7,
  both = false,
  dash,
  opacity,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
  width?: number
  head?: number
  both?: boolean
  dash?: string
  opacity?: number
}) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 0.5) return null
  const a = Math.atan2(y2 - y1, x2 - x1)
  const h = Math.min(head, len * 0.6)
  const tri = (x: number, y: number, ang: number) =>
    [
      [x, y],
      [x - h * Math.cos(ang - 0.42), y - h * Math.sin(ang - 0.42)],
      [x - h * Math.cos(ang + 0.42), y - h * Math.sin(ang + 0.42)],
    ]
      .map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`)
      .join(' ')
  // pull the line ends back so they do not poke through the heads
  const back = h * 0.8
  const lx2 = x2 - back * Math.cos(a)
  const ly2 = y2 - back * Math.sin(a)
  const lx1 = both ? x1 + back * Math.cos(a) : x1
  const ly1 = both ? y1 + back * Math.sin(a) : y1
  return (
    <g opacity={opacity}>
      <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <polygon points={tri(x2, y2, a)} fill={color} />
      {both ? <polygon points={tri(x1, y1, a + Math.PI)} fill={color} /> : null}
    </g>
  )
}
