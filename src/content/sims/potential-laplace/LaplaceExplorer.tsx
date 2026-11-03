/**
 * Concept "laplace": is a proposed potential a possible incompressible flow?
 * Build φ from harmonic pieces (uniform stream, 90° corner, rotated corner, 60° corner) plus a non-harmonic
 * expansion C(x² + y²), or type any φ(x, y). The page shows the flow net (equipotentials + streamlines when ψ exists)
 * and a numerical map of ∇²φ (fourth-order finite differences). Any φ is irrotational; ∇²φ = ∇·V decides incompressibility.
 */
import { useMemo, useState } from 'react'
import { FlowField, M, Readout, Segmented, SimPanel, Slider, cx, md, num } from '@/kit'
import { compileExpr, type Fn2 } from './expr'
import { Tx } from './svg'

type Mode = 'build' | 'type'
type Vec = [number, number]
const X0 = -2
const X1 = 2
const Y0 = -1.5
const Y1 = 1.5
const NXL = 40
const NYL = 30
const TYPED_PRESETS = ['x^3 - 3x y^2', 'exp(x) cos(y)', 'sin(x) cosh(y)', 'x^2 + y^2', 'x^2 y']

/** Fourth-order 5-point-per-direction Laplacian. */
function laplacian(f: Fn2, x: number, y: number, h = 0.01): number {
  const c = f(x, y)
  const xx = (-f(x + 2 * h, y) + 16 * f(x + h, y) - 30 * c + 16 * f(x - h, y) - f(x - 2 * h, y)) / (12 * h * h)
  const yy = (-f(x, y + 2 * h) + 16 * f(x, y + h) - 30 * c + 16 * f(x, y - h) - f(x, y - 2 * h)) / (12 * h * h)
  return xx + yy
}

/** ψ by integrating dψ = −v dx + u dy on a grid (bottom edge first, then up each column; Simpson per step). */
function numericPsi(vel: (x: number, y: number) => Vec): Fn2 | undefined {
  const nx = 121
  const ny = 91
  const dx = (X1 - X0) / (nx - 1)
  const dy = (Y1 - Y0) / (ny - 1)
  const g = new Float64Array(nx * ny)
  for (let i = 1; i < nx; i++) {
    const xa = X0 + (i - 1) * dx
    const vInt = (dx / 6) * (vel(xa, Y0)[1] + 4 * vel(xa + dx / 2, Y0)[1] + vel(xa + dx, Y0)[1])
    g[i] = g[i - 1] - vInt
  }
  for (let i = 0; i < nx; i++) {
    const x = X0 + i * dx
    for (let j = 1; j < ny; j++) {
      const ya = Y0 + (j - 1) * dy
      const uInt = (dy / 6) * (vel(x, ya)[0] + 4 * vel(x, ya + dy / 2)[0] + vel(x, ya + dy)[0])
      g[j * nx + i] = g[(j - 1) * nx + i] + uInt
    }
  }
  if (!g.every(Number.isFinite)) return undefined
  return (x, y) => {
    const fx = Math.min(nx - 1.000001, Math.max(0, (x - X0) / dx))
    const fy = Math.min(ny - 1.000001, Math.max(0, (y - Y0) / dy))
    const i = Math.floor(fx)
    const j = Math.floor(fy)
    const tx = fx - i
    const ty = fy - j
    const k = j * nx + i
    return (1 - ty) * ((1 - tx) * g[k] + tx * g[k + 1]) + ty * ((1 - tx) * g[k + nx] + tx * g[k + nx + 1])
  }
}

const term = (c: number, body: string, first: boolean) => {
  if (Math.abs(c) < 1e-12) return ''
  const mag = Math.abs(c)
  const coef = Math.abs(mag - 1) < 1e-12 ? '' : String(+mag.toFixed(2))
  return `${c < 0 ? (first ? '-' : ' - ') : first ? '' : ' + '}${coef}${body}`
}

export function LaplaceExplorer() {
  const [mode, setMode] = useState<Mode>('build')
  const [U, setU] = useState(0.5)
  const [A, setA] = useState(0.5)
  const [B, setB] = useState(0)
  const [D, setD] = useState(0)
  const [C, setC] = useState(0)
  const [raw, setRaw] = useState(TYPED_PRESETS[0])
  const [good, setGood] = useState(TYPED_PRESETS[0])
  const [err, setErr] = useState<string | undefined>()
  const typed = useMemo(() => compileExpr(good).f ?? ((x: number) => x), [good])

  const onType = (s: string) => {
    setRaw(s)
    const r = compileExpr(s)
    if (r.f) {
      setGood(s)
      setErr(undefined)
    } else setErr(r.error)
  }

  const field = useMemo(() => {
    if (mode === 'build') {
      const phi: Fn2 = (x, y) => U * x + A * (x * x - y * y) + B * x * y + D * (x ** 3 - 3 * x * y * y) + C * (x * x + y * y)
      const vel = (x: number, y: number): Vec => [
        U + 2 * A * x + B * y + 3 * D * (x * x - y * y) + 2 * C * x,
        -2 * A * y + B * x - 6 * D * x * y + 2 * C * y,
      ]
      const psi: Fn2 | undefined = Math.abs(C) < 1e-12 ? (x, y) => U * y + 2 * A * x * y + 0.5 * B * (y * y - x * x) + D * (3 * x * x * y - y ** 3) : undefined
      return { phi, vel, psi }
    }
    const f = typed
    const h = 1e-4
    const vel = (x: number, y: number): Vec => [(f(x + h, y) - f(x - h, y)) / (2 * h), (f(x, y + h) - f(x, y - h)) / (2 * h)]
    return { phi: f, vel, psi: undefined as Fn2 | undefined }
  }, [mode, U, A, B, D, C, typed])

  const stats = useMemo(() => {
    const lap = new Float64Array(NXL * NYL)
    let maxAbs = 0
    let lo = Infinity
    let hi = -Infinity
    let scale = 0
    let rotMax = 0
    const f = field.phi
    const hh = 1e-3
    for (let j = 0; j < NYL; j++)
      for (let i = 0; i < NXL; i++) {
        const x = X0 + ((i + 0.5) * (X1 - X0)) / NXL
        const y = Y0 + ((j + 0.5) * (Y1 - Y0)) / NYL
        const L = laplacian(f, x, y)
        lap[j * NXL + i] = L
        if (Number.isFinite(L)) {
          maxAbs = Math.max(maxAbs, Math.abs(L))
          lo = Math.min(lo, L)
          hi = Math.max(hi, L)
        }
        const fxx = (f(x + 0.01, y) - 2 * f(x, y) + f(x - 0.01, y)) / 1e-4
        if (Number.isFinite(fxx)) scale = Math.max(scale, Math.abs(fxx))
        if (i % 4 === 1 && j % 4 === 1) {
          const vx = (field.vel(x + hh, y)[1] - field.vel(x - hh, y)[1]) / (2 * hh)
          const uy = (field.vel(x, y + hh)[0] - field.vel(x, y - hh)[0]) / (2 * hh)
          const w = 0.5 * (vx - uy)
          if (Number.isFinite(w)) rotMax = Math.max(rotMax, Math.abs(w))
        }
      }
    const tol = 1e-6 * Math.max(1, scale)
    return { lap, maxAbs, lo, hi, harmonic: maxAbs < tol, irrot: rotMax < 1e-4 * Math.max(1, scale), rotMax }
  }, [field])

  const psi = useMemo(() => {
    if (field.psi) return field.psi
    if (mode === 'type' && stats.harmonic) return numericPsi(field.vel)
    return undefined
  }, [field, mode, stats.harmonic])

  const phiTeX =
    mode === 'build'
      ? (() => {
          const parts = [
            [U, 'x'],
            [A, '(x^2 - y^2)'],
            [B, 'xy'],
            [D, '(x^3 - 3xy^2)'],
            [C, '(x^2 + y^2)'],
          ] as [number, string][]
          let s = ''
          for (const [c, b] of parts) s += term(c, b, s === '')
          return s || '0'
        })()
      : null

  // heat map geometry (SVG units)
  const W = 400
  const Hh = 300
  const cw = W / NXL
  const ch = Hh / NYL
  const zero = (v: number) => (Math.abs(v) < 1e-9 ? 0 : v)

  return (
    <SimPanel
      title="Laplace check — is this φ a possible incompressible flow?"
      subtitle={phiTeX ? md`$\phi = ${phiTeX}$ (m²/s)` : md`typed $\phi(x, y)$`}
      wide
      controls={
        <>
          <Segmented
            label="Potential"
            options={[
              { value: 'build' as Mode, label: 'build from pieces' },
              { value: 'type' as Mode, label: 'type φ(x, y)' },
            ]}
            value={mode}
            onChange={setMode}
          />
          {mode === 'build' ? (
            <>
              <Slider label={md`uniform stream $U\,x$`} value={U} min={-1.5} max={1.5} step={0.1} onChange={setU} unit="m/s" digits={2} />
              <Slider label="corner $A(x^2 - y^2)$" value={A} min={-1} max={1} step={0.05} onChange={setA} unit="s⁻¹" digits={2} />
              <Slider label={md`rotated corner $B\,xy$`} value={B} min={-1} max={1} step={0.05} onChange={setB} unit="s⁻¹" digits={2} />
              <Slider label="60° corner $D(x^3 - 3xy^2)$" value={D} min={-0.5} max={0.5} step={0.05} onChange={setD} unit="m⁻¹s⁻¹" digits={2} />
              <Slider label="non-harmonic $C(x^2 + y^2)$" value={C} min={-0.5} max={0.5} step={0.05} onChange={setC} unit="s⁻¹" digits={2} />
            </>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm text-ink-2">
                φ(x, y) =
                <input
                  type="text"
                  value={raw}
                  onChange={(e) => onType(e.target.value)}
                  spellCheck={false}
                  className={cx(
                    'mt-1 w-full rounded-lg border bg-surface px-2 py-1.5 font-mono text-sm text-ink outline-none focus:ring-2 focus:ring-teal-400',
                    err ? 'border-rose-400' : 'border-line',
                  )}
                />
              </label>
              {err ? <div className="text-xs text-rose-700 dark:text-rose-300">{err} — showing the last valid φ.</div> : null}
              <div className="flex flex-wrap gap-1">
                {TYPED_PRESETS.map((p) => (
                  <button key={p} type="button" className="btn-ghost px-2 py-1 font-mono text-[11px]" onClick={() => onType(p)}>
                    {p}
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-ink-3">Use x, y, + − * / ^, pi, e, sin cos exp log sqrt sinh cosh atan2 … (2xy means 2·x·y).</div>
            </div>
          )}
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`max $\lvert\nabla^2\phi\rvert$`, value: zero(stats.maxAbs), unit: 's⁻¹', tone: stats.harmonic ? 'good' : 'bad' },
            { label: md`max $\lvert\omega_z\rvert$`, value: stats.irrot ? '≈ 0' : stats.rotMax, unit: 's⁻¹', tone: stats.irrot ? 'good' : 'bad' },
            { label: 'irrotational?', value: stats.irrot ? 'yes — always' : 'check input', tone: stats.irrot ? 'good' : 'bad' },
            { label: 'incompressible?', value: stats.harmonic ? 'yes: ∇²φ = 0' : 'no: ∇·V = ∇²φ', tone: stats.harmonic ? 'good' : 'bad' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> mix the harmonic pieces (U, A, B, D) any way you like — the ∇²φ map stays at zero and the streamlines cross the
          dashed equipotentials at right angles, because sums of harmonic functions are harmonic. Then add a little C: the map lights up at
          ∇²φ = 4C everywhere, the streamlines disappear (no ψ for a flow that creates volume), yet ω<sub>z</sub> stays zero. In "type φ",
          compare x^2 + y^2 with x^3 - 3x y^2 or exp(x) cos(y).
        </span>
      }
    >
      <div className="space-y-3">
        <FlowField
          x={[X0, X1]}
          y={[Y0, Y1]}
          phi={field.phi}
          vel={field.vel}
          psi={psi}
          equipotentials
          particles={60}
          maxHeight={300}
        />
        <figure className="mx-auto max-w-md">
          <svg viewBox={`-34 -8 ${W + 44} ${Hh + 44}`} className="block h-auto w-full" role="img" aria-label="Numerical Laplacian of phi">
            <rect x={0} y={0} width={W} height={Hh} fill="var(--field-bg)" stroke="var(--line)" />
            {stats.harmonic ? (
              <rect x={0} y={0} width={W} height={Hh} fill="var(--plot-5)" fillOpacity={0.1} />
            ) : (
              Array.from(stats.lap, (L, k) => {
                if (!Number.isFinite(L) || stats.maxAbs === 0) return null
                const i = k % NXL
                const j = (k - i) / NXL
                const a = Math.min(1, Math.abs(L) / stats.maxAbs)
                if (a < 0.02) return null
                return (
                  <rect
                    key={k}
                    x={i * cw}
                    y={Hh - (j + 1) * ch}
                    width={cw + 0.4}
                    height={ch + 0.4}
                    fill={L > 0 ? 'var(--plot-4)' : 'var(--plot-1)'}
                    fillOpacity={0.12 + 0.68 * a}
                  />
                )
              })
            )}
            {[-2, -1, 0, 1, 2].map((t) => (
              <Tx key={`x${t}`} x={((t - X0) / (X1 - X0)) * W} y={Hh + 14} size={11} anchor="middle" math={false} cls="fill-ink-3">
                {String(t).replace('-', '−')}
              </Tx>
            ))}
            {[-1.5, -0.75, 0, 0.75, 1.5].map((t) => (
              <Tx key={`y${t}`} x={-5} y={Hh - ((t - Y0) / (Y1 - Y0)) * Hh + 4} size={11} anchor="end" math={false} cls="fill-ink-3">
                {String(t).replace('-', '−')}
              </Tx>
            ))}
            <Tx x={W / 2} y={Hh + 31} size={12} anchor="middle" math={false} cls="fill-ink-2">
              x (m)
            </Tx>
            <text x={-26} y={Hh / 2} fontSize={12} textAnchor="middle" transform={`rotate(-90 -26 ${Hh / 2})`} className="fill-ink-2">
              y (m)
            </text>
            <Tx x={W / 2} y={Hh / 2 + 5} size={15} anchor="middle" math={false} weight={700} halo cls={stats.harmonic ? 'fill-emerald-700 dark:fill-emerald-300' : 'fill-ink'}>
              {stats.harmonic
                ? '∇²φ = 0 everywhere  ✓'
                : Math.abs(stats.hi - stats.lo) < 1e-6 * Math.max(1, Math.abs(stats.hi))
                  ? `∇²φ = ${num.fmt(zero(stats.hi), 3)} s⁻¹ everywhere`
                  : `∇²φ from ${num.fmt(zero(stats.lo), 3)} to ${num.fmt(zero(stats.hi), 3)} s⁻¹`}
            </Tx>
          </svg>
          <figcaption className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-ink-3">
            <span>
              numerical <M tex={md`\nabla^2\phi`} /> map
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-4 rounded-sm" style={{ background: 'var(--plot-4)' }} /> {'> 0'} (∇·V &gt; 0, expanding)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-4 rounded-sm" style={{ background: 'var(--plot-1)' }} /> {'< 0'} (compressing)
            </span>
          </figcaption>
        </figure>
      </div>
    </SimPanel>
  )
}
