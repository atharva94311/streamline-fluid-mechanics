import { useMemo, useState } from 'react'
import { FlowField, Md, Readout, Segmented, SimPanel, Slider, md } from '@/kit'
import { Verdict, sumTeX, tn } from './shared'

/*
 * 2-D incompressible flow: pick u(x, y) = a x² + b xy + c y² + d x + U0, get v from continuity:
 *   ∂v/∂y = −∂u/∂x = −(2a x + b y + d)  ⇒  v = −(2a xy + (b/2) y² + d y) + f(x)
 * Stream function for the plot: ψ = a x² y + (b/2) x y² + (c/3) y³ + d x y + U0 y − F(x),  F′ = f.
 */
type FMode = 'zero' | 'const' | 'linear'

export function MissingComponentFinder() {
  const [a, setA] = useState(0.5)
  const [b, setB] = useState(0)
  const [c, setC] = useState(0)
  const [d, setD] = useState(0)
  const [U0, setU0] = useState(1)
  const [mode, setMode] = useState<FMode>('zero')
  const [k, setK] = useState(0.5)

  const kk = mode === 'zero' ? 0 : k
  const f = (x: number) => (mode === 'linear' ? kk * x : kk)
  const F = (x: number) => (mode === 'linear' ? (kk * x * x) / 2 : kk * x)
  const psi = useMemo(
    () => (x: number, y: number) => a * x * x * y + (b / 2) * x * y * y + (c / 3) * y ** 3 + d * x * y + U0 * y - F(x),
    [a, b, c, d, U0, kk, mode], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const uTeX = sumTeX([[a, 'x^2'], [b, 'xy'], [c, 'y^2'], [d, 'x'], [U0, '']])
  const dudxTeX = sumTeX([[2 * a, 'x'], [b, 'y'], [d, '']])
  const integral = sumTeX([[-2 * a, 'xy'], [-b / 2, 'y^2'], [-d, 'y']])
  const fTeX = mode === 'zero' ? '0' : mode === 'const' ? tn(kk) : sumTeX([[kk, 'x']])
  const fTerm: [number, string] = mode === 'linear' ? [kk, 'x'] : [kk, '']
  const vTeX = sumTeX([[-2 * a, 'xy'], [-b / 2, 'y^2'], [-d, 'y'], fTerm])
  const cond =
    mode === 'zero'
      ? md`v = 0 \text{ on the } x\text{-axis } (y = 0) \;\Rightarrow\; f(x) = 0`
      : mode === 'const'
        ? md`v = ${tn(kk)} \text{ m/s on the } x\text{-axis} \;\Rightarrow\; f(x) = ${tn(kk)}`
        : md`v = ${tn(kk)}\,x \text{ on the } x\text{-axis} \;\Rightarrow\; f(x) = ${sumTeX([[kk, 'x']])}`

  // sample values at a reference point
  const X = 1
  const Y = 0.5
  const uP = a * X * X + b * X * Y + c * Y * Y + d * X + U0
  const vP = -(2 * a * X * Y + (b / 2) * Y * Y + d * Y) + f(X)

  return (
    <SimPanel
      title="Missing-component finder"
      subtitle="choose u(x, y), get v(x, y) from 2-D incompressible continuity"
      wide
      controls={
        <>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">
            <Md inline>{md`$u = a x^2 + b\,xy + c\,y^2 + d\,x + U_0$`}</Md>
          </div>
          <Slider label="$a$" value={a} min={-1} max={1} step={0.25} onChange={setA} unit="1/(m·s)" digits={3} />
          <Slider label="$b$" value={b} min={-1} max={1} step={0.25} onChange={setB} unit="1/(m·s)" digits={3} />
          <Slider label="$c$" value={c} min={-1} max={1} step={0.25} onChange={setC} unit="1/(m·s)" digits={3} />
          <Slider label="$d$" value={d} min={-1.5} max={1.5} step={0.25} onChange={setD} unit="1/s" digits={3} />
          <Slider label="$U_0$" value={U0} min={-1.5} max={1.5} step={0.25} onChange={setU0} unit="m/s" digits={3} />
          <Segmented<FMode>
            label="Condition that fixes $f(x)$"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'zero', label: '$v(x,0)=0$' },
              { value: 'const', label: '$v(x,0)=k$' },
              { value: 'linear', label: '$v(x,0)=kx$' },
            ]}
          />
          {mode !== 'zero' ? <Slider label="$k$" value={k} min={-1} max={1} step={0.25} onChange={setK} unit={mode === 'const' ? 'm/s' : '1/s'} digits={3} /> : null}
          <Verdict ok>
            <Md inline>{md`$\partial u/\partial x + \partial v/\partial y = 0$ identically — by construction.`}</Md>
          </Verdict>
        </>
      }
      readout={
        <Readout
          cols={2}
          items={[
            { label: md`$u$ at (1, 0.5) m`, value: uP, unit: 'm/s', digits: 3 },
            { label: md`$v$ at (1, 0.5) m`, value: vP, unit: 'm/s', digits: 3 },
          ]}
        />
      }
      footer={
        <Md inline>
          {md`**Try this:** keep $u$ fixed and switch the condition from $v(x,0)=0$ to $v(x,0)=k$ and then $kx$. Every choice satisfies continuity, yet the streamlines change — the "constant" of integration is a whole **function** $f(x)$, and only a boundary condition can pin it down. Note that $c$ (the $y^2$ term) never affects $v$, because $\partial(cy^2)/\partial x = 0$.`}
        </Md>
      }
    >
      <div className="space-y-3">
        <FlowField x={[-2, 2]} y={[-1.5, 1.5]} psi={psi} psiLevels={20} particles={70} quiver={11} markers={[{ x: X, y: Y, kind: 'point', label: '(1, 0.5)' }]} maxHeight={380} />
        <Md className="md-tight text-sm">
          {md`$$
\begin{aligned}
u &= ${uTeX}\\
\pd{v}{y} &= -\pd{u}{x} = -(${dudxTeX})\\
v &= \textstyle\int -\pd{u}{x}\,dy = ${integral} + f(x)\\
&\text{condition: } ${cond}\\
v &= ${vTeX}
\end{aligned}
$$

The integral is taken with $x$ held constant, so the "constant" of integration is $f(x)$. Current choice: $f(x) = ${fTeX}$.`}
        </Md>
      </div>
    </SimPanel>
  )
}
