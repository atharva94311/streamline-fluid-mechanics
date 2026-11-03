/**
 * Concept "common-groups" (visual): a disturbance moving at speed V emits waves that travel at speed c.
 * Ma = V/c for sound waves; the same picture with shallow-water waves (speed √(gy)) shows Fr = V/√(gy).
 * For a ratio > 1 the source outruns its own waves and a wedge (Mach cone / V-shaped wake) forms,
 * half-angle α = arcsin(1/ratio). Supplementary illustration.
 */
import { useRef, useState } from 'react'
import { Md, PlayPause, Readout, Segmented, SimPanel, Slider, md, useAnimationFrame, useInView, usePrefersReducedMotion } from '@/kit'

const W = 600
const H = 260
const C_PX = 60 // wave speed in px/s (screen units)
const EMIT = 0.25 // s between wavefronts
const N_WAVES = 26

export function WaveFront() {
  const [mode, setMode] = useState<'mach' | 'froude'>('mach')
  const [ratio, setRatio] = useState(0.6)
  const [playing, setPlaying] = useState(true)
  const [t, setT] = useState(6)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()

  useAnimationFrame((dt) => setT((x) => x + Math.min(dt, 0.05)), playing && inView && !reduced)

  const V = ratio * C_PX
  // source travels left → right, wrapping; reset time-base each lap
  const lap = (W + 200) / Math.max(V, 1e-6)
  const tl = V > 0.5 ? t % lap : t
  const sx = (tt: number) => (V > 0.5 ? -100 + V * tt : W / 2)
  const xs = sx(tl)
  const ys = H / 2

  const waves: { cx: number; r: number }[] = []
  for (let k = 0; k < N_WAVES; k++) {
    const te = Math.floor(tl / EMIT) * EMIT - k * EMIT
    if (te < 0) break
    const r = C_PX * (tl - te)
    waves.push({ cx: sx(te), r })
  }
  const alpha = ratio > 1 ? Math.asin(1 / ratio) : null
  const wedgeLen = 700
  const label = mode === 'mach' ? 'Ma' : 'Fr'
  const waveName = mode === 'mach' ? 'sound speed c' : 'shallow-water wave speed √(gy)'

  return (
    <SimPanel
      title="Outrunning your own waves"
      subtitle={mode === 'mach' ? md`Mach number $\Ma = V/c$` : md`Froude number $\Fr = V/\sqrt{gy}$`}
      controls={
        <>
          <Segmented
            label="Waves"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'mach', label: 'sound (Mach)' },
              { value: 'froude', label: 'shallow water (Froude)' },
            ]}
          />
          <Slider label={mode === 'mach' ? md`Mach number $V/c$` : md`Froude number $V/\sqrt{gy}$`} value={ratio} min={0} max={2.5} step={0.01} onChange={setRatio} digits={2} />
          <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => setT(6)} />
          <Readout
            cols={2}
            items={[
              { label: label, value: ratio, digits: 3, tone: ratio < 1 ? 'good' : 'bad' },
              { label: 'wedge half-angle', value: alpha == null ? 'none' : `${((alpha * 180) / Math.PI).toFixed(1)}°` },
            ]}
          />
        </>
      }
      footer={
        <Md>{md`**Try this:** drag the slider slowly through 1. Below 1 the waves run ahead and "warn" the fluid upstream; at 1 they pile up at the nose; above 1 they are confined to a wedge with $\sin\alpha = 1/\mathrm{${label}}$. The same geometry explains a sonic boom ($\Ma$) and the subcritical/supercritical change in a channel ($\Fr$).`}</Md>
      }
    >
      <div ref={ref}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-xl bg-surface-2" role="img" aria-label="Wavefronts emitted by a moving source">
          <defs>
            <clipPath id="dg-wave-clip">
              <rect x={0} y={0} width={W} height={H} />
            </clipPath>
          </defs>
          <g clipPath="url(#dg-wave-clip)">
            {waves.map((w, i) => (
              <circle key={i} cx={w.cx} cy={ys} r={w.r} fill="none" stroke="var(--streamline)" strokeWidth={1.3} opacity={Math.max(0.15, 1 - i / N_WAVES)} />
            ))}
            {alpha != null ? (
              <g stroke="var(--plot-4)" strokeWidth={2} strokeDasharray="6 4">
                <line x1={xs} y1={ys} x2={xs - wedgeLen * Math.cos(alpha)} y2={ys - wedgeLen * Math.sin(alpha)} />
                <line x1={xs} y1={ys} x2={xs - wedgeLen * Math.cos(alpha)} y2={ys + wedgeLen * Math.sin(alpha)} />
              </g>
            ) : null}
            <circle cx={xs} cy={ys} r={6} fill="var(--plot-1)" />
          </g>
        </svg>
        <p className="mt-2 text-sm text-ink-2">
          Source (dot) moves right at speed V; each ring is a wave travelling at the {waveName}.{' '}
          <b className="text-ink">
            {ratio < 1 ? `${label} < 1: waves escape ahead of the source.` : ratio === 1 ? `${label} = 1: waves pile up at the source.` : `${label} > 1: waves are trapped inside a wedge.`}
          </b>
        </p>
      </div>
    </SimPanel>
  )
}
