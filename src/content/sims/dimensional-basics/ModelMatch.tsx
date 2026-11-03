/**
 * Concept "nondimensional-equations": Fox p. 247 — two geometrically similar flows of different size (model and
 * prototype) obey the same Eqs. (7.8)–(7.10), so they have the same nondimensional solution only if BOTH coefficients,
 * 1/Re and gL/V∞², are equal. This calculator works with ratios (model ÷ prototype) to show why matching both at once
 * forces a special model fluid. The ratio algebra is supplementary.
 */
import { useState } from 'react'
import { M, SimPanel, Slider, md, num } from '@/kit'
import { SimBody, Tiles } from './ui'

const GX0 = 70
const GX1 = 400
const gx = (r: number) => GX0 + ((Math.min(2, Math.max(-2, Math.log10(r))) + 2) / 4) * (GX1 - GX0)

function Gauge({ y, label, ratio }: { y: number; label: string; ratio: number }) {
  const ok = Math.abs(Math.log10(ratio)) < 0.009 // within about 2 %
  return (
    <g>
      <text x={GX0 - 8} y={y + 4} textAnchor="end" className="fill-ink text-[11px] font-semibold">
        {label}
      </text>
      <line x1={GX0} x2={GX1} y1={y} y2={y} stroke="var(--axis)" strokeOpacity={0.6} strokeWidth={1.2} />
      {[0.01, 0.1, 1, 10, 100].map((v) => (
        <g key={v}>
          <line x1={gx(v)} x2={gx(v)} y1={y - (v === 1 ? 8 : 4)} y2={y + (v === 1 ? 8 : 4)} stroke="var(--axis)" strokeOpacity={v === 1 ? 1 : 0.5} />
          <text x={gx(v)} y={y + 18} textAnchor="middle" className="fill-ink-3 text-[9.5px]">
            {v}
          </text>
        </g>
      ))}
      <circle cx={gx(ratio)} cy={y} r={6} fill={ok ? 'var(--plot-5)' : 'var(--plot-4)'} stroke="var(--surface)" strokeWidth={1.5} />
      <text x={gx(ratio)} y={y - 10} textAnchor="middle" className="fill-ink text-[10px] font-bold">
        {num.fmt(ratio, 3)}
        {ok ? ' ✓' : ''}
      </text>
    </g>
  )
}

export function ModelMatch() {
  const [lam, setLam] = useState(1 / 25)
  const [nuR, setNuR] = useState(1)
  const [vR, setVR] = useState(0.2)
  const reR = (vR * lam) / nuR
  const frR = vR / Math.sqrt(lam)
  const reOk = Math.abs(Math.log10(reR)) < 0.009
  const frOk = Math.abs(Math.log10(frR)) < 0.009
  const nuBoth = lam ** 1.5

  const btn = 'rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink-2 hover:border-teal-400 hover:text-ink'

  return (
    <SimPanel
      title="Model vs. prototype: can both coefficients match?"
      subtitle="ratios are model ÷ prototype"
      src={{ doc: 'fox', pages: '247' }}
      footer={
        <>
          <strong>Try this:</strong> keep water in the model (<M tex={md`\nu_m/\nu_p = 1`} />) and press &ldquo;match Fr&rdquo;, then
          &ldquo;match Re&rdquo; — each button breaks the other match. Only &ldquo;match both&rdquo; works, and it demands a model fluid with{' '}
          <M tex={md`\nu_m/\nu_p = \lambda^{3/2}`} /> (0.008 at <M tex={md`\lambda = 1/25`} />): no ordinary liquid is that much thinner than water.
        </>
      }
    >
      <SimBody
        viz={
          <>
      <svg viewBox="0 0 420 120" className="h-auto w-full" role="img" aria-label="Reynolds and Froude number ratios of model to prototype">
        <rect x={gx(0.98)} y={10} width={gx(1.02) - gx(0.98)} height={96} fill="var(--band)" />
        <Gauge y={36} label="Re ratio" ratio={reR} />
        <Gauge y={86} label="Fr ratio" ratio={frR} />
      </svg>
      <div className="mt-2 space-y-1 text-sm text-ink-2">
        <div>
          <M tex={md`\dfrac{Re_m}{Re_p} = \dfrac{V_m}{V_p}\,\lambda\,\dfrac{\nu_p}{\nu_m}, \qquad \dfrac{Fr_m}{Fr_p} = \dfrac{V_m/V_p}{\sqrt{\lambda}}`} />
        </div>
        <div className="text-xs text-ink-3">
          Equal <M tex="Fr" /> needs <M tex={md`V_m/V_p = \sqrt{\lambda}`} />; equal <M tex="Re" /> needs{' '}
          <M tex={md`V_m/V_p = (\nu_m/\nu_p)/\lambda`} />. Both together require <M tex={md`\nu_m/\nu_p = \lambda^{3/2}`} />.
        </div>
      </div>
          </>
        }
        controls={
        <>
          <Slider label={md`length scale $\lambda = L_m/L_p$`} value={lam} min={0.01} max={1} log onChange={setLam} digits={3} />
          <Slider label={md`model fluid $\nu_m/\nu_p$`} value={nuR} min={0.001} max={10} log onChange={setNuR} digits={3} />
          <Slider label="model speed $V_m/V_p$" value={vR} min={0.01} max={100} log onChange={setVR} digits={3} />
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={btn} onClick={() => setVR(Math.sqrt(lam))}>
              match Fr
            </button>
            <button type="button" className={btn} onClick={() => setVR(nuR / lam)}>
              match Re
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => {
                setNuR(lam ** 1.5)
                setVR(Math.sqrt(lam))
              }}
            >
              match both
            </button>
          </div>
        </>
        }
        readout={
        <Tiles
          items={[
            { label: md`$Re_m/Re_p$`, value: reR, digits: 3, tone: reOk ? 'good' : 'bad' },
            { label: md`$Fr_m/Fr_p$`, value: frR, digits: 3, tone: frOk ? 'good' : 'bad' },
            { label: md`$\nu_m/\nu_p$ needed for both`, value: nuBoth, digits: 3 },
            { label: 'same nondimensional solution?', value: reOk && frOk ? 'yes' : 'no', tone: reOk && frOk ? 'good' : 'bad' },
          ]}
        />
        }
      />
    </SimPanel>
  )
}
