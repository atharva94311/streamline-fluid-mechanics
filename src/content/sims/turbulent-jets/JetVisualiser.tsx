import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Md,
  PlayPause,
  Readout,
  Segmented,
  SimPanel,
  Slider,
  md,
  num,
  useAnimationFrame,
  useElementSize,
  useInView,
  usePrefersReducedMotion,
} from '@/kit'
import {
  BETA_ML,
  ZETA_EDGE,
  centreline,
  eddyViscosity,
  exitFlow,
  halfWidth,
  jetFlow,
  jetVelocity,
  type JetModel,
  type JetState,
} from './jetSolutions'
import { Arrow } from './svg'

const L = 1 // length of the window, m
const NU_AIR = 1.5e-5 // m²/s
const N_JET = 150
const N_AMB = 110

interface P {
  x: number
  y: number
  amb: boolean
}

/**
 * Animated plane / round turbulent jet built from Wilkes' similarity solutions (Eqs. 9.113, 9.118/9.123, 9.132–9.133).
 * Tracers follow the mean velocity field plus a small random "eddy" kick; ambient tracers (orange) are entrained.
 */
export function JetVisualiser({ initialModel = 'ml' }: { initialModel?: JetModel }) {
  const [model, setModel] = useState<JetModel>(initialModel)
  const [U0, setU0] = useState(20)
  const [d0mm, setD0mm] = useState(10)
  const [xp, setXp] = useState(0.5)
  const [speed, setSpeed] = useState(1)
  const [playing, setPlaying] = useState(true)
  const reduced = usePrefersReducedMotion()
  const [wrapRef, size] = useElementSize<HTMLDivElement>()
  const inView = useInView(wrapRef)
  const [, setFrame] = useState(0)

  useEffect(() => {
    if (reduced) setPlaying(false)
  }, [reduced])

  const st: JetState = useMemo(() => ({ model, U0, d0: d0mm / 1000 }), [model, U0, d0mm])

  // ---- layout (uniform scale: 1 m of x and y map to the same number of pixels) ----
  const W = Math.max(300, Math.round(size.width || 640))
  const H = Math.round(num.clamp(W * 0.52, 220, 380))
  const px0 = 30
  const px1 = W - 8
  const s = (px1 - px0) / L
  const cy = H / 2
  const Y = (H / 2 - 6) / s // half-height of the window in metres
  const X = (x: number) => px0 + x * s
  const Yp = (y: number) => cy - y * s

  const sim = useRef<{ ps: P[]; rng: () => number }>({ ps: [], rng: num.seededRandom(7) })

  const spawnJet = (p: P, rng: () => number, anywhere: boolean) => {
    p.amb = false
    if (anywhere) {
      p.x = 0.02 + rng() * 0.98 * L
      p.y = (rng() * 2 - 1) * 1.3 * halfWidth(st, p.x)
    } else {
      p.x = 0.004 + rng() * 0.02
      p.y = (rng() * 2 - 1) * Math.max(st.d0 / 2, 0.004)
    }
  }
  const spawnAmb = (p: P, rng: () => number, anywhere: boolean) => {
    p.amb = true
    p.x = 0.02 + rng() * 0.96 * L
    const lim = 1.6 * halfWidth(st, p.x)
    if (anywhere && lim < Y) {
      const side = rng() < 0.5 ? -1 : 1
      p.y = side * (lim + rng() * (Y - lim))
    } else p.y = (rng() < 0.5 ? -1 : 1) * Y
  }

  const resetAll = () => {
    const rng = num.seededRandom(7)
    const ps: P[] = []
    for (let i = 0; i < N_JET; i++) {
      const p = { x: 0, y: 0, amb: false }
      spawnJet(p, rng, true)
      ps.push(p)
    }
    for (let i = 0; i < N_AMB; i++) {
      const p = { x: 0, y: 0, amb: true }
      spawnAmb(p, rng, true)
      ps.push(p)
    }
    sim.current = { ps, rng }
    setFrame((f) => f + 1)
  }
  useEffect(resetAll, [model, d0mm, H, W]) // eslint-disable-line react-hooks/exhaustive-deps

  // display time scale: the centre-line speed at mid-window maps to 0.35 L per second (× playback speed)
  const vRef = centreline(st, 0.5 * L)
  useAnimationFrame((dt) => {
    const S = sim.current
    const rng = S.rng
    const k = (0.35 * L * speed) / vRef // physical seconds per displayed second
    const h = dt * k
    const cap = 1.5 * L * speed * dt
    for (const p of S.ps) {
      const xx = Math.max(p.x, 0.004)
      const v = jetVelocity(st, xx, p.y)
      const u = Math.min(v.u, U0)
      const w = num.clamp(v.v, -U0, U0)
      let dx = u * h
      let dy = w * h
      const b = halfWidth(st, xx)
      if (u > 0.02 * centreline(st, xx)) {
        const D = 0.04 * b * u // illustrative eddy diffusivity for the random kick
        dy += Math.sqrt(2 * D * h) * num.gaussian(rng)
      }
      const m = Math.hypot(dx, dy)
      if (m > cap) {
        dx *= cap / m
        dy *= cap / m
      }
      p.x += dx
      p.y += dy
      if (p.x > L || Math.abs(p.y) > Y + 0.02 || p.x < 0) {
        if (p.amb) spawnAmb(p, rng, false)
        else spawnJet(p, rng, false)
      }
    }
    setFrame((f) => (f + 1) % 1000000)
  }, playing && inView)

  // ---- profile at the probe station ----
  const vc = centreline(st, xp)
  const b = halfWidth(st, xp)
  const A = 0.33 * (px1 - px0) // arrow length for v = U0
  const yMaxProf = Math.min(Y, (model === 'round' ? 3.2 : 2.6) * b)
  const prof: string[] = []
  for (let i = 0; i <= 80; i++) {
    const y = -yMaxProf + (2 * yMaxProf * i) / 80
    const u = Math.min(jetVelocity(st, xp, y).u, U0)
    prof.push(`${i ? 'L' : 'M'}${(X(xp) + (u / U0) * A).toFixed(1)},${Yp(y).toFixed(1)}`)
  }
  const arrowsY = Array.from({ length: 11 }, (_, i) => ((i - 5) / 5) * Math.min(yMaxProf, 2 * b))

  // half-width lines and (mixing-length model) the sharp edge
  const xEnd = L
  const bEnd = halfWidth(st, xEnd)
  const edgeSlope = ZETA_EDGE / BETA_ML

  const Q = jetFlow(st, xp)
  const Q0 = exitFlow(st)
  const vOut = jetVelocity(st, xp, Math.min(2.5 * b, Y)).v
  const plane = model !== 'round'
  const ratioLabel = plane ? md`$Q'/Q'_0$ (per unit depth)` : md`$Q/Q_0$`

  return (
    <SimPanel
      title="Jet visualiser"
      subtitle={md`mean flow of Wilkes' similarity solutions, air, $x \gg$ slot size`}
      wide
      controls={
        <>
          <Segmented
            label="Jet / model"
            value={model}
            onChange={setModel}
            options={[
              { value: 'ml', label: 'Plane · mixing length' },
              { value: 'tanh', label: 'Plane · tanh' },
              { value: 'round', label: 'Round' },
            ]}
          />
          <Slider label={md`exit velocity $U_0$`} value={U0} min={5} max={60} step={1} onChange={setU0} unit="m/s" />
          <Slider label={plane ? md`slot width $h_0$` : md`nozzle diameter $d_0$`} value={d0mm} min={2} max={20} step={1} onChange={setD0mm} unit="mm" />
          <Slider label={md`probe station ${plane ? '$x$' : '$z$'}`} value={xp} min={0.1} max={1} step={0.01} onChange={setXp} unit="m" digits={2} />
          <Slider label="playback speed" value={speed} min={0.25} max={3} step={0.25} onChange={setSpeed} unit="×" digits={2} />
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={resetAll} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`centre-line $\overline{v}_c$`, value: vc, unit: 'm/s', tone: 'accent' },
            { label: md`$\overline{v}_c/U_0$`, value: vc / U0 },
            { label: md`half-velocity width $b_{1/2}$`, value: b * 1000, unit: 'mm' },
            { label: ratioLabel, value: Q / Q0, tone: 'good' },
            { label: md`$\nu_{\mathrm T}$ ${model === 'ml' ? '(at $b_{1/2}$)' : ''}`, value: eddyViscosity(st, xp), unit: 'm²/s' },
            { label: md`inflow at $2.5\,b_{1/2}$`, value: vOut, unit: 'm/s' },
            { label: md`$\Rey_0 = U_0 ${plane ? 'h_0' : 'd_0'}/\nu$`, value: (U0 * st.d0) / NU_AIR, digits: 3 },
            { label: md`${plane ? '$x/h_0$' : '$z/d_0$'}`, value: xp / st.d0 },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** slide the probe from 0.25 m to 1 m. For a plane jet $\overline{v}_c$ falls by a factor of 2 (as $x^{-1/2}$) and the flow rate doubles (as $x^{1/2}$); switch to **Round** and the same 4-fold move cuts $\overline{v}_c$ by 4 (as $1/z$) while $Q$ grows 4-fold. Change $U_0$: the picture does not change shape — only the numbers scale. That is self-similarity.`}
        </Md>
      }
    >
      <div ref={wrapRef} className="w-full">
        <svg width={W} height={H} className="block max-w-full select-none" role="img" aria-label="Animated turbulent jet with entrained tracer particles">
          <rect x={px0} y={2} width={px1 - px0} height={H - 4} rx={6} fill="var(--surface-2)" stroke="var(--line)" />
          {/* half-velocity lines */}
          <line x1={X(0)} y1={cy} x2={X(xEnd)} y2={Yp(bEnd)} stroke="var(--ink-3)" strokeDasharray="5 5" strokeWidth={1.1} />
          <line x1={X(0)} y1={cy} x2={X(xEnd)} y2={Yp(-bEnd)} stroke="var(--ink-3)" strokeDasharray="5 5" strokeWidth={1.1} />
          {model === 'ml' ? (
            <>
              <line x1={X(0)} y1={cy} x2={X(xEnd)} y2={Yp(edgeSlope * xEnd)} stroke="var(--ink-2)" strokeDasharray="9 4" strokeWidth={1.4} />
              <line x1={X(0)} y1={cy} x2={X(xEnd)} y2={Yp(-edgeSlope * xEnd)} stroke="var(--ink-2)" strokeDasharray="9 4" strokeWidth={1.4} />
            </>
          ) : null}
          {/* slot / nozzle */}
          <rect x={4} y={cy - 9} width={px0 - 2} height={4} fill="var(--ink)" />
          <rect x={4} y={cy + 5} width={px0 - 2} height={4} fill="var(--ink)" />
          {/* tracers */}
          {sim.current.ps.map((p, i) => (
            <circle key={i} cx={X(p.x)} cy={Yp(p.y)} r={p.amb ? 2.3 : 2} fill={p.amb ? 'var(--plot-4)' : 'var(--plot-1)'} fillOpacity={0.85} />
          ))}
          {/* probe station and profile */}
          <line x1={X(xp)} y1={4} x2={X(xp)} y2={H - 4} stroke="var(--ink-2)" strokeWidth={1} strokeDasharray="3 3" />
          <path d={prof.join(' ')} fill="none" stroke="var(--plot-2)" strokeWidth={2.2} />
          {arrowsY.map((y, i) => {
            const u = Math.min(jetVelocity(st, xp, y).u, U0)
            return <Arrow key={i} x1={X(xp)} y1={Yp(y)} x2={X(xp) + Math.max((u / U0) * A, 1)} y2={Yp(y)} color="var(--plot-2)" width={1.3} head={5} />
          })}
          <text x={X(xp) + 4} y={14} fontSize={11} fill="var(--ink-2)">
            {plane ? 'x' : 'z'} = {xp.toFixed(2)} m
          </text>
          <text x={px1 - 6} y={H - 10} fontSize={10.5} textAnchor="end" fill="var(--ink-3)">
            {model === 'ml' ? 'long dash: edge ζ = 2.42 · short dash: b½' : 'dashed: half-velocity width b½'}
          </text>
          <g fontSize={10.5}>
            <circle cx={px0 + 12} cy={14} r={3} fill="var(--plot-1)" />
            <text x={px0 + 20} y={18} fill="var(--ink-2)">
              jet fluid
            </text>
            <circle cx={px0 + 78} cy={14} r={3} fill="var(--plot-4)" />
            <text x={px0 + 86} y={18} fill="var(--ink-2)">
              ambient fluid
            </text>
          </g>
        </svg>
      </div>
    </SimPanel>
  )
}
