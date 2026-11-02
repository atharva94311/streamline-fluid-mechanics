import { useState } from 'react'
import { Md, Plot, SimPanel, Slider, Toggle, md, num, useUid } from '@/kit'
import { COLORS, blasiusFF, ptaFactor, sublayerTempShare, sublayerThickness, velocityRatio } from './model'
import { ArrowDefs, HatchDef, SvgLabel, useDesignWidth } from './svg'
import { Tiles } from './Tiles'

/** Smooth core profile shape: g(0) = 0, g(1) = 1, flat at the mainstream end. */
const g = (s: number) => 1 - (1 - s) ** 3

interface LabelSpec {
  target: number
  label: string
  w: number
  color: string
}

/** Spread labels along a row so they do not overlap (1-D relaxation), keeping them inside [lo, hi]. */
function spread(specs: LabelSpec[], X: (phi: number) => number, lo: number, hi: number, gap = 6) {
  const items = specs.map((s) => ({ ...s, c: X(s.target) })).sort((a, b) => a.c - b.c)
  for (let i = 1; i < items.length; i++) {
    const min = items[i - 1].c + (items[i - 1].w + items[i].w) / 2 + gap
    if (items[i].c < min) items[i].c = min
  }
  const last = items[items.length - 1]
  const over = last ? last.c + last.w / 2 - hi : 0
  if (over > 0) for (const it of items) it.c -= over
  const first = items[0]
  const under = first ? lo - (first.c - first.w / 2) : 0
  if (under > 0) for (const it of items) it.c += under
  return items
}

/**
 * Two-layer (Prandtl–Taylor) picture of Wilkes Fig. 9.14: linear velocity and temperature profiles in a laminar
 * sublayer of thickness δ, eddy exchange in the turbulent core. Both profiles are drawn on a common 0→1 scale:
 * v̄_z/v̄_zm and (T̄ − T̄_w)/(T̄_m − T̄_w). The sublayer thickness is exaggerated for visibility.
 */
export function TwoLayerProfiles({ Pr, Re, sublayer = true, mode }: { Pr: number; Re: number; sublayer?: boolean; mode: 'figure' | 'lab' }) {
  const [ref, W] = useDesignWidth(340, 700)
  const uid = useUid('f914')
  const fig = mode === 'figure'
  const wide = W >= 520
  const r = sublayer ? velocityRatio(Re) : 0
  const th = sublayer ? sublayerTempShare(r, Pr) : 0

  const H = fig ? 344 : 300
  const xl = 44
  const xr = W - 10
  const rightPad = fig ? (wide ? 120 : 64) : wide ? 100 : 58
  const plotW = xr - xl - rightPad
  const X = (phi: number) => xl + phi * plotW
  const yw = H - 66
  const yt = fig ? 60 : 30
  const dpx = sublayer ? (fig ? 0.3 : 0.27) * (yw - yt) : 0
  const yd = yw - dpx

  const pathFor = (phiD: number) => {
    const pts: [number, number][] = []
    if (sublayer) pts.push([X(0), yw], [X(phiD), yd])
    else pts.push([X(0), yw])
    const n = 48
    for (let i = 1; i <= n; i++) {
      const s = i / n
      const y = yd - s * (yd - yt)
      pts.push([X(phiD + (1 - phiD) * g(s)), y])
    }
    return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  }

  const vel = COLORS.velocity
  const tem = COLORS.temperature
  const row1 = yw + 26
  const row2 = yw + 48
  const vSpecs: LabelSpec[] = [
    { target: 0, label: String.raw`$\overline{v}_{zw}=0$`, w: 58, color: vel },
    ...(sublayer ? [{ target: r, label: String.raw`$\overline{v}_{z\delta}$`, w: 26, color: vel }] : []),
    { target: 1, label: String.raw`$\overline{v}_{zm}$`, w: 28, color: vel },
  ]
  const tSpecs: LabelSpec[] = [
    { target: 0, label: String.raw`$\overline{T}_w$`, w: 24, color: tem },
    ...(sublayer ? [{ target: th, label: String.raw`$\overline{T}_\delta$`, w: 24, color: tem }] : []),
    { target: 1, label: String.raw`$\overline{T}_m$`, w: 26, color: tem },
  ]
  const lo = 4
  const hi = wide ? xr - 92 : xr - 2
  const vRow = spread(vSpecs, X, lo, hi)
  const tRow = spread(tSpecs, X, lo, hi)

  // eddy lanes (figure mode)
  const lane1 = X(0.18)
  const lane2 = X(0.5)
  const eTop = yt + 24
  const eBot = yd - 14
  const xQ = X(1) + (wide ? 22 : 16)

  return (
    <div ref={ref} className="w-full">
      {!fig ? (
        <div className="mb-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <svg width="22" height="10" aria-hidden>
              <line x1="1" x2="21" y1="5" y2="5" stroke={vel} strokeWidth={2.4} />
            </svg>
            <Md inline>{md`velocity $\overline{v}_z/\overline{v}_{zm}$`}</Md>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="22" height="10" aria-hidden>
              <line x1="1" x2="21" y1="5" y2="5" stroke={tem} strokeWidth={2.4} strokeDasharray={sublayer ? undefined : '5 4'} />
            </svg>
            <Md inline>{md`temperature $(\overline{T}-\overline{T}_w)/(\overline{T}_m-\overline{T}_w)$`}</Md>
          </span>
        </div>
      ) : null}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Velocity and temperature profiles across a laminar sublayer and the turbulent core"
      >
        <defs>
          <ArrowDefs uid={uid} colors={{ ink: 'var(--ink-2)', hot: COLORS.hot }} />
          <HatchDef id={`${uid}-hatch`} />
        </defs>

        <rect x={xl} y={yt - 26} width={xr - xl} height={yw - yt + 26} fill="var(--surface-2)" opacity={0.7} />
        {sublayer ? <rect x={xl} y={yd} width={xr - xl} height={dpx} fill="var(--band)" /> : null}

        {/* wall + y axis */}
        <rect x={xl} y={yw} width={xr - xl} height={9} fill={`url(#${uid}-hatch)`} stroke="var(--ink-3)" strokeWidth={0.8} />
        <line x1={xl} y1={yw} x2={xl} y2={yt - 22} stroke="var(--ink-2)" strokeWidth={1.4} markerEnd={`url(#${uid}-ink)`} />
        <SvgLabel x={xl - 8} y={yt - 18} label="$y$" align="end" size={12} w={24} h={20} />
        <SvgLabel x={xl - 5} y={yw + 4} label="Wall" align="end" size={11} w={44} h={18} className="text-ink-3" />
        {sublayer ? <SvgLabel x={xl - 7} y={yd} label={String.raw`$\delta$`} align="end" size={13} w={24} h={20} /> : null}

        {/* guides */}
        {sublayer ? (
          <>
            <line x1={xl} x2={Math.max(X(r), X(th))} y1={yd} y2={yd} stroke="var(--ink-3)" strokeDasharray="5 4" />
            <line x1={X(r)} x2={X(r)} y1={yd} y2={yw} stroke={vel} strokeDasharray="4 4" opacity={0.85} />
            <line x1={X(th)} x2={X(th)} y1={yd} y2={yw} stroke={tem} strokeDasharray="4 4" opacity={0.85} />
          </>
        ) : null}
        <line x1={X(1)} x2={X(1)} y1={yt - 14} y2={yw} stroke="var(--ink-3)" strokeDasharray="5 4" />

        {/* profiles */}
        <path d={pathFor(r)} fill="none" stroke={vel} strokeWidth={2.6} strokeLinejoin="round" />
        <path d={pathFor(th)} fill="none" stroke={tem} strokeWidth={2.6} strokeLinejoin="round" strokeDasharray={sublayer ? undefined : '7 6'} />
        {sublayer ? (
          <>
            <circle cx={X(r)} cy={yd} r={3.6} fill={vel} stroke="var(--surface)" strokeWidth={1.2} />
            <circle cx={X(th)} cy={yd} r={3.6} fill={tem} stroke="var(--surface)" strokeWidth={1.2} />
          </>
        ) : null}

        {/* abscissa label rows with colour-coded ticks */}
        {vRow.map((it, i) => (
          <g key={`v${i}`}>
            <line x1={X(it.target)} x2={X(it.target)} y1={yw + 9} y2={yw + 14} stroke={it.color} strokeWidth={1.6} />
            <SvgLabel x={it.c} y={row1} label={it.label} align="middle" size={12} w={it.w + 20} h={22} color={it.color} />
          </g>
        ))}
        {tRow.map((it, i) => (
          <g key={`t${i}`}>
            <SvgLabel x={it.c} y={row2} label={it.label} align="middle" size={12} w={it.w + 20} h={22} color={it.color} />
          </g>
        ))}
        {wide ? (
          <>
            <SvgLabel x={xr - 2} y={row1} label="Velocities" align="end" size={11} w={90} h={20} className="italic text-ink-3" />
            <SvgLabel x={xr - 2} y={row2} label="Temperatures" align="end" size={11} w={90} h={20} className="italic text-ink-3" />
          </>
        ) : null}

        {fig ? (
          <>
            <SvgLabel x={xl + 10} y={22} label={'Turbulent\nmainstream'} box size={11} w={110} />
            <SvgLabel x={X(1) - 6} y={yt - 24} label={wide ? 'Velocity\nprofile' : String.raw`$\overline{v}_z$ profile`} align="end" box size={10.5} w={100} color={vel} />
            <SvgLabel x={X(1) + 6} y={yt - 24} label={wide ? 'Temperature\nprofile' : String.raw`$\overline{T}$ profile`} box size={10.5} w={100} color={tem} />
            {sublayer ? (
              <SvgLabel x={xl + 8} y={yd + (wide ? 13 : 18)} label={wide ? 'Laminar sublayer' : 'Laminar\nsublayer'} box size={wide ? 11 : 10} w={130} h={wide ? 22 : 34} />
            ) : null}

            {/* eddies */}
            <circle cx={lane1} cy={eTop} r={9} fill="var(--body-fill)" stroke="var(--ink-3)" />
            <circle cx={lane1} cy={eBot} r={9} fill="var(--surface)" stroke="var(--ink-3)" />
            <line x1={lane1} x2={lane1} y1={eTop + 11} y2={eBot - 12} stroke="var(--ink-2)" strokeWidth={1.3} markerEnd={`url(#${uid}-ink)`} />
            <circle cx={lane2} cy={eTop} r={9} fill="var(--surface)" stroke="var(--ink-3)" />
            <circle cx={lane2} cy={eBot} r={9} fill="var(--body-fill)" stroke="var(--ink-3)" />
            <line x1={lane2} x2={lane2} y1={eBot - 11} y2={eTop + 12} stroke="var(--ink-2)" strokeWidth={1.3} markerEnd={`url(#${uid}-ink)`} />
            <SvgLabel x={lane1 - 11} y={(eTop + eBot) / 2 + 12} label="$m$" align="end" box size={11.5} w={30} />
            <SvgLabel x={lane2 + 11} y={(eTop + eBot) / 2 + 12} label="$m$" box size={11.5} w={30} />
            <SvgLabel
              x={(lane1 + lane2) / 2}
              y={wide ? (eTop + eBot) / 2 - 8 : eTop - 28}
              label={'Turbulent\neddies'}
              align="middle"
              box
              size={wide ? 10.5 : 10}
              w={90}
            />

            {/* heat flux and wall shear */}
            <line x1={xQ} x2={xQ} y1={yt + 6} y2={yw - 1} stroke={COLORS.hot} strokeWidth={2} markerEnd={`url(#${uid}-hot)`} />
            <SvgLabel x={xQ + 7} y={yt + 58} label={wide ? 'Heat\nflux, $q$' : '$q$'} box size={11} w={80} />
            <line x1={Math.max(xr - 52, xQ + 10)} x2={xr - 6} y1={yw - 6} y2={yw - 6} stroke="var(--ink-2)" strokeWidth={1.8} markerEnd={`url(#${uid}-ink)`} />
            <SvgLabel x={xr - 2} y={yw - 28} label={wide ? 'Wall shear\nstress, $\\tau_w$' : '$\\tau_w$'} align="end" box size={11} w={100} />
          </>
        ) : sublayer ? (
          <SvgLabel x={xr - 4} y={yd + dpx / 2} label={wide ? 'laminar sublayer\n(exaggerated)' : 'sublayer'} align="end" box size={10.5} w={130} className="text-ink-3" />
        ) : (
          <SvgLabel x={xr - 4} y={yw - 18} label={'no sublayer:\neddies reach the wall'} align="end" box size={10.5} w={150} className="text-ink-3" />
        )}
        {!fig ? (
          <SvgLabel x={xl + 8} y={yt - 12} label="turbulent core (eddy exchange)" size={10.5} w={220} h={18} className="text-ink-3" />
        ) : null}
      </svg>
    </div>
  )
}

/** Horizontal bar showing how the overall driving difference is split between sublayer and core. */
function ShareBar({ label, sub, color }: { label: string; sub: number; color: string }) {
  const pct = Math.max(0, Math.min(1, sub)) * 100
  return (
    <div className="grid grid-cols-[5.5rem_1fr] items-center gap-2 text-xs">
      <span className="text-ink-2">
        <Md inline>{label}</Md>
      </span>
      <div className="flex h-5 overflow-hidden rounded-md border border-line bg-surface">
        <div
          className="flex items-center justify-center font-semibold"
          style={{ width: `${pct}%`, background: color, color: 'var(--surface)', minWidth: pct > 0 ? 2 : 0 }}
          title="dropped across the laminar sublayer"
        >
          {pct >= 22 ? `sublayer ${pct.toFixed(0)} %` : pct >= 9 ? `${pct.toFixed(0)} %` : ''}
        </div>
        <div className="relative flex flex-1 items-center justify-center text-ink-2" title="dropped across the turbulent core">
          <span className="absolute inset-0 opacity-25" style={{ background: color }} />
          <span className="relative">{100 - pct >= 22 ? `core ${(100 - pct).toFixed(0)} %` : 100 - pct >= 9 ? `${(100 - pct).toFixed(0)} %` : ''}</span>
        </div>
      </div>
    </div>
  )
}

const PR_PRESETS = [0.5, 1, 2, 7] as const

/** Concept 2 interactive: the two-layer model with Pr and Re sliders. */
export function TwoLayerLab() {
  const [Pr, setPr] = useState(2)
  const [Re, setRe] = useState(50000)
  const [sub, setSub] = useState(true)
  const r = velocityRatio(Re)
  const th = sublayerTempShare(r, Pr)
  const half = blasiusFF(Re) / 2
  const factor = sub ? 1 / ptaFactor(Re, Pr) : 1
  const dD = sublayerThickness(Re)

  return (
    <SimPanel
      title="Two-layer model explorer"
      subtitle="Prandtl–Taylor: sublayer + eddy core"
      controls={
        <>
          <Slider label="Prandtl number $\Pran$" value={Pr} min={0.2} max={50} log onChange={setPr} digits={3} />
          <div className="flex flex-wrap gap-1.5">
            {PR_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPr(p)}
                className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${Math.abs(Pr - p) < 1e-6 ? 'border-teal-500 bg-teal-600 text-white' : 'border-line bg-surface text-ink-2 hover:border-teal-400'}`}
              >
                Pr = {p}
              </button>
            ))}
          </div>
          <Slider label="Reynolds number $\Rey$" value={Re} min={1e4} max={1e5} log onChange={setRe} format={(v) => num.fmt(v, 3)} />
          <Toggle label="include the laminar sublayer (Prandtl–Taylor)" checked={sub} onChange={setSub} />
        </>
      }
      readout={
        <Tiles
          items={[
            { label: md`$\overline{v}_{z\delta}/\overline{v}_{zm}$ (9.103)`, value: sub ? r : 0, digits: 3 },
            { label: md`sublayer share of $\overline{T}_m-\overline{T}_w$`, value: sub ? th : 0, digits: 3 },
            { label: md`$\St\,/\,(f_\mathrm{F}/2)$`, value: factor, digits: 3, tone: Math.abs(factor - 1) < 0.1 ? 'good' : 'accent' },
            { label: md`$f_\mathrm{F}/2$ (Blasius)`, value: half, digits: 3 },
            { label: md`$\St$`, value: half * factor, digits: 3 },
            { label: md`$\delta/D$ (9.62)`, value: sub ? dD : 0, digits: 3 },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** press Pr = 1 — the two profiles fall on top of each other and $\St = f_\mathrm{F}/2$ exactly (the Reynolds analogy). Now press Pr = 7 (water): the temperature drop crowds into the thin sublayer, so heat transfer falls well below $f_\mathrm{F}/2$. Switch the sublayer off to see the Reynolds-analogy picture, in which the fluid properties never matter.`}
        </Md>
      }
      wide
    >
      <TwoLayerProfiles Pr={Pr} Re={Re} sublayer={sub} mode="lab" />
      <div className="mt-3 space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Where the driving difference is used up</div>
        <ShareBar label="momentum" sub={sub ? r : 0} color={COLORS.velocity} />
        <ShareBar label="heat" sub={sub ? th : 0} color={COLORS.temperature} />
      </div>
      <div className="mt-4">
        <Plot
          height={220}
          x={{ label: md`Prandtl number $\Pran$ (log scale)`, domain: [0.2, 50], log: true }}
          y={{ label: md`$\St/(f_\mathrm{F}/2)$`, domain: [0.02, 5], log: true }}
          series={[
            { label: md`Prandtl–Taylor (9.102), $\Rey$ = ${num.fmt(Re, 3)}`, fn: (p) => 1 / ptaFactor(Re, p), color: COLORS.PTA },
            { label: 'Reynolds analogy (9.99)', fn: () => 1, color: COLORS.RA, dash: '6 4' },
          ]}
          vlines={[{ x: 1, label: 'Pr = 1' }]}
          marks={[{ x: Pr, y: factor, color: sub ? COLORS.PTA : COLORS.RA }]}
        />
      </div>
    </SimPanel>
  )
}
