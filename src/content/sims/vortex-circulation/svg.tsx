/**
 * Small SVG helpers shared by the vortex-circulation diagrams and simulations.
 * Everything is drawn in a fixed viewBox (responsive via `w-full h-auto`) with theme-aware CSS variables.
 */

export type Pt = [number, number]

/** Format a coordinate for an SVG path. */
export const f2 = (v: number) => (Number.isFinite(v) ? v.toFixed(2) : '0')

/** Arrow-head markers in user-space units. Reference them as `url(#<id>-<key>)`. */
export function ArrowDefs({ id, colors, size = 7 }: { id: string; colors: Record<string, string>; size?: number }) {
  return (
    <defs>
      {Object.entries(colors).map(([k, c]) => (
        <marker
          key={k}
          id={`${id}-${k}`}
          viewBox="0 0 10 10"
          refX="8.6"
          refY="5"
          markerWidth={size}
          markerHeight={size}
          orient="auto-start-reverse"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0 0L10 5L0 10z" fill={c} />
        </marker>
      ))}
    </defs>
  )
}

/** Filled triangle centred on (x, y) pointing along (dx, dy) — used for flow-direction arrowheads on streamlines. */
export function Chevron({ x, y, dx, dy, size = 5.5, fill }: { x: number; y: number; dx: number; dy: number; size?: number; fill: string }) {
  const L = Math.hypot(dx, dy) || 1
  const ux = dx / L
  const uy = dy / L
  const nx = -uy
  const ny = ux
  const tip: Pt = [x + ux * size, y + uy * size]
  const b1: Pt = [x - ux * size * 0.7 + nx * size * 0.65, y - uy * size * 0.7 + ny * size * 0.65]
  const b2: Pt = [x - ux * size * 0.7 - nx * size * 0.65, y - uy * size * 0.7 - ny * size * 0.65]
  return <path d={`M${f2(tip[0])} ${f2(tip[1])}L${f2(b1[0])} ${f2(b1[1])}L${f2(b2[0])} ${f2(b2[1])}Z`} fill={fill} />
}

/**
 * Screen-space helper for polar drawings: centre (cx, cy) in px, `s` px per unit radius.
 * Angles are mathematical (counter-clockwise from +x); the SVG y axis points down.
 */
export function polarFrame(cx: number, cy: number, s: number) {
  const P = (r: number, th: number): Pt => [cx + s * r * Math.cos(th), cy - s * r * Math.sin(th)]
  /** Arc of radius r from th1 to th2 (counter-clockwise on screen when th2 > th1). */
  const arc = (r: number, th1: number, th2: number) => {
    const [x1, y1] = P(r, th1)
    const [x2, y2] = P(r, th2)
    const large = Math.abs(th2 - th1) > Math.PI ? 1 : 0
    const sweep = th2 > th1 ? 0 : 1
    return `M${f2(x1)} ${f2(y1)}A${f2(s * r)} ${f2(s * r)} 0 ${large} ${sweep} ${f2(x2)} ${f2(y2)}`
  }
  /** Screen direction of the counter-clockwise tangent at angle th. */
  const ccw = (th: number): Pt => [-Math.sin(th), -Math.cos(th)]
  return { P, arc, ccw }
}

/** Polyline path through points. */
export function polyPath(pts: Pt[], close = false): string {
  if (!pts.length) return ''
  let d = `M${f2(pts[0][0])} ${f2(pts[0][1])}`
  for (let i = 1; i < pts.length; i++) d += `L${f2(pts[i][0])} ${f2(pts[i][1])}`
  return close ? `${d}Z` : d
}

/** Wrap an angle in degrees to (−180, 180]. */
export function wrapDeg(a: number): number {
  let x = ((a + 180) % 360 + 360) % 360 - 180
  if (x === -180) x = 180
  return x
}
