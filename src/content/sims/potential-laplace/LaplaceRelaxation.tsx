/**
 * Concept "laplace": potential flow is a boundary-value problem.
 * Laplace's equation is solved on a 2-D duct by successive over-relaxation (each node moves towards the mean of its
 * neighbours). φ: φ = 0 at the inlet, φ = 1 m²/s at the outlet, ∂φ/∂n = 0 on walls (no flow through them).
 * ψ (also harmonic in plane potential flow): ψ constant on each wall, ∂ψ/∂x = 0 at inlet and outlet; it is scaled by the
 * flow rate Q found from φ so that equal level spacings give a flow net of curvilinear squares.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlowField, PlayPause, Readout, Segmented, SimPanel, Slider, Toggle, md, num, useAnimationFrame, useInView, usePrefersReducedMotion } from '@/kit'

const LX = 4
const LY = 1.5
const H = 0.05
const NX = Math.round(LX / H) + 1 // 81
const NY = Math.round(LY / H) + 1 // 31
const OMEGA = 1.92
const TOL = 1e-6
const MAX_SWEEPS = 6000

type Geo = 'straight' | 'block' | 'step' | 'baffles'
interface Box {
  x0: number
  x1: number
  y0: number
  y1: number
  top: boolean
}
const GEOS: Record<Geo, { label: string; boxes: Box[] }> = {
  straight: { label: 'straight duct', boxes: [] },
  block: { label: 'block on floor', boxes: [{ x0: 1.6, x1: 2.4, y0: 0, y1: 0.7, top: false }] },
  step: { label: 'step', boxes: [{ x0: 2, x1: 4, y0: 0, y1: 0.6, top: false }] },
  baffles: {
    label: 'two baffles',
    boxes: [
      { x0: 1.2, x1: 1.5, y0: 0, y1: 0.9, top: false },
      { x0: 2.5, x1: 2.8, y0: 0.6, y1: 1.5, top: true },
    ],
  },
}

/** 0 = fluid, 1 = solid attached to the floor (ψ = 0), 2 = solid attached to the roof (ψ = 1). */
function classify(geo: Geo): Uint8Array {
  const cls = new Uint8Array(NX * NY)
  for (let j = 0; j < NY; j++)
    for (let i = 0; i < NX; i++) {
      const x = i * H
      const y = j * H
      for (const b of GEOS[geo].boxes)
        if (x >= b.x0 - 1e-9 && x <= b.x1 + 1e-9 && y >= b.y0 - 1e-9 && y <= b.y1 + 1e-9) cls[j * NX + i] = b.top ? 2 : 1
    }
  return cls
}

function initFields(cls: Uint8Array, scramble: boolean, seed: number) {
  const rnd = num.seededRandom(seed)
  const phi = new Float64Array(NX * NY)
  const psi = new Float64Array(NX * NY)
  for (let j = 0; j < NY; j++)
    for (let i = 0; i < NX; i++) {
      const k = j * NX + i
      phi[k] = i === NX - 1 ? 1 : i === 0 ? 0 : scramble ? rnd() : 0
      if (cls[k]) psi[k] = cls[k] === 2 ? 1 : 0
      else if (j === 0) psi[k] = 0
      else if (j === NY - 1) psi[k] = 1
      else psi[k] = scramble ? rnd() : 0
    }
  return { phi, psi }
}

/** One SOR sweep for φ (Dirichlet at inlet/outlet, Neumann on walls). Returns max |mean of neighbours − value|. */
function sweepPhi(phi: Float64Array, cls: Uint8Array): number {
  let res = 0
  for (let j = 0; j < NY; j++)
    for (let i = 1; i < NX - 1; i++) {
      const k = j * NX + i
      if (cls[k]) continue
      let s = 0
      let n = 0
      if (!cls[k - 1]) (s += phi[k - 1]), n++
      if (!cls[k + 1]) (s += phi[k + 1]), n++
      if (j > 0 && !cls[k - NX]) (s += phi[k - NX]), n++
      if (j < NY - 1 && !cls[k + NX]) (s += phi[k + NX]), n++
      if (!n) continue
      const r = s / n - phi[k]
      if (Math.abs(r) > res) res = Math.abs(r)
      phi[k] += OMEGA * r
    }
  return res
}

/** One SOR sweep for ψ (Dirichlet on walls and bodies, Neumann at inlet/outlet). */
function sweepPsi(psi: Float64Array, cls: Uint8Array): number {
  let res = 0
  for (let j = 1; j < NY - 1; j++)
    for (let i = 0; i < NX; i++) {
      const k = j * NX + i
      if (cls[k]) continue
      let s = psi[k - NX] + psi[k + NX]
      let n = 2
      if (i > 0) (s += psi[k - 1]), n++
      if (i < NX - 1) (s += psi[k + 1]), n++
      const r = s / n - psi[k]
      if (Math.abs(r) > res) res = Math.abs(r)
      psi[k] += OMEGA * r
    }
  return res
}

/** Flow rate per unit depth through the inlet, Q = ∫ ∂φ/∂x dy (second-order one-sided difference). */
function inletFlow(phi: Float64Array, cls: Uint8Array): number {
  let q = 0
  for (let j = 0; j < NY; j++) {
    const k = j * NX
    if (cls[k] || cls[k + 1] || cls[k + 2]) continue
    const u = (-3 * phi[k] + 4 * phi[k + 1] - phi[k + 2]) / (2 * H)
    q += (j === 0 || j === NY - 1 ? 0.5 : 1) * H * u
  }
  return q
}

function bilinear(a: Float64Array) {
  return (x: number, y: number) => {
    const fx = Math.min(NX - 1.000001, Math.max(0, x / H))
    const fy = Math.min(NY - 1.000001, Math.max(0, y / H))
    const i = Math.floor(fx)
    const j = Math.floor(fy)
    const tx = fx - i
    const ty = fy - j
    const k = j * NX + i
    return (1 - ty) * ((1 - tx) * a[k] + tx * a[k + 1]) + ty * ((1 - tx) * a[k + NX] + tx * a[k + NX + 1])
  }
}

export function LaplaceRelaxation() {
  const [geo, setGeo] = useState<Geo>('block')
  const cls = useMemo(() => classify(geo), [geo])
  const fields = useRef(initFields(cls, false, 1))
  const [ver, setVer] = useState(0)
  const [sweeps, setSweeps] = useState(0)
  const [res, setRes] = useState(1)
  const [running, setRunning] = useState(true)
  const [spf, setSpf] = useState(3)
  const [showPsi, setShowPsi] = useState(true)
  const seed = useRef(1)
  const reduced = usePrefersReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box)

  const solveNow = useCallback(() => {
    let n = 0
    let r = 1
    while (n < MAX_SWEEPS && r > TOL) {
      r = Math.max(sweepPhi(fields.current.phi, cls), sweepPsi(fields.current.psi, cls))
      n++
    }
    return [n, r] as const
  }, [cls])

  const restart = useCallback(
    (scramble: boolean) => {
      seed.current += 1
      fields.current = initFields(cls, scramble, seed.current)
      if (reduced) {
        const [n, r] = solveNow()
        setSweeps(n)
        setRes(r)
        setRunning(false)
      } else {
        setSweeps(0)
        setRes(1)
        setRunning(true)
      }
      setVer((v) => v + 1)
    },
    [cls, reduced, solveNow],
  )

  // new geometry (or reduced-motion preference) → start again from φ = 0 inside
  useEffect(() => {
    restart(false)
  }, [restart])

  const converged = res < TOL
  useAnimationFrame(() => {
    let r = 1
    for (let s = 0; s < spf; s++) r = Math.max(sweepPhi(fields.current.phi, cls), sweepPsi(fields.current.psi, cls))
    setSweeps((n) => n + spf)
    setRes(r)
    if (r < TOL) setRunning(false)
    setVer((v) => v + 1)
  }, running && inView && !reduced && !converged)

  // display copies: extend φ smoothly into solid nodes (hidden under the body) so contours reach the walls
  const view = useMemo(() => {
    const phi = Float64Array.from(fields.current.phi)
    for (let pass = 0; pass < 4; pass++)
      for (let k = 0; k < NX * NY; k++) {
        if (!cls[k]) continue
        const i = k % NX
        const j = (k - i) / NX
        let s = 0
        let n = 0
        if (i > 0) (s += phi[k - 1]), n++
        if (i < NX - 1) (s += phi[k + 1]), n++
        if (j > 0) (s += phi[k - NX]), n++
        if (j < NY - 1) (s += phi[k + NX]), n++
        phi[k] = s / n
      }
    const Q = inletFlow(fields.current.phi, cls)
    const psi = Float64Array.from(fields.current.psi, (v) => v * Q)
    const u = new Float64Array(NX * NY)
    const v = new Float64Array(NX * NY)
    for (let j = 0; j < NY; j++)
      for (let i = 0; i < NX; i++) {
        const k = j * NX + i
        u[k] = i === 0 ? (phi[k + 1] - phi[k]) / H : i === NX - 1 ? (phi[k] - phi[k - 1]) / H : (phi[k + 1] - phi[k - 1]) / (2 * H)
        v[k] = j === 0 ? (phi[k + NX] - phi[k]) / H : j === NY - 1 ? (phi[k] - phi[k - NX]) / H : (phi[k + NX] - phi[k - NX]) / (2 * H)
      }
    const fu = bilinear(u)
    const fv = bilinear(v)
    // equal spacing Δ = Q/8 for both families → curvilinear squares once converged (capped at 39 equipotentials)
    let step = Math.max(Q, 0.15) / 8
    let nPhi = Math.floor((1 - 1e-9) / step)
    if (nPhi > 39) {
      nPhi = 39
      step = 1 / 40
    }
    const phiLevels = Array.from({ length: nPhi }, (_, k) => (k + 1) * step)
    const psiLevels = Q > 1e-6 ? Array.from({ length: 7 }, (_, m) => ((m + 1) * Q) / 8) : []
    let vmax = 0
    for (let k = 0; k < NX * NY; k++) if (!cls[k]) vmax = Math.max(vmax, Math.hypot(u[k], v[k]))
    return {
      phi: bilinear(phi),
      psi: Q > 1e-6 ? bilinear(psi) : undefined,
      vel: (x: number, y: number): [number, number] => [fu(x, y), fv(x, y)],
      Q,
      vmax,
      phiLevels,
      psiLevels,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ver, cls])

  const body = useMemo(() => {
    const boxes = GEOS[geo].boxes
    return boxes.length ? (x: number, y: number) => boxes.some((b) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1) : undefined
  }, [geo])

  return (
    <SimPanel
      title="Laplace solver — the boundaries decide the flow"
      subtitle={md`$\nabla^2\phi = 0$ by relaxation: every node is driven towards the mean of its four neighbours`}
      wide
      controls={
        <>
          <Segmented
            label="Duct"
            options={(Object.keys(GEOS) as Geo[]).map((g) => ({ value: g, label: GEOS[g].label }))}
            value={geo}
            onChange={setGeo}
          />
          <PlayPause playing={running && !converged} onToggle={() => (converged ? restart(false) : setRunning((r) => !r))} onReset={() => restart(false)} />
          <button type="button" className="btn-ghost w-full justify-center" onClick={() => restart(true)}>
            Scramble the interior
          </button>
          <Slider label="sweeps per frame" value={spf} min={1} max={40} step={1} onChange={(v) => setSpf(Math.round(v))} format={(v) => String(Math.round(v))} />
          <Toggle label={md`show streamlines ($\psi$ solves Laplace too)`} checked={showPsi} onChange={setShowPsi} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'sweeps', value: String(sweeps) },
            { label: md`max $\lvert \bar\phi_{\rm nb} - \phi_P \rvert$`, value: res, unit: 'm²/s', digits: 2, tone: converged ? 'good' : 'default' },
            { label: md`flow rate $Q$`, value: view.Q, unit: 'm²/s' },
            { label: md`max speed $\lvert\mathbf V\rvert$`, value: view.vmax, unit: 'm/s' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> watch φ "soak in" from the outlet until every node equals the average of its neighbours (that <i>is</i> ∇²φ = 0
          on the grid). Then press <i>Scramble the interior</i>: whatever the starting guess, it relaxes to exactly the same picture — the
          solution is fixed by the boundary values alone. Equipotentials meet the walls at right angles (no flow through a wall), and the
          flow speeds up where the duct narrows (closer lines).
        </span>
      }
    >
      <div ref={box}>
        <FlowField
          x={[0, LX]}
          y={[0, LY]}
          phi={view.phi}
          psi={showPsi ? view.psi : undefined}
          vel={view.vel}
          equipotentials
          streamlines={showPsi && !!view.psi}
          phiLevels={view.phiLevels}
          psiLevels={view.psiLevels.length ? view.psiLevels : 1}
          body={body}
          particles={converged ? 50 : 0}
          maxHeight={300}
          cut={0.5}
        />
        <div className="mt-1 flex flex-wrap justify-between gap-2 text-[11px] text-ink-3">
          <span>inlet: φ = 0</span>
          <span>walls: ∂φ/∂n = 0 · x, y in m</span>
          <span>outlet: φ = 1 m²/s</span>
        </div>
      </div>
    </SimPanel>
  )
}
