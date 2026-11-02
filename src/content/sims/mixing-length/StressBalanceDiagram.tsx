import { Arrow, SvgTex } from './svg'

const P = 'var(--plot-1)' // pressure forces
const S = 'var(--plot-4)' // shear forces

function PressureArrows({ xl, xr, ys }: { xl: number; xr: number; ys: number[] }) {
  return (
    <>
      {ys.map((y) => (
        <g key={y}>
          <Arrow x1={xl - 26} y1={y} x2={xl - 3} y2={y} color={P} width={1.6} head={6} />
          <Arrow x1={xr + 26} y1={y} x2={xr + 3} y2={y} color={P} width={1.6} head={6} />
        </g>
      ))}
    </>
  )
}

function FlowArrows({ x0, x1, ys }: { x0: number; x1: number; ys: number[] }) {
  return (
    <>
      {ys.map((y) => (
        <Arrow key={y} x1={x0} y1={y} x2={x1} y2={y} color="var(--ink-3)" width={1.3} head={6} />
      ))}
    </>
  )
}

/** (a) plates, element of half-height y about the centreline. */
function Plates() {
  const xl = 125
  const xr = 215
  const yt = 64
  const yb = 136
  return (
    <svg viewBox="0 0 300 218" className="block h-auto w-full" role="img" aria-label="Force balance on an element between parallel plates">
      <line x1={58} x2={296} y1={22} y2={22} stroke="var(--ink-2)" strokeWidth={2.5} />
      <line x1={58} x2={296} y1={178} y2={178} stroke="var(--ink-2)" strokeWidth={2.5} />
      <SvgTex x={177} y={15} s="Flat plate" size={10.5} anchor="middle" className="fill-ink-3" />
      <SvgTex x={177} y={192} s="Flat plate" size={10.5} anchor="middle" className="fill-ink-3" />
      <SvgTex x={22} y={46} s="Flow" size={11} anchor="middle" className="fill-ink-2" />
      <FlowArrows x0={6} x1={42} ys={[62, 82, 100, 118, 138]} />
      <line x1={58} x2={296} y1={100} y2={100} stroke="var(--axis)" strokeDasharray="5 4" />
      {/* element */}
      <rect x={xl} y={yt} width={xr - xl} height={yb - yt} fill="var(--surface-2)" stroke="var(--ink-3)" />
      <Arrow x1={140} y1={100} x2={140} y2={yt + 1} width={1.3} head={5} />
      <SvgTex x={145} y={86} s="y" size={12} className="fill-ink" />
      <Arrow x1={xl} y1={120} x2={xr} y2={120} both width={1.2} head={5} />
      <SvgTex x={(xl + xr) / 2} y={132} s="L" size={12} anchor="middle" className="fill-ink" />
      <PressureArrows xl={xl} xr={xr} ys={[78, 100, 122]} />
      <SvgTex x={xl - 30} y={104} s="p" size={12} anchor="end" fill={P} />
      <SvgTex x={296} y={156} s="p + (dp/dx) L" size={11} anchor="end" fill={P} />
      {/* shear on top and bottom faces (drawn in the direction the outer fluid drags the element) */}
      <Arrow x1={205} y1={56} x2={140} y2={56} color={S} width={2} head={7} />
      <Arrow x1={205} y1={144} x2={140} y2={144} color={S} width={2} head={7} />
      <SvgTex x={212} y={52} s="τ^t_{yx}" size={12} fill={S} />
      <SvgTex x={212} y={150} s="τ^t_{yx}" size={12} fill={S} />
      {/* axes */}
      <Arrow x1={66} y1={160} x2={66} y2={138} width={1.1} head={5} color="var(--ink-3)" />
      <Arrow x1={66} y1={160} x2={88} y2={160} width={1.1} head={5} color="var(--ink-3)" />
      <SvgTex x={70} y={142} s="y" size={10.5} className="fill-ink-3" />
      <SvgTex x={90} y={170} s="x" size={10.5} className="fill-ink-3" />
      <SvgTex x={150} y={212} s="⇒ τ^t_{yx} ≐ y (dp/dx),  y from the centreline" size={11.5} anchor="middle" className="fill-ink" weight={600} />
    </svg>
  )
}

/** (b) pipe, coaxial cylinder of radius r. */
function Pipe() {
  const xl = 120
  const xr = 210
  const yt = 64
  const yb = 136
  return (
    <svg viewBox="0 0 300 218" className="block h-auto w-full" role="img" aria-label="Force balance on a coaxial cylinder in a pipe">
      <line x1={40} x2={290} y1={22} y2={22} stroke="var(--ink-2)" strokeWidth={2.5} />
      <line x1={40} x2={290} y1={178} y2={178} stroke="var(--ink-2)" strokeWidth={2.5} />
      <ellipse cx={40} cy={100} rx={12} ry={78} fill="var(--surface-2)" stroke="var(--ink-3)" />
      <ellipse cx={290} cy={100} rx={9} ry={78} fill="none" stroke="var(--ink-3)" strokeDasharray="4 3" />
      <SvgTex x={165} y={15} s="Pipe wall" size={10.5} anchor="middle" className="fill-ink-3" />
      <SvgTex x={165} y={192} s="Pipe wall" size={10.5} anchor="middle" className="fill-ink-3" />
      <SvgTex x={14} y={40} s="Flow" size={11} anchor="middle" className="fill-ink-2" />
      <FlowArrows x0={0} x1={27} ys={[62, 82, 100, 118, 138]} />
      <line x1={52} x2={290} y1={100} y2={100} stroke="var(--axis)" strokeDasharray="5 4" />
      {/* cylindrical element */}
      <rect x={xl} y={yt} width={xr - xl} height={yb - yt} fill="var(--surface-2)" stroke="none" />
      <line x1={xl} x2={xr} y1={yt} y2={yt} stroke="var(--ink-3)" />
      <line x1={xl} x2={xr} y1={yb} y2={yb} stroke="var(--ink-3)" />
      <ellipse cx={xl} cy={100} rx={8} ry={36} fill="var(--surface-2)" stroke="var(--ink-3)" />
      <ellipse cx={xr} cy={100} rx={8} ry={36} fill="var(--surface-2)" stroke="var(--ink-3)" />
      <Arrow x1={150} y1={100} x2={150} y2={yt + 1} width={1.3} head={5} />
      <SvgTex x={155} y={86} s="r" size={12} className="fill-ink" />
      <Arrow x1={xl} y1={120} x2={xr} y2={120} both width={1.2} head={5} />
      <SvgTex x={(xl + xr) / 2} y={132} s="L" size={12} anchor="middle" className="fill-ink" />
      <PressureArrows xl={xl - 6} xr={xr + 6} ys={[80, 100, 120]} />
      <SvgTex x={xl - 38} y={104} s="p" size={12} anchor="end" fill={P} />
      <SvgTex x={296} y={156} s="p + (dp/dz) L" size={11} anchor="end" fill={P} />
      <Arrow x1={200} y1={56} x2={135} y2={56} color={S} width={2} head={7} />
      <Arrow x1={200} y1={144} x2={135} y2={144} color={S} width={2} head={7} />
      <SvgTex x={206} y={52} s="τ^t_{rz}" size={12} fill={S} />
      <SvgTex x={206} y={150} s="τ^t_{rz}" size={12} fill={S} />
      <Arrow x1={276} y1={100} x2={276} y2={24} width={1.2} head={5} both color="var(--ink-2)" />
      <SvgTex x={268} y={62} s="a" size={12} anchor="end" className="fill-ink" />
      <SvgTex x={150} y={212} s="⇒ τ^t_{rz} ≐ (r/2)(dp/dz)" size={11.5} anchor="middle" className="fill-ink" weight={600} />
    </svg>
  )
}

/** Recreation of Wilkes Fig. 9.6: shear stresses for (a) parallel plates and (b) a pipe. */
export function StressBalanceDiagram() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <div className="mb-1 text-sm font-semibold text-ink-2">(a) Parallel plates</div>
        <Plates />
      </div>
      <div>
        <div className="mb-1 text-sm font-semibold text-ink-2">(b) Pipe</div>
        <Pipe />
      </div>
    </div>
  )
}
