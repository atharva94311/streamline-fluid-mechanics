import { useState } from 'react'
import { Md, Plot, Segmented, SimPanel, Slider, md, num } from '@/kit'
import { COLORS, TABLE_E96, blasiusFF, fmtPct, nuDB, nuPTA, nuRA, pctDiff, velocityRatio } from './model'
import { Tiles } from './Tiles'

type View = 'nu' | 'ratio'

const PRESETS: { label: string; Pr: number }[] = [
  { label: '0.5', Pr: 0.5 },
  { label: '1', Pr: 1 },
  { label: '2', Pr: 2 },
  { label: 'air ≈ 0.7', Pr: 0.7 },
  { label: 'water ≈ 7', Pr: 7 },
]

/** Concept 3 interactive: Example 9.6 at any Re and Pr — RA, PTA and Dittus–Boelter side by side. */
export function AnalogyTester() {
  const [Re, setRe] = useState(50000)
  const [Pr, setPr] = useState(2)
  const [view, setView] = useState<View>('nu')

  const ra = nuRA(Re, Pr)
  const pta = nuPTA(Re, Pr)
  const db = nuDB(Re, Pr)
  const eRA = pctDiff(ra, db)
  const ePTA = pctDiff(pta, db)
  const bookCase = Math.abs(Re / 50000 - 1) < 0.01

  const warnings: string[] = []
  if (Re > 1e5) warnings.push(md`$\Rey > 10^5$: the Blasius law (E9.6.2) is beyond the range Wilkes states for it ($\Rey < 10^5$, p. 500), and so is (9.103).`)
  if (Re < 1e4) warnings.push(md`$\Rey < 10^4$: the Dittus–Boelter correlation is normally used only for fully turbulent flow, $\Rey \gtrsim 10^4$ (supplementary).`)
  if (Pr < 0.6) warnings.push(md`$\Pran < 0.6$: below the range usually quoted for Dittus–Boelter ($0.6 \lesssim \Pran \lesssim 160$, supplementary) — treat the benchmark itself with caution.`)

  const tableDots: [number, number][] = bookCase ? TABLE_E96.flatMap((r) => [[r.Pr, r.RA], [r.Pr, r.DB], [r.Pr, r.PTA]] as [number, number][]) : []

  return (
    <SimPanel
      title="Analogy tester"
      subtitle="Example 9.6 at any Re and Pr"
      src={{ doc: 'wilkes', pages: '522–524', note: 'Example 9.6' }}
      wide
      controls={
        <>
          <Segmented
            label="Plot"
            options={[
              { value: 'nu', label: 'Nu vs Pr' },
              { value: 'ratio', label: 'model ÷ DB' },
            ]}
            value={view}
            onChange={setView}
          />
          <Slider label="Reynolds number $\Rey$" value={Re} min={5e3} max={3e5} log onChange={setRe} format={(v) => num.fmt(v, 3)} />
          <button
            type="button"
            onClick={() => setRe(50000)}
            className={`w-full rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${bookCase ? 'border-teal-500 bg-teal-600 text-white' : 'border-line bg-surface text-ink-2 hover:border-teal-400'}`}
          >
            Book case: Re = 50 000 (Table E9.6)
          </button>
          <Slider label="Prandtl number $\Pran$" value={Pr} min={0.3} max={100} log onChange={setPr} digits={3} />
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPr(p.Pr)}
                className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${Math.abs(Pr - p.Pr) < 1e-9 ? 'border-teal-500 bg-teal-600 text-white' : 'border-line bg-surface text-ink-2 hover:border-teal-400'}`}
              >
                Pr = {p.label}
              </button>
            ))}
          </div>
        </>
      }
      readout={
        <Tiles
          items={[
            { label: md`$\Nu_\mathrm{RA}$ (E9.6.5)`, value: ra, digits: 4 },
            { label: md`$\Nu_\mathrm{PTA}$ (E9.6.8)`, value: pta, digits: 4 },
            { label: md`$\Nu_\mathrm{DB}$ (E9.6.1)`, value: db, digits: 4, tone: 'accent' },
            { label: md`$\overline{v}_{z\delta}/\overline{v}_{zm}$ (9.103)`, value: velocityRatio(Re), digits: 3 },
            { label: 'RA vs DB', value: fmtPct(eRA), tone: Math.abs(eRA) <= 10 ? 'good' : 'bad' },
            { label: 'PTA vs DB', value: fmtPct(ePTA), tone: Math.abs(ePTA) <= 10 ? 'good' : 'bad' },
            { label: md`$f_\mathrm{F}/2$ (E9.6.2)`, value: blasiusFF(Re) / 2, digits: 3 },
            { label: md`$\St_\mathrm{DB} = \Nu/(\Rey\,\Pran)$`, value: db / (Re * Pr), digits: 3 },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** press *Book case* and check that the dots (the printed Table E9.6) sit on the curves. Slide $\Pran$ from 0.5 to 2: the Reynolds analogy swings from about −34 % to about +50 % while Prandtl–Taylor stays within about 7 %. Then try *water ≈ 7*: even Prandtl–Taylor is now roughly a third too low — the "further refinements" (a buffer region) that Wilkes mentions are needed for liquids.`}
        </Md>
      }
    >
      {view === 'nu' ? (
        <Plot
          height={330}
          x={{ label: md`Prandtl number $\Pran$ (log scale)`, domain: [0.3, 100], log: true }}
          y={{ label: md`Nusselt number $\Nu = hD/k$ (log scale)`, domain: [5, 1e5], log: true }}
          series={[
            { label: 'Reynolds analogy (E9.6.5)', fn: (p) => nuRA(Re, p), color: COLORS.RA },
            { label: 'Prandtl–Taylor (E9.6.8)', fn: (p) => nuPTA(Re, p), color: COLORS.PTA },
            { label: 'Dittus–Boelter (E9.6.1)', fn: (p) => nuDB(Re, p), color: COLORS.DB, dash: '7 5', width: 2.6 },
            ...(bookCase ? [{ label: 'Table E9.6 (printed)', points: tableDots, kind: 'scatter' as const, color: 'var(--ink-2)' }] : []),
          ]}
          vlines={[{ x: 1, label: 'Pr = 1' }]}
          marks={[
            { x: Pr, y: ra, color: COLORS.RA },
            { x: Pr, y: pta, color: COLORS.PTA },
            { x: Pr, y: db, color: COLORS.DB },
          ]}
        />
      ) : (
        <Plot
          height={330}
          x={{ label: md`Prandtl number $\Pran$ (log scale)`, domain: [0.3, 100], log: true }}
          y={{ label: md`$\Nu_\mathrm{model}/\Nu_\mathrm{DB}$ (log scale)`, domain: [0.2, 20], log: true }}
          series={[
            { label: 'Reynolds analogy ÷ DB', fn: (p) => nuRA(Re, p) / nuDB(Re, p), color: COLORS.RA },
            { label: 'Prandtl–Taylor ÷ DB', fn: (p) => nuPTA(Re, p) / nuDB(Re, p), color: COLORS.PTA },
          ]}
          hlines={[{ y: 1, label: 'perfect agreement with DB', color: COLORS.DB }]}
          vlines={[{ x: 1, label: 'Pr = 1' }]}
          marks={[
            { x: Pr, y: ra / db, color: COLORS.RA },
            { x: Pr, y: pta / db, color: COLORS.PTA },
          ]}
          overlay={({ sx, sy }) => (
            <rect
              x={sx(0.3)}
              width={sx(100) - sx(0.3)}
              y={sy(1.1)}
              height={sy(0.9) - sy(1.1)}
              fill={COLORS.DB}
              opacity={0.12}
            />
          )}
        />
      )}
      <div className="mt-2 text-xs text-ink-3">
        <Md inline>
          {view === 'nu'
            ? md`Big dots: the three predictions at the chosen $\Pran$. ${bookCase ? 'Small grey dots: the printed Table E9.6.' : 'Set Re = 50 000 to see the printed Table E9.6 points.'}`
            : md`Shaded band: within ±10 % of Dittus–Boelter. At $\Pran = 1$ the two curves meet, because the Prandtl–Taylor analogy reduces to the Reynolds analogy there.`}
        </Md>
      </div>
      {warnings.length ? (
        <div className="mt-2 space-y-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-ink-2 dark:border-amber-500/30 dark:bg-amber-500/10">
          {warnings.map((w, i) => (
            <div key={i}>
              <Md inline>{w}</Md>
            </div>
          ))}
        </div>
      ) : null}
    </SimPanel>
  )
}
