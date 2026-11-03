import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, TopicMeta } from '@/lib/types'
import {
  Callout,
  Compare,
  Concept,
  Derivation,
  ExampleCard,
  Figure,
  FlowSteps,
  FormulaCard,
  Md,
  Plot,
  PracticeList,
  QuickCheck,
  Step,
  Supplement,
  Takeaways,
  md,
} from '@/kit'
import { JetSchematic } from '../sims/turbulent-jets/JetSchematic'
import { JetVisualiser } from '../sims/turbulent-jets/JetVisualiser'
import { PlaneProfileSim } from '../sims/turbulent-jets/PlaneProfileSim'
import { ExponentBalancer } from '../sims/turbulent-jets/ExponentBalancer'
import { TanhExplorer } from '../sims/turbulent-jets/TanhExplorer'
import { RoundJetExplorer } from '../sims/turbulent-jets/RoundJetExplorer'
import { BETA_ML, mlProfile, tanhProfile, transverse } from '../sims/turbulent-jets/jetSolutions'

/* ------------------------------------------------------------------------------------------------ */
/*  Meta                                                                                            */
/* ------------------------------------------------------------------------------------------------ */

export const meta: TopicMeta = {
  id: 'turbulent-jets',
  unit: 'D',
  title: 'Turbulent Jets',
  subtitle:
    'Free turbulence with no walls: a jet keeps its momentum flux, spreads linearly, slows down and drags in the surrounding fluid — the reason jets are such good mixers.',
  minutes: 80,
  sources: [{ doc: 'wilkes', pages: '524–532', note: '§9.14 Turbulent Jets' }],
  concepts: [
    {
      id: 'jet-basics',
      title: 'Free jets: types, governing equations & momentum conservation',
      src: { doc: 'wilkes', pages: '524–526' },
      summary:
        'Jets and wakes are free turbulence; plane (slot) and round (orifice) jets obey boundary-layer-type time-averaged equations at constant pressure, so the momentum flux Ṁ is the same at every x.',
    },
    {
      id: 'plane-jet-similarity',
      title: 'Plane jet: order of magnitude & similarity solution',
      src: { doc: 'wilkes', pages: '526–529' },
      summary:
        'Mixing-length stress + similarity (b ∝ x^p, v̄x ∝ x^−q) + constant Ṁ give p = 1, q = ½; a stream function ψ = γ√x f(βy/x) reduces the problem to f f′ = (f″)², solved numerically (Fig. 9.16).',
    },
    {
      id: 'plane-jet-tanh',
      title: 'Alternative eddy-viscosity model: the tanh solution',
      src: { doc: 'wilkes', pages: '529–530' },
      summary:
        'With ν_T = c b v̄xc (uniform across a section) the plane-jet ODE integrates analytically to f = tanh ζ, i.e. v̄x/v̄xc = 1 − tanh²ζ.',
    },
    {
      id: 'round-jet',
      title: 'The axisymmetric (round) jet',
      src: { doc: 'wilkes', pages: '530–532' },
      summary:
        'For a jet from a circular orifice p = q = 1, so ν_T is constant and an analytical solution exists: v̄z ∝ 1/[z(1 + ζ²/4)²]; centre-line velocity ∝ 1/z, confirmed by Reichardt.',
    },
  ],
  sourceNote: md`**Primary source: Wilkes, Ch. 9 (pp. 524–532)** — §9.14 *Turbulent Jets*. **Fox & McDonald's is cited only as a
  secondary cross-reference**; its course excerpt (§8.4–8.5) deals with internal pipe flow and contains no free-jet material, so no Fox
  page is cited in this topic. There is no lecture deck on turbulence, so — as instructed for this unit — every explanation, equation
  and example is built on Wilkes and uses Wilkes' notation: time-averaged velocities $\overline{v}_x,\ \overline{v}_y$ (plane jet) and
  $\overline{v}_z,\ \overline{v}_r$ (round jet), turbulent shear stress $\overline{\tau}^{\,t}_{yx}$, eddy kinematic viscosity
  $\nu_{\mathrm T}$, mixing length $\ell$ and momentum flux $\dot{\mathcal M}$. (Fox would write $u$, $v$ for the mean velocities.)
  Blocks marked ✦ Supplementary are explanations, derived numbers and examples written for this platform.`,
}

/* ------------------------------------------------------------------------------------------------ */
/*  Formulas                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

const W = (pages: string, note?: string) => ({ doc: 'wilkes' as const, pages, note })

const vX = { sym: md`\overline{v}_x`, desc: 'time-averaged (mean) velocity along the jet axis', units: md`\mathrm{m\,s^{-1}}` }
const vY = { sym: md`\overline{v}_y`, desc: 'time-averaged transverse velocity (positive away from the axis for $y>0$)', units: md`\mathrm{m\,s^{-1}}` }
const xV = { sym: md`x`, desc: 'distance downstream from the slot, along the jet axis', units: md`\mathrm{m}` }
const yV = { sym: md`y`, desc: 'transverse distance from the centre-line', units: md`\mathrm{m}` }
const rhoV = { sym: md`\rho`, desc: 'fluid density (jet and surroundings are the same fluid)', units: md`\mathrm{kg\,m^{-3}}` }
const tauV = { sym: md`\overline{\tau}^{\,t}_{yx}`, desc: 'time-averaged turbulent (Reynolds) shear stress', units: md`\mathrm{Pa}` }
const zetaV = { sym: md`\zeta`, desc: 'dimensionless similarity coordinate', units: md`-` }
const fV = { sym: md`f(\zeta)`, desc: "dimensionless stream-function profile; primes are $d/d\\zeta$", units: md`-` }
const vzV = { sym: md`\overline{v}_z`, desc: 'time-averaged axial velocity of the round jet', units: md`\mathrm{m\,s^{-1}}` }
const vrV = { sym: md`\overline{v}_r`, desc: 'time-averaged radial velocity (positive outward)', units: md`\mathrm{m\,s^{-1}}` }
const zV = { sym: md`z`, desc: 'axial distance from the orifice', units: md`\mathrm{m}` }
const rV = { sym: md`r`, desc: 'radial distance from the jet axis', units: md`\mathrm{m}` }
const nuTV = { sym: md`\nu_{\mathrm T}`, desc: 'eddy kinematic viscosity', units: md`\mathrm{m^2\,s^{-1}}` }
const MdotRound = { sym: md`\dot{\mathcal M}`, desc: 'rate of $z$-momentum transfer of the whole round jet (constant)', units: md`\mathrm{N}` }

export const formulas: FormulaDef[] = [
  /* ---------- jet-basics ---------- */
  {
    id: 'pj-xmom',
    name: 'Plane jet: simplified x-momentum equation',
    key: true,
    tex: md`\overline{v}_x\pd{\overline{v}_x}{x} + \overline{v}_y\pd{\overline{v}_x}{y} = \frac{1}{\rho}\pd{\overline{\tau}^{\,t}_{yx}}{y}`,
    vars: [vX, vY, xV, yV, rhoV, tauV],
    conditions: [
      'plane (2-D) jet from a long slot, incompressible, **steady in the mean** (no time derivative)',
      'boundary-layer (thin-shear-layer) simplification: transverse derivatives $\\partial/\\partial y$ dominate',
      'the **turbulent** shear stress replaces the viscous stress; the surroundings are at **constant pressure**, so there is no $\\partial p/\\partial x$ term',
    ],
    use: md`Left side = convective (inertia) terms; right side = net turbulent shear force per unit mass. Combine with continuity (9.105) and a model for $\overline{\tau}^{\,t}_{yx}$ (mixing length, Eq. 9.107, or eddy viscosity, Eq. 9.116).`,
    src: W('525', 'Eq. (9.104)'),
    tag: '9.104',
  },
  {
    id: 'pj-cont',
    name: 'Plane jet: continuity',
    tex: md`\pd{\overline{v}_x}{x} + \pd{\overline{v}_y}{y} = 0`,
    vars: [vX, vY, xV, yV],
    conditions: ['incompressible, plane flow; holds for the time-averaged velocities'],
    use: md`Fixes the transverse velocity once $\overline{v}_x$ is known; it is satisfied automatically by the stream function of Eq. (9.111).`,
    src: W('525', 'Eq. (9.105)'),
    tag: '9.105',
  },
  {
    id: 'pj-Mdot',
    name: 'Plane jet: momentum flux per unit depth (constant along the jet)',
    key: true,
    tex: md`\dot{\mathcal M} = \rho\int_{-\infty}^{\infty}\overline{v}_x^{\,2}\,dy`,
    vars: [
      { sym: md`\dot{\mathcal M}`, desc: 'rate of $x$-momentum transfer per unit depth of slot', units: md`\mathrm{N\,m^{-1}}` },
      rhoV,
      vX,
      yV,
    ],
    conditions: [
      'constant pressure in the surroundings and **no external force** → $\\dot{\\mathcal M}$ is independent of $x$',
      'holds at every $x$, the slot exit included — so for a uniform exit velocity $U_0$ through a slot of width $h_0$: $\\dot{\\mathcal M}=\\rho U_0^2h_0$ ✦',
    ],
    use: md`This is the jet's "invariant": it sets the jet strength (the constant $\gamma$ or $V$) and links downstream velocities to the exit conditions.`,
    src: W('525', 'Eq. (9.106)'),
    tag: '9.106',
  },

  /* ---------- plane-jet-similarity ---------- */
  {
    id: 'ml-stress',
    name: 'Mixing-length turbulent stress (no wall needed)',
    tex: md`\overline{\tau}^{\,t}_{yx} = \rho\,\nu_{\mathrm T}\pd{\overline{v}_x}{y} = \rho\,\underbrace{\ell^2\left\lvert\pd{\overline{v}_x}{y}\right\rvert}_{\nu_{\mathrm T}}\pd{\overline{v}_x}{y}`,
    vars: [tauV, rhoV, nuTV, { sym: md`\ell`, desc: 'Prandtl mixing length', units: md`\mathrm{m}` }, vX, yV],
    conditions: [
      "Prandtl's mixing-length theory still holds when there is **no wall**",
      'the absolute value keeps the sign of the stress equal to the sign of $\\partial\\overline{v}_x/\\partial y$',
    ],
    use: md`The under-brace identifies the eddy kinematic viscosity $\nu_{\mathrm T} = \ell^2\lvert\partial\overline{v}_x/\partial y\rvert$ — it varies across the jet and is zero on the axis.`,
    src: W('526', 'Eq. (9.107)'),
    tag: '9.107',
  },
  {
    id: 'sim-assume',
    name: 'Similarity assumptions for the plane jet',
    tex: md`\ell = c_1 b,\qquad b = c_2x^{p},\qquad \zeta = c_3\frac{y}{b} = c_4\frac{y}{x^{p}},\qquad \overline{v}_x = \frac{g(\zeta)}{x^{q}}`,
    vars: [
      { sym: md`b`, desc: 'half-width of the turbulent zone', units: md`\mathrm{m}` },
      { sym: md`c_1,\ c_3`, desc: 'dimensionless constants', units: md`-` },
      { sym: md`c_2`, desc: md`constant in $b = c_2x^p$ (dimensionless once $p = 1$)`, units: md`\mathrm{m^{1-p}}` },
      { sym: md`c_4`, desc: md`$c_3/c_2$, makes $\zeta$ dimensionless`, units: md`\mathrm{m^{p-1}}` },
      { sym: md`p,\ q`, desc: 'exponents to be found (spreading, velocity decay)', units: md`-` },
      zetaV,
      { sym: md`g(\zeta)`, desc: 'profile-shape function', units: md`\mathrm{m^{1+q}\,s^{-1}}` },
    ],
    conditions: [
      'mixing length depends only on $x$ and is proportional to $b$',
      'self-similar profiles: one shape $g(\\zeta)$ at every station once $y$ is scaled by $b$',
    ],
    use: md`Insert the power laws into (9.104) and (9.106) and require every term to scale the same way with $x$ (Table 9.2).`,
    src: W('526', 'Eq. (9.108)'),
    tag: '9.108',
  },
  {
    id: 'p-2q',
    name: 'Momentum-flux constraint on the exponents',
    tex: md`p = 2q`,
    vars: [{ sym: md`p,\ q`, desc: 'exponents in $b\\propto x^p$ and $\\overline{v}_x\\propto x^{-q}$', units: md`-` }],
    conditions: ['from (9.106): $\\int\\overline{v}_x^2\\,dy \\sim x^{-2q}\\cdot x^{p}$ must not depend on $x$'],
    use: md`First condition on $p$, $q$; needs a second one (the term balance) to fix both.`,
    src: W('526', 'Eq. (9.109)'),
    tag: '9.109',
  },
  {
    id: 'pq-plane',
    name: 'Plane-jet exponents',
    key: true,
    tex: md`p = 1,\qquad q = \tfrac12`,
    vars: [{ sym: md`p,\ q`, desc: 'spreading and velocity-decay exponents', units: md`-` }],
    conditions: ['inertia terms $\\sim x^{-(1+2q)}$ must balance the stress term $\\sim x^{-(p+2q)}$ → $p=1$; then (9.109) gives $q=\\tfrac12$'],
    use: md`The plane jet **spreads linearly** ($b\propto x$) and its velocities **fall off as $x^{-1/2}$**.`,
    src: W('526', 'Eq. (9.110)'),
    tag: '9.110',
  },
  {
    id: 'pj-psi',
    name: 'Stream function for the plane jet',
    tex: md`\overline{v}_x = \pd{\psi}{y},\qquad \overline{v}_y = -\pd{\psi}{x}`,
    vars: [{ sym: md`\psi`, desc: 'stream function per unit depth', units: md`\mathrm{m^2\,s^{-1}}` }, vX, vY],
    conditions: ['plane, incompressible (time-averaged) flow'],
    use: md`Continuity (9.105) is satisfied automatically; differences in $\psi$ give volume flow per unit depth.`,
    src: W('527', 'Eq. (9.111)'),
    tag: '9.111',
  },
  {
    id: 'pj-forms',
    name: 'Similarity forms (mixing-length plane jet)',
    tex: md`\ell = \alpha x,\qquad \zeta = \frac{\beta y}{x},\qquad \psi = \gamma\sqrt{x}\,f(\zeta)`,
    vars: [
      { sym: md`\alpha`, desc: 'mixing-length constant, $\\ell/x$', units: md`-` },
      { sym: md`\beta`, desc: 'scaling constant in $\\zeta$', units: md`-` },
      { sym: md`\gamma`, desc: 'constant fixed by the **strength of the jet**', units: md`\mathrm{m^{3/2}\,s^{-1}}` },
      zetaV,
      fV,
    ],
    conditions: ['uses $p=1$, $q=\\tfrac12$: $\\psi\\sim\\overline{v}_x b\\sim x^{-1/2}x = x^{1/2}$'],
    use: md`Differentiate $\psi$ with $\partial\zeta/\partial y = \beta/x$ and $\partial\zeta/\partial x = -\zeta/x$ to get the velocities (9.113).`,
    src: W('527', 'Eq. (9.112)'),
    tag: '9.112',
  },
  {
    id: 'pj-vel',
    name: 'Plane-jet velocities from the stream function',
    key: true,
    tex: md`\overline{v}_x = \frac{\beta\gamma f'}{\sqrt{x}},\qquad \overline{v}_y = \frac{\gamma}{\sqrt{x}}\left(\zeta f' - \frac{f}{2}\right)`,
    vars: [vX, vY, { sym: md`\beta,\ \gamma`, desc: 'constants of (9.112)', units: md`-,\ \mathrm{m^{3/2}\,s^{-1}}` }, fV, xV],
    conditions: ["$f' = df/d\\zeta$; similarity region far from the slot"],
    use: md`Fig. 9.16 plots $f' = \overline{v}_x\sqrt{x}/(\beta\gamma)$ and $\zeta f' - f/2 = \overline{v}_y\sqrt{x}/\gamma$ against $\zeta$.`,
    src: W('527', 'Eq. (9.113)'),
    tag: '9.113',
  },
  {
    id: 'pj-ode',
    name: 'Similarity ODE for the plane jet (mixing length)',
    tex: md`\beta = \frac{1}{(2\alpha^2)^{1/3}}:\qquad \left(\frac{df}{d\zeta}\right)^2 + f\,\frac{d^2f}{d\zeta^2} = \frac{d}{d\zeta}\left(\frac{d^2f}{d\zeta^2}\right)^2`,
    vars: [fV, zetaV, { sym: md`\alpha,\ \beta`, desc: 'mixing-length and scaling constants', units: md`-` }],
    conditions: ['obtained by substituting (9.113) into (9.104) with the stress (9.107); $\\beta$ chosen to absorb $\\alpha$'],
    use: md`A nonlinear ODE for one function of one variable — the PDEs have collapsed because of similarity.`,
    src: W('527', 'Eq. (9.114)'),
    tag: '9.114',
  },
  {
    id: 'pj-ode1',
    name: 'Once-integrated plane-jet ODE',
    key: true,
    tex: md`f\,\frac{df}{d\zeta} = \left(\frac{d^2f}{d\zeta^2}\right)^2`,
    vars: [fV, zetaV],
    conditions: [
      'integration constant is **zero**: on the centre-line $\\overline{v}_y = d\\overline{v}_x/dy = 0$, i.e. $f = f\'\' = 0$ at $\\zeta=0$',
      "solved numerically from $\\zeta=0$ with $f=0$, $f'=1$ (an arbitrary choice; $\\gamma$ is then fitted to the jet's strength)",
    ],
    use: md`Integrate as two first-order ODEs, $f' = g$, $g' = -\sqrt{f g}$ (for $\zeta>0$, where $f''<0$) — e.g. with RK4.`,
    src: W('527–528', 'Eq. (9.115)'),
    tag: '9.115',
  },
  {
    id: 'pj-first-int',
    name: 'Exact first integral of (9.115) and the jet edge',
    tex: md`\left(\frac{df}{d\zeta}\right)^{3/2} + f^{3/2} = 1 \quad\Longrightarrow\quad \zeta_e = \frac{4\pi}{3\sqrt3} \approx 2.418`,
    vars: [fV, { sym: md`\zeta_e`, desc: "edge of the turbulent zone, where $f'=0$ and $f=1$", units: md`-` }],
    conditions: ["with $f(0)=0$, $f'(0)=1$; for $\\zeta\\ge0$ ($f$ is odd, $f'$ even)"],
    use: md`Check: differentiating gives $f'' = -\sqrt{f f'}$, i.e. (9.115). The mixing-length jet has a **sharp edge**: $\overline{v}_x = 0$ for $\lvert\zeta\rvert\ge 2.418$, and $f' = \tfrac12$ at $\zeta = 0.955$.`,
  },
  {
    id: 'pj-design',
    name: 'Plane jet in terms of its momentum flux',
    tex: md`\begin{aligned} \frac{\dot{\mathcal M}}{\rho} &= \beta\gamma^2 I,\qquad I = \int_{-\zeta_e}^{\zeta_e}f'^2\,d\zeta = 1.369 \\ \overline{v}_{xc} &= \frac{\beta\gamma}{\sqrt{x}} = \sqrt{\frac{\beta}{I}}\sqrt{\frac{\dot{\mathcal M}}{\rho x}} \approx 2.37\sqrt{\frac{\dot{\mathcal M}}{\rho x}},\qquad Q' = 2\gamma\sqrt{x} \end{aligned}`,
    vars: [
      { sym: md`\overline{v}_{xc}`, desc: 'centre-line velocity', units: md`\mathrm{m\,s^{-1}}` },
      { sym: md`Q'`, desc: 'volume flow rate per unit depth carried by the jet', units: md`\mathrm{m^2\,s^{-1}}` },
      { sym: md`I`, desc: 'momentum integral of the profile (numerical)', units: md`-` },
      { sym: md`\dot{\mathcal M}`, desc: 'momentum flux per unit depth', units: md`\mathrm{N\,m^{-1}}` },
      { sym: md`\beta = 7.67`, desc: "Reichardt's value (Wilkes p. 528)", units: md`-` },
    ],
    conditions: ['mixing-length solution, far from the slot; $Q\' = \\psi(\\infty)-\\psi(-\\infty) = 2\\gamma\\sqrt{x}$ because $f(\\pm\\zeta_e)=\\pm1$'],
    use: md`Given the exit conditions ($\dot{\mathcal M}/\rho = U_0^2h_0$ for a uniform slot jet) find $\gamma$, then everything else. For a slot jet: $\overline{v}_{xc}/U_0 \approx 2.37\sqrt{h_0/x}$ and $Q'/Q'_0 \approx 0.617\sqrt{x/h_0}$.`,
  },

  /* ---------- plane-jet-tanh ---------- */
  {
    id: 'ev-nuT',
    name: 'Simplified eddy viscosity for the plane jet',
    key: true,
    tex: md`\nu_{\mathrm T} = c\,b\,\overline{v}_{xc}`,
    vars: [
      nuTV,
      { sym: md`c`, desc: 'dimensionless constant', units: md`-` },
      { sym: md`b`, desc: 'jet half-width', units: md`\mathrm{m}` },
      { sym: md`\overline{v}_{xc}`, desc: 'centre-line velocity', units: md`\mathrm{m\,s^{-1}}` },
    ],
    conditions: [
      '$\\nu_{\\mathrm T}$ has dimensions $\\mathrm{L^2/T}$ and is the same at all $y$ of one section (varies only with $x$)',
      'physically realistic: grows with the space available for eddies ($b$) and with the general velocity intensity ($\\overline{v}_{xc}$)',
    ],
    use: md`Gives an **analytical**, quicker but slightly less accurate solution than the mixing-length model.`,
    src: W('529', 'Eq. (9.116)'),
    tag: '9.116',
  },
  {
    id: 'ev-forms',
    name: 'Similarity forms for the eddy-viscosity plane jet',
    tex: md`\overline{v}_{xc} = \frac{V}{\sqrt{x}},\qquad \nu_{\mathrm T} = \alpha V\sqrt{x},\qquad \zeta = \frac{\beta y}{x},\qquad \psi = \gamma V\sqrt{x}\,f(\zeta)`,
    vars: [
      { sym: md`V`, desc: 'jet-strength constant', units: md`\mathrm{m^{3/2}\,s^{-1}}` },
      { sym: md`\alpha,\ \beta,\ \gamma`, desc: 'dimensionless constants (new meanings in this model)', units: md`-` },
      nuTV,
      fV,
    ],
    conditions: ['$b\\propto x$ (found before), $\\overline{v}_{xc}\\propto x^{-1/2}$, so $\\nu_{\\mathrm T}\\propto b\\,\\overline{v}_{xc}\\propto x^{1/2}$'],
    use: md`Same structure as (9.112) but $V$ carries the dimensions, so $\alpha,\beta,\gamma$ are pure numbers.`,
    src: W('529', 'Eq. (9.117)'),
    tag: '9.117',
  },
  {
    id: 'ev-vel',
    name: 'Velocities in the eddy-viscosity model',
    tex: md`\overline{v}_x = \frac{\beta\gamma V f'}{\sqrt{x}},\qquad \overline{v}_y = \frac{\gamma V}{\sqrt{x}}\left(\zeta f' - \frac{f}{2}\right)`,
    vars: [vX, vY, { sym: md`V`, desc: 'jet-strength constant', units: md`\mathrm{m^{3/2}\,s^{-1}}` }, fV, xV],
    conditions: ['from $\\psi$ of (9.117) via (9.111)'],
    use: md`Identical in form to (9.113) with $\gamma\to\gamma V$.`,
    src: W('529', 'Eq. (9.118)'),
    tag: '9.118',
  },
  {
    id: 'ev-ode',
    name: 'Momentum balance with uniform eddy viscosity',
    tex: md`\frac{d}{d\zeta}\left(f\,\frac{df}{d\zeta}\right) = -\frac{2\alpha\beta}{\gamma}\,\frac{d^3f}{d\zeta^3}`,
    vars: [fV, zetaV, { sym: md`\alpha,\ \beta,\ \gamma`, desc: 'constants of (9.117)', units: md`-` }],
    conditions: ['(9.104) with $\\overline{\\tau}^{\\,t}_{yx} = \\rho\\nu_{\\mathrm T}\\,\\partial\\overline{v}_x/\\partial y$ and $\\nu_{\\mathrm T}$ uniform across the section'],
    use: md`Unlike (9.114) this is **linear in the highest derivative** and integrates in closed form.`,
    src: W('529', 'Eq. (9.119)'),
    tag: '9.119',
  },
  {
    id: 'ev-ode1',
    name: 'First integration (eddy-viscosity model)',
    tex: md`f\,\frac{df}{d\zeta} = -\frac{2\alpha\beta}{\gamma}\,\frac{d^2f}{d\zeta^2}`,
    vars: [fV, zetaV],
    conditions: ['constant of integration zero by centre-line symmetry: $f = f\'\' = 0$ at $\\zeta = 0$'],
    use: md`Note $f f' = \tfrac12 (f^2)'$ — so it can be integrated once more.`,
    src: W('529–530', 'Eq. (9.120)'),
    tag: '9.120',
  },
  {
    id: 'ev-second',
    name: 'Second integration',
    tex: md`f^2 = -\frac{4\alpha\beta}{\gamma}\,\frac{df}{d\zeta} + c`,
    vars: [fV, { sym: md`c`, desc: 'constant of integration', units: md`-` }],
    conditions: ["$c$ from the centre-line values $f = 0$, $f' = 1$: $c = 4\\alpha\\beta/\\gamma$ ✦"],
    use: md`A first-order Riccati-type ODE; with the next choice of $\beta$ it becomes $f^2 + f' = 1$.`,
    src: W('530', 'Eq. (9.121)'),
    tag: '9.121',
  },
  {
    id: 'ev-beta',
    name: 'Choice of β and the reduced ODE',
    tex: md`\beta = \frac{\gamma}{4\alpha}:\qquad f^2 + \frac{df}{d\zeta} = 1`,
    vars: [fV, { sym: md`\alpha,\ \beta,\ \gamma`, desc: 'constants of (9.117)', units: md`-` }],
    conditions: ['makes the coefficient $4\\alpha\\beta/\\gamma = 1$ (so $c = 1$)'],
    use: md`Separable: $df/(1-f^2) = d\zeta$ → $\operatorname{artanh} f = \zeta$.`,
    src: W('530', 'Eq. (9.122)'),
    tag: '9.122',
  },
  {
    id: 'ev-tanh',
    name: 'Analytical (tanh) solution for the plane jet',
    key: true,
    tex: md`f = \tanh\zeta,\qquad \frac{df}{d\zeta} = 1 - \tanh^2\zeta`,
    vars: [fV, zetaV],
    conditions: ['eddy-viscosity model (9.116); agrees quite well with Fig. 9.16 but **slightly over-predicts the velocities for $\\zeta > 1.5$**'],
    use: md`Axial profile $\overline{v}_x/\overline{v}_{xc} = 1-\tanh^2\zeta = \mathrm{sech}^2\zeta$; transverse $\overline{v}_y\sqrt{x}/(\gamma V) = \zeta\,\mathrm{sech}^2\zeta - \tfrac12\tanh\zeta$.`,
    src: W('530', 'Eq. (9.123)'),
    tag: '9.123',
  },
  {
    id: 'ev-consistency',
    name: 'Fixing the constants of the tanh model',
    tex: md`\beta\gamma = 1 \;\Rightarrow\; \gamma = 2\sqrt{\alpha},\quad \beta = \frac{1}{2\sqrt{\alpha}};\qquad \frac{\overline{v}_x}{\overline{v}_{xc}} = \mathrm{sech}^2\zeta,\qquad \frac{\dot{\mathcal M}}{\rho} = \frac{4}{3}\,\frac{V^2}{\beta}`,
    vars: [
      { sym: md`\alpha,\ \beta,\ \gamma`, desc: 'constants of (9.117)', units: md`-` },
      { sym: md`V`, desc: 'jet-strength constant', units: md`\mathrm{m^{3/2}\,s^{-1}}` },
      { sym: md`\dot{\mathcal M}`, desc: 'momentum flux per unit depth', units: md`\mathrm{N\,m^{-1}}` },
    ],
    conditions: [
      "(9.117) says $\\overline{v}_{xc} = V/\\sqrt{x}$ while (9.118) at $\\zeta=0$ with $f'(0)=1$ gives $\\beta\\gamma V/\\sqrt{x}$ — consistent only if $\\beta\\gamma=1$ (not stated in the book)",
      '$\\int_{-\\infty}^{\\infty}\\mathrm{sech}^4\\zeta\\,d\\zeta = 4/3$',
    ],
    use: md`One experimental number (e.g. $\beta$) then fixes the whole model: $\alpha = 1/(4\beta^2)$ and $\overline{v}_{xc} = \sqrt{3\beta/4}\sqrt{\dot{\mathcal M}/(\rho x)}$ — with $\beta = 7.67$ the coefficient is 2.40, versus 2.37 for the mixing-length solution.`,
  },

  /* ---------- round-jet ---------- */
  {
    id: 'rj-mom',
    name: 'Round jet: simplified z-momentum equation',
    tex: md`\overline{v}_r\pd{\overline{v}_z}{r} + \overline{v}_z\pd{\overline{v}_z}{z} = \frac{1}{\rho r}\pd{\left(r\,\overline{\tau}^{\,t}_{rz}\right)}{r}`,
    vars: [vzV, vrV, zV, rV, rhoV, { sym: md`\overline{\tau}^{\,t}_{rz}`, desc: 'time-averaged turbulent shear stress', units: md`\mathrm{Pa}` }],
    conditions: ['axisymmetric (cylindrical coordinates, no $\\theta$ dependence), steady in the mean, constant pressure, boundary-layer simplification'],
    use: md`Cylindrical counterpart of (9.104): note the $r$ inside the stress derivative.`,
    src: W('530', 'Eq. (9.124)'),
    tag: '9.124',
  },
  {
    id: 'rj-cont',
    name: 'Round jet: continuity',
    tex: md`\frac{1}{r}\pd{\left(r\,\overline{v}_r\right)}{r} + \pd{\overline{v}_z}{z} = 0`,
    vars: [vzV, vrV, zV, rV],
    conditions: ['incompressible, axisymmetric'],
    use: md`Gives $\overline{v}_r$ once $\overline{v}_z$ is known.`,
    src: W('530', 'Eq. (9.125)'),
    tag: '9.125',
  },
  {
    id: 'rj-Mdot',
    name: 'Round jet: momentum flux (constant)',
    key: true,
    tex: md`\dot{\mathcal M} = \rho\int_{0}^{\infty}2\pi r\,\overline{v}_z^{\,2}\,dr`,
    vars: [MdotRound, rhoV, vzV, rV],
    conditions: ['constant pressure, no external force → independent of $z$', 'uniform nozzle exit ✦: $\\dot{\\mathcal M} = \\rho U_0^2\\pi d_0^2/4$'],
    use: md`The single number that characterises a round jet far downstream (it is also the thrust/reaction force of the nozzle ✦).`,
    src: W('531', 'Eq. (9.126)'),
    tag: '9.126',
  },
  {
    id: 'rj-nuT',
    name: 'Round jet: turbulent stress and eddy viscosity',
    tex: md`\overline{\tau}^{\,t}_{rz} = \rho\,\nu_{\mathrm T}\pd{\overline{v}_z}{r},\qquad \nu_{\mathrm T} = c_1\,b\,\overline{v}_{zc}`,
    vars: [
      { sym: md`\overline{\tau}^{\,t}_{rz}`, desc: 'turbulent shear stress', units: md`\mathrm{Pa}` },
      nuTV,
      { sym: md`c_1`, desc: 'constant (not the $c_1$ of 9.108)', units: md`-` },
      { sym: md`b`, desc: 'half-width of the jet', units: md`\mathrm{m}` },
      { sym: md`\overline{v}_{zc}`, desc: 'centre-line velocity', units: md`\mathrm{m\,s^{-1}}` },
    ],
    conditions: ['same kind of eddy-viscosity model as (9.116)'],
    use: md`With $b\propto z$ and $\overline{v}_{zc}\propto 1/z$ (next equations) this $\nu_{\mathrm T}$ turns out to be constant.`,
    src: W('531', 'Eq. (9.127)'),
    tag: '9.127',
  },
  {
    id: 'rj-sim',
    name: 'Round jet: similarity forms',
    tex: md`b = c_2z^{p},\qquad \zeta = c_3\frac{r}{z^{p}},\qquad \overline{v}_z = \frac{g(\zeta)}{z^{q}}`,
    vars: [
      { sym: md`c_2`, desc: md`constant in $b = c_2z^p$`, units: md`\mathrm{m^{1-p}}` },
      { sym: md`c_3`, desc: md`constant that makes $\zeta$ dimensionless`, units: md`\mathrm{m^{p-1}}` },
      { sym: md`p,\ q`, desc: 'spreading and decay exponents', units: md`-` },
      zetaV,
      { sym: md`g(\zeta)`, desc: 'profile-shape function', units: md`\mathrm{m^{1+q}\,s^{-1}}` },
    ],
    conditions: ['self-similar profiles, as in (9.108)'],
    use: md`Find $p$, $q$ by the same arguments as (9.109), (9.110) and Table 9.2.`,
    src: W('531', 'Eq. (9.128)'),
    tag: '9.128',
  },
  {
    id: 'rj-pq',
    name: 'Round-jet exponents',
    key: true,
    tex: md`p = 1,\qquad q = 1`,
    vars: [{ sym: md`p,\ q`, desc: 'exponents in $b\\propto z^p$, $\\overline{v}_z\\propto z^{-q}$', units: md`-` }],
    conditions: ['momentum: $\\int 2\\pi r\\overline{v}_z^2dr \\sim z^{2p-2q}$ constant → $p=q$ ✦', 'term balance: $1+2q = p+2q$ → $p=1$ ✦'],
    use: md`Linear spreading again, but the centre-line velocity decays as $1/z$; hence $\nu_{\mathrm T}\propto b\,\overline{v}_{zc}\propto z^0$ is **constant everywhere**.`,
    src: W('531', 'Eq. (9.129)'),
    tag: '9.129',
  },
  {
    id: 'rj-red-mom',
    name: 'Round jet: reduced momentum equation (constant ν_T)',
    tex: md`\overline{v}_r\pd{\overline{v}_z}{r} + \overline{v}_z\pd{\overline{v}_z}{z} = \nu_{\mathrm T}\,\frac{1}{r}\pd{}{r}\left(r\pd{\overline{v}_z}{r}\right)`,
    vars: [vzV, vrV, zV, rV, nuTV],
    conditions: ['$\\nu_{\\mathrm T}$ constant (result of 9.129)'],
    use: md`Same form as the laminar round-jet equation with $\nu$ replaced by $\nu_{\mathrm T}$ — which is why an analytical solution exists.`,
    src: W('531', 'Eq. (9.130)'),
    tag: '9.130',
  },
  {
    id: 'rj-red-cont',
    name: 'Round jet: continuity (reduced set)',
    tex: md`\frac{1}{r}\pd{\left(r\,\overline{v}_r\right)}{r} + \pd{\overline{v}_z}{z} = 0`,
    vars: [vzV, vrV, zV, rV],
    conditions: ['incompressible, axisymmetric'],
    use: md`Solved together with (9.130).`,
    src: W('531', 'Eq. (9.131)'),
    tag: '9.131',
  },
  {
    id: 'rj-vz',
    name: 'Round jet: axial velocity (analytical solution)',
    key: true,
    tex: md`\overline{v}_z = \frac{3\dot{\mathcal M}}{8\pi\nu_{\mathrm T}\rho z\left(1+\dfrac{\zeta^2}{4}\right)^2}`,
    vars: [vzV, MdotRound, nuTV, rhoV, zV, zetaV],
    conditions: ['constant $\\nu_{\\mathrm T}$; far from the orifice (similarity region); bell-shaped profile'],
    use: md`At $\zeta = 0$: $\overline{v}_{zc} = 3\dot{\mathcal M}/(8\pi\nu_{\mathrm T}\rho z)$ — decays as $1/z$. Profile: $\overline{v}_z/\overline{v}_{zc} = (1+\zeta^2/4)^{-2}$.`,
    src: W('531', 'Eq. (9.132)'),
    tag: '9.132',
  },
  {
    id: 'rj-vr',
    name: 'Round jet: radial velocity',
    tex: md`\overline{v}_r = \frac{1}{4z}\sqrt{\frac{3\dot{\mathcal M}}{\pi\rho}}\left[\frac{\zeta - \dfrac{\zeta^3}{4}}{\left(1+\dfrac{\zeta^2}{4}\right)^2}\right]`,
    vars: [vrV, MdotRound, rhoV, zV, zetaV],
    conditions: ['same solution as (9.132)'],
    use: md`Bracket $>0$ (outflow, spreading) for $\zeta<2$, $=0$ at $\zeta = 2$, $<0$ (inflow, **entrainment**) for $\zeta>2$; far out $\overline{v}_r\to -4\nu_{\mathrm T}/r$ ✦.`,
    src: W('531', 'Eq. (9.133)'),
    tag: '9.133',
  },
  {
    id: 'rj-zeta',
    name: 'Round jet: similarity variable',
    tex: md`\zeta = \frac{1}{4\nu_{\mathrm T}}\sqrt{\frac{3\dot{\mathcal M}}{\pi\rho}}\;\frac{r}{z}`,
    vars: [zetaV, nuTV, MdotRound, rhoV, rV, zV],
    conditions: ['$\\zeta$ depends on $r/z$ only → the jet spreads linearly ($p=1$)'],
    use: md`Compute the constant $\sqrt{3\dot{\mathcal M}/(\pi\rho)}/(4\nu_{\mathrm T})$ once; then $\zeta$ = constant × $r/z$.`,
    src: W('531', 'Eq. (9.134)'),
    tag: '9.134',
  },
  {
    id: 'rj-reichardt',
    name: "Reichardt's eddy-viscosity constant (as printed)",
    tex: md`\frac{\nu_{\mathrm T}\,\rho}{\dot{\mathcal M}} = 0.0161`,
    vars: [nuTV, rhoV, MdotRound],
    conditions: [
      "from Reichardt's experiments on round jets (Wilkes p. 532)",
      '⚠ as printed the group has units $\\mathrm{s\\,m^{-2}}$, not dimensionless; the dimensionally consistent reading is $\\nu_{\\mathrm T}/\\sqrt{\\dot{\\mathcal M}/\\rho} = 0.0161$ ✦',
    ],
    use: md`Use $\nu_{\mathrm T} = 0.0161\sqrt{\dot{\mathcal M}/\rho}$ in calculations (this platform's reading; it gives realistic spreading and decay rates).`,
    src: W('532'),
  },
  {
    id: 'rj-derived',
    name: 'Round jet: centre-line velocity, profile and flow rate',
    tex: md`\overline{v}_{zc} = \frac{3\dot{\mathcal M}}{8\pi\nu_{\mathrm T}\rho z},\qquad \frac{\overline{v}_z}{\overline{v}_{zc}} = \frac{1}{\left(1+\zeta^2/4\right)^2},\qquad Q = \int_0^\infty 2\pi r\,\overline{v}_z\,dr = 8\pi\nu_{\mathrm T}z`,
    vars: [
      { sym: md`\overline{v}_{zc}`, desc: 'centre-line velocity', units: md`\mathrm{m\,s^{-1}}` },
      { sym: md`Q`, desc: 'volume flow rate carried by the jet', units: md`\mathrm{m^3\,s^{-1}}` },
      nuTV,
      zV,
    ],
    conditions: ['from (9.132)–(9.134); $\\int_0^\\infty \\zeta(1+\\zeta^2/4)^{-2}d\\zeta = 2$', 'half-velocity point: $\\zeta_{1/2} = 2\\sqrt{\\sqrt2-1} = 1.287$'],
    use: md`$Q\propto z$: the jet's volume flow grows linearly because of entrainment, while $\dot{\mathcal M}$ stays fixed.`,
  },
  {
    id: 'rj-design',
    name: 'Round jet with Reichardt’s constant',
    tex: md`\nu_{\mathrm T} = 0.0161\sqrt{\dot{\mathcal M}/\rho}\;\Rightarrow\; \zeta \approx 15.2\,\frac{r}{z},\quad \frac{r_{1/2}}{z}\approx 0.085,\quad \frac{\overline{v}_{zc}}{U_0}\approx 6.57\,\frac{d_0}{z},\quad \frac{Q}{Q_0}\approx 0.457\,\frac{z}{d_0}`,
    vars: [
      { sym: md`r_{1/2}`, desc: 'radius where $\\overline{v}_z = \\tfrac12\\overline{v}_{zc}$', units: md`\mathrm{m}` },
      { sym: md`U_0,\ d_0`, desc: 'uniform exit velocity and nozzle diameter', units: md`\mathrm{m\,s^{-1}},\ \mathrm{m}` },
      { sym: md`Q_0`, desc: 'exit volume flow $U_0\\pi d_0^2/4$', units: md`\mathrm{m^3\,s^{-1}}` },
    ],
    conditions: ['far field only ($z \\gg d_0$; the formula gives $\\overline{v}_{zc} > U_0$ for $z < 6.6\\,d_0$, which is meaningless)'],
    use: md`Quick engineering estimates: $\sqrt{3/\pi}/(4\times0.0161) = 15.17$; $\overline{v}_{zc}/U_0 = 3/(16\sqrt{\pi}\,K)\,d_0/z$; $Q/Q_0 = 16\sqrt{\pi}\,K\,z/d_0$ with $K = 0.0161$.`,
  },
]

/* ------------------------------------------------------------------------------------------------ */
/*  Worked examples (all supplementary: §9.14 contains no numerical examples)                       */
/* ------------------------------------------------------------------------------------------------ */

export const examples: ExampleDef[] = [
  {
    id: 'ex-jb-momentum',
    concept: 'jet-basics',
    title: 'Momentum is conserved, flow rate is not',
    difficulty: 2,
    given: md`Water ($\rho = 1000$ kg/m³, $\nu = 1.0\times10^{-6}$ m²/s) leaves a long slot of width $h_0 = 8$ mm with a uniform velocity $U_0 = 3$ m/s into a large tank of still water. At $x = 0.4$ m the measured mean profile fits $\overline{v}_x = \overline{v}_{xc}\exp[-(y/w)^2]$ with $w = 0.045$ m.`,
    find: md`(a) the slot Reynolds number; (b) $\dot{\mathcal M}$ per unit depth; (c) $\overline{v}_{xc}$ at $x = 0.4$ m; (d) the volume flow per unit depth $Q'$ there, compared with the exit value $Q'_0$.`,
    assumptions: md`Constant pressure in the tank, no external force (so Eq. 9.106 applies); uniform exit profile; the Gaussian is just a curve fit to the measured bell.`,
    steps: [
      { title: 'Is the jet turbulent?', md: md`$\Rey_0 = U_0h_0/\nu = (3)(0.008)/(1.0\times10^{-6}) = 24\,000$ — comfortably turbulent.` },
      { title: 'Momentum flux at the exit', md: md`$\dot{\mathcal M} = \rho\int\overline{v}_x^2\,dy = \rho U_0^2h_0 = (1000)(3^2)(0.008) = 72$ N/m.` },
      {
        title: 'Momentum integral of the downstream profile',
        md: md`$\int_{-\infty}^{\infty} e^{-2y^2/w^2}dy = w\sqrt{\pi/2} = (0.045)(1.2533) = 0.05640$ m, so Eq. (9.106) reads

$$
\dot{\mathcal M} = \rho\,\overline{v}_{xc}^{\,2}\,w\sqrt{\pi/2}
$$`,
      },
      {
        title: 'Centre-line velocity',
        md: md`$\overline{v}_{xc} = \sqrt{\dfrac{\dot{\mathcal M}}{\rho\,w\sqrt{\pi/2}}} = \sqrt{\dfrac{72}{(1000)(0.05640)}} = \sqrt{1.2766} = 1.130$ m/s — less than half of $U_0$.`,
      },
      {
        title: 'Volume flow',
        md: md`$Q' = \int\overline{v}_x\,dy = \overline{v}_{xc}\,w\sqrt{\pi} = (1.130)(0.045)(1.7725) = 0.0901$ m²/s, while $Q'_0 = U_0h_0 = 0.024$ m²/s, so $Q'/Q'_0 = 3.75$.`,
      },
    ],
    answer: md`$\Rey_0 = 24\,000$; $\dot{\mathcal M} = 72$ N/m (same at every $x$); $\overline{v}_{xc} = 1.13$ m/s; $Q' = 0.090$ m²/s $\approx 3.75\,Q'_0$.`,
    insight: 'Same momentum, 3.75 times the flow: the extra 2.75 parts are entrained tank water, and the slowing down is the price of sharing the momentum with it.',
  },
  {
    id: 'ex-ps-air',
    concept: 'plane-jet-similarity',
    title: 'Air slot jet from the mixing-length solution',
    difficulty: 3,
    given: md`A slot $h_0 = 5$ mm wide discharges air ($\rho = 1.2$ kg/m³) at a uniform $U_0 = 40$ m/s into still air. Use the mixing-length solution with Reichardt's constants $\beta = 7.67$, $\alpha = 0.0333$, the profile integral $I = \int f'^2d\zeta = 1.369$, $\zeta_e = 2.418$ and $f' = \tfrac12$ at $\zeta = 0.955$.`,
    find: md`At $x = 0.5$ m: $\gamma$, $\overline{v}_{xc}$, the mixing length $\ell$, the half-velocity half-width $y_{1/2}$, the edge $y_e$, $Q'/Q'_0$ and the inflow velocity outside the jet.`,
    steps: [
      { title: 'Momentum flux', md: md`$\dot{\mathcal M}/\rho = U_0^2h_0 = (40^2)(0.005) = 8.0$ m³/s² (so $\dot{\mathcal M} = 9.6$ N/m).` },
      {
        title: 'Express Ṁ through γ',
        md: md`With (9.113) and $dy = (x/\beta)\,d\zeta$:

$$
\frac{\dot{\mathcal M}}{\rho} = \int\overline{v}_x^2dy = \frac{\beta^2\gamma^2}{x}\cdot\frac{x}{\beta}\int f'^2d\zeta = \beta\gamma^2 I
$$

so $\gamma = \sqrt{8.0/(7.67\times1.369)} = \sqrt{0.7619} = 0.873$ m$^{3/2}$/s — note that $x$ dropped out, as it must.`,
      },
      { title: 'Centre-line velocity', md: md`$\overline{v}_{xc} = \beta\gamma/\sqrt{x} = (7.67)(0.873)/\sqrt{0.5} = 9.47$ m/s, i.e. $0.237\,U_0$ (check: $2.37\sqrt{h_0/x} = 2.37\sqrt{0.01} = 0.237$).` },
      { title: 'Mixing length', md: md`$\ell = \alpha x = (0.0333)(0.5) = 0.0167$ m.` },
      { title: 'Widths', md: md`$y_{1/2} = 0.955\,x/\beta = 0.0622$ m; edge $y_e = 2.418\,x/\beta = 0.158$ m (half-angle $\arctan 0.315 \approx 17.5°$).` },
      { title: 'Entrainment', md: md`$Q' = 2\gamma\sqrt{x} = 2(0.873)(0.7071) = 1.234$ m²/s; $Q'_0 = U_0h_0 = 0.200$ m²/s → $Q'/Q'_0 = 6.17$.` },
      { title: 'Inflow outside the jet', md: md`Beyond the edge $f = 1$, $f' = 0$, so $\overline{v}_y = \gamma(0 - \tfrac12)/\sqrt{x} = -0.873/(2\times0.7071) = -0.617$ m/s (towards the axis for $y > 0$).` },
    ],
    answer: md`$\gamma = 0.873$ m$^{3/2}$/s; $\overline{v}_{xc} = 9.47$ m/s; $\ell = 16.7$ mm; $y_{1/2} = 62$ mm; $y_e = 158$ mm; $Q'/Q'_0 = 6.2$; $\overline{v}_y = -0.62$ m/s outside.`,
    insight: 'One exit number (Ṁ/ρ) plus the universal profile gives the whole far field: velocity, width, entrainment.',
  },
  {
    id: 'ex-tanh',
    concept: 'plane-jet-tanh',
    title: 'Velocities and eddy viscosity from the tanh model',
    difficulty: 2,
    given: md`A plane air jet ($\nu = 1.5\times10^{-5}$ m²/s) has centre-line velocity $\overline{v}_{xc} = 2.0$ m/s at $x = 0.6$ m. Use the eddy-viscosity (tanh) model with $\beta = 7.67$ (assumed, the same size as Reichardt's value) and the consistency condition $\beta\gamma = 1$.`,
    find: md`$\alpha$, $\gamma$, $\nu_{\mathrm T}$; $\overline{v}_x$ and $\overline{v}_y$ at $y = 0.05$ m; the half-velocity half-width; and $\overline{v}_y$ far from the axis.`,
    steps: [
      { title: 'Constants', md: md`$\beta = \gamma/(4\alpha)$ and $\beta\gamma = 1$ give $\gamma = 1/\beta = 0.1304$ and $\alpha = 1/(4\beta^2) = 1/(4\times58.83) = 0.00425$.` },
      { title: 'Jet strength', md: md`$V = \overline{v}_{xc}\sqrt{x} = 2.0\sqrt{0.6} = 1.549$ m$^{3/2}$/s.` },
      { title: 'Eddy viscosity', md: md`$\nu_{\mathrm T} = \alpha V\sqrt{x} = \alpha\,\overline{v}_{xc}\,x = (0.00425)(2.0)(0.6) = 5.10\times10^{-3}$ m²/s — about 340 times $\nu$ of air, the same at every $y$ of this section.` },
      { title: 'Similarity coordinate', md: md`$\zeta = \beta y/x = (7.67)(0.05)/0.6 = 0.6392$; $\tanh\zeta = 0.5643$, $\mathrm{sech}^2\zeta = 1 - 0.5643^2 = 0.6815$.` },
      { title: 'Axial velocity', md: md`$\overline{v}_x = \overline{v}_{xc}\,\mathrm{sech}^2\zeta = (2.0)(0.6815) = 1.363$ m/s.` },
      {
        title: 'Transverse velocity',
        md: md`$\overline{v}_y = \dfrac{\gamma V}{\sqrt{x}}\left(\zeta\,\mathrm{sech}^2\zeta - \tfrac12\tanh\zeta\right) = \gamma\,\overline{v}_{xc}(0.4356 - 0.2822) = (0.1304)(2.0)(0.1534) = +0.040$ m/s (outward — still inside the spreading region).`,
      },
      { title: 'Half-width', md: md`$\mathrm{sech}^2\zeta = \tfrac12$ at $\zeta = \operatorname{arccosh}\sqrt2 = 0.8814$, so $y_{1/2} = 0.8814\,x/\beta = 0.0689$ m.` },
      { title: 'Far field', md: md`As $\zeta\to\infty$: $\zeta\,\mathrm{sech}^2\zeta\to0$, $\tanh\zeta\to1$, so $\overline{v}_y\to-\tfrac12\gamma\,\overline{v}_{xc} = -0.130$ m/s (inflow).` },
    ],
    answer: md`$\alpha = 0.00425$, $\gamma = 0.130$, $\nu_{\mathrm T} = 5.1\times10^{-3}$ m²/s; at $y = 5$ cm $\overline{v}_x = 1.36$ m/s, $\overline{v}_y = +0.040$ m/s; $y_{1/2} = 69$ mm; far-field $\overline{v}_y = -0.13$ m/s.`,
    insight: 'The tanh model gives every number in closed form — no numerical integration, no table look-up.',
  },
  {
    id: 'ex-round',
    concept: 'round-jet',
    title: 'Round air jet: decay, spread and entrainment',
    difficulty: 3,
    given: md`Air ($\rho = 1.2$ kg/m³) leaves a nozzle of diameter $d_0 = 10$ mm at a uniform $U_0 = 50$ m/s. Take $\nu_{\mathrm T} = 0.0161\sqrt{\dot{\mathcal M}/\rho}$ (Reichardt's constant, dimensionally consistent reading).`,
    find: md`At $z = 0.5$ m ($= 50\,d_0$): $\dot{\mathcal M}$, $\nu_{\mathrm T}$, $\overline{v}_{zc}$, $\overline{v}_z$ and $\overline{v}_r$ at $r = 30$ mm, $r_{1/2}$ and $Q/Q_0$.`,
    steps: [
      { title: 'Momentum flux', md: md`$\dot{\mathcal M} = \rho U_0^2\pi d_0^2/4 = (1.2)(2500)(7.854\times10^{-5}) = 0.2356$ N; $\dot{\mathcal M}/\rho = 0.1963$ m⁴/s².` },
      { title: 'Eddy viscosity (constant)', md: md`$\nu_{\mathrm T} = 0.0161\sqrt{0.1963} = (0.0161)(0.4431) = 7.13\times10^{-3}$ m²/s.` },
      {
        title: 'Similarity variable (9.134)',
        md: md`$\sqrt{3\dot{\mathcal M}/(\pi\rho)} = \sqrt{3(0.1963)/\pi} = 0.4330$ m²/s, so $\zeta = \dfrac{0.4330}{4(7.13\times10^{-3})}\dfrac{r}{z} = 15.17\,\dfrac{r}{z}$. At $r = 0.03$ m: $\zeta = 15.17(0.03/0.5) = 0.910$.`,
      },
      { title: 'Centre-line velocity (9.132, ζ = 0)', md: md`$\overline{v}_{zc} = \dfrac{3(0.2356)}{8\pi(7.13\times10^{-3})(1.2)(0.5)} = \dfrac{0.7069}{0.1076} = 6.57$ m/s $= 0.131\,U_0$.` },
      { title: 'Axial velocity at r = 30 mm', md: md`$\overline{v}_z = 6.57/(1 + 0.910^2/4)^2 = 6.57/1.207^2 = 4.51$ m/s.` },
      {
        title: 'Radial velocity at r = 30 mm (9.133)',
        md: md`$\overline{v}_r = \dfrac{0.4330}{4(0.5)}\cdot\dfrac{0.910 - 0.910^3/4}{1.207^2} = (0.2165)(0.495) = +0.107$ m/s — outward, since $\zeta < 2$.`,
      },
      { title: 'Half-velocity radius', md: md`$(1+\zeta^2/4)^{-2} = \tfrac12$ → $\zeta_{1/2} = 2\sqrt{\sqrt2 - 1} = 1.287$ → $r_{1/2} = 1.287(0.5)/15.17 = 0.0424$ m.` },
      { title: 'Entrainment', md: md`$Q = 8\pi\nu_{\mathrm T}z = 8\pi(7.13\times10^{-3})(0.5) = 0.0897$ m³/s; $Q_0 = U_0\pi d_0^2/4 = 3.93\times10^{-3}$ m³/s → $Q/Q_0 = 22.8$.` },
    ],
    answer: md`$\dot{\mathcal M} = 0.236$ N; $\nu_{\mathrm T} = 7.1\times10^{-3}$ m²/s; $\overline{v}_{zc} = 6.57$ m/s; at $r = 30$ mm $\overline{v}_z = 4.51$ m/s, $\overline{v}_r = +0.107$ m/s; $r_{1/2} = 42$ mm; $Q/Q_0 = 22.8$.`,
    insight: 'Fifty diameters downstream the round jet carries 23 times its own nozzle flow — entrainment is what makes jets mixers.',
  },
]

/* ------------------------------------------------------------------------------------------------ */
/*  Practice                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

export const practice: PracticeDef[] = [
  /* jet-basics */
  {
    id: 'pr-jb-triangle',
    concept: 'jet-basics',
    difficulty: 2,
    q: md`An air slot jet ($\rho = 1.2$ kg/m³, $h_0 = 6$ mm, uniform $U_0 = 25$ m/s) enters still air. Far downstream the mean profile is roughly triangular: $\overline{v}_x = \overline{v}_{xc}(1 - \lvert y\rvert/w)$ for $\lvert y\rvert < w$, zero outside, with $w = 0.12$ m. Find (a) $\dot{\mathcal M}$ per unit depth, (b) $\overline{v}_{xc}$, (c) $Q'/Q'_0$.`,
    hint: md`$\int_{-w}^{w}(1-\lvert y\rvert/w)^2dy = 2w/3$ and $\int_{-w}^{w}(1-\lvert y\rvert/w)\,dy = w$.`,
    answer: md`$\dot{\mathcal M} = 4.5$ N/m; $\overline{v}_{xc} = 6.85$ m/s; $Q'/Q'_0 = 5.48$.`,
    solution: md`(a) $\dot{\mathcal M} = \rho U_0^2h_0 = (1.2)(625)(0.006) = 4.5$ N/m.

(b) Eq. (9.106): $\dot{\mathcal M} = \rho\,\overline{v}_{xc}^{\,2}(2w/3)$, so $\overline{v}_{xc} = \sqrt{3\dot{\mathcal M}/(2\rho w)} = \sqrt{13.5/0.288} = \sqrt{46.875} = 6.85$ m/s.

(c) $Q' = \overline{v}_{xc}\,w = (6.847)(0.12) = 0.822$ m²/s; $Q'_0 = U_0h_0 = 0.150$ m²/s; ratio $= 5.48$. The jet has entrained 4.5 times its own exit flow.`,
    check: [
      { label: 'centre-line velocity', value: 6.85, units: 'm/s' },
      { label: "Q'/Q'₀", value: 5.48 },
    ],
  },
  {
    id: 'pr-jb-energy',
    concept: 'jet-basics',
    difficulty: 2,
    q: md`For a plane jet, $b\propto x$ and $\overline{v}_x\propto x^{-1/2}$ (results of the next concept). Between $x = 0.2$ m and $x = 0.8$ m, by what factor do (a) the momentum flux, (b) the volume flow per unit depth and (c) the kinetic-energy flux $\int\tfrac12\rho\overline{v}_x^3dy$ change? Where does the "lost" kinetic energy go?`,
    hint: md`Each integral $\int\overline{v}_x^n\,dy$ scales like (velocity)$^n\times$(width).`,
    answer: md`(a) ×1; (b) ×2; (c) ×0.5 — dissipated by the turbulence.`,
    solution: md`With $\overline{v}_x\sim x^{-1/2}$ and $dy\sim b\sim x$:

- momentum $\int\overline{v}_x^2dy\sim x^{-1}x = x^0$ → unchanged (Eq. 9.106);
- volume flow $\int\overline{v}_x\,dy\sim x^{-1/2}x = x^{1/2}$ → factor $\sqrt{0.8/0.2} = 2$;
- kinetic-energy flux $\int\overline{v}_x^3dy\sim x^{-3/2}x = x^{-1/2}$ → factor $1/2$.

Mixing slow ambient fluid into a fast stream is an inelastic process: momentum is conserved but mean-flow kinetic energy is converted into turbulence and finally into heat (viscous dissipation of the eddies).`,
    check: [{ label: 'flow-rate factor', value: 2 }],
  },
  {
    id: 'pr-jb-thrust',
    concept: 'jet-basics',
    difficulty: 1,
    q: md`Water ($\rho = 1000$ kg/m³) leaves a round nozzle of diameter 8 mm at a uniform 4 m/s. What is the jet's momentum flux $\dot{\mathcal M}$, and what is it 1 m downstream?`,
    answer: md`$\dot{\mathcal M} = 0.804$ N at the nozzle and at every downstream station.`,
    solution: md`$\dot{\mathcal M} = \rho U_0^2\pi d_0^2/4 = (1000)(16)\pi(0.008)^2/4 = 0.804$ N. Because the surrounding water is at constant pressure and no external force acts on the jet, the momentum flux is the same 0.804 N at $z = 1$ m (Eq. 9.126) — even though the velocities there are far smaller and much more fluid is moving.`,
    check: [{ label: 'Ṁ', value: 0.804, units: 'N' }],
  },
  /* plane-jet-similarity */
  {
    id: 'pr-ps-alpha',
    concept: 'plane-jet-similarity',
    difficulty: 1,
    q: md`Reichardt's data give $\beta = 7.67$ for the mixing-length plane jet. Using $\beta = (2\alpha^2)^{-1/3}$, recover $\alpha$ and find the mixing length at $x = 0.6$ m.`,
    answer: md`$\alpha = 0.0333$; $\ell = 0.0200$ m.`,
    solution: md`$\beta^3 = 1/(2\alpha^2)$ → $\alpha = (2\beta^3)^{-1/2} = (2\times451.2)^{-1/2} = 0.0333$, the value quoted by Wilkes. Then $\ell = \alpha x = 0.0333\times0.6 = 0.0200$ m: the eddies that carry momentum across the jet are about 2 cm across at this station and grow linearly with $x$.`,
    check: [
      { label: 'α', value: 0.0333 },
      { label: 'ℓ', value: 0.02, units: 'm' },
    ],
  },
  {
    id: 'pr-ps-velocity',
    concept: 'plane-jet-similarity',
    difficulty: 2,
    q: md`A plane jet has $\gamma = 0.5$ m$^{3/2}$/s and $\beta = 7.67$. At $x = 0.4$ m find $\overline{v}_{xc}$, the position $y$ where $\zeta = 0.6$, and $\overline{v}_x$, $\overline{v}_y$ there. (From Fig. 9.16/the numerical solution: at $\zeta = 0.6$, $f' = 0.722$ and $\zeta f' - f/2 = 0.168$.) What is $\overline{v}_y$ outside the jet edge?`,
    answer: md`$\overline{v}_{xc} = 6.06$ m/s; $y = 31.3$ mm; $\overline{v}_x = 4.38$ m/s; $\overline{v}_y = +0.133$ m/s; outside $\overline{v}_y = -0.395$ m/s.`,
    solution: md`$\sqrt{x} = 0.6325$. Eq. (9.113): $\overline{v}_{xc} = \beta\gamma/\sqrt{x} = (7.67)(0.5)/0.6325 = 6.06$ m/s.

$y = \zeta x/\beta = (0.6)(0.4)/7.67 = 0.0313$ m.

$\overline{v}_x = 6.06\times0.722 = 4.38$ m/s; $\overline{v}_y = (\gamma/\sqrt{x})(0.168) = 0.7906\times0.168 = +0.133$ m/s (outward: spreading).

Outside the edge $f = 1$, $f' = 0$: $\overline{v}_y = -\gamma/(2\sqrt{x}) = -0.395$ m/s (inward: entrainment).`,
    check: [
      { label: 'v̄xc', value: 6.06, units: 'm/s' },
      { label: 'v̄y at ζ = 0.6', value: 0.133, units: 'm/s' },
    ],
  },
  {
    id: 'pr-ps-scaling',
    concept: 'plane-jet-similarity',
    difficulty: 2,
    q: md`The centre-line velocity of a plane jet is 9 m/s at $x = 0.1$ m. At what distance has it fallen to 3 m/s? By what factors have the width and the volume flow per unit depth grown by then?`,
    answer: md`$x = 0.9$ m; width ×9; flow ×3.`,
    solution: md`$\overline{v}_{xc}\propto x^{-1/2}$ → $x_2 = x_1(\overline{v}_1/\overline{v}_2)^2 = 0.1\times(9/3)^2 = 0.9$ m. Width $b\propto x$: factor 9. Flow $Q'\propto x^{1/2}$: factor 3. Check momentum: $\overline{v}^2b$ changes by $(1/9)(9) = 1$ ✓.`,
    check: [{ label: 'x', value: 0.9, units: 'm' }],
  },
  {
    id: 'pr-ps-nospread',
    concept: 'plane-jet-similarity',
    difficulty: 3,
    q: md`A student assumes the plane jet does **not** spread ($p = 0$). Use the orders of Table 9.2 and Eq. (9.109) to show that no similarity solution of this kind exists. What would a non-spreading jet require physically?`,
    answer: md`$p = 0$ forces $q = 0$ (momentum); then inertia $\sim x^{-1}$ but stress $\sim x^{0}$ — they cannot balance.`,
    solution: md`(9.109): $p = 2q$ → $q = 0$, i.e. velocities independent of $x$. Table 9.2: inertia terms $\sim x^{-(1+2q)} = x^{-1}$; stress term $\sim x^{-(p+2q)} = x^{0}$. The momentum equation (9.104) would demand $x^{-1}\sim x^0$ for all $x$ — impossible, so the assumption is inconsistent. Physically, a non-spreading jet would need zero turbulent stress (no momentum exchange with the surroundings) — a turbulent jet always shares its momentum with neighbouring fluid and therefore must widen; the consistent balance $1+2q = p+2q$ gives $p = 1$.`,
  },
  /* plane-jet-tanh */
  {
    id: 'pr-tanh-half',
    concept: 'plane-jet-tanh',
    difficulty: 1,
    q: md`For the tanh solution find the value of $\zeta$ at which $\overline{v}_x = \tfrac12\overline{v}_{xc}$. With $\beta = 7.67$, how far from the axis is this point at $x = 0.5$ m?`,
    answer: md`$\zeta = 0.881$; $y = 57.5$ mm.`,
    solution: md`$1 - \tanh^2\zeta = \mathrm{sech}^2\zeta = \tfrac12$ → $\cosh\zeta = \sqrt2$ → $\zeta = \operatorname{arccosh}\sqrt2 = \ln(\sqrt2 + 1) = 0.8814$. Then $y = \zeta x/\beta = 0.8814\times0.5/7.67 = 0.0575$ m.`,
    check: [
      { label: 'ζ', value: 0.8814 },
      { label: 'y', value: 0.0575, units: 'm' },
    ],
  },
  {
    id: 'pr-tanh-sign',
    concept: 'plane-jet-tanh',
    difficulty: 3,
    q: md`In the tanh model the transverse velocity is proportional to $\zeta\,\mathrm{sech}^2\zeta - \tfrac12\tanh\zeta$. (a) Show that it changes sign where $\sinh 2\zeta = 4\zeta$ and find that $\zeta$. (b) What value does the bracket approach far from the axis, and what does it mean?`,
    hint: md`Multiply through by $\cosh^2\zeta$ and use $2\sinh\zeta\cosh\zeta = \sinh2\zeta$.`,
    answer: md`(a) $\zeta = 1.089$; (b) $-\tfrac12$: a finite inflow — entrainment.`,
    solution: md`(a) $\zeta\,\mathrm{sech}^2\zeta = \tfrac12\tanh\zeta$ → $\zeta = \tfrac12\sinh\zeta\cosh\zeta = \tfrac14\sinh2\zeta$, i.e. $\sinh2\zeta = 4\zeta$. Bisection: $\zeta = 1.0887$ ($\sinh 2.1773 = 4.355 = 4\times1.0887$ ✓). Compare the mixing-length solution: about 1.2 (book: "approximately 1.25").

(b) As $\zeta\to\infty$, $\zeta\,\mathrm{sech}^2\zeta\to0$ and $\tanh\zeta\to1$, so the bracket → $-\tfrac12$: even where $\overline{v}_x\approx0$, fluid keeps flowing *towards* the jet with $\overline{v}_y = -\gamma V/(2\sqrt{x})$ — the entrainment that feeds the growing flow rate.`,
    check: [{ label: 'ζ at sign change', value: 1.089 }],
  },
  {
    id: 'pr-tanh-nuT',
    concept: 'plane-jet-tanh',
    difficulty: 2,
    q: md`In the eddy-viscosity plane jet, $\nu_{\mathrm T} = 2.0\times10^{-3}$ m²/s at $x = 0.25$ m. What is $\nu_{\mathrm T}$ at $x = 1.0$ m? Show that the ratio $\nu_{\mathrm T}/(b\,\overline{v}_{xc})$ is the same at both stations.`,
    answer: md`$4.0\times10^{-3}$ m²/s; the ratio is the constant $c$ of Eq. (9.116).`,
    solution: md`(9.117): $\nu_{\mathrm T} = \alpha V\sqrt{x}\propto x^{1/2}$ → $\nu_{\mathrm T}(1.0) = 2.0\times10^{-3}\sqrt{1.0/0.25} = 4.0\times10^{-3}$ m²/s. Since $b\propto x$ and $\overline{v}_{xc}\propto x^{-1/2}$, $b\,\overline{v}_{xc}\propto x^{1/2}$ grows by the same factor 2, so $\nu_{\mathrm T}/(b\,\overline{v}_{xc}) = c$ is unchanged — exactly the assumption (9.116).`,
    check: [{ label: 'ν_T at 1 m', value: 0.004, units: 'm²/s' }],
  },
  /* round-jet */
  {
    id: 'pr-rj-decay',
    concept: 'round-jet',
    difficulty: 1,
    q: md`A round jet has $\overline{v}_{zc} = 8$ m/s at $z = 0.3$ m. Estimate $\overline{v}_{zc}$ at $z = 1.2$ m. What would a plane jet with the same 8 m/s at 0.3 m give at 1.2 m?`,
    answer: md`Round: 2 m/s; plane: 4 m/s.`,
    solution: md`Round jet (9.129, 9.132): $\overline{v}_{zc}\propto1/z$ → $8\times0.3/1.2 = 2.0$ m/s. Plane jet (9.110): $\overline{v}_{xc}\propto x^{-1/2}$ → $8\sqrt{0.3/1.2} = 4.0$ m/s. The round jet decays faster because its momentum is spread over a cross-sectional *area* $\propto z^2$, not a width $\propto x$.`,
    check: [{ label: 'round-jet v̄zc', value: 2, units: 'm/s' }],
  },
  {
    id: 'pr-rj-half',
    concept: 'round-jet',
    difficulty: 2,
    q: md`For the round jet, find (a) the value of $\zeta$ where $\overline{v}_z = \tfrac12\overline{v}_{zc}$, (b) the half-velocity radius at $z = 0.8$ m using $\zeta = 15.17\,r/z$, and (c) the radius at which the radial velocity reverses at that station.`,
    answer: md`(a) $\zeta_{1/2} = 1.287$; (b) $r_{1/2} = 67.9$ mm; (c) $r = 105$ mm ($\zeta = 2$).`,
    solution: md`(a) $(1+\zeta^2/4)^2 = 2$ → $\zeta^2/4 = \sqrt2 - 1$ → $\zeta = 2\sqrt{0.4142} = 1.287$.

(b) $r_{1/2} = 1.287\times0.8/15.17 = 0.0679$ m.

(c) The bracket of (9.133) vanishes when $\zeta - \zeta^3/4 = 0$, i.e. $\zeta = 2$: $r = 2\times0.8/15.17 = 0.105$ m. Inside this radius fluid moves outward (spreading), outside it moves inward (entrainment).`,
    check: [
      { label: 'ζ½', value: 1.287 },
      { label: 'r½', value: 0.0679, units: 'm' },
    ],
  },
  {
    id: 'pr-rj-entrain',
    concept: 'round-jet',
    difficulty: 3,
    q: md`A water jet ($\rho = 1000$ kg/m³) leaves a 5 mm nozzle at 2 m/s. Using $\nu_{\mathrm T} = 0.0161\sqrt{\dot{\mathcal M}/\rho}$, find $\nu_{\mathrm T}$ and the volume flow carried by the jet at $z = 0.3$ m. How many times the nozzle flow is that?`,
    answer: md`$\nu_{\mathrm T} = 1.43\times10^{-4}$ m²/s; $Q = 1.08\times10^{-3}$ m³/s (1.08 L/s) $= 27.4\,Q_0$.`,
    solution: md`$\dot{\mathcal M}/\rho = U_0^2\pi d_0^2/4 = 4\times1.963\times10^{-5} = 7.854\times10^{-5}$ m⁴/s², $\sqrt{\ } = 8.862\times10^{-3}$ m²/s → $\nu_{\mathrm T} = 0.0161\times8.862\times10^{-3} = 1.427\times10^{-4}$ m²/s (≈ 143 times $\nu$ of water).

$Q = 8\pi\nu_{\mathrm T}z = 8\pi(1.427\times10^{-4})(0.3) = 1.076\times10^{-3}$ m³/s. $Q_0 = U_0\pi d_0^2/4 = 3.927\times10^{-5}$ m³/s → $Q/Q_0 = 27.4$ (check: $0.457\times z/d_0 = 0.457\times60 = 27.4$ ✓).`,
    check: [
      { label: 'Q', value: 0.001076, units: 'm³/s' },
      { label: 'Q/Q₀', value: 27.4 },
    ],
  },
]

/* ------------------------------------------------------------------------------------------------ */
/*  Quiz                                                                                            */
/* ------------------------------------------------------------------------------------------------ */

export const quiz: QuizQ[] = [
  {
    id: 'q-jb-mdot',
    concept: 'jet-basics',
    difficulty: 1,
    q: 'Why is the momentum flux Ṁ the same at every downstream station of a free jet?',
    options: [
      'The surrounding pressure is constant and no external force acts on the jet',
      'The mass flow rate of the jet is constant along its length',
      'The turbulent shear stress is zero in a free jet',
      'The centre-line velocity is constant along the jet',
    ],
    answer: 0,
    explain:
      'With no pressure gradient and no external force, nothing can change the x-momentum of the jet as a whole (Wilkes p. 525). The mass flow is *not* constant — it grows by entrainment — and the turbulent stress is what shares momentum with the surroundings, it is not zero.',
    src: W('525'),
  },
  {
    id: 'q-jb-flow',
    concept: 'jet-basics',
    difficulty: 1,
    q: 'Moving downstream in a turbulent jet, the volume flow rate carried by the jet…',
    options: ['increases, because surrounding fluid is entrained', 'stays constant, by continuity', 'decreases, because the jet slows down'],
    answer: 0,
    explain:
      'Fig. 9.15 shows fluid entrained by the jet from both sides; the flow grows as x^½ (plane) or z (round). Continuity holds locally, but the jet keeps drawing in new fluid across its edges, so its own flow rate is not fixed; the velocity drops, but the width grows faster.',
    src: W('525', 'Fig. 9.15'),
  },
  {
    id: 'q-jb-mods',
    concept: 'jet-basics',
    difficulty: 2,
    q: 'Starting from the laminar boundary-layer simplifications of Section 8.3, what changes does Wilkes make for a turbulent jet?',
    options: [
      'Use time-averaged velocities, replace the viscous stress by the turbulent stress, and take the pressure as constant',
      'Keep the viscous stress but add a streamwise pressure-gradient term',
      'Drop the convective terms because the jet is free',
      'Include the time derivative because turbulence is unsteady',
    ],
    answer: 0,
    explain:
      'p. 524: the same order-of-magnitude arguments apply with time-averaged velocities, a turbulent stress instead of the viscous one, and essentially constant pressure. The flow is "steady in the mean", so no time derivative appears; the convective terms are kept — they are the inertia side of (9.104).',
    src: W('524–525'),
  },
  {
    id: 'q-ps-pq',
    concept: 'plane-jet-similarity',
    difficulty: 1,
    q: 'For the plane turbulent jet, b ∝ x^p and v̄x ∝ x^−q with…',
    options: ['p = 1, q = ½', 'p = ½, q = 1', 'p = 1, q = 1', 'p = 2, q = 1'],
    answer: 0,
    explain:
      'Constant Ṁ gives p = 2q (9.109); balancing inertia x^−(1+2q) against stress x^−(p+2q) gives p = 1, so q = ½ (9.110). p = q = 1 is the round jet, where the momentum integral scales as z^(2p−2q).',
    src: W('526', 'Eqs. (9.109)–(9.110)'),
  },
  {
    id: 'q-ps-transverse',
    concept: 'plane-jet-similarity',
    difficulty: 2,
    q: 'In Fig. 9.16, what does the transverse velocity do for ζ greater than about 1.25?',
    options: [
      'It is negative and levels off at a significant non-zero value — fluid is being entrained',
      'It is zero, because the axial velocity is essentially zero there',
      'It is positive — the jet is pushing outward as it spreads',
      'It oscillates in sign because of turbulent eddies',
    ],
    answer: 0,
    explain:
      'Wilkes p. 529: for ζ > 1.25, v̄y < 0 and tends to a non-zero negative value even though v̄x ≈ 0 — entrainment. Positive v̄y (outward) occurs only for 0 < ζ < 1.25, the spreading region.',
    src: W('529', 'Fig. 9.16'),
  },
  {
    id: 'q-ps-fprime',
    concept: 'plane-jet-similarity',
    difficulty: 2,
    q: "The numerical solution of (9.115) starts with f′(0) = 1. Why is that legitimate?",
    options: [
      'The choice is arbitrary: γ is afterwards chosen to match the strength (flow rate) of the actual jet',
      'Because the centre-line velocity of every jet is 1 m/s',
      'Because (9.115) is linear, so any solution can be scaled',
      'Because symmetry requires f′ = 1 on the axis',
    ],
    answer: 0,
    explain:
      'p. 528: f′(0) = 1 is an arbitrary choice; γ in ψ = γ√x f(ζ) is then chosen to match the actual jet. (9.115) is not linear — it is homogeneous of degree 2 (if f solves it, so does A·f, and A merges into γ), which is why any starting slope would do. Symmetry only requires f = f″ = 0 on the axis, not f′ = 1.',
    src: W('528'),
  },
  {
    id: 'q-tanh-nuT',
    concept: 'plane-jet-tanh',
    difficulty: 2,
    q: 'How does the eddy viscosity ν_T = c b v̄xc of Eq. (9.116) vary across one section of the jet?',
    options: [
      'It is uniform across the section and changes only with x',
      'It is zero on the axis and largest near the edge',
      'It is proportional to the local |∂v̄x/∂y|',
      'It equals the molecular viscosity outside the jet and grows inside',
    ],
    answer: 0,
    explain:
      'b and v̄xc depend only on x, so ν_T is one number per section (∝ √x). The mixing-length ν_T = ℓ²|∂v̄x/∂y| is the one that vanishes on the axis — that is exactly what the simplified model gives up.',
    src: W('529', 'Eq. (9.116)'),
  },
  {
    id: 'q-tanh-compare',
    concept: 'plane-jet-tanh',
    difficulty: 2,
    q: 'How does Wilkes rate the analytical solution f = tanh ζ against the numerical mixing-length solution of Fig. 9.16?',
    options: [
      'Quite good agreement, but it slightly over-predicts the velocities for ζ > 1.5',
      'Identical at every ζ, because both models give a bell-shaped profile',
      'Much poorer near the axis, where it under-predicts by about half',
      'Better at large ζ, because the tanh profile has a sharp edge',
    ],
    answer: 0,
    explain:
      'p. 530: "agrees quite well … except that it slightly over-predicts the velocities for ζ > 1.5". The tanh profile has no sharp edge — sech²ζ only tends to zero — which is why it is too large in the outer region; it is the mixing-length solution that ends at ζ ≈ 2.42.',
    src: W('530'),
  },
  {
    id: 'q-tanh-scaling',
    concept: 'plane-jet-tanh',
    difficulty: 3,
    q: 'In the eddy-viscosity plane jet, ν_T grows with distance as…',
    options: ['x^½', 'x⁰ (constant)', 'x¹', 'x^−½'],
    answer: 0,
    explain:
      'ν_T = c b v̄xc with b ∝ x and v̄xc ∝ x^−½ gives ν_T ∝ x^½, as written in (9.117): ν_T = αV√x. The constant ν_T belongs to the round jet, where v̄zc ∝ 1/z.',
    src: W('529', 'Eq. (9.117)'),
  },
  {
    id: 'q-rj-decay',
    concept: 'round-jet',
    difficulty: 1,
    q: 'The centre-line velocity of a round turbulent jet decays as…',
    options: ['1/z', 'z^−½', '1/z²', 'exp(−z/d₀)'],
    answer: 0,
    explain: 'q = 1 (Eq. 9.129) and (9.132) at ζ = 0 gives v̄zc = 3Ṁ/(8πν_T ρ z) ∝ 1/z. z^−½ is the plane-jet law.',
    src: W('531', 'Eqs. (9.129), (9.132)'),
  },
  {
    id: 'q-rj-nuT',
    concept: 'round-jet',
    difficulty: 2,
    q: 'Why is the eddy kinematic viscosity constant everywhere in the round jet?',
    options: [
      'Because b ∝ z while v̄zc ∝ 1/z, so ν_T = c₁ b v̄zc does not change',
      'Because turbulence in a free jet is homogeneous and isotropic',
      'Because ν_T is set equal to the molecular viscosity of the fluid',
      'Because the mixing length is constant in a round jet',
    ],
    answer: 0,
    explain:
      'With p = q = 1 (9.129), the product b v̄zc ∝ z·z⁻¹ is constant (Wilkes p. 531). The turbulence is not homogeneous, ν_T is hundreds of times ν, and the mixing length (∝ b) grows with z.',
    src: W('531'),
  },
  {
    id: 'q-rj-reichardt',
    concept: 'round-jet',
    difficulty: 3,
    q: 'True or false: the group ν_T ρ/Ṁ = 0.0161, as printed on Wilkes p. 532, is dimensionless.',
    options: ['True', 'False'],
    answer: 1,
    explain:
      'For a round jet Ṁ is a force (N), so ν_T ρ/Ṁ has units (m²/s)(kg/m³)/(kg m/s²) = s/m². The dimensionless group consistent with (9.134) is ν_T/√(Ṁ/ρ); reading the constant that way gives realistic results (r½ ≈ 0.085 z).',
    src: W('532'),
  },
  {
    id: 'q-rj-radial',
    concept: 'round-jet',
    difficulty: 2,
    q: 'According to (9.133), the radial velocity of the round jet for ζ > 2 is…',
    options: ['negative (inward) — entrainment of surrounding fluid', 'positive (outward) — the jet spreading', 'zero, because the jet has a sharp edge at ζ = 2'],
    answer: 0,
    explain:
      'The bracket (ζ − ζ³/4)/(1 + ζ²/4)² changes sign at ζ = 2 and is negative beyond it: fluid is drawn in. Outward flow happens only for ζ < 2; the profile (9.132) has no sharp edge, it just decays.',
    src: W('531', 'Eq. (9.133)'),
  },
]

/* ------------------------------------------------------------------------------------------------ */
/*  Flashcards                                                                                      */
/* ------------------------------------------------------------------------------------------------ */

export const flashcards: Flashcard[] = [
  { id: 'fc-free', front: 'What is "free turbulence"? Give the two classic examples.', back: 'Turbulence essentially unaffected by confining walls: the **turbulent jet** (fluid issuing from a narrow constriction) and the **turbulent wake** (behind a bluff body).', src: W('524') },
  { id: 'fc-why', front: 'Why do chemical engineers care about turbulent jets?', back: 'They control how fast two reactants — the jet fluid and its surroundings — mix and interact; entrainment sets the mixing rate.', src: W('524') },
  { id: 'fc-mdot', front: md`What stays constant along a free jet, and why?`, back: md`The momentum flux $\dot{\mathcal M} = \rho\int\overline{v}_x^2dy$ (plane, per unit depth) or $\rho\int2\pi r\overline{v}_z^2dr$ (round): constant pressure and no external force.`, src: W('525, 531', 'Eqs. (9.106), (9.126)') },
  { id: 'fc-pq', front: 'Plane jet vs round jet: spreading and decay laws?', back: md`Plane: $b\propto x$, $\overline{v}\propto x^{-1/2}$, $Q'\propto x^{1/2}$. Round: $b\propto z$, $\overline{v}\propto 1/z$, $Q\propto z$, $\nu_{\mathrm T}$ = constant.`, src: W('526, 531', 'Eqs. (9.110), (9.129)') },
  { id: 'fc-ode', front: 'The plane-jet similarity ODE (mixing length) and its starting values?', back: md`$f f' = (f'')^2$ (9.115), integrated from $\zeta = 0$ with $f = 0$, $f' = 1$; $\zeta = \beta y/x$, $\psi = \gamma\sqrt{x}f$.`, src: W('527–528') },
  { id: 'fc-constants', front: "Reichardt's constants for the plane jet (mixing length)?", back: md`$\beta = 7.67$, corresponding to $\alpha = \ell/x = 0.0333$ via $\beta = (2\alpha^2)^{-1/3}$.`, src: W('528') },
  { id: 'fc-entrain', front: 'Where in Fig. 9.16 is the jet spreading and where is it entraining?', back: md`$\overline{v}_y > 0$ for $0 < \zeta \lesssim 1.25$: spreading. $\overline{v}_y < 0$ for $\zeta > 1.25$, levelling off at a non-zero value: entrainment.`, src: W('529') },
  { id: 'fc-nuT-model', front: 'Simplified eddy-viscosity model for the plane jet — formula and justification?', back: md`$\nu_{\mathrm T} = c\,b\,\overline{v}_{xc}$ (9.116): grows with the room for eddies ($b$) and the velocity intensity ($\overline{v}_{xc}$); uniform across a section.`, src: W('529') },
  { id: 'fc-tanh', front: 'Analytical plane-jet profile from the eddy-viscosity model?', back: md`$f = \tanh\zeta$, $f' = 1 - \tanh^2\zeta$, i.e. $\overline{v}_x/\overline{v}_{xc} = \mathrm{sech}^2\zeta$; slightly too high for $\zeta > 1.5$.`, src: W('530', 'Eq. (9.123)') },
  { id: 'fc-round-vz', front: 'Round-jet axial velocity profile?', back: md`$\overline{v}_z = \dfrac{3\dot{\mathcal M}}{8\pi\nu_{\mathrm T}\rho z(1+\zeta^2/4)^2}$, $\zeta = \dfrac{1}{4\nu_{\mathrm T}}\sqrt{\dfrac{3\dot{\mathcal M}}{\pi\rho}}\dfrac{r}{z}$.`, src: W('531', 'Eqs. (9.132), (9.134)') },
  { id: 'fc-reichardt', front: 'What did Reichardt find for the round jet?', back: md`The profile (9.132) is well supported (mixing length is somewhat better at large $\zeta$), and $\nu_{\mathrm T}\rho/\dot{\mathcal M} = 0.0161$ as printed — read as $\nu_{\mathrm T} = 0.0161\sqrt{\dot{\mathcal M}/\rho}$.`, src: W('532') },
  { id: 'fc-radial-zero', front: md`Where does the round jet's radial velocity change sign?`, back: md`At $\zeta = 2$ (bracket of 9.133 zero): outward inside, inward (entrainment) outside; far away $\overline{v}_r \to -4\nu_{\mathrm T}/r$.` },
]

/* ------------------------------------------------------------------------------------------------ */
/*  Topic takeaways                                                                                 */
/* ------------------------------------------------------------------------------------------------ */

export const takeaways: string[] = [
  md`Jets and wakes are **free turbulence**; jets matter to chemical engineers because they set how fast a jet fluid mixes with (and reacts with) its surroundings.`,
  md`A jet obeys boundary-layer-type, time-averaged equations (9.104)–(9.105) with a **turbulent** stress and **constant pressure** — so the momentum flux $\dot{\mathcal M}$ is the same at every station.`,
  md`Momentum is conserved but volume flow is not: the jet **entrains** surrounding fluid, so it widens and slows down at the same time.`,
  md`Similarity + order-of-magnitude analysis (Table 9.2) fix the exponents: plane jet $b\propto x$, $\overline{v}\propto x^{-1/2}$ ($p = 1$, $q = \tfrac12$); round jet $b\propto z$, $\overline{v}\propto z^{-1}$ ($p = q = 1$).`,
  md`Mixing-length plane jet: $\psi = \gamma\sqrt{x}f(\zeta)$, $\zeta = \beta y/x$, $f f' = (f'')^2$, solved numerically with $f(0) = 0$, $f'(0) = 1$; Reichardt: $\beta = 7.67$, $\alpha = 0.0333$.`,
  md`In Fig. 9.16 the transverse velocity is outward for $\zeta \lesssim 1.25$ (spreading) and inward beyond, levelling at a non-zero value (entrainment).`,
  md`A uniform eddy viscosity $\nu_{\mathrm T} = c\,b\,\overline{v}_{xc}$ gives the analytical plane-jet profile $\overline{v}_x/\overline{v}_{xc} = 1 - \tanh^2\zeta$ — quicker, slightly too high for $\zeta > 1.5$.`,
  md`Round jet: $\nu_{\mathrm T}$ is **constant**, and $\overline{v}_z = 3\dot{\mathcal M}/[8\pi\nu_{\mathrm T}\rho z(1+\zeta^2/4)^2]$ is confirmed by Reichardt (mixing length a little better at large $\zeta$).`,
  md`Exam trap: Reichardt's constant is printed as $\nu_{\mathrm T}\rho/\dot{\mathcal M} = 0.0161$, which is not dimensionless; use $\nu_{\mathrm T} = 0.0161\sqrt{\dot{\mathcal M}/\rho}$ and always check units.`,
]

/* ------------------------------------------------------------------------------------------------ */
/*  Content                                                                                         */
/* ------------------------------------------------------------------------------------------------ */

const ZS = Array.from({ length: 101 }, (_, i) => -2.5 + i * 0.05)

export default function Content() {
  return (
    <>
      {/* ============================================================================================ */}
      <Concept id="jet-basics">
        <Step kind="intro" src={W('524–525')}>
          <Md>{md`So far in Chapter 9 a **wall** shaped the turbulence: pipe flow, the laminar sublayer, the log law. Wilkes now
          extends the same ideas to **free turbulence**, which is essentially unaffected by confining boundaries. Two free-turbulence
          flows are of general interest:

          - the **turbulent jet** — fluid issues from a narrow constriction and forms a turbulent plume of ever-increasing breadth and
            decreasing velocity;
          - the **turbulent wake** — behind a stationary bluff (non-streamlined) object in a stream, or behind an object moving
            through still fluid; it also broadens downstream.

          Only the jet is studied, because it matters more to chemical engineers: they care about the **rate at which two reactants —
          the jet and its surroundings — interact**. Two geometries are treated: a jet from a **long slot** (the **plane turbulent
          jet**) and a jet from a **small circular orifice** (the **axisymmetric turbulent jet**).`}</Md>
          <Callout kind="key" title="Five features jets share with boundary layers (Wilkes p. 524)">
            <Md>{md`1. The flow is mainly in one principal direction — the jet axis.
            2. The turbulent region grows gradually downstream.
            3. Velocity derivatives across the jet are much larger than those along it.
            4. An order-of-magnitude analysis can simplify the equations of motion.
            5. A stream function can help with the solution.

            So the simplifications of Section 8.3 (laminar boundary layers) carry over, provided **time-averaged velocities** are used and
            (a) a **turbulent shear stress** replaces the viscous stress, (b) the **pressure is essentially constant** (except just behind
            the body in a wake).`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Picture a garden hose pointed into a swimming pool. The fast water does not stay a neat cylinder: its edge is ripped
          into eddies that grab the still water next to it, speed it up and pull it into the jet. Every gram of pool water that joins
          has to be accelerated, and the only "budget" available is the momentum that left the nozzle. Nothing else pushes on the jet —
          the pool is at the same pressure everywhere — so that budget is fixed. Sharing a fixed momentum among more and more fluid
          means **more fluid, moving more slowly, over a wider region**.`}</Md>
          <Compare
            items={[
              { title: 'Conserved', md: md`Momentum flux $\dot{\mathcal M}$ — no pressure gradient, no wall, no external force.`, tone: 'emerald' },
              { title: 'Grows', md: md`Width $b$ and volume flow $Q$ — surrounding fluid is **entrained** across the jet edges.`, tone: 'cyan' },
              { title: 'Falls', md: md`Velocity on the centre-line and the kinetic-energy flux (turned into turbulence, then heat).`, tone: 'amber' },
            ]}
          />
          <Callout kind="tip" title="Analogy">
            <Md>{md`Momentum is like a fixed amount of money handed down a queue that keeps growing: everyone gets paid, but each person
            gets less. Mass is *not* the conserved currency — new people keep joining the queue.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={W('525', 'Fig. 9.15')}>
          <Figure caption="Plane turbulent jet (redrawn from Wilkes Fig. 9.15; the broadening is exaggerated). The half-width b grows with x, the mean-velocity profile is bell-shaped and fluid is entrained from both sides." src={W('525', 'Fig. 9.15')}>
            <JetSchematic kind="plane" />
          </Figure>
          <Md>{md`Reading the figure: the slot sits at the origin; $x$ runs along the centre-line, $y$ across it. Inside the dashed wedge
          — the **turbulent zone** — the mean velocity $\overline{v}_x$ is a bell, largest on the axis and zero at the edges. Its
          **half-width $b$** increases with $x$; it turns out to grow **linearly**, but Wilkes stresses that this is *not assumed* — it
          comes out of the analysis. Outside the wedge the arrows point **towards** the jet: that is entrained fluid.`}</Md>
        </Step>

        <Step kind="equations" src={W('525–526', 'Eqs. (9.104)–(9.106)')}>
          <Md>{md`Fluid leaves the slot in the $+x$ direction into a "sea" of the same fluid at **constant pressure**, fast enough to be
          turbulent. The flow is **steady in the mean** (no time derivative), and the boundary-layer simplifications give:`}</Md>
          <FormulaCard id="pj-xmom" />
          <FormulaCard id="pj-cont" />
          <Md>{md`Because the pressure is constant and no external force acts, the rate of $x$-momentum transfer per unit depth must be
          **independent of $x$**:`}</Md>
          <FormulaCard id="pj-Mdot" />
          <Supplement title="Why (9.104) really implies constant Ṁ">
            <Derivation
              steps={[
                { md: md`Add $\overline{v}_x\times$(9.105) $= 0$ to the left of (9.104): $\overline{v}_x\pd{\overline{v}_x}{x} + \overline{v}_y\pd{\overline{v}_x}{y} + \overline{v}_x\left(\pd{\overline{v}_x}{x} + \pd{\overline{v}_y}{y}\right) = \pd{\left(\overline{v}_x^{\,2}\right)}{x} + \pd{\left(\overline{v}_x\overline{v}_y\right)}{y}$`, why: 'conservative form' },
                { md: md`Integrate across the jet: $\dfrac{d}{dx}\displaystyle\int_{-\infty}^{\infty}\overline{v}_x^{\,2}dy + \Big[\overline{v}_x\overline{v}_y\Big]_{-\infty}^{\infty} = \frac{1}{\rho}\Big[\overline{\tau}^{\,t}_{yx}\Big]_{-\infty}^{\infty}$`, why: 'integrate in y' },
                { md: md`Far outside the jet $\overline{v}_x\to0$ (while $\overline{v}_y$ stays finite — entrainment) and $\overline{\tau}^{\,t}_{yx}\to0$, so both brackets vanish: $\dfrac{d}{dx}\displaystyle\int\overline{v}_x^{\,2}dy = 0$ → $\dot{\mathcal M}$ = constant.`, why: 'no stress or momentum at ±∞' },
              ]}
            />
          </Supplement>
          <Callout kind="note" title="Two ways to model the turbulent stress (Wilkes p. 526)">
            <Md>{md`To close (9.104) we need $\overline{\tau}^{\,t}_{yx}$. Wilkes uses (1) **Prandtl's mixing-length theory** (next concept,
            numerical solution) and (2) a **simplified eddy-viscosity theory** (third concept, analytical solution). The round jet
            (last concept) uses the eddy-viscosity idea.`}</Md>
          </Callout>
          <Callout kind="exam">
            <Md>{md`Typical exam question: "Why is $\int\rho\overline{v}_x^2dy$ independent of $x$ for a free jet but not for flow in a
            pipe?" — In a pipe there is a pressure gradient and a wall shear force; the free jet has neither.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-jb-momentum" />
        </Step>

        <Step kind="interactive">
          <JetVisualiser initialModel="ml" />
        </Step>

        <Step kind="practice">
          <PracticeList concept="jet-basics" />
          <QuickCheck ids={['q-jb-mdot', 'q-jb-flow']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Jets (from a slot or an orifice) and wakes are **free turbulence**; jets set mixing rates of reactants.`,
              md`Equations (9.104)–(9.105): boundary-layer form, time-averaged, turbulent stress, **no pressure term**, steady in the mean.`,
              md`$\dot{\mathcal M} = \rho\int\overline{v}_x^2dy$ is constant along the jet (9.106) — the jet's invariant.`,
              md`Trap: the **mass/volume flow is not constant** — entrainment makes it grow. Don't apply "$Q$ = constant" to a free jet.`,
              md`Linear growth of $b$ is a *result*, not an assumption.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================================================ */}
      <Concept id="plane-jet-similarity">
        <Step kind="intro" src={W('526')}>
          <Md>{md`Prandtl's mixing-length theory still works without a wall, so it supplies the turbulent stress (9.107). As for the
          laminar boundary layer (the Blasius solution), the goal is **similarity of velocity profiles** — one shape that fits every
          station once it is scaled properly. Four assumptions help:

          1. a new dimensionless coordinate $\zeta$ is introduced (as in the Blasius solution);
          2. the mixing length $\ell$ depends only on $x$ and is proportional to the half-width $b$;
          3. $b$ is proportional to a power $p$ of $x$;
          4. the velocity is a function of $\zeta$ divided by a power $q$ of $x$.

          The exponents are then found by checking how each term depends on $x$.`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`"Self-similar" means: photograph the velocity profile at $x = 0.2$ m and at $x = 0.8$ m, then zoom each photo so the
          widths and peak heights match — the two curves lie on top of each other. All the $x$-dependence is in two **rulers**: a width
          ruler $b(x)$ and a velocity ruler $\overline{v}_c(x)$. If both are powers of $x$, every term in the momentum equation is
          also a power of $x$, and the equation can only hold at every $x$ if those powers agree. That bookkeeping (Table 9.2) is the
          whole order-of-magnitude analysis.`}</Md>
          <Callout kind="tip">
            <Md>{md`Why must the width grow? Momentum is fixed ($\overline{v}_c^2 b$ = const), and turbulent friction keeps passing
            momentum to slower neighbours. A jet that did not widen could not slow down, and a jet that did not slow down could not be
            sharing momentum — see practice problem "no spread".`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={W('528–529', 'Fig. 9.16')}>
          <Figure caption="Fig. 9.16 redrawn from the numerical solution of (9.115): axial velocity f′ = v̄x√x/(βγ) (bell, even) and transverse velocity ζf′ − f/2 = v̄y√x/γ (odd). The transverse velocity is outward for |ζ| ≲ 1.2 and inward beyond — spreading and entrainment." src={W('528', 'Fig. 9.16')}>
            <Plot
              x={{ label: md`dimensionless distance $\zeta$`, domain: [-2.5, 2.5] }}
              y={{ label: 'dimensionless velocities', domain: [-1, 1.5] }}
              series={[
                { label: md`axial $\overline{v}_x\sqrt{x}/(\beta\gamma)$`, points: ZS.map((z) => [z, mlProfile(z).fp] as [number, number]), color: 'var(--plot-1)', width: 2.6 },
                { label: md`transverse $\overline{v}_y\sqrt{x}/\gamma$`, points: ZS.map((z) => [z, transverse(mlProfile(z), z)] as [number, number]), color: 'var(--plot-2)', width: 2.4 },
              ]}
              hlines={[{ y: 0, color: 'var(--ink-3)' }]}
              height={300}
            />
          </Figure>
          <Supplement title="The same solution in metres: three stations of one jet">
            <Plot
              x={{ label: md`transverse distance $y$ (m)`, domain: [-0.35, 0.35] }}
              y={{ label: md`$\overline{v}_x/\overline{v}_{xc}(x=0.25\ \mathrm{m})$`, domain: [0, 1.05] }}
              series={[0.25, 0.5, 1].map((xx, i) => ({
                label: md`$x$ = ${xx} m`,
                fn: (y: number) => mlProfile((BETA_ML * y) / xx).fp * Math.sqrt(0.25 / xx),
                color: ['var(--plot-1)', 'var(--plot-2)', 'var(--plot-3)'][i],
                width: 2.4,
                samples: 300,
              }))}
              height={250}
            />
            <Md>{md`Each doubling of $x$ doubles the width and divides the peak by $\sqrt2$, so the area under $\overline{v}_x^2$ —
            the momentum flux — is unchanged, while the area under $\overline{v}_x$ (the flow rate) grows by $\sqrt2$.`}</Md>
          </Supplement>
        </Step>

        <Step kind="equations" src={W('526–529', 'Eqs. (9.107)–(9.115), Table 9.2')}>
          <Md>{md`**1 · Stress model.** Mixing-length theory without a wall:`}</Md>
          <FormulaCard id="ml-stress" />
          <Md>{md`**2 · Similarity assumptions** (the four bullets of the intro, in symbols):`}</Md>
          <FormulaCard id="sim-assume" />
          <Md>{md`**3 · Order of magnitude.** $\overline{v}_x\sim x^{-q}$, so $\overline{v}_x^2\sim x^{-2q}$, and the integral in (9.106) — taken
          over a width $\sim b\sim x^{p}$ — behaves as $x^{p-2q}$. Since $\dot{\mathcal M}/\rho$ cannot depend on $x$:`}</Md>
          <FormulaCard id="p-2q" />
          <Md>{md`Similar arguments (continuity gives the order of $\overline{v}_y$) give the order of each term of (9.104):

          | Term | Order |
          |---|---|
          | $\overline{v}_x\,\partial\overline{v}_x/\partial x$ | $x^{-(1+2q)}$ |
          | $\overline{v}_y\,\partial\overline{v}_x/\partial y$ | $x^{-(1+2q)}$ |
          | $(1/\rho)\,\partial\overline{\tau}^{\,t}_{yx}/\partial y$ | $x^{-(p+2q)}$ |

          *Table 9.2 — Order of terms (Wilkes p. 527).* (Wilkes' text says continuity is "(9.108)" here — a mis-reference; the plane-jet
          continuity equation is (9.105).) For (9.104) to balance, $1 + 2q = p + 2q$:`}</Md>
          <FormulaCard id="pq-plane" />
          <Supplement title="Where the orders in Table 9.2 come from">
            <Derivation
              steps={[
                { md: md`$\pd{\overline{v}_x}{x}\sim\dfrac{x^{-q}}{x} = x^{-q-1}$ → $\overline{v}_x\pd{\overline{v}_x}{x}\sim x^{-(1+2q)}$.`, why: 'differentiate a power of x' },
                { md: md`Continuity: $\overline{v}_y\sim b\,\pd{\overline{v}_x}{x}\sim x^{p-q-1}$, and $\pd{\overline{v}_x}{y}\sim\dfrac{x^{-q}}{b}\sim x^{-q-p}$ → $\overline{v}_y\pd{\overline{v}_x}{y}\sim x^{-(1+2q)}$.`, why: '(9.105), y-scale = b' },
                { md: md`$\ell\sim b\sim x^{p}$: $\overline{\tau}^{\,t}_{yx}/\rho = \ell^2\left(\pd{\overline{v}_x}{y}\right)^2\sim x^{2p}x^{-2(p+q)} = x^{-2q}$ → $\dfrac{1}{\rho}\pd{\overline{\tau}^{\,t}_{yx}}{y}\sim x^{-(p+2q)}$.`, why: 'mixing-length stress (9.107)' },
                { md: md`Balance $1+2q = p+2q$ → $p = 1$; then (9.109) → $q = \tfrac12$.`, why: 'every term must scale alike' },
              ]}
            />
          </Supplement>
          <Callout kind="key">
            <Md>{md`$p = 1$ confirms that the jet **spreads linearly**; $q = \tfrac12$ means the **velocities fall off as $x^{-1/2}$**.`}</Md>
          </Callout>
          <Md>{md`**4 · Stream function.** It satisfies continuity automatically and speeds up the solution:`}</Md>
          <FormulaCard id="pj-psi" />
          <Md>{md`With $p = 1$, $q = \tfrac12$ the mixing length grows linearly, the similarity variable is $y/x$ and $\psi\sim\overline{v}_xb\sim x^{1/2}$:`}</Md>
          <FormulaCard id="pj-forms" />
          <FormulaCard id="pj-vel" />
          <Supplement title="Differentiating ψ = γ√x f(ζ)">
            <Derivation
              steps={[
                { md: md`$\pd{\zeta}{y} = \dfrac{\beta}{x}$, $\quad\pd{\zeta}{x} = -\dfrac{\beta y}{x^2} = -\dfrac{\zeta}{x}$.`, why: 'ζ = βy/x' },
                { md: md`$\overline{v}_x = \pd{\psi}{y} = \gamma\sqrt{x}\,f'\,\dfrac{\beta}{x} = \dfrac{\beta\gamma f'}{\sqrt{x}}$.`, why: 'chain rule' },
                { md: md`$\overline{v}_y = -\pd{\psi}{x} = -\gamma\left[\dfrac{f}{2\sqrt{x}} + \sqrt{x}\,f'\left(-\dfrac{\zeta}{x}\right)\right] = \dfrac{\gamma}{\sqrt{x}}\left(\zeta f' - \dfrac{f}{2}\right)$.`, why: 'product rule' },
              ]}
            />
          </Supplement>
          <Md>{md`**5 · The ODE.** Substituting the velocities into (9.104) and choosing $\beta = (2\alpha^2)^{-1/3}$ — which absorbs $\alpha$ into
          the definition of $\zeta$ — gives, after some algebra:`}</Md>
          <FormulaCard id="pj-ode" />
          <Supplement title="The 'some algebra' (check of 9.114)">
            <Derivation
              steps={[
                { md: md`Left side of (9.104): $\overline{v}_x\pd{\overline{v}_x}{x} + \overline{v}_y\pd{\overline{v}_x}{y} = -\dfrac{\beta^2\gamma^2}{2x^2}\left(f'^2 + f f''\right)$.`, why: 'insert (9.113)' },
                { md: md`For $y > 0$, $f'' < 0$, so $\overline{\tau}^{\,t}_{yx}/\rho = -\ell^2\left(\pd{\overline{v}_x}{y}\right)^2 = -\dfrac{\alpha^2\beta^4\gamma^2 f''^2}{x}$ and $\dfrac{1}{\rho}\pd{\overline{\tau}^{\,t}_{yx}}{y} = -\dfrac{\alpha^2\beta^5\gamma^2}{x^2}\left(f''^2\right)'$.`, why: 'ℓ = αx, ∂/∂y = (β/x) d/dζ' },
                { md: md`Equate: $f'^2 + f f'' = 2\alpha^2\beta^3\left(f''^2\right)'$ — and $2\alpha^2\beta^3 = 1$ when $\beta = (2\alpha^2)^{-1/3}$. All $x$ has cancelled: similarity works.`, why: '→ (9.114)' },
              ]}
            />
          </Supplement>
          <Md>{md`Since $f'^2 + f f'' = (f f')'$, (9.114) integrates directly. The **integration constant is zero** because on the
          centre-line symmetry gives $\overline{v}_y = d\overline{v}_x/dy = 0$, i.e. $f = f'' = 0$ at $\zeta = 0$:`}</Md>
          <FormulaCard id="pj-ode1" />
          <Md>{md`**6 · Numerical solution and experiments (pp. 528–529).** Wilkes integrates (9.115) numerically from $\zeta = 0$ with $f = 0$
          and $f' = 1$. The value $f'(0) = 1$ is **arbitrary**: $\gamma$ can afterwards be chosen so that the velocities match any
          specified jet flow rate. The output — $f'$ for $\overline{v}_x$ and $\zeta f' - f/2$ for $\overline{v}_y$ — is Fig. 9.16, from which
          the mean velocities follow for any $\gamma$ (jet strength) and any $x$.

          - The numerical results agree **completely** with Förthmann's experiments (as reported by Goldstein, footnote 19).
          - **Reichardt's** experiments give $\beta = 7.67$, corresponding to $\alpha = 0.0333$ (as reported by Schlichting, footnote 20).
          - The axial velocity is a **bell symmetrical about the centre-line**; because the plot uses $f' = \overline{v}_x\sqrt{x}/(\beta\gamma)$,
            the real $\overline{v}_x$ *decreases* with $x$, and because $\zeta = \beta y/x$ the region where $\overline{v}_x$ is significant
            *widens*: **the jet spreads out and slows down at the same time.**
          - Transverse velocity ($\zeta > 0$): for $0 < \zeta < 1.25$ (approximately) $\overline{v}_y > 0$ — the **spreading** of the jet;
            for $\zeta > 1.25$ it is negative and levels out at a significant non-zero value although $\overline{v}_x\approx0$ — the
            **entrainment** of outside fluid.`}</Md>
          <Supplement title="Two results you can derive from (9.115) — not in the book">
            <FormulaCard id="pj-first-int" />
            <FormulaCard id="pj-design" />
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-ps-air" />
        </Step>

        <Step kind="interactive">
          <ExponentBalancer />
          <div className="h-4" />
          <PlaneProfileSim />
        </Step>

        <Step kind="practice">
          <PracticeList concept="plane-jet-similarity" />
          <QuickCheck ids={['q-ps-pq', 'q-ps-transverse']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Recipe: stress model (9.107) → power-law similarity (9.108) → constant $\dot{\mathcal M}$ gives $p = 2q$ → term balance gives $p = 1$, $q = \tfrac12$.`,
              md`$\psi = \gamma\sqrt{x}f(\zeta)$, $\zeta = \beta y/x$: $\overline{v}_x = \beta\gamma f'/\sqrt{x}$, $\overline{v}_y = \gamma(\zeta f' - f/2)/\sqrt{x}$.`,
              md`ODE $f f' = (f'')^2$ with $f(0) = 0$, $f'(0) = 1$ (arbitrary — $\gamma$ fixes the strength); zero integration constant from $f = f'' = 0$ on the axis.`,
              md`Reichardt: $\beta = 7.67$ ↔ $\alpha = 0.0333$; Förthmann's data agree completely.`,
              md`Trap: Fig. 9.16 is in *scaled* variables — a single bell for all $x$; the real jet is wider and slower downstream.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================================================ */}
      <Concept id="plane-jet-tanh">
        <Step kind="intro" src={W('529–530')}>
          <Md>{md`A simpler expression for the eddy kinematic viscosity gives an **analytical** — and therefore quicker — solution for
          the plane jet, at the price of slightly lower accuracy:

          $$
          \nu_{\mathrm T} = c\,b\,\overline{v}_{xc}
          $$

          $\nu_{\mathrm T}$ still has dimensions $\mathrm{L^2/T}$, and the model is still physically quite realistic, because the eddy
          viscosity increases with (1) the **space available** for turbulent fluctuations, measured by the half-width $b$, and (2) the
          **general intensity** of the velocities, measured by the centre-line velocity $\overline{v}_{xc}$.`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`In the mixing-length model the eddy viscosity $\ell^2\lvert\partial\overline{v}_x/\partial y\rvert$ changes across the jet —
          it even vanishes on the axis where the profile is flat. The simplified model says: "eddies are roughly as big as the jet and
          roughly as fast as the jet — use one value for the whole section". With $\nu_{\mathrm T}$ uniform across the jet, the
          momentum equation looks like a **laminar** jet with a (much larger) viscosity, and laminar-like equations are the ones we can
          integrate by hand.`}</Md>
          <Callout kind="tip">
            <Md>{md`What do you lose? Mostly the outer edge. A uniform $\nu_{\mathrm T}$ keeps diffusing momentum into the fringes, so
            the tanh profile has a long tail where the mixing-length jet has a sharp edge — that is why Wilkes finds it slightly too
            high for $\zeta > 1.5$.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={W('530')}>
          <Figure caption="Analytical eddy-viscosity profile f′ = 1 − tanh²ζ (dashed) against the numerical mixing-length solution of Fig. 9.16 (solid), both normalised to f′(0) = 1. The transverse velocities are shown below the axis." src={W('528–530', 'Fig. 9.16, Eq. (9.123)')}>
            <Plot
              x={{ label: md`$\zeta$`, domain: [-3, 3] }}
              y={{ label: 'dimensionless velocities', domain: [-0.6, 1.1] }}
              series={[
                { label: md`mixing length $f'$`, fn: (z) => mlProfile(z).fp, color: 'var(--plot-1)', width: 2.6 },
                { label: md`tanh model $f' = \mathrm{sech}^2\zeta$`, fn: (z) => tanhProfile(z).fp, color: 'var(--plot-3)', width: 2.4, dash: '7 4' },
                { label: md`mixing length $\zeta f' - f/2$`, fn: (z) => transverse(mlProfile(z), z), color: 'var(--plot-2)', width: 2 },
                { label: md`tanh model $\zeta f' - f/2$`, fn: (z) => transverse(tanhProfile(z), z), color: 'var(--plot-5)', width: 2, dash: '7 4' },
              ]}
              bands={[
                { x0: 1.5, x1: 3, label: 'ζ > 1.5', color: 'var(--plot-3)' },
                { x0: -3, x1: -1.5, color: 'var(--plot-3)' },
              ]}
              hlines={[{ y: 0, color: 'var(--ink-3)' }]}
              height={300}
            />
          </Figure>
          <Md>{md`Wilkes simply says the tanh solution agrees quite well with Fig. 9.16 but **slightly over-predicts the velocities for
          $\zeta > 1.5$**.`}</Md>
          <Supplement title="Where exactly does the tanh curve lie higher?">
            <Md>{md`Plotted as above (both normalised to $f'(0) = 1$, each against its own $\zeta$) the dashed bell lies above the
          solid one beyond $\zeta \approx 1.73$ — it never reaches zero, whereas the mixing-length profile ends at $\zeta_e = 2.418$ — and
          very slightly above it near the axis ($\zeta < 0.53$). The two models define $\beta$ differently, so this comparison is only
          approximate.`}</Md>
          </Supplement>
        </Step>

        <Step kind="equations" src={W('529–530', 'Eqs. (9.116)–(9.123)')}>
          <FormulaCard id="ev-nuT" />
          <Md>{md`Again use the stream function (9.111). Since $b$ was found to grow linearly with $x$ (and $\overline{v}_{xc}\propto x^{-1/2}$),
          take:`}</Md>
          <FormulaCard id="ev-forms" />
          <FormulaCard id="ev-vel" />
          <Md>{md`Substitute into (9.104) with $\overline{\tau}^{\,t}_{yx} = \rho\nu_{\mathrm T}\,\partial\overline{v}_x/\partial y$ and simplify:`}</Md>
          <FormulaCard id="ev-ode" />
          <Supplement title="Check of (9.119)">
            <Derivation
              steps={[
                { md: md`Inertia side, exactly as before with $\gamma\to\gamma V$: $-\dfrac{\beta^2\gamma^2V^2}{2x^2}\,(f f')'$.`, why: 'insert (9.118)' },
                { md: md`Stress side with uniform $\nu_{\mathrm T}$: $\nu_{\mathrm T}\pd{^2\overline{v}_x}{y^2} = \alpha V\sqrt{x}\cdot\dfrac{\beta\gamma V}{\sqrt{x}}\dfrac{\beta^2}{x^2}f''' = \dfrac{\alpha\beta^3\gamma V^2}{x^2}f'''$.`, why: 'ν_T comes outside ∂/∂y' },
                { md: md`Equate and divide by $-\beta^2\gamma^2V^2/(2x^2)$: $(f f')' = -\dfrac{2\alpha\beta}{\gamma}f'''$.`, why: '→ (9.119)' },
              ]}
            />
          </Supplement>
          <Md>{md`Integrate once — the constant is zero because centre-line symmetry again gives $f = f'' = 0$:`}</Md>
          <FormulaCard id="ev-ode1" />
          <Md>{md`Integrate again ($f f' = \tfrac12(f^2)'$); the constant $c$ follows from the centre-line conditions $f = 0$, $f' = 1$:`}</Md>
          <FormulaCard id="ev-second" />
          <Md>{md`With a suitable choice of $\beta$ the equation becomes very simple:`}</Md>
          <FormulaCard id="ev-beta" />
          <FormulaCard id="ev-tanh" />
          <Supplement title="Solving f² + f′ = 1 in one line">
            <Md>{md`$\dfrac{df}{1 - f^2} = d\zeta$ → $\operatorname{artanh}f = \zeta + C$, and $f(0) = 0$ gives $C = 0$: $f = \tanh\zeta$,
            $f' = 1 - \tanh^2\zeta = \mathrm{sech}^2\zeta$, with $f'(0) = 1$ ✓.`}</Md>
            <FormulaCard id="ev-consistency" />
          </Supplement>
          <Callout kind="warning" title="Accuracy">
            <Md>{md`Wilkes: the analytical solution agrees **quite well** with the somewhat more accurate numerical solution of Fig. 9.16,
            except that it **slightly over-predicts the velocities for $\zeta > 1.5$**.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-tanh" />
        </Step>

        <Step kind="interactive">
          <TanhExplorer />
        </Step>

        <Step kind="practice">
          <PracticeList concept="plane-jet-tanh" />
          <QuickCheck ids={['q-tanh-nuT', 'q-tanh-compare']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$\nu_{\mathrm T} = c\,b\,\overline{v}_{xc}$ (9.116): uniform across a section, $\propto x^{1/2}$ along the jet; justified by eddy size $\sim b$ and eddy speed $\sim\overline{v}_{xc}$.`,
              md`Chain (9.119) → (9.120) → (9.121) → (9.122): two integrations, constants from $f = f'' = 0$ and $f' = 1$ on the axis, $\beta = \gamma/(4\alpha)$.`,
              md`Result $f = \tanh\zeta$, $\overline{v}_x/\overline{v}_{xc} = 1 - \tanh^2\zeta$; half-velocity at $\zeta = 0.881$.`,
              md`Analytical and quick, but slightly too high for $\zeta > 1.5$ (no sharp edge).`,
              md`Trap: the transverse velocity still tends to a **non-zero** inflow ($-\tfrac12\gamma V/\sqrt{x}$) — entrainment exists in both models.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================================================ */}
      <Concept id="round-jet">
        <Step kind="intro" src={W('530–532')}>
          <Md>{md`The jet from a **circular orifice** is more common in practice but theoretically a little harder. With cylindrical
          coordinates and axisymmetry (Fig. 9.17) the simplified equations are the cylindrical analogues of (9.104)–(9.105). The same
          two ideas carry the analysis: the **momentum flux is constant** (constant pressure, no external force), and the turbulent
          stress is modelled with an **eddy viscosity of the (9.116) type**, $\nu_{\mathrm T} = c_1\,b\,\overline{v}_{zc}$. The surprise:
          for the round jet this $\nu_{\mathrm T}$ is **constant everywhere**, and the equations then have an **analytical solution**.`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`In a plane jet the momentum is spread over a *width* $\propto x$, so $\overline{v}^2x$ = const gives $\overline{v}\propto x^{-1/2}$.
          In a round jet it is spread over a cross-sectional *area* $\propto z^2$, so $\overline{v}^2z^2$ = const gives $\overline{v}\propto z^{-1}$:
          the round jet slows down **faster**. Its eddies grow in size ($\propto z$) but slow down ($\propto 1/z$) in exact proportion,
          so their "mixing power" $b\,\overline{v}_{zc}$ — the eddy viscosity — stays the same all the way down the jet.`}</Md>
          <Callout kind="tip">
            <Md>{md`A constant $\nu_{\mathrm T}$ turns the turbulent round jet into a "laminar" round jet with viscosity $\nu_{\mathrm T}$ — the
            classical laminar solution can simply be borrowed (Wilkes' footnote points to Schlichting).`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={W('530', 'Fig. 9.17')}>
          <Figure caption="Axisymmetric turbulent jet (redrawn from Wilkes Fig. 9.17): same picture as Fig. 9.15 in a meridional plane, with r, z and v̄z in place of y, x and v̄x. The dashed ellipse reminds you that the cross-section is a circle." src={W('530', 'Fig. 9.17')}>
            <JetSchematic kind="round" />
          </Figure>
          <Supplement title="Centre-line decay and entrainment: plane vs round (uniform exit, far field)">
            <Plot
              x={{ label: md`distance from the exit in slot widths / nozzle diameters, $x/h_0$ or $z/d_0$`, domain: [10, 200], log: true }}
              y={{ label: 'ratio to exit value', domain: [0.02, 100], log: true }}
              series={[
                { label: md`plane $\overline{v}_{xc}/U_0 = 2.37\sqrt{h_0/x}$`, fn: (x) => 2.367 / Math.sqrt(x), color: 'var(--plot-1)', dash: '7 4', width: 2.2 },
                { label: md`round $\overline{v}_{zc}/U_0 = 6.57\,d_0/z$`, fn: (x) => 6.571 / x, color: 'var(--plot-1)', width: 2.6 },
                { label: md`plane $Q'/Q'_0 = 0.617\sqrt{x/h_0}$`, fn: (x) => 0.617 * Math.sqrt(x), color: 'var(--plot-4)', dash: '7 4', width: 2.2 },
                { label: md`round $Q/Q_0 = 0.457\,z/d_0$`, fn: (x) => 0.4566 * x, color: 'var(--plot-4)', width: 2.6 },
              ]}
              height={270}
            />
            <Md>{md`Slopes on log–log axes: $-\tfrac12$ and $+\tfrac12$ for the plane jet, $-1$ and $+1$ for the round jet. Coefficients from
            the mixing-length plane jet ($\beta = 7.67$) and the round jet with $\nu_{\mathrm T} = 0.0161\sqrt{\dot{\mathcal M}/\rho}$.`}</Md>
          </Supplement>
        </Step>

        <Step kind="equations" src={W('530–532', 'Eqs. (9.124)–(9.134)')}>
          <FormulaCard id="rj-mom" />
          <FormulaCard id="rj-cont" />
          <Md>{md`The rate of $z$-momentum transfer must again be constant:`}</Md>
          <FormulaCard id="rj-Mdot" />
          <FormulaCard id="rj-nuT" />
          <Md>{md`Similarity forms, as in (9.108):`}</Md>
          <FormulaCard id="rj-sim" />
          <Md>{md`Arguments like those around (9.109), (9.110) and Table 9.2 then give:`}</Md>
          <FormulaCard id="rj-pq" />
          <Supplement title="Filling in the 'similar arguments' for p = q = 1">
            <Derivation
              steps={[
                { md: md`Momentum (9.126): $\displaystyle\int_0^\infty 2\pi r\,\overline{v}_z^2dr\sim b^2\,z^{-2q}\sim z^{2p-2q}$ = const → $p = q$.`, why: 'area ∝ b², not b' },
                { md: md`Inertia: $\overline{v}_z\pd{\overline{v}_z}{z}\sim z^{-(1+2q)}$ (and $\overline{v}_r\pd{\overline{v}_z}{r}$ the same, by continuity).`, why: 'as Table 9.2' },
                { md: md`Stress: $\nu_{\mathrm T}\sim b\,\overline{v}_{zc}\sim z^{p-q}$ and $\dfrac1r\pd{}{r}\left(r\pd{\overline{v}_z}{r}\right)\sim z^{-q-2p}$ → $z^{-(p+2q)}$.`, why: 'eddy viscosity (9.127)' },
                { md: md`Balance $1 + 2q = p + 2q$ → $p = 1$, hence $q = 1$ and $\nu_{\mathrm T}\sim z^{0}$.`, why: '→ (9.129)' },
              ]}
            />
          </Supplement>
          <Md>{md`The eddy kinematic viscosity is therefore **constant everywhere**, and the equations reduce to:`}</Md>
          <FormulaCard id="rj-red-mom" />
          <FormulaCard id="rj-red-cont" />
          <Md>{md`Although they look formidable, these equations have an **analytical solution**, with $\overline{v}_z$ again a bell-shaped
          curve:`}</Md>
          <FormulaCard id="rj-vz" />
          <FormulaCard id="rj-vr" />
          <FormulaCard id="rj-zeta" />
          <Md>{md`**Comparison with experiment (p. 532).** The theoretical axial profile (9.132) is well substantiated by **Reichardt's**
          experiments, although mixing-length theory — instead of a constant eddy viscosity — gives **somewhat better agreement at large
          $\zeta$**. Reichardt's experiments also gave the constant:`}</Md>
          <FormulaCard id="rj-reichardt" />
          <Callout kind="warning" title="Check the units of the printed constant">
            <Md>{md`$\dot{\mathcal M}$ of a round jet is a force (N), so $\nu_{\mathrm T}\rho/\dot{\mathcal M}$ has units $\mathrm{s/m^2}$ and
            cannot be a universal number. The group that makes (9.134) dimensionless is $\nu_{\mathrm T}/\sqrt{\dot{\mathcal M}/\rho}$; reading
            Reichardt's 0.0161 that way gives realistic spreading ($r_{1/2}\approx 0.085z$) and is used on this page.`}</Md>
          </Callout>
          <Supplement title="Useful consequences of (9.132)–(9.134)">
            <FormulaCard id="rj-derived" />
            <FormulaCard id="rj-design" />
            <Md>{md`Self-consistency: substituting (9.132) into (9.126) returns exactly $\dot{\mathcal M}$, since
            $\int_0^\infty\zeta(1+\zeta^2/4)^{-4}d\zeta = 2/3$.`}</Md>
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-round" />
        </Step>

        <Step kind="interactive">
          <RoundJetExplorer />
          <div className="h-4" />
          <FlowSteps
            steps={[
              { title: 'Exit conditions', md: md`$\dot{\mathcal M} = \rho U_0^2\pi d_0^2/4$ — the only property of the nozzle the far field remembers.`, tone: 'indigo' },
              { title: 'Eddy viscosity', md: md`$\nu_{\mathrm T} = 0.0161\sqrt{\dot{\mathcal M}/\rho}$ — one constant for the whole jet.`, tone: 'cyan' },
              { title: 'Similarity variable', md: md`$\zeta = \sqrt{3\dot{\mathcal M}/(\pi\rho)}\,r/(4\nu_{\mathrm T}z)\approx15.2\,r/z$.`, tone: 'violet' },
              { title: 'Velocities', md: md`$\overline{v}_z$ from (9.132), $\overline{v}_r$ from (9.133); flow $Q = 8\pi\nu_{\mathrm T}z$.`, tone: 'emerald' },
            ]}
          />
        </Step>

        <Step kind="practice">
          <PracticeList concept="round-jet" />
          <QuickCheck ids={['q-rj-decay', 'q-rj-nuT']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Round jet: (9.124)–(9.126) with $\nu_{\mathrm T} = c_1 b\,\overline{v}_{zc}$; similarity gives $p = q = 1$ → $\nu_{\mathrm T}$ **constant**.`,
              md`$\overline{v}_z = 3\dot{\mathcal M}/[8\pi\nu_{\mathrm T}\rho z(1+\zeta^2/4)^2]$: centre-line velocity $\propto 1/z$, width $\propto z$, flow $\propto z$.`,
              md`$\overline{v}_r$ is outward for $\zeta < 2$ and inward (entrainment) for $\zeta > 2$.`,
              md`Reichardt confirms the profile; mixing length is somewhat better at large $\zeta$.`,
              md`Trap: the printed $\nu_{\mathrm T}\rho/\dot{\mathcal M} = 0.0161$ is not dimensionless — use $\nu_{\mathrm T} = 0.0161\sqrt{\dot{\mathcal M}/\rho}$.`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
