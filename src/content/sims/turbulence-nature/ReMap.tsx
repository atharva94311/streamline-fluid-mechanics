import { num, useElementSize } from '@/kit'
import { pow10Label } from './signal'

/**
 * Where do Wilkes's examples (p. 480) sit on the Reynolds-number axis?
 * Property values are illustrative typical numbers (supplementary), computed as Re = ρ v̄ D / μ.
 */
const ITEMS: { label: string; re: number; detail: string }[] = [
  { label: 'Polymer melt in a die', re: 2.4e-4, detail: 'μ ≈ 1000 Pa·s, D = 5 mm, 5 cm/s' },
  { label: 'Microfluidic chip', re: 1.0, detail: 'water, 100 µm channel, 1 cm/s' },
  { label: 'Blood, aorta at peak flow', re: 7.6e3, detail: 'D = 25 mm, 1 m/s' },
  { label: 'Heat-exchanger tube', re: 2.85e4, detail: 'water, D = 19 mm, 1.2 m/s' },
  { label: 'Natural-gas pipeline', re: 3.0e7, detail: 'D = 0.9 m, 8 m/s, 70 bar' },
]

const LO = -5
const HI = 9

function reText(re: number): string {
  if (re >= 1e4 || re < 1e-2) {
    const e = Math.floor(Math.log10(re))
    const m = re / 10 ** e
    return `${m.toFixed(1)}×${pow10Label(e)}`
  }
  return num.fmt(re, 2).replace(/\.0+$/, '')
}

export function ReMap() {
  const [ref, size] = useElementSize<HTMLDivElement>()
  const W = Math.max(300, size.width || 640)
  const left = 10
  const right = 10
  const top = 26
  const rowH = 38
  const axisH = 40
  const H = top + ITEMS.length * rowH + axisH
  const narrow = W < 520
  const iw = W - left - right
  const sx = (re: number) => left + ((Math.log10(re) - LO) / (HI - LO)) * iw
  const yAxis = top + ITEMS.length * rowH + 4
  const x2000 = sx(2000)
  const x4000 = sx(4000)
  const ticks = [-4, -2, 0, 2, 4, 6, 8]

  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} className="block max-w-full" role="img" aria-label="Reynolds numbers of typical process flows on a logarithmic axis">
        <rect x={left} y={top - 22} width={x2000 - left} height={yAxis - top + 22} fill="var(--plot-5)" fillOpacity={0.09} />
        <rect x={x2000} y={top - 22} width={x4000 - x2000} height={yAxis - top + 22} fill="var(--plot-3)" fillOpacity={0.16} />
        <rect x={x4000} y={top - 22} width={left + iw - x4000} height={yAxis - top + 22} fill="var(--plot-4)" fillOpacity={0.08} />
        <text x={(left + x2000) / 2} y={top - 8} textAnchor="middle" className="fill-emerald-700 text-[11px] font-semibold dark:fill-emerald-300">
          {narrow ? 'laminar (pipe)' : 'laminar in a pipe (Re ≲ 2000)'}
        </text>
        <text x={(x4000 + left + iw) / 2} y={top - 8} textAnchor="middle" className="fill-rose-700 text-[11px] font-semibold dark:fill-rose-300">
          {narrow ? 'turbulent' : 'turbulent (Re ≳ 4000)'}
        </text>
        {ITEMS.map((it, i) => {
          const x = sx(it.re)
          const y = top + i * rowH + rowH / 2
          const rightSide = x > left + 0.6 * iw
          const tx = rightSide ? x - 10 : x + 10
          const anchor = rightSide ? 'end' : 'start'
          const laminar = it.re < 2000
          return (
            <g key={it.label}>
              <line x1={left} x2={left + iw} y1={y} y2={y} stroke="var(--grid)" strokeDasharray="2 4" />
              <circle cx={x} cy={y} r={6} fill={laminar ? 'var(--plot-5)' : 'var(--plot-4)'} stroke="var(--surface)" strokeWidth={2} />
              <text x={tx} y={y - 3} textAnchor={anchor} className="fill-ink text-[12px] font-semibold">
                {it.label}
              </text>
              <text x={tx} y={y + 11} textAnchor={anchor} className="fill-ink-3 text-[10.5px]">
                Re ≈ {reText(it.re)}
                {narrow ? '' : ` · ${it.detail}`}
              </text>
            </g>
          )
        })}
        <line x1={left} x2={left + iw} y1={yAxis} y2={yAxis} stroke="var(--axis)" />
        {ticks.map((e) => (
          <g key={e}>
            <line x1={sx(10 ** e)} x2={sx(10 ** e)} y1={yAxis} y2={yAxis + 5} stroke="var(--axis)" />
            <text x={sx(10 ** e)} y={yAxis + 17} textAnchor="middle" className="fill-ink-3 text-[11px]">
              {pow10Label(e)}
            </text>
          </g>
        ))}
        <text x={left + iw} y={yAxis + 28} textAnchor="end" className="fill-ink-2 text-[11px] font-medium">
          Reynolds number Re = ρ v̄ D / μ (log scale)
        </text>
      </svg>
    </div>
  )
}
