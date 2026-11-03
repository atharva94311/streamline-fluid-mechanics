import { useState } from 'react'
import { Md, Plot, Readout, Segmented, SimPanel, Slider, md } from '@/kit'

/**
 * Order-of-magnitude "exponent balancer" for Table 9.2 (plane jet) and its axisymmetric counterpart (Eq. 9.129).
 * Each term of the momentum balance behaves like x^k; the similarity solution exists only when the inertia and stress
 * exponents match AND the momentum-flux integral is independent of x.
 */
export function ExponentBalancer() {
  const [geo, setGeo] = useState<'plane' | 'round'>('plane')
  const [p, setP] = useState(0.7)
  const [q, setQ] = useState(0.7)
  const round = geo === 'round'
  const kIn = -(1 + 2 * q)
  const kSt = -(p + 2 * q)
  const kM = round ? 2 * p - 2 * q : p - 2 * q
  const kNu = p - q
  const eps = 1e-6
  const balanced = Math.abs(kIn - kSt) < eps
  const conserved = Math.abs(kM) < eps
  const solved = balanced && conserved
  const v = round ? 'z' : 'x'
  const series = [
    { label: md`inertia terms $\sim ${v}^{-(1+2q)}$`, fn: (x: number) => Math.pow(x, kIn), color: 'var(--plot-1)', width: 2.4 },
    { label: md`turbulent-stress term $\sim ${v}^{-(p+2q)}$`, fn: (x: number) => Math.pow(x, kSt), color: 'var(--plot-2)', width: 2.4, dash: '7 4' },
    { label: md`momentum flux $\dot{\mathcal M}/\rho \sim ${v}^{${round ? '2p-2q' : 'p-2q'}}$`, fn: (x: number) => Math.pow(x, kM), color: 'var(--plot-5)', width: 2.4 },
  ]
  const f = (k: number) => (Math.abs(k) < 5e-4 ? '0' : k.toFixed(2))
  return (
    <SimPanel
      title="Exponent balancer (Table 9.2)"
      subtitle={md`find $p$ and $q$ in $b\propto ${v}^p$, $\overline{v}\propto ${v}^{-q}$`}
      src={[
        { doc: 'wilkes', pages: '526–527', note: 'Eqs. (9.108)–(9.110), Table 9.2' },
        { doc: 'wilkes', pages: '531', note: 'Eq. (9.129)' },
      ]}
      wide
      controls={
        <>
          <Segmented
            label="Jet"
            value={geo}
            onChange={setGeo}
            options={[
              { value: 'plane', label: 'Plane (slot)' },
              { value: 'round', label: 'Round (orifice)' },
            ]}
          />
          <Slider label={md`spreading exponent $p$`} value={p} min={0} max={2} step={0.05} onChange={setP} digits={2} />
          <Slider label={md`velocity-decay exponent $q$`} value={q} min={0} max={2} step={0.05} onChange={setQ} digits={2} />
          <button
            type="button"
            className="btn-ghost w-full justify-center"
            onClick={() => {
              setP(1)
              setQ(round ? 1 : 0.5)
            }}
          >
            Snap to the book's answer
          </button>
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'inertia exponent', value: f(kIn) },
            { label: 'stress exponent', value: f(kSt) },
            { label: 'momentum-flux exponent', value: f(kM), tone: conserved ? 'good' : 'bad' },
            { label: 'inertia = stress?', value: balanced ? 'yes' : 'no', tone: balanced ? 'good' : 'bad' },
            { label: md`$\nu_{\mathrm T}\propto b\,\overline{v}_c \sim ${v}^{p-q}$`, value: f(kNu) },
            { label: 'similarity solution', value: solved ? 'exists ✓' : 'impossible', tone: solved ? 'good' : 'bad' },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** first make the green momentum line flat (momentum conservation: $p=${round ? 'q' : '2q'}$). Then slide along that family until the inertia and stress lines become parallel — only one point works: ${round ? '$p=q=1$' : '$p=1,\\ q=\\tfrac12$'}. Note the $\nu_{\mathrm T}$ tile: for the round jet it becomes $${v}^0$ — a constant eddy viscosity.`}
        </Md>
      }
    >
      <Plot
        x={{ label: md`distance from the ${round ? 'orifice $z$' : 'slot $x$'} (arbitrary units)`, domain: [1, 100], log: true }}
        y={{ label: 'size of term (arbitrary units)', domain: [1e-6, 1e3], log: true }}
        series={series}
        height={320}
      />
    </SimPanel>
  )
}
