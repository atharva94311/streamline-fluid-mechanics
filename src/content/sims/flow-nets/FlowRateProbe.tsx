/**
 * Concept 3 interactive (Lecture 12, slide 6): the volume flow rate that crosses ANY curve from A to C equals
 * ψ_C − ψ_A. The curve is a draggable quadratic Bézier (or the A→B→C staircase of the slide); the integral of
 * (u dy − v dx) along it is evaluated numerically and compared with the difference of the stream function.
 * Flow: 90° corner flow ψ = Axy (A = 1 s⁻¹), u = Ax, v = −Ay.
 */
import { useRef, useState } from 'react'
import { FlowField, Md, Segmented, SimPanel, md, type Vec } from '@/kit'
import { corner, levelsFor } from './fields'
import { Arrow, Sub, Tx, polyPath } from './svg'
import { DragLayer, TeXReadout, type OverlayCtx } from './ui'

const XD: [number, number] = [0, 3]
const YD: [number, number] = [0, 2]
const PSI_LEVELS = levelsFor([0, 6], 0.25)
const PHI_LEVELS = levelsFor([-2, 4.5], 0.25)
type Handle = 'A' | 'C' | 'K'
type PathKind = 'curve' | 'stairs'

const bez = (a: Vec, k: Vec, c: Vec, t: number): Vec => [
  (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * k[0] + t * t * c[0],
  (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * k[1] + t * t * c[1],
]

/** ∫ (u dy − v dx) along a polyline of points (midpoint rule on each segment). */
function fluxAlong(pts: Vec[]): number {
  let q = 0
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const [u, v] = corner.vel(0.5 * (x0 + x1), 0.5 * (y0 + y1))
    q += u * (y1 - y0) - v * (x1 - x0)
  }
  return q
}

const line = (a: Vec, b: Vec, n = 200): Vec[] => Array.from({ length: n + 1 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n])

export function FlowRateProbe() {
  const [A, setA] = useState<Vec>([1.0, 0.6])
  const [C, setC] = useState<Vec>([2.0, 1.1])
  const [K, setK] = useState<Vec>([1.15, 1.6])
  const [kind, setKind] = useState<PathKind>('curve')
  const grab = useRef<Handle | null>(null)

  const B: Vec = [C[0], A[1]]
  const psiA = corner.psi(A[0], A[1])
  const psiC = corner.psi(C[0], C[1])
  const dPsi = psiC - psiA
  const curvePts = Array.from({ length: 401 }, (_, i) => bez(A, K, C, i / 400))
  const qCurve = fluxAlong(curvePts)
  const qAB = fluxAlong(line(A, B))
  const qBC = fluxAlong(line(B, C))
  const q = kind === 'curve' ? qCurve : qAB + qBC

  const onPoint = (p: Vec, phase: 'start' | 'move') => {
    if (phase === 'start') {
      const cands: [Handle, Vec][] = [['A', A], ['C', C]]
      if (kind === 'curve') cands.push(['K', K])
      let best: Handle | null = null
      let bd = 0.4
      for (const [hname, hp] of cands) {
        const d = Math.hypot(hp[0] - p[0], hp[1] - p[1])
        if (d < bd) {
          bd = d
          best = hname
        }
      }
      grab.current = best
    }
    const q2: Vec = [Math.min(2.95, Math.max(0.05, p[0])), Math.min(1.95, Math.max(0.05, p[1]))]
    if (grab.current === 'A') setA(q2)
    else if (grab.current === 'C') setC(q2)
    else if (grab.current === 'K') setK(q2)
  }

  const overlay = (ctx: OverlayCtx) => {
    const { sx, sy } = ctx
    const S = (p: Vec) => [sx(p[0]), sy(p[1])] as [number, number]
    const hyper = (psiV: number) => {
      if (!(psiV > 0)) return ''
      const xs = Math.max(XD[0] + 1e-3, psiV / YD[1])
      return polyPath(Array.from({ length: 90 }, (_, i) => {
        const x = xs + ((XD[1] - xs) * i) / 89
        return S([x, psiV / x])
      }))
    }
    const mid = kind === 'curve' ? bez(A, K, C, 0.5) : B
    const d: Vec = [C[0] - A[0], C[1] - A[1]]
    const dl = Math.hypot(d[0], d[1]) || 1
    const right: Vec = [d[1] / dl, -d[0] / dl] // walker's right-hand side (y up)
    const sgn = Math.sign(q)
    const m0 = S(mid)
    const tipQ = S([mid[0] + 0.32 * sgn * right[0], mid[1] + 0.32 * sgn * right[1]])
    const tailQ = S([mid[0] - 0.12 * sgn * right[0], mid[1] - 0.12 * sgn * right[1]])
    const pA = S(A)
    const pB = S(B)
    const pC = S(C)
    const pK = S(K)
    return (
      <g>
        <path d={hyper(psiA)} fill="none" stroke="var(--plot-4)" strokeWidth={2.8} />
        <path d={hyper(psiC)} fill="none" stroke="var(--plot-4)" strokeWidth={2.8} strokeDasharray="10 4" />
        {kind === 'curve' ? (
          <>
            <line x1={pA[0]} y1={pA[1]} x2={pK[0]} y2={pK[1]} stroke="var(--ink-3)" strokeWidth={1} strokeDasharray="3 3" />
            <line x1={pC[0]} y1={pC[1]} x2={pK[0]} y2={pK[1]} stroke="var(--ink-3)" strokeWidth={1} strokeDasharray="3 3" />
            <path d={polyPath(curvePts.map(S))} fill="none" stroke="var(--ink)" strokeWidth={2.4} />
            <rect x={pK[0] - 5} y={pK[1] - 5} width={10} height={10} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth={1.6} />
            <Tx x={pK[0] + 8} y={pK[1] - 6} size={12} math={false} weight={600} halo>
              K
            </Tx>
          </>
        ) : (
          <>
            <path d={polyPath([pA, pB, pC])} fill="none" stroke="var(--ink)" strokeWidth={2.4} />
            <circle cx={pB[0]} cy={pB[1]} r={3.5} fill="var(--ink)" />
            <Tx x={pB[0] + 6} y={pB[1] + 15} size={12.5} math={false} weight={600} halo>
              B
            </Tx>
          </>
        )}
        {Math.abs(q) > 1e-6 ? (
          <>
            <Arrow x1={tailQ[0]} y1={tailQ[1]} x2={tipQ[0]} y2={tipQ[1]} color="var(--plot-5)" width={3.2} head={11} />
            <Tx x={tipQ[0] + 5} y={tipQ[1] + 4} size={13} weight={700} fill="var(--plot-5)" halo>
              q
            </Tx>
          </>
        ) : null}
        <circle cx={m0[0]} cy={m0[1]} r={2} fill="var(--plot-5)" />
        {(
          [
            ['A', pA, psiA],
            ['C', pC, psiC],
          ] as const
        ).map(([name, pp, val]) => (
          <g key={name}>
            <circle cx={pp[0]} cy={pp[1]} r={6} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2.2} />
            <Tx x={pp[0] - 8} y={pp[1] + 18} size={12.5} math={false} weight={700} anchor="end" halo>
              {name}
            </Tx>
            <Tx x={pp[0] + 9} y={pp[1] + 18} size={11.5} fill="var(--plot-4)" halo>
              ψ<Sub>{name === 'A' ? '1' : '2'}</Sub> = {val.toFixed(2)}
            </Tx>
          </g>
        ))}
        <DragLayer ctx={ctx} x={XD} y={YD} onPoint={onPoint} onRelease={() => (grab.current = null)} label="Drag A, C or the control point K" />
      </g>
    )
  }

  const pathItems =
    kind === 'curve'
      ? [{ label: md`$\int_{A}^{C}(u\,dy - v\,dx)$ along the curve`, value: qCurve, unit: 'm²/s', tone: 'accent' as const, digits: 4 }]
      : [
          { label: md`$\int_A^B (-v\,dx)$ (horizontal leg)`, value: qAB, unit: 'm²/s', digits: 4 },
          { label: md`$\int_B^C u\,dy$ (vertical leg)`, value: qBC, unit: 'm²/s', digits: 4 },
          { label: md`sum along $A \to B \to C$`, value: qAB + qBC, unit: 'm²/s', tone: 'accent' as const, digits: 4 },
        ]

  return (
    <SimPanel
      title="Any path, same flow rate"
      subtitle="q across a curve from A to C equals ψ₂ − ψ₁"
      wide
      controls={
        <Segmented
          label="path from A to C"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'curve', label: 'free curve (drag K)' },
            { value: 'stairs', label: 'staircase A→B→C' },
          ]}
        />
      }
      readout={
        <TeXReadout
          cols={1}
          items={[
            { label: md`$\psi_1 = \psi(A)$, $\psi_2 = \psi(C)$`, value: `${psiA.toFixed(3)}, ${psiC.toFixed(3)}`, unit: 'm²/s' },
            { label: md`$\psi_2 - \psi_1$`, value: dPsi, unit: 'm²/s', tone: 'good', digits: 4 },
            ...pathItems,
            {
              label: 'direction of q',
              value: Math.abs(q) < 1e-6 ? 'no net flow' : q > 0 ? 'left → right of A→C' : 'right → left of A→C',
            },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** drag the control point K to make the path bulge or loop — the integral of $u\,dy - v\,dx$ does not change, because it only depends on $\psi$ at the two ends. Switch to the staircase to see the two finite pieces of slide 6 ($-v\,dx$ along AB, $u\,dy$ along BC). Then drag C onto a streamline below A's: $\psi_2 < \psi_1$, q turns negative and the arrow flips.`}</Md>
      }
    >
      <FlowField
        x={XD}
        y={YD}
        psi={corner.psi}
        phi={corner.phi}
        vel={corner.vel}
        psiLevels={PSI_LEVELS}
        phiLevels={PHI_LEVELS}
        particles={60}
        Uref={1.6}
        hover={false}
        maxHeight={420}
        overlay={overlay}
      />
      <div className="mt-2 text-sm text-ink-2">
        <Md>{md`Flow into a 90° corner, $\psi = Axy$ with $A = 1\ \mathrm{s^{-1}}$ ($u = Ax$, $v = -Ay$). Solid red line: the streamline through A ($\psi_1$); dashed red line: the streamline through C ($\psi_2$). Seen walking from A to C, a positive $q$ crosses the path from your left to your right.`}</Md>
      </div>
    </SimPanel>
  )
}
