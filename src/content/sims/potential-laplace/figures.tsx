/**
 * Static diagrams for the velocity-potential & Laplace topic.
 *  - UniformFlowFigure     : Lecture 10 slide 6 (uniform flow u = U, v = w = 0) + ✦ equipotentials x = const
 *  - SignConventionFigure  : ✦ course V = +∇φ vs Fox V = −∇φ (Fox p. 222 remark on the minus sign)
 *  - StencilFigure         : ✦ Laplacian as "value minus the mean of the neighbours" (5-point stencil)
 *  - CauchyRiemannFigure   : ✦ the two ways of writing u and v in plane potential flow
 *  - Table61               : Fox Table 6.1 (p. 224), typo in the φ row corrected and flagged
 * Colours are CSS variables; every SVG scales with its viewBox (works down to 360 px).
 */
import { M, md, useUid } from '@/kit'
import { Arrow, Sub, Tx } from './svg'

const svgCls = 'mx-auto block h-auto w-full'

/* ------------------------------------------------------------------ Lecture 10, slide 6 */

export function UniformFlowFigure() {
  const ys = [44, 70, 96, 122, 148]
  const eq = [176, 216, 256, 296]
  return (
    <svg viewBox="0 0 470 270" className={`${svgCls} max-w-xl`} role="img" aria-label="Uniform flow u = U, v = 0, w = 0 with vertical equipotential lines">
      {/* ✦ equipotentials φ = Ux + C = const */}
      {eq.map((x, k) => (
        <g key={x}>
          <line x1={x} x2={x} y1={26} y2={166} stroke="var(--equipotential)" strokeWidth={1.4} strokeDasharray="5 4" />
          <Tx x={x} y={20} size={12} anchor="middle" cls="fill-amber-700 dark:fill-amber-300">
            φ = c<Sub>{k + 1}</Sub>
          </Tx>
        </g>
      ))}
      {/* the slide's five parallel arrows */}
      {ys.map((y) => (
        <Arrow key={y} x1={150} y1={y} x2={326} y2={y} color="var(--ink)" width={2} head={10} />
      ))}
      <Tx x={336} y={ys[0] + 5} size={14}>
        u = U
      </Tx>
      <Tx x={386} y={ys[0] + 5} size={13} math={false} cls="fill-ink-2">
        (constant)
      </Tx>
      <Tx x={336} y={ys[2] + 5} size={14}>
        v = 0
      </Tx>
      <Tx x={336} y={ys[4] + 5} size={14}>
        w = 0
      </Tx>
      {/* ∇φ direction */}
      <Arrow x1={176} y1={190} x2={296} y2={190} color="var(--plot-3)" width={2.2} head={9} />
      <Tx x={236} y={208} size={12} anchor="middle" math={false} cls="fill-amber-700 dark:fill-amber-300">
        φ increases along the flow: c₁ &lt; c₂ &lt; c₃ &lt; c₄
      </Tx>
      {/* axes triad as on the slide: y up, x right, z towards the viewer */}
      <Arrow x1={60} y1={232} x2={60} y2={150} color="var(--ink-3)" width={1.4} head={7} />
      <Arrow x1={60} y1={232} x2={134} y2={232} color="var(--ink-3)" width={1.4} head={7} />
      <Arrow x1={60} y1={232} x2={26} y2={262} color="var(--ink-3)" width={1.4} head={7} />
      <Tx x={66} y={158} size={13}>
        y
      </Tx>
      <Tx x={128} y={250} size={13}>
        x
      </Tx>
      <Tx x={36} y={266} size={13}>
        z
      </Tx>
    </svg>
  )
}

/* ------------------------------------------------------------------ ✦ sign conventions */

function SignPanel({ fox }: { fox: boolean }) {
  const gid = useUid(fox ? 'sgF' : 'sgC')
  const xs = [52, 112, 172, 232]
  const vals = fox ? ['0', '−2', '−4', '−6'] : ['0', '2', '4', '6']
  return (
    <svg viewBox="0 0 290 200" className={svgCls} role="img" aria-label={fox ? 'Fox convention: flow towards decreasing phi' : 'Course convention: flow towards increasing phi'}>
      <defs>
        <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--equipotential)', stopOpacity: fox ? 0.38 : 0.04 }} />
          <stop offset="1" style={{ stopColor: 'var(--equipotential)', stopOpacity: fox ? 0.04 : 0.38 }} />
        </linearGradient>
      </defs>
      <Tx x={145} y={20} size={13.5} anchor="middle" math={false} weight={700}>
        {fox ? 'Fox (Eq. 6.27):  V = −∇φ' : 'Lecture 10:  V = +∇φ'}
      </Tx>
      <rect x={22} y={32} width={246} height={104} rx={8} fill={`url(#${gid})`} stroke="var(--line)" />
      {xs.map((x, k) => (
        <g key={x}>
          <line x1={x} x2={x} y1={36} y2={132} stroke="var(--equipotential)" strokeWidth={1.4} strokeDasharray="5 4" />
          <Tx x={x + 4} y={48} size={11.5} halo>
            φ = {vals[k]}
          </Tx>
        </g>
      ))}
      {[70, 94, 118].map((y) => (
        <Arrow key={y} x1={40} y1={y} x2={252} y2={y} color="var(--streamline)" width={1.8} head={8} />
      ))}
      <Tx x={145} y={156} size={12} anchor="middle" math={false} cls="fill-ink-2">
        {fox ? 'flow runs towards decreasing φ' : 'flow runs towards increasing φ'}
      </Tx>
      <Tx x={145} y={174} size={11.5} anchor="middle" math={false} cls="fill-ink-3">
        {fox ? '(like heat flowing from hot to cold)' : '(velocity points "uphill" in φ)'}
      </Tx>
      <Tx x={145} y={192} size={11} anchor="middle" math={false} cls="fill-ink-3">
        same flow: u = 2 m/s, lines 1 m apart
      </Tx>
    </svg>
  )
}

export function SignConventionFigure() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SignPanel fox={false} />
      <SignPanel fox />
    </div>
  )
}

/* ------------------------------------------------------------------ ✦ five-point stencil */

function Stencil({ title, vals, mean, verdict, good }: { title: string; vals: [number, number, number, number, number]; mean: string; verdict: string; good: boolean }) {
  const [P, E, W, N, S] = vals
  const node = (x: number, y: number, label: string, v: number, main = false) => (
    <g>
      <circle cx={x} cy={y} r={main ? 7 : 5.5} fill={main ? 'var(--plot-1)' : 'var(--surface)'} stroke="var(--plot-1)" strokeWidth={2} />
      <rect x={x - 27} y={y + 10} width={54} height={20} rx={5} fill="var(--surface-2)" stroke="var(--line)" />
      <Tx x={x} y={y + 24.5} size={12.5} anchor="middle" math={false} weight={600}>
        {String(v).replace('-', '−')}
      </Tx>
      <Tx x={x + 10} y={y - 8} size={12.5}>
        {label}
      </Tx>
    </g>
  )
  return (
    <svg viewBox="0 0 300 268" className={svgCls} role="img" aria-label={`Five-point stencil for ${title}`}>
      <Tx x={150} y={18} size={13.5} anchor="middle" math={false} weight={700}>
        {title}
      </Tx>
      {[70, 150, 230].map((x) => (
        <line key={`v${x}`} x1={x} x2={x} y1={36} y2={196} stroke="var(--grid)" strokeWidth={1} />
      ))}
      {[46, 116, 186].map((y) => (
        <line key={`h${y}`} x1={40} x2={260} y1={y} y2={y} stroke="var(--grid)" strokeWidth={1} />
      ))}
      <line x1={70} x2={230} y1={116} y2={116} stroke="var(--plot-1)" strokeWidth={1.6} />
      <line x1={150} x2={150} y1={46} y2={186} stroke="var(--plot-1)" strokeWidth={1.6} />
      <Tx x={190} y={110} size={11} anchor="middle" math={false} cls="fill-ink-3">
        h = 0.5
      </Tx>
      {node(150, 116, 'P', P, true)}
      {node(230, 116, 'E', E)}
      {node(70, 116, 'W', W)}
      {node(150, 46, 'N', N)}
      {node(150, 186, 'S', S)}
      <Tx x={150} y={234} size={12} anchor="middle" math={false} cls="fill-ink-2">
        {mean}
      </Tx>
      <Tx x={150} y={256} size={12.5} anchor="middle" math={false} weight={700} cls={good ? 'fill-emerald-700 dark:fill-emerald-300' : 'fill-rose-700 dark:fill-rose-300'}>
        {verdict}
      </Tx>
    </svg>
  )
}

export function StencilFigure() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Stencil
        title="φ = x³ − 3xy²  at P(1, 0.5)"
        vals={[0.25, 2.25, -0.25, -2, 1]}
        mean="mean of E, W, N, S = (2.25 − 0.25 − 2 + 1)/4 = 0.25"
        verdict="equals φ at P  ⇒  ∇²φ = 0  (harmonic)"
        good
      />
      <Stencil
        title="φ = x² + y²  at P(1, 0.5)"
        vals={[1.25, 2.5, 0.5, 2, 1]}
        mean="mean of E, W, N, S = (2.5 + 0.5 + 2 + 1)/4 = 1.5"
        verdict="> φ at P (1.25)  ⇒  ∇²φ ≈ 4(1.5 − 1.25)/0.5² = 4"
        good={false}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ ✦ the two definitions side by side */

export function CauchyRiemannFigure() {
  const cell = 'rounded-xl border px-3 py-2 text-center'
  return (
    <div className="mx-auto max-w-2xl">
      <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-x-2 gap-y-2 text-sm sm:gap-x-3">
        <div />
        <div className="text-center text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">from φ (irrotational)</div>
        <div />
        <div className="text-center text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">from ψ (continuity)</div>

        <div className="pr-1 text-base">
          <M tex={md`u =`} />
        </div>
        <div className={`${cell} border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10`}>
          <M tex={md`\pd{\phi}{x}`} />
        </div>
        <div className="text-lg text-ink-3">=</div>
        <div className={`${cell} border-sky-300 bg-sky-50 dark:border-sky-500/40 dark:bg-sky-500/10`}>
          <M tex={md`\pd{\psi}{y}`} />
        </div>

        <div className="pr-1 text-base">
          <M tex={md`v =`} />
        </div>
        <div className={`${cell} border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10`}>
          <M tex={md`\pd{\phi}{y}`} />
        </div>
        <div className="text-lg text-ink-3">=</div>
        <div className={`${cell} border-sky-300 bg-sky-50 dark:border-sky-500/40 dark:bg-sky-500/10`}>
          <M tex={md`-\pd{\psi}{x}`} />
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-ink-2 sm:grid-cols-2">
        <div className="rounded-lg bg-surface-2 px-3 py-2">
          <b>φ is "straight":</b> differentiate along the component's own direction — <M tex={md`x \to u`} />, <M tex={md`y \to v`} />, no minus sign.
        </div>
        <div className="rounded-lg bg-surface-2 px-3 py-2">
          <b>ψ is "crossed":</b> differentiate across — <M tex={md`y \to u`} />, <M tex={md`x \to v`} />, and the minus sits on <M tex={md`v`} />.
        </div>
      </div>
      <div className="mt-2 rounded-lg border border-dashed border-line px-3 py-2 text-center text-xs text-ink-3">
        Going between φ and ψ: integrate one row, then differentiate the result and match it to the other row to fix the "constant" of integration.
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Fox Table 6.1 */

export function Table61() {
  const th = 'border-b-2 border-indigo-300 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-ink-2 dark:border-indigo-500/40'
  const td = 'border-b border-line px-3 py-3 align-top'
  return (
    <div className="overflow-x-auto rounded-xl border border-indigo-200 dark:border-indigo-500/30">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-indigo-50/70 dark:bg-indigo-500/10">
          <tr>
            <th className={th}>Definition</th>
            <th className={th}>Always satisfies …</th>
            <th className={th}>
              Satisfies Laplace equation … <M tex={md`\tfrac{\partial^2(\,)}{\partial x^2} + \tfrac{\partial^2(\,)}{\partial y^2} = \nabla^2(\,) = 0`} />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={td}>
              <div className="font-semibold text-ink">Stream function ψ</div>
              <M tex={md`u = \pd{\psi}{y} \quad v = -\pd{\psi}{x}`} />
            </td>
            <td className={td}>
              <div className="mb-1 text-ink-2">… incompressibility:</div>
              <M tex={md`\pd{u}{x} + \pd{v}{y} = \frac{\partial^2\psi}{\partial x\,\partial y} - \frac{\partial^2\psi}{\partial y\,\partial x} \equiv 0`} />
            </td>
            <td className={td}>
              <div className="mb-1 text-ink-2">… only if irrotational:</div>
              <M tex={md`\pd{v}{x} - \pd{u}{y} = -\frac{\partial^2\psi}{\partial x\,\partial x} - \frac{\partial^2\psi}{\partial y\,\partial y} = 0`} />
            </td>
          </tr>
          <tr>
            <td className={td}>
              <div className="font-semibold text-ink">Velocity potential φ</div>
              <M tex={md`u = -\pd{\phi}{x} \quad v = -\pd{\phi}{y}`} />
            </td>
            <td className={td}>
              <div className="mb-1 text-ink-2">… irrotationality:</div>
              <M tex={md`\pd{v}{x} - \pd{u}{y} = -\frac{\partial^2\phi}{\partial x\,\partial y} + \frac{\partial^2\phi}{\partial y\,\partial x} \equiv 0`} />
              <div className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                printed with "− … −": a sign typo — the second term is <b>+</b> (corrected here)
              </div>
            </td>
            <td className={td}>
              <div className="mb-1 text-ink-2">… only if incompressible:</div>
              <M tex={md`\pd{u}{x} + \pd{v}{y} = -\frac{\partial^2\phi}{\partial x\,\partial x} - \frac{\partial^2\phi}{\partial y\,\partial y} = 0`} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
