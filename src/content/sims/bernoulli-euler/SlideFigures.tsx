/**
 * Recreations of the sketches on Lecture 10, slides 9–10: (a) a streamline with arc-length element ds,
 * (b) the vector line element ds along a streamline, (c) gravity written as g = −g∇z and
 * (d) the geometry of V × (∇ × V) — perpendicular to the plane that contains V and ∇ × V.
 */
import type { ReactNode } from 'react'
import { Arrow, Label, RightAngle } from './shared'

const AXIS = 'var(--plot-3)'

function Panel({ title, children, label }: { title: string; children: ReactNode; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2/50 p-2">
      <div className="mb-1 px-1 text-xs font-semibold text-ink-2">{title}</div>
      <svg viewBox="0 0 300 210" className="block h-auto w-full" role="img" aria-label={label}>
        {children}
      </svg>
    </div>
  )
}

/** Oblique axis triad: z up, y to the right, x toward the viewer (down-left). */
function Triad({ ox, oy, z, y, x, color = AXIS }: { ox: number; oy: number; z: number; y: number; x: number; color?: string }) {
  const xd: [number, number] = [-0.8 * x, 0.6 * x]
  return (
    <g stroke={color} strokeWidth={1.3} opacity={0.85}>
      <line x1={ox} y1={oy} x2={ox} y2={oy - z} />
      <line x1={ox} y1={oy} x2={ox + y} y2={oy} />
      <line x1={ox} y1={oy} x2={ox + xd[0]} y2={oy + xd[1]} />
      <g stroke="none" fill="var(--ink-3)" fontSize={13} fontStyle="italic">
        <text x={ox - 13} y={oy - z + 10}>z</text>
        <text x={ox + y - 2} y={oy + 15}>y</text>
        <text x={ox + xd[0] - 12} y={oy + xd[1] + 4}>x</text>
      </g>
    </g>
  )
}

export function StreamlineArcPanel() {
  return (
    <Panel title="(a) A streamline and its arc length ds" label="streamline with arc-length element ds">
      <Triad ox={78} oy={160} z={110} y={135} x={55} />
      <path d="M88,118 C150,110 190,52 285,42" fill="none" stroke="var(--plot-3)" strokeWidth={2.4} />
      <Arrow x1={229.5} y1={54.5} x2={258} y2={46.3} color="var(--plot-3)" width={4} head={10} />
      <Label x={238} y={72} italic size={15} color="var(--ink)">ds</Label>
      <Label x={205} y={24} size={13} color="var(--plot-3)" weight={600}>Streamline</Label>
      <Label x={14} y={20} size={11} color="var(--ink-3)">ds: a short length measured</Label>
      <Label x={14} y={34} size={11} color="var(--ink-3)">along the streamline</Label>
    </Panel>
  )
}

export function StreamlineVectorPanel() {
  return (
    <Panel title="(b) The vector line element ds" label="vector line element ds along a streamline">
      <Triad ox={62} oy={175} z={70} y={85} x={40} />
      <path d="M175,15 C215,40 245,90 255,200" fill="none" stroke="var(--plot-3)" strokeWidth={2.4} />
      <Arrow x1={217.6} y1={59.2} x2={235.5} y2={98.7} color="var(--plot-3)" width={5} head={12} />
      <Label x={244} y={78} size={15} weight={800} color="var(--ink)">
        <tspan fontStyle="italic" fontWeight={500}>d</tspan>s
      </Label>
      <line x1={210} y1={22} x2={194} y2={28} stroke="var(--plot-3)" strokeWidth={1} />
      <Label x={212} y={22} size={13} color="var(--plot-3)" weight={600}>Streamline</Label>
      <Label x={12} y={30} size={13} color="var(--ink)">
        <tspan fontStyle="italic">d</tspan>
        <tspan fontWeight={800}>s</tspan> = <tspan fontStyle="italic">dx</tspan> î + <tspan fontStyle="italic">dy</tspan> ĵ + <tspan fontStyle="italic">dz</tspan> k̂
      </Label>
      <Label x={12} y={50} size={12} color="var(--ink-2)">tangent to the streamline,</Label>
      <Label x={12} y={66} size={12} color="var(--ink-2)">
        so <tspan fontStyle="italic">d</tspan>
        <tspan fontWeight={800}>s</tspan> points along <tspan fontWeight={800}>V</tspan>
      </Label>
    </Panel>
  )
}

export function GravityPanel() {
  return (
    <Panel title="(c) Gravity written as a gradient" label="gravity vector pointing in minus z">
      <Triad ox={120} oy={140} z={115} y={150} x={60} color="var(--plot-2)" />
      <Arrow x1={160} y1={40} x2={160} y2={100} color="var(--plot-2)" width={3} head={11} />
      <Label x={168} y={74} size={16} weight={800} color="var(--plot-2)">g</Label>
      <Label x={14} y={70} size={17} weight={600} color="var(--plot-5)">
        <tspan fontWeight={800}>g</tspan> = −<tspan fontStyle="italic">g</tspan>∇<tspan fontStyle="italic">z</tspan>
      </Label>
      <Label x={168} y={176} size={13} color="var(--ink-2)">
        <tspan fontWeight={800}>g</tspan> = −<tspan fontStyle="italic">g</tspan>∇<tspan fontStyle="italic">z</tspan>
      </Label>
      <Label x={180} y={196} size={13} color="var(--ink-2)">
        = 0î + 0ĵ − <tspan fontStyle="italic">g</tspan>k̂
      </Label>
    </Panel>
  )
}

export function LambGeometryPanel() {
  const O: [number, number] = [105, 150]
  const curl: [number, number] = [238, 140]
  const vel: [number, number] = [232, 184]
  const unit = (p: [number, number]): [number, number] => {
    const dx = p[0] - O[0]
    const dy = p[1] - O[1]
    const L = Math.hypot(dx, dy)
    return [dx / L, dy / L]
  }
  return (
    <Panel title="(d) Why the curl term drops out along a streamline" label="V cross curl V is perpendicular to the plane of V and curl V">
      <path
        d="M34,152 C36,116 112,108 178,114 C242,120 288,134 282,162 C276,194 204,203 142,199 C82,195 32,188 34,152 Z"
        fill="var(--plot-4)"
        opacity={0.22}
        stroke="var(--plot-4)"
        strokeOpacity={0.4}
      />
      <Arrow x1={O[0]} y1={O[1]} x2={curl[0]} y2={curl[1]} color="var(--plot-4)" width={2.4} />
      <Arrow x1={O[0]} y1={O[1]} x2={vel[0]} y2={vel[1]} color="var(--plot-1)" width={2.4} />
      <Arrow x1={O[0]} y1={O[1]} x2={O[0]} y2={22} color="var(--ink)" width={2.4} />
      <RightAngle x={O[0]} y={O[1]} a={[0, -1]} b={unit(curl)} />
      <RightAngle x={O[0]} y={O[1]} a={[0, -1]} b={unit(vel)} s={15} />
      <Label x={196} y={160} size={13} weight={700} color="var(--plot-4)">∇ × V</Label>
      <Label x={240} y={184} size={14} weight={800} color="var(--plot-1)">V</Label>
      <Label x={113} y={32} size={13} weight={700} color="var(--ink)">V × (∇ × V)</Label>
      <Label x={150} y={64} size={11} color="var(--ink-2)">perpendicular to the plane</Label>
      <Label x={150} y={78} size={11} color="var(--ink-2)">containing V and ∇ × V</Label>
      <Label x={12} y={207} size={11} color="var(--ink-3)">ds along V (a streamline) ⇒ [V × (∇ × V)] · ds = 0</Label>
    </Panel>
  )
}

/** All four sketches of slides 9–10 in a responsive grid. */
export function EulerSlideFigures() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <StreamlineArcPanel />
      <StreamlineVectorPanel />
      <GravityPanel />
      <LambGeometryPanel />
    </div>
  )
}
