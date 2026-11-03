import { useRef, useState } from 'react'
import { Md, PlayPause, Readout, SimPanel, Slider, md, useAnimationFrame, usePrefersReducedMotion, useUid } from '@/kit'
import { AX, ArrowMarkers, pn, tri, useOnScreen } from './shared'

/*
 * Gas in a cylinder closed at x = 0, piston at x = L(t) moving with velocity U_p = dL/dt.
 * Model (piston speed ≪ speed of sound): density uniform in x, velocity linear u = U_p x / L.
 *   ρ(t) = ρ0 L0 / L,   ∂ρ/∂t = −ρ U_p / L,   ∂(ρu)/∂x = ρ U_p / L   →  sum = 0.
 */
const L0 = 0.2 // m
const LMIN = 0.08 // m
const XA = 0.04 // fixed CV faces (m)
const XB = 0.06
const PX0 = 30
const PXW = 380 // px for L0
const sxm = (x: number) => PX0 + (x / L0) * PXW

export function PistonSim() {
  const [vp, setVp] = useState(8) // |piston speed| m/s
  const [rho0, setRho0] = useState(12) // kg/m³ at L = L0
  const [phase, setPhase] = useState(0) // 0..1, 0 = L0, 0.5 = LMIN
  const [playing, setPlaying] = useState(true)
  const uid = useUid('pis')
  const wrap = useRef<HTMLDivElement>(null)
  const visible = useOnScreen(wrap)
  const reduced = usePrefersReducedMotion()
  useAnimationFrame((dt) => setPhase((p) => (p + dt / 7) % 1), playing && visible && !reduced)

  const L = L0 - (L0 - LMIN) * tri(phase)
  const compressing = phase % 1 < 0.5
  const Up = compressing ? -vp : vp // dL/dt
  const rho = (rho0 * L0) / L
  const dudx = Up / L
  const dRhoDt = -rho * Up / L
  const dFluxDx = rho * Up / L
  const fluxA = (rho * Up * XA) / L
  const fluxB = (rho * Up * XB) / L
  const Xp = sxm(L)
  const lines = Array.from({ length: 11 }, (_, i) => ((i + 1) / 12) * L)
  const shade = Math.min(0.55, 0.06 + 0.012 * rho)
  const arrowLen = (u: number) => (Math.abs(u) / vp) * 34

  return (
    <SimPanel
      title="Unsteady compressible flow: gas in a cylinder"
      subtitle="closed end at x = 0, piston at x = L(t) moving at Uₚ = dL/dt (= −Vₚ while compressing, +Vₚ while expanding)"
      wide
      controls={
        <>
          <Slider label={md`piston speed $V_p$`} value={vp} min={1} max={20} step={0.5} onChange={setVp} unit="m/s" digits={3} />
          <Slider label={md`initial density $\rho_0$ (at $L_0 = 0.2$ m)`} value={rho0} min={1} max={20} step={0.5} onChange={setRho0} unit="kg/m³" digits={3} />
          <Slider
            label="stroke position (scrub)"
            value={phase}
            min={0}
            max={0.999}
            step={0.001}
            onChange={(v) => {
              setPlaying(false)
              setPhase(v)
            }}
            format={(v) => (v < 0.5 ? 'compressing' : 'expanding')}
          />
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => setPhase(0)} />
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: md`$L$`, value: L * 100, unit: 'cm', digits: 3 },
            { label: md`$\rho$ (uniform)`, value: rho, unit: 'kg/m³', digits: 3 },
            { label: md`$\nabla\cdot\mathbf V=\partial u/\partial x$`, value: dudx, unit: '1/s', digits: 3 },
            { label: md`$\partial\rho/\partial t$`, value: dRhoDt, unit: 'kg/(m³·s)', digits: 4, tone: 'accent' },
            { label: md`$\partial(\rho u)/\partial x$`, value: dFluxDx, unit: 'kg/(m³·s)', digits: 4, tone: 'accent' },
            { label: 'sum of the two', value: Math.abs(dRhoDt + dFluxDx) < 1e-9 ? '0 ✓' : pn(dRhoDt + dFluxDx), tone: 'good' },
            { label: md`CV face A: $\rho u$`, value: fluxA, unit: 'kg/(m²·s)', digits: 3 },
            { label: md`CV face B: $\rho u$`, value: fluxB, unit: 'kg/(m²·s)', digits: 3 },
            { label: md`CV: $(\rho u_A-\rho u_B)/\Delta x$`, value: (fluxA - fluxB) / (XB - XA), unit: 'kg/(m³·s)', digits: 4, tone: 'accent' },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** at the start ($L = 0.2$ m, $V_p = 8$ m/s, $\rho_0 = 12$ kg/m³) the readout gives $\partial\rho/\partial t = 480$ kg/(m³·s) — the solved example. Watch the fixed control volume: during compression more mass enters through its right face than leaves through its left face, so the density inside rises; on the return stroke every sign flips. $\nabla\cdot\mathbf V \neq 0$ throughout, so this flow can never be treated as incompressible.`}
        </Md>
      }
    >
      <div ref={wrap}>
        <svg viewBox="0 0 440 230" className="block h-auto w-full" role="img" aria-label="Piston compressing gas in a cylinder">
          <defs>
            <ArrowMarkers id={uid} colors={{ u: 'var(--plot-2)', f: AX.pos }} size={3.4} />
          </defs>
          {/* gas */}
          <rect x={PX0} y={52} width={Xp - PX0} height={96} fill="var(--plot-6)" fillOpacity={shade} />
          {/* material lines (move with the gas) */}
          {lines.map((x, i) => (
            <line key={i} x1={sxm(x)} x2={sxm(x)} y1={56} y2={144} stroke="var(--plot-6)" strokeWidth={1} opacity={0.55} />
          ))}
          {/* cylinder walls */}
          <line x1={PX0} x2={PX0 + PXW + 10} y1={50} y2={50} stroke="var(--ink)" strokeWidth={3} />
          <line x1={PX0} x2={PX0 + PXW + 10} y1={150} y2={150} stroke="var(--ink)" strokeWidth={3} />
          <rect x={PX0 - 10} y={44} width={10} height={112} fill="var(--body-fill)" stroke="var(--ink)" strokeWidth={2} />
          {/* piston */}
          <rect x={Xp} y={52} width={14} height={96} rx={2} fill="var(--body-fill)" stroke="var(--ink)" strokeWidth={2} />
          <rect x={Xp + 14} y={92} width={Math.max(0, 440 - Xp - 14)} height={16} fill="var(--body-fill)" stroke="var(--ink)" strokeWidth={1.2} />
          <line
            x1={compressing ? Xp + 40 : Xp + 20}
            x2={compressing ? Xp + 20 : Xp + 40}
            y1={78}
            y2={78}
            stroke={AX.pos}
            strokeWidth={2.4}
            markerEnd={`url(#${uid}-f)`}
          />
          <text x={Xp + 46} y={82} fontSize={11} fontWeight={700} fill={AX.pos}>
            Vₚ
          </text>

          {/* fixed control volume */}
          <rect x={sxm(XA)} y={60} width={sxm(XB) - sxm(XA)} height={80} fill="none" stroke="var(--ink)" strokeWidth={1.6} strokeDasharray="5 3" />
          <text x={(sxm(XA) + sxm(XB)) / 2} y={44} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-ink">
            fixed CV
          </text>
          {/* ρu at the CV faces: |ρu| ∝ x, so the arrow at B is longer than at A */}
          {[
            { x: XA, f: fluxA, y: 84, len: (50 * XA) / XB, name: 'A' },
            { x: XB, f: fluxB, y: 116, len: 50, name: 'B' },
          ].map((o) => {
            const dir = Math.sign(o.f) || 1
            return (
              <g key={o.name}>
                <line x1={sxm(o.x)} x2={sxm(o.x) + dir * o.len} y1={o.y} y2={o.y} stroke="var(--plot-2)" strokeWidth={3} markerEnd={`url(#${uid}-u)`} />
                <text x={sxm(o.x) + (o.name === 'A' ? 4 : -4)} y={136} textAnchor={o.name === 'A' ? 'start' : 'end'} fontSize={11} fontWeight={700} className="fill-ink">
                  {o.name}
                </text>
              </g>
            )
          })}

          {/* velocity profile under the cylinder */}
          <text x={PX0} y={172} fontSize={11} className="fill-ink-2">u(x) = Uₚ·x / L   (arrows)</text>
          {lines.filter((_, i) => i % 2 === 1).map((x, i) => {
            const u = (Up * x) / L
            const len = arrowLen(u)
            const X = sxm(x)
            return <line key={i} x1={X} x2={X + Math.sign(u) * len} y1={190} y2={190} stroke="var(--plot-2)" strokeWidth={2} markerEnd={len > 3 ? `url(#${uid}-u)` : undefined} />
          })}
          <line x1={PX0} x2={Xp} y1={204} y2={204} stroke="var(--axis)" strokeWidth={1} />
          <text x={PX0} y={220} fontSize={10} className="fill-ink-3">x = 0 (u = 0)</text>
          <text x={Xp} y={220} fontSize={10} textAnchor="end" className="fill-ink-3">x = L (u = Uₚ)</text>
          <text x={436} y={226} textAnchor="end" fontSize={9.5} className="fill-ink-3">
            {compressing ? 'compression' : 'expansion'} · animation slowed down · ρu in kg/(m²·s)
          </text>
        </svg>
      </div>
    </SimPanel>
  )
}
