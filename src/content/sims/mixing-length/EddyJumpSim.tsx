import { useEffect, useRef, useState } from 'react'
import { Md, PlayPause, Readout, SimPanel, Slider, md, num, useAnimationFrame, useElementSize, useInView, usePrefersReducedMotion } from '@/kit'
import { Arrow, SvgTex } from './svg'

const RHO = 1000 // water, kg/m³
const NU = 1.0e-6 // water, m²/s
const U0 = 1.5 // mean velocity at plane X–X, m/s
const Y_MAX = 0.035 // half-height of the window, m
const T_TRAVEL = 1.1 // animation time for one eddy jump, s
const T_MIX = 0.8 // time the "mixing" puff stays visible, s
const SPAWN = 0.45 // time between eddy pairs, s
const PX_PER_MS = 34 // horizontal drift: px per (m/s) of carried velocity
const ARROW_PX_PER_MS = 140 // length of the velocity-deficiency arrow, px per (m/s)
const VB = 'v̄'
const LT = 'λ̃' // λ with tilde (RMS travel distance)

interface Eddy {
  id: number
  /** horizontal position as a fraction of the flow window */
  xf: number
  /** signed travel distance λ (m): > 0 for an eddy coming up from below */
  lam: number
  /** signed velocity v′y (m/s), same sign as λ */
  v: number
  /** time since launch (s) */
  t: number
  /** time since arrival at X–X (s); −1 while still travelling */
  mix: number
}

interface Stats {
  n: number
  sV: number
  sVL: number
  sM: number
  sV2: number
  sL2: number
}
const emptyStats = (): Stats => ({ n: 0, sV: 0, sVL: 0, sM: 0, sV2: 0, sL2: 0 })
const wrap01 = (x: number) => ((x % 1) + 1) % 1

/**
 * Monte-Carlo version of Wilkes' eddy model (Fig. 9.5, Eqs. 9.17–9.19): eddies leave planes at a random
 * distance λ above/below X–X, carry the mean x-velocity of their origin, cross X–X with velocity v′y and mix.
 * The running averages reproduce  M̄ = −ρ ν_T dv̄x/dy  with  ν_T = mean(v′y λ).
 */
export function EddyJumpSim() {
  const [G, setG] = useState(20)
  const [lamMM, setLamMM] = useState(8)
  const [vRms, setVRms] = useState(0.15)
  const [playing, setPlaying] = useState(true)
  const reduced = usePrefersReducedMotion()
  const [wrapRef, size] = useElementSize<HTMLDivElement>()
  const inView = useInView(wrapRef)
  const [, setFrame] = useState(0)
  const sim = useRef({ eddies: [] as Eddy[], stats: emptyStats(), acc: SPAWN, time: 0, nextId: 0, rng: num.seededRandom(11) })

  useEffect(() => {
    if (reduced) setPlaying(false)
  }, [reduced])

  const lamRms = lamMM / 1000

  const resetAll = () => {
    const s = sim.current
    s.eddies = []
    s.stats = emptyStats()
    s.acc = SPAWN
    s.rng = num.seededRandom(11)
    setFrame((f) => f + 1)
  }
  // statistics belong to one set of parameters: start afresh whenever a slider moves
  useEffect(resetAll, [G, lamMM, vRms]) // eslint-disable-line react-hooks/exhaustive-deps

  const draw = () => {
    const s = sim.current
    const g = Math.min(2.8, Math.abs(num.gaussian(s.rng)))
    const h = Math.min(3, Math.abs(num.gaussian(s.rng)))
    return { lam: lamRms * g, v: vRms * h }
  }
  const record = (lam: number, v: number) => {
    const st = sim.current.stats
    st.n += 1
    st.sV += v
    st.sVL += v * lam
    st.sM += v * RHO * (U0 - lam * G) // Eq. (9.17): Ṁ = v′y (ρv̄x − λ d(ρv̄x)/dy)
    st.sV2 += v * v
    st.sL2 += lam * lam
  }
  const spawnPair = () => {
    const s = sim.current
    const { lam, v } = draw()
    s.eddies.push({ id: s.nextId++, xf: s.rng(), lam, v, t: 0, mix: -1 })
    s.eddies.push({ id: s.nextId++, xf: s.rng(), lam: -lam, v: -v, t: 0, mix: -1 })
  }
  const fastForward = () => {
    for (let i = 0; i < 250; i++) {
      const { lam, v } = draw()
      record(lam, v)
      record(-lam, -v)
    }
    setFrame((f) => f + 1)
  }

  // ---- layout (px; text stays readable at any width) ----
  const W = Math.max(300, Math.round(size.width || 640))
  const H = 320
  const profW = Math.round(Math.min(170, Math.max(112, W * 0.28)))
  const fx0 = 30
  const fx1 = W - profW - 12
  const fw = fx1 - fx0
  const px0 = fx1 + 12
  const px1 = W - 6
  const top = 30
  const bot = H - 26
  const sy = (ym: number) => top + ((Y_MAX - ym) / (2 * Y_MAX)) * (bot - top)
  const vbar = (ym: number) => U0 + G * ym
  const VMAX = 3
  const sv = (v: number) => px0 + 10 + (num.clamp(v, 0, VMAX) / VMAX) * (px1 - px0 - 18)

  useAnimationFrame((dt) => {
    const s = sim.current
    s.time += dt
    s.acc += dt
    while (s.acc >= SPAWN) {
      s.acc -= SPAWN
      spawnPair()
    }
    for (const e of s.eddies) {
      if (e.mix < 0) {
        e.t += dt
        const vOrigin = U0 - e.lam * G // mean velocity of the plane the eddy came from
        e.xf = wrap01(e.xf + (vOrigin * PX_PER_MS * dt) / fw)
        if (e.t >= T_TRAVEL) {
          e.mix = 0
          record(e.lam, e.v)
        }
      } else e.mix += dt
    }
    s.eddies = s.eddies.filter((e) => e.mix < T_MIX)
    setFrame((f) => (f + 1) % 1000000)
  }, playing && inView)

  const s = sim.current
  const st = s.stats
  const has = st.n > 0
  const nuT = has ? st.sVL / st.n : NaN
  const Mbar = has ? st.sM / st.n : NaN
  const vMean = has ? st.sV / st.n : NaN
  const Rm = has && st.sV2 > 0 && st.sL2 > 0 ? st.sVL / st.n / (Math.sqrt(st.sV2 / st.n) * Math.sqrt(st.sL2 / st.n)) : NaN
  const rows = [-0.03, -0.0225, -0.015, -0.0075, 0, 0.0075, 0.015, 0.0225, 0.03]
  const deficiency = lamRms * G // m/s, between B–B (at −λ̃) and X–X

  return (
    <SimPanel
      title="Eddies jumping across plane X–X"
      subtitle={md`water, $\overline{v}_x = 1.5$ m/s at X–X`}
      src={{ doc: 'wilkes', pages: '488–489', note: 'Fig. 9.5, Eqs. (9.17)–(9.19)' }}
      wide
      controls={
        <>
          <Slider label={md`mean gradient $d\overline{v}_x/dy$`} value={G} min={-40} max={40} step={1} onChange={setG} unit="s⁻¹" digits={2} />
          <Slider label={md`RMS travel distance $\widetilde{\lambda}$`} value={lamMM} min={2} max={12} step={0.5} onChange={setLamMM} unit="mm" />
          <Slider label={md`RMS eddy speed $\widetilde{v_y'}$`} value={vRms} min={0.03} max={0.4} step={0.01} onChange={setVRms} unit="m/s" digits={2} />
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={resetAll} />
          <button type="button" onClick={fastForward} className="btn-ghost w-full justify-center">
            +500 eddies (fast-forward)
          </button>
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'eddies counted', value: String(st.n) },
            { label: md`$\overline{v_y'}$`, value: has ? (Math.abs(vMean) < 1e-12 ? 0 : vMean) : NaN, unit: 'm/s' },
            { label: md`$\nu_{\mathrm T}=\overline{v_y'\lambda}$`, value: nuT, unit: 'm²/s', tone: 'accent' },
            { label: md`measured $R$`, value: Rm },
            { label: md`$\overline{\dot{\mathcal M}}$ (averaged)`, value: Mbar, unit: 'Pa' },
            { label: md`$-\rho\,\nu_{\mathrm T}\,d\overline{v}_x/dy$`, value: has ? -RHO * nuT * G : NaN, unit: 'Pa' },
            { label: md`$\tau^t_{yx}=-\overline{\dot{\mathcal M}}$`, value: has ? -Mbar : NaN, unit: 'Pa', tone: 'good' },
            { label: md`$\nu_{\mathrm T}/\nu$`, value: has ? nuT / NU : NaN },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** let about a hundred eddies cross, then compare the two flux tiles — they agree because every up-going eddy is
          paired with a down-going one, so $\overline{v_y'}=0$ exactly. Now drag the gradient negative: $\overline{\dot{\mathcal M}}$ and
          $\tau^t_{yx}$ flip sign, but $\nu_{\mathrm T}$ stays positive because $v_y'$ and $\lambda$ always share a sign.`}
        </Md>
      }
    >
      <div ref={wrapRef} className="w-full">
        <svg width={W} height={H} className="block max-w-full select-none" role="img" aria-label="Animated eddies crossing plane X–X in a shear flow">
          <rect x={fx0} y={top} width={fw} height={bot - top} fill="var(--field-bg)" stroke="var(--line)" />
          {/* background tracers moving with the local mean velocity */}
          {rows.map((yr, i) =>
            [0, 1, 2, 3].map((k) => {
              const xf = wrap01(k / 4 + i * 0.137 + (vbar(yr) * PX_PER_MS * s.time) / fw)
              return <circle key={`${i}-${k}`} cx={fx0 + xf * fw} cy={sy(yr)} r={2.2} fill="var(--ink-3)" fillOpacity={0.45} />
            }),
          )}
          {/* planes */}
          <line x1={fx0} x2={fx1} y1={sy(lamRms)} y2={sy(lamRms)} stroke="var(--axis)" strokeDasharray="6 4" />
          <line x1={fx0} x2={fx1} y1={sy(0)} y2={sy(0)} stroke="var(--ink-2)" strokeWidth={2} />
          <line x1={fx0} x2={fx1} y1={sy(-lamRms)} y2={sy(-lamRms)} stroke="var(--axis)" strokeDasharray="6 4" />
          <SvgTex x={12} y={sy(lamRms) + 4} s="A" size={12} weight={700} className="fill-ink" />
          <SvgTex x={12} y={sy(0) + 4} s="X" size={12} weight={700} className="fill-ink" />
          <SvgTex x={12} y={sy(-lamRms) + 4} s="B" size={12} weight={700} className="fill-ink" />
          <Arrow x1={fx0 + 10} y1={sy(0)} x2={fx0 + 10} y2={sy(-lamRms)} both head={5} width={1.2} color="var(--ink-3)" />
          <SvgTex x={fx0 + 15} y={(sy(0) + sy(-lamRms)) / 2 + 4} s={LT} size={12} className="fill-ink-3" />

          {/* eddies */}
          {s.eddies.map((e) => {
            const color = e.lam > 0 ? 'var(--plot-2)' : 'var(--plot-3)'
            const x = fx0 + e.xf * fw
            if (e.mix < 0) {
              const y0 = -e.lam
              const yNow = y0 * (1 - e.t / T_TRAVEL)
              return (
                <g key={e.id}>
                  <line x1={x} x2={x} y1={sy(y0)} y2={sy(yNow)} stroke={color} strokeOpacity={0.4} strokeDasharray="3 3" />
                  <circle cx={x} cy={sy(yNow)} r={7} fill={color} fillOpacity={0.9} stroke="var(--surface)" strokeWidth={1.5} />
                </g>
              )
            }
            const f = e.mix / T_MIX
            const len = num.clamp(-e.lam * G * ARROW_PX_PER_MS, -70, 70)
            return (
              <g key={e.id} opacity={1 - f}>
                <circle cx={x} cy={sy(0)} r={7 + 12 * f} fill={color} fillOpacity={0.3} />
                {Math.abs(len) > 3 ? <Arrow x1={x} y1={sy(0) - 13} x2={x + len} y2={sy(0) - 13} color={color} width={2} head={6} /> : null}
              </g>
            )
          })}

          {/* legend */}
          <circle cx={fx0 + 10} cy={15} r={5} fill="var(--plot-2)" />
          <SvgTex x={fx0 + 19} y={19} s="from below: λ, v′_y > 0" size={11} />
          {fw > 330 ? (
            <>
              <circle cx={fx0 + 170} cy={15} r={5} fill="var(--plot-3)" />
              <SvgTex x={fx0 + 179} y={19} s="from above: λ, v′_y < 0" size={11} />
            </>
          ) : null}
          {fw > 260 ? (
            <SvgTex x={fx0 + 4} y={H - 8} s={`arrow = mismatch −λ d${VB}_x/dy carried to X–X`} size={10.5} className="fill-ink-3" />
          ) : null}

          {/* mean-velocity profile panel */}
          <line x1={sv(0)} x2={sv(0)} y1={top} y2={bot} stroke="var(--axis)" />
          <line x1={sv(vbar(-Y_MAX))} y1={sy(-Y_MAX)} x2={sv(vbar(Y_MAX))} y2={sy(Y_MAX)} stroke="var(--plot-1)" strokeWidth={2.4} />
          {[lamRms, 0, -lamRms].map((yy, i) => (
            <Arrow key={i} x1={sv(0)} y1={sy(yy)} x2={sv(vbar(yy))} y2={sy(yy)} width={i === 1 ? 1.8 : 1.2} head={6} color="var(--ink-3)" />
          ))}
          <line x1={sv(vbar(-lamRms))} x2={sv(vbar(-lamRms))} y1={sy(-lamRms)} y2={sy(0) + 6} stroke="var(--plot-4)" strokeDasharray="3 3" />
          {Math.abs(deficiency) > 0.005 ? (
            <Arrow x1={sv(vbar(-lamRms))} y1={sy(0) + 6} x2={sv(vbar(0))} y2={sy(0) + 6} both head={4} width={1.3} color="var(--plot-4)" />
          ) : null}
          <SvgTex x={(px0 + px1) / 2} y={17} s={`${VB}_x(y) profile`} size={11} anchor="middle" className="fill-ink-2" />
          <SvgTex x={(px0 + px1) / 2} y={H - 8} s={`deficiency ${num.fmt(Math.abs(deficiency), 2)} m/s`} size={10} anchor="middle" fill="var(--plot-4)" />
          <SvgTex x={sv(0)} y={bot + 12} s="0" size={10} anchor="middle" className="fill-ink-3" />
          <SvgTex x={sv(3)} y={bot + 12} s="3 m/s" size={10} anchor="middle" className="fill-ink-3" />
        </svg>
        {reduced && !playing ? (
          <p className="mt-1 text-xs text-ink-3">Animation paused because your system prefers reduced motion — press Play, or use fast-forward to collect statistics.</p>
        ) : null}
      </div>
    </SimPanel>
  )
}
