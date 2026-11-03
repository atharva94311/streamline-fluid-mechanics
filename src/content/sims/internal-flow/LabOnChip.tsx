/**
 * Case study "Lab-on-a-chip" (Fox p. 275): two fluids meet in a T junction at Re ≪ 1.
 * Steady inflow → two side-by-side layers that never mix (laminar). Pulsed inflow → alternating slugs whose
 * interfaces are stretched by the (parabolic, laminar) channel profile — the "stretch and fold" that mixes
 * without turbulence. Kinematics only: each interface is advected as x(η, t) = u(η)(t − t_k),
 * u(η) = 1.5 Ū (1 − η²) (plane-channel laminar profile, supplementary); molecular diffusion is not modelled.
 */
import { useMemo, useRef, useState } from 'react'
import { PlayPause, Readout, Segmented, SimPanel, md, useAnimationFrame, useInView, usePrefersReducedMotion, useUid } from '@/kit'

const XJ = 70 // junction centre x
const XO0 = 100 // outlet start
const XO1 = 470 // outlet end
const YC = 100
const HW = 30 // outlet half-width (px)
const UPX = 26 // mean speed (px/s) in the outlet
const HALF_T = 1.6 // s per pulse half-period

function interfacePath(age: number): string {
  const pts: string[] = []
  for (let i = 0; i <= 24; i++) {
    const eta = -1 + (2 * i) / 24
    const x = XO0 + 1.5 * UPX * (1 - eta * eta) * age
    pts.push(`${Math.min(XO1 + 40, x).toFixed(1)},${(YC + eta * HW).toFixed(1)}`)
  }
  return pts.join(' L')
}

export function LabOnChip() {
  const [mode, setMode] = useState<'steady' | 'pulsed'>('pulsed')
  const [playing, setPlaying] = useState(true)
  const [t, setT] = useState(14)
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const uid = useUid('loc')
  useAnimationFrame((dt) => setT((v) => v + dt), playing && inView && !reduced)

  const C1 = 'var(--plot-2)'
  const C2 = 'var(--plot-3)'
  const k = Math.floor(t / HALF_T)
  const phase = k % 2 // 0 → fluid 1 flowing, 1 → fluid 2 flowing
  const bands = useMemo(() => {
    if (mode === 'steady') return []
    const out: { d: string; color: string }[] = []
    // interfaces at t_j = j·HALF_T; band between t_j and t_{j+1} carries fluid (j mod 2)
    for (let j = Math.max(0, k - 40); j <= k; j++) {
      const ageOld = t - j * HALF_T
      const ageNew = Math.max(0, t - (j + 1) * HALF_T)
      const a = interfacePath(ageOld)
      const b = interfacePath(ageNew).split(' L').reverse().join(' L')
      out.push({ d: `M${a} L${b} Z`, color: j % 2 === 0 ? C1 : C2 })
    }
    return out
  }, [mode, t, k])

  return (
    <SimPanel
      title="Lab-on-a-chip mixer — steady vs pulsed inflow"
      subtitle={md`T junction, ducts $\approx 200\ \mu\text{m}$ wide, $\bar V < 2$ mm/s, $\Rey \approx 0.4$`}
      controls={
        <>
          <Segmented
            label="Inflow"
            options={[
              { value: 'steady', label: 'steady (a)' },
              { value: 'pulsed', label: 'pulsed (b)' },
            ]}
            value={mode}
            onChange={setMode}
          />
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => setT(0)} />
        </>
      }
      readout={
        <Readout
          cols={1}
          items={[
            { label: 'flow rate (Fox)', value: '≈ 25', unit: 'nL/s' },
            { label: md`$\Rey \approx \bar V D/\nu$ (water, estimate)`, value: '≈ 0.4', tone: 'accent' },
            { label: 'regime', value: 'laminar', tone: 'good' },
            { label: 'time shown', value: t.toFixed(1), unit: 's' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> start with <i>steady</i>: the interface stays a straight line however long you wait — at Re ≈ 0.4 nothing stirs
          the fluids. Switch to <i>pulsed</i> and watch each slug boundary stretch into a long, thin chevron because the centre moves
          1.5× faster than average while the walls hold the fluid back; thin, folded layers are what lets diffusion finish the mixing
          within about 2 mm (Fox). Kinematic cartoon — diffusion itself is not drawn.
        </span>
      }
    >
      <div ref={ref}>
        <svg viewBox="0 0 480 200" className="h-auto w-full" role="img" aria-label="T-junction micromixer">
          <defs>
            <clipPath id={`${uid}o`}>
              <rect x={XO0} y={YC - HW} width={XO1 - XO0} height={2 * HW} />
            </clipPath>
          </defs>
          {/* inlet channels */}
          <rect x={XJ - HW} y={8} width={2 * HW} height={YC - HW - 8} fill={C1} opacity={0.75} />
          <rect x={XJ - HW} y={YC + HW} width={2 * HW} height={200 - 8 - YC - HW} fill={C2} opacity={0.75} />
          {/* junction square */}
          {mode === 'steady' ? (
            <>
              <rect x={XJ - HW} y={YC - HW} width={XO0 - XJ + HW} height={HW} fill={C1} opacity={0.75} />
              <rect x={XJ - HW} y={YC} width={XO0 - XJ + HW} height={HW} fill={C2} opacity={0.75} />
            </>
          ) : (
            <rect x={XJ - HW} y={YC - HW} width={XO0 - XJ + HW} height={2 * HW} fill={phase === 0 ? C1 : C2} opacity={0.75} />
          )}
          {/* outlet */}
          <g clipPath={`url(#${uid}o)`}>
            {mode === 'steady' ? (
              <>
                <rect x={XO0} y={YC - HW} width={XO1 - XO0} height={HW} fill={C1} opacity={0.75} />
                <rect x={XO0} y={YC} width={XO1 - XO0} height={HW} fill={C2} opacity={0.75} />
              </>
            ) : (
              <>
                <rect x={XO0} y={YC - HW} width={XO1 - XO0} height={2 * HW} fill="var(--surface-2)" />
                {bands.map((b, i) => (
                  <path key={i} d={b.d} fill={b.color} opacity={0.75} />
                ))}
              </>
            )}
          </g>
          {/* walls */}
          <path
            d={`M${XJ - HW},8 L${XJ - HW},${200 - 8} M${XJ + HW},8 L${XJ + HW},${YC - HW} L${XO1},${YC - HW} M${XJ + HW},${200 - 8} L${XJ + HW},${YC + HW} L${XO1},${YC + HW}`}
            fill="none"
            stroke="var(--ink-2)"
            strokeWidth={2}
          />
          <text x={XJ + HW + 8} y={24} className="fill-ink-2" fontSize={12}>
            fluid 1 ↓
          </text>
          <text x={XJ + HW + 8} y={186} className="fill-ink-2" fontSize={12}>
            fluid 2 ↑
          </text>
          <text x={XO1} y={YC - HW - 8} textAnchor="end" className="fill-ink-2" fontSize={12}>
            outlet →
          </text>
          <text x={XO1} y={YC + HW + 18} textAnchor="end" className="fill-ink-3" fontSize={10.5}>
            {mode === 'steady' ? 'two parallel layers — sharp interface, no mixing' : 'alternating slugs, interfaces stretched and folded'}
          </text>
        </svg>
      </div>
    </SimPanel>
  )
}
