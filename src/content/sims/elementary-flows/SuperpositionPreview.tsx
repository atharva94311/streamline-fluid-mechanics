import { useMemo, useState } from 'react'
import { FlowField, SimPanel, Slider, md, type Vec } from '@/kit'
import { TeXReadout } from './ui'

const TWO_PI = 2 * Math.PI

/**
 * Preview of the method of superposition (Lecture 12 slides 16–17): uniform stream U along +x plus a line source m
 * at the origin. ψ = U r sin θ + (m/2π) θ with θ ∈ [0, 2π), so the branch cut lies on the +x axis inside the body.
 */
export function SuperpositionPreview() {
  const [U, setU] = useState(1)
  const [m, setM] = useState(3)
  const k = m / TWO_PI
  const b = m / (TWO_PI * U)

  const field = useMemo(() => {
    const step = 0.3 * U
    return {
      psi: (x: number, y: number) => {
        const t = Math.atan2(y, x)
        return U * y + k * (t < 0 ? t + TWO_PI : t)
      },
      vel: (x: number, y: number): Vec => {
        const r2 = x * x + y * y
        return r2 < 1e-9 ? [U, 0] : [U + (k * x) / r2, (k * y) / r2]
      },
      levels: Array.from({ length: 31 }, (_, j) => +(m / 2 + (j - 15) * step).toFixed(10)),
    }
  }, [U, k, m])

  return (
    <SimPanel
      title="Preview — adding the building blocks"
      subtitle={md`$\psi = Ur\sin\theta + \tfrac{m}{2\pi}\theta$ (uniform stream + source)`}
      src={{ doc: 'lec12', pages: '16–17' }}
      controls={
        <>
          <Slider label="stream speed $U$" value={U} min={0.5} max={3} step={0.05} onChange={setU} unit="m/s" digits={2} />
          <Slider label="source strength $m$" value={m} min={0.5} max={6} step={0.1} onChange={setM} unit="m²/s" digits={2} />
        </>
      }
      readout={
        <TeXReadout
          items={[
            { label: md`$b = m/2\pi U$`, value: b, unit: 'm' },
            { label: md`stagnation point $x$`, value: -b, unit: 'm' },
            { label: md`$\psi_{\text{stag}} = m/2$`, value: m / 2, unit: 'm²/s', tone: 'accent' },
            { label: md`far half-width $\pi b$`, value: Math.PI * b, unit: 'm' },
          ]}
        />
      }
      footer={
        <>
          <b>Try this:</b> raise m at fixed U — the body grows (the “increasing m” panels of slide 17); raise U at fixed m — the
          stagnation point creeps toward the source because b = m/2πU. Everything inside the highlighted streamline came out of
          the source; that streamline can be replaced by a solid surface. Full treatment: the <i>Superposition</i> topic.
        </>
      }
    >
      <FlowField
        x={[-3, 5]}
        y={[-2.5, 2.5]}
        psi={field.psi}
        vel={field.vel}
        psiLevels={field.levels}
        cut={0.5 * m}
        highlight={[{ level: m / 2, label: 'dividing streamline ψ = m/2', color: 'var(--plot-4)' }]}
        particles={120}
        Uref={U}
        markers={[
          { x: 0, y: 0, kind: 'source' },
          { x: -b, y: 0, kind: 'stagnation', label: 'stagnation point' },
        ]}
      />
    </SimPanel>
  )
}
