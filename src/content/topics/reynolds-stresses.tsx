import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowChart, FlowRow, FlowSteps, FormulaCard, Md, PracticeList,
  QuickCheck, SourceChips, Step, Supplement, Takeaways, md,
} from '@/kit'
import { CommuteDiagram } from '../sims/reynolds-stresses/CommuteDiagram'
import { MeanFieldAverager } from '../sims/reynolds-stresses/MeanFieldAverager'
import { ProductGrid, ReynoldsStressTensor } from '../sims/reynolds-stresses/MomentumVisuals'
import { ProductTermsLab } from '../sims/reynolds-stresses/ProductTermsLab'
import { TableE91 } from '../sims/reynolds-stresses/TableE91'
import { QuantumTableBuilder } from '../sims/reynolds-stresses/QuantumTableBuilder'
import { CorrelationExplorer } from '../sims/reynolds-stresses/CorrelationExplorer'
import { EddyPlaneFigure, SignConventionFigure } from '../sims/reynolds-stresses/EddyFigures'
import { EddyCrossingSim } from '../sims/reynolds-stresses/EddyCrossingSim'
import { FoxFig88 } from '../sims/reynolds-stresses/FoxFig88'

/** Wilkes, Ch. 9 — PRINTED page numbers. */
const W = (pages: string, note?: string): Src => (note ? { doc: 'wilkes', pages, note } : { doc: 'wilkes', pages })
/** Fox & McDonald's — cross-reference only. */
const FOX = (pages: string, note?: string): Src => (note ? { doc: 'fox', pages, note } : { doc: 'fox', pages })

const U_MS = md`\mathrm{m/s}`
const U_PA = md`\mathrm{Pa}`
const U_M2S2 = md`\mathrm{m^2/s^2}`
const U_RHO = md`\mathrm{kg/m^3}`
const U_M = md`\mathrm{m}`

// ─────────────────────────────────────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────────────────────────────────────
export const meta: TopicMeta = {
  id: 'reynolds-stresses',
  unit: 'D',
  title: 'Reynolds-Averaged Equations & Reynolds Stresses',
  subtitle:
    'Time-average the continuity and momentum equations, find the extra “Reynolds stresses” −ρ·mean(v′ᵢv′ⱼ) that the nonlinear terms leave behind, and see why only correlated velocity fluctuations carry momentum across a plane.',
  minutes: 85,
  sources: [
    W('484–488', '§9.1 Eqs. (9.6)–(9.13), Example 9.1; §9.2 Eqs. (9.14)–(9.16)'),
    FOX('293–294', 'cross-reference only: Eq. (8.17), Fig. 8.8'),
  ],
  concepts: [
    {
      id: 'averaged-continuity',
      title: 'Time-averaged continuity',
      src: W('484', 'Eqs. (9.6)–(9.8)'),
      summary: 'Substituting v = v̄ + v′ into constant-density continuity and time-averaging gives the same equation for the mean velocities (Eq. 9.8), using four simple averaging rules.',
    },
    {
      id: 'averaged-momentum',
      title: 'Time-averaged momentum (RANS) equations',
      src: W('484–486', 'Eqs. (9.9)–(9.13)'),
      summary: 'Averaging the x-momentum balance: the nonlinear convective terms leave averaged fluctuation products that act as additional Reynolds stresses (Eq. 9.13).',
    },
    {
      id: 'reynolds-stress-example',
      title: 'Example 9.1: why correlated fluctuations matter',
      src: W('486–487', 'Example 9.1, Table E9.1'),
      summary: 'With ±1 “quantum” fluctuations the averaged product v′x v′y is 1, −1 or 0: Reynolds stresses are nonzero only when the fluctuations are correlated.',
    },
    {
      id: 'physical-interpretation',
      title: 'Physical meaning of the Reynolds stresses',
      src: W('487–488', '§9.2, Fig. 9.4, Eqs. (9.14)–(9.16); opening of §9.3 (no universal law)'),
      summary: 'Eddies jumping across a plane carry x-momentum; the averaged upward flux plus the shear-stress sign convention gives the turbulent shear stress τᵗyx = −ρ·mean(v′y v′x).',
    },
  ],
  sourceNote: md`**Primary source: Wilkes, Ch. 9 (pp. 484–488).** Fox & McDonald's is cited only as a secondary cross-reference. This topic follows Wilkes §9.1 (time-averaged continuity and x-momentum balances, Example 9.1) and §9.2 (physical interpretation of the Reynolds stresses) in Wilkes notation — overbar = time average ($\avg{v}_x$), prime = fluctuation ($v_x'$), $\tau^t_{yx}$ = turbulent (Reynolds) shear stress. The only Fox material is a clearly labelled cross-reference to its Eq. (8.17) and Fig. 8.8 (pp. 293–294), whose notation maps as $u\equiv v_x$, $v\equiv v_y$, $-\rho\overline{u'v'}\equiv\tau^t_{yx}$.`,
}

// ─────────────────────────────────────────────────────────────────────────────
// Formulas
// ─────────────────────────────────────────────────────────────────────────────
export const formulas: FormulaDef[] = [
  {
    id: 'avg-rules',
    name: 'Time-averaging toolkit: decomposition and averaging rules',
    tex: md`\begin{aligned}
&v_x=\avg{v}_x+v_x',\quad p=\avg{p}+p'\;\;\text{(9.1)},\qquad \avg{v_x'}=\avg{p'}=0\;\;\text{(9.2)},\qquad \avg{\avg{v}_x}=\avg{v}_x\;\;\text{(9.3)}\\[4pt]
&\avg{a+b}=\avg{a}+\avg{b},\qquad \avg{\left(\pd{a}{x}\right)}=\pd{\avg{a}}{x},\qquad \avg{\avg{a}\,b'}=\avg{a}\;\avg{b'}=0,\qquad \avg{a'b'}\neq0\ \text{in general}
\end{aligned}`,
    vars: [
      { sym: md`\avg{a}=\frac{1}{T}\int_{t_0}^{t_0+T}a\,dt`, desc: md`time average (overbar) of a flow quantity $a$ at a fixed point; the integral is the standard definition of the average over the period $T$`, units: md`\text{as }a` },
      { sym: md`v_x,\ p`, desc: 'instantaneous velocity component and pressure', units: md`\mathrm{m/s},\ \mathrm{Pa}` },
      { sym: md`\avg{v}_x,\ \avg{p}`, desc: 'time-averaged (mean) values', units: md`\mathrm{m/s},\ \mathrm{Pa}` },
      { sym: md`v_x',\ p'`, desc: 'fluctuations about the means (likewise for $v_y$ and $v_z$)', units: md`\mathrm{m/s},\ \mathrm{Pa}` },
      { sym: md`a,\ b`, desc: md`any two flow quantities (velocity components, pressure, …); $a'$, $b'$ are their fluctuations`, units: md`\text{any}` },
      { sym: md`T`, desc: 'averaging period, very long compared with the time scale of the fluctuations (Wilkes: fluctuations within milliseconds, $T$ of a few seconds)', units: md`\mathrm{s}` },
    ],
    conditions: [
      md`$T$ much longer than the time scale of the individual fluctuations (Wilkes p. 483)`,
      md`flow **steady in the mean** (the chapter's usual case), so the averages do not depend on the start time $t_0$`,
      md`averaging is over **time at a fixed point**, so it commutes with space derivatives`,
    ],
    use: md`Apply the rules term by term. **Linear** terms simply acquire overbars; a **product** of two fluctuating quantities leaves behind an averaged product $\avg{a'b'}$ — the seed of every Reynolds stress. The four steps listed under Eq. (9.7) are the sum and derivative rules plus (9.2)–(9.3).`,
    src: [W('483', 'Eqs. (9.1)–(9.3)'), W('484', 'four steps under Eq. (9.7)'), W('485', 'product terms in Eq. (9.11)')],
  },
  {
    id: 'continuity-inst',
    name: 'Continuity, constant density (instantaneous velocities)',
    tag: '9.6',
    tex: md`\pd{v_x}{x}+\pd{v_y}{y}+\pd{v_z}{z}=0`,
    vars: [
      { sym: md`v_x,\ v_y,\ v_z`, desc: 'instantaneous velocity components', units: U_MS },
      { sym: md`x,\ y,\ z`, desc: 'Cartesian coordinates', units: U_M },
    ],
    conditions: ['constant density (incompressible fluid)', 'holds at **every instant** and every point — in laminar and turbulent flow alike'],
    use: md`The starting point for averaging: substitute $v_x=\avg{v}_x+v_x'$, $v_y=\avg{v}_y+v_y'$, $v_z=\avg{v}_z+v_z'$ (9.1) and time-average every term.`,
    src: W('484', 'Eq. (9.6), from Wilkes Eqn. (5.52)'),
  },
  {
    id: 'avg-derivative',
    name: 'Time-averaging one term of the continuity equation',
    tag: '9.7',
    tex: md`\avg{\left(\pd{(\avg{v}_x+v_x')}{x}\right)}=\pd{\,\avg{(\avg{v}_x+v_x')}}{x}=\pd{(\avg{\avg{v}_x}+\avg{v_x'})}{x}=\pd{\avg{v}_x}{x}`,
    vars: [
      { sym: md`\avg{v}_x`, desc: 'time-averaged velocity in $x$', units: U_MS },
      { sym: md`v_x'`, desc: 'fluctuation of $v_x$ about its mean', units: U_MS },
      { sym: md`x`, desc: 'coordinate', units: U_M },
    ],
    conditions: [md`averaging over time at fixed $x$, so it commutes with $\partial/\partial x$`, md`uses $\avg{v_x'}=0$ (9.2) and $\avg{\avg{v}_x}=\avg{v}_x$ (9.3)`],
    use: md`Read the three equals signs as the four steps of p. 484: (1) the average of a derivative is the derivative of the average; (2) the average of a sum is the sum of the averages; (3) the average of a mean is the mean itself; (4) the average of a fluctuation is zero.`,
    src: W('484', 'Eq. (9.7)'),
  },
  {
    id: 'continuity-avg',
    name: 'Time-averaged continuity equation',
    tag: '9.8',
    key: true,
    tex: md`\pd{\avg{v}_x}{x}+\pd{\avg{v}_y}{y}+\pd{\avg{v}_z}{z}=0`,
    vars: [
      { sym: md`\avg{v}_x,\ \avg{v}_y,\ \avg{v}_z`, desc: 'time-averaged velocity components', units: U_MS },
      { sym: md`x,\ y,\ z`, desc: 'Cartesian coordinates', units: U_M },
    ],
    conditions: ['constant density', 'averaging period long compared with the fluctuations', 'exact — no approximation beyond those of (9.6)'],
    use: md`Identical with the original continuity equation **except** that time-averaged velocities replace the instantaneous ones. Use it exactly as in laminar flow, e.g. to find one mean velocity component from the others.`,
    src: W('484', 'Eq. (9.8)'),
  },
  {
    id: 'continuity-fluct',
    name: 'Continuity for the fluctuations (one-line consequence)',
    tex: md`\pd{v_x'}{x}+\pd{v_y'}{y}+\pd{v_z'}{z}=0`,
    vars: [
      { sym: md`v_x',\ v_y',\ v_z'`, desc: 'velocity fluctuations', units: U_MS },
      { sym: md`x,\ y,\ z`, desc: 'Cartesian coordinates', units: U_M },
    ],
    conditions: ['constant density', 'obtained by subtracting (9.8) from (9.6)'],
    use: md`The fluctuating motion is itself volume-conserving: eddies rearrange fluid but cannot compress it. Not printed by Wilkes — it follows in one line.`,
  },
  {
    id: 'xmom-inst',
    name: 'Instantaneous x-momentum balance (viscous-stress form)',
    tag: '9.9',
    tex: md`\rho\left(\pd{v_x}{t}+v_x\pd{v_x}{x}+v_y\pd{v_x}{y}+v_z\pd{v_x}{z}\right)=-\pd{p}{x}+\underbrace{\pd{\tau_{xx}}{x}+\pd{\tau_{yx}}{y}+\pd{\tau_{zx}}{z}}_{\text{viscous stress terms}}+\rho g_x`,
    vars: [
      { sym: md`\rho`, desc: 'density (constant)', units: U_RHO },
      { sym: md`t`, desc: 'time', units: md`\mathrm{s}` },
      { sym: md`v_x,\ v_y,\ v_z`, desc: 'instantaneous velocity components', units: U_MS },
      { sym: md`p`, desc: 'instantaneous pressure', units: U_PA },
      { sym: md`\tau_{xx},\ \tau_{yx},\ \tau_{zx}`, desc: 'instantaneous **viscous** stresses acting in the $x$ direction; first subscript = normal to the surface, second = direction of the stress', units: U_PA },
      { sym: md`g_x`, desc: 'x-component of the gravitational acceleration', units: md`\mathrm{m/s^2}` },
    ],
    conditions: ['constant density', 'holds at **every instant**, also in turbulent flow', 'left side: mass × acceleration per unit volume; the only **nonlinear** terms are the convective ones'],
    use: md`The starting point for the time-averaged momentum balance (9.13): substitute (9.1) and average. Everything is linear except the convective terms $v_j\,\partial v_x/\partial x_j$.`,
    src: W('484', 'Eq. (9.9), from Wilkes Eqn. (5.72)'),
  },
  {
    id: 'conv-divergence',
    name: 'Convective terms in divergence form',
    tag: '9.10',
    tex: md`v_x\pd{v_x}{x}+v_y\pd{v_x}{y}+v_z\pd{v_x}{z}=\pd{(v_xv_x)}{x}+\pd{(v_xv_y)}{y}+\pd{(v_xv_z)}{z}`,
    vars: [
      { sym: md`v_x,\ v_y,\ v_z`, desc: 'instantaneous velocity components', units: U_MS },
      { sym: md`v_xv_y`, desc: 'velocity product (an x-momentum flux per unit mass)', units: U_M2S2 },
    ],
    conditions: ['constant density — the identity uses continuity (9.6)'],
    use: md`Puts the velocity products *inside* the derivatives, so averaging (which commutes with $\partial/\partial x$) acts directly on $v_xv_x$, $v_xv_y$, $v_xv_z$. Check: expanding the right side gives the left side plus $v_x\left(\pd{v_x}{x}+\pd{v_y}{y}+\pd{v_z}{z}\right)$, which is zero by (9.6).`,
    src: W('485', 'Eq. (9.10)'),
  },
  {
    id: 'product-expand',
    name: 'Expanding and averaging a velocity product',
    tex: md`\begin{aligned}
v_xv_y&=(\avg{v}_x+v_x')(\avg{v}_y+v_y')=\avg{v}_x\avg{v}_y+\avg{v}_xv_y'+v_x'\avg{v}_y+v_x'v_y'\\
\avg{v_xv_y}&=\avg{v}_x\,\avg{v}_y+\avg{v_x'v_y'}
\end{aligned}`,
    vars: [
      { sym: md`\avg{v}_x,\ \avg{v}_y`, desc: 'mean velocity components', units: U_MS },
      { sym: md`v_x',\ v_y'`, desc: 'velocity fluctuations', units: U_MS },
      { sym: md`\avg{v_xv_y}`, desc: 'time average of the instantaneous product', units: U_M2S2 },
      { sym: md`\avg{v_x'v_y'}`, desc: 'time average of the product of the fluctuations', units: U_M2S2 },
    ],
    conditions: [md`the cross terms vanish: $\avg{\avg{v}_xv_y'}=\avg{v}_x\avg{v_y'}=0$ and $\avg{v_x'\avg{v}_y}=0$`, md`the fluctuation product does **not** vanish in general`],
    use: md`The key averaging fact of turbulence: the average of a product equals the product of the averages **plus** the averaged product of the fluctuations.`,
    src: W('485', 'product expansion; its average as used in Eq. (9.11)'),
  },
  {
    id: 'conv-avg',
    name: 'Time-averaged convective terms',
    tag: '9.11',
    tex: md`\begin{aligned}
&\avg{\left(\pd{(\avg{v}_x\avg{v}_x+\avg{v}_xv_x'+v_x'\avg{v}_x+v_x'v_x')}{x}\right)}+\avg{\left(\pd{(\avg{v}_x\avg{v}_y+\avg{v}_xv_y'+v_x'\avg{v}_y+v_x'v_y')}{y}\right)}\\
&\quad+\avg{\left(\pd{(\avg{v}_x\avg{v}_z+\avg{v}_xv_z'+v_x'\avg{v}_z+v_x'v_z')}{z}\right)}\\
&=\pd{(\avg{v}_x\avg{v}_x)}{x}+\pd{(\avg{v}_x\avg{v}_y)}{y}+\pd{(\avg{v}_x\avg{v}_z)}{z}+\pd{(\avg{v_x'v_x'})}{x}+\pd{(\avg{v_x'v_y'})}{y}+\pd{(\avg{v_x'v_z'})}{z}
\end{aligned}`,
    vars: [
      { sym: md`\avg{v}_x,\ \avg{v}_y,\ \avg{v}_z`, desc: 'mean velocity components', units: U_MS },
      { sym: md`v_x',\ v_y',\ v_z'`, desc: 'velocity fluctuations', units: U_MS },
      { sym: md`\avg{v_x'v_x'},\ \avg{v_x'v_y'},\ \avg{v_x'v_z'}`, desc: 'averaged products of fluctuations', units: U_M2S2 },
    ],
    conditions: ['constant density', 'mean × fluctuation terms average to zero; fluctuation × fluctuation terms survive'],
    use: md`This is the time average of the right-hand side of (9.10). The first three terms describe convection by the **mean** flow; the last three are new and contain only fluctuations.`,
    src: W('485', 'Eq. (9.11)'),
  },
  {
    id: 'conv-avg-nc',
    name: 'Averaged convective terms, rephrased with (9.8)',
    tag: '9.12',
    tex: md`\begin{aligned}
\avg{\left(v_x\pd{v_x}{x}+v_y\pd{v_x}{y}+v_z\pd{v_x}{z}\right)}
&=\avg{v}_x\pd{\avg{v}_x}{x}+\avg{v}_y\pd{\avg{v}_x}{y}+\avg{v}_z\pd{\avg{v}_x}{z}\\
&\quad+\pd{(\avg{v_x'v_x'})}{x}+\pd{(\avg{v_x'v_y'})}{y}+\pd{(\avg{v_x'v_z'})}{z}
\end{aligned}`,
    vars: [
      { sym: md`\avg{v}_x,\ \avg{v}_y,\ \avg{v}_z`, desc: 'mean velocity components', units: U_MS },
      { sym: md`\avg{v_x'v_j'}`, desc: md`averaged fluctuation products ($j = x, y, z$)`, units: U_M2S2 },
    ],
    conditions: ['constant density', md`uses the time-averaged continuity equation (9.8): the extra piece $\avg{v}_x(\partial\avg{v}_x/\partial x+\partial\avg{v}_y/\partial y+\partial\avg{v}_z/\partial z)$ is zero`],
    use: md`Wilkes prints the right-hand side as Eq. (9.12); the left side is written here to show what it equals. The mean-flow part now looks exactly like the laminar convective terms, leaving the fluctuation terms as the only change.`,
    src: W('485', 'Eq. (9.12)'),
  },
  {
    id: 'rans-x',
    name: 'Time-averaged x-momentum balance',
    tag: '9.13',
    key: true,
    tex: md`\begin{aligned}
&\rho\left(\pd{\avg{v}_x}{t}+\avg{v}_x\pd{\avg{v}_x}{x}+\avg{v}_y\pd{\avg{v}_x}{y}+\avg{v}_z\pd{\avg{v}_x}{z}\right)=-\pd{\avg{p}}{x}\\
&\qquad+\pd{(\avg{\tau}_{xx}-\rho\avg{v_x'v_x'})}{x}+\pd{(\avg{\tau}_{yx}-\rho\avg{v_x'v_y'})}{y}+\pd{(\avg{\tau}_{zx}-\rho\avg{v_x'v_z'})}{z}+\rho g_x
\end{aligned}`,
    vars: [
      { sym: md`\rho`, desc: 'density (constant)', units: U_RHO },
      { sym: md`\avg{v}_x,\ \avg{v}_y,\ \avg{v}_z`, desc: 'time-averaged velocity components', units: U_MS },
      { sym: md`\avg{p}`, desc: 'time-averaged pressure', units: U_PA },
      { sym: md`\avg{\tau}_{xx},\ \avg{\tau}_{yx},\ \avg{\tau}_{zx}`, desc: "time-averaged **viscous** stresses — from Newton's law of viscosity applied to the time-averaged velocity profiles", units: U_PA },
      { sym: md`-\rho\avg{v_x'v_x'},\ -\rho\avg{v_x'v_y'},\ -\rho\avg{v_x'v_z'}`, desc: '**Reynolds (turbulent) stresses**: transport of x-momentum by the velocity fluctuations', units: U_PA },
      { sym: md`g_x`, desc: 'x-component of gravity', units: md`\mathrm{m/s^2}` },
      { sym: md`t`, desc: md`time ($\partial\avg{v}_x/\partial t=0$ for flow steady in the mean)`, units: md`\mathrm{s}` },
    ],
    conditions: ['constant density; Newtonian fluid for the mean viscous stresses', 'exact: no modelling yet — but the Reynolds stresses are **new unknowns**', 'the $y$ and $z$ balances have the same structure (p. 486)'],
    use: md`Same as the instantaneous balance (9.9) except that (1) time-averaged values replace instantaneous ones and (2) the Reynolds stresses appear as **additional stresses** next to the viscous ones. Away from walls $-\rho\avg{v_x'v_y'}\gg\avg{\tau}_{yx}$.`,
    src: W('485', 'Eq. (9.13)'),
  },
  {
    id: 'reynolds-stresses-x',
    name: 'Reynolds stresses in the x-momentum balance',
    tex: md`\tau^t_{yx}=-\rho\,\avg{v_x'v_y'}\qquad\text{together with}\qquad -\rho\,\avg{v_x'v_x'},\quad -\rho\,\avg{v_x'v_z'}`,
    vars: [
      { sym: md`\tau^t_{yx}`, desc: 'turbulent (Reynolds) shear stress; superscript $t$ = turbulence; acts in $x$ on a surface of constant $y$', units: U_PA },
      { sym: md`\rho`, desc: 'density', units: U_RHO },
      { sym: md`\avg{v_x'v_y'}`, desc: 'time average of the product of the $x$ and $y$ fluctuations', units: U_M2S2 },
      { sym: md`-\rho\avg{v_x'v_x'}`, desc: 'turbulent normal stress in $x$ (never positive)', units: U_PA },
      { sym: md`-\rho\avg{v_x'v_z'}`, desc: 'turbulent shear stress on a surface of constant $z$', units: U_PA },
    ],
    conditions: ['constant density', 'vanish in laminar flow, where there are no fluctuations', md`except very close to a wall, $\tau^t_{yx}$ is very much larger than $\avg{\tau}_{yx}$, so the viscous stress can usually be ignored (p. 486)`],
    use: md`They represent the **transport of momentum due to the turbulent velocity fluctuations**. They are unknowns: (9.13) cannot be solved until they are related to the mean flow — the subject of mixing-length theory (next topic).`,
    src: W('486', 'Reynolds stresses; τᵗyx in the text'),
  },
  {
    id: 'reynolds-tensor',
    name: 'The full Reynolds-stress tensor (all three balances)',
    tex: md`\tau^t_{ij}=-\rho\,\avg{v_i'v_j'}=-\rho\begin{pmatrix}\avg{v_x'v_x'}&\avg{v_x'v_y'}&\avg{v_x'v_z'}\\ \avg{v_y'v_x'}&\avg{v_y'v_y'}&\avg{v_y'v_z'}\\ \avg{v_z'v_x'}&\avg{v_z'v_y'}&\avg{v_z'v_z'}\end{pmatrix}`,
    vars: [
      { sym: md`i,\ j`, desc: md`indices $x, y, z$: $i$ = normal to the surface, $j$ = direction of the stress (as in $\tau_{yx}$)`, units: md`\text{–}` },
      { sym: md`\avg{v_i'v_j'}`, desc: 'averaged products of velocity fluctuations', units: U_M2S2 },
      { sym: md`\tau^t_{ij}`, desc: 'Reynolds-stress components', units: U_PA },
    ],
    conditions: [md`symmetric, $\avg{v_x'v_y'}=\avg{v_y'v_x'}$: only **6 independent** components`, md`diagonal (normal) components $-\rho\avg{v_i'v_i'}\le 0$ act like an extra pressure`],
    use: md`Each momentum balance uses one column: the x-balance (9.13) uses $j=x$. Wilkes notes that the $y$ and $z$ balances "give similar results" (p. 486); the matrix simply collects all of them.`,
  },
  {
    id: 'rans-general',
    name: 'All three time-averaged momentum balances (index form)',
    tex: md`\rho\left(\pd{\avg{v}_j}{t}+\avg{v}_i\pd{\avg{v}_j}{x_i}\right)=-\pd{\avg{p}}{x_j}+\pd{}{x_i}\left(\avg{\tau}_{ij}-\rho\,\avg{v_i'v_j'}\right)+\rho g_j`,
    vars: [
      { sym: md`j`, desc: md`component of the balance ($x$, $y$ or $z$)`, units: md`\text{–}` },
      { sym: md`i`, desc: md`summation index: a repeated $i$ is summed over $x, y, z$`, units: md`\text{–}` },
      { sym: md`x_i`, desc: 'coordinates $x, y, z$', units: U_M },
      { sym: md`\avg{v}_j,\ \avg{p}`, desc: 'mean velocity component and mean pressure', units: md`\mathrm{m/s},\ \mathrm{Pa}` },
      { sym: md`\avg{\tau}_{ij}`, desc: 'mean viscous stresses', units: U_PA },
      { sym: md`-\rho\avg{v_i'v_j'}`, desc: 'Reynolds stresses', units: U_PA },
      { sym: md`\rho,\ g_j`, desc: 'density; gravity component', units: md`\mathrm{kg/m^3},\ \mathrm{m/s^2}` },
    ],
    conditions: ['constant density', md`summation convention over $i$; setting $j=x$ reproduces (9.13) term by term`],
    use: md`A compact way to remember (9.13) and its $y$, $z$ partners — widely called the **Reynolds-averaged Navier–Stokes (RANS) equations** (Wilkes calls them the time-averaged momentum balances).`,
  },
  {
    id: 'mean-product-discrete',
    name: 'Averaged product from N equally spaced samples',
    tex: md`\avg{v_x'v_y'}\approx\frac{1}{N}\sum_{k=1}^{N}v_{x,k}'\,v_{y,k}'`,
    vars: [
      { sym: md`N`, desc: 'number of equally weighted instants (samples)', units: md`\text{–}` },
      { sym: md`v_{x,k}',\ v_{y,k}'`, desc: 'fluctuations at instant $k$', units: U_MS },
      { sym: md`\avg{v_x'v_y'}`, desc: 'time-averaged product', units: U_M2S2 },
    ],
    conditions: ['samples equally spaced over a period long compared with the fluctuations', md`becomes the exact (integral) time average as $N\to\infty$`],
    use: md`Exactly what Example 9.1 does with $N=4$, e.g. $(1+1+1+1)/4=1$. Hot-wire and laser-Doppler records are processed the same way.`,
  },
  {
    id: 'correlation-coef',
    name: 'Correlation coefficient of two velocity fluctuations',
    tex: md`r_{xy}=\frac{\avg{v_x'v_y'}}{\widetilde{v_x'}\;\widetilde{v_y'}},\qquad -1\le r_{xy}\le 1\quad\Rightarrow\quad \left|\avg{v_x'v_y'}\right|\le\widetilde{v_x'}\,\widetilde{v_y'}`,
    vars: [
      { sym: md`r_{xy}`, desc: 'correlation coefficient (dimensionless)', units: md`\text{–}` },
      { sym: md`\widetilde{v_x'}=\sqrt{\avg{v_x'^2}}`, desc: 'RMS (root-mean-square) of the fluctuation, Wilkes Eq. (9.5)', units: U_MS },
      { sym: md`\avg{v_x'v_y'}`, desc: 'averaged product of the fluctuations', units: U_M2S2 },
    ],
    conditions: [
      md`fluctuations with zero mean (9.2)`,
      md`$r_{xy}=+1$: perfectly "in concert"; $-1$: perfectly "opposed"; independent fluctuations give $0$`,
    ],
    use: md`Separates *how strong* the fluctuations are (RMS values) from *how well they are linked* ($r_{xy}$): $\tau^t_{yx}=-\rho\,r_{xy}\,\widetilde{v_x'}\,\widetilde{v_y'}$. Do not confuse it with Wilkes's $R$ in Eq. (9.20), which correlates $v_y'$ with an eddy displacement (mixing-length topic).`,
  },
  {
    id: 'flux-inst',
    name: 'Instantaneous upward flux of x-momentum across X–X',
    tag: '9.14',
    tex: md`\rho\,v_y'\,(\avg{v}_x+v_x')`,
    vars: [
      { sym: md`\rho`, desc: 'density', units: U_RHO },
      { sym: md`v_y'`, desc: md`eddy velocity normal to X–X; with $\avg{v}_y=0$ it is the whole $y$-velocity = volume crossing per unit area per unit time`, units: md`\mathrm{m^3/(m^2\,s)}=\mathrm{m/s}` },
      { sym: md`\avg{v}_x+v_x'`, desc: 'instantaneous x-velocity of the eddy', units: U_MS },
      { sym: md`\rho(\avg{v}_x+v_x')`, desc: 'x-momentum per unit volume', units: md`\mathrm{kg/(m^2\,s)}` },
      { sym: md`\rho v_y'(\avg{v}_x+v_x')`, desc: 'x-momentum crossing per unit area per unit time, from below X–X to above it', units: md`\mathrm{N/m^2}=\mathrm{Pa}` },
    ],
    conditions: [md`two-dimensional flow with $v_x=\avg{v}_x+v_x'$ and $v_y=0+v_y'$ — no overall motion in $y$`, 'per unit area of the plane X–X'],
    use: md`(momentum per unit volume) × (volume crossing per unit area per unit time) = momentum crossing per unit area per unit time — a momentum flux, with the units of stress.`,
    src: W('487', 'Eq. (9.14)'),
  },
  {
    id: 'flux-avg',
    name: 'Time-averaged upward flux of x-momentum',
    tag: '9.15',
    tex: md`\avg{\rho v_y'(\avg{v}_x+v_x')}=\avg{\rho v_y'}\,\avg{v}_x+\avg{\rho v_y'v_x'}=0+\rho\,\avg{v_y'v_x'}`,
    vars: [
      { sym: md`\avg{\rho v_y'}\,\avg{v}_x`, desc: md`mean-flow part: zero, since $\avg{v_y'}=0$ (9.2) and $\rho$, $\avg{v}_x$ are constant during the averaging`, units: U_PA },
      { sym: md`\rho\avg{v_y'v_x'}`, desc: 'correlation part: the net upward flux of x-momentum per unit area', units: U_PA },
    ],
    conditions: ['fluid crossing X–X from **either** above or below, at all possible velocities', 'same assumptions as (9.14)'],
    use: md`As much fluid goes up as comes down, so the mean velocity $\avg{v}_x$ carries no net momentum across the plane; only the correlation between $v_y'$ and $v_x'$ survives.`,
    src: W('487', 'Eq. (9.15)'),
  },
  {
    id: 'reynolds-shear',
    name: 'Turbulent (Reynolds) shear stress',
    tag: '9.16',
    key: true,
    tex: md`\tau^t_{yx}=-\rho\,\avg{v_y'v_x'}`,
    vars: [
      { sym: md`\tau^t_{yx}`, desc: md`turbulent shear stress acting in $x$ on a surface of constant $y$; positive in $+x$ on the upper face (box in Fig. 9.4)`, units: U_PA },
      { sym: md`\rho`, desc: 'density', units: U_RHO },
      { sym: md`\avg{v_y'v_x'}=\avg{v_x'v_y'}`, desc: 'averaged product of the fluctuations', units: U_M2S2 },
    ],
    conditions: ['same assumptions as (9.14)–(9.15)', md`sign convention (Wilkes Fig. 5.12 and Fig. 9.4): a positive shear stress corresponds to transfer of x-momentum from **above** X–X to **below** it, i.e. toward $-y$`],
    use: md`The minus sign converts the *upward* momentum flux $\rho\avg{v_y'v_x'}$ into the conventional stress. In a shear flow with $d\avg{v}_x/dy>0$, $v_x'$ and $v_y'$ are anti-correlated, so $\tau^t_{yx}>0$ — the same sign as the viscous stress $\mu\,d\avg{v}_x/dy$.`,
    src: [W('487', 'Eq. (9.16)'), W('486', 'same expression in the text')],
  },
  {
    id: 'total-shear',
    name: 'Total shear stress in a mean shear flow',
    tex: md`\tau_{\text{total}}=\avg{\tau}_{yx}+\tau^t_{yx}=\mu\,\frac{d\avg{v}_x}{dy}-\rho\,\avg{v_x'v_y'}`,
    vars: [
      { sym: md`\tau_{\text{total}}`, desc: 'total (viscous + turbulent) shear stress on a surface of constant $y$', units: U_PA },
      { sym: md`\avg{\tau}_{yx}=\mu\,d\avg{v}_x/dy`, desc: "viscous (molecular) shear stress: Newton's law applied to the mean profile", units: U_PA },
      { sym: md`\mu`, desc: 'dynamic viscosity', units: md`\mathrm{Pa\,s}` },
      { sym: md`\avg{v}_x(y)`, desc: 'mean velocity profile', units: U_MS },
      { sym: md`y`, desc: 'coordinate normal to the mean flow (e.g. distance from a wall)', units: U_M },
      { sym: md`\tau^t_{yx}=-\rho\avg{v_x'v_y'}`, desc: 'Reynolds shear stress', units: U_PA },
    ],
    conditions: [md`mean flow $\avg{v}_x(y)$ only, $\avg{v}_y=0$ (e.g. fully developed channel or pipe flow)`, 'Newtonian fluid, constant density'],
    use: md`This is the bracket $(\avg{\tau}_{yx}-\rho\avg{v_x'v_y'})$ differentiated in (9.13). Near a wall the viscous part dominates; away from walls the turbulent part does. **Fox notation (cross-reference):** $\tau=\tau_{\mathrm{lam}}+\tau_{\mathrm{turb}}=\mu\,d\bar u/dy-\rho\overline{u'v'}$, Fox Eq. (8.17), with $u\equiv v_x$, $v\equiv v_y$.`,
    src: [W('485', 'bracket in Eq. (9.13); mean viscous stress from Newton’s law'), FOX('293', 'Eq. (8.17), cross-reference')],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Solved examples
// ─────────────────────────────────────────────────────────────────────────────
export const examples: ExampleDef[] = [
  {
    id: 'ex-mean-duct',
    concept: 'averaged-continuity',
    title: 'Mean transverse velocity in a converging channel',
    difficulty: 1,
    given: md`Turbulent water flow accelerates through a planar converging channel. Measurements give the mean axial velocity $\avg{v}_x=U_0(1+x/L)$ with $U_0=2.0$ m/s and $L=0.50$ m, independent of $y$ and $z$. There is no mean motion in $z$, and $\avg{v}_y=0$ on the centre-plane $y=0$ (symmetry).`,
    find: md`The mean transverse velocity $\avg{v}_y(x,y)$, and its value at $y=0.05$ m.`,
    assumptions: 'Constant density; flow steady in the mean; averaging period long compared with the fluctuations.',
    steps: [
      { title: 'Choose the equation', md: md`The instantaneous velocities fluctuate, but the **time-averaged** continuity equation (9.8) contains only mean velocities: $\pd{\avg{v}_x}{x}+\pd{\avg{v}_y}{y}+\pd{\avg{v}_z}{z}=0$.` },
      { title: 'Known derivatives', md: md`$\pd{\avg{v}_x}{x}=\dfrac{U_0}{L}=\dfrac{2.0\ \text{m/s}}{0.50\ \text{m}}=4.0\ \text{s}^{-1}$ and $\pd{\avg{v}_z}{z}=0$.` },
      { title: 'Integrate across the channel', md: md`$\pd{\avg{v}_y}{y}=-4.0\ \text{s}^{-1}\ \Rightarrow\ \avg{v}_y=-4.0\,y+f(x)$. The symmetry condition $\avg{v}_y(x,0)=0$ gives $f(x)=0$.` },
      { title: 'Evaluate', md: md`At $y=0.05$ m: $\avg{v}_y=-(4.0\ \text{s}^{-1})(0.05\ \text{m})=-0.20$ m/s — directed toward the centre-plane, as a converging flow should be.` },
    ],
    answer: md`$\avg{v}_y=-(U_0/L)\,y=-4.0\,y$ (m/s, $y$ in m); $\avg{v}_y=-0.20$ m/s at $y=0.05$ m.`,
    insight: md`Because continuity is linear, the mean field obeys exactly the laminar-looking equation (9.8) — treat mean velocities just like ordinary velocities here.`,
  },
  {
    id: 'ex-commute',
    concept: 'averaged-continuity',
    title: 'Average of the derivative = derivative of the average',
    difficulty: 2,
    given: md`Four equally spaced, simultaneous samples of $v_x$ (m/s) at two stations a distance $\Delta x=0.10$ m apart:

| instant | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| station 1 (at $x$) | 2.1 | 1.8 | 2.3 | 1.8 |
| station 2 (at $x+\Delta x$) | 2.4 | 2.3 | 2.1 | 2.4 |`,
    find: md`(a) $\avg{v}_x$ at each station and $\partial\avg{v}_x/\partial x$; (b) the finite-difference $\partial v_x/\partial x$ at each instant and its time average; (c) the fluctuations at station 1 and their average.`,
    steps: [
      { title: 'Means first', md: md`Station 1: $\avg{v}_x=(2.1+1.8+2.3+1.8)/4=2.0$ m/s. Station 2: $(2.4+2.3+2.1+2.4)/4=2.3$ m/s. Hence $\partial\avg{v}_x/\partial x\approx(2.3-2.0)/0.10=3.0\ \text{s}^{-1}$.` },
      { title: 'Derivatives first', md: md`At the four instants: $(2.4-2.1)/0.10=3.0$, $(2.3-1.8)/0.10=5.0$, $(2.1-2.3)/0.10=-2.0$, $(2.4-1.8)/0.10=6.0$ (s⁻¹). Their average: $(3.0+5.0-2.0+6.0)/4=3.0\ \text{s}^{-1}$.` },
      { title: 'Compare', md: md`Both routes give $3.0\ \text{s}^{-1}$: $\avg{(\partial v_x/\partial x)}=\partial\avg{v}_x/\partial x$ — step 1 of p. 484. A difference quotient is linear, just like a derivative, so the agreement is exact.` },
      { title: 'Fluctuations', md: md`At station 1: $v_x'=v_x-\avg{v}_x=+0.1,\ -0.2,\ +0.3,\ -0.2$ m/s, whose average is $0$, as (9.2) requires.` },
    ],
    answer: md`(a) $2.0$ and $2.3$ m/s; $\partial\avg{v}_x/\partial x=3.0\ \text{s}^{-1}$. (b) $3.0,\ 5.0,\ -2.0,\ 6.0\ \text{s}^{-1}$, average $3.0\ \text{s}^{-1}$. (c) $+0.1,\ -0.2,\ +0.3,\ -0.2$ m/s, average $0$.`,
    insight: 'Linear operations (sums, derivatives, difference quotients) commute with time-averaging — that is all the time-averaged continuity equation needs.',
  },
  {
    id: 'ex-product-avg',
    concept: 'averaged-momentum',
    title: 'Averaging a velocity product term by term',
    difficulty: 2,
    given: md`Four equally spaced samples at one point in a turbulent water flow ($\rho=1000$ kg/m³): $v_x=2.3,\ 1.8,\ 2.2,\ 1.7$ m/s and, at the same instants, $v_y=-0.05,\ 0.25,\ -0.15,\ 0.15$ m/s. (Four samples are far too few for a real measurement — they just make the arithmetic visible.)`,
    find: md`$\avg{v}_x$, $\avg{v}_y$, $\avg{v_xv_y}$, the averages of the four terms of $(\avg{v}_x+v_x')(\avg{v}_y+v_y')$, and the Reynolds stress $\tau^t_{yx}$.`,
    steps: [
      { title: 'Means', md: md`$\avg{v}_x=(2.3+1.8+2.2+1.7)/4=2.0$ m/s; $\avg{v}_y=(-0.05+0.25-0.15+0.15)/4=0.05$ m/s.` },
      { title: 'Fluctuations', md: md`$v_x'=+0.3,\ -0.2,\ +0.2,\ -0.3$ m/s and $v_y'=-0.1,\ +0.2,\ -0.2,\ +0.1$ m/s; each set averages to zero.` },
      { title: 'Average of the full product', md: md`$v_xv_y=-0.115,\ 0.450,\ -0.330,\ 0.255$ m²/s², so $\avg{v_xv_y}=0.260/4=0.065$ m²/s². Compare $\avg{v}_x\avg{v}_y=(2.0)(0.05)=0.100$ m²/s² — **not** the same.` },
      { title: 'Term by term', md: md`$\avg{\avg{v}_x\avg{v}_y}=0.100$; $\ \avg{\avg{v}_xv_y'}=\avg{v}_x\avg{v_y'}=0$; $\ \avg{v_x'\avg{v}_y}=0$; $\ v_x'v_y'=-0.03,\ -0.04,\ -0.04,\ -0.03$, so $\avg{v_x'v_y'}=-0.035$ m²/s². Sum: $0.100+0+0-0.035=0.065$ m²/s² ✓.` },
      { title: 'Reynolds stress', md: md`$\tau^t_{yx}=-\rho\avg{v_x'v_y'}=-(1000)(-0.035)=+35$ Pa.` },
    ],
    answer: md`$\avg{v}_x=2.0$ m/s, $\avg{v}_y=0.05$ m/s; $\avg{v_xv_y}=0.065$ m²/s² $=\avg{v}_x\avg{v}_y+\avg{v_x'v_y'}=0.100-0.035$; $\tau^t_{yx}=+35$ Pa.`,
    insight: md`The cross terms vanish, but $\avg{v_x'v_y'}$ survives: the average of a product differs from the product of the averages by exactly the averaged fluctuation product.`,
  },
  {
    id: 'ex-stress-compare',
    concept: 'averaged-momentum',
    title: 'How large is a Reynolds stress compared with the viscous stress?',
    difficulty: 1,
    given: md`Air ($\rho=1.2$ kg/m³, $\mu=1.8\times10^{-5}$ Pa·s) flows turbulently in a duct. At a point away from the walls the mean velocity gradient is $d\avg{v}_x/dy=50\ \text{s}^{-1}$ and hot-wire measurements give $\avg{v_x'v_y'}=-0.040$ m²/s².`,
    find: md`The mean viscous stress $\avg{\tau}_{yx}$, the Reynolds stress $\tau^t_{yx}$ and their ratio.`,
    assumptions: md`Newtonian fluid; mean flow $\avg{v}_x(y)$ only, so Newton's law on the mean profile gives $\avg{\tau}_{yx}=\mu\,d\avg{v}_x/dy$.`,
    steps: [
      { title: 'Viscous stress', md: md`$\avg{\tau}_{yx}=\mu\dfrac{d\avg{v}_x}{dy}=(1.8\times10^{-5}\ \text{Pa s})(50\ \text{s}^{-1})=9.0\times10^{-4}$ Pa.` },
      { title: 'Reynolds stress', md: md`$\tau^t_{yx}=-\rho\avg{v_x'v_y'}=-(1.2)(-0.040)=0.048$ Pa.` },
      { title: 'Ratio', md: md`$\tau^t_{yx}/\avg{\tau}_{yx}=0.048/(9.0\times10^{-4})\approx53$.` },
      { title: 'Interpret', md: md`The turbulent stress is about 50 times the viscous one — Wilkes's point (p. 486) that, except very close to a wall, the viscous stress can be ignored in most situations. Right at a wall the fluctuations are damped and the comparison reverses.` },
    ],
    answer: md`$\avg{\tau}_{yx}=9.0\times10^{-4}$ Pa, $\tau^t_{yx}=0.048$ Pa, ratio $\approx53$.`,
    insight: 'A small turbulence intensity does not mean a small Reynolds stress: ρ·v′² easily beats μ·dv̄/dy.',
  },
  {
    id: 'ex-91',
    concept: 'reynolds-stress-example',
    title: 'Example 9.1 — Numerical illustration of a Reynolds stress term',
    src: W('486–487', 'Example 9.1, Table E9.1'),
    difficulty: 1,
    given: md`A hypothetical situation in which only "quantum" values of the fluctuations are allowed: each of $v_x'$ and $v_y'$ can only be $-1$ (low) or $+1$ (high). Table E9.1 lists three possible patterns over four instants (recreated in the visual step above).`,
    find: md`The possible values of the time-averaged product $\avg{v_x'v_y'}$ that appears in a typical Reynolds stress.`,
    steps: [
      { title: 'Classify the patterns', md: md`In two of the column groups of Table E9.1 the fluctuations are **correlated**; in the third they are **independent** of each other. In every group $v_x'$ and $v_y'$ each average to zero, as fluctuations must (9.2).` },
      { title: 'Case 1 — in concert', md: md`High values occur together, and so do low values: every product is $+1$, so $\avg{v_x'v_y'}=(1+1+1+1)/4=1$ — nonzero.` },
      { title: 'Case 2 — opposed', md: md`A high value of one occurs with a low value of the other: every product is $-1$, so $\avg{v_x'v_y'}=(-1-1-1-1)/4=-1$ — also nonzero.` },
      { title: 'Case 3 — independent', md: md`All four sign combinations occur once: $\avg{v_x'v_y'}=(1-1-1+1)/4=0$.` },
      { title: 'Conclusion', md: md`The Reynolds stresses are nonzero only when there is some degree of **correlation** between the fluctuations in the different coordinate directions — and such correlations *do* tend to occur in turbulent flow. A statistical treatment with a continuous distribution of velocities would not change this main conclusion.` },
    ],
    answer: md`$\avg{v_x'v_y'}=1$ (correlated, in concert), $-1$ (correlated, opposed) and $0$ (independent).`,
    insight: md`Each fluctuation averages to zero on its own; whether $-\rho\avg{v_x'v_y'}$ survives depends only on whether they move together.`,
  },
  {
    id: 'ex-partial',
    concept: 'reynolds-stress-example',
    title: 'Partly correlated quantum fluctuations — with real units',
    difficulty: 2,
    given: md`Extend Example 9.1: $v_x'=\pm q$ equally often, with $q=0.10$ m/s. For 75 % of the instants $v_y'=-v_x'$ (opposed) and for the other 25 % $v_y'=+v_x'$ (in concert), independently of the sign of $v_x'$. The fluid is water, $\rho=1000$ kg/m³.`,
    find: md`$\avg{v_x'v_y'}$, the correlation coefficient $r_{xy}$ and the Reynolds stress $\tau^t_{yx}$.`,
    steps: [
      { title: 'Check (9.2)', md: md`$v_x'$ is $\pm q$ equally often, and the opposed/in-concert choice does not depend on its sign, so $v_y'$ is also $\pm q$ equally often: $\avg{v_x'}=\avg{v_y'}=0$.` },
      { title: 'Products', md: md`Opposed instants give $v_x'v_y'=-q^2$; in-concert instants give $+q^2$.` },
      { title: 'Weighted average', md: md`$\avg{v_x'v_y'}=0.25(+q^2)+0.75(-q^2)=-0.5\,q^2=-0.5\,(0.10)^2=-0.0050$ m²/s².` },
      { title: 'Correlation coefficient', md: md`Both RMS values equal $q$, so $r_{xy}=\avg{v_x'v_y'}/(q\cdot q)=-0.5$ — halfway between independent ($0$) and fully opposed ($-1$).` },
      { title: 'Reynolds stress', md: md`$\tau^t_{yx}=-\rho\avg{v_x'v_y'}=-(1000)(-0.0050)=+5.0$ Pa.` },
    ],
    answer: md`$\avg{v_x'v_y'}=-0.0050$ m²/s², $r_{xy}=-0.5$, $\tau^t_{yx}=+5.0$ Pa.`,
    insight: 'Real turbulence is only partly correlated; the Reynolds stress is proportional to how strongly the fluctuations are linked, not just to how large they are.',
  },
  {
    id: 'ex-eddy-tally',
    concept: 'physical-interpretation',
    title: 'Momentum bookkeeping for four eddies crossing X–X',
    difficulty: 2,
    given: md`Air ($\rho=1.2$ kg/m³) flows with mean velocity $\avg{v}_x=5.0$ m/s at the plane X–X, with no mean motion in $y$. Four eddies cross a unit area of X–X at equally spaced instants, with $(v_y',\,v_x')$ in m/s: $(+0.4,\,-0.3)$, $(-0.4,\,+0.3)$, $(+0.2,\,-0.1)$, $(-0.2,\,+0.1)$.`,
    find: md`The instantaneous upward x-momentum fluxes (9.14), their time average (9.15), and $\tau^t_{yx}$ (9.16).`,
    steps: [
      { title: 'Instantaneous fluxes (9.14)', md: md`$\rho v_y'(\avg{v}_x+v_x')$: $\ 1.2(0.4)(4.7)=2.256$; $\ 1.2(-0.4)(5.3)=-2.544$; $\ 1.2(0.2)(4.9)=1.176$; $\ 1.2(-0.2)(5.1)=-1.224$ (all in Pa).` },
      { title: 'Average (9.15)', md: md`$(2.256-2.544+1.176-1.224)/4=-0.336/4=-0.084$ Pa: a net **downward** transport of x-momentum.` },
      { title: 'Split into the two parts', md: md`Mean-flow part: $\rho\avg{v_y'}\,\avg{v}_x=1.2(0)(5.0)=0$ — as much fluid goes up as comes down. Correlation part: $v_y'v_x'=-0.12,\ -0.12,\ -0.02,\ -0.02$ m²/s², so $\rho\avg{v_y'v_x'}=1.2(-0.07)=-0.084$ Pa — all of the net flux.` },
      { title: 'Reynolds stress (9.16)', md: md`$\tau^t_{yx}=-\rho\avg{v_y'v_x'}=+0.084$ Pa: positive, i.e. x-momentum is transferred from above X–X to below it.` },
    ],
    answer: md`Fluxes $2.256,\ -2.544,\ 1.176,\ -1.224$ Pa; average $-0.084$ Pa (downward); $\tau^t_{yx}=+0.084$ Pa.`,
    insight: md`The large $\pm2$ Pa fluxes carried by the mean velocity cancel exactly; the small remainder comes entirely from the correlation of $v_y'$ with $v_x'$.`,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Practice
// ─────────────────────────────────────────────────────────────────────────────
export const practice: PracticeDef[] = [
  // ── averaged-continuity
  {
    id: 'pr-cont-vz',
    concept: 'averaged-continuity',
    difficulty: 1,
    q: md`A turbulent flow has measured mean velocity components $\avg{v}_x=2x$ and $\avg{v}_y=3y$ (m/s, with $x$ and $y$ in m). The mean velocity $\avg{v}_z$ is zero on the plane $z=0$. Use the time-averaged continuity equation to find $\avg{v}_z(z)$ and evaluate it at $z=0.2$ m.`,
    hint: md`Equation (9.8): the three mean-velocity derivatives must add up to zero.`,
    answer: md`$\avg{v}_z=-5z$; $\ \avg{v}_z=-1.0$ m/s at $z=0.2$ m.`,
    solution: md`From (9.8), $\pd{\avg{v}_z}{z}=-\left(\pd{\avg{v}_x}{x}+\pd{\avg{v}_y}{y}\right)=-(2+3)=-5\ \text{s}^{-1}$.

Integrating, $\avg{v}_z=-5z+f(x,y)$; the condition $\avg{v}_z=0$ at $z=0$ gives $f=0$.

At $z=0.2$ m: $\avg{v}_z=-5(0.2)=-1.0$ m/s.`,
    check: [{ label: md`$\avg{v}_z$ at $z=0.2$ m`, value: -1.0, units: U_MS }],
  },
  {
    id: 'pr-cont-fd',
    concept: 'averaged-continuity',
    difficulty: 2,
    q: md`Simultaneous measurements of $v_x$ (m/s) at four equally spaced instants at two stations $0.05$ m apart along $x$:

| instant | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| station 1 | 1.20 | 1.50 | 1.10 | 1.40 |
| station 2 | 1.36 | 1.58 | 1.33 | 1.49 |

(a) Find $\avg{v}_x$ at each station and the finite-difference estimate of $\partial\avg{v}_x/\partial x$. (b) Find the finite-difference $\partial v_x/\partial x$ at each instant and average the four values. (c) Which averaging rule does the agreement illustrate?`,
    hint: 'A difference quotient is a linear operation, just like a derivative.',
    answer: md`(a) $1.30$ and $1.44$ m/s, $\partial\avg{v}_x/\partial x\approx2.8\ \text{s}^{-1}$; (b) $3.2,\ 1.6,\ 4.6,\ 1.8\ \text{s}^{-1}$, average $2.8\ \text{s}^{-1}$; (c) the average of a derivative equals the derivative of the average.`,
    solution: md`(a) Station 1: $(1.20+1.50+1.10+1.40)/4=1.30$ m/s. Station 2: $(1.36+1.58+1.33+1.49)/4=1.44$ m/s. So $\partial\avg{v}_x/\partial x\approx(1.44-1.30)/0.05=2.8\ \text{s}^{-1}$.

(b) $(1.36-1.20)/0.05=3.2$; $(1.58-1.50)/0.05=1.6$; $(1.33-1.10)/0.05=4.6$; $(1.49-1.40)/0.05=1.8$ (s⁻¹). Average: $(3.2+1.6+4.6+1.8)/4=2.8\ \text{s}^{-1}$.

(c) Step 1 of p. 484 — the time average of a (partial) derivative equals the derivative of the time average — together with step 2 (the average of a sum or difference is the sum or difference of the averages).`,
    check: [{ label: md`$\partial\avg{v}_x/\partial x$`, value: 2.8, units: md`\mathrm{s^{-1}}` }],
  },
  {
    id: 'pr-cont-fluct',
    concept: 'averaged-continuity',
    difficulty: 2,
    q: md`A model two-dimensional velocity fluctuation in a constant-density flow is $v_x'=\varepsilon\sin(kx)\cos(\omega t)$, with $v_z'=0$ and no $z$-dependence. (a) Find $v_y'$ such that the fluctuating field satisfies continuity and $v_y'=0$ on $y=0$. (b) Show that $\avg{v_y'}=0$ when averaged over whole periods. (c) For $\varepsilon=0.2$ m/s and $k=10$ m⁻¹, find the amplitude of $v_y'$ at $x=0$, $y=0.05$ m.`,
    hint: md`Subtracting (9.8) from (9.6) shows that the fluctuations satisfy $\pd{v_x'}{x}+\pd{v_y'}{y}+\pd{v_z'}{z}=0$.`,
    answer: md`(a) $v_y'=-\varepsilon k\,y\cos(kx)\cos(\omega t)$; (b) $\avg{\cos\omega t}=0$ over whole periods; (c) amplitude $0.10$ m/s.`,
    solution: md`(a) $\pd{v_y'}{y}=-\pd{v_x'}{x}=-\varepsilon k\cos(kx)\cos(\omega t)$. Integrating in $y$ with $v_y'(y=0)=0$ gives $v_y'=-\varepsilon k\,y\cos(kx)\cos(\omega t)$.

(b) Over a whole number of periods $\avg{\cos(\omega t)}=0$, so $\avg{v_y'}=0$ (and likewise $\avg{v_x'}=0$), consistent with (9.2).

(c) Amplitude $=\varepsilon k\,y\cos(0)=(0.2)(10)(0.05)=0.10$ m/s.`,
    check: [{ label: md`amplitude of $v_y'$`, value: 0.1, units: U_MS }],
  },
  // ── averaged-momentum
  {
    id: 'pr-mom-products',
    concept: 'averaged-momentum',
    difficulty: 2,
    q: md`At a point in a turbulent water flow ($\rho=998$ kg/m³) six equally spaced samples of $(v_x,\,v_y)$ in m/s are $(3.10,\,0.05)$, $(2.80,\,0.20)$, $(3.25,\,-0.10)$, $(2.90,\,0.15)$, $(3.15,\,-0.05)$, $(2.80,\,0.05)$. Find $\avg{v}_x$, $\avg{v}_y$, $\avg{v_x'v_y'}$, $\avg{v_xv_y}$ and the Reynolds stress $\tau^t_{yx}$.`,
    hint: md`Subtract the means first; then check with $\avg{v_xv_y}=\avg{v}_x\avg{v}_y+\avg{v_x'v_y'}$.`,
    answer: md`$\avg{v}_x=3.00$ m/s, $\avg{v}_y=0.050$ m/s, $\avg{v_x'v_y'}=-0.0154$ m²/s², $\avg{v_xv_y}=0.1346$ m²/s², $\tau^t_{yx}\approx15.4$ Pa.`,
    solution: md`**Means:** $\avg{v}_x=18.00/6=3.00$ m/s and $\avg{v}_y=0.30/6=0.050$ m/s.

**Fluctuations:** $v_x'=0.10,\ -0.20,\ 0.25,\ -0.10,\ 0.15,\ -0.20$ and $v_y'=0,\ 0.15,\ -0.15,\ 0.10,\ -0.10,\ 0$ (m/s); both sets sum to zero.

**Products** $v_x'v_y'$: $0,\ -0.0300,\ -0.0375,\ -0.0100,\ -0.0150,\ 0$; sum $-0.0925$, so $\avg{v_x'v_y'}=-0.0925/6=-0.01542$ m²/s².

**Check:** $v_xv_y=0.155,\ 0.560,\ -0.325,\ 0.435,\ -0.1575,\ 0.140$; sum $0.8075$, so $\avg{v_xv_y}=0.13458$ m²/s², which equals $\avg{v}_x\avg{v}_y+\avg{v_x'v_y'}=0.150-0.01542$ ✓.

**Reynolds stress:** $\tau^t_{yx}=-\rho\avg{v_x'v_y'}=-(998)(-0.01542)=15.4$ Pa.`,
    check: [
      { label: md`$\avg{v_x'v_y'}$`, value: -0.01542, units: U_M2S2 },
      { label: md`$\tau^t_{yx}$`, value: 15.39, units: U_PA },
    ],
  },
  {
    id: 'pr-mom-normal',
    concept: 'averaged-momentum',
    difficulty: 2,
    q: md`In a turbulent air stream ($\rho=1.20$ kg/m³) the mean velocity is $\avg{v}_x=15$ m/s and the RMS fluctuation is $\widetilde{v_x'}=0.90$ m/s. (a) What is the turbulence intensity, and is it typical? (b) Find $\avg{v_xv_x}$. (c) Find the normal Reynolds stress $-\rho\avg{v_x'v_x'}$ that appears in (9.13).`,
    hint: md`Use $\widetilde{v'}=\sqrt{\avg{v'^2}}$ (9.5) and the product rule $\avg{v_xv_x}=\avg{v}_x^{\,2}+\avg{v_x'v_x'}$.`,
    answer: md`(a) $0.060$ (6 %), inside the typical 1–10 %; (b) $225.81$ m²/s²; (c) $-0.972$ Pa.`,
    solution: md`(a) Intensity $=\widetilde{v_x'}/\avg{v}_x=0.90/15=0.060$, i.e. 6 % — inside the typical range 0.01–0.1 of (9.4).

(b) $\avg{v_x'v_x'}=\widetilde{v_x'}^{\,2}=0.81$ m²/s², and the cross terms average to zero, so $\avg{v_xv_x}=\avg{v}_x^{\,2}+\avg{v_x'v_x'}=225+0.81=225.81$ m²/s².

(c) $-\rho\avg{v_x'v_x'}=-(1.20)(0.81)=-0.972$ Pa. A normal Reynolds stress is never positive; in (9.13) it combines with the pressure term as $-\partial(\avg{p}+\rho\avg{v_x'v_x'})/\partial x$, i.e. it acts like an extra pressure of $0.972$ Pa.`,
    check: [{ label: 'normal Reynolds stress', value: -0.972, units: U_PA }],
  },
  {
    id: 'pr-mom-ratio',
    concept: 'averaged-momentum',
    difficulty: 1,
    q: md`In the core of a turbulent water flow ($\mu=1.0\times10^{-3}$ Pa·s, $\rho=1000$ kg/m³) the mean velocity gradient is $d\avg{v}_x/dy=25\ \text{s}^{-1}$ and $\avg{v_x'v_y'}=-1.6\times10^{-3}$ m²/s². Find $\avg{\tau}_{yx}$, $\tau^t_{yx}$ and the ratio $\tau^t_{yx}/\avg{\tau}_{yx}$.`,
    hint: md`Newton's law on the mean profile for the viscous part; (9.16) for the turbulent part.`,
    answer: md`$\avg{\tau}_{yx}=0.025$ Pa, $\tau^t_{yx}=1.6$ Pa, ratio $=64$.`,
    solution: md`$\avg{\tau}_{yx}=\mu\,d\avg{v}_x/dy=(1.0\times10^{-3})(25)=0.025$ Pa.

$\tau^t_{yx}=-\rho\avg{v_x'v_y'}=-(1000)(-1.6\times10^{-3})=1.6$ Pa.

Ratio $=1.6/0.025=64$: the viscous stress is negligible here, as Wilkes states for regions away from walls (p. 486).`,
    check: [{ label: md`ratio $\tau^t_{yx}/\avg{\tau}_{yx}$`, value: 64 }],
  },
  {
    id: 'pr-mom-y',
    concept: 'averaged-momentum',
    difficulty: 3,
    q: md`Wilkes states that the time-averaged $y$ and $z$ momentum balances "give similar results". Write the time-averaged **$y$**-momentum balance by analogy with (9.13), list the Reynolds stresses that appear in it, and identify the one it shares with the $x$-balance.`,
    hint: md`The $y$-balance transports $v_y$, so every averaged fluctuation product contains $v_y'$.`,
    answer: md`$\rho\left(\partial_t\avg{v}_y+\avg{v}_x\partial_x\avg{v}_y+\avg{v}_y\partial_y\avg{v}_y+\avg{v}_z\partial_z\avg{v}_y\right)=-\partial_y\avg{p}+\partial_x(\avg{\tau}_{xy}-\rho\avg{v_y'v_x'})+\partial_y(\avg{\tau}_{yy}-\rho\avg{v_y'v_y'})+\partial_z(\avg{\tau}_{zy}-\rho\avg{v_y'v_z'})+\rho g_y$; the shared stress is $-\rho\avg{v_x'v_y'}$.`,
    solution: md`Repeat the derivation with $v_y$ as the transported component: write the convective terms as $\partial(v_yv_x)/\partial x+\partial(v_yv_y)/\partial y+\partial(v_yv_z)/\partial z$, decompose, average (the cross terms vanish) and move the fluctuation products to the right-hand side:

$$
\begin{aligned}
&\rho\left(\pd{\avg{v}_y}{t}+\avg{v}_x\pd{\avg{v}_y}{x}+\avg{v}_y\pd{\avg{v}_y}{y}+\avg{v}_z\pd{\avg{v}_y}{z}\right)=-\pd{\avg{p}}{y}\\
&\qquad+\pd{(\avg{\tau}_{xy}-\rho\avg{v_y'v_x'})}{x}+\pd{(\avg{\tau}_{yy}-\rho\avg{v_y'v_y'})}{y}+\pd{(\avg{\tau}_{zy}-\rho\avg{v_y'v_z'})}{z}+\rho g_y
\end{aligned}
$$

The Reynolds stresses are $-\rho\avg{v_y'v_x'}$ (shear, on surfaces of constant $x$), $-\rho\avg{v_y'v_y'}$ (normal) and $-\rho\avg{v_y'v_z'}$ (shear, on surfaces of constant $z$). Because $\avg{v_y'v_x'}=\avg{v_x'v_y'}$, the first is the same quantity as $\tau^t_{yx}$ in the $x$-balance: the Reynolds-stress tensor is symmetric.`,
  },
  // ── reynolds-stress-example
  {
    id: 'pr-ex-8rows',
    concept: 'reynolds-stress-example',
    difficulty: 1,
    q: md`Extend Example 9.1 to eight equally weighted instants with $v_x'=(+1,+1,+1,+1,-1,-1,-1,-1)$ and $v_y'=(+1,+1,+1,-1,-1,-1,-1,+1)$ (quantum units). (a) Check that both satisfy (9.2). (b) Compute $\avg{v_x'v_y'}$. (c) Is the correlation complete, partial or absent?`,
    hint: 'Count the instants where the two signs agree and where they disagree.',
    answer: md`(a) both sum to zero; (b) $\avg{v_x'v_y'}=+0.5$; (c) partial positive correlation.`,
    solution: md`(a) $\sum v_x'=4-4=0$ and $\sum v_y'=(1+1+1-1)+(-1-1-1+1)=0$ ✓.

(b) Products: $+1,+1,+1,-1,+1,+1,+1,-1$; sum $=4$, so $\avg{v_x'v_y'}=4/8=+0.5$.

(c) Six instants move in concert and two are opposed: $(6-2)/8=0.5$ — halfway between independent ($0$) and fully in concert ($+1$). With only four instants and zero-mean $\pm1$ fluctuations this value is impossible: the only possible averages are $-1$, $0$ and $+1$, exactly the three cases of Table E9.1.`,
    check: [{ label: md`$\avg{v_x'v_y'}$`, value: 0.5 }],
  },
  {
    id: 'pr-ex-samples',
    concept: 'reynolds-stress-example',
    difficulty: 2,
    q: md`A two-component laser-Doppler probe in water ($\rho=1000$ kg/m³) records four equally spaced pairs $(v_x',\,v_y')$ in m/s: $(0.10,\,-0.06)$, $(-0.08,\,0.05)$, $(0.04,\,-0.02)$, $(-0.06,\,0.03)$. (a) Verify (9.2). (b) Find $\avg{v_x'v_y'}$ and $\tau^t_{yx}$. (c) Find the RMS values and the correlation coefficient $r_{xy}$.`,
    hint: md`$r_{xy}=\avg{v_x'v_y'}/(\widetilde{v_x'}\,\widetilde{v_y'})$ with $\widetilde{v'}=\sqrt{\avg{v'^2}}$.`,
    answer: md`(b) $\avg{v_x'v_y'}=-3.15\times10^{-3}$ m²/s², $\tau^t_{yx}=+3.15$ Pa; (c) $\widetilde{v_x'}=0.0735$ m/s, $\widetilde{v_y'}=0.0430$ m/s, $r_{xy}\approx-0.997$.`,
    solution: md`(a) $\sum v_x'=0.10-0.08+0.04-0.06=0$ and $\sum v_y'=-0.06+0.05-0.02+0.03=0$ ✓.

(b) Products: $-0.0060,\ -0.0040,\ -0.0008,\ -0.0018$; sum $-0.0126$, so $\avg{v_x'v_y'}=-0.00315$ m²/s² and $\tau^t_{yx}=-(1000)(-0.00315)=+3.15$ Pa — positive because the fluctuations are anti-correlated.

(c) $\widetilde{v_x'}=\sqrt{(0.0100+0.0064+0.0016+0.0036)/4}=\sqrt{0.0054}=0.0735$ m/s; $\widetilde{v_y'}=\sqrt{(0.0036+0.0025+0.0004+0.0009)/4}=\sqrt{0.00185}=0.0430$ m/s; $r_{xy}=-0.00315/(0.0735\times0.0430)=-0.997$ — almost perfectly opposed.`,
    check: [
      { label: md`$\tau^t_{yx}$`, value: 3.15, units: U_PA },
      { label: md`$r_{xy}$`, value: -0.997 },
    ],
  },
  {
    id: 'pr-ex-bound',
    concept: 'reynolds-stress-example',
    difficulty: 2,
    q: md`In a turbulent boundary layer in air ($\rho=1.2$ kg/m³) the RMS fluctuations at a point are $\widetilde{v_x'}=0.80$ m/s and $\widetilde{v_y'}=0.50$ m/s. (a) What is the largest possible magnitude of $\tau^t_{yx}$ there? (b) If the measured correlation coefficient is $r_{xy}=-0.45$, what is $\tau^t_{yx}$?`,
    hint: md`$\left|\avg{v_x'v_y'}\right|\le\widetilde{v_x'}\,\widetilde{v_y'}$, with equality only for perfect correlation.`,
    answer: md`(a) $0.48$ Pa; (b) $+0.216$ Pa.`,
    solution: md`(a) Perfect correlation ($|r_{xy}|=1$) gives the largest product: $|\tau^t_{yx}|_{\max}=\rho\,\widetilde{v_x'}\,\widetilde{v_y'}=(1.2)(0.80)(0.50)=0.48$ Pa.

(b) $\avg{v_x'v_y'}=r_{xy}\widetilde{v_x'}\widetilde{v_y'}=(-0.45)(0.40)=-0.18$ m²/s², so $\tau^t_{yx}=-(1.2)(-0.18)=+0.216$ Pa — less than half the maximum, because the fluctuations are only partly correlated.`,
    check: [
      { label: '(a) maximum magnitude', value: 0.48, units: U_PA },
      { label: md`(b) $\tau^t_{yx}$`, value: 0.216, units: U_PA },
    ],
  },
  // ── physical-interpretation
  {
    id: 'pr-phys-tally',
    concept: 'physical-interpretation',
    difficulty: 2,
    q: md`Five eddies cross a unit area of the plane X–X in an air flow ($\rho=1.2$ kg/m³) where $\avg{v}_x=8.0$ m/s and $\avg{v}_y=0$. Their $(v_y',\,v_x')$ in m/s are $(+0.5,\,-0.4)$, $(-0.6,\,+0.3)$, $(+0.3,\,-0.2)$, $(-0.4,\,+0.5)$ and $(+0.2,\,-0.2)$, at equally spaced instants. (a) Compute each instantaneous upward x-momentum flux (9.14). (b) Average them and split the result into the mean-flow part and the correlation part (9.15). (c) Find $\tau^t_{yx}$ (9.16) and state the direction of the net x-momentum transfer.`,
    hint: md`First check that $\sum v_y'=0$; then the mean-flow part $\rho\avg{v_y'}\avg{v}_x$ is zero.`,
    answer: md`(a) $4.560,\ -5.976,\ 2.808,\ -4.080,\ 1.872$ Pa; (b) average $-0.1632$ Pa $=0$ (mean part) $+\,(-0.1632)$ (correlation part); (c) $\tau^t_{yx}=+0.163$ Pa, net transfer downward ($-y$).`,
    solution: md`(a) $\rho v_y'(\avg{v}_x+v_x')$: $1.2(0.5)(7.6)=4.560$; $1.2(-0.6)(8.3)=-5.976$; $1.2(0.3)(7.8)=2.808$; $1.2(-0.4)(8.5)=-4.080$; $1.2(0.2)(7.8)=1.872$ (Pa).

(b) Sum $=-0.816$, average $=-0.1632$ Pa. Since $\sum v_y'=0.5-0.6+0.3-0.4+0.2=0$, the mean-flow part $\rho\avg{v_y'}\avg{v}_x$ is zero. The correlation part: $v_y'v_x'=-0.20,\ -0.18,\ -0.06,\ -0.20,\ -0.04$; average $-0.136$ m²/s²; $\rho\avg{v_y'v_x'}=1.2(-0.136)=-0.1632$ Pa — the whole net flux.

(c) $\tau^t_{yx}=-\rho\avg{v_y'v_x'}=+0.163$ Pa. The net upward flux is negative, so x-momentum is transferred **downward** — consistent with a positive shear stress.`,
    check: [{ label: md`$\tau^t_{yx}$`, value: 0.1632, units: U_PA }],
  },
  {
    id: 'pr-phys-channel',
    concept: 'physical-interpretation',
    difficulty: 2,
    q: md`Fully developed turbulent flow between parallel plates at $y=\pm h$ has its maximum mean velocity on the centre-plane $y=0$. (a) Predict the signs of $\avg{v_x'v_y'}$ and $\tau^t_{yx}$ in the lower half ($-h<y<0$) and in the upper half. (b) In the lower half, where $\avg{v_x'v_y'}=-2.4\times10^{-3}$ m²/s² in water ($\rho=998$ kg/m³), compute $\tau^t_{yx}$. (c) What is $\tau^t_{yx}$ on the centre-plane, and why?`,
    hint: 'An eddy that moves toward slower fluid carries a surplus of x-momentum; one that moves toward faster fluid carries a deficit.',
    answer: md`(a) Lower half: $\avg{v_x'v_y'}<0$, $\tau^t_{yx}>0$; upper half: $\avg{v_x'v_y'}>0$, $\tau^t_{yx}<0$. (b) $+2.40$ Pa. (c) Zero, by symmetry.`,
    solution: md`(a) **Lower half:** $\avg{v}_x$ increases with $y$. Eddies moving up ($v_y'>0$) come from slower fluid and arrive with $v_x'<0$; eddies moving down come from faster fluid and arrive with $v_x'>0$. Either way $v_x'v_y'<0$, so $\avg{v_x'v_y'}<0$ and $\tau^t_{yx}=-\rho\avg{v_x'v_y'}>0$. **Upper half:** $d\avg{v}_x/dy<0$ and everything reverses: $\avg{v_x'v_y'}>0$, $\tau^t_{yx}<0$. In both halves $\tau^t_{yx}$ has the sign of $d\avg{v}_x/dy$, and x-momentum is carried toward the nearer wall, where wall friction removes it.

(b) $\tau^t_{yx}=-(998)(-2.4\times10^{-3})=+2.40$ Pa.

(c) On the centre-plane $d\avg{v}_x/dy=0$ and, by symmetry, an eddy crossing upward is as likely to be fast as slow: $\avg{v_x'v_y'}=0$, so $\tau^t_{yx}=0$.`,
    check: [{ label: md`(b) $\tau^t_{yx}$`, value: 2.395, units: U_PA }],
  },
  {
    id: 'pr-phys-sign',
    concept: 'physical-interpretation',
    difficulty: 1,
    q: md`A student processes eddy data and finds the time-averaged **upward** flux of x-momentum across a plane, $\rho\avg{v_y'v_x'}=+0.50$ Pa, and reports "$\tau^t_{yx}=+0.50$ Pa". (a) What is the correct $\tau^t_{yx}$? (b) In which direction is the net x-momentum transported? (c) Is the mean velocity gradient $d\avg{v}_x/dy$ more likely positive or negative at this location?`,
    hint: md`Positive $\tau_{yx}$ means x-momentum moving toward $-y$ (Fig. 9.4 box).`,
    answer: md`(a) $\tau^t_{yx}=-0.50$ Pa; (b) upward ($+y$); (c) negative.`,
    solution: md`(a) By (9.16), $\tau^t_{yx}=-\rho\avg{v_y'v_x'}=-0.50$ Pa: the student forgot that a positive shear stress corresponds to x-momentum transfer toward $-y$.

(b) The averaged upward flux is positive, so the net x-momentum goes **up** ($+y$).

(c) Turbulent eddies carry momentum from faster to slower fluid, so the fluid above must be the slower: $d\avg{v}_x/dy<0$ — consistent with $\tau^t_{yx}<0$ having the sign of the gradient.`,
    check: [{ label: md`$\tau^t_{yx}$`, value: -0.5, units: U_PA }],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Quiz
// ─────────────────────────────────────────────────────────────────────────────
export const quiz: QuizQ[] = [
  {
    id: 'q-cont-1',
    concept: 'averaged-continuity',
    difficulty: 1,
    src: W('484', 'Eq. (9.8)'),
    q: md`After the constant-density continuity equation (9.6) is time-averaged, which statement is correct?`,
    options: [
      md`It keeps exactly the same form, with $\avg{v}_x$, $\avg{v}_y$, $\avg{v}_z$ in place of the instantaneous components — no extra terms appear.`,
      md`Extra terms such as $\partial\avg{v_x'v_x'}/\partial x$ appear, analogous to the Reynolds stresses.`,
      'It holds only approximately, with an error of the order of the turbulence intensity (1–10 %).',
      md`It becomes $\avg{v}_x+\avg{v}_y+\avg{v}_z=0$.`,
    ],
    answer: 0,
    explain: md`Continuity is **linear** in the velocity: every term is one velocity component differentiated once, so averaging just puts bars on each term and (9.8) has the same form as (9.6). Fluctuation products like $\avg{v_x'v_x'}$ only arise from **products** of velocities — they appear in the momentum equation, not here. The averaging is exact, so the intensity is irrelevant.`,
  },
  {
    id: 'q-cont-2',
    concept: 'averaged-continuity',
    difficulty: 2,
    src: W('484', 'four steps under Eq. (9.7)'),
    q: md`Which rule is **not** one of the four steps Wilkes uses to average the term $\partial(\avg{v}_x+v_x')/\partial x$ in Eq. (9.7)?`,
    options: [
      'The time average of a product equals the product of the time averages.',
      'The time average of a partial derivative equals the partial derivative of the time average.',
      'The time average of a sum equals the sum of the time averages.',
      md`The time average of a mean quantity is the mean itself, $\avg{\avg{v}_x}=\avg{v}_x$.`,
      md`The time average of a fluctuation is zero, $\avg{v_x'}=0$.`,
    ],
    answer: 0,
    explain: md`The four steps are: derivative and average commute; average of a sum = sum of averages; $\avg{\avg{v}_x}=\avg{v}_x$ (9.3); $\avg{v_x'}=0$ (9.2). "Average of a product = product of averages" is not used — and it is **false** for two fluctuating quantities, since $\avg{v_xv_y}=\avg{v}_x\avg{v}_y+\avg{v_x'v_y'}$.`,
  },
  {
    id: 'q-cont-3',
    concept: 'averaged-continuity',
    difficulty: 2,
    q: md`True or false: in a constant-density turbulent flow the velocity **fluctuations** themselves satisfy $\pd{v_x'}{x}+\pd{v_y'}{y}+\pd{v_z'}{z}=0$.`,
    options: ['True', 'False'],
    answer: 0,
    explain: md`True. The instantaneous velocities satisfy (9.6) and the means satisfy (9.8); subtracting the two gives continuity for $v'=v-\avg{v}$. The tempting "false" assumes fluctuations are random noise with no constraint — in fact they are a divergence-free (volume-conserving) velocity field.`,
  },
  {
    id: 'q-mom-1',
    concept: 'averaged-momentum',
    difficulty: 1,
    src: W('485', 'Eqs. (9.10)–(9.13)'),
    q: md`Which terms of the instantaneous x-momentum balance (9.9) give rise to the Reynolds stresses in (9.13)?`,
    options: [
      md`The nonlinear convective terms, such as $v_y\,\partial v_x/\partial y$`,
      md`The viscous stress terms, such as $\partial\tau_{yx}/\partial y$`,
      md`The pressure-gradient term $-\partial p/\partial x$`,
      md`The unsteady term $\rho\,\partial v_x/\partial t$`,
      md`The gravity term $\rho g_x$`,
    ],
    answer: 0,
    explain: md`Only the convective terms are products of velocities; averaging them leaves $\partial\avg{v_x'v_j'}/\partial x_j$ (9.11)–(9.12). These are then **moved** to the right-hand side, where they sit beside the viscous stresses — which is why it is tempting to credit the viscous terms. The viscous, pressure, unsteady and gravity terms are linear and simply average to $\avg{\tau}$, $\avg{p}$, $\partial\avg{v}_x/\partial t$, $\rho g_x$.`,
  },
  {
    id: 'q-mom-2',
    concept: 'averaged-momentum',
    difficulty: 1,
    src: W('485–486', 'comparison of (9.13) with (9.9)'),
    q: md`According to Wilkes, how does the time-averaged x-momentum balance (9.13) differ from the instantaneous balance (9.9)?`,
    options: [
      md`Time-averaged values replace instantaneous ones, and additional Reynolds stresses $-\rho\avg{v_x'v_j'}$ appear on the right-hand side.`,
      'Time-averaged values replace instantaneous ones; nothing else changes.',
      'The viscous stresses disappear and are replaced by the Reynolds stresses.',
      md`The pressure term disappears because $\avg{p'}=0$.`,
    ],
    answer: 0,
    explain: md`Wilkes lists exactly two differences: (1) mean values replace instantaneous ones, (2) the Reynolds stresses appear as **additional** stresses. The viscous stresses do not disappear — they become $\avg{\tau}$ (they are merely small away from walls). The pressure term becomes $-\partial\avg{p}/\partial x$; only the fluctuation $p'$ averages out.`,
  },
  {
    id: 'q-mom-3',
    concept: 'averaged-momentum',
    difficulty: 2,
    src: W('486'),
    q: md`Away from walls in a fully turbulent flow, how does the Reynolds shear stress $\tau^t_{yx}$ compare with the mean viscous stress $\avg{\tau}_{yx}$?`,
    options: [
      md`It is very much larger, so $\avg{\tau}_{yx}$ can usually be ignored.`,
      'They are of about the same size.',
      'It is much smaller, because the turbulence intensity is only 1–10 %.',
      'They are exactly equal and opposite, so they cancel.',
    ],
    answer: 0,
    explain: md`Wilkes (p. 486): for all but the lowest intensities $\tau^t_{yx}$ is very much larger than $\avg{\tau}_{yx}$, except very close to a wall. A small intensity does not mean a small stress: $\rho\avg{v_x'v_y'}$ involves the density times a velocity *squared*, which easily exceeds $\mu\,d\avg{v}_x/dy$ (e.g. 1.6 Pa vs 0.025 Pa in water).`,
  },
  {
    id: 'q-mom-4',
    concept: 'averaged-momentum',
    difficulty: 3,
    q: md`Why is it useful to rewrite the convective terms in the divergence form (9.10) before averaging?`,
    options: [
      md`The velocity products then sit inside the derivatives, so averaging (which commutes with derivatives) acts directly on products such as $v_xv_y$.`,
      'It makes the equation linear, so that averaging introduces no new terms.',
      'It is only valid for irrotational flow, which simplifies the turbulence.',
      'It removes the pressure term from the equation.',
    ],
    answer: 0,
    explain: md`In divergence form each term is $\partial(v_xv_j)/\partial x_j$: average → derivative of $\avg{v_xv_j}=\avg{v}_x\avg{v}_j+\avg{v_x'v_j'}$. The equation is **still nonlinear** — that is precisely why the extra terms appear; the rewriting only needs continuity (9.6), not irrotationality, and it does not touch the pressure term.`,
  },
  {
    id: 'q-ex-1',
    concept: 'reynolds-stress-example',
    difficulty: 1,
    src: W('486–487', 'Example 9.1'),
    q: md`In the "independent" column group of Table E9.1, what is $\avg{v_x'v_y'}$, and why?`,
    options: [
      md`$0$ — the products $+1$ and $-1$ occur equally often and cancel.`,
      md`$1$ — because $v_x'^2=v_y'^2=1$ at every instant.`,
      md`$-1$ — because high values of one always meet low values of the other.`,
      'It cannot be found without knowing the mean velocities.',
    ],
    answer: 0,
    explain: md`All four sign combinations occur once: $(1-1-1+1)/4=0$. A value of $1$ would need the signs to move in concert (case 1) and $-1$ needs them opposed (case 2); squares of each fluctuation are 1, but that is $\avg{v'^2}$, not the cross product. The mean velocities never enter $\avg{v_x'v_y'}$.`,
  },
  {
    id: 'q-ex-2',
    concept: 'reynolds-stress-example',
    difficulty: 2,
    src: W('487', 'conclusion of Example 9.1'),
    q: md`Each of $v_x'$ and $v_y'$ averages to zero. What is required for the Reynolds stress $-\rho\avg{v_x'v_y'}$ to be nonzero?`,
    options: [
      'The fluctuations must be correlated: particular values of one must tend to occur with particular values of the other.',
      'The fluctuations must be large compared with the mean velocity.',
      md`The mean velocity $\avg{v}_y$ must be nonzero.`,
      'The flow must be unsteady in the mean.',
    ],
    answer: 0,
    explain: md`Example 9.1 shows the averaged product is nonzero only with some degree of correlation. Even huge but independent fluctuations give $\avg{v_x'v_y'}=0$; the mean $\avg{v}_y$ does not enter (in §9.2 it is even zero), and the flow may well be steady in the mean.`,
  },
  {
    id: 'q-ex-3',
    concept: 'reynolds-stress-example',
    difficulty: 2,
    q: md`Case 2 of Example 9.1 (opposed fluctuations) gives $\avg{v_x'v_y'}=-1$ in quantum units. What is the sign of the corresponding Reynolds stress $\tau^t_{yx}=-\rho\avg{v_x'v_y'}$?`,
    options: ['Positive', 'Negative', 'Zero', md`It depends on the sign of $\avg{v}_x$`],
    answer: 0,
    explain: md`$\tau^t_{yx}=-\rho(-1)=+\rho$ (in units of $q^2$): opposed fluctuations give a **positive** stress. The tempting "negative" forgets the minus sign in the definition; the mean velocity plays no role.`,
  },
  {
    id: 'q-phys-1',
    concept: 'physical-interpretation',
    difficulty: 1,
    src: W('487', 'Fig. 9.4, Eq. (9.14)'),
    q: md`In Fig. 9.4 an eddy crosses the plane X–X upward. Which pair gives its x-momentum per unit volume and its volume flux per unit area?`,
    options: [
      md`$\rho(\avg{v}_x+v_x')$ and $v_y'$`,
      md`$\rho v_y'$ and $\avg{v}_x+v_x'$`,
      md`$\rho\avg{v}_x$ and $\avg{v}_y$`,
      md`$\rho\avg{v_x'v_y'}$ and $v_x'$`,
    ],
    answer: 0,
    explain: md`Momentum per unit volume = density × the eddy's x-velocity, $\rho(\avg{v}_x+v_x')$; the volume crossing unit area per unit time is the normal velocity $v_y'$ (there is no mean $\avg{v}_y$). Their product is (9.14). Swapping the roles mixes up *what* is carried with *how fast* it crosses.`,
  },
  {
    id: 'q-phys-2',
    concept: 'physical-interpretation',
    difficulty: 2,
    src: W('487', 'Eq. (9.15)'),
    q: md`Why does the term $\avg{\rho v_y'}\,\avg{v}_x$ drop out of Eq. (9.15)?`,
    options: [
      md`Because $\avg{v_y'}=0$ (9.2), while $\rho$ and $\avg{v}_x$ are constant during the averaging.`,
      md`Because $\avg{v}_x=0$ at the plane X–X.`,
      'Because it is much smaller than the viscous stress.',
      md`Because $v_y'$ and $\avg{v}_x$ are correlated.`,
    ],
    answer: 0,
    explain: md`As much fluid crosses upward as downward, so the mean velocity carries no net x-momentum across the plane. $\avg{v}_x$ is not zero (the eddy carries it); a constant cannot be "correlated" with a fluctuation; and the term is exactly zero, not merely small.`,
  },
  {
    id: 'q-phys-3',
    concept: 'physical-interpretation',
    difficulty: 2,
    src: W('487', 'Eq. (9.16) and sign convention'),
    q: md`Why is there a minus sign in $\tau^t_{yx}=-\rho\avg{v_y'v_x'}$ (Eq. 9.16)?`,
    options: [
      md`A positive shear stress corresponds to transfer of x-momentum from above X–X to below it ($-y$), whereas $\rho\avg{v_y'v_x'}$ is the upward ($+y$) transfer.`,
      'Turbulence always reduces the shear stress.',
      md`Because $\avg{v_y'v_x'}$ is always positive.`,
      'To make the Reynolds stress cancel the viscous stress.',
    ],
    answer: 0,
    explain: md`It is purely the sign convention of Wilkes Fig. 5.12 / the box in Fig. 9.4. In shear flows $\avg{v_y'v_x'}$ is usually *negative*, so $\tau^t_{yx}$ ends up positive — adding to, not cancelling, the viscous stress.`,
  },
  {
    id: 'q-phys-4',
    concept: 'physical-interpretation',
    difficulty: 3,
    q: md`In a shear flow with $d\avg{v}_x/dy>0$, eddies moving up ($v_y'>0$) tend to arrive with $v_x'<0$ and eddies moving down tend to arrive with $v_x'>0$. What are the signs of $\avg{v_x'v_y'}$ and $\tau^t_{yx}$?`,
    options: [
      md`$\avg{v_x'v_y'}<0$ and $\tau^t_{yx}>0$ — the same sign as $d\avg{v}_x/dy$`,
      md`$\avg{v_x'v_y'}>0$ and $\tau^t_{yx}>0$`,
      md`$\avg{v_x'v_y'}<0$ and $\tau^t_{yx}<0$`,
      md`Both zero, since upward and downward eddies cancel`,
    ],
    answer: 0,
    explain: md`Both kinds of eddy give a negative product, so the average is negative and $\tau^t_{yx}=-\rho\avg{v_x'v_y'}>0$, like the viscous stress $\mu\,d\avg{v}_x/dy$. Upward and downward eddies cancel in $\avg{v_y'}$, **not** in $\avg{v_x'v_y'}$ — that is the whole point of Example 9.1.`,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Flashcards
// ─────────────────────────────────────────────────────────────────────────────
export const flashcards: Flashcard[] = [
  {
    id: 'fc-cont-avg',
    front: 'Time-averaged continuity equation (constant density)?',
    back: md`$$\pd{\avg{v}_x}{x}+\pd{\avg{v}_y}{y}+\pd{\avg{v}_z}{z}=0\qquad(9.8)$$

Same form as (9.6), with mean velocities in place of instantaneous ones — no extra terms.`,
    src: W('484', 'Eq. (9.8)'),
  },
  {
    id: 'fc-four-steps',
    front: md`Which four rules turn $\avg{\left(\partial(\avg{v}_x+v_x')/\partial x\right)}$ into $\partial\avg{v}_x/\partial x$ (Eq. 9.7)?`,
    back: md`1. average of a derivative = derivative of the average;
2. average of a sum = sum of the averages;
3. $\avg{\avg{v}_x}=\avg{v}_x$ (9.3);
4. $\avg{v_x'}=0$ (9.2).`,
    src: W('484'),
  },
  {
    id: 'fc-fluct-div',
    front: 'Do the velocity fluctuations satisfy continuity by themselves?',
    back: md`Yes (constant density): subtract (9.8) from (9.6) to get $\pd{v_x'}{x}+\pd{v_y'}{y}+\pd{v_z'}{z}=0$.`,
  },
  {
    id: 'fc-product',
    front: md`$\avg{v_xv_y}=\ ?$`,
    back: md`$\avg{v_xv_y}=\avg{v}_x\avg{v}_y+\avg{v_x'v_y'}$ — the cross terms $\avg{\avg{v}_xv_y'}$ and $\avg{v_x'\avg{v}_y}$ vanish, the fluctuation product does not.`,
    src: W('485'),
  },
  {
    id: 'fc-rans',
    front: 'Time-averaged x-momentum balance (9.13)?',
    back: md`$$\rho\left(\pd{\avg{v}_x}{t}+\avg{v}_j\pd{\avg{v}_x}{x_j}\right)=-\pd{\avg{p}}{x}+\pd{}{x_j}\left(\avg{\tau}_{jx}-\rho\avg{v_x'v_j'}\right)+\rho g_x$$

(summed over $j=x,y,z$; written out in full in Wilkes Eq. 9.13).`,
    src: W('485', 'Eq. (9.13)'),
  },
  {
    id: 'fc-two-diff',
    front: 'The two differences between the time-averaged (9.13) and instantaneous (9.9) momentum balances?',
    back: md`1. Time-averaged values replace the instantaneous values.
2. Additional stresses — the **Reynolds stresses** $-\rho\avg{v_x'v_j'}$ — appear on the right-hand side, representing momentum transport by the turbulent fluctuations.`,
    src: W('486'),
  },
  {
    id: 'fc-e91',
    front: md`Example 9.1: possible values of $\avg{v_x'v_y'}$ for $\pm1$ "quantum" fluctuations?`,
    back: md`$+1$ (correlated, in concert), $-1$ (correlated, opposed), $0$ (independent) — Reynolds stresses are nonzero only if the fluctuations are correlated.`,
    src: W('486–487', 'Example 9.1'),
  },
  {
    id: 'fc-corr',
    front: md`Express $\tau^t_{yx}$ through RMS values and a correlation coefficient.`,
    back: md`$\tau^t_{yx}=-\rho\,r_{xy}\,\widetilde{v_x'}\,\widetilde{v_y'}$, with $-1\le r_{xy}\le1$; so $|\tau^t_{yx}|\le\rho\,\widetilde{v_x'}\,\widetilde{v_y'}$.`,
  },
  {
    id: 'fc-914',
    front: 'Instantaneous upward flux of x-momentum per unit area across X–X (Wilkes §9.2)?',
    back: md`$\rho\,v_y'(\avg{v}_x+v_x')$ (9.14) = (momentum per unit volume) × (volume flux per unit area). Averaged: $\rho\avg{v_y'v_x'}$ (9.15).`,
    src: W('487', 'Eqs. (9.14)–(9.15)'),
  },
  {
    id: 'fc-916-sign',
    front: md`Why is $\tau^t_{yx}=-\rho\avg{v_y'v_x'}$ written with a minus sign?`,
    back: md`A positive shear stress means x-momentum transferred from **above** X–X to **below** it ($-y$), while $\rho\avg{v_y'v_x'}$ is the **upward** transfer (9.16).`,
    src: W('487', 'Eq. (9.16)'),
  },
  {
    id: 'fc-closure',
    front: 'Is there a universal law that predicts the turbulent shear stress of Eq. (9.16)?',
    back: 'No. A semitheoretical approach combined with experimental observations is needed — e.g. Prandtl’s mixing-length theory (Wilkes §9.3, next topic).',
    src: W('488'),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Topic takeaways
// ─────────────────────────────────────────────────────────────────────────────
export const takeaways: string[] = [
  md`**Reynolds averaging:** write every quantity as mean + fluctuation, $v_x=\avg{v}_x+v_x'$ (9.1), substitute into the exact equations and time-average. Averaging commutes with sums and derivatives and $\avg{v_x'}=0$ — but averaging does **not** commute with products.`,
  md`**Continuity survives unchanged:** $\pd{\avg{v}_x}{x}+\pd{\avg{v}_y}{y}+\pd{\avg{v}_z}{z}=0$ (9.8) — the laminar form, written with mean velocities (constant density).`,
  md`**Momentum does not:** the convective terms, written as $\partial(v_xv_j)/\partial x_j$ (9.10), average to mean-flow convection **plus** $\partial\avg{v_x'v_j'}/\partial x_j$ (9.11)–(9.12), because $\avg{v_xv_j}=\avg{v}_x\avg{v}_j+\avg{v_x'v_j'}$.`,
  md`**Time-averaged x-momentum (9.13):** mean values replace instantaneous ones, and the Reynolds stresses $-\rho\avg{v_x'v_x'}$, $-\rho\avg{v_x'v_y'}$, $-\rho\avg{v_x'v_z'}$ appear beside the mean viscous stresses $\avg{\tau}_{xx}$, $\avg{\tau}_{yx}$, $\avg{\tau}_{zx}$ (Newton's law on the mean profiles).`,
  md`Except very close to a wall, the Reynolds stress $\tau^t_{yx}=-\rho\avg{v_x'v_y'}$ is **very much larger** than $\avg{\tau}_{yx}$, which can usually be ignored (Wilkes p. 486).`,
  md`**Example 9.1:** with $\pm1$ fluctuations, $\avg{v_x'v_y'}=+1$ (in concert), $-1$ (opposed) or $0$ (independent) — a Reynolds stress exists only when the fluctuations in different directions are **correlated**.`,
  md`**Physical meaning (§9.2):** an eddy crossing plane X–X carries x-momentum $\rho(\avg{v}_x+v_x')$ per unit volume at a volume flux $v_y'$ (9.14); averaging removes the mean-flow part and leaves the upward flux $\rho\avg{v_y'v_x'}$ (9.15).`,
  md`**Sign convention:** a positive shear stress means x-momentum moving toward $-y$, hence $\tau^t_{yx}=-\rho\avg{v_y'v_x'}$ (9.16). With $d\avg{v}_x/dy>0$ the fluctuations are anti-correlated and $\tau^t_{yx}>0$ (Fox: $\tau_{\mathrm{turb}}=-\rho\overline{u'v'}>0$).`,
  md`**Closure problem:** averaging creates new unknowns $\avg{v_i'v_j'}$ and no universal law predicts them, so semitheoretical models fitted to experiments are needed — mixing-length theory (p. 488, next topic).`,
  md`**Exam traps:** $\avg{v_xv_y}\neq\avg{v}_x\avg{v}_y$; $\avg{v'}=0$ but $\avg{v'^2}>0$; never drop the minus sign in $-\rho\avg{v_x'v_y'}$; a Reynolds stress is a property of the **flow**, not of the fluid.`,
]

// ─────────────────────────────────────────────────────────────────────────────
// Content
// ─────────────────────────────────────────────────────────────────────────────
export default function Content() {
  return (
    <>
      {/* ═════════════════════════ Concept 1 ═════════════════════════ */}
      <Concept id="averaged-continuity">
        <Step kind="intro" src={[W('483', 'Eq. (9.1); millisecond fluctuations'), W('484', 'Eqs. (9.6)–(9.8)')]}>
          <Md>{md`
            Inside a turbulent flow every velocity component and the pressure fluctuate randomly within milliseconds, yet an engineer
            needs only their **time averages** — the mean velocity profile, the mean pressure drop. Wilkes's plan is direct: take each
            exact conservation equation, substitute the decomposition of Eq. (9.1),

            $$
            v_x=\avg{v}_x+v_x',\qquad v_y=\avg{v}_y+v_y',\qquad v_z=\avg{v}_z+v_z',\qquad p=\avg{p}+p',
            $$

            and **time-average the entire equation**. What remains is a set of equations for the mean flow.

            Mass conservation is the natural first test. For a fluid of **constant density** the instantaneous continuity equation is
            Eq. (9.6) (Wilkes's Eqn. 5.52). Averaging it term by term — Eq. (9.7) shows one representative term — produces the
            **time-averaged continuity equation** (9.8), which is identical with the original *except* that time-averaged velocities have
            replaced the instantaneous velocities.
          `}</Md>
          <FlowRow
            nodes={[
              { title: 'Decompose', md: md`$v=\avg{v}+v'$ (9.1)`, tone: 'slate' },
              { title: 'Continuity', md: md`(9.6) → (9.8) — this concept`, tone: 'indigo' },
              { title: 'Momentum', md: md`(9.9) → (9.13) + Reynolds stresses`, tone: 'violet' },
              { title: 'Meaning', md: md`eddies crossing a plane (§9.2)`, tone: 'amber' },
              { title: 'Closure', md: 'mixing length (§9.3, next topic)', tone: 'emerald' },
            ]}
          />
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Averaging is a linear operation.** The time average of $a+b$ is $\avg{a}+\avg{b}$, and a constant factor comes straight
            out. A partial derivative $\partial/\partial x$ is linear too, and it acts on a *different* variable — space, not time — so it
            does not matter whether you differentiate first and average second, or the other way round. Think of two thermometers 1 cm
            apart: the day-averaged *difference* of their readings equals the difference of their day-averaged readings.

            **Continuity is linear in the velocity.** Every term of (9.6) is a single velocity component differentiated once — there are
            no products. Averaging can therefore only put a bar on each term; no new terms can be created.

            **Fluctuations cannot create mass.** Since the instantaneous field obeys (9.6) and the mean field obeys (9.8), their
            difference — the fluctuating field — obeys continuity as well: the turbulent jitter only shuffles fluid around.
          `}</Md>
          <Callout kind="warning" title="Not a universal shortcut">
            <Md>{md`"Just put bars on every symbol" works **only for linear terms**. The momentum equation contains products such as $v_xv_y$, and there the shortcut fails — that is where the Reynolds stresses come from (next concept).`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={W('484', 'steps of Eq. (9.7)')}>
          <Figure caption="Two routes to the same answer: averaging over time and differentiating in space commute — but averaging and multiplying do not.">
            <CommuteDiagram />
          </Figure>
          <Figure caption="The four intermediate steps Wilkes lists for Eq. (9.7)." src={W('484', 'Eq. (9.7)')}>
            <FlowSteps
              steps={[
                { title: 'Average of a derivative = derivative of the average', md: md`$\avg{\left(\pd{(\avg{v}_x+v_x')}{x}\right)}=\pd{\,\avg{(\avg{v}_x+v_x')}}{x}$`, tone: 'indigo' },
                { title: 'Average of a sum = sum of the averages', md: md`$\avg{(\avg{v}_x+v_x')}=\avg{\avg{v}_x}+\avg{v_x'}$`, tone: 'cyan' },
                { title: 'Average of a mean = the mean itself (9.3)', md: md`$\avg{\avg{v}_x}=\avg{v}_x$`, tone: 'violet' },
                { title: 'Average of a fluctuation = 0 (9.2)', md: md`$\avg{v_x'}=0\ \Rightarrow$ the term becomes $\pd{\avg{v}_x}{x}$`, tone: 'emerald' },
              ]}
            />
          </Figure>
        </Step>

        <Step kind="equations" src={W('484', 'Eqs. (9.6)–(9.8)')}>
          <FormulaCard id="avg-rules" />
          <FormulaCard id="continuity-inst" />
          <FormulaCard id="avg-derivative" />
          <Md>{md`Doing the same to the $y$ and $z$ terms gives the result:`}</Md>
          <FormulaCard id="continuity-avg" />
          <Callout kind="exam" title="What to write in an exam">
            <Md>{md`State the assumption (**constant density**), substitute (9.1), quote the four rules, and conclude that (9.8) has the same form as (9.6) with mean velocities. Note explicitly that **no extra terms** appear — because continuity is linear.`}</Md>
          </Callout>
          <Supplement title="A free extra: continuity for the fluctuations">
            <FormulaCard id="continuity-fluct" />
            <Md>{md`If the density were *not* constant, continuity would contain the product $\rho\,\vb{v}$ and averaging would produce correlations such as $\avg{\rho'v_x'}$ — one reason the course restricts itself to constant-density turbulence.`}</Md>
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-mean-duct" />
          <ExampleCard id="ex-commute" />
        </Step>

        <Step kind="interactive">
          <MeanFieldAverager />
        </Step>

        <Step kind="practice">
          <PracticeList concept="averaged-continuity" />
          <QuickCheck ids={['q-cont-1', 'q-cont-2']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Substitute $v=\avg{v}+v'$ (9.1) into the exact equation, then time-average **every** term.`,
              md`Four rules do all the work: average and derivative commute; average of a sum = sum of averages; $\avg{\avg{v}_x}=\avg{v}_x$; $\avg{v_x'}=0$.`,
              md`Result: $\pd{\avg{v}_x}{x}+\pd{\avg{v}_y}{y}+\pd{\avg{v}_z}{z}=0$ (9.8) — no extra terms, because continuity is **linear**.`,
              md`Consequence: the fluctuations are divergence-free too (subtract 9.8 from 9.6).`,
              md`**Trap:** the "just add bars" shortcut is valid only for linear terms; it fails for products like $v_xv_y$.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ═════════════════════════ Concept 2 ═════════════════════════ */}
      <Concept id="averaged-momentum">
        <Step kind="intro" src={W('484–486')}>
          <Md>{md`
            The same recipe is now applied to Newton's second law. Wilkes writes the $x$-momentum balance for a constant-density fluid in
            terms of the **viscous** stress components, Eq. (9.9) (his Eqn. 5.72), substitutes (9.1) and time-averages the result to
            obtain the **time-averaged $x$-momentum balance**, Eq. (9.13).

            The pressure, viscous, unsteady and gravity terms are linear and behave exactly as in continuity. All the interest lies in
            the **nonlinear convective terms** on the left-hand side — a velocity multiplied by a velocity gradient. Wilkes remarks that a
            reader short of time may jump straight from (9.9) to (9.13); following the steps once is worthwhile, because they show
            precisely *where* the extra **Reynolds stresses** come from.
          `}</Md>
          <Supplement title="Name check">
            <Md>{md`Equation (9.13) and its $y$ and $z$ partners are widely called the **Reynolds-averaged Navier–Stokes (RANS) equations**. Wilkes simply calls them the time-averaged momentum balances.`}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **The average of a product is not the product of the averages.** Let $v_x'$ and $v_y'$ flip between $+1$ and $-1$ in step.
            Each averages to zero, yet their product is $+1$ at every instant. The convective term is exactly such a product.

            **Two-way traffic.** Picture trucks shuttling across a bridge: as many cross northward as southward, so the net number of
            trucks crossing is zero — like $\avg{v_y'}=0$. But if the northbound trucks are full and the southbound ones empty, cargo is
            still carried north. In turbulence the cargo is $x$-momentum: if the fluid moving up systematically carries less
            $x$-momentum than the fluid moving down, there is a net downward flux of $x$-momentum although no net fluid crosses.

            **Why it behaves like a stress.** A net flux of $x$-momentum across a surface changes the momentum of the fluid on each
            side — exactly what a shear force does. So once the averaged flux $\rho\avg{v_x'v_y'}$ is moved to the right-hand side it sits
            next to the viscous stress $\avg{\tau}_{yx}$ and acts like an extra stress: the Reynolds stress.
          `}</Md>
          <Callout kind="tip" title="Mnemonic">
            <Md>{md`Reynolds stress = **minus** density × average of (fluctuation × fluctuation). "Two primes under one bar."`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={W('485', 'product expansion, Eqs. (9.10)–(9.13)')}>
          <Figure caption={md`Multiply out $(\avg{v}_x+v_x')(\avg{v}_y+v_y')$ and average: two terms die, two survive.`} src={W('485')}>
            <ProductGrid />
          </Figure>
          <Figure caption="Road map of Wilkes's derivation from (9.9) to (9.13)." src={W('484–485')}>
            <FlowChart
              rows={[
                [{ title: 'Instantaneous x-momentum (9.9)', md: md`linear terms + convective terms $v_j\,\partial v_x/\partial x_j$`, tone: 'slate' }],
                [{ title: 'Divergence form (9.10)', md: md`$v_j\,\partial v_x/\partial x_j=\partial(v_xv_j)/\partial x_j$ using (9.6)`, tone: 'indigo' }],
                [
                  { title: 'Mean × mean', md: md`$\avg{v}_x\avg{v}_j$ survives`, tone: 'emerald' },
                  { title: 'Mean × fluctuation', md: 'averages to zero', tone: 'slate' },
                  { title: 'Fluctuation × fluctuation', md: md`$\avg{v_x'v_j'}$ survives`, tone: 'amber' },
                ],
                [{ title: 'Averaged convective terms (9.11) → (9.12)', md: md`mean-flow part rewritten with (9.8)`, tone: 'indigo' }],
                [{ title: 'Time-averaged x-momentum (9.13)', md: md`move $\rho\,\partial\avg{v_x'v_j'}/\partial x_j$ to the right: stresses $-\rho\avg{v_x'v_j'}$`, tone: 'violet' }],
              ]}
              arrowLabels={['use continuity (9.6)', 'substitute (9.1), average each product', 'collect', 'substitute into (9.9)']}
            />
          </Figure>
          <Figure caption={md`All the Reynolds stresses form a symmetric 3 × 3 tensor; the $x$-balance (9.13) uses the highlighted column.`}>
            <ReynoldsStressTensor />
          </Figure>
        </Step>

        <Step kind="equations" src={W('484–486', 'Eqs. (9.9), (9.13)')}>
          <FormulaCard id="xmom-inst" />
          <FormulaCard id="rans-x" />
          <Compare
            items={[
              { title: 'Instantaneous balance (9.9)', md: md`Instantaneous $v_x$, $v_y$, $v_z$, $p$; only the viscous stresses $\tau_{xx}$, $\tau_{yx}$, $\tau_{zx}$. Exact but useless in practice: the random field is unknown.`, tone: 'slate' },
              { title: 'Time-averaged balance (9.13)', md: md`(1) **Mean values** $\avg{v}_x$, $\avg{p}$, $\avg{\tau}$ replace instantaneous ones. (2) **Reynolds stresses** $-\rho\avg{v_x'v_j'}$ appear as additional stresses on the right-hand side.`, tone: 'violet' },
            ]}
          />
          <Callout kind="key" title="Wilkes's two differences (p. 486)">
            <Md>{md`The time-averaged balance is the same as the instantaneous one except that (1) time-averaged values have replaced the instantaneous values, and (2) additional stresses — the **Reynolds stresses** — appear on the right-hand side, representing the **transport of momentum by the turbulent velocity fluctuations**. The time-averaged $y$ and $z$ balances give similar results.`}</Md>
          </Callout>
          <FormulaCard id="reynolds-stresses-x" />
          <Callout kind="exam" title="Size matters">
            <Md>{md`For all but the lowest turbulence intensities, $\tau^t_{yx}=-\rho\avg{v_x'v_y'}$ is **very much larger** than its viscous (molecular) counterpart $\avg{\tau}_{yx}$ — except very close to a wall — so $\avg{\tau}_{yx}$ can be ignored in most situations (Wilkes p. 486). The mean viscous stresses themselves come from Newton's law applied to the **time-averaged** velocity profiles (p. 485).`}</Md>
          </Callout>
          <Supplement title="The full picture: all three balances">
            <FormulaCard id="rans-general" />
            <FormulaCard id="reynolds-tensor" />
          </Supplement>
        </Step>

        <Step kind="derivation" title="Derivation: from (9.9) to (9.13)" src={W('484–485', 'Eqs. (9.9)–(9.13)')}>
          <Derivation
            title="Time-averaging the x-momentum balance"
            steps={[
              { md: md`Start from (9.9) and substitute $v_x=\avg{v}_x+v_x'$, $v_y=\avg{v}_y+v_y'$, $v_z=\avg{v}_z+v_z'$, $p=\avg{p}+p'$ (9.1); then time-average every term.`, why: 'the same recipe as for continuity' },
              {
                md: md`**Linear terms** simply acquire bars:

$$
\avg{\left(\pd{v_x}{t}\right)}=\pd{\avg{v}_x}{t},\quad \avg{\left(\pd{p}{x}\right)}=\pd{\avg{p}}{x},\quad \avg{\left(\pd{\tau_{yx}}{y}\right)}=\pd{\avg{\tau}_{yx}}{y},\quad \avg{\rho g_x}=\rho g_x
$$`,
                why: md`four rules of p. 484; $\partial\avg{v}_x/\partial t=0$ if steady in the mean`,
              },
              {
                md: md`**Convective terms**, rewritten with continuity (9.6):

$$
v_x\pd{v_x}{x}+v_y\pd{v_x}{y}+v_z\pd{v_x}{z}=\pd{(v_xv_x)}{x}+\pd{(v_xv_y)}{y}+\pd{(v_xv_z)}{z}\qquad(9.10)
$$`,
                why: md`the difference is $v_x(\partial v_x/\partial x+\partial v_y/\partial y+\partial v_z/\partial z)=0$`,
              },
              {
                md: md`Expand each product, e.g. $v_xv_y=\avg{v}_x\avg{v}_y+\avg{v}_xv_y'+v_x'\avg{v}_y+v_x'v_y'$, and average: the mean × fluctuation terms vanish, the fluctuation × fluctuation term survives, giving (9.11):

$$
\pd{(\avg{v}_x\avg{v}_x)}{x}+\pd{(\avg{v}_x\avg{v}_y)}{y}+\pd{(\avg{v}_x\avg{v}_z)}{z}+\pd{(\avg{v_x'v_x'})}{x}+\pd{(\avg{v_x'v_y'})}{y}+\pd{(\avg{v_x'v_z'})}{z}
$$`,
                why: md`$\avg{\avg{v}_xv_y'}=\avg{v}_x\avg{v_y'}=0$ but $\avg{v_x'v_y'}\neq0$`,
              },
              {
                md: md`Use the time-averaged continuity equation (9.8) to return the mean-flow part to the familiar form, (9.12):

$$
\avg{v}_x\pd{\avg{v}_x}{x}+\avg{v}_y\pd{\avg{v}_x}{y}+\avg{v}_z\pd{\avg{v}_x}{z}+\pd{(\avg{v_x'v_x'})}{x}+\pd{(\avg{v_x'v_y'})}{y}+\pd{(\avg{v_x'v_z'})}{z}
$$`,
                why: md`the extra piece is $\avg{v}_x\times$(9.8) $=0$`,
              },
              {
                md: md`Replace the averaged convective terms of (9.9) by (9.12), multiply by $\rho$ and **move the three fluctuation terms to the right-hand side**, where they join the viscous stresses — this is (9.13).`,
                why: md`$-\rho\avg{v_x'v_j'}$ now sits beside $\avg{\tau}_{jx}$: an extra stress`,
              },
            ]}
          />
          <FormulaCard id="conv-divergence" />
          <FormulaCard id="product-expand" />
          <FormulaCard id="conv-avg" />
          <FormulaCard id="conv-avg-nc" />
          <Callout kind="note" title="A second proof of (9.10)">
            <Md>{md`Wilkes also proves (9.10) by noting that its left-hand side is $\vb{v}\cdot\nabla v_x$ and using the vector identity $\nabla\cdot(v_x\vb{v})=v_x\nabla\cdot\vb{v}+\vb{v}\cdot\nabla v_x=\vb{v}\cdot\nabla v_x$ for an incompressible fluid [he cites his Eqn. (5.24) here], which leads directly to the right-hand side of (9.10).`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-product-avg" />
          <ExampleCard id="ex-stress-compare" />
        </Step>

        <Step kind="interactive">
          <ProductTermsLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="averaged-momentum" />
          <QuickCheck ids={['q-mom-1', 'q-mom-2']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Only the **nonlinear convective terms** create anything new; all other terms just acquire overbars.`,
              md`Key identity: $\avg{v_xv_j}=\avg{v}_x\avg{v}_j+\avg{v_x'v_j'}$ — cross terms vanish, fluctuation products survive.`,
              md`(9.13) = (9.9) with mean values **plus** the Reynolds stresses $-\rho\avg{v_x'v_x'}$, $-\rho\avg{v_x'v_y'}$, $-\rho\avg{v_x'v_z'}$ next to $\avg{\tau}_{xx}$, $\avg{\tau}_{yx}$, $\avg{\tau}_{zx}$.`,
              md`Away from walls $\tau^t_{yx}\gg\avg{\tau}_{yx}$; mean viscous stresses come from Newton's law on the **mean** profiles.`,
              md`**Trap:** the Reynolds stresses come from the *left-hand* (inertia) side; they are only *moved* to the right. They are new unknowns — the closure problem.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ═════════════════════════ Concept 3 ═════════════════════════ */}
      <Concept id="reynolds-stress-example">
        <Step kind="intro" src={W('486–487', 'Example 9.1')}>
          <Md>{md`
            Every Reynolds stress contains the time average of a product of two fluctuations, such as $\avg{v_x'v_y'}$. But each
            fluctuation averages to zero by (9.2) — so how can their product survive? Wilkes's **Example 9.1** answers with a
            deliberately simple thought experiment: allow only "quantum" fluctuations, with each of $v_x'$ and $v_y'$ equal to either
            $-1$ (low) or $+1$ (high), and investigate the possible values of $\avg{v_x'v_y'}$ (Table E9.1, "Possible Values for Velocity
            Fluctuations").

            Wilkes notes that a more elaborate investigation would use a statistical analysis of a *continuous distribution* of
            velocities, but that the main thrust would not differ from this elementary treatment — the interactive demo below lets you
            check both versions.
          `}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Do the highs come together?** Two dancers each sway left and right equally often (zero mean). If they sway *together*,
            the product of their displacements is always positive; if they sway in *mirror image*, it is always negative; if each ignores
            the other, positive and negative products cancel on average. $\avg{v_x'v_y'}$ measures exactly this "togetherness" — in
            statistics it is the **covariance** of $v_x$ and $v_y$.

            **Quadrant picture.** Plot each instant as a point $(v_x',v_y')$. Points in quadrants 1 and 3 give positive products,
            points in quadrants 2 and 4 negative ones. A round, untilted cloud gives $\avg{v_x'v_y'}\approx0$; a cloud tilted into
            quadrants 2 and 4 gives a negative average — and hence a *positive* Reynolds stress.

            **Why would turbulence be correlated at all?** Because of the mean shear: fluid that moves *up* in a shear layer tends to
            come from slower layers and fluid that moves *down* from faster layers. That is the physical story of the next concept.
          `}</Md>
        </Step>

        <Step kind="visual" src={W('486', 'Table E9.1')}>
          <Figure caption={md`Table E9.1 recreated, with each case drawn in the $(v_x', v_y')$ plane (×2 = the point occurs twice). Green quadrants give positive products, red quadrants negative.`} src={W('486', 'Table E9.1')}>
            <TableE91 />
          </Figure>
        </Step>

        <Step kind="equations">
          <Md>{md`Example 9.1 averages over four equally weighted instants. In general:`}</Md>
          <FormulaCard id="mean-product-discrete" />
          <Md>{md`To separate the *strength* of the fluctuations from their *coupling*, divide by the RMS values (Wilkes Eq. 9.5, $\widetilde{v'}=\sqrt{\avg{v'^2}}$):`}</Md>
          <FormulaCard id="correlation-coef" />
          <Callout kind="tip" title="Reading Table E9.1 with r">
            <Md>{md`Each fluctuation is $\pm1$, so both RMS values are 1 and $r_{xy}=\avg{v_x'v_y'}$: the three cases are $r_{xy}=+1$, $-1$ and $0$ — the two extremes and the middle of the possible range. Real turbulent shear flows sit in between (partly correlated).`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-91" />
          <ExampleCard id="ex-partial" />
        </Step>

        <Step kind="interactive">
          <QuantumTableBuilder />
          <CorrelationExplorer />
        </Step>

        <Step kind="practice">
          <PracticeList concept="reynolds-stress-example" />
          <QuickCheck ids={['q-ex-2', 'q-ex-3']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Example 9.1: $\avg{v_x'v_y'}=+1$ (in concert), $-1$ (opposed), $0$ (independent) for $\pm1$ fluctuations.`,
              md`Reynolds stresses are nonzero **only if** fluctuations in different directions are correlated — and in turbulent flow they are.`,
              md`$\avg{v_x'v_y'}$ is a covariance: $\avg{v_x'v_y'}=r_{xy}\,\widetilde{v_x'}\,\widetilde{v_y'}$ with $-1\le r_{xy}\le 1$.`,
              md`Opposed (anti-correlated) fluctuations give $\avg{v_x'v_y'}<0$ and therefore a **positive** $\tau^t_{yx}$.`,
              md`**Trap:** large fluctuations alone do not make a large Reynolds stress — independent fluctuations give zero however strong they are.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ═════════════════════════ Concept 4 ═════════════════════════ */}
      <Concept id="physical-interpretation">
        <Step kind="intro" src={W('487', '§9.2, Fig. 9.4')}>
          <Md>{md`
            Section 9.2 gives the Reynolds stresses a physical meaning. Picture fragments of fluid — **eddies** — that suddenly jump
            across a unit area of a plane X–X because of the turbulent motion (Fig. 9.4). Wilkes considers a **two-dimensional** flow
            with $v_x=\avg{v}_x+v_x'$ and $v_y=0+v_y'$: there is **no overall motion in the $y$ direction**, so every crossing of the
            plane is caused by a fluctuation.

            Counting the $x$-momentum the eddies carry across the plane (9.14), averaging over all eddies crossing from either side
            (9.15) and applying the sign convention for shear stress gives (9.16) — the same $\tau^t_{yx}=-\rho\avg{v_y'v_x'}$ that
            appeared mathematically in (9.13). The Reynolds stress is therefore not a force between molecules but a **momentum flux
            carried by eddies**.
          `}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Two trains.** Two trains run side by side, one fast and one slow, and passengers keep jumping between them. Each jumper
            from the fast train lands on the slow one carrying extra forward momentum and speeds it up; each jumper going the other way
            slows the fast train down. No coupling or friction connects the trains, yet they behave as if a shear force acted between
            them. Eddies jumping between faster and slower layers of a turbulent shear flow do exactly this.

            **Which way does the momentum go?** If $\avg{v}_x$ increases with $y$, an eddy jumping *up* ($v_y'>0$) comes from slower
            fluid and is slower than its new surroundings ($v_x'<0$); an eddy jumping *down* ($v_y'<0$) is faster ($v_x'>0$). Both give
            $v_x'v_y'<0$, so $\avg{v_y'v_x'}<0$: net $x$-momentum flows **downward**, from fast fluid to slow fluid — "down the gradient",
            just like molecular momentum transfer.

            **Why the minus sign?** The bookkeeping counts the *upward* flux, but a positive shear stress, by convention, means
            momentum moving *downward*. Hence $\tau^t_{yx}=-\rho\avg{v_y'v_x'}$, which comes out positive here — the same sign as the
            viscous stress $\mu\,d\avg{v}_x/dy$.
          `}</Md>
        </Step>

        <Step kind="visual" src={W('487', 'Fig. 9.4')}>
          <Figure caption={md`Motion of an eddy upward across the plane X–X (Wilkes Fig. 9.4). The eddy carries x-velocity $\avg{v}_x+v_x'$ and crosses with $v_y'$; the box shows the conventional positive direction of $\tau^t_{yx}$. Grey italic labels are added annotations.`} src={W('487', 'Fig. 9.4')}>
            <EddyPlaneFigure />
          </Figure>
          <Figure caption={md`Sign convention behind Eq. (9.16): a positive $\tau_{yx}$ on the upper face (fast fluid above pulling the element forward) is the same thing as x-momentum flowing toward $-y$.`}>
            <SignConventionFigure />
          </Figure>
          <Callout kind="note" title="Cross-reference — Fox & McDonald's (secondary source)">
            <div className="space-y-3">
              <Md>{md`Fox & McDonald's §8.4 writes the same stress in its own notation, $\tau_{\mathrm{turb}}=-\rho\overline{u'v'}$ with $u\equiv v_x$ (axial) and $v\equiv v_y$ (wall-normal), and stresses that $u'$ and $v'$ are **negatively correlated**, so $\tau_{\mathrm{turb}}$ is positive. Its Fig. 8.8 (Laufer's pipe-flow data, recreated below with values read approximately from the printed figure) shows the measured Reynolds stress following almost the straight line of the total shear stress: away from the wall practically all the friction is Reynolds stress. Fox adds that very near the wall (no data shown) the fluctuations are suppressed and the Reynolds stress falls to zero — Wilkes's "except very close to a wall".`}</Md>
              <FoxFig88 />
              <SourceChips src={FOX('293–294', 'Eq. (8.17), Fig. 8.8')} size="xs" />
            </div>
          </Callout>
        </Step>

        <Step kind="equations" src={W('487', 'Eqs. (9.14)–(9.16)')}>
          <Derivation
            title="From a jumping eddy to a stress"
            steps={[
              { md: md`An eddy below X–X has $x$-momentum $\rho(\avg{v}_x+v_x')$ **per unit volume**.`, why: 'momentum = mass × velocity' },
              { md: md`It crosses the plane with velocity $v_y'$, i.e. a volume $v_y'$ per unit area per unit time.`, why: md`$\avg{v}_y=0$, so $v_y=v_y'$` },
              { md: md`Instantaneous upward flux of $x$-momentum per unit area: $\rho v_y'(\avg{v}_x+v_x')$ — Eq. (9.14).`, why: 'momentum/volume × volume/(area·time)' },
              { md: md`Average over all fluid crossing from above **or** below: $\avg{\rho v_y'}\,\avg{v}_x+\avg{\rho v_y'v_x'}=0+\rho\avg{v_y'v_x'}$ — Eq. (9.15).`, why: md`$\avg{v_y'}=0$ (9.2)` },
              { md: md`A positive shear stress (box in Fig. 9.4, Wilkes Fig. 5.12) means $x$-momentum moving from above X–X to below it, i.e. toward $-y$: $\tau^t_{yx}=-\rho\avg{v_y'v_x'}$ — Eq. (9.16).`, why: 'sign convention' },
            ]}
          />
          <FormulaCard id="flux-inst" />
          <FormulaCard id="flux-avg" />
          <FormulaCard id="reynolds-shear" />
          <Md>{md`For a mean shear flow $\avg{v}_x(y)$ the viscous and turbulent contributions add — this is the bracket that is differentiated in (9.13):`}</Md>
          <FormulaCard id="total-shear" />
          <Callout kind="key" title="What comes next (Wilkes p. 488)">
            <Md>{md`There is **no universal law** by which the turbulent shear stress of (9.16) can be predicted; one has to resort to a **semitheoretical approach in conjunction with experimental observations**. Section 9.3 builds the first such model — Prandtl's mixing-length theory (next topic). This need for an extra relation is often called the *closure problem*.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-eddy-tally" />
        </Step>

        <Step kind="interactive">
          <EddyCrossingSim />
        </Step>

        <Step kind="practice">
          <PracticeList concept="physical-interpretation" />
          <QuickCheck ids={['q-phys-3', 'q-phys-4']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Model: 2-D flow, $v_x=\avg{v}_x+v_x'$, $v_y=0+v_y'$; eddies jump across a unit area of plane X–X.`,
              md`Instantaneous upward $x$-momentum flux $\rho v_y'(\avg{v}_x+v_x')$ (9.14); its average is $\rho\avg{v_y'v_x'}$ (9.15) because $\avg{v_y'}=0$.`,
              md`Positive shear stress ⇔ $x$-momentum moving toward $-y$, hence $\tau^t_{yx}=-\rho\avg{v_y'v_x'}$ (9.16).`,
              md`In shear flow eddies carry momentum from fast to slow fluid: $d\avg{v}_x/dy>0\Rightarrow\avg{v_x'v_y'}<0\Rightarrow\tau^t_{yx}>0$.`,
              md`Total stress $=\mu\,d\avg{v}_x/dy-\rho\avg{v_x'v_y'}$; no universal law gives the second term → mixing-length theory.`,
              md`**Trap:** the minus sign is a *convention*, not physics — don't drop it, and don't conclude that turbulence "reduces" the stress.`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
