/**
 * Static diagrams for the stream-function topic.
 *  - VelocityTriangleFigure  : Lecture 9 slide 12 (V with u = ∂ψ/∂y, v = −∂ψ/∂x)
 *  - PsiGradientFigure       : supplementary — V is ∇ψ turned 90° clockwise
 *  - CornerBoxFigure         : supplementary — face flows are corner differences of ψ
 *  - TangencyFigure          : Lecture 9 slide 13 (house + blunt body, V tangent to streamlines)
 *  - FlowRateFigure          : Lecture 9 slide 14 (dq = u dy − v dx = dψ and the ψ₂ ≷ ψ₁ panels)
 *  - PolarFigure             : supplementary — polar components and the polar element
 * All colours are CSS variables, every SVG scales with its viewBox (works down to 360 px).
 */
import { useMemo, type ReactNode } from 'react'
import { useUid } from '@/kit'
import { Arrow, Head, Sub, Tx } from './svg'
import { traceStreamline, type V2, type VelFn } from './fields'

const svgCls = 'mx-auto block h-auto w-full'

/* ------------------------------------------------------------------ slide 12 */

export function VelocityTriangleFigure() {
  return (
    <svg viewBox="0 0 360 215" className={`${svgCls} max-w-md`} role="img" aria-label="Velocity triangle: V has components u = ∂ψ/∂y and v = −∂ψ/∂x">
      <Arrow x1={40} y1={196} x2={40} y2={16} color="var(--ink-3)" width={1.5} head={8} />
      <Arrow x1={40} y1={196} x2={348} y2={196} color="var(--ink-3)" width={1.5} head={8} />
      <Tx x={24} y={26}>y</Tx>
      <Tx x={338} y={212}>x</Tx>
      {/* u leg, v leg, hypotenuse V */}
      <Arrow x1={88} y1={146} x2={252} y2={146} color="var(--plot-1)" width={3} />
      <Arrow x1={256} y1={146} x2={256} y2={62} color="var(--plot-4)" width={3} />
      <Arrow x1={88} y1={146} x2={254} y2={63} color="var(--ink)" width={3.5} head={12} />
      <path d="M244 146 V136 H256" fill="none" stroke="var(--ink-3)" strokeWidth={1.3} />
      <Tx x={150} y={96} size={18} math={false} weight={700}>
        V
      </Tx>
      <Tx x={112} y={174} size={15} cls="fill-indigo-700 dark:fill-indigo-300">
        u = ∂ψ/∂y
      </Tx>
      <Tx x={264} y={110} size={15} cls="fill-rose-700 dark:fill-rose-300">
        v = −∂ψ/∂x
      </Tx>
    </svg>
  )
}

/* ------------------------------------------------- supplementary: ∇ψ vs V */

export function PsiGradientFigure() {
  const X0 = 0.15
  const S = 105
  const sx = (x: number) => 34 + (x - X0) * S
  const sy = (y: number) => 252 - (y - X0) * S
  const XMAX = 3.15
  const YMAX = 2.4
  const levels = [0.5, 1, 1.5, 2, 3, 4.5]
  const curve = (c: number) => {
    const xa = Math.max(X0, c / YMAX)
    let d = ''
    for (let i = 0; i <= 80; i++) {
      const x = xa + ((XMAX - xa) * i) / 80
      d += `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(c / x).toFixed(1)}`
    }
    return d
  }
  // point P on ψ = xy = 1.5
  const P: V2 = [1.2, 1.25]
  const px = sx(P[0])
  const py = sy(P[1])
  const g: V2 = [P[1], P[0]] // ∇ψ = (ψx, ψy) = (y, x)
  const V: V2 = [P[0], -P[1]] // V = (ψy, −ψx) = (x, −y)
  const k = 62 / Math.hypot(g[0], g[1])
  const gTip: V2 = [px + k * g[0], py - k * g[1]]
  const vTip: V2 = [px + k * V[0], py - k * V[1]]
  // right-angle mark
  const gu: V2 = [g[0] / Math.hypot(...g), -g[1] / Math.hypot(...g)]
  const vu: V2 = [V[0] / Math.hypot(...V), -V[1] / Math.hypot(...V)]
  const m = 10
  const mark = `M${px + m * gu[0]} ${py + m * gu[1]} L${px + m * gu[0] + m * vu[0]} ${py + m * gu[1] + m * vu[1]} L${px + m * vu[0]} ${py + m * vu[1]}`
  return (
    <svg viewBox="0 0 360 268" className={`${svgCls} max-w-lg`} role="img" aria-label="Contours of psi with the gradient and the velocity at a point">
      <rect x={34} y={16} width={sx(XMAX) - 34} height={236} rx={8} fill="var(--field-bg)" stroke="var(--line)" />
      {levels.map((c) => (
        <path key={c} d={curve(c)} fill="none" stroke="var(--streamline)" strokeWidth={c === 1.5 ? 2.6 : 1.4} opacity={c === 1.5 ? 1 : 0.75} />
      ))}
      {[1, 2, 3, 4.5].map((c) => (
        <Tx key={c} x={sx(XMAX) - 4} y={sy(c / (XMAX - 0.1)) - 5} size={11} anchor="end" cls="fill-ink-3" halo>
          ψ = {c}
        </Tx>
      ))}
      <path d={mark} fill="none" stroke="var(--ink-3)" strokeWidth={1.2} />
      <Arrow x1={px} y1={py} x2={gTip[0]} y2={gTip[1]} color="var(--plot-3)" width={3} />
      <Arrow x1={px} y1={py} x2={vTip[0]} y2={vTip[1]} color="var(--ink)" width={3} />
      <circle cx={px} cy={py} r={4} fill="var(--ink)" />
      <Tx x={px - 14} y={py + 4} anchor="end" size={14} halo>
        P
      </Tx>
      <Tx x={gTip[0] + 4} y={gTip[1] - 4} size={14} cls="fill-amber-700 dark:fill-amber-300" halo>
        ∇ψ (uphill)
      </Tx>
      <Tx x={vTip[0] + 6} y={vTip[1] + 4} size={14} math={false} weight={700} halo>
        V
      </Tx>
      <Tx x={vTip[0] + 20} y={vTip[1] + 4} size={12} math={false} cls="fill-ink-2" halo>
        = ∇ψ turned 90° clockwise
      </Tx>
      <Tx x={44} y={36} size={12} math={false} cls="fill-ink-3" halo>
        lower ψ
      </Tx>
      <Tx x={sx(XMAX) - 6} y={36} size={12} anchor="end" math={false} cls="fill-ink-3" halo>
        higher ψ ↗
      </Tx>
      <Tx x={44} y={246} size={12} math={false} cls="fill-ink-2" halo>
        contours of ψ = xy
      </Tx>
    </svg>
  )
}

/* ---------------------------------------- supplementary: bookkeeping box */

export function CornerBoxFigure() {
  const L = 110
  const R = 250
  const T = 62
  const B = 170
  const corner = (x: number, y: number, label: ReactNode, dx: number, dy: number, anchor: 'start' | 'end') => (
    <g>
      <circle cx={x} cy={y} r={4.5} fill="var(--plot-6)" />
      <Tx x={x + dx} y={y + dy} anchor={anchor} size={15}>
        {label}
      </Tx>
    </g>
  )
  return (
    <svg viewBox="0 0 360 240" className={`${svgCls} max-w-md`} role="img" aria-label="A rectangle with psi values at its corners; each face flow is a difference of corner values">
      <rect x={L} y={T} width={R - L} height={B - T} fill="var(--band)" stroke="var(--ink-2)" strokeWidth={1.6} />
      {corner(L, B, <>ψ<Sub>1</Sub></>, -8, 18, 'end')}
      {corner(R, B, <>ψ<Sub>2</Sub></>, 8, 18, 'start')}
      {corner(R, T, <>ψ<Sub>3</Sub></>, 8, -6, 'start')}
      {corner(L, T, <>ψ<Sub>4</Sub></>, -8, -6, 'end')}
      <Arrow x1={R} y1={116} x2={R + 48} y2={116} color="var(--plot-5)" width={2.5} />
      <Tx x={R + 6} y={106} size={13}>
        ψ<Sub>3</Sub> − ψ<Sub>2</Sub>
      </Tx>
      <Arrow x1={180} y1={T} x2={180} y2={T - 44} color="var(--plot-5)" width={2.5} />
      <Tx x={188} y={T - 26} size={13}>
        ψ<Sub>4</Sub> − ψ<Sub>3</Sub>
      </Tx>
      <Arrow x1={L} y1={116} x2={L - 48} y2={116} color="var(--plot-5)" width={2.5} />
      <Tx x={L - 6} y={106} size={13} anchor="end">
        ψ<Sub>1</Sub> − ψ<Sub>4</Sub>
      </Tx>
      <Arrow x1={180} y1={B} x2={180} y2={B + 40} color="var(--plot-5)" width={2.5} />
      <Tx x={188} y={B + 30} size={13}>
        ψ<Sub>2</Sub> − ψ<Sub>1</Sub>
      </Tx>
      <Tx x={180} y={122} anchor="middle" size={12} math={false} cls="fill-ink-2">
        outflow through each face
      </Tx>
      <Tx x={180} y={234} anchor="middle" size={12.5} math={false} cls="fill-ink-2">
        sum of the four outflows = 0 for any ψ
      </Tx>
    </svg>
  )
}

/* ------------------------------------------------------------------ slide 13 */

function HousePanel() {
  const hs = [185, 150, 115, 80]
  const As = [118, 102, 85, 67]
  const S = (x: number) => 1 / (1 + Math.exp(-(x - 180) / 30))
  const dS = (x: number) => (S(x) * (1 - S(x))) / 30
  const yOf = (i: number, x: number) => hs[i] - As[i] * S(x)
  const slope = (i: number, x: number) => -As[i] * dS(x)
  const path = (i: number) => {
    let d = ''
    for (let x = 0; x <= 360; x += 6) d += `${x ? 'L' : 'M'}${x} ${yOf(i, x).toFixed(1)}`
    return d
  }
  // velocity vector on streamline 1 at x = 150 (tangent), split into u and v as on the slide
  const px = 150
  const py = yOf(1, px)
  const sl = slope(1, px)
  const Lv = 82
  const n = Math.hypot(1, sl)
  const tip: V2 = [px + Lv / n, py + (Lv * sl) / n]
  return (
    <svg viewBox="0 0 360 250" className={svgCls} role="img" aria-label="Streamlines rising over a house; the velocity V is tangent to a streamline">
      <rect x={0} y={232} width={360} height={18} fill="var(--surface-2)" />
      <line x1={0} x2={360} y1={232} y2={232} stroke="var(--ink-3)" strokeWidth={1.4} />
      <rect x={185} y={152} width={150} height={80} fill="var(--surface-2)" stroke="var(--ink-3)" strokeWidth={1.4} />
      <polygon points="173,152 260,92 347,152" fill="var(--body-fill)" stroke="var(--ink-3)" strokeWidth={1.4} />
      <rect x={280} y={170} width={40} height={30} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.2} />
      <Arrow x1={205} y1={222} x2={243} y2={222} color="var(--ink-2)" width={1.3} head={6} />
      <Arrow x1={205} y1={222} x2={205} y2={186} color="var(--ink-2)" width={1.3} head={6} />
      <Tx x={246} y={226} size={12}>
        x
      </Tx>
      <Tx x={196} y={186} size={12}>
        y
      </Tx>
      {hs.map((_, i) => (
        <g key={i}>
          <path d={path(i)} fill="none" stroke="var(--streamline)" strokeWidth={2} />
          <Head x={60} y={yOf(i, 60)} dx={1} dy={slope(i, 60)} size={10} />
        </g>
      ))}
      <Tx x={10} y={44} size={13} math={false} cls="fill-ink-2">
        Streamlines
      </Tx>
      {/* component rectangle */}
      <line x1={tip[0]} y1={py} x2={tip[0]} y2={tip[1]} stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth={1.3} />
      <line x1={px} y1={tip[1]} x2={tip[0]} y2={tip[1]} stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth={1.3} />
      <Arrow x1={px} y1={py} x2={tip[0]} y2={py} color="var(--plot-1)" width={2.4} head={8} />
      <Arrow x1={px} y1={py} x2={px} y2={tip[1]} color="var(--plot-4)" width={2.4} head={8} />
      <Arrow x1={px} y1={py} x2={tip[0]} y2={tip[1]} color="var(--ink)" width={3} head={11} />
      <Tx x={tip[0] + 4} y={tip[1] - 2} size={16} math={false} weight={700} halo>
        V
      </Tx>
      <Tx x={(px + tip[0]) / 2} y={py + 17} size={14} anchor="middle" halo>
        u
      </Tx>
      <Tx x={px - 8} y={(py + tip[1]) / 2 + 4} size={14} anchor="end" halo>
        v
      </Tx>
    </svg>
  )
}

function BluntBodyPanel() {
  const clip = useUid('sfclip')
  const a = 0.45 // nose distance m/(2πU) of a Rankine half-body (U = 1)
  const X0 = -2.6
  const YT = 1.6
  const K = 78.26
  const sx = (x: number) => (x - X0) * K
  const sy = (y: number) => (YT - y) * K
  const { lines, bodyD, vec, heads } = useMemo(() => {
    const vel: VelFn = (x, y) => {
      const r2 = x * x + y * y
      return [1 + (a * x) / r2, (a * y) / r2]
    }
    const body = (x: number, y: number) => Math.abs(y) < a * (Math.PI - Math.atan2(Math.abs(y), x))
    const cs = [0.12, 0.32, 0.58, 0.9, 1.25]
    const tr: V2[][] = []
    for (const c of cs)
      for (const sg of [1, -1])
        tr.push(traceStreamline(vel, 0, sg * (c + (a * Math.PI) / 2), { bounds: [-2.75, 2.15, -1.75, 1.75], step: 0.03, maxSteps: 420, body }))
    const toD = (pts: V2[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`).join('')
    // body outline y = a(π − θ), x = y cot θ (upper), mirrored below
    const up: V2[] = []
    for (let i = 0; i <= 160; i++) {
      const th = 0.05 + ((Math.PI - 1e-4 - 0.05) * i) / 160
      const y = a * (Math.PI - th)
      up.push([y / Math.tan(th), y])
    }
    const outline = [...up, ...up.slice().reverse().map(([x, y]) => [x, -y] as V2)]
    // velocity vector on the c = 0.32 streamline near x = −0.8
    const line = tr[2]
    let best = line[0]
    for (const p of line) if (Math.abs(p[0] + 0.8) < Math.abs(best[0] + 0.8)) best = p
    const [u, v] = vel(best[0], best[1])
    const hd = tr.map((pts) => {
      let q = pts[0]
      let k = 0
      pts.forEach((p, i) => {
        if (Math.abs(p[0] + 2.15) < Math.abs(q[0] + 2.15)) {
          q = p
          k = i
        }
      })
      const nx = pts[Math.min(pts.length - 1, k + 1)]
      return { x: sx(q[0]), y: sy(q[1]), dx: sx(nx[0]) - sx(q[0]), dy: sy(nx[1]) - sy(q[1]) }
    })
    return { lines: tr.map(toD), bodyD: `${toD(outline)}Z`, vec: { p: best, u, v }, heads: hd }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const P: V2 = [sx(vec.p[0]), sy(vec.p[1])]
  const Ls = 66 / Math.hypot(vec.u, vec.v)
  const tip: V2 = [P[0] + Ls * vec.u, P[1] - Ls * vec.v]
  return (
    <svg viewBox="0 0 360 250" className={svgCls} role="img" aria-label="Streamlines bending around a blunt nose; V is tangent to a streamline">
      <defs>
        <clipPath id={clip}>
          <rect x={0} y={0} width={360} height={250} rx={8} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x={0} y={0} width={360} height={250} fill="var(--field-bg)" />
        {lines.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="var(--streamline)" strokeWidth={1.6} />
        ))}
        {heads.map((h, i) => (
          <Head key={i} x={h.x} y={h.y} dx={h.dx} dy={h.dy} size={9} />
        ))}
        <path d={bodyD} fill="var(--plot-5)" fillOpacity={0.3} stroke="var(--ink)" strokeWidth={2.6} />
        <circle cx={sx(-a)} cy={sy(0)} r={4} fill="var(--plot-3)" />
        <Arrow x1={sx(0.55)} y1={sy(-0.25)} x2={sx(0.55) + 32} y2={sy(-0.25)} color="var(--ink-2)" width={1.3} head={6} />
        <Arrow x1={sx(0.55)} y1={sy(-0.25)} x2={sx(0.55)} y2={sy(-0.25) - 32} color="var(--ink-2)" width={1.3} head={6} />
        <Tx x={sx(0.55) + 36} y={sy(-0.25) + 4} size={12}>
          x
        </Tx>
        <Tx x={sx(0.55) - 10} y={sy(-0.25) - 30} size={12}>
          y
        </Tx>
        {/* V tangent to the streamline with its u, v rectangle */}
        <line x1={tip[0]} y1={P[1]} x2={tip[0]} y2={tip[1]} stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth={1.3} />
        <line x1={P[0]} y1={tip[1]} x2={tip[0]} y2={tip[1]} stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth={1.3} />
        <Arrow x1={P[0]} y1={P[1]} x2={tip[0]} y2={P[1]} color="var(--plot-1)" width={2.3} head={8} />
        <Arrow x1={P[0]} y1={P[1]} x2={P[0]} y2={tip[1]} color="var(--plot-4)" width={2.3} head={8} />
        <Arrow x1={P[0]} y1={P[1]} x2={tip[0]} y2={tip[1]} color="var(--ink)" width={3} head={11} />
        <Tx x={tip[0] + 5} y={tip[1] - 2} size={16} math={false} weight={700} halo>
          V
        </Tx>
        <Tx x={(P[0] + tip[0]) / 2} y={P[1] + 16} size={14} anchor="middle" halo>
          u
        </Tx>
        <Tx x={P[0] - 7} y={(P[1] + tip[1]) / 2 + 4} size={14} anchor="end" halo>
          v
        </Tx>
        <Tx x={8} y={244} size={12} math={false} cls="fill-ink-2" halo>
          Streamlines
        </Tx>
      </g>
      <rect x={0.5} y={0.5} width={359} height={249} rx={8} fill="none" stroke="var(--line)" />
    </svg>
  )
}

export function TangencyFigure() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <HousePanel />
      <BluntBodyPanel />
    </div>
  )
}

/* ------------------------------------------------------------------ slide 14 */

function FlowRateTop() {
  const s = (t: number) => t * t * (3 - 2 * t)
  const yL = (x: number) => 120 + 70 * s(Math.min(1, Math.max(0, (x - 16) / 354)))
  const yU = (x: number) => yL(x) - 80
  const line = (f: (x: number) => number) => {
    let d = ''
    for (let x = 16; x <= 370; x += 6) d += `${x === 16 ? 'M' : 'L'}${x} ${f(x).toFixed(1)}`
    return d
  }
  const A: V2 = [170, yL(170)]
  const C: V2 = [272, yU(272)]
  const B: V2 = [C[0], A[1]]
  return (
    <svg viewBox="0 0 380 252" className={`${svgCls} max-w-xl`} role="img" aria-label="Two neighbouring streamlines psi and psi + d psi with the path A B C used to derive dq = d psi">
      <path d={line(yL)} fill="none" stroke="var(--plot-4)" strokeWidth={3} />
      <path d={line(yU)} fill="none" stroke="var(--plot-4)" strokeWidth={3} />
      <Tx x={18} y={110} size={16}>
        ψ
      </Tx>
      <Tx x={18} y={30} size={16}>
        ψ + dψ
      </Tx>
      <Arrow x1={62} y1={76} x2={122} y2={92} color="var(--ink)" width={3.2} head={11} />
      <Tx x={80} y={68} size={16}>
        dq
      </Tx>
      {/* arbitrary curve A → C and the dashed path A → B → C */}
      <path d={`M${A[0]} ${A[1]} C ${A[0] + 22} ${A[1] - 48}, ${C[0] - 34} ${C[1] + 44}, ${C[0]} ${C[1]}`} fill="none" stroke="var(--ink)" strokeWidth={2} />
      <path d={`M${A[0]} ${A[1]} H${B[0]} V${C[1]}`} fill="none" stroke="var(--ink-3)" strokeWidth={1.5} strokeDasharray="6 4" />
      <circle cx={A[0]} cy={A[1]} r={4.5} fill="var(--ink)" />
      <circle cx={C[0]} cy={C[1]} r={4.5} fill="var(--ink)" />
      <Tx x={A[0] - 6} y={A[1] + 20} size={15} anchor="end">
        A
      </Tx>
      <Tx x={B[0] + 4} y={B[1] + 20} size={15}>
        B
      </Tx>
      <Tx x={C[0] - 10} y={C[1] - 9} size={15} anchor="end">
        C
      </Tx>
      <Arrow x1={B[0] + 6} y1={(B[1] + C[1]) / 2} x2={B[0] + 48} y2={(B[1] + C[1]) / 2} color="var(--plot-1)" width={2.2} head={8} />
      <Tx x={B[0] + 52} y={(B[1] + C[1]) / 2 + 5} size={15} cls="fill-indigo-700 dark:fill-indigo-300">
        u dy
      </Tx>
      <Arrow x1={(A[0] + B[0]) / 2} y1={A[1] + 4} x2={(A[0] + B[0]) / 2} y2={A[1] + 44} color="var(--plot-1)" width={2.2} head={8} />
      <Tx x={(A[0] + B[0]) / 2 + 8} y={A[1] + 50} size={15} cls="fill-indigo-700 dark:fill-indigo-300">
        − v dx
      </Tx>
      <Arrow x1={24} y1={242} x2={70} y2={242} color="var(--ink-3)" width={1.3} head={6} />
      <Arrow x1={24} y1={242} x2={24} y2={200} color="var(--ink-3)" width={1.3} head={6} />
      <Tx x={74} y={246} size={12}>
        x
      </Tx>
      <Tx x={14} y={202} size={12}>
        y
      </Tx>
    </svg>
  )
}

function FlowRateSmall({ kind }: { kind: 'generic' | 'pos' | 'neg' }) {
  const upper = 'M14 34 C 62 18, 116 50, 186 42'
  const lower = 'M14 96 C 72 82, 122 114, 186 104'
  const right = kind !== 'neg'
  return (
    <svg viewBox="0 0 200 132" className={svgCls} role="img" aria-label={kind === 'neg' ? 'psi2 < psi1: flow from right to left' : 'psi2 > psi1: flow from left to right'}>
      <path d={upper} fill="none" stroke="var(--plot-4)" strokeWidth={2.6} />
      <path d={lower} fill="none" stroke="var(--plot-4)" strokeWidth={2.6} />
      {kind === 'generic' ? (
        <Tx x={186} y={62} size={15} anchor="end">
          ψ<Sub>2</Sub>
        </Tx>
      ) : (
        <Tx x={100} y={22} size={14} anchor="middle">
          ψ<Sub>2</Sub> {kind === 'pos' ? '>' : '<'} ψ<Sub>1</Sub>
        </Tx>
      )}
      <Tx x={186} y={124} size={15} anchor="end">
        ψ<Sub>1</Sub>
      </Tx>
      <Arrow x1={right ? 70 : 130} y1={right ? 64 : 70} x2={right ? 128 : 72} y2={right ? 70 : 64} color="var(--ink)" width={3} head={10} />
      <Tx x={right ? 134 : 56} y={right ? 74 : 70} size={15} anchor={right ? 'start' : 'end'}>
        q
      </Tx>
      <Tx x={14} y={124} size={11} math={false} cls="fill-ink-3">
        {kind === 'generic' ? 'q = ψ₂ − ψ₁' : kind === 'pos' ? 'q > 0: left → right' : 'q < 0: right → left'}
      </Tx>
    </svg>
  )
}

export function FlowRateFigure() {
  return (
    <div className="space-y-3">
      <FlowRateTop />
      <div className="grid gap-3 sm:grid-cols-3">
        <FlowRateSmall kind="generic" />
        <FlowRateSmall kind="pos" />
        <FlowRateSmall kind="neg" />
      </div>
    </div>
  )
}

/* --------------------------------------------- supplementary: polar geometry */

function PolarComponents() {
  const O: V2 = [36, 226]
  const th = (35 * Math.PI) / 180
  const c = Math.cos(th)
  const s = Math.sin(th)
  const P: V2 = [O[0] + 175 * c, O[1] - 175 * s]
  const er: V2 = [c, -s] // screen direction of ê_r
  const et: V2 = [-s, -c] // screen direction of ê_θ
  const vr: V2 = [P[0] + 70 * er[0], P[1] + 70 * er[1]]
  const vt: V2 = [P[0] + 52 * et[0], P[1] + 52 * et[1]]
  const V: V2 = [vr[0] + 52 * et[0], vr[1] + 52 * et[1]]
  return (
    <svg viewBox="0 0 300 250" className={svgCls} role="img" aria-label="Polar coordinates: point P at radius r and angle theta with velocity components v_r and v_theta">
      <Arrow x1={O[0]} y1={O[1]} x2={292} y2={O[1]} color="var(--ink-3)" width={1.4} head={7} />
      <Arrow x1={O[0]} y1={O[1]} x2={O[0]} y2={12} color="var(--ink-3)" width={1.4} head={7} />
      <Tx x={284} y={244} size={13}>
        x
      </Tx>
      <Tx x={22} y={20} size={13}>
        y
      </Tx>
      <line x1={O[0]} y1={O[1]} x2={P[0]} y2={P[1]} stroke="var(--ink-2)" strokeWidth={1.6} />
      <Tx x={(O[0] + P[0]) / 2 - 10} y={(O[1] + P[1]) / 2 - 8} size={15} anchor="end">
        r
      </Tx>
      <path d={`M${O[0] + 44} ${O[1]} A44 44 0 0 0 ${O[0] + 44 * c} ${O[1] - 44 * s}`} fill="none" stroke="var(--ink-2)" strokeWidth={1.4} />
      <Tx x={O[0] + 54} y={O[1] - 10} size={15}>
        θ
      </Tx>
      <line x1={vr[0]} y1={vr[1]} x2={V[0]} y2={V[1]} stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth={1.3} />
      <line x1={vt[0]} y1={vt[1]} x2={V[0]} y2={V[1]} stroke="var(--ink-3)" strokeDasharray="4 3" strokeWidth={1.3} />
      <Arrow x1={P[0]} y1={P[1]} x2={vr[0]} y2={vr[1]} color="var(--plot-1)" width={2.6} />
      <Arrow x1={P[0]} y1={P[1]} x2={vt[0]} y2={vt[1]} color="var(--plot-4)" width={2.6} />
      <Arrow x1={P[0]} y1={P[1]} x2={V[0]} y2={V[1]} color="var(--ink)" width={3.2} head={11} />
      <circle cx={P[0]} cy={P[1]} r={4} fill="var(--ink)" />
      <Tx x={P[0] + 6} y={P[1] + 18} size={15} halo>
        P
      </Tx>
      <Tx x={vr[0] + 4} y={vr[1] + 14} size={15} cls="fill-indigo-700 dark:fill-indigo-300" halo>
        v<Sub>r</Sub>
      </Tx>
      <Tx x={vt[0] - 6} y={vt[1] + 2} size={15} anchor="end" cls="fill-rose-700 dark:fill-rose-300" halo>
        v<Sub>θ</Sub>
      </Tx>
      <Tx x={V[0] + 6} y={V[1] + 4} size={16} math={false} weight={700} halo>
        V
      </Tx>
      <Tx x={150} y={244} size={11} anchor="middle" math={false} cls="fill-ink-3">
        v_r along ê_r (outward), v_θ along ê_θ (increasing θ)
      </Tx>
    </svg>
  )
}

function PolarElement() {
  const O: V2 = [26, 232]
  const R1 = 120
  const R2 = 196
  const t1 = (22 * Math.PI) / 180
  const t2 = (46 * Math.PI) / 180
  const pt = (R: number, t: number): V2 => [O[0] + R * Math.cos(t), O[1] - R * Math.sin(t)]
  const P1 = pt(R1, t1)
  const P2 = pt(R2, t1)
  const P3 = pt(R2, t2)
  const P4 = pt(R1, t2)
  const tm = (t1 + t2) / 2
  const a0 = pt(R2 - 10, tm)
  const a1 = pt(R2 + 34, tm)
  const M = pt((R1 + R2) / 2, t1)
  const et: V2 = [-Math.sin(t1), -Math.cos(t1)]
  return (
    <svg viewBox="0 0 300 250" className={svgCls} role="img" aria-label="Polar element between r and r + dr, theta and theta + d theta, with the flows across its sides">
      <Arrow x1={O[0]} y1={O[1]} x2={292} y2={O[1]} color="var(--ink-3)" width={1.4} head={7} />
      <Arrow x1={O[0]} y1={O[1]} x2={O[0]} y2={12} color="var(--ink-3)" width={1.4} head={7} />
      <line x1={O[0]} y1={O[1]} x2={P1[0]} y2={P1[1]} stroke="var(--ink-3)" strokeDasharray="3 4" />
      <line x1={O[0]} y1={O[1]} x2={P4[0]} y2={P4[1]} stroke="var(--ink-3)" strokeDasharray="3 4" />
      <path
        d={`M${P1[0]} ${P1[1]} L${P2[0]} ${P2[1]} A${R2} ${R2} 0 0 0 ${P3[0]} ${P3[1]} L${P4[0]} ${P4[1]} A${R1} ${R1} 0 0 1 ${P1[0]} ${P1[1]}Z`}
        fill="var(--band)"
        stroke="var(--ink-2)"
        strokeWidth={1.8}
      />
      <Arrow x1={a0[0]} y1={a0[1]} x2={a1[0]} y2={a1[1]} color="var(--plot-1)" width={2.6} />
      <Tx x={a1[0] + 2} y={a1[1] - 4} size={14} cls="fill-indigo-700 dark:fill-indigo-300" halo>
        v<Sub>r</Sub>
      </Tx>
      <Arrow x1={M[0] - 22 * et[0]} y1={M[1] - 22 * et[1]} x2={M[0] + 22 * et[0]} y2={M[1] + 22 * et[1]} color="var(--plot-4)" width={2.6} />
      <Tx x={M[0] + 22 * et[0] - 4} y={M[1] + 22 * et[1] - 4} size={14} anchor="end" cls="fill-rose-700 dark:fill-rose-300" halo>
        v<Sub>θ</Sub>
      </Tx>
      <Tx x={pt(R2 + 12, t2 + 0.03)[0]} y={pt(R2 + 12, t2 + 0.03)[1]} size={14} halo>
        r dθ
      </Tx>
      <Tx x={M[0] + 18} y={M[1] + 26} size={14} halo>
        dr
      </Tx>
      <Tx x={O[0] + 6} y={O[1] - 6} size={13}>
        O
      </Tx>
      <Tx x={150} y={246} size={11} anchor="middle" math={false} cls="fill-ink-3">
        arc length r dθ; radial side dr
      </Tx>
    </svg>
  )
}

export function PolarFigure() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <PolarComponents />
      <PolarElement />
    </div>
  )
}
