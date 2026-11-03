/**
 * Static comparison: forced vortex (rigid-body rotation, rotational) vs free vortex (v_θ = K/r, irrotational).
 * Small crosses ride round a circular streamline: in the forced vortex they turn with the flow (each element
 * rotates); in the free vortex they keep their orientation (no net rotation — like the gondolas of a Ferris wheel).
 */
import { Arrow, Label } from './shared'

const C = 150
const RADII = [48, 88, 128]

function Cross({ x, y, deg }: { x: number; y: number; deg: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})`}>
      <line x1={-9} x2={9} y1={0} y2={0} stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" />
      <line x1={0} x2={0} y1={-9} y2={9} stroke="var(--plot-4)" strokeWidth={2} strokeLinecap="round" />
      <circle cx={0} cy={-9} r={2.4} fill="var(--plot-4)" />
    </g>
  )
}

function Panel({ forced }: { forced: boolean }) {
  const ring = RADII[1]
  const angles = Array.from({ length: 8 }, (_, k) => (k * Math.PI) / 4)
  // tangential velocity arrows on the ray θ = −22.5°, lengths ∝ V
  const th = (-22.5 * Math.PI) / 180
  const speeds = forced ? RADII.map((r) => 0.28 * r) : RADII.map((r) => (40 * 48) / r)
  return (
    <div className="rounded-xl border border-line bg-surface-2/50 p-2">
      <div className="mb-1 px-1 text-xs font-semibold text-ink-2">
        {forced ? 'Forced vortex — rotational (V = Ωr)' : 'Free vortex — irrotational (V = K/r)'}
      </div>
      <svg viewBox="0 0 300 300" className="block h-auto w-full" role="img" aria-label={forced ? 'forced vortex with rotating crosses' : 'free vortex with non-rotating crosses'}>
        {RADII.map((r) => (
          <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="var(--streamline)" strokeWidth={1.4} opacity={0.8} />
        ))}
        {forced ? (
          <circle cx={C} cy={C} r={3} fill="var(--ink-2)" />
        ) : (
          <g>
            <circle cx={C} cy={C} r={16} fill="var(--body-fill)" />
            <Label x={C} y={C + 4} anchor="middle" size={9} color="var(--ink-2)" halo={false}>core</Label>
          </g>
        )}
        {angles.map((a, k) => (
          <Cross key={k} x={C + ring * Math.cos(a)} y={C - ring * Math.sin(a)} deg={forced ? (-a * 180) / Math.PI : 0} />
        ))}
        {RADII.map((r, k) => {
          const x = C + r * Math.cos(th)
          const y = C - r * Math.sin(th)
          const L = speeds[k]
          // counter-clockwise tangent (−sin θ, cos θ) in y-up coordinates
          return <Arrow key={r} x1={x} y1={y} x2={x - L * Math.sin(th)} y2={y - L * Math.cos(th)} color="var(--plot-1)" width={2} head={7} />
        })}
        {forced ? (
          <>
            <Label x={C - 12} y={C - RADII[0] + 14} anchor="end" size={11} weight={700} color="var(--plot-5)">B₁</Label>
            <Label x={C - 12} y={C - RADII[1] + 14} anchor="end" size={11} weight={700} color="var(--plot-5)">B₂</Label>
            <Label x={C - 12} y={C - RADII[2] + 14} anchor="end" size={11} weight={700} color="var(--plot-5)">B₃</Label>
            <Label x={C} y={292} anchor="middle" size={11.5} weight={700} color="var(--plot-5)">B₁ &lt; B₂ &lt; B₃ — one constant per streamline</Label>
          </>
        ) : (
          <Label x={C} y={292} anchor="middle" size={11.5} weight={700} color="var(--plot-5)">B is the same on every streamline</Label>
        )}
        <Label x={8} y={16} size={10} color="var(--ink-3)">arrows: speed V · crosses: orientation of fluid elements</Label>
      </svg>
    </div>
  )
}

export function VortexFigure() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel forced />
      <Panel forced={false} />
    </div>
  )
}
