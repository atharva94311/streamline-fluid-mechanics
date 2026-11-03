/**
 * Concept "phi-vs-psi": Fox Table 6.1 made live.
 * One quadratic f = A x² + B xy + C y², read either as a stream function or as a velocity potential (course sign).
 *  - as ψ: continuity holds identically; Laplace (∇²ψ = 2A + 2C = 0) ⇔ irrotational ⇔ a companion φ exists.
 *  - as φ: irrotationality holds identically; Laplace (∇²φ = 2A + 2C = 0) ⇔ incompressible ⇔ a companion ψ exists.
 */
import { useMemo, useState } from 'react'
import { FlowField, M, Md, Readout, Segmented, SimPanel, Slider, cx, md, type FlowMarker } from '@/kit'
import { frDec, norm, pTeX, type Poly } from './poly'

type Mode = 'psi' | 'phi'
const X: [number, number] = [-2, 2]
const Y: [number, number] = [-1.5, 1.5]
const ORIGIN: FlowMarker[] = [{ x: 0, y: 0, kind: 'stagnation' }]
const PRE: { label: string; abc: [number, number, number] }[] = [
  { label: 'x² − y²', abc: [1, 0, -1] },
  { label: 'xy', abc: [0, 1, 0] },
  { label: 'x² + y²', abc: [1, 0, 1] },
  { label: 'y²', abc: [0, 0, 1] },
]

const quad = (A: number, B: number, C: number): Poly =>
  norm([
    { i: 2, j: 0, c: frDec(A) },
    { i: 1, j: 1, c: frDec(B) },
    { i: 0, j: 2, c: frDec(C) },
  ])

export function Table61Lab() {
  const [mode, setMode] = useState<Mode>('psi')
  const [A, setA] = useState(1)
  const [B, setB] = useState(0)
  const [C, setC] = useState(1)
  const z = (v: number) => (Math.abs(v) < 1e-12 ? 0 : v)

  // velocity (course sign convention)
  const vel = useMemo(
    () =>
      mode === 'psi'
        ? (x: number, y: number): [number, number] => [B * x + 2 * C * y, -(2 * A * x + B * y)]
        : (x: number, y: number): [number, number] => [2 * A * x + B * y, B * x + 2 * C * y],
    [mode, A, B, C],
  )
  const f = useMemo(() => (x: number, y: number) => A * x * x + B * x * y + C * y * y, [A, B, C])
  const lap = 2 * A + 2 * C
  const harmonic = Math.abs(lap) < 1e-12
  // companion functions (exist only when harmonic)
  const compPsi = useMemo(() => (harmonic && mode === 'phi' ? (x: number, y: number) => 2 * A * x * y + 0.5 * B * (y * y - x * x) : undefined), [harmonic, mode, A, B])
  const compPhi = useMemo(() => (harmonic && mode === 'psi' ? (x: number, y: number) => 0.5 * B * (x * x - y * y) - 2 * A * x * y : undefined), [harmonic, mode, A, B])
  const psi = mode === 'psi' ? f : compPsi
  const phi = mode === 'phi' ? f : compPhi

  const div = mode === 'psi' ? 0 : lap // ∂u/∂x + ∂v/∂y
  const curl = mode === 'psi' ? -lap : 0 // ∂v/∂x − ∂u/∂y
  const fTeX = pTeX(quad(A, B, C))
  const compTeX =
    mode === 'psi'
      ? pTeX(norm([{ i: 2, j: 0, c: frDec(B / 2, 16) }, { i: 0, j: 2, c: frDec(-B / 2, 16) }, { i: 1, j: 1, c: frDec(-2 * A) }]))
      : pTeX(norm([{ i: 1, j: 1, c: frDec(2 * A) }, { i: 0, j: 2, c: frDec(B / 2, 16) }, { i: 2, j: 0, c: frDec(-B / 2, 16) }]))
  const nonzero = A !== 0 || B !== 0 || C !== 0

  const row = (active: boolean, name: string, always: string, alwaysVal: number, lapCond: string, ok: boolean) => (
    <tr className={cx('border-b border-line last:border-0', active ? 'bg-teal-50 dark:bg-teal-500/10' : 'opacity-60')}>
      <td className="px-2 py-1.5 font-semibold text-ink">{name}</td>
      <td className="px-2 py-1.5">
        <Md inline>{always}</Md> <span className="font-mono text-emerald-700 dark:text-emerald-300">= {z(alwaysVal)} ✓</span>
      </td>
      <td className="px-2 py-1.5">
        <Md inline>{lapCond}</Md>{' '}
        {active ? (
          <span className={cx('font-mono', ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>{ok ? '✓' : '✗'}</span>
        ) : null}
      </td>
    </tr>
  )

  return (
    <SimPanel
      title="Table 6.1 lab — one function, two readings"
      subtitle={md`$f = ${fTeX}$ read as ${mode === 'psi' ? '$\\psi$' : '$\\phi$'} (course signs)`}
      wide
      controls={
        <>
          <Segmented
            label="Read f as"
            options={[
              { value: 'psi' as Mode, label: md`stream function $\psi$` },
              { value: 'phi' as Mode, label: md`velocity potential $\phi$` },
            ]}
            value={mode}
            onChange={setMode}
          />
          <Slider label="$A$ (coefficient of $x^2$)" value={A} min={-2} max={2} step={0.25} onChange={setA} unit="s⁻¹" digits={2} />
          <Slider label="$B$ (coefficient of $xy$)" value={B} min={-2} max={2} step={0.25} onChange={setB} unit="s⁻¹" digits={2} />
          <Slider label="$C$ (coefficient of $y^2$)" value={C} min={-2} max={2} step={0.25} onChange={setC} unit="s⁻¹" digits={2} />
          <div className="flex flex-wrap gap-1">
            {PRE.map((p) => (
              <button
                key={p.label}
                type="button"
                className="btn-ghost px-2 py-1 text-xs"
                onClick={() => {
                  setA(p.abc[0])
                  setB(p.abc[1])
                  setC(p.abc[2])
                }}
              >
                f = {p.label}
              </button>
            ))}
          </div>
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\pd{u}{x} + \pd{v}{y}$`, value: z(div), unit: 's⁻¹', tone: z(div) === 0 ? 'good' : 'bad' },
            { label: md`$\pd{v}{x} - \pd{u}{y} = 2\omega_z$`, value: z(curl), unit: 's⁻¹', tone: z(curl) === 0 ? 'good' : 'bad' },
            { label: md`$\nabla^2 f = 2A + 2C$`, value: z(lap), unit: 's⁻¹', tone: harmonic ? 'good' : 'bad' },
            {
              label: mode === 'psi' ? 'companion φ exists?' : 'companion ψ exists?',
              value: harmonic && nonzero ? 'yes' : harmonic ? 'trivial' : 'no',
              tone: harmonic ? 'good' : 'bad',
            },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> pick f = x² + y² and flip between the two readings. As ψ it is a rigid rotation: continuity is automatic but
          ∇²ψ = 4 ≠ 0, so the flow is rotational and has no φ. As φ it is a radial expansion: irrotational automatically, but ∇²φ = 4 = ∇·V,
          so it is not incompressible and has no ψ. Now set C = −A: both readings satisfy Laplace's equation and the orthogonal flow net
          appears.
        </span>
      }
    >
      <div className="space-y-3">
        <FlowField
          x={X}
          y={Y}
          vel={vel}
          psi={nonzero ? psi : undefined}
          phi={nonzero ? phi : undefined}
          equipotentials={nonzero && !!phi}
          particles={nonzero ? 60 : 0}
          markers={nonzero ? ORIGIN : undefined}
          maxHeight={340}
        />
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[460px] text-xs">
            <thead className="bg-surface-2 text-ink-3">
              <tr>
                <th className="px-2 py-1.5 text-left font-semibold">reading</th>
                <th className="px-2 py-1.5 text-left font-semibold">always satisfies …</th>
                <th className="px-2 py-1.5 text-left font-semibold">Laplace holds only if …</th>
              </tr>
            </thead>
            <tbody>
              {row(mode === 'psi', 'f = ψ', md`continuity $u_x + v_y$`, 0, md`irrotational: $\nabla^2\psi = 0$`, harmonic)}
              {row(mode === 'phi', 'f = φ', md`irrotationality $v_x - u_y$`, 0, md`incompressible: $\nabla^2\phi = 0$`, harmonic)}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-ink-2">
          {harmonic && nonzero ? (
            <span>
              Companion function: <M tex={`${mode === 'psi' ? '\\phi' : '\\psi'} = ${compTeX} + \\text{const}`} />
            </span>
          ) : nonzero ? (
            <span>
              No companion function: <M tex={md`\nabla^2 f = ${lap}\ \mathrm{s^{-1}} \ne 0`} />{' '}
              {mode === 'psi' ? '— the flow is rotational, so no velocity potential exists.' : '— the flow is not incompressible, so no stream function exists.'}
            </span>
          ) : (
            <span>Set at least one coefficient to a non-zero value.</span>
          )}
        </div>
      </div>
    </SimPanel>
  )
}
