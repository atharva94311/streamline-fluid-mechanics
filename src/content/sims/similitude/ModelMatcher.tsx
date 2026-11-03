/**
 * Reynolds-matching model-test planner (Fox §7.5, Example 7.4 logic):
 * pick prototype/model fluids and sizes → required model speed, Mach check, prototype force from a model force.
 */
import { useState } from 'react'
import { Md, Readout, Segmented, SimPanel, Slider, Toggle, md, num } from '@/kit'
import { FLUIDS } from './data'
import { Arrow, Sub, Tx, sci } from './svg'

type FluidId = 'seawater' | 'water' | 'air'
const FLUID_OPTS: { value: FluidId; label: string }[] = [
  { value: 'seawater', label: 'seawater' },
  { value: 'water', label: 'fresh water' },
  { value: 'air', label: 'air' },
]

/** Streamline y(x) around a circle of radius 1 in potential flow, ψ = y(1 − 1/r²) = c (upper half). */
function circleStream(c: number): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i <= 48; i++) {
    const x = -3 + (6 * i) / 48
    const f = (y: number) => y * (1 - 1 / (x * x + y * y)) - c
    // Bracket: just outside the body (f ≈ −c < 0 there) up to y = c + 3 (f > 0). For |x| ≥ 1 the lower end is y → 0⁺.
    const y = num.bisect(f, (Math.abs(x) < 1 ? Math.sqrt(1 - x * x) : 0) + 1e-6, c + 3)
    pts.push([x, y])
  }
  return pts
}
const LEVELS = [0.15, 0.45, 0.9, 1.5]
const STREAMS = LEVELS.map(circleStream)

function SpherePanel({ cx, cy, R, label, V, F, fluid, vLen }: { cx: number; cy: number; R: number; label: string; V: string; F: string; fluid: string; vLen: number }) {
  const s = R
  const toS = (p: [number, number], sign: 1 | -1) => `${(cx + p[0] * s).toFixed(1)},${(cy - sign * p[1] * s).toFixed(1)}`
  return (
    <g>
      {STREAMS.map((pts, i) =>
        ([1, -1] as const).map((sg) => (
          <polyline
            key={`${i}${sg}`}
            points={pts.filter((p) => Math.abs(p[0] * s) < 118 && p[1] * s < 80).map((p) => toS(p, sg)).join(' ')}
            fill="none"
            stroke="var(--streamline)"
            strokeOpacity={0.55}
            strokeWidth={1.1}
          />
        )),
      )}
      <circle cx={cx} cy={cy} r={R} fill="var(--body-fill)" stroke="var(--ink-2)" strokeWidth={1.5} />
      <Arrow x1={cx - 118} y1={cy - 62} x2={cx - 118 + vLen} y2={cy - 62} color="var(--plot-4)" width={2.4} />
      <Tx x={cx - 118} y={cy - 70} size={12} cls="fill-ink" halo>
        {V}
      </Tx>
      <Tx x={cx} y={cy + 92} size={13} anchor="middle" weight={700}>
        {label}
      </Tx>
      <Tx x={cx} y={cy + 108} size={11} anchor="middle" cls="fill-ink-3">
        {fluid} · {F}
      </Tx>
    </g>
  )
}

export function ModelMatcher() {
  const [pf, setPf] = useState<FluidId>('seawater')
  const [mf, setMf] = useState<FluidId>('air')
  const [Dp, setDp] = useState(0.3)
  const [Vp, setVp] = useState(2.57)
  const [Dm, setDm] = useState(0.152)
  const [Fm, setFm] = useState(2.7)
  const [lock, setLock] = useState(true)
  const [VmFree, setVmFree] = useState(20)

  const P = FLUIDS[pf]
  const Mo = FLUIDS[mf]
  const Rep = (Vp * Dp) / P.nu
  const VmReq = (Rep * Mo.nu) / Dm
  const Vm = lock ? VmReq : VmFree
  const Rem = (Vm * Dm) / Mo.nu
  const ratio = Rem / Rep
  const matched = Math.abs(ratio - 1) < 0.02
  const Mach = Vm / Mo.c
  const Fp = Fm * (P.rho / Mo.rho) * (Vp / Vm) ** 2 * (Dp / Dm) ** 2
  const PiF = Fm / (Mo.rho * Vm * Vm * Dm * Dm)

  const preset = () => {
    setPf('seawater')
    setMf('air')
    setDp(0.3)
    setVp(2.57)
    setDm(0.152)
    setFm(2.7)
    setLock(true)
  }

  // drawing scales
  const Rp = 52
  const Rm = Math.max(6, Math.min(70, Rp * (Dm / Dp)))
  const vlen = (v: number) => num.clamp(18 + 22 * Math.log10(Math.max(v, 0.1) / 0.1), 18, 100)
  const gx = (re: number) => 30 + ((Math.log10(num.clamp(re, 1e3, 1e9)) - 3) / 6) * 460

  return (
    <SimPanel
      title="Model–prototype matcher (Reynolds similarity)"
      subtitle={md`sphere drag, $F/\rho V^2D^2 = f_1(\rho VD/\mu)$`}
      wide
      controls={
        <>
          <button type="button" onClick={preset} className="w-full rounded-lg border border-teal-300 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200">
            Load Example 7.4 (sonar transducer)
          </button>
          <Segmented label="Prototype fluid" options={FLUID_OPTS} value={pf} onChange={setPf} />
          <Slider label="Prototype diameter $D_p$" value={Dp} min={0.05} max={2} step={0.01} onChange={setDp} unit="m" />
          <Slider label="Prototype speed $V_p$" value={Vp} min={0.2} max={30} step={0.01} onChange={setVp} unit="m/s" />
          <Segmented label="Model fluid" options={FLUID_OPTS} value={mf} onChange={setMf} />
          <Slider label="Model diameter $D_m$" value={Dm} min={0.02} max={1} step={0.001} onChange={setDm} unit="m" />
          <Toggle label="Run the test at $Re_m = Re_p$" checked={lock} onChange={setLock} />
          {!lock ? <Slider label="Test speed $V_m$" value={VmFree} min={0.1} max={400} log onChange={setVmFree} unit="m/s" /> : null}
          <Slider label="Measured model force $F_m$" value={Fm} min={0.1} max={50} step={0.1} onChange={setFm} unit="N" />
        </>
      }
      readout={
        <Readout
          items={[
            { label: '$Re_p$', value: sci(Rep) },
            { label: '$Re_m/Re_p$', value: ratio, digits: 3, tone: matched ? 'good' : 'bad' },
            { label: 'required $V_m$', value: VmReq, unit: 'm/s', tone: 'accent' },
            { label: Mo.gas ? 'model Mach $V_m/c$' : 'model fluid', value: Mo.gas ? Mach : 'liquid', digits: 2, tone: Mo.gas && Mach > 0.3 ? 'bad' : 'good' },
            { label: md`$F/\rho V^2D^2$ (model)`, value: sci(PiF) },
            { label: 'predicted $F_p$', value: matched ? Fp : 'not similar', unit: matched ? 'N' : undefined, digits: 3, tone: matched ? 'accent' : 'bad' },
          ]}
        />
      }
      footer={
        <Md>{md`**Try this:** load Example 7.4, then switch the model fluid to fresh water — the required speed drops from about 47 m/s to about 3 m/s. Turn the $Re$ lock off and test the air model at the *prototype* speed: $Re_m/Re_p$ goes red and the force can no longer be scaled. Push $V_p$ up with an air model until the Mach flag turns red.`}</Md>
      }
    >
      <svg viewBox="0 0 520 300" className="h-auto w-full" role="img" aria-label="Prototype and model spheres with streamlines and a Reynolds-number gauge">
        <rect x={2} y={2} width={256} height={226} rx={10} fill="var(--plot-2)" fillOpacity={0.06} stroke="var(--line)" />
        <rect x={262} y={2} width={256} height={226} rx={10} fill="var(--plot-7)" fillOpacity={0.06} stroke="var(--line)" />
        <SpherePanel cx={130} cy={104} R={Rp} label="Prototype" fluid={P.name} V={`V = ${Vp.toFixed(2)} m/s`} F={`Fₚ ≈ ${matched ? Fp.toFixed(1) + ' N' : '?'}`} vLen={vlen(Vp)} />
        <SpherePanel cx={390} cy={104} R={Rm} label="Model" fluid={Mo.name} V={`V = ${Vm.toPrecision(3)} m/s`} F={`Fₘ = ${Fm.toFixed(1)} N`} vLen={vlen(Vm)} />
        {/* Re gauge */}
        <line x1={30} y1={262} x2={490} y2={262} stroke="var(--axis)" />
        {[3, 4, 5, 6, 7, 8, 9].map((e) => (
          <g key={e}>
            <line x1={gx(10 ** e)} y1={258} x2={gx(10 ** e)} y2={266} stroke="var(--axis)" />
            <Tx x={gx(10 ** e)} y={282} size={11} anchor="middle" cls="fill-ink-3">
              {`10${['³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'][e - 3]}`}
            </Tx>
          </g>
        ))}
        <Tx x={30} y={296} size={11} cls="fill-ink-3">
          Reynolds number (log scale)
        </Tx>
        <circle cx={gx(Rep)} cy={262} r={7} fill="var(--plot-2)" />
        <Tx x={gx(Rep)} y={250} size={12} anchor="middle" math halo>
          Re<Sub>p</Sub>
        </Tx>
        <circle cx={gx(Rem)} cy={262} r={4.5} fill={matched ? 'var(--plot-5)' : 'var(--plot-4)'} />
        <Tx x={gx(Rem)} y={matched ? 240 : 250} size={12} anchor="middle" math halo>
          Re<Sub>m</Sub>
        </Tx>
        <Tx x={490} y={246} size={12} anchor="end" weight={700} cls={matched ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-rose-600 dark:fill-rose-400'}>
          {matched ? 'dynamically similar ✓' : 'Re not matched ✗'}
        </Tx>
      </svg>
    </SimPanel>
  )
}
