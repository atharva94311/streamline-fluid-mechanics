/** Tiny SVG helpers for the turbulent-jet diagrams (no <marker> ids, theme-aware colours). */

/** Arrow from (x1,y1) to (x2,y2) with a filled head; `both` draws a head at each end. */
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
}) {
  const L = Math.hypot(x2 - x1, y2 - y1)
  if (L < 0.5) return null
  const ux = (x2 - x1) / L
  const uy = (y2 - y1) / L
  const h = Math.min(head, L * 0.6)
  const tri = (tx: number, ty: number, dx: number, dy: number) =>
    `${tx},${ty} ${tx - dx * h - dy * h * 0.45},${ty - dy * h + dx * h * 0.45} ${tx - dx * h + dy * h * 0.45},${ty - dy * h - dx * h * 0.45}`
  return (
    <g>
      <line
        x1={both ? x1 + ux * h * 0.8 : x1}
        y1={both ? y1 + uy * h * 0.8 : y1}
        x2={x2 - ux * h * 0.8}
        y2={y2 - uy * h * 0.8}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
      />
      <polygon points={tri(x2, y2, ux, uy)} fill={color} />
      {both ? <polygon points={tri(x1, y1, -ux, -uy)} fill={color} /> : null}
    </g>
  )
}

/** Text label with an optional subscript, e.g. <Lbl t="v̄" sub="x" />. */
export function Lbl({
  x,
  y,
  t,
  sub,
  sup,
  size = 13,
  anchor = 'start',
  fill = 'var(--ink-2)',
  weight,
  italic,
}: {
  x: number
  y: number
  t: string
  sub?: string
  sup?: string
  size?: number
  anchor?: 'start' | 'middle' | 'end'
  fill?: string
  weight?: number | string
  italic?: boolean
}) {
  return (
    <text x={x} y={y} fontSize={size} textAnchor={anchor} fill={fill} fontWeight={weight} fontStyle={italic ? 'italic' : undefined}>
      {t}
      {sup ? (
        <tspan dy={-size * 0.4} fontSize={size * 0.72}>
          {sup}
        </tspan>
      ) : null}
      {sub ? (
        <tspan dy={sup ? size * 0.75 : size * 0.32} fontSize={size * 0.72}>
          {sub}
        </tspan>
      ) : null}
    </text>
  )
}

/** Boxed label as in Wilkes' figures. */
export function BoxLabel({ x, y, text, size = 12, anchor = 'middle' }: { x: number; y: number; text: string; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  const w = text.length * size * 0.56 + 12
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x
  return (
    <g>
      <rect x={x0} y={y - size - 3} width={w} height={size + 9} rx={4} fill="var(--surface)" stroke="var(--line)" />
      <text x={x0 + w / 2} y={y} fontSize={size} textAnchor="middle" fill="var(--ink)">
        {text}
      </text>
    </g>
  )
}
