import { useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Md, useAnimationFrame, useInView, usePrefersReducedMotion, useUid } from '@/kit'
import { COLORS } from './model'
import { ArrowDefs, HatchDef, SvgLabel, edgeFade, useDesignWidth } from './svg'

/**
 * Recreation of Wilkes Fig. 9.13 (p. 520): momentum and heat transport by turbulent eddies.
 * One eddy lane carries fluid from the mainstream to the wall (amber = mainstream velocity and temperature),
 * the other returns fluid from the wall (cyan = wall velocity 0 and wall temperature). Equal mass flux m each way.
 */
export function EddyFigure() {
  const [ref, W] = useDesignWidth(340, 680)
  const uid = useUid('f913')
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  const [playing, setPlaying] = useState(true)

  const wide = W >= 520
  const x0 = 46
  const x1 = W - 8
  const span = x1 - x0
  const yw = 206
  const H = yw + 48
  const xA = x0 + 0.3 * span
  const xB = x0 + 0.58 * span
  const xQ = x0 + 0.8 * span
  const yT = 66
  const yB = yw - 22
  const midY = (yT + yB) / 2

  const gA = useRef<SVGGElement>(null)
  const gB = useRef<SVGGElement>(null)
  const phase = useRef(0.3)

  const posA = (t: number) => `translate(${xA},${yT + t * (yB - yT)})`
  const posB = (t: number) => `translate(${xB},${yB - t * (yB - yT)})`

  useAnimationFrame(
    (dt) => {
      phase.current = (phase.current + dt * 0.42) % 1
      const tA = phase.current
      const tB = (phase.current + 0.5) % 1
      gA.current?.setAttribute('transform', posA(tA))
      gA.current?.setAttribute('opacity', String(edgeFade(tA)))
      gB.current?.setAttribute('transform', posB(tB))
      gB.current?.setAttribute('opacity', String(edgeFade(tB)))
    },
    playing && inView && !reduced,
  )

  const t0 = phase.current
  const t1 = (phase.current + 0.5) % 1
  const ink = 'var(--ink-2)'

  return (
    <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Recreation of Fig. 9.13: momentum and heat transport by turbulent eddies between the mainstream and the wall">
        <defs>
          <ArrowDefs uid={uid} colors={{ ink, hot: COLORS.hot, cold: COLORS.cold }} />
          <HatchDef id={`${uid}-hatch`} />
        </defs>

        {/* fluid and wall */}
        <rect x={x0} y={6} width={span} height={yw - 6} rx={6} fill="var(--surface-2)" />
        <rect x={x0} y={yw} width={span} height={11} fill={`url(#${uid}-hatch)`} stroke="var(--ink-3)" strokeWidth={0.8} />
        <SvgLabel x={x0 + span / 2} y={yw + 30} label="Wall" align="middle" size={12} />

        {/* coordinate axes (lower left, outside the fluid) */}
        <line x1={16} y1={yw + 6} x2={16} y2={yw - 34} stroke={ink} strokeWidth={1.4} markerEnd={`url(#${uid}-ink)`} />
        <line x1={16} y1={yw + 6} x2={40} y2={yw + 6} stroke={ink} strokeWidth={1.4} markerEnd={`url(#${uid}-ink)`} />
        <SvgLabel x={22} y={yw - 30} label="$y$" size={12} w={20} h={20} />
        <SvgLabel x={30} y={yw + 20} label="$z$" size={12} w={20} h={20} />

        {/* mainstream */}
        <SvgLabel x={x0 + 6} y={30} label={String.raw`$\overline{T}_m,\ \overline{v}_{zm}$`} box size={12} w={100} />
        <line
          x1={x0 + 86}
          y1={30}
          x2={x1 - 86}
          y2={30}
          stroke={COLORS.hot}
          strokeWidth={2}
          strokeDasharray="6 8"
          className={playing && inView ? 'flow-dash' : undefined}
          markerEnd={`url(#${uid}-hot)`}
        />
        <SvgLabel x={x1 - 4} y={30} label={'Turbulent\nmainstream'} align="end" box size={11.5} w={110} />

        {/* eddy lane A: mainstream → wall */}
        <circle cx={xA} cy={yT} r={10} fill="var(--body-fill)" stroke="var(--ink-3)" />
        <circle cx={xA} cy={yB} r={10} fill="var(--surface)" stroke="var(--ink-3)" />
        <line x1={xA} y1={yT + 12} x2={xA} y2={yB - 13} stroke={ink} strokeWidth={1.4} markerEnd={`url(#${uid}-ink)`} />
        <SvgLabel x={xA - 12} y={midY + 18} label="$m$" align="end" box size={12} w={40} />

        {/* eddy lane B: wall → mainstream */}
        <circle cx={xB} cy={yB} r={10} fill="var(--body-fill)" stroke="var(--ink-3)" />
        <circle cx={xB} cy={yT} r={10} fill="var(--surface)" stroke="var(--ink-3)" />
        <line x1={xB} y1={yB - 12} x2={xB} y2={yT + 13} stroke={ink} strokeWidth={1.4} markerEnd={`url(#${uid}-ink)`} />
        <SvgLabel x={xB + 12} y={midY + 18} label="$m$" box size={12} w={40} />

        <SvgLabel x={(xA + xB) / 2} y={midY - 14} label={'Turbulent\neddies'} align="middle" box size={11.5} w={90} />

        {/* moving parcels */}
        <g ref={gA} transform={posA(t0)} opacity={edgeFade(t0)}>
          <circle r={8.5} fill={COLORS.hot} stroke="var(--surface)" strokeWidth={1.5} />
          <path d="M-3.5,-4 L4.5,0 L-3.5,4 z" fill="var(--surface)" />
        </g>
        <g ref={gB} transform={posB(t1)} opacity={edgeFade(t1)}>
          <circle r={8.5} fill={COLORS.cold} stroke="var(--surface)" strokeWidth={1.5} />
        </g>

        {/* heat flux */}
        <line x1={xQ} y1={58} x2={xQ} y2={yw - 1} stroke={COLORS.hot} strokeWidth={2} markerEnd={`url(#${uid}-hot)`} />
        <SvgLabel x={xQ + 8} y={104} label={wide ? 'Heat\nflux, $q$' : '$q$'} box size={11.5} w={80} />

        {/* wall shear stress */}
        <line x1={x1 - 60} y1={yw - 6} x2={x1 - 6} y2={yw - 6} stroke={ink} strokeWidth={1.8} markerEnd={`url(#${uid}-ink)`} />
        <SvgLabel x={x1 - 4} y={yw - 30} label={wide ? 'Wall shear\nstress, $\\tau_w$' : '$\\tau_w$'} align="end" box size={11.5} w={110} />

        {/* wall conditions */}
        <SvgLabel
          x={x0 + 6}
          y={wide ? yw - 20 : yw + 30}
          label={String.raw`$\overline{T}_w,\ \overline{v}_{zw}=0$`}
          box
          size={12}
          w={120}
        />
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: COLORS.hot }} />
          <Md inline>{String.raw`arrives from the mainstream with $\overline{v}_{zm}$ and $\overline{T}_m$`}</Md>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: COLORS.cold }} />
          <Md inline>{String.raw`returns from the wall with $\overline{v}_{zw}=0$ and $\overline{T}_w$`}</Md>
        </span>
        {!reduced ? (
          <button type="button" onClick={() => setPlaying((p) => !p)} className="btn-ghost ml-auto px-2.5 py-1 text-xs">
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? 'Pause' : 'Play'}
          </button>
        ) : null}
      </div>
    </div>
  )
}
