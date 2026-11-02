import { useMemo, useState } from 'react'
import { FlowField, SimPanel, Slider, Toggle, md, type Vec } from '@/kit'
import { TeXReadout } from './ui'
import { Arrow, arcPath, rad } from './svg'

/** Gate length (m): the segment AB runs from −(L/2)(cos β, sin β) to +(L/2)(cos β, sin β). */
const L = 2

/**
 * Uniform stream at angle α: streamlines ψ = U(y cos α − x sin α), equipotentials φ = U(x cos α + y sin α),
 * tracers, and a "gate" AB whose flow rate is read off as q = ψ_B − ψ_A (= U L sin(β − α)).
 */
export function UniformExplorer() {
  const [U, setU] = useState(2)
  const [alpha, setAlpha] = useState(30)
  const [beta, setBeta] = useState(100)
  const [showPhi, setShowPhi] = useState(true)
  const a = rad(alpha)
  const ca = Math.cos(a)
  const sa = Math.sin(a)

  const field = useMemo(() => {
    const levels = Array.from({ length: 17 }, (_, k) => +((k - 8) * 0.5 * U).toFixed(10))
    return {
      psi: (x: number, y: number) => U * (y * ca - x * sa),
      phi: (x: number, y: number) => U * (x * ca + y * sa),
      vel: (): Vec => [U * ca, U * sa],
      levels,
    }
  }, [U, ca, sa])

  const b = rad(beta)
  const A: Vec = [(-L / 2) * Math.cos(b), (-L / 2) * Math.sin(b)]
  const B: Vec = [(L / 2) * Math.cos(b), (L / 2) * Math.sin(b)]
  const psiA = field.psi(A[0], A[1])
  const psiB = field.psi(B[0], B[1])
  const q = psiB - psiA
  const ratio = q / (U * L)

  return (
    <SimPanel
      title="Uniform-flow explorer"
      subtitle={md`$\phi = U(x\cos\alpha + y\sin\alpha)$, $\psi = U(y\cos\alpha - x\sin\alpha)$`}
      controls={
        <>
          <Slider label="speed $U$" value={U} min={0.5} max={5} step={0.1} onChange={setU} unit="m/s" digits={2} />
          <Slider label="flow angle $\alpha$" value={alpha} min={-180} max={180} step={1} onChange={setAlpha} unit="°" format={(v) => v.toFixed(0)} />
          <Slider label="gate angle $\beta$ (segment AB)" value={beta} min={0} max={180} step={1} onChange={setBeta} unit="°" format={(v) => v.toFixed(0)} />
          <Toggle label="show equipotentials ($\phi$ = const)" checked={showPhi} onChange={setShowPhi} />
        </>
      }
      readout={
        <TeXReadout
          items={[
            { label: md`$u = U\cos\alpha$`, value: U * ca, unit: 'm/s' },
            { label: md`$v = U\sin\alpha$`, value: U * sa, unit: 'm/s' },
            { label: md`$\psi_A$`, value: psiA, unit: 'm²/s' },
            { label: md`$\psi_B$`, value: psiB, unit: 'm²/s' },
            { label: md`$q = \psi_B - \psi_A$`, value: q, unit: 'm²/s', tone: 'accent' },
            { label: md`$q/(UL) = \sin(\beta-\alpha)$`, value: Math.abs(ratio) < 5e-4 ? 0 : ratio },
          ]}
        />
      }
      footer={
        <>
          <b>Try this:</b> set the gate angle β equal to α — the gate then lies along a streamline, ψ<sub>A</sub> = ψ<sub>B</sub> and
          nothing crosses it. Now make β = α + 90°: the gate faces the stream and q reaches its maximum U·L. Grid squares are
          0.5 m: Δψ = Δφ = 0.5U between neighbouring lines. Hover anywhere to read u, v, ψ and φ.
        </>
      }
    >
      <FlowField
        x={[-3, 3]}
        y={[-2, 2]}
        psi={field.psi}
        phi={field.phi}
        vel={field.vel}
        psiLevels={field.levels}
        phiLevels={field.levels}
        equipotentials={showPhi}
        particles={110}
        Uref={U}
        overlay={({ sx, sy }) => {
          const k = sx(1) - sx(0) // px per metre
          // gate AB and the net flux arrow (right-hand normal of A→B times sign of q)
          const nR: Vec = [Math.sin(b), -Math.cos(b)]
          const sgn = Math.sign(q)
          const len = 0.95 * Math.min(1, Math.abs(ratio))
          const tip: Vec = [sgn * nR[0] * len, sgn * nR[1] * len]
          // flow-direction badge with the angle α
          const T: Vec = [-2.3, 1.3]
          const Tend: Vec = [T[0] + 0.62 * ca, T[1] + 0.62 * sa]
          return (
            <g>
              <line x1={sx(A[0])} y1={sy(A[1])} x2={sx(B[0])} y2={sy(B[1])} stroke="var(--plot-6)" strokeWidth={3.2} strokeLinecap="round" />
              {len > 0.04 ? (
                <Arrow x1={sx(0)} y1={sy(0)} x2={sx(tip[0])} y2={sy(tip[1])} color="var(--plot-6)" width={2.6} head={10} />
              ) : null}
              {[
                { p: A, t: 'A' },
                { p: B, t: 'B' },
              ].map(({ p, t }) => (
                <g key={t}>
                  <circle cx={sx(p[0])} cy={sy(p[1])} r={5} fill="var(--plot-6)" stroke="var(--surface)" strokeWidth={1.5} />
                  <text x={sx(p[0]) + 8} y={sy(p[1]) - 7} fontSize={13} fontWeight={700} fill="var(--plot-6)" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                    {t}
                  </text>
                </g>
              ))}
              <text
                x={Math.min(Math.max(sx(tip[0] * 1.15) + 6, sx(-3) + 4), sx(3) - 104)}
                y={Math.min(Math.max(sy(tip[1] * 1.15) + 4, sy(2) + 14), sy(-2) - 8)}
                fontSize={12}
                fontWeight={600}
                fill="var(--ink)"
                paintOrder="stroke"
                stroke="var(--surface)"
                strokeWidth={3}
              >
                {Math.abs(q) < 1e-3 ? 'q = 0' : `q = ${q.toFixed(2)} m²/s`}
              </text>
              <line x1={sx(T[0])} y1={sy(T[1])} x2={sx(T[0] + 0.62)} y2={sy(T[1])} stroke="var(--ink-3)" strokeWidth={1.2} strokeDasharray="3 3" />
              <path d={arcPath(sx(T[0]), sy(T[1]), 0.34 * k, 0, a)} fill="none" stroke="var(--ink-2)" strokeWidth={1.2} />
              <Arrow x1={sx(T[0])} y1={sy(T[1])} x2={sx(Tend[0])} y2={sy(Tend[1])} color="var(--ink)" width={2.6} head={10} />
              <text
                x={sx(T[0]) + 0.48 * k * Math.cos(a / 2)}
                y={sy(T[1]) - 0.48 * k * Math.sin(a / 2) + 4}
                fontSize={12}
                fontStyle="italic"
                textAnchor="middle"
                fill="var(--ink)"
                paintOrder="stroke"
                stroke="var(--surface)"
                strokeWidth={3}
              >
                α
              </text>
              <text x={sx(Tend[0]) + 6} y={sy(Tend[1]) - 4} fontSize={12} fontStyle="italic" fontWeight={700} fill="var(--ink)" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                U
              </text>
            </g>
          )
        }}
      />
    </SimPanel>
  )
}
