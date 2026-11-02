import { useRef, useState } from 'react'
import { Md, PlayPause, Slider, Toggle, md, useAnimationFrame, usePrefersReducedMotion, useUid } from '@/kit'
import { AX, ArrowMarkers, pn, useOnScreen } from './shared'

/*
 * Two material squares followed in time (Lagrangian view).
 *  A: u = a x, v = −a y   (∇·V = 0)      → width e^S, height e^−S, area constant
 *  B: u = a x, v = 0      (∇·V = a)      → width e^S, height 1,   area e^S, density e^−S (mass conserved)
 * S(t) = ∫ a dt. Steady: a = A0 → S = A0 t. Unsteady: a(t) = A0 cos ωt → S = (A0/ω) sin ωt.
 */
const A0 = 1 // s⁻¹
const OMEGA = 2 // rad/s for the unsteady option
const T_END = 0.9 // s, steady replay length
const HALF = 0.5 // m, half-side of the initial square
const DOM = 1.5 // m, half-width of each panel
const PX = 100 / DOM // px per m (panel 200 px)

const toX = (x: number) => 100 + x * PX
const toY = (y: number) => 100 - y * PX

function Panel({ kind, S, uid }: { kind: 'A' | 'B'; S: number; uid: string }) {
  const sx = Math.exp(S)
  const sy = kind === 'A' ? Math.exp(-S) : 1
  const w = HALF * sx
  const h = HALF * sy
  // material points inside the element
  const pts: [number, number][] = []
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) pts.push([(-0.75 + 0.5 * i) * HALF, (-0.75 + 0.5 * j) * HALF])
  // background flow: streamlines
  const stream: string[] = []
  if (kind === 'A') {
    // hyperbolas x·y = ±c in each quadrant (streamlines of u = a x, v = −a y)
    for (const c of [0.06, 0.2, 0.45, 0.8])
      for (const qx of [1, -1])
        for (const qy of [1, -1]) {
          const seg: string[] = []
          const s0 = c / DOM
          for (let k = 0; k <= 40; k++) {
            const sAbs = s0 + (k / 40) * (DOM - s0)
            seg.push(`${k ? 'L' : 'M'}${toX(qx * sAbs).toFixed(1)} ${toY((qy * c) / sAbs).toFixed(1)}`)
          }
          stream.push(seg.join(''))
        }
  } else {
    for (const y of [-1.25, -0.75, -0.25, 0.25, 0.75, 1.25]) stream.push(`M${toX(-DOM)} ${toY(y)}L${toX(DOM)} ${toY(y)}`)
  }
  // a few velocity arrows
  const arrows: { x: number; y: number; u: number; v: number }[] = []
  for (const x of [-1.2, -0.6, 0.6, 1.2])
    for (const y of [-1.2, 1.2]) arrows.push({ x, y, u: A0 * x, v: kind === 'A' ? -A0 * y : 0 })
  const rho = 1 / (sx * sy)
  return (
    <svg viewBox="0 0 200 200" className="block h-auto w-full" role="img" aria-label={kind === 'A' ? 'Incompressible element' : 'Compressible element'}>
      <defs>
        <ArrowMarkers id={`${uid}${kind}`} colors={{ q: 'var(--quiver)' }} size={5} />
      </defs>
      <rect x={0} y={0} width={200} height={200} rx={8} fill="var(--field-bg)" stroke="var(--line)" />
      <line x1={0} x2={200} y1={100} y2={100} stroke="var(--grid)" strokeDasharray="3 4" />
      <line x1={100} x2={100} y1={0} y2={200} stroke="var(--grid)" strokeDasharray="3 4" />
      {stream.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--streamline)" strokeWidth={1} opacity={0.45} />
      ))}
      {arrows.map((a, i) => {
        const L = Math.hypot(a.u, a.v)
        const k = 16 / Math.max(L, 1e-9)
        return (
          <line
            key={i}
            x1={toX(a.x)}
            y1={toY(a.y)}
            x2={toX(a.x) + a.u * k}
            y2={toY(a.y) - a.v * k}
            stroke="var(--quiver)"
            strokeWidth={1.3}
            markerEnd={`url(#${uid}${kind}-q)`}
            opacity={0.8}
          />
        )
      })}
      {/* initial square (ghost) */}
      <rect x={toX(-HALF)} y={toY(HALF)} width={2 * HALF * PX} height={2 * HALF * PX} fill="none" stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth={1.2} />
      {/* deformed element */}
      <rect
        x={toX(-w)}
        y={toY(h)}
        width={2 * w * PX}
        height={2 * h * PX}
        fill={kind === 'A' ? AX.ok : AX.pos}
        fillOpacity={kind === 'A' ? 0.28 : Math.max(0.06, 0.32 * rho)}
        stroke={kind === 'A' ? AX.ok : AX.pos}
        strokeWidth={2}
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={toX(x * sx)} cy={toY(y * sy)} r={2.2} fill="var(--ink-2)" />
      ))}
    </svg>
  )
}

export function ElementAreaDemo() {
  const [t, setT] = useState(0.6)
  const [playing, setPlaying] = useState(true)
  const [unsteady, setUnsteady] = useState(false)
  const uid = useUid('ead')
  const wrap = useRef<HTMLDivElement>(null)
  const visible = useOnScreen(wrap)
  const reduced = usePrefersReducedMotion()
  const span = unsteady ? (2 * Math.PI) / OMEGA : T_END + 0.6
  useAnimationFrame((dt) => setT((x) => (x + dt * 0.45) % span), playing && visible && !reduced)

  const tt = unsteady ? t : Math.min(t, T_END)
  const a = unsteady ? A0 * Math.cos(OMEGA * tt) : A0
  const S = unsteady ? ((A0 * 1.8) / OMEGA) * Math.sin(OMEGA * tt) : A0 * tt
  const aNow = unsteady ? 1.8 * a : a
  const areaB = Math.exp(S)

  return (
    <div ref={wrap} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-2">
          <Md className="md-tight px-1 pb-1 text-sm">
            {md`**A — incompressible** $\;u = a x,\; v = -a y$`}
          </Md>
          <Panel kind="A" S={S} uid={uid} />
          <div className="mt-2 grid grid-cols-2 gap-1 px-1 text-xs text-ink-2">
            <span>
              <Md inline>{md`$\nabla\cdot\mathbf V = a - a = 0$`}</Md>
            </span>
            <span className="text-right font-mono font-semibold text-emerald-700 dark:text-emerald-300">area ×{pn(Math.exp(S) * Math.exp(-S), 3)} · ρ ×1</span>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-2">
          <Md className="md-tight px-1 pb-1 text-sm">
            {md`**B — compressible** $\;u = a x,\; v = 0$`}
          </Md>
          <Panel kind="B" S={S} uid={uid} />
          <div className="mt-2 grid grid-cols-2 gap-1 px-1 text-xs text-ink-2">
            <span>
              <Md inline>{md`$\nabla\cdot\mathbf V = a$`}</Md>
            </span>
            <span className="text-right font-mono font-semibold text-rose-700 dark:text-rose-300">
              area ×{pn(areaB, 3)} · ρ ×{pn(1 / areaB, 3)}
            </span>
          </div>
        </div>
      </div>
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_auto]">
        <Slider
          label={unsteady ? md`time $t$ — strain rate $a(t) = ${pn(1.8, 2)}\cos(${OMEGA}t)$ s$^{-1}$` : md`time $t$ — strain rate $a = ${A0}$ s$^{-1}$`}
          value={tt}
          min={0}
          max={unsteady ? span : T_END}
          step={0.01}
          onChange={(v) => {
            setPlaying(false)
            setT(v)
          }}
          unit="s"
          digits={2}
        />
        <Toggle label="unsteady $a(t)$" checked={unsteady} onChange={(v) => { setUnsteady(v); setT(0) }} />
        <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => setT(0)} />
      </div>
      <p className="text-xs text-ink-3">
        Current strain rate a = {pn(aNow, 3)} s⁻¹. Dashed square: the element at t = 0. Dots: material points riding with the fluid. In B the shading
        fades as the same mass spreads over a larger area (ρ ∝ 1/area).
      </p>
    </div>
  )
}
