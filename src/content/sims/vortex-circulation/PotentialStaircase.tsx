import { Plot, md } from '@/kit'

const K = 1 / (2 * Math.PI) // so that Γ = 2πK = 1 m²/s
const DEG = Math.PI / 180

/** φ = Kθ followed along a path: climbing round the vortex vs a loop that misses the vortex centre. */
export function PotentialStaircase() {
  // loop 2: circle of radius 0.8 m centred at (1.5, 0) m — it does not enclose the origin
  const beside = (deg: number) => {
    const t = deg * DEG
    const x = 1.5 + 0.8 * Math.cos(t)
    const y = 0.8 * Math.sin(t)
    return K * Math.atan2(y, x) // continuous here because x > 0 on this loop
  }
  return (
    <Plot
      x={{ label: 'angle travelled round the loop (degrees)', domain: [0, 1080] }}
      y={{ label: md`velocity potential $\phi$ (m²/s)`, domain: [-0.3, 3.3] }}
      series={[
        { label: md`loop round the vortex: $\phi = K\theta$ climbs $2\pi K = \Gamma$ per lap`, fn: (d) => K * d * DEG, color: 'var(--plot-1)', width: 2.6 },
        { label: 'loop beside the vortex: φ returns to its start value', fn: beside, color: 'var(--plot-3)', width: 2.4, samples: 600 },
      ]}
      vlines={[
        { x: 360, label: '1 lap' },
        { x: 720, label: '2 laps' },
      ]}
      marks={[
        { x: 360, y: 1, label: 'Γ', color: 'var(--plot-1)' },
        { x: 720, y: 2, label: '2Γ', color: 'var(--plot-1)' },
        { x: 1080, y: 3, label: '', color: 'var(--plot-1)' },
      ]}
      height={250}
    />
  )
}
