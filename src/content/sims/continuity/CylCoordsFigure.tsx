import { useState } from 'react'
import { Md, Slider, md, useUid } from '@/kit'
import { AX, ArrowMarkers, tn } from './shared'

/*
 * Cylindrical polar coordinates (r, θ, z) — recreation of the Lec 9 slide 11 sketch, made interactive.
 * Oblique projection: x right, y up, z toward the viewer (drawn down-left).
 */
const OX = 205
const OY = 200
const S = 88
const KX = 0.62
const KY = 0.45
const ZP = 1.3
const P3 = (x: number, y: number, z: number): [number, number] => [OX + S * (x - KX * z), OY - S * (y - KY * z)]

function Label({ at, base, sub, color, size = 15, anchor = 'middle' }: { at: [number, number]; base: string; sub?: string; color?: string; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text
      x={at[0]}
      y={at[1]}
      textAnchor={anchor}
      fontSize={size}
      fontStyle="italic"
      fontWeight={600}
      fill={color ?? 'var(--ink)'}
      paintOrder="stroke"
      stroke="var(--surface)"
      strokeWidth={3}
    >
      {base}
      {sub ? (
        <tspan fontSize={size * 0.72} dy={size * 0.3}>
          {sub}
        </tspan>
      ) : null}
    </text>
  )
}

export function CylCoordsFigure() {
  const [thDeg, setThDeg] = useState(35)
  const [r, setR] = useState(1.2)
  const uid = useUid('cyl')
  const th = (thDeg * Math.PI) / 180
  const c = Math.cos(th)
  const s = Math.sin(th)
  const B = P3(0, 0, ZP)
  const P = P3(r * c, r * s, ZP)
  const Q = P3(r * c, 0, ZP)
  const Q0 = P3(r * c, 0, 0)
  const ref = P3(Math.max(r * c, 0) + 0.45, 0, ZP)
  const arcR = 0.32 * S
  const arc = `M${B[0] + arcR} ${B[1]} A${arcR} ${arcR} 0 0 0 ${B[0] + arcR * c} ${B[1] - arcR * s}`
  const L = 0.55
  const tip = (dx: number, dy: number, dz: number) => P3(r * c + L * dx, r * s + L * dy, ZP + L * dz)
  const er = tip(c, s, 0)
  const et = tip(-s, c, 0)
  const ez = tip(0, 0, 1)
  // circle of radius r in the plane z = ZP (true shape in oblique projection)
  const circle = { cx: B[0], cy: B[1], R: r * S }
  // unit-vector triad inset
  const T: [number, number] = [352, 66]
  const tl = 40
  const zx = -KX
  const zy = KY
  const zn = Math.hypot(zx, zy)

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 420 300" className="mx-auto block h-auto w-full max-w-[580px]" role="img" aria-label="Cylindrical polar coordinates r, theta, z with velocity components">
        <defs>
          <ArrowMarkers id={uid} colors={{ ax: 'var(--ink-2)', r: AX.x, t: AX.pos, z: AX.z }} size={4} />
          <clipPath id={`${uid}-clip`}>
            <rect x={0} y={0} width={420} height={300} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${uid}-clip)`}>
          {/* axes */}
          <line x1={OX} y1={OY} x2={P3(2.3, 0, 0)[0]} y2={OY} stroke="var(--ink-2)" strokeWidth={1.5} markerEnd={`url(#${uid}-ax)`} />
          <line x1={OX} y1={OY} x2={OX} y2={P3(0, 1.85, 0)[1]} stroke="var(--ink-2)" strokeWidth={1.5} markerEnd={`url(#${uid}-ax)`} />
          <line x1={OX} y1={OY} x2={P3(0, 0, 2.15)[0]} y2={P3(0, 0, 2.15)[1]} stroke="var(--ink-2)" strokeWidth={1.5} markerEnd={`url(#${uid}-ax)`} />
          <Label at={[P3(2.3, 0, 0)[0] - 4, OY + 18]} base="x" color="var(--ink-2)" />
          <Label at={[OX - 12, P3(0, 1.85, 0)[1] + 8]} base="y" color="var(--ink-2)" />
          <Label at={[P3(0, 0, 2.15)[0] + 14, P3(0, 0, 2.15)[1] - 2]} base="z" color="var(--ink-2)" />

          {/* circle r = const in the plane of P, reference line, construction lines */}
          <circle cx={circle.cx} cy={circle.cy} r={circle.R} fill="none" stroke="var(--ink-3)" strokeDasharray="2 4" strokeWidth={1} />
          <line x1={B[0]} y1={B[1]} x2={ref[0]} y2={ref[1]} stroke="var(--ink-3)" strokeDasharray="5 4" strokeWidth={1.2} />
          <line x1={P[0]} y1={P[1]} x2={Q[0]} y2={Q[1]} stroke="var(--ink-3)" strokeDasharray="5 4" strokeWidth={1.2} />
          <line x1={Q[0]} y1={Q[1]} x2={Q0[0]} y2={Q0[1]} stroke="var(--ink-3)" strokeDasharray="5 4" strokeWidth={1.2} />
          <path d={arc} fill="none" stroke="var(--ink-2)" strokeWidth={1.4} markerEnd={`url(#${uid}-ax)`} />
          <Label at={[B[0] + (arcR + 14) * Math.cos(th / 2), B[1] - (arcR + 14) * Math.sin(th / 2) + 5]} base="θ" size={14} />

          {/* radius line */}
          <line x1={B[0]} y1={B[1]} x2={P[0]} y2={P[1]} stroke="var(--ink)" strokeWidth={1.8} />
          <Label at={[(B[0] + P[0]) / 2 - 10 * s, (B[1] + P[1]) / 2 - 10 * c + 4]} base="r" size={15} />
          <circle cx={B[0]} cy={B[1]} r={2.5} fill="var(--ink-2)" />

          {/* velocity components at P */}
          <line x1={P[0]} y1={P[1]} x2={er[0]} y2={er[1]} stroke={AX.x} strokeWidth={3} markerEnd={`url(#${uid}-r)`} />
          <line x1={P[0]} y1={P[1]} x2={et[0]} y2={et[1]} stroke={AX.pos} strokeWidth={3} markerEnd={`url(#${uid}-t)`} />
          <line x1={P[0]} y1={P[1]} x2={ez[0]} y2={ez[1]} stroke={AX.z} strokeWidth={3} markerEnd={`url(#${uid}-z)`} />
          <circle cx={P[0]} cy={P[1]} r={4} fill="var(--ink)" />
          <Label at={[P[0] + 10, P[1] + 19]} base="P" size={14} />
          <Label at={[er[0] + 14 * c, er[1] - 14 * s + 4]} base="v" sub="r" color={AX.x} />
          <Label at={[et[0] - 12 * s, et[1] - 12 * c + 2]} base="v" sub="θ" color={AX.pos} />
          <Label at={[ez[0] - 14, ez[1] + 10]} base="v" sub="z" color={AX.z} />

          {/* unit vector triad inset */}
          <g>
            <rect x={T[0] - 58} y={T[1] - 56} width={116} height={112} rx={10} fill="var(--surface)" stroke="var(--line)" />
            <line x1={T[0]} y1={T[1]} x2={T[0] + tl * c} y2={T[1] - tl * s} stroke={AX.x} strokeWidth={2.2} markerEnd={`url(#${uid}-r)`} />
            <line x1={T[0]} y1={T[1]} x2={T[0] - tl * s} y2={T[1] - tl * c} stroke={AX.pos} strokeWidth={2.2} markerEnd={`url(#${uid}-t)`} />
            <line x1={T[0]} y1={T[1]} x2={T[0] + (tl * zx) / zn} y2={T[1] + (tl * zy) / zn} stroke={AX.z} strokeWidth={2.2} markerEnd={`url(#${uid}-z)`} />
            <circle cx={T[0]} cy={T[1]} r={2.5} fill="var(--ink)" />
            <Label at={[T[0] + (tl + 12) * c, T[1] - (tl + 12) * s + 5]} base="ê" sub="r" color={AX.x} size={13} />
            <Label at={[T[0] - (tl + 12) * s, T[1] - (tl + 12) * c + 5]} base="ê" sub="θ" color={AX.pos} size={13} />
            <Label at={[T[0] + ((tl + 6) * zx) / zn - 8, T[1] + ((tl + 6) * zy) / zn + 8]} base="ê" sub="z" color={AX.z} size={13} />
          </g>
        </g>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={md`angle $\theta$`} value={thDeg} min={5} max={120} step={1} onChange={setThDeg} unit="°" digits={3} format={(v) => v.toFixed(0)} />
        <Slider label="radius $r$" value={r} min={0.6} max={1.6} step={0.05} onChange={setR} unit="m" digits={3} />
      </div>
      <Md className="md-tight text-sm text-ink-2">
        {md`$\hat{\mathbf e}_r = (\cos\theta,\ \sin\theta,\ 0) = (${tn(c, 3)},\ ${tn(s, 3)},\ 0)$, $\quad \hat{\mathbf e}_\theta = (-\sin\theta,\ \cos\theta,\ 0) = (${tn(-s, 3)},\ ${tn(c, 3)},\ 0)$, $\quad \hat{\mathbf e}_z = (0, 0, 1)$ in $(\hat{\mathbf i}, \hat{\mathbf j}, \hat{\mathbf k})$ components. Move $\theta$: $\hat{\mathbf e}_r$ and $\hat{\mathbf e}_\theta$ **turn with the point** — that is why the cylindrical equations are not just the Cartesian ones with new letters.`}
      </Md>
    </div>
  )
}
