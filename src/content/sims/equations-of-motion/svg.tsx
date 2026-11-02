/**
 * Small SVG helpers shared by the equations-of-motion diagrams and simulations.
 * Colours are always CSS variables so every drawing follows the light/dark theme.
 */

/** Family colours used consistently across the topic. */
export const COL = {
  normal: 'var(--plot-1)', // σ_xx — normal stress (indigo)
  shearY: 'var(--plot-2)', // τ_yx — shear on the y-faces (cyan)
  shearZ: 'var(--plot-6)', // τ_zx — shear on the z-faces (violet)
  body: 'var(--plot-3)', // gravity / body force (amber)
  net: 'var(--plot-4)', // net force / pressure (rose)
  accel: 'var(--plot-5)', // acceleration (emerald)
}

/** Straight arrow with a filled triangular head. */
export function Arrow({
  x1, y1, x2, y2, color = 'var(--ink)', width = 2, dash, head = 9, opacity,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
  width?: number
  dash?: string
  head?: number
  opacity?: number
}) {
  const dx = x2 - x1
  const dy = y2 - y1
  const L = Math.hypot(dx, dy)
  if (!Number.isFinite(L) || L < 0.5) return null
  const ux = dx / L
  const uy = dy / L
  const h = Math.min(head, L * 0.75)
  const bx = x2 - ux * h
  const by = y2 - uy * h
  const w = h * 0.5
  return (
    <g opacity={opacity}>
      <line
        x1={x1}
        y1={y1}
        x2={bx}
        y2={by}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap={dash ? 'butt' : 'round'}
      />
      <polygon points={`${x2},${y2} ${bx - uy * w},${by + ux * w} ${bx + uy * w},${by - ux * w}`} fill={color} />
    </g>
  )
}

/**
 * Horizontal arrow from x1 to x2 at height y. The part that lies inside `hidden` = [xa, xb] is drawn dashed
 * (it is behind a face of the cube), the rest solid — exactly like the hidden-line convention on the slide.
 */
export function HArrow({
  x1, x2, y, color, width = 2.4, head = 10, hidden, allHidden = false,
}: {
  x1: number
  x2: number
  y: number
  color: string
  width?: number
  head?: number
  hidden?: [number, number]
  allHidden?: boolean
}) {
  const L = Math.abs(x2 - x1)
  if (!Number.isFinite(L) || L < 1) return null
  const dir = Math.sign(x2 - x1)
  const h = Math.min(head, L * 0.75)
  const xb = x2 - dir * h // base of the head
  const lo = Math.min(x1, xb)
  const hi = Math.max(x1, xb)
  const segs: { a: number; b: number; dashed: boolean }[] = []
  if (allHidden) segs.push({ a: lo, b: hi, dashed: true })
  else if (!hidden) segs.push({ a: lo, b: hi, dashed: false })
  else {
    const [ha, hb] = hidden
    const cut = (a: number, b: number, dashed: boolean) => {
      if (b - a > 0.5) segs.push({ a, b, dashed })
    }
    cut(lo, Math.min(hi, ha), false)
    cut(Math.max(lo, ha), Math.min(hi, hb), true)
    cut(Math.max(lo, hb), hi, false)
  }
  const w = h * 0.5
  return (
    <g>
      {segs.map((s, i) => (
        <line
          key={i}
          x1={s.a}
          x2={s.b}
          y1={y}
          y2={y}
          stroke={color}
          strokeWidth={width}
          strokeDasharray={s.dashed ? '6 4' : undefined}
          strokeLinecap={s.dashed ? 'butt' : 'round'}
        />
      ))}
      <polygon points={`${x2},${y} ${xb},${y - w} ${xb},${y + w}`} fill={color} />
    </g>
  )
}

function splitSub(text: string): { t: string; sub: boolean }[] {
  const out: { t: string; sub: boolean }[] = []
  const re = /_\{([^}]*)\}|_([A-Za-z0-9]+)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ t: text.slice(last, m.index), sub: false })
    out.push({ t: m[1] ?? m[2], sub: true })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ t: text.slice(last), sub: false })
  return out
}

/**
 * SVG text with simple subscripts: `σ_xx`, `δF_{bx} = δm g_x`.
 * `halo` paints a surface-coloured outline so labels stay legible over lines.
 */
export function SubText({
  x, y, text, size = 13, anchor = 'start', italic = false, fill = 'var(--ink)', weight, halo = false,
}: {
  x: number
  y: number
  text: string
  size?: number
  anchor?: 'start' | 'middle' | 'end'
  italic?: boolean
  fill?: string
  weight?: number
  halo?: boolean
}) {
  const parts = splitSub(text)
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      fill={fill}
      fontStyle={italic ? 'italic' : undefined}
      fontWeight={weight}
      paintOrder={halo ? 'stroke' : undefined}
      stroke={halo ? 'var(--surface)' : undefined}
      strokeWidth={halo ? 3.5 : undefined}
      strokeLinejoin={halo ? 'round' : undefined}
    >
      {parts.map((p, i) => {
        const prev = i > 0 ? parts[i - 1].sub : false
        const dy = ((p.sub ? 1 : 0) - (prev ? 1 : 0)) * size * 0.32
        return (
          <tspan key={i} dy={dy !== 0 ? dy : undefined} fontSize={p.sub ? size * 0.72 : undefined}>
            {p.t}
          </tspan>
        )
      })}
    </text>
  )
}

/** Small numbered tag (circle + number) used to key arrows to a legend table. */
export function Tag({ x, y, n, color }: { x: number; y: number; n: number | string; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill="var(--surface)" stroke={color} strokeWidth={1.8} />
      <text x={x} y={y} dy="0.35em" textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>
        {n}
      </text>
    </g>
  )
}
