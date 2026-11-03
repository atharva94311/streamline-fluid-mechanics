/**
 * Topic A6 — From Euler to Bernoulli: Inviscid Flow.
 * Sources: Lecture 10 slides 9–11 (steady Euler → streamline integral → Bernoulli), Lecture 11 slide 2 problem 2
 * (φ = 8xy: ψ and a pressure difference — statement only, solved here) and Fox & McDonald pp. 221–222
 * (§6.6: HGL/EGL remark, irrotationality, Bernoulli between any two points, velocity potential).
 * Sign conventions: course V = +∇φ (Lec 10 slide 6), u = ∂ψ/∂y, v = −∂ψ/∂x (Lec 9 slide 12); Fox uses V = −∇φ (Eq. 6.27).
 */
import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowField, FlowSteps, FormulaCard, Md, md, Plot, PracticeList,
  QuickCheck, Step, Supplement, Tabs, Takeaways, type FlowMarker,
} from '@/kit'
import { EulerSlideFigures } from '../sims/bernoulli-euler/SlideFigures'
import { LambProjector } from '../sims/bernoulli-euler/LambProjector'
import { HeadLinesFigure } from '../sims/bernoulli-euler/HeadLinesFigure'
import { BernoulliDuct } from '../sims/bernoulli-euler/BernoulliDuct'
import { VortexFigure } from '../sims/bernoulli-euler/VortexFigure'
import { VortexCompare } from '../sims/bernoulli-euler/VortexCompare'
import { CornerPressureMap } from '../sims/bernoulli-euler/CornerPressureMap'

const L9: Src = { doc: 'lec10', pages: '9' }
const L10: Src = { doc: 'lec10', pages: '10' }
const L910: Src = { doc: 'lec10', pages: '9–10' }
const L11: Src = { doc: 'lec10', pages: '11' }
const P2: Src = { doc: 'lec11', pages: '2', note: 'Problem 2' }
/** Lecture 11 problem 2: the statement is on the slide, the derived results (ψ, Δp) are this platform's solution. */
const P2S: Src = { doc: 'lec11', pages: '2', note: 'Problem 2 statement; solution written for this platform' }
const F221: Src = { doc: 'fox', pages: '221' }
const F222: Src = { doc: 'fox', pages: '222' }
const F2212: Src = { doc: 'fox', pages: '221–222' }

/* Fields drawn in the static visual of concept 4 (module constants → stable identities). */
const lecPhi = (x: number, y: number) => 8 * x * y
const lecPsi = (x: number, y: number) => 4 * (y * y - x * x)
const LEC_MARKERS: FlowMarker[] = [
  { x: 0, y: 0, kind: 'stagnation', label: 'stagnation, V = 0' },
  { x: 0, y: 0.5, kind: 'point', label: '(0, 0.5): ψ = 1' },
  { x: 0, y: 2, kind: 'point', label: '(0, 2): ψ = 16' },
]
const LEC_HL = [
  { level: 1, color: 'var(--plot-5)', label: 'ψ = 1' },
  { level: 16, color: 'var(--plot-4)', label: 'ψ = 16' },
]
const LEC_PSI_LEVELS = [-24, -20, -16, -12, -8, -4, -1, 0, 1, 4, 8, 12, 16, 20, 24]
const LEC_PHI_LEVELS = [-40, -30, -20, -12, -6, -2, 0, 2, 6, 12, 20, 30, 40]

/* ------------------------------------------------------------------------------------------------ meta */

export const meta: TopicMeta = {
  id: 'bernoulli-euler',
  unit: 'A',
  title: 'From Euler to Bernoulli: Inviscid Flow',
  subtitle:
    "Integrate Euler's equation along a streamline to reach Bernoulli's equation — then see why, in irrotational flow, one constant covers the whole field and turns a velocity potential into a pressure map.",
  minutes: 95,
  sources: [
    { doc: 'lec10', pages: '9–11' },
    { doc: 'lec11', pages: '2' },
    { doc: 'fox', pages: '221–222' },
  ],
  concepts: [
    {
      id: 'euler-streamline',
      title: 'Steady Euler equation along a streamline',
      src: L910,
      summary:
        'Steady inviscid flow: ∇p/ρ + ½∇V² + g∇z = V × (∇ × V). Dotting with ds along a streamline kills the right side, giving ∫dp/ρ + V²/2 + gz = constant.',
    },
    {
      id: 'bernoulli',
      title: 'The Bernoulli equation (steady, inviscid, incompressible)',
      src: L11,
      summary:
        'With ρ constant, p/ρ + V²/2 + gz is constant along a streamline; divided by g it is the head form p/γ + V²/2g + z = H, pictured by the EGL and HGL.',
    },
    {
      id: 'irrotational-bernoulli',
      title: 'Bernoulli between any two points in irrotational flow',
      src: F2212,
      summary:
        'If ∇ × V = 0 the curl term vanishes everywhere, Euler can be dotted with any displacement, and p/ρ + V²/2 + gz takes the same value on every streamline (Fox Eq. 6.26).',
    },
    {
      id: 'pressure-from-potential',
      title: 'Pressure field from a velocity potential',
      src: P2,
      summary:
        'φ → V = ∇φ → check ∇²φ = 0 → ψ → irrotational Bernoulli. Lecture 11: φ = 8xy gives ψ = 4(y² − x²) and Δp = 120 kPa between (0, 0.5) and (0, 2).',
    },
  ],
  sourceNote: md`**Sources.** Lecture 10, slides 9–11 (steady Euler equation → integral along a streamline → Bernoulli) and Lecture 11, slide 2, problem 2 (statement only — the full solution here is written for this platform), with Fox & McDonald pp. 221–222 (§6.6: the HGL/EGL remark, irrotationality, Bernoulli between any two points, Eqs. 6.8, 6.9, 6.22–6.30). The slides print **no equation numbers**; numbers shown are Fox's. Sign conventions: the course uses $\vb V = +\nabla\phi$ (Lecture 10, slide 6) and $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$ (Lecture 9, slide 12); **Fox uses $\vb V = -\nabla\phi$** (Eq. 6.27). Everything marked ✦ is supplementary.`,
}

/* -------------------------------------------------------------------------------------------- formulas */

const RHO = { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` }
const PRESS = { sym: md`p`, desc: 'static (thermodynamic) pressure', units: md`\mathrm{Pa}` }
const VEL = { sym: md`\vb V`, desc: md`velocity vector, $\vb V = u\hat{\mathbf i} + v\hat{\mathbf j} + w\hat{\mathbf k}$`, units: md`\mathrm{m/s}` }
const SPEED = { sym: md`V`, desc: md`flow speed, $V^2 = \vb V\cdot\vb V = u^2 + v^2 + w^2$`, units: md`\mathrm{m/s}` }
const GRAV = { sym: md`g`, desc: 'magnitude of the gravitational acceleration (9.81 on Earth)', units: md`\mathrm{m/s^2}` }
const ZED = { sym: md`z`, desc: 'elevation: vertical coordinate, positive **upward**, measured from any datum', units: md`\mathrm{m}` }
const CURL = { sym: md`\nabla\times\vb V`, desc: md`vorticity (curl of the velocity) $= 2\boldsymbol\omega$, twice the particle angular velocity`, units: md`\mathrm{s^{-1}}` }
const LAMB = {
  sym: md`\vb V\times(\nabla\times\vb V)`,
  desc: 'the "Lamb vector": always perpendicular to both V and ∇×V',
  units: md`\mathrm{m/s^2}`,
}
const GAMMA = { sym: md`\gamma`, desc: md`specific weight, $\gamma = \rho g$ (9810 N/m³ for water)`, units: md`\mathrm{N/m^3}` }

export const formulas: FormulaDef[] = [
  /* ---------------- concept 1: Lecture 10 slides 9–10 ---------------- */
  {
    id: 'euler-vector',
    name: "Euler's equation of motion (vector form)",
    tex: md`\rho\vb g - \nabla p = \rho\left[\pd{\vb V}{t} + (\vb V\cdot\nabla)\vb V\right]`,
    vars: [
      RHO,
      { sym: md`\vb g`, desc: 'gravitational acceleration vector (body force per unit mass)', units: md`\mathrm{m/s^2}` },
      PRESS,
      VEL,
      { sym: md`t`, desc: 'time', units: md`\mathrm{s}` },
      { sym: md`\nabla`, desc: md`gradient operator $\hat{\mathbf i}\,\partial/\partial x + \hat{\mathbf j}\,\partial/\partial y + \hat{\mathbf k}\,\partial/\partial z$`, units: md`\mathrm{m^{-1}}` },
      { sym: md`(\vb V\cdot\nabla)\vb V`, desc: md`convective acceleration, $u\,\pd{\vb V}{x} + v\,\pd{\vb V}{y} + w\,\pd{\vb V}{z}$`, units: md`\mathrm{m/s^2}` },
    ],
    conditions: [
      md`**inviscid**: all shear stresses zero, normal stresses equal to $-p$ (Lecture 10, slide 5)`,
      md`steady or unsteady; density may vary (it stays inside the equation)`,
    ],
    use: md`Newton's second law per unit volume for a frictionless fluid: gravity + net pressure force = density × acceleration. It is the first line of slide 9 and the starting point of everything in this topic.`,
    src: [L9, { doc: 'lec10', pages: '5', note: 'derived from the Cauchy equations' }],
  },
  {
    id: 'euler-steady',
    name: "Euler's equation for steady flow",
    tex: md`\rho\vb g - \nabla p = \rho(\vb V\cdot\nabla)\vb V`,
    vars: [RHO, { sym: md`\vb g`, desc: 'gravitational acceleration vector', units: md`\mathrm{m/s^2}` }, PRESS, VEL],
    conditions: ['inviscid', md`**steady**: $\partial\vb V/\partial t = 0$ at every fixed point`, 'density may still vary'],
    use: md`Drop the local acceleration. The convective part remains: in steady flow particles still speed up, slow down and turn as they move from place to place.`,
    src: { doc: 'lec10', pages: '9', note: 'labelled "Steady Flow"' },
  },
  {
    id: 'vector-identity',
    name: 'Vector identity for the convective acceleration',
    key: true,
    tex: md`(\vb V\cdot\nabla)\vb V = \tfrac{1}{2}\nabla(\vb V\cdot\vb V) - \vb V\times(\nabla\times\vb V)`,
    vars: [VEL, { sym: md`\vb V\cdot\vb V = V^2`, desc: 'square of the speed', units: md`\mathrm{m^2/s^2}` }, CURL, LAMB],
    conditions: ['pure vector calculus: true for **any** smooth vector field — no physical assumption is made'],
    use: md`Splits the awkward convective acceleration into a **gradient** ($\tfrac12\nabla V^2$, which integrates at once) plus a term **perpendicular to $\vb V$** (which drops out along a streamline and vanishes in irrotational flow).`,
    src: [L9, { doc: 'fox', pages: '221' }],
  },
  {
    id: 'gravity-potential',
    name: 'Gravity written as a gradient',
    tex: md`\vb g = -g\nabla z = 0\,\hat{\mathbf i} + 0\,\hat{\mathbf j} - g\,\hat{\mathbf k}`,
    vars: [
      { sym: md`\vb g`, desc: 'gravitational acceleration vector', units: md`\mathrm{m/s^2}` },
      GRAV,
      ZED,
      { sym: md`\hat{\mathbf i},\ \hat{\mathbf j},\ \hat{\mathbf k}`, desc: md`unit vectors along $x$, $y$, $z$ ($\nabla z = \hat{\mathbf k}$)`, units: md`-` },
    ],
    conditions: [md`$z$ axis vertical and pointing **up**`, 'uniform gravity'],
    use: md`$gz$ is the potential energy per unit mass, so writing gravity as $-\nabla(gz)$ lets it join the other gradient terms of Euler's equation.`,
    src: L9,
  },
  {
    id: 'euler-substituted',
    name: 'Steady Euler equation after both substitutions',
    tex: md`-\rho g\nabla z - \nabla p = \frac{\rho}{2}\nabla(\vb V\cdot\vb V) - \rho\,\vb V\times(\nabla\times\vb V)`,
    vars: [RHO, GRAV, ZED, PRESS, VEL, LAMB],
    conditions: ['steady, inviscid', 'density may vary'],
    use: md`Intermediate line of slide 9: the identity replaces $(\vb V\cdot\nabla)\vb V$ and $-g\nabla z$ replaces $\vb g$. Divide by $\rho$ and rearrange to get the gradient form.`,
    src: L9,
  },
  {
    id: 'euler-gradient',
    name: 'Steady Euler equation — gradient form',
    key: true,
    tex: md`\frac{\nabla p}{\rho} + \frac{1}{2}\nabla(V^2) + g\nabla z = \vb V\times(\nabla\times\vb V)`,
    vars: [
      { sym: md`\nabla p/\rho`, desc: 'pressure force per unit mass (with sign reversed)', units: md`\mathrm{m/s^2}` },
      { sym: md`\tfrac12\nabla(V^2)`, desc: 'gradient of kinetic energy per unit mass', units: md`\mathrm{m/s^2}` },
      { sym: md`g\nabla z`, desc: 'gradient of potential energy per unit mass', units: md`\mathrm{m/s^2}` },
      RHO,
      SPEED,
      GRAV,
      ZED,
      LAMB,
    ],
    conditions: ['steady, inviscid', md`density may vary (it stays under $\nabla p$)`, 'a vector equation: it holds in every direction at every point'],
    use: md`Left side: gradients of pressure, kinetic and potential energy per unit mass. Right side: the only part that is not a gradient. Dot it with a direction to get a scalar equation along that direction — along a streamline (slide 10) or, in irrotational flow, along any path (concept 3).`,
    src: [L9, { doc: 'lec10', pages: '10', note: 'first line' }],
  },
  {
    id: 'euler-dot-ds',
    name: 'Gradient form dotted with a streamline element',
    tex: md`\frac{\nabla p}{\rho}\cdot d\vb s + \frac{1}{2}\nabla(V^2)\cdot d\vb s + g\nabla z\cdot d\vb s = [\vb V\times(\nabla\times\vb V)]\cdot d\vb s`,
    vars: [
      { sym: md`d\vb s`, desc: md`line element **along a streamline** (tangent to $\vb V$), $d\vb s = dx\,\hat{\mathbf i} + dy\,\hat{\mathbf j} + dz\,\hat{\mathbf k}$`, units: md`\mathrm{m}` },
      PRESS,
      RHO,
      SPEED,
      GRAV,
      ZED,
      LAMB,
    ],
    conditions: ['steady, inviscid', md`$d\vb s$ taken along a streamline, so $d\vb s\parallel\vb V$`],
    use: md`Projects the vector equation on the streamline. The right-hand side is then zero because $\vb V\times(\nabla\times\vb V)\perp\vb V$ (slide 10's figure).`,
    src: L10,
  },
  {
    id: 'ds-total-differential',
    name: 'Gradient · line element = change along the line',
    tex: md`d\vb s = dx\,\hat{\mathbf i} + dy\,\hat{\mathbf j} + dz\,\hat{\mathbf k}, \qquad \nabla p\cdot d\vb s = \pd{p}{x}dx + \pd{p}{y}dy + \pd{p}{z}dz = dp`,
    vars: [
      { sym: md`dx,\ dy,\ dz`, desc: md`components of the displacement $d\vb s$`, units: md`\mathrm{m}` },
      { sym: md`dp`, desc: md`change of pressure over the displacement $d\vb s$`, units: md`\mathrm{Pa}` },
    ],
    conditions: [md`$p$ differentiable; the same rule holds for any scalar: $\nabla(V^2)\cdot d\vb s = d(V^2)$, $\nabla z\cdot d\vb s = dz$`],
    use: md`This is the chain rule: a gradient dotted with a small displacement is the change of that quantity over the displacement. Slide 10 writes it out for $p$; the other two terms follow in the same way.`,
    src: L10,
  },
  {
    id: 'euler-streamline-differential',
    name: "Euler's equation along a streamline (differential form)",
    tex: md`\frac{dp}{\rho} + \frac{1}{2}\,d(V^2) + g\,dz = 0`,
    vars: [
      { sym: md`dp`, desc: 'change of pressure along the streamline', units: md`\mathrm{Pa}` },
      { sym: md`d(V^2)`, desc: 'change of the squared speed along the streamline', units: md`\mathrm{m^2/s^2}` },
      { sym: md`dz`, desc: 'change of elevation along the streamline', units: md`\mathrm{m}` },
      RHO,
      GRAV,
    ],
    conditions: ['steady, inviscid', 'along a streamline (the curl term has dropped out)', md`density may vary — integrate once $\rho(p)$ is known`],
    use: md`Per unit mass: pressure work + change of kinetic energy + change of potential energy = 0 for a particle moving along its streamline.`,
    src: L10,
  },
  {
    id: 'bernoulli-compressible',
    name: 'Streamline integral of the steady Euler equation (compressible form)',
    key: true,
    tex: md`\int\frac{dp}{\rho} + \frac{V^2}{2} + gz = \text{constant}`,
    vars: [
      { sym: md`\int dp/\rho`, desc: md`pressure integral along the streamline — needs $\rho$ as a function of $p$`, units: md`\mathrm{J/kg}` },
      SPEED,
      GRAV,
      ZED,
    ],
    conditions: [
      'steady, inviscid',
      'along a streamline — the constant may differ from one streamline to another',
      md`compressible flow allowed, but a relation $\rho(p)$ must be known (e.g. isothermal ideal gas $\rho = p/RT$, giving $RT\ln p$)`,
    ],
    use: md`For a gas, evaluate $\int dp/\rho$ with the process relation. For a liquid, $\rho$ is constant and the integral is just $p/\rho$ — Bernoulli's equation (slide 11).`,
    src: [L10, { doc: 'lec10', pages: '11', note: 'first line' }],
  },

  /* ---------------- concept 2: Lecture 10 slide 11, Fox p. 221 ---------------- */
  {
    id: 'bernoulli-streamline',
    name: 'Bernoulli equation (energy per unit mass)',
    key: true,
    tag: '6.8',
    tex: md`\frac{p}{\rho} + \frac{V^2}{2} + gz = \text{constant along a streamline}`,
    vars: [
      PRESS,
      { sym: md`\rho`, desc: 'density, **constant**', units: md`\mathrm{kg/m^3}` },
      SPEED,
      GRAV,
      ZED,
      { sym: md`p/\rho,\ V^2/2,\ gz`, desc: 'pressure energy, kinetic energy and potential energy per unit mass', units: md`\mathrm{J/kg = m^2/s^2}` },
    ],
    conditions: [
      '**steady** flow',
      '**inviscid**: no friction — and no pump or turbine between the two points',
      md`**incompressible** ($\rho$ constant)`,
      md`**along a streamline**: in general the constant changes from one streamline to another (Fox p. 221)`,
    ],
    use: md`Write it at two points of the same streamline and solve for the one unknown. Use either absolute or gauge pressures — but the same kind at both points.`,
    src: [L11, { doc: 'fox', pages: '221', note: 'Eq. (6.8)' }],
  },
  {
    id: 'bernoulli-head',
    name: 'Bernoulli equation — head form',
    key: true,
    tex: md`\frac{p_1}{\gamma} + \frac{V_1^2}{2g} + z_1 = \frac{p_2}{\gamma} + \frac{V_2^2}{2g} + z_2`,
    vars: [
      GAMMA,
      { sym: md`p/\gamma`, desc: 'pressure head', units: md`\mathrm{m}` },
      { sym: md`V^2/2g`, desc: 'velocity head', units: md`\mathrm{m}` },
      { sym: md`z`, desc: 'elevation head above the datum', units: md`\mathrm{m}` },
      { sym: md`1,\ 2`, desc: 'two points on the **same streamline**', units: md`-` },
    ],
    conditions: ['steady, inviscid, incompressible', 'points 1 and 2 on the same streamline (anywhere, if the flow is also irrotational — concept 3)'],
    use: md`Divide the energy-per-mass form by $g$: each term becomes energy per unit **weight** (J/N = m) — a height of liquid. Their sum is the **total head** $H$, constant along the streamline.`,
    src: L11,
  },
  {
    id: 'bernoulli-pressure',
    name: 'Bernoulli equation — pressure form',
    tex: md`p + \tfrac{1}{2}\rho V^2 + \rho g z = \text{constant along a streamline}`,
    vars: [
      { sym: md`p`, desc: 'static pressure', units: md`\mathrm{Pa}` },
      { sym: md`\tfrac12\rho V^2`, desc: 'dynamic pressure', units: md`\mathrm{Pa}` },
      { sym: md`\rho g z`, desc: 'hydrostatic (elevation) term', units: md`\mathrm{Pa}` },
      { sym: md`p_0 = p + \tfrac12\rho V^2`, desc: 'stagnation pressure (value where the flow is brought to rest at the same height)', units: md`\mathrm{Pa}` },
    ],
    conditions: ['same as the Bernoulli equation: steady, inviscid, incompressible, along a streamline'],
    use: md`Multiply the slide-11 form by $\rho$: energy per unit **volume**, in pascals. Convenient for pressure differences and Pitot tubes: $V = \sqrt{2(p_0 - p)/\rho}$.`,
  },
  {
    id: 'hgl-egl',
    name: 'Energy and hydraulic grade lines',
    tex: md`\text{HGL} = \text{EGL} - \frac{V^2}{2g}, \qquad \text{EGL} = \frac{p}{\gamma} + \frac{V^2}{2g} + z, \qquad \text{HGL} = \frac{p}{\gamma} + z`,
    vars: [
      { sym: md`\text{EGL}`, desc: 'energy grade line: height of the total head H (a Pitot tube rises to it)', units: md`\mathrm{m}` },
      { sym: md`\text{HGL}`, desc: 'hydraulic grade line: piezometric head (a piezometer tapping rises to it)', units: md`\mathrm{m}` },
      { sym: md`V`, desc: 'average speed in the pipe', units: md`\mathrm{m/s}` },
      GAMMA,
      ZED,
    ],
    conditions: [
      'Fox p. 221 states the first relation: the HGL is always lower than the EGL by V²/2g',
      'the definitions of EGL and HGL (from the preceding Fox section, not in the excerpt) are given here as standard background',
      'without losses (inviscid flow) the EGL is horizontal',
    ],
    use: md`The value of $V$ is set by the whole system (reservoir height, pipe diameter, …), but **changes** of $V$ — and therefore steps in the HGL — occur **only where the diameter changes** (Fox p. 221). In a constant-diameter pipe the HGL runs parallel to the EGL.`,
    src: { doc: 'fox', pages: '221', note: 'end of §6.4, item 2' },
  },
  {
    id: 'continuity-q',
    name: 'Volume flow rate (incompressible continuity)',
    tex: md`Q = V_1 A_1 = V_2 A_2, \qquad A = \frac{\pi D^2}{4}`,
    vars: [
      { sym: md`Q`, desc: 'volume flow rate', units: md`\mathrm{m^3/s}` },
      { sym: md`V_1,\ V_2`, desc: 'average speeds at sections 1 and 2', units: md`\mathrm{m/s}` },
      { sym: md`A`, desc: 'cross-sectional area', units: md`\mathrm{m^2}` },
      { sym: md`D`, desc: 'pipe diameter', units: md`\mathrm{m}` },
    ],
    conditions: ['incompressible, steady', 'uniform velocity over each cross-section (one-dimensional approximation)'],
    use: md`Supplies the speeds that Bernoulli needs: $V_2/V_1 = (D_1/D_2)^2$, so halving the diameter quadruples the speed and multiplies the velocity head by 16.`,
  },

  /* ---------------- concept 3: Fox pp. 221–222 ---------------- */
  {
    id: 'irrot-curl',
    name: 'Irrotationality condition',
    tag: '6.22',
    tex: md`\nabla\times\vb V = 0`,
    vars: [CURL, { sym: md`\boldsymbol\omega`, desc: 'angular velocity of fluid particles; irrotational means ω = 0', units: md`\mathrm{rad/s}` }],
    conditions: ['must hold throughout the region considered (a free vortex is irrotational only for r > 0)'],
    use: md`The test for irrotational flow. When it holds: a velocity potential exists, and Bernoulli's constant is the same on every streamline.`,
    src: { doc: 'fox', pages: '221', note: 'Eq. (6.22)' },
  },
  {
    id: 'irrot-cartesian',
    name: 'Irrotationality in Cartesian components',
    tag: '6.23',
    tex: md`\pd{w}{y} - \pd{v}{z} = \pd{u}{z} - \pd{w}{x} = \pd{v}{x} - \pd{u}{y} = 0`,
    vars: [
      { sym: md`u,\ v,\ w`, desc: md`velocity components along $x$, $y$, $z$`, units: md`\mathrm{m/s}` },
      { sym: md`x,\ y,\ z`, desc: 'Cartesian coordinates', units: md`\mathrm{m}` },
      { sym: md`\pd{v}{x} - \pd{u}{y}`, desc: md`$z$-component of $\nabla\times\vb V$ (the other two differences are the $x$- and $y$-components)`, units: md`\mathrm{s^{-1}}` },
    ],
    conditions: [md`for plane flow in the $xy$-plane ($w = 0$, no $z$-dependence) only $\pd{v}{x} - \pd{u}{y} = 0$ is non-trivial`],
    use: md`Compute the three cross-derivative differences; all must vanish. Example: $u = 2y$, $v = 4x$ gives $4 - 2 = 2 \ne 0$ — rotational.`,
    src: { doc: 'fox', pages: '221', note: 'Eq. (6.23)' },
  },
  {
    id: 'irrot-cyl',
    name: 'Irrotationality in cylindrical components',
    tag: '6.24',
    tex: md`\frac{1}{r}\pd{V_z}{\theta} - \pd{V_\theta}{z} = \pd{V_r}{z} - \pd{V_z}{r} = \frac{1}{r}\pd{(rV_\theta)}{r} - \frac{1}{r}\pd{V_r}{\theta} = 0`,
    vars: [
      { sym: md`V_r,\ V_\theta,\ V_z`, desc: 'radial, tangential and axial velocity components', units: md`\mathrm{m/s}` },
      { sym: md`r,\ \theta,\ z`, desc: 'cylindrical coordinates (θ in radians)', units: md`\mathrm{m,\ rad,\ m}` },
    ],
    conditions: [md`the third difference contains the derivative of the **product** $rV_\theta$`],
    use: md`For swirling flows: a free vortex $V_\theta = K/r$ has $rV_\theta = K$, so $\frac1r\pd{(rV_\theta)}{r} = 0$ — irrotational; a forced vortex $V_\theta = \Omega r$ gives $2\Omega \ne 0$ — rotational.`,
    src: { doc: 'fox', pages: '221', note: 'Eq. (6.24)' },
  },
  {
    id: 'euler-fox',
    name: "Euler's equation in Fox's form (steady)",
    tag: '6.9',
    tex: md`(\vb V\cdot\nabla)\vb V = -\frac{1}{\rho}\nabla p - g\hat{\mathbf k}`,
    vars: [VEL, RHO, PRESS, GRAV, { sym: md`\hat{\mathbf k}`, desc: 'unit vector pointing vertically upward', units: md`-` }],
    conditions: ['steady, inviscid', md`$z$ vertical and up — identical to slide 9's steady form divided by $\rho$, with $\vb g = -g\hat{\mathbf k}$`],
    use: md`Fox's starting point for Bernoulli in irrotational flow; apply the vector identity to its left side.`,
    src: { doc: 'fox', pages: '221', note: 'Eq. (6.9)' },
  },
  {
    id: 'euler-irrot',
    name: "Euler's equation for irrotational flow",
    tag: '6.25',
    tex: md`\tfrac{1}{2}\nabla(\vb V\cdot\vb V) = \tfrac{1}{2}\nabla(V^2) = -\frac{1}{\rho}\nabla p - g\hat{\mathbf k}`,
    vars: [SPEED, RHO, PRESS, GRAV, { sym: md`\hat{\mathbf k}`, desc: 'upward unit vector', units: md`-` }],
    conditions: ['steady, inviscid', md`**irrotational**: $\nabla\times\vb V = 0$ removes the Lamb term from the identity`],
    use: md`Every term is now a gradient, so the equation can be dotted with **any** displacement — not only one along a streamline.`,
    src: { doc: 'fox', pages: '221', note: 'Eq. (6.25)' },
  },
  {
    id: 'any-displacement',
    name: "Euler's equation along an arbitrary displacement",
    tex: md`\tfrac{1}{2}\nabla(V^2)\cdot d\vec r = -\frac{1}{\rho}\nabla p\cdot d\vec r - g\hat{\mathbf k}\cdot d\vec r \;\Rightarrow\; \frac{dp}{\rho} + \frac{1}{2}d(V^2) + g\,dz = 0`,
    vars: [
      { sym: md`d\vec r`, desc: md`arbitrary infinitesimal displacement $dx\,\hat{\mathbf i} + dy\,\hat{\mathbf j} + dz\,\hat{\mathbf k}$, in **any** direction`, units: md`\mathrm{m}` },
      { sym: md`dp,\ d(V^2),\ dz`, desc: md`changes of $p$, $V^2$ and $z$ over $d\vec r$`, units: md`\mathrm{Pa,\ m^2/s^2,\ m}` },
      RHO,
      GRAV,
    ],
    conditions: ['steady, inviscid, irrotational', md`$d\vec r$ need **not** lie along a streamline`],
    use: md`The same differential relation as slide 10 — but now valid along every path through the flow, which is what removes the "along a streamline" restriction.`,
    src: { doc: 'fox', pages: '222' },
  },
  {
    id: 'bernoulli-any',
    name: 'Bernoulli between any two points (irrotational flow)',
    key: true,
    tag: '6.26',
    tex: md`\frac{p}{\rho} + \frac{V^2}{2} + gz = \text{constant — the same for all streamlines}`,
    vars: [PRESS, { sym: md`\rho`, desc: 'density, constant', units: md`\mathrm{kg/m^3}` }, SPEED, GRAV, ZED],
    conditions: ['steady', 'incompressible', 'inviscid', md`**irrotational** ($\nabla\times\vb V = 0$) — then valid between **any** two points, not just along a streamline`],
    use: md`Pick any two points — on the same or on different streamlines — and write $\frac{p_1}{\rho} + \frac{V_1^2}{2} + gz_1 = \frac{p_2}{\rho} + \frac{V_2^2}{2} + gz_2$. This is what turns a velocity potential into a pressure field (concept 4).`,
    src: { doc: 'fox', pages: '222', note: 'Eq. (6.26)' },
  },
  {
    id: 'bernoulli-gradient',
    name: 'How the Bernoulli constant varies in space',
    tex: md`\nabla\!\left(\frac{p}{\rho} + \frac{V^2}{2} + gz\right) = \vb V\times(\nabla\times\vb V)`,
    vars: [
      { sym: md`B = p/\rho + V^2/2 + gz`, desc: 'Bernoulli "constant" (mechanical energy per unit mass)', units: md`\mathrm{J/kg}` },
      LAMB,
    ],
    conditions: ['steady, inviscid', md`$\rho$ constant, so that $\nabla p/\rho = \nabla(p/\rho)$ — the slide-9 gradient form rearranged`],
    use: md`Because $\vb V\times(\nabla\times\vb V)$ is perpendicular to $\vb V$ (and to $\nabla\times\vb V$), $B$ is constant **along streamlines** and along vortex lines. If $\nabla\times\vb V = 0$, then $\nabla B = 0$: $B$ is the same everywhere. In plane flow, $B$ changes across the streamlines at the rate $V\,\lvert\nabla\times\vb V\rvert$ per metre.`,
  },

  /* ---------------- concept 4: velocity potential and pressure ---------------- */
  {
    id: 'phi-lecture',
    name: 'Velocity potential — course convention',
    tex: md`u = \pd{\phi}{x}, \quad v = \pd{\phi}{y}, \quad w = \pd{\phi}{z}, \qquad \vb V = \nabla\phi`,
    vars: [
      { sym: md`\phi(x, y, z, t)`, desc: 'velocity potential (a scalar function)', units: md`\mathrm{m^2/s}` },
      { sym: md`u,\ v,\ w`, desc: 'velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: ['exists only for **irrotational** flow', md`course sign: **no minus sign** (Fox's Eq. 6.27 has one)`],
    use: md`Differentiate $\phi$ to get the velocity. Used for all Lecture 10/11 problems.`,
    src: { doc: 'lec10', pages: '6' },
  },
  {
    id: 'phi-lecture-cyl',
    name: 'Velocity potential in cylindrical coordinates — course convention',
    tex: md`v_r = \pd{\phi}{r}, \quad v_\theta = \frac{1}{r}\pd{\phi}{\theta}, \quad v_z = \pd{\phi}{z}`,
    vars: [
      { sym: md`v_r,\ v_\theta,\ v_z`, desc: 'radial, tangential and axial velocity components', units: md`\mathrm{m/s}` },
      { sym: md`r,\ \theta,\ z`, desc: 'cylindrical coordinates', units: md`\mathrm{m,\ rad,\ m}` },
      { sym: md`\phi`, desc: 'velocity potential', units: md`\mathrm{m^2/s}` },
    ],
    conditions: ['irrotational flow', md`course sign ($\vb V = \nabla\phi$); the $1/r$ sits on $v_\theta$`],
    use: md`For potentials written in polar form, e.g. $\phi = m\ln r$ (source) or $\phi = K\theta$ (free vortex).`,
    src: { doc: 'lec10', pages: '8' },
  },
  {
    id: 'laplace-phi',
    name: "Laplace's equation for the velocity potential",
    tex: md`\nabla^2\phi = \frac{\partial^2\phi}{\partial x^2} + \frac{\partial^2\phi}{\partial y^2} + \frac{\partial^2\phi}{\partial z^2} = 0`,
    vars: [
      { sym: md`\nabla^2`, desc: md`Laplacian operator $\nabla\cdot\nabla$`, units: md`\mathrm{m^{-2}}` },
      { sym: md`\phi`, desc: 'velocity potential', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [md`incompressible ($\nabla\cdot\vb V = 0$) **and** irrotational ($\phi$ exists)`],
    use: md`Check it for any given $\phi$: if $\nabla^2\phi \ne 0$ the field is not an incompressible flow, and Bernoulli with constant $\rho$ does not apply.`,
    src: { doc: 'lec10', pages: '7' },
  },
  {
    id: 'psi-cartesian',
    name: 'Stream function — course convention',
    tex: md`u = \pd{\psi}{y}, \qquad v = -\pd{\psi}{x}`,
    vars: [
      { sym: md`\psi(x, y)`, desc: 'stream function: constant along each streamline', units: md`\mathrm{m^2/s}` },
      { sym: md`u,\ v`, desc: 'velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: ['plane, incompressible flow', 'the minus sign sits on v'],
    use: md`Given $\phi$: get $(u, v)$, integrate $\pd{\psi}{y} = u$ in $y$ (adding $f(x)$), then fix $f$ from $v = -\pd{\psi}{x}$. Points with different $\psi$ lie on different streamlines.`,
    src: { doc: 'lec9', pages: '12' },
  },
  {
    id: 'phi-fox',
    name: "Velocity potential — Fox's convention",
    tag: '6.27',
    tex: md`\vb V = -\nabla\phi`,
    vars: [
      { sym: md`\phi`, desc: 'potential function (velocity potential)', units: md`\mathrm{m^2/s}` },
      VEL,
    ],
    conditions: ['irrotational flow', md`**minus sign** — opposite to the course's $\vb V = \nabla\phi$`],
    use: md`Fox inserts the minus sign only so that $\phi$ **decreases** in the flow direction, like temperature decreasing in the direction of heat flow. For the same flow, Fox's $\phi$ is the negative of the course's; the velocity, speed and pressures are identical.`,
    src: { doc: 'fox', pages: '222', note: 'Eq. (6.27)' },
  },
  {
    id: 'curl-grad',
    name: 'The curl of a gradient vanishes',
    tag: '6.28',
    tex: md`\nabla\times\vb V = -\nabla\times\nabla\phi = -\operatorname{curl}(\operatorname{grad}\phi) \equiv 0`,
    vars: [{ sym: md`\phi`, desc: 'any continuous scalar function with continuous second derivatives', units: md`\mathrm{m^2/s}` }, CURL],
    conditions: [md`identity — holds for **every** smooth $\phi$ (Fox footnote 3: expand into components)`],
    use: md`Any $\phi$ automatically gives an irrotational velocity field — and conversely a velocity potential exists **only** for irrotational flow.`,
    src: { doc: 'fox', pages: '222', note: 'Eq. (6.28)' },
  },
  {
    id: 'phi-fox-cartesian',
    name: "Velocity components from φ — Fox's convention",
    tag: '6.29',
    tex: md`u = -\pd{\phi}{x}, \qquad v = -\pd{\phi}{y}, \qquad w = -\pd{\phi}{z}`,
    vars: [
      { sym: md`u,\ v,\ w`, desc: 'velocity components', units: md`\mathrm{m/s}` },
      { sym: md`\phi`, desc: "velocity potential (Fox's sign)", units: md`\mathrm{m^2/s}` },
    ],
    conditions: ["Fox's sign convention", 'the irrotationality condition, Eq. 6.22, is then satisfied identically'],
    use: md`Use only with potentials quoted from Fox; in this course drop the minus signs.`,
    src: { doc: 'fox', pages: '222', note: 'Eq. (6.29)' },
  },
  {
    id: 'grad-cyl',
    name: 'Gradient operator in cylindrical coordinates',
    tag: '3.19',
    tex: md`\nabla = \hat e_r\frac{\partial}{\partial r} + \hat e_\theta\frac{1}{r}\frac{\partial}{\partial \theta} + \hat{\mathbf k}\frac{\partial}{\partial z}`,
    vars: [
      { sym: md`\hat e_r,\ \hat e_\theta,\ \hat{\mathbf k}`, desc: md`unit vectors in the $r$, $\theta$ and $z$ directions`, units: md`-` },
      { sym: md`r,\ \theta,\ z`, desc: 'cylindrical coordinates', units: md`\mathrm{m,\ rad,\ m}` },
    ],
    conditions: [md`$\theta$ in radians; the $1/r$ makes the $\theta$-term a derivative per unit **length**`],
    use: md`Apply to $\phi$ to obtain the cylindrical velocity components (Eq. 6.30, or Lecture 10 slide 8 without the minus signs).`,
    src: { doc: 'fox', pages: '222', note: 'Eq. (3.19)' },
  },
  {
    id: 'phi-fox-cyl',
    name: "Cylindrical velocity components from φ — Fox's convention",
    tag: '6.30',
    tex: md`V_r = -\pd{\phi}{r}, \qquad V_\theta = -\frac{1}{r}\pd{\phi}{\theta}, \qquad V_z = -\pd{\phi}{z}`,
    vars: [
      { sym: md`V_r,\ V_\theta,\ V_z`, desc: 'radial, tangential and axial velocity components', units: md`\mathrm{m/s}` },
      { sym: md`\phi`, desc: "velocity potential (Fox's sign)", units: md`\mathrm{m^2/s}` },
    ],
    conditions: ["Fox's sign convention", 'irrotational flow'],
    use: md`Same structure as the course's cylindrical form (Lecture 10, slide 8) with every sign reversed.`,
    src: { doc: 'fox', pages: '222', note: 'Eq. (6.30)' },
  },
  {
    id: 'pressure-from-phi',
    name: 'Pressure field of a potential flow',
    key: true,
    tex: md`p_2 - p_1 = \tfrac{1}{2}\rho\left(V_1^2 - V_2^2\right) + \rho g\,(z_1 - z_2), \qquad V^2 = \lvert\nabla\phi\rvert^2 = \phi_x^2 + \phi_y^2 + \phi_z^2`,
    vars: [
      { sym: md`p_1,\ p_2`, desc: 'pressures at any two points of the flow', units: md`\mathrm{Pa}` },
      { sym: md`V_1,\ V_2`, desc: md`speeds there, from $V = \lvert\nabla\phi\rvert$`, units: md`\mathrm{m/s}` },
      { sym: md`\phi_x,\ \phi_y,\ \phi_z`, desc: md`partial derivatives of $\phi$`, units: md`\mathrm{m/s}` },
      RHO,
      GRAV,
      { sym: md`z_1,\ z_2`, desc: 'elevations (drop the term if the plane is horizontal)', units: md`\mathrm{m}` },
    ],
    conditions: ['steady, inviscid, incompressible', md`irrotational — guaranteed by the existence of $\phi$ (Fox Eq. 6.28) — so Fox Eq. 6.26 links **any** two points`, md`independent of the sign convention for $\phi$: only $V^2$ enters`],
    use: md`Taking point 1 at a stagnation point ($V = 0$, pressure $p_0$, height $z_0$) gives the whole field: $p = p_0 - \tfrac12\rho\lvert\nabla\phi\rvert^2 - \rho g(z - z_0)$.`,
  },
]

/* -------------------------------------------------------------------------------------------- examples */

export const examples: ExampleDef[] = [
  {
    id: 'ex-forced-vortex-terms',
    concept: 'euler-streamline',
    title: 'Forced vortex: every term of the steady Euler equation',
    difficulty: 2,
    given: md`Rigid-body rotation (a forced vortex) of water, $\rho = 1000$ kg/m³, in a horizontal plane: $u = -\Omega y$, $v = \Omega x$, $w = 0$ with $\Omega = 2$ rad/s. Point $P = (0.3,\ 0.4)$ m.`,
    find: md`At $P$: the convective acceleration $(\vb V\cdot\nabla)\vb V$, both terms of the slide-9 identity, the pressure gradient, and whether the curl term acts along the streamline.`,
    assumptions: md`Steady, inviscid; horizontal plane, so $z$ is the same at every point of the plane and $g\nabla z$ has no in-plane component.`,
    steps: [
      {
        title: 'Velocity at P',
        md: md`$u = -\Omega y = -2(0.4) = -0.8$ m/s, $\ v = \Omega x = 2(0.3) = 0.6$ m/s, so $V = \sqrt{0.8^2 + 0.6^2} = 1.0$ m/s. $P$ is at radius $r = \sqrt{0.3^2 + 0.4^2} = 0.5$ m; its streamline is the circle $r = 0.5$ m.`,
      },
      {
        title: 'Convective acceleration, directly',
        md: md`$$
(\vb V\cdot\nabla)\vb V = \left(u\pd{u}{x} + v\pd{u}{y},\ \ u\pd{v}{x} + v\pd{v}{y}\right) = \big(0 + (\Omega x)(-\Omega),\ \ (-\Omega y)(\Omega) + 0\big) = -\Omega^2(x,\ y)
$$

At $P$: $(-1.2,\ -1.6)$ m/s², magnitude $2.0$ m/s² $= V^2/r$, pointing to the centre — the centripetal acceleration.`,
      },
      {
        title: 'First term of the identity',
        md: md`$V^2 = \Omega^2(x^2 + y^2)$, so $\tfrac12\nabla(V^2) = \Omega^2(x,\ y) = (1.2,\ 1.6)$ m/s² — pointing **outward**.`,
      },
      {
        title: 'Vorticity and the Lamb vector',
        md: md`$\nabla\times\vb V = \left(\pd{v}{x} - \pd{u}{y}\right)\hat{\mathbf k} = (\Omega + \Omega)\hat{\mathbf k} = 4\hat{\mathbf k}$ s⁻¹, so

$$
\vb V\times(\nabla\times\vb V) = (u,\ v,\ 0)\times(0,\ 0,\ 4) = (4v,\ -4u,\ 0) = (2.4,\ 3.2,\ 0)\ \mathrm{m/s^2}
$$`,
      },
      {
        title: 'Check the identity',
        md: md`$\tfrac12\nabla(V^2) - \vb V\times(\nabla\times\vb V) = (1.2 - 2.4,\ 1.6 - 3.2) = (-1.2,\ -1.6)$ m/s² — exactly the convective acceleration of step 2. ✓`,
      },
      {
        title: 'Does the curl term act along the streamline?',
        md: md`$\vb V\cdot[\vb V\times(\nabla\times\vb V)] = (-0.8)(2.4) + (0.6)(3.2) = -1.92 + 1.92 = 0$. The Lamb vector points radially **outward**, perpendicular to $\vb V$, so $[\vb V\times(\nabla\times\vb V)]\cdot d\vb s = 0$ for $d\vb s$ along the circle. Consistently, $p$ and $V$ are both constant around the circle, so $dp/\rho + \tfrac12 d(V^2) = 0$ there.`,
      },
      {
        title: 'Pressure gradient from the gradient form',
        md: md`With no in-plane gravity term,

$$
\frac{\nabla p}{\rho} = \vb V\times(\nabla\times\vb V) - \tfrac12\nabla(V^2) = (2.4 - 1.2,\ 3.2 - 1.6) = (1.2,\ 1.6)\ \mathrm{m/s^2} \;\Rightarrow\; \nabla p = (1200,\ 1600)\ \mathrm{Pa/m}
$$

$\lvert\nabla p\rvert = 2000$ Pa/m, radially outward — equal to $\rho V^2/r = 1000(1.0)^2/0.5$: the pressure gradient supplies the centripetal force.`,
      },
    ],
    answer: md`$(\vb V\cdot\nabla)\vb V = (-1.2,\ -1.6)$ m/s²; $\tfrac12\nabla V^2 = (1.2,\ 1.6)$ m/s²; $\vb V\times(\nabla\times\vb V) = (2.4,\ 3.2)$ m/s², perpendicular to $\vb V$; $\nabla p = (1200,\ 1600)$ Pa/m (2000 Pa/m outward).`,
    insight: 'In a rotational flow the curl term is real and large — but it always points across the streamlines, so it never appears in the equation along a streamline.',
  },
  {
    id: 'ex-isothermal-gas',
    concept: 'euler-streamline',
    title: 'Compressible form: isothermal air along a streamline',
    difficulty: 3,
    given: md`Air (ideal gas, $R = 287$ J/(kg·K)) flows steadily along a horizontal streamline at constant temperature $T = 300$ K. At point 1: $p_1 = 200$ kPa (absolute), $V_1 = 50$ m/s. At point 2: $V_2 = 150$ m/s. Neglect friction.`,
    find: md`$p_2$ from $\int dp/\rho + V^2/2 + gz = \text{constant}$, and the constant-density estimate for comparison.`,
    assumptions: md`Steady, inviscid, along one streamline, $z_1 = z_2$; isothermal process (an idealisation, assumed here to fix $\rho(p)$).`,
    steps: [
      {
        title: 'Density–pressure relation',
        md: md`Ideal gas $p = \rho RT$ with $T$ constant, so $\rho = p/(RT)$ and

$$
\int\frac{dp}{\rho} = RT\int\frac{dp}{p} = RT\ln p
$$`,
      },
      {
        title: 'Apply between 1 and 2',
        md: md`$RT\ln p_1 + \tfrac12 V_1^2 = RT\ln p_2 + \tfrac12 V_2^2 \;\Rightarrow\; \ln\dfrac{p_2}{p_1} = -\dfrac{V_2^2 - V_1^2}{2RT}$`,
      },
      {
        title: 'Numbers',
        md: md`$RT = 287 \times 300 = 86\,100$ m²/s²; $\ V_2^2 - V_1^2 = 22\,500 - 2\,500 = 20\,000$ m²/s²; $\ \ln(p_2/p_1) = -20\,000/172\,200 = -0.1161$.`,
      },
      {
        title: 'Result',
        md: md`$p_2/p_1 = e^{-0.1161} = 0.8903 \;\Rightarrow\; p_2 = 178.1$ kPa — a drop of 21.9 kPa.`,
      },
      {
        title: 'Constant-density estimate',
        md: md`Freeze $\rho$ at $\rho_1 = p_1/(RT) = 200\,000/86\,100 = 2.323$ kg/m³: $\ p_2 = p_1 - \tfrac12\rho_1(V_2^2 - V_1^2) = 200\,000 - 23\,229 = 176.8$ kPa.`,
      },
      {
        title: 'Compare',
        md: md`The constant-density estimate overstates the drop by 1.3 kPa (about 6 % of the drop). As the gas accelerates, its pressure **and density** fall, so the same kinetic-energy gain is bought with a smaller pressure drop. The Mach number at 2, $V_2/\sqrt{1.4RT} = 0.43$, is past the usual 0.3 limit for treating a gas as incompressible.`,
      },
    ],
    answer: md`$p_2 \approx 178.1$ kPa (compressible, isothermal) versus $176.8$ kPa (constant density).`,
    insight: 'The compressible streamline integral needs a ρ(p) relation; at low Mach number it collapses to Bernoulli.',
  },
  {
    id: 'ex-inclined-reducer',
    concept: 'bernoulli',
    title: 'Inclined reducer: pressure from the head form',
    difficulty: 2,
    given: md`Water ($\rho = 1000$ kg/m³, $g = 9.81$ m/s², so $\gamma = 9810$ N/m³) flows at $Q = 0.020$ m³/s **upward** through a reducer from $D_1 = 0.10$ m (centreline $z_1 = 0$) to $D_2 = 0.05$ m (centreline $z_2 = 0.50$ m). Gauge pressure at section 1: $p_1 = 150$ kPa.`,
    find: md`$V_1$, $V_2$, the three heads at each section, and $p_2$.`,
    assumptions: md`Steady, inviscid, incompressible; 1 and 2 on the centreline streamline; uniform velocity over each section.`,
    steps: [
      {
        title: 'Speeds from Q = VA',
        md: md`$A_1 = \pi(0.10)^2/4 = 7.854\times10^{-3}$ m² $\Rightarrow V_1 = 0.020/7.854\times10^{-3} = 2.546$ m/s. $\ A_2 = 1.963\times10^{-3}$ m² $\Rightarrow V_2 = 10.19$ m/s — four times $V_1$, since $(D_1/D_2)^2 = 4$.`,
      },
      {
        title: 'Heads at section 1',
        md: md`$p_1/\gamma = 150\,000/9810 = 15.29$ m; $\ V_1^2/2g = 2.546^2/19.62 = 0.331$ m; $\ z_1 = 0$. Total head $H = 15.62$ m.`,
      },
      {
        title: 'Head form at section 2',
        md: md`$V_2^2/2g = 10.19^2/19.62 = 5.288$ m, so

$$
\frac{p_2}{\gamma} = H - \frac{V_2^2}{2g} - z_2 = 15.62 - 5.288 - 0.50 = 9.833\ \text{m}
$$`,
      },
      { title: 'Pressure', md: md`$p_2 = 9810 \times 9.833 = 96\,460$ Pa $\approx 96.5$ kPa (gauge).` },
      {
        title: 'Check with the pressure form',
        md: md`$p_1 - p_2 = \tfrac12\rho(V_2^2 - V_1^2) + \rho g(z_2 - z_1) = 48\,634 + 4\,905 = 53\,540$ Pa, and $150\,000 - 96\,460 = 53\,540$ Pa ✓.`,
      },
    ],
    answer: md`$V_1 = 2.55$ m/s, $V_2 = 10.2$ m/s; $H = 15.62$ m; $p_2 \approx 96.5$ kPa gauge (pressure head 9.83 m).`,
    insight: 'The pressure drop has two parts: 48.6 kPa buys the extra kinetic energy and 4.9 kPa lifts the water 0.5 m.',
  },
  {
    id: 'ex-torricelli',
    concept: 'bernoulli',
    title: 'Draining tank: speed of the jet',
    difficulty: 1,
    given: md`A large open tank holds water with its free surface $h = 3.0$ m above a small, well-rounded nozzle of diameter $d = 25$ mm that discharges to the atmosphere.`,
    find: md`The jet speed $V_2$ and the volume flow rate $Q$.`,
    assumptions: md`Quasi-steady (the surface of a large tank falls very slowly), inviscid, incompressible; one streamline from the free surface (1) to the jet (2); $p_1 = p_2 = p_{atm}$.`,
    steps: [
      {
        title: 'Choose the streamline and the points',
        md: md`Point 1 on the free surface: $p_1 = p_{atm}$, $V_1 \approx 0$, $z_1 = h$. Point 2 in the jet at the nozzle exit: $p_2 = p_{atm}$, $z_2 = 0$.`,
      },
      {
        title: 'Head form',
        md: md`$\dfrac{p_{atm}}{\gamma} + 0 + h = \dfrac{p_{atm}}{\gamma} + \dfrac{V_2^2}{2g} + 0 \;\Rightarrow\; V_2 = \sqrt{2gh}$`,
      },
      { title: 'Speed', md: md`$V_2 = \sqrt{2(9.81)(3.0)} = \sqrt{58.86} = 7.67$ m/s.` },
      {
        title: 'Flow rate',
        md: md`$A = \pi(0.025)^2/4 = 4.909\times10^{-4}$ m², so $Q = V_2A = 3.77\times10^{-3}$ m³/s $= 3.77$ L/s.`,
      },
    ],
    answer: md`$V_2 = \sqrt{2gh} = 7.67$ m/s; $Q = 3.77$ L/s.`,
    insight: 'The elevation head of the free surface becomes velocity head in the jet — the same speed a stone gains falling 3 m.',
  },
  {
    id: 'ex-vortex-pair',
    concept: 'irrotational-bernoulli',
    title: 'Same speeds, opposite answers: free vs forced vortex',
    difficulty: 2,
    given: md`Two horizontal swirling flows of water ($\rho = 1000$ kg/m³) with circular streamlines; points 1 and 2 at radii $r_1 = 0.2$ m and $r_2 = 0.5$ m lie on **different** streamlines.

- Free vortex: $V_\theta = K/r$ with $K = 1.0$ m²/s.
- Forced vortex: $V_\theta = \Omega r$ with $\Omega = 10$ rad/s.`,
    find: md`$p_2 - p_1$ in each flow from Bernoulli "between any two points", checked against Euler's equation.`,
    assumptions: md`Steady, inviscid, incompressible; horizontal plane ($z_1 = z_2$).`,
    steps: [
      {
        title: 'Which flow is irrotational? (Fox Eq. 6.24)',
        md: md`With $V_r = V_z = 0$ only $\frac1r\pd{(rV_\theta)}{r}$ survives. Free vortex: $rV_\theta = K$ gives $0$ — **irrotational**. Forced vortex: $rV_\theta = \Omega r^2$ gives $\frac1r(2\Omega r) = 2\Omega = 20$ s⁻¹ — **rotational**.`,
      },
      {
        title: 'Free vortex — Bernoulli between any two points (Eq. 6.26)',
        md: md`$V_1 = K/r_1 = 5.0$ m/s, $V_2 = K/r_2 = 2.0$ m/s:

$$
p_2 - p_1 = \tfrac12\rho\left(V_1^2 - V_2^2\right) = \tfrac12(1000)(25 - 4) = 10\,500\ \text{Pa}
$$`,
      },
      {
        title: "Check with Euler's equation",
        md: md`For circular streamlines the radial component of Euler's equation reads $\pd{p}{r} = \rho V^2/r$: the inward pressure force supplies the centripetal acceleration. With $V = K/r$:

$$
p_2 - p_1 = \int_{r_1}^{r_2}\frac{\rho K^2}{r^3}\,dr = \tfrac12\rho K^2\left(\frac{1}{r_1^2} - \frac{1}{r_2^2}\right) = 500\,(25 - 4) = 10\,500\ \text{Pa}\ ✓
$$`,
      },
      {
        title: 'Forced vortex — naive Bernoulli across streamlines',
        md: md`$V_1 = \Omega r_1 = 2.0$ m/s and $V_2 = \Omega r_2 = 5.0$ m/s, so one constant would give $p_2 - p_1 = \tfrac12(1000)(4 - 25) = -10\,500$ Pa.`,
      },
      {
        title: "Forced vortex — the truth from Euler's equation",
        md: md`$\pd{p}{r} = \rho\Omega^2 r \;\Rightarrow\; p_2 - p_1 = \tfrac12\rho\Omega^2\left(r_2^2 - r_1^2\right) = \tfrac12(1000)(100)(0.25 - 0.04) = +10\,500$ Pa.`,
      },
      {
        title: 'Diagnosis',
        md: md`$B = p/\rho + V^2/2$ differs between the two streamlines: $B_2 - B_1 = 10.5 + 10.5 = 21$ J/kg $= \Omega^2(r_2^2 - r_1^2)$. In a rotational flow each streamline carries its own constant.`,
      },
    ],
    answer: md`Free vortex: $p_2 - p_1 = +10.5$ kPa (Bernoulli valid). Forced vortex: the true $p_2 - p_1 = +10.5$ kPa, but Bernoulli across streamlines predicts $-10.5$ kPa — the wrong sign.`,
    insight: 'Before writing Bernoulli between points on different streamlines, check that ∇ × V = 0.',
  },
  {
    id: 'ex-lec11-p2',
    concept: 'pressure-from-potential',
    title: 'Lecture 11, problem 2: φ = 8xy — stream function and pressure difference',
    src: P2,
    solutionBy: 'platform',
    difficulty: 2,
    given: md`An inviscid flow field has velocity potential $\phi = 8xy$ (m²/s), with $x$ and $y$ in metres. The fluid is water (take $\rho = 1000$ kg/m³ — the slide gives no value).`,
    find: md`(a) the corresponding stream function $\psi$; (b) the pressure difference, in Pa, between the points $(0,\ 0.5)$ and $(0,\ 2)$.`,
    assumptions: md`Steady ($\phi$ has no $t$); incompressible (water — checked below); inviscid (given); irrotational (a $\phi$ exists). The slide does not say whether gravity acts in the $xy$-plane: we take the plane **horizontal**, so both points are at the same height (the vertical case is practice problem 1 of this concept).`,
    steps: [
      {
        title: 'Velocity from φ (course convention V = ∇φ)',
        md: md`$u = \pd{\phi}{x} = 8y, \qquad v = \pd{\phi}{y} = 8x \quad (\mathrm{m/s})$`,
      },
      {
        title: 'Check the flow',
        md: md`$\nabla^2\phi = \dfrac{\partial^2\phi}{\partial x^2} + \dfrac{\partial^2\phi}{\partial y^2} = 0 + 0 = 0$, so $\nabla\cdot\vb V = 0$ — incompressible, as water should be. Irrotational automatically: $\pd{v}{x} - \pd{u}{y} = 8 - 8 = 0$.`,
      },
      {
        title: 'Stream function (u = ∂ψ/∂y, v = −∂ψ/∂x)',
        md: md`From $\pd{\psi}{y} = u = 8y$: $\ \psi = 4y^2 + f(x)$. Then $-\pd{\psi}{x} = -f'(x) = v = 8x$, so $f(x) = -4x^2 + C$:

$$
\psi = 4\left(y^2 - x^2\right) + C\quad(\mathrm{m^2/s})
$$`,
      },
      {
        title: 'Are the two points on one streamline?',
        md: md`With $C = 0$: $\psi(0,\ 0.5) = 1$ m²/s and $\psi(0,\ 2) = 16$ m²/s — **different** streamlines, with 15 m²/s of flow (per metre of depth) passing between them. Bernoulli along a streamline cannot connect them; the irrotational form (Fox Eq. 6.26) can.`,
      },
      {
        title: 'Speeds',
        md: md`$V^2 = u^2 + v^2 = 64\left(x^2 + y^2\right)$. At $(0,\ 0.5)$: $u = 4$, $v = 0$, $V_1 = 4$ m/s. At $(0,\ 2)$: $u = 16$, $v = 0$, $V_2 = 16$ m/s.`,
      },
      {
        title: 'Bernoulli between any two points (z₁ = z₂)',
        md: md`$$
p_1 - p_2 = \tfrac12\rho\left(V_2^2 - V_1^2\right) = \tfrac12(1000)(256 - 16) = 1.20\times10^{5}\ \text{Pa}
$$`,
      },
      {
        title: 'Cross-check with the whole pressure field',
        md: md`Bernoulli from the stagnation point (origin, $V = 0$, pressure $p_0$): $p = p_0 - 32\rho\left(x^2 + y^2\right)$. Then $p(0,\ 0.5) - p(0,\ 2) = 32(1000)(4 - 0.25) = 120\,000$ Pa ✓. With $\rho = 999$ kg/m³ the answer is 119 880 Pa.`,
      },
    ],
    answer: md`$\psi = 4(y^2 - x^2) + C$ m²/s; $\ p_{(0,\,0.5)} - p_{(0,\,2)} = 1.20\times10^5$ Pa $= 120$ kPa — higher at $(0,\ 0.5)$, where the flow is slower (horizontal plane assumed).`,
    insight: 'φ gives the speed everywhere, and irrotationality lets one Bernoulli constant cover every streamline — the pressure field follows without solving any momentum equation.',
  },
  {
    id: 'ex-source-pressure',
    concept: 'pressure-from-potential',
    title: 'Pressure in a plane source flow from a polar potential',
    difficulty: 2,
    given: md`A plane flow has velocity potential $\phi = 2\ln r$ (m²/s, course convention), $r$ in metres. Water ($\rho = 1000$ kg/m³), horizontal plane.`,
    find: md`The velocity field, a check of Laplace's equation, and $p(r = 1\ \text{m}) - p(r = 0.5\ \text{m})$.`,
    assumptions: md`Steady, inviscid, incompressible, irrotational ($\phi$ exists); $r > 0$.`,
    steps: [
      {
        title: 'Velocity (Lecture 10, slide 8)',
        md: md`$v_r = \pd{\phi}{r} = \dfrac{2}{r}, \qquad v_\theta = \dfrac1r\pd{\phi}{\theta} = 0$ — purely radial outflow: a **source**.`,
      },
      {
        title: 'Laplace check',
        md: md`$\dfrac1r\dfrac{d}{dr}\left(r\dfrac{d\phi}{dr}\right) = \dfrac1r\dfrac{d}{dr}(2) = 0$ ✓ (there are no $\theta$ or $z$ terms).`,
      },
      { title: 'Speeds', md: md`$V(0.5) = 2/0.5 = 4$ m/s; $\ V(1) = 2/1 = 2$ m/s.` },
      {
        title: 'Bernoulli between any two points',
        md: md`$p(1) - p(0.5) = \tfrac12\rho\left[V(0.5)^2 - V(1)^2\right] = \tfrac12(1000)(16 - 4) = 6000$ Pa.`,
      },
      {
        title: "Fox's sign gives the same answer",
        md: md`With Fox's $\vb V = -\nabla\phi$ (Eq. 6.30: $V_r = -\pd{\phi}{r}$) the same flow is described by $\phi = -2\ln r$: $V_r = 2/r$ again — identical speeds, identical $\Delta p$.`,
      },
    ],
    answer: md`$v_r = 2/r$, $v_\theta = 0$; Laplace satisfied; $p(1) - p(0.5) = 6.0$ kPa — the pressure rises outward as the flow decelerates.`,
    insight: 'In any potential flow the pressure rises wherever the flow slows down — here, outward from the source.',
  },
]

/* -------------------------------------------------------------------------------------------- practice */

export const practice: PracticeDef[] = [
  /* concept 1 */
  {
    id: 'pr-shear-lamb',
    concept: 'euler-streamline',
    difficulty: 2,
    q: md`A steady plane shear flow of water in a horizontal plane has $u = ky$, $v = 0$ with $k = 5$ s⁻¹.

(a) Find $\nabla\times\vb V$ and $\vb V\times(\nabla\times\vb V)$ at $y = 0.2$ m, and show that the latter is perpendicular to $\vb V$.
(b) Use the slide-9 gradient form to find $\partial p/\partial y$.
(c) What pressure difference $p(y = 0.2) - p(y = 0.6)$ would a careless use of Bernoulli "across streamlines" predict, and what is the true value?`,
    hint: md`$\vb V\times(\omega\hat{\mathbf k}) = (v\omega,\ -u\omega,\ 0)$. In the $y$-component of the gradient form, compare $\tfrac12\,\partial(V^2)/\partial y$ with the Lamb term.`,
    answer: md`(a) $\nabla\times\vb V = -5\hat{\mathbf k}$ s⁻¹; $\vb V\times(\nabla\times\vb V) = (0,\ 5,\ 0)$ m/s², perpendicular to $\vb V = (1,\ 0,\ 0)$ m/s. (b) $\partial p/\partial y = 0$. (c) Naive: 4000 Pa; true: 0.`,
    solution: md`(a) At $y = 0.2$ m, $\vb V = (1,\ 0,\ 0)$ m/s. $\nabla\times\vb V = \left(\pd{v}{x} - \pd{u}{y}\right)\hat{\mathbf k} = -k\hat{\mathbf k} = -5\hat{\mathbf k}$ s⁻¹. Then $\vb V\times(\nabla\times\vb V) = (u,\ 0,\ 0)\times(0,\ 0,\ -k) = (0,\ uk,\ 0) = (0,\ k^2y,\ 0) = (0,\ 5,\ 0)$ m/s². Its dot product with $\vb V$ is $1\cdot0 + 0\cdot5 = 0$: perpendicular, as a cross product must be.

(b) The $y$-component of $\frac{\nabla p}{\rho} + \frac12\nabla(V^2) + g\nabla z = \vb V\times(\nabla\times\vb V)$ (no in-plane gravity term):

$$
\frac1\rho\pd{p}{y} + \frac12\pd{}{y}\left(k^2y^2\right) = k^2y \;\Rightarrow\; \frac1\rho\pd{p}{y} = k^2y - k^2y = 0
$$

The streamlines are straight and parallel, so no sideways push is needed: **the pressure is uniform across the flow**.

(c) Careless Bernoulli across streamlines: $V(0.2) = 1$ m/s, $V(0.6) = 3$ m/s, so $p(0.2) - p(0.6) = \tfrac12(1000)(9 - 1) = 4000$ Pa. True value: $0$. The constant $B = p/\rho + V^2/2$ is larger on the faster streamline by $\tfrac12(9 - 1) = 4$ J/kg — exactly $\int_{0.2}^{0.6}k^2y\,dy$, the Lamb term integrated across the streamlines.`,
    check: [
      { label: 'magnitude of V×(∇×V) at y = 0.2 m', value: 5, units: 'm/s²' },
      { label: 'naive Bernoulli Δp', value: 4000, units: 'Pa' },
    ],
  },
  {
    id: 'pr-methane',
    concept: 'euler-streamline',
    difficulty: 3,
    q: md`Natural gas (methane, $R = 518$ J/(kg·K)) flows steadily along a horizontal streamline at constant $T = 288$ K. At point 1, $p_1 = 500$ kPa (absolute) and $V_1 = 20$ m/s; at point 2, $V_2 = 100$ m/s. Using $\int dp/\rho + V^2/2 + gz = \text{constant}$ with the isothermal relation $\rho(p)$, find $p_2$. How different is the constant-density result?`,
    hint: md`$\rho = p/(RT)$ gives $\int dp/\rho = RT\ln p$.`,
    answer: md`$p_2 = 484.2$ kPa (isothermal); constant density gives $483.9$ kPa — only 0.26 kPa different.`,
    solution: md`Isothermal ideal gas: $\int dp/\rho = RT\ln p$. Between 1 and 2 ($z_1 = z_2$): $\ln(p_2/p_1) = -(V_2^2 - V_1^2)/(2RT)$.

$RT = 518 \times 288 = 149\,184$ m²/s²; $\ V_2^2 - V_1^2 = 10\,000 - 400 = 9600$ m²/s².

$\ln(p_2/p_1) = -9600/298\,368 = -0.03218 \;\Rightarrow\; p_2/p_1 = 0.9683 \;\Rightarrow\; p_2 = 484.2$ kPa.

Constant density at $\rho_1 = p_1/(RT) = 3.352$ kg/m³: $\Delta p = \tfrac12\rho_1(V_2^2 - V_1^2) = 16.09$ kPa, so $p_2 = 483.9$ kPa. The pressure changes by only about 3 %, so the density hardly changes and the constant-density (Bernoulli) shortcut is excellent here.`,
    check: [{ label: 'p₂ (isothermal)', value: 484.2, units: 'kPa' }],
  },
  {
    id: 'pr-vertical-pipe',
    concept: 'euler-streamline',
    difficulty: 1,
    q: md`Water flows steadily **downward** through a vertical pipe of constant diameter. Treating the flow as inviscid, find $p_{\text{bottom}} - p_{\text{top}}$ for two points 3.0 m apart on the axis.`,
    hint: md`Constant diameter means constant $V$ (continuity), so $d(V^2) = 0$ in $dp/\rho + \tfrac12 d(V^2) + g\,dz = 0$.`,
    answer: md`$p_{\text{bottom}} - p_{\text{top}} = \rho g\,(3.0\ \text{m}) = 29.4$ kPa — the hydrostatic value, even though the water is moving.`,
    solution: md`Along the axis (a streamline), $dp/\rho + \tfrac12d(V^2) + g\,dz = 0$. The area is constant, so $V$ is the same everywhere and $d(V^2) = 0$, leaving $dp = -\rho g\,dz$. From top to bottom $\Delta z = -3.0$ m:

$$
p_{\text{bottom}} - p_{\text{top}} = \rho g(3.0) = 1000 \times 9.81 \times 3.0 = 29\,430\ \text{Pa} \approx 29.4\ \text{kPa}
$$

Uniform motion in a straight line needs no net force, so the pressure varies exactly hydrostatically. (In a real pipe, friction adds a further drop that the inviscid model cannot capture.)`,
    check: [{ value: 29430, units: 'Pa' }],
  },

  /* concept 2 */
  {
    id: 'pr-hose-nozzle',
    concept: 'bernoulli',
    difficulty: 1,
    q: md`A garden hose of inner diameter 20 mm ends in a nozzle with an 8 mm exit, discharging water horizontally to the atmosphere at $Q = 0.50$ L/s. Find the gauge pressure in the hose just upstream of the nozzle.`,
    hint: md`Get both speeds from $Q = VA$; the free jet is at atmospheric pressure ($p_2 = 0$ gauge).`,
    answer: md`$p_1 \approx 48.2$ kPa (gauge).`,
    solution: md`$A_1 = \pi(0.020)^2/4 = 3.142\times10^{-4}$ m², so $V_1 = 0.0005/3.142\times10^{-4} = 1.59$ m/s. $\ A_2 = \pi(0.008)^2/4 = 5.027\times10^{-5}$ m², so $V_2 = 9.95$ m/s.

Bernoulli along the axis ($z_1 = z_2$, $p_2 = 0$ gauge): $p_1 = \tfrac12\rho\left(V_2^2 - V_1^2\right) = \tfrac12(1000)(98.95 - 2.53) = 48\,200$ Pa $\approx 48.2$ kPa.`,
    check: [{ value: 48.2, units: 'kPa' }],
  },
  {
    id: 'pr-pitot',
    concept: 'bernoulli',
    difficulty: 1,
    q: md`A Pitot-static tube in an air stream ($\rho = 1.2$ kg/m³) reads a difference of 600 Pa between its stagnation (nose) and static (side) pressure taps. Find the air speed.`,
    hint: md`On the stagnation streamline the air comes to rest at the nose: $p_0 = p + \tfrac12\rho V^2$.`,
    answer: md`$V = \sqrt{2(600)/1.2} = 31.6$ m/s.`,
    solution: md`Bernoulli along the streamline that ends at the nose (a stagnation point, $V = 0$, same elevation): $p + \tfrac12\rho V^2 = p_0$. Hence

$$
V = \sqrt{\frac{2(p_0 - p)}{\rho}} = \sqrt{\frac{2\times600}{1.2}} = \sqrt{1000} = 31.6\ \text{m/s}
$$

The speed is low, so treating air as incompressible is acceptable.`,
    check: [{ value: 31.62, units: 'm/s' }],
  },
  {
    id: 'pr-siphon',
    concept: 'bernoulli',
    difficulty: 2,
    q: md`A siphon of constant diameter draws water from a large open tank. Its outlet (open to the atmosphere) is 2.5 m below the tank's free surface, and its crest is 1.5 m above the free surface. Take $p_{atm} = 101.3$ kPa and neglect losses. Find (a) the exit speed and (b) the absolute pressure at the crest.`,
    hint: md`Follow one streamline from the free surface (speed ≈ 0) over the crest to the outlet. Constant diameter ⇒ the speed at the crest equals the exit speed.`,
    answer: md`(a) $V = 7.00$ m/s; (b) $p_{\text{crest}} = 62.1$ kPa (absolute).`,
    solution: md`(a) Free surface (1): $p = p_{atm}$, $V \approx 0$, $z = 0$. Outlet (3): $p = p_{atm}$, $z = -2.5$ m. Bernoulli: $V_3 = \sqrt{2g(2.5)} = \sqrt{49.05} = 7.00$ m/s.

(b) Crest (2): $z = +1.5$ m and $V_2 = V_3$. From 1 to 2:

$$
p_2 = p_{atm} - \rho g(1.5) - \tfrac12\rho V_2^2 = 101\,300 - 14\,715 - 24\,525 = 62\,060\ \text{Pa} \approx 62.1\ \text{kPa (abs)}
$$

Since $\tfrac12\rho V_2^2 = \rho g(2.5)$, $p_2 = p_{atm} - \rho g(1.5 + 2.5)$: the crest pressure is set by its height above the **outlet** (4.0 m). With the crest about 10 m above the outlet, Bernoulli would predict a pressure near the vapour pressure — the water column would break and the siphon would stop.`,
    check: [
      { label: 'exit speed', value: 7.0, units: 'm/s' },
      { label: 'crest pressure (absolute)', value: 62.06, units: 'kPa' },
    ],
  },
  {
    id: 'pr-hgl-drop',
    concept: 'bernoulli',
    difficulty: 2,
    q: md`Water flows at $Q = 30$ L/s through a horizontal pipe that contracts from $D_1 = 150$ mm to $D_2 = 75$ mm. With no losses, the EGL is horizontal at 12.0 m above the pipe centreline. Find the height of the HGL above the centreline in each section, and the gauge pressures there.`,
    hint: md`Fox p. 221: the HGL lies $V^2/2g$ below the EGL. Get each $V$ from $Q = VA$.`,
    answer: md`HGL: 11.85 m (section 1) and 9.65 m (section 2); $p_1 = 116.3$ kPa, $p_2 = 94.7$ kPa (gauge).`,
    solution: md`$V_1 = 0.030/[\pi(0.15)^2/4] = 1.698$ m/s, so $V_1^2/2g = 0.147$ m and HGL$_1$ $= 12.0 - 0.147 = 11.85$ m.

$V_2 = 0.030/[\pi(0.075)^2/4] = 6.791$ m/s (four times $V_1$), so $V_2^2/2g = 2.350$ m and HGL$_2$ $= 12.0 - 2.350 = 9.65$ m.

With the centreline as datum ($z = 0$) the HGL height equals the pressure head: $p_1 = 9810 \times 11.853 = 116.3$ kPa and $p_2 = 9810 \times 9.650 = 94.7$ kPa (gauge). The HGL drops by 2.20 m — and only at the contraction: in each constant-diameter length it runs parallel to the EGL.`,
    check: [
      { label: 'HGL height, section 2', value: 9.65, units: 'm' },
      { label: 'p₁ (gauge)', value: 116.3, units: 'kPa' },
    ],
  },

  /* concept 3 */
  {
    id: 'pr-classify',
    concept: 'irrotational-bernoulli',
    difficulty: 2,
    q: md`For which of these steady plane flows may Bernoulli be applied between **any** two points, not only along one streamline?

(a) $u = 3x$, $v = -3y$; $\quad$ (b) $u = 2y$, $v = 4x$ (the field of Lecture 10, slide 2); $\quad$ (c) $v_r = 0$, $v_\theta = 4/r$ for $r > 0$; $\quad$ (d) $u = -\Omega y$, $v = \Omega x$.

For (b), give the value of $\partial v/\partial x - \partial u/\partial y$.`,
    hint: md`Use Fox Eq. 6.23 (Cartesian) or Eq. 6.24 (cylindrical): compute the $z$-component of $\nabla\times\vb V$.`,
    answer: md`(a) yes; (b) no — $\partial v/\partial x - \partial u/\partial y = 2$ s⁻¹; (c) yes, for $r > 0$; (d) no — $2\Omega$.`,
    solution: md`(a) $\pd{v}{x} - \pd{u}{y} = 0 - 0 = 0$ — irrotational: Bernoulli between any two points.

(b) $\pd{v}{x} - \pd{u}{y} = 4 - 2 = 2$ s⁻¹ $\ne 0$ — rotational ($\omega_z = 1$ s⁻¹): Bernoulli only along each streamline.

(c) Eq. 6.24: $\frac1r\pd{(rv_\theta)}{r} - \frac1r\pd{v_r}{\theta} = \frac1r\pd{(4)}{r} - 0 = 0$ — irrotational (a free vortex), everywhere except the axis $r = 0$ itself.

(d) $\pd{v}{x} - \pd{u}{y} = \Omega - (-\Omega) = 2\Omega \ne 0$ — rotational (a forced vortex): the constant changes from one circle to the next.`,
    check: [{ label: '∂v/∂x − ∂u/∂y for (b)', value: 2, units: '1/s' }],
  },
  {
    id: 'pr-bathtub',
    concept: 'irrotational-bernoulli',
    difficulty: 2,
    q: md`Water draining from a bath forms a free vortex $v_\theta = K/r$ with $K = 0.05$ m²/s outside a small core. Treating the flow as irrotational and neglecting radial and vertical velocities, estimate how far the free surface at $r = 0.05$ m lies below the free surface at $r = 0.5$ m.`,
    hint: md`Both surface points are at atmospheric pressure. The flow is irrotational, so Bernoulli links them even though they are on different streamlines.`,
    answer: md`About 50 mm ($\Delta z = 0.0505$ m).`,
    solution: md`Speeds: $V(0.05) = 0.05/0.05 = 1.0$ m/s; $V(0.5) = 0.05/0.5 = 0.10$ m/s. On the free surface $p = p_{atm}$ at both points, so Bernoulli between any two points (Fox Eq. 6.26) gives $\frac{V_o^2}{2g} + z_o = \frac{V_i^2}{2g} + z_i$:

$$
z_o - z_i = \frac{V_i^2 - V_o^2}{2g} = \frac{1.0 - 0.01}{19.62} = 0.0505\ \text{m}
$$

The surface dips about 5 cm toward the centre — the funnel seen over a drain. (At equal depth the pressure difference would be $\tfrac12\rho(1.0 - 0.01) = 495$ Pa.)`,
    check: [{ value: 0.0505, units: 'm' }],
  },
  {
    id: 'pr-forced-B',
    concept: 'irrotational-bernoulli',
    difficulty: 2,
    q: md`A cylindrical tank of water rotates as a rigid body at $\Omega = 6$ rad/s (a forced vortex). For two points at the same depth — one on the axis, one at $r = 0.2$ m — find (a) the pressure difference and (b) the difference in $B = p/\rho + V^2/2 + gz$. Is Bernoulli valid between these points?`,
    hint: md`Radial Euler equation for circular streamlines: $\partial p/\partial r = \rho V^2/r = \rho\Omega^2 r$.`,
    answer: md`(a) $p(0.2) - p(0) = 720$ Pa; (b) $B(0.2) - B(0) = 1.44$ J/kg $\ne 0$ — no: the flow is rotational.`,
    solution: md`(a) $p(r) - p(0) = \int_0^r\rho\Omega^2 r'\,dr' = \tfrac12\rho\Omega^2r^2 = \tfrac12(1000)(36)(0.04) = 720$ Pa.

(b) $V(0) = 0$ and $V(0.2) = \Omega r = 1.2$ m/s, at the same $z$: $B(0.2) - B(0) = \frac{720}{1000} + \frac{1.2^2}{2} = 0.72 + 0.72 = 1.44$ J/kg $= \Omega^2r^2$.

Bernoulli between the points would require $\Delta B = 0$ and would predict $p(0.2) - p(0) = -\tfrac12\rho(1.2)^2 = -720$ Pa — the wrong sign. The flow is rotational ($\nabla\times\vb V = 2\Omega = 12$ s⁻¹), so each circular streamline has its own constant.`,
    check: [
      { label: 'Δp', value: 720, units: 'Pa' },
      { label: 'ΔB', value: 1.44, units: 'J/kg' },
    ],
  },

  /* concept 4 */
  {
    id: 'pr-lec11-vertical',
    concept: 'pressure-from-potential',
    difficulty: 2,
    q: md`Redo Lecture 11, problem 2 ($\phi = 8xy$ m²/s, water, $\rho = 1000$ kg/m³) assuming instead that $y$ is the **vertical** coordinate (positive upward). Find $p_{(0,\,0.5)} - p_{(0,\,2)}$.`,
    hint: md`Keep the $\rho gz$ term with $z = y$ in Bernoulli between any two points.`,
    answer: md`$p_{(0,\,0.5)} - p_{(0,\,2)} = 120\,000 + 14\,715 = 134\,715$ Pa $\approx 135$ kPa.`,
    solution: md`Bernoulli between any two points (irrotational flow): $p_1 + \tfrac12\rho V_1^2 + \rho gy_1 = p_2 + \tfrac12\rho V_2^2 + \rho gy_2$. With $V_1 = 4$ m/s at $y_1 = 0.5$ m and $V_2 = 16$ m/s at $y_2 = 2$ m:

$$
p_1 - p_2 = \tfrac12\rho\left(V_2^2 - V_1^2\right) + \rho g\,(y_2 - y_1) = 120\,000 + 1000(9.81)(1.5) = 134\,715\ \text{Pa}
$$

The extra 14.7 kPa is the hydrostatic weight of 1.5 m of water — the lower point is deeper. Stating which assumption you used is part of a complete answer.`,
    check: [{ value: 134715, units: 'Pa' }],
  },
  {
    id: 'pr-phi-3',
    concept: 'pressure-from-potential',
    difficulty: 2,
    q: md`A plane flow of air ($\rho = 1.2$ kg/m³) has velocity potential $\phi = 3(x^2 - y^2)$ m²/s (course convention). (a) Find the stream function. (b) Find $p(1,\ 1) - p(2,\ 0)$, neglecting gravity.`,
    hint: md`$u = \partial\phi/\partial x$, $v = \partial\phi/\partial y$; then integrate $\partial\psi/\partial y = u$.`,
    answer: md`(a) $\psi = 6xy + C$; (b) $p(1,\ 1) - p(2,\ 0) = 43.2$ Pa.`,
    solution: md`(a) $u = 6x$, $v = -6y$; $\nabla^2\phi = 6 - 6 = 0$ ✓. From $\pd{\psi}{y} = 6x$: $\psi = 6xy + f(x)$; then $-\pd{\psi}{x} = -6y - f'(x) = v = -6y$, so $f' = 0$ and $\psi = 6xy + C$.

(b) $V^2 = 36(x^2 + y^2)$: $V^2(1,\ 1) = 72$ m²/s² and $V^2(2,\ 0) = 144$ m²/s². The points lie on different streamlines ($\psi = 6$ and $0$), but the flow is irrotational, so

$$
p(1,\ 1) - p(2,\ 0) = \tfrac12\rho\,(144 - 72) = \tfrac12(1.2)(72) = 43.2\ \text{Pa}
$$`,
    check: [{ value: 43.2, units: 'Pa' }],
  },
  {
    id: 'pr-zero-gauge',
    concept: 'pressure-from-potential',
    difficulty: 2,
    q: md`In the Lecture 11 flow $\phi = 8xy$ (water, horizontal plane), the gauge pressure at the stagnation point (the origin) is 200 kPa. How far from the origin along the $y$-axis does the gauge pressure fall to zero?`,
    hint: md`$p = p_0 - \tfrac12\rho V^2$ with $V = 8r$.`,
    answer: md`$y = 2.5$ m.`,
    solution: md`Bernoulli from the stagnation point: $p = p_0 - \tfrac12\rho(64)(x^2 + y^2)$, i.e. $p = p_0 - 32\,000\,y^2$ (Pa, $y$ in m) on the $y$-axis. Setting $p = 0$: $y^2 = 200\,000/32\,000 = 6.25$, so $y = 2.5$ m. The isobars of this flow are circles centred on the stagnation point.`,
    check: [{ value: 2.5, units: 'm' }],
  },
]

/* -------------------------------------------------------------------------------------------- quiz */

export const quiz: QuizQ[] = [
  {
    id: 'q-lamb-perp',
    concept: 'euler-streamline',
    difficulty: 2,
    src: L10,
    q: md`On slide 10, why does $[\vb V\times(\nabla\times\vb V)]\cdot d\vb s$ vanish when $d\vb s$ is taken along a streamline?`,
    options: [
      md`$\vb V\times(\nabla\times\vb V)$ is perpendicular to $\vb V$, and on a streamline $d\vb s$ is parallel to $\vb V$`,
      md`The flow is assumed irrotational, so $\nabla\times\vb V = 0$`,
      md`Steady flow makes $\nabla\times\vb V = 0$`,
      md`The term is second order in $d\vb s$ and can be neglected`,
    ],
    answer: 0,
    explain: md`A cross product is perpendicular to both of its factors, so $\vb V\times(\nabla\times\vb V)\perp\vb V$; on a streamline $d\vb s\parallel\vb V$, so the dot product is zero **even in rotational flow**. Irrotationality is a stronger assumption, used only to extend Bernoulli across streamlines; steadiness says nothing about vorticity.`,
  },
  {
    id: 'q-compressible-need',
    concept: 'euler-streamline',
    difficulty: 1,
    q: md`To use $\int dp/\rho + V^2/2 + gz = \text{constant}$ for a gas, what extra information is needed?`,
    options: [
      'A relation between density and pressure along the streamline (e.g. isothermal or isentropic)',
      'The vorticity of the flow',
      'The viscosity of the gas',
      'The stream function of the flow',
    ],
    answer: 0,
    explain: 'The integral ∫dp/ρ can only be evaluated if ρ is known as a function of p along the streamline — the process relation. Vorticity matters only for using one constant across streamlines; viscosity has already been set to zero; ψ is not needed.',
  },
  {
    id: 'q-gravity',
    concept: 'euler-streamline',
    difficulty: 1,
    src: L9,
    q: md`Slide 9 writes $\vb g = -g\nabla z$. What does this assume about $z$?`,
    options: [
      'z is the vertical coordinate, measured positive upward',
      'z is measured positive downward, along gravity',
      'z is the distance measured along the streamline',
      'z is the depth below a free surface',
    ],
    answer: 0,
    explain: md`With $z$ up, $\nabla z = \hat{\mathbf k}$ and $-g\nabla z = -g\hat{\mathbf k}$ points down, as gravity does (slide 9: $0\hat{\mathbf i} + 0\hat{\mathbf j} - g\hat{\mathbf k}$). With $z$ pointing down the sign would flip; $z$ is not a coordinate along the streamline.`,
  },
  {
    id: 'q-steps-assume',
    concept: 'euler-streamline',
    difficulty: 2,
    src: L910,
    q: md`Which assumptions have been used by the time slide 10 reaches $\dfrac{dp}{\rho} + \dfrac12d(V^2) + g\,dz = 0$?`,
    options: [
      'steady, inviscid, along a streamline (density may still vary)',
      'steady, inviscid, incompressible, irrotational',
      'steady, incompressible, along a streamline (viscosity allowed)',
      'unsteady, inviscid, along a streamline',
    ],
    answer: 0,
    explain: 'Euler (inviscid) → steady (∂V/∂t = 0) → dot with ds along a streamline. ρ is still inside ∫dp/ρ: incompressibility enters only on slide 11, and irrotationality is never assumed on these slides.',
  },
  {
    id: 'q-not-assumption',
    concept: 'bernoulli',
    difficulty: 1,
    src: L11,
    q: md`Which of these is **not** required for $p/\rho + V^2/2 + gz = \text{constant along a streamline}$?`,
    options: ['Irrotational flow', 'Steady flow', 'Inviscid (frictionless) flow', 'Incompressible flow'],
    answer: 0,
    explain: 'Along a single streamline only steady, inviscid and incompressible flow are needed. Irrotationality is required only to use the same constant on different streamlines (Fox Eq. 6.26).',
  },
  {
    id: 'q-contraction',
    concept: 'bernoulli',
    difficulty: 1,
    q: md`Water in a horizontal pipe speeds up from 2 m/s to 4 m/s through a contraction. According to Bernoulli, the pressure…`,
    options: ['falls by 6 kPa', 'rises by 6 kPa', 'falls by 2 kPa', 'stays the same, because the pipe is horizontal'],
    answer: 0,
    explain: md`$p_1 - p_2 = \tfrac12\rho\left(V_2^2 - V_1^2\right) = \tfrac12(1000)(16 - 4) = 6000$ Pa: the drop pays for the kinetic energy. "2 kPa" comes from the wrong expression $\tfrac12\rho(V_2 - V_1)^2$; a horizontal pipe removes only the $gz$ term.`,
  },
  {
    id: 'q-hgl',
    concept: 'bernoulli',
    difficulty: 1,
    src: F221,
    q: md`How are the hydraulic grade line (HGL) and the energy grade line (EGL) of a pipe flow related?`,
    options: [
      'The HGL is always below the EGL by V²/2g',
      'The HGL is always above the EGL by V²/2g',
      'The HGL is below the EGL by p/γ',
      'They coincide whenever the pipe is horizontal',
    ],
    answer: 0,
    explain: 'Fox p. 221: the HGL is always lower than the EGL by V²/2g. EGL = p/γ + V²/2g + z and HGL = p/γ + z, so the gap is the velocity head — it vanishes only where V = 0, not because the pipe is horizontal.',
  },
  {
    id: 'q-head-units',
    concept: 'bernoulli',
    difficulty: 1,
    q: md`In $\dfrac{p}{\gamma} + \dfrac{V^2}{2g} + z = \text{constant}$, every term has units of…`,
    options: ['metres (energy per unit weight)', 'pascals (energy per unit volume)', 'J/kg (energy per unit mass)', 'm/s (a speed)'],
    answer: 0,
    explain: 'Dividing p/ρ + V²/2 + gz (J/kg) by g gives J/N = m: a "head", the height of a liquid column. Pascals belong to the form multiplied by ρ.',
  },
  {
    id: 'q-irrot-any',
    concept: 'irrotational-bernoulli',
    difficulty: 1,
    src: F222,
    q: md`In a steady, inviscid, incompressible flow that is also irrotational, Bernoulli's equation can be applied…`,
    options: [
      'between any two points in the flow, with one constant',
      'only between points on the same streamline',
      'only between points on the same vortex line',
      'only between points at the same elevation',
    ],
    answer: 0,
    explain: 'Fox Eq. 6.26: with ∇ × V = 0, Euler can be dotted with an arbitrary displacement dr, so the constant is the same on all streamlines. "Same streamline only" is the restriction for rotational flow.',
  },
  {
    id: 'q-why-irrot',
    concept: 'irrotational-bernoulli',
    difficulty: 2,
    src: F221,
    q: md`According to Fox, why are inviscid flows irrotational unless the particles were rotating initially?`,
    options: [
      'Only shear stresses can generate particle rotation, and an inviscid fluid has none',
      'Pressure forces always cancel any existing rotation',
      'Gravity removes rotation from inviscid fluids',
      'Continuity forbids rotation in incompressible flow',
    ],
    answer: 0,
    explain: 'Pressure acts normal to a surface — through the centre of a small spherical particle — so it cannot spin it, and gravity acts at the centre of mass. Only shear stresses exert a torque. Continuity says nothing about rotation: u = ky is incompressible yet rotational.',
  },
  {
    id: 'q-forced-B',
    concept: 'irrotational-bernoulli',
    difficulty: 2,
    q: md`In a forced vortex (rigid-body rotation, $V = \Omega r$), the Bernoulli constant $B = p/\rho + V^2/2 + gz$ is…`,
    options: [
      'the same along each circular streamline, but larger on outer streamlines',
      'the same everywhere in the flow',
      'zero everywhere',
      'different at different points of the same streamline',
    ],
    answer: 0,
    explain: md`Along each circle the steady inviscid result holds, so $B$ is constant on it; across circles $B$ grows as $\Omega^2r^2$ (at equal height) because the flow is rotational, $\nabla\times\vb V = 2\Omega$. "The same everywhere" would need irrotational flow.`,
  },
  {
    id: 'q-arbitrary-dr',
    concept: 'irrotational-bernoulli',
    difficulty: 2,
    src: F222,
    q: md`In Fox's derivation of Eq. 6.26, Eq. 6.25 is dotted with…`,
    options: [
      'an arbitrary displacement dr, in any direction',
      'a displacement along the streamline only',
      'the velocity vector V',
      'the vorticity vector ∇ × V',
    ],
    answer: 0,
    explain: 'Once the Lamb term has vanished (irrotational flow), every term of Eq. 6.25 is a gradient, so dotting with any dr gives exact differentials. That freedom of direction is exactly why the result holds between any two points.',
  },
  {
    id: 'q-lec11-streamlines',
    concept: 'pressure-from-potential',
    difficulty: 2,
    src: P2S,
    q: md`In Lecture 11, problem 2 ($\phi = 8xy$), the points $(0,\ 0.5)$ and $(0,\ 2)$…`,
    options: [
      md`lie on different streamlines ($\psi = 1$ and $16$ m²/s), so the irrotational form of Bernoulli is needed`,
      md`lie on the same streamline, so ordinary Bernoulli is enough`,
      md`cannot be linked by Bernoulli at all, because the flow is rotational`,
      md`have the same speed, so their pressures are equal`,
    ],
    answer: 0,
    explain: md`$\psi = 4(y^2 - x^2)$ gives 1 and 16 m²/s — different streamlines. But $\phi$ exists, so the flow is irrotational and one Bernoulli constant covers both points. The speeds are 4 and 16 m/s, not equal.`,
  },
  {
    id: 'q-sign-indep',
    concept: 'pressure-from-potential',
    difficulty: 2,
    src: F222,
    q: md`A textbook uses $\vb V = -\nabla\phi$ (Fox Eq. 6.27) instead of the course's $\vb V = \nabla\phi$. For the same physical flow, the pressure difference between two points obtained from Bernoulli…`,
    options: [
      'is unchanged, because only V² enters Bernoulli',
      'changes sign',
      'doubles',
      'cannot be found without first converting to the course convention',
    ],
    answer: 0,
    explain: 'For the same flow the two conventions give potentials of opposite sign but the same velocity; and even reversing every velocity would leave V² unchanged. Bernoulli uses only V², so Δp is identical.',
  },
  {
    id: 'q-max-pressure',
    concept: 'pressure-from-potential',
    difficulty: 1,
    q: md`For the corner flow $\phi = Axy$ in a horizontal plane, where is the pressure highest?`,
    options: [
      'At the stagnation point, the origin',
      'Far from the origin, where the flow is fastest',
      'Everywhere equal, because the flow is irrotational',
      'Only on the dividing streamlines y = ±x',
    ],
    answer: 0,
    explain: md`$p = p_0 - \tfrac12\rho A^2(x^2 + y^2)$ is largest where $V = 0$. Irrotational means one Bernoulli **constant**, not one pressure — the pressure still trades off against the speed.`,
  },
  {
    id: 'q-phi-exists',
    concept: 'pressure-from-potential',
    difficulty: 1,
    src: F222,
    q: md`What does the existence of a velocity potential $\phi$ guarantee?`,
    options: ['That the flow is irrotational', 'That the flow is incompressible', 'That the flow is steady', 'That the flow is two-dimensional'],
    answer: 0,
    explain: 'curl(grad φ) ≡ 0 (Fox Eq. 6.28), so a velocity derived from φ is irrotational automatically. Incompressibility is an extra condition (then ∇²φ = 0); φ also exists in 3-D and in unsteady flow.',
  },
]

/* -------------------------------------------------------------------------------------------- flashcards */

export const flashcards: Flashcard[] = [
  {
    id: 'fc-identity',
    front: md`The vector identity used on Lecture 10, slide 9`,
    back: md`$(\vb V\cdot\nabla)\vb V = \tfrac12\nabla(\vb V\cdot\vb V) - \vb V\times(\nabla\times\vb V)$ — a gradient plus a term perpendicular to $\vb V$.`,
    src: L9,
  },
  {
    id: 'fc-lamb-perp',
    front: md`Why does $[\vb V\times(\nabla\times\vb V)]\cdot d\vb s = 0$ along a streamline?`,
    back: md`$\vb V\times(\nabla\times\vb V)$ is perpendicular to $\vb V$, and on a streamline $d\vb s\parallel\vb V$. No irrotationality is needed.`,
    src: L10,
  },
  {
    id: 'fc-compressible',
    front: md`Steady, inviscid integral along a streamline (density may vary)`,
    back: md`$\int dp/\rho + V^2/2 + gz = \text{constant}$ — evaluating $\int dp/\rho$ needs a relation $\rho(p)$.`,
    src: L10,
  },
  {
    id: 'fc-assumptions',
    front: md`The four assumptions of $p/\rho + V^2/2 + gz = \text{constant}$`,
    back: md`Steady · inviscid · incompressible · along a streamline. (Add **irrotational** to use one constant for the whole field.)`,
    src: L11,
  },
  {
    id: 'fc-head-form',
    front: md`Bernoulli in head form, and the meaning of each term`,
    back: md`$\frac{p_1}{\gamma} + \frac{V_1^2}{2g} + z_1 = \frac{p_2}{\gamma} + \frac{V_2^2}{2g} + z_2$: pressure head + velocity head + elevation head = total head $H$ (all in metres, $\gamma = \rho g$).`,
    src: L11,
  },
  {
    id: 'fc-hgl-egl',
    front: md`HGL vs EGL (Fox p. 221)`,
    back: md`The HGL lies $V^2/2g$ below the EGL. $V$ is set by the whole system, but **changes** in $V$ occur only where the diameter changes.`,
    src: F221,
  },
  {
    id: 'fc-irrot-any',
    front: md`When is the Bernoulli constant the same on every streamline?`,
    back: md`When the flow is also **irrotational** ($\nabla\times\vb V = 0$): Fox Eq. 6.26 then holds between any two points.`,
    src: F222,
  },
  {
    id: 'fc-shear-rotation',
    front: md`What can make fluid particles rotate (Fox p. 221)?`,
    back: md`Only shear stresses. So an inviscid flow is irrotational unless its particles were already rotating.`,
    src: F221,
  },
  {
    id: 'fc-phi-sign',
    front: md`Course vs Fox velocity potential`,
    back: md`Course (Lecture 10): $\vb V = +\nabla\phi$, $u = \pd{\phi}{x}$. Fox: $\vb V = -\nabla\phi$ (Eq. 6.27), so $\phi$ decreases in the flow direction. Speeds and Bernoulli pressures are identical.`,
    src: [{ doc: 'lec10', pages: '6' }, { doc: 'fox', pages: '222', note: 'Eq. (6.27)' }],
  },
  {
    id: 'fc-lec11',
    front: md`Lecture 11, problem 2: $\phi = 8xy$, water — results`,
    back: md`$u = 8y$, $v = 8x$; $\psi = 4(y^2 - x^2) + C$; $p_{(0,\,0.5)} - p_{(0,\,2)} = \tfrac12\rho(16^2 - 4^2) = 1.20\times10^5$ Pa (horizontal plane, $\rho = 1000$ kg/m³).`,
    src: P2S,
  },
  {
    id: 'fc-pressure-map',
    front: md`Pressure field of a potential flow (horizontal plane)`,
    back: md`$p = p_0 - \tfrac12\rho\lvert\nabla\phi\rvert^2$, with $p_0$ the stagnation pressure: highest pressure where the flow stops, lowest where it is fastest.`,
  },
  {
    id: 'fc-curl-grad',
    front: md`Why does a velocity potential guarantee irrotational flow?`,
    back: md`$\nabla\times\nabla\phi \equiv 0$ for every smooth $\phi$ (Fox Eq. 6.28): the curl of a gradient vanishes identically.`,
    src: { doc: 'fox', pages: '222', note: 'Eq. (6.28)' },
  },
]

/* -------------------------------------------------------------------------------------------- takeaways */

export const takeaways: string[] = [
  md`**Steady Euler, gradient form** (Lecture 10, slide 9): $\frac{\nabla p}{\rho} + \frac12\nabla(V^2) + g\nabla z = \vb V\times(\nabla\times\vb V)$ — built from $\partial\vb V/\partial t = 0$, the vector identity and $\vb g = -g\nabla z$.`,
  md`**Along a streamline** $d\vb s\parallel\vb V$ while $\vb V\times(\nabla\times\vb V)\perp\vb V$, so the right side drops out: $\frac{dp}{\rho} + \frac12d(V^2) + g\,dz = 0$ and $\int\frac{dp}{\rho} + \frac{V^2}{2} + gz = \text{const}$ (slide 10). A gas needs $\rho(p)$.`,
  md`**Bernoulli** (slide 11; Fox Eq. 6.8): $\frac{p}{\rho} + \frac{V^2}{2} + gz = \text{const}$ along a streamline — steady, inviscid, incompressible. Head form: $\frac{p}{\gamma} + \frac{V^2}{2g} + z = H$, every term in metres.`,
  md`**Grade lines** (Fox p. 221): the HGL lies $V^2/2g$ below the EGL; velocity — and so the gap — changes only where the diameter changes. Without losses the EGL is flat.`,
  md`**Rotational flow:** each streamline has its own constant ($\nabla B = \vb V\times(\nabla\times\vb V)$). In a forced vortex "Bernoulli across streamlines" even gets the **sign** of $\Delta p$ wrong.`,
  md`**Irrotational flow** ($\nabla\times\vb V = 0$, Fox Eqs. 6.22–6.24): Euler can be dotted with any $d\vec r$, so one constant holds **between any two points** (Fox Eq. 6.26). Only shear stresses create rotation, so inviscid flows that start without rotation stay irrotational.`,
  md`**Pressure from φ:** $\vb V = \nabla\phi$ (course) → check $\nabla^2\phi = 0$ → $V^2 = \lvert\nabla\phi\rvert^2$ → $p = p_0 - \tfrac12\rho V^2 - \rho g(z - z_0)$. A velocity potential exists only for irrotational flow (Fox Eq. 6.28), so this is always legitimate.`,
  md`**Lecture 11, problem 2:** $\phi = 8xy \Rightarrow \psi = 4(y^2 - x^2)$; the points $(0,\ 0.5)$ and $(0,\ 2)$ lie on different streamlines ($\psi = 1$, $16$), and $\Delta p = \tfrac12\rho(256 - 16) = 120$ kPa (horizontal plane; 134.7 kPa if $y$ is vertical).`,
  md`**Sign conventions:** Fox writes $\vb V = -\nabla\phi$ (Eqs. 6.27, 6.29, 6.30). Speeds and pressures do not depend on the choice, but $\psi$ obtained from $\phi$ does — stay with one convention throughout.`,
  md`**Exam traps:** Bernoulli across streamlines of a rotational flow; forgetting $\rho g\Delta z$ (or not stating that the plane is horizontal); mixing gauge and absolute pressure; using Bernoulli through a pump, turbine or a region dominated by friction.`,
]

/* -------------------------------------------------------------------------------------------- content */

export default function Content() {
  return (
    <>
      {/* ================================================================ 1. euler-streamline */}
      <Concept id="euler-streamline">
        <Step kind="intro" src={L910}>
          <Md>{md`
            Lecture 10 turned the Cauchy equations into **Euler's equation** for an inviscid fluid (slide 5): Newton's second law per unit volume with every shear stress switched off. Slide 9 restates it:

            $$
            \rho\vb g - \nabla p = \rho\left[\pd{\vb V}{t} + (\vb V\cdot\nabla)\vb V\right].
            $$

            That is a vector partial differential equation — hard to solve in general. Slides 9–10 ("Inviscid Flow (Steady)") show that for **steady** flow it can be integrated **once along a streamline**, leaving an algebraic link between pressure, speed and height. The route has four moves:

            1. **Steady flow:** drop $\partial\vb V/\partial t$.
            2. **Vector identity:** $(\vb V\cdot\nabla)\vb V = \tfrac12\nabla(\vb V\cdot\vb V) - \vb V\times(\nabla\times\vb V)$.
            3. **Gravity as a gradient:** $\vb g = -g\nabla z$, with $z$ vertical and positive upward.
            4. **Project on a streamline:** dot with the line element $d\vb s$ along a streamline. The curl term drops out and the rest integrates to $\int dp/\rho + V^2/2 + gz = \text{constant}$.
          `}</Md>
          <Callout kind="def" title="Streamline and line element ds">
            <Md>{md`A **streamline** is a line everywhere tangent to the velocity. The line element along it, $d\vb s = dx\,\hat{\mathbf i} + dy\,\hat{\mathbf j} + dz\,\hat{\mathbf k}$, therefore points the same way as $\vb V$: $d\vb s \parallel \vb V$. In steady flow streamlines do not move, so a particle travels along one streamline for ever.`}</Md>
          </Callout>
          <Callout kind="key" title="Why this matters">
            <Md>{md`This one integration produces the most used equation in fluid mechanics — Bernoulli's equation (concept 2) — and, when the flow is irrotational, a way to get the whole pressure field from a velocity potential (concepts 3–4). The derivation also tells you exactly **when** the result may be used: steady, inviscid, along a streamline (and, for the simple form, constant density).`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Follow one particle.** In steady flow a particle slides along its streamline like a bead on a fixed, frictionless wire. Only two forces can push it **along** the wire: the pressure difference between its back and its front, and the component of its weight. Whatever they do changes its speed. Per unit mass that is

            $$
            \underbrace{\frac{dp}{\rho}}_{\text{pressure work}} + \underbrace{\tfrac12\,d(V^2)}_{\text{kinetic energy}} + \underbrace{g\,dz}_{\text{potential energy}} = 0 ,
            $$

            an energy ledger: the mechanical energy $B = p/\rho + V^2/2 + gz$ carried by the particle cannot change, because nothing (no friction, no pump) can add or remove any.

            **The sideways term.** $\vb V\times(\nabla\times\vb V)$ is the part of the acceleration that only **turns** the particle in a rotating flow. Like the magnetic force on a moving charge, which is always perpendicular to the charge's velocity, it can bend the path but can do no work along it — so it vanishes from the equation along the streamline. Across streamlines it is very much alive: it is the reason $B$ may differ from one streamline to the next.
          `}</Md>
          <Callout kind="tip" title="Two halves of the convective acceleration">
            <Md>{md`Along the path, the acceleration of the particle is $V\,dV/ds = \tfrac12\,d(V^2)/ds$ — the streamwise part of $\tfrac12\nabla(V^2)$. The Lamb vector $\vb V\times(\nabla\times\vb V)$ contributes only to the acceleration **normal** to the path. Splitting $(\vb V\cdot\nabla)\vb V$ this way is the whole point of the identity.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={L910}>
          <Figure
            caption="Slides 9–10, recreated: (a)–(b) the arc length ds and the vector line element ds along a streamline; (c) gravity as g = −g∇z; (d) V × (∇ × V) is perpendicular to the plane containing V and ∇ × V — so it has no component along a streamline."
            src={L910}
          >
            <EulerSlideFigures />
          </Figure>
          <FlowSteps
            steps={[
              { title: "Euler's equation (inviscid)", md: md`$\rho\vb g - \nabla p = \rho\left[\pd{\vb V}{t} + (\vb V\cdot\nabla)\vb V\right]$`, tone: 'slate' },
              { title: 'Steady flow', md: md`$\pd{\vb V}{t} = 0 \;\Rightarrow\; \rho\vb g - \nabla p = \rho(\vb V\cdot\nabla)\vb V$`, tone: 'indigo' },
              { title: 'Identity + gravity as a gradient', md: md`$(\vb V\cdot\nabla)\vb V = \tfrac12\nabla(V^2) - \vb V\times(\nabla\times\vb V)$, $\ \vb g = -g\nabla z$`, tone: 'cyan' },
              { title: 'Gradient form', md: md`$\frac{\nabla p}{\rho} + \frac12\nabla(V^2) + g\nabla z = \vb V\times(\nabla\times\vb V)$`, tone: 'violet' },
              { title: 'Dot with ds along a streamline', md: md`right side $= 0$ because $\vb V\times(\nabla\times\vb V)\perp d\vb s$; $\ \frac{dp}{\rho} + \frac12d(V^2) + g\,dz = 0$`, tone: 'amber' },
              { title: 'Integrate', md: md`$\int\frac{dp}{\rho} + \frac{V^2}{2} + gz = \text{constant}$ along the streamline`, tone: 'emerald' },
            ]}
          />
        </Step>

        <Step kind="equations" src={L910}>
          <Tabs
            tabs={[
              {
                label: '1 · Start: Euler, steady',
                content: (
                  <div className="space-y-4">
                    <FormulaCard id="euler-vector" />
                    <FormulaCard id="euler-steady" />
                  </div>
                ),
              },
              {
                label: '2 · Two tools',
                content: (
                  <div className="space-y-4">
                    <FormulaCard id="vector-identity" />
                    <FormulaCard id="gravity-potential" />
                  </div>
                ),
              },
              {
                label: '3 · Gradient form',
                content: (
                  <div className="space-y-4">
                    <FormulaCard id="euler-substituted" />
                    <FormulaCard id="euler-gradient" />
                  </div>
                ),
              },
              {
                label: '4 · Along a streamline',
                content: (
                  <div className="space-y-4">
                    <FormulaCard id="euler-dot-ds" />
                    <FormulaCard id="ds-total-differential" />
                    <FormulaCard id="euler-streamline-differential" />
                    <FormulaCard id="bernoulli-compressible" />
                  </div>
                ),
              },
            ]}
          />
          <Callout kind="warning" title="Common mistake">
            <Md>{md`"The curl term vanishes because the flow is irrotational" — **no**. Slides 9–10 never assume irrotational flow. The term vanishes along a streamline for a purely geometric reason: it is perpendicular to $\vb V$. That is why the result holds only **along** a streamline (concept 3 removes this restriction).`}</Md>
          </Callout>
        </Step>

        <Step kind="derivation" src={L910}>
          <Derivation
            title="Slides 9–10: from Euler's equation to the streamline integral"
            steps={[
              { md: md`$\rho\vb g - \nabla p = \rho\left[\pd{\vb V}{t} + (\vb V\cdot\nabla)\vb V\right]$`, why: "Euler's equation (slide 5), inviscid" },
              { md: md`$\rho\vb g - \nabla p = \rho(\vb V\cdot\nabla)\vb V$`, why: 'steady flow: ∂V/∂t = 0' },
              { md: md`$-\rho g\nabla z - \nabla p = \dfrac{\rho}{2}\nabla(\vb V\cdot\vb V) - \rho\,\vb V\times(\nabla\times\vb V)$`, why: 'vector identity and g = −g∇z' },
              { md: md`$\dfrac{\nabla p}{\rho} + \dfrac12\nabla(V^2) + g\nabla z = \vb V\times(\nabla\times\vb V)$`, why: 'divide by −ρ and rearrange; V·V = V²' },
              { md: md`$\dfrac{\nabla p}{\rho}\cdot d\vb s + \dfrac12\nabla(V^2)\cdot d\vb s + g\nabla z\cdot d\vb s = [\vb V\times(\nabla\times\vb V)]\cdot d\vb s$`, why: 'dot with ds along a streamline (slide 10)' },
              { md: md`$\nabla p\cdot d\vb s = dp,\quad \nabla(V^2)\cdot d\vb s = d(V^2),\quad \nabla z\cdot d\vb s = dz$`, why: 'gradient · displacement = change (chain rule); the slide writes out the p-term' },
              { md: md`$[\vb V\times(\nabla\times\vb V)]\cdot d\vb s = 0$`, why: md`the Lamb vector is $\perp \vb V$, and $d\vb s \parallel \vb V$ on a streamline (slide 10 figure)` },
              { md: md`$\dfrac{dp}{\rho} + \dfrac12d(V^2) + g\,dz = 0$`, why: 'steady, inviscid, along a streamline' },
              { md: md`$\displaystyle\int\frac{dp}{\rho} + \frac{V^2}{2} + gz = \text{constant}$`, why: 'integrate along the streamline; ρ may still vary' },
            ]}
          />
          <Supplement title="Where the vector identity comes from">
            <Md>{md`In index form, $[\vb V\times(\nabla\times\vb V)]_i = V_j\,\partial_i V_j - V_j\,\partial_j V_i$ (using $\epsilon_{ijk}\epsilon_{klm} = \delta_{il}\delta_{jm} - \delta_{im}\delta_{jl}$). The first term is $\tfrac12\partial_i(V_jV_j) = \tfrac12[\nabla(V^2)]_i$ and the second is $[(\vb V\cdot\nabla)\vb V]_i$. Rearranging gives slide 9's identity. Example 1 below checks it numerically for a forced vortex.`}</Md>
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-forced-vortex-terms" />
          <ExampleCard id="ex-isothermal-gas" />
        </Step>

        <Step kind="interactive">
          <LambProjector />
        </Step>

        <Step kind="practice">
          <PracticeList concept="euler-streamline" />
          <QuickCheck ids={['q-lamb-perp', 'q-steps-assume']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Steady + inviscid + identity + $\vb g = -g\nabla z$ give the gradient form $\frac{\nabla p}{\rho} + \frac12\nabla(V^2) + g\nabla z = \vb V\times(\nabla\times\vb V)$.`,
              md`Along a streamline $d\vb s\parallel\vb V$, and the Lamb vector $\vb V\times(\nabla\times\vb V)$ is perpendicular to $\vb V$ — so the right side drops out **without** assuming irrotational flow.`,
              md`Result: $\frac{dp}{\rho} + \frac12d(V^2) + g\,dz = 0$, i.e. $\int\frac{dp}{\rho} + \frac{V^2}{2} + gz = \text{constant}$ along the streamline.`,
              md`The compressible form needs a relation $\rho(p)$ (isothermal gas: $\int dp/\rho = RT\ln p$); for small pressure changes it reduces to Bernoulli.`,
              md`**Exam trap:** quoting the integral without its conditions — steady, inviscid, along a streamline. The constant can differ from one streamline to another.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ================================================================ 2. bernoulli */}
      <Concept id="bernoulli">
        <Step kind="intro" src={[L11, F221]}>
          <Md>{md`
            Slide 11 ("Inviscid Flow (Steady + Incompressible)") adds the last assumption. If the density is **constant**, the pressure integral is simply $\int dp/\rho = p/\rho$, and the streamline integral becomes

            $$
            \frac{p}{\rho} + \frac{V^2}{2} + gz = \text{constant along a streamline}.
            $$

            Dividing by $g$ and writing it between two points 1 and 2 on the same streamline, with the specific weight $\gamma = \rho g$, gives the **head form**

            $$
            \frac{p_1}{\gamma} + \frac{V_1^2}{2g} + z_1 = \frac{p_2}{\gamma} + \frac{V_2^2}{2g} + z_2 .
            $$

            The slide does not name it; Fox (p. 221, Eq. 6.8) calls it **the Bernoulli equation**, obtained by integrating Euler's equation along a streamline for steady, incompressible, inviscid flow.
          `}</Md>
          <Callout kind="key" title="The four conditions — memorise them as a set">
            <Md>{md`
              1. **Steady** flow.
              2. **Inviscid** — no friction (and no pump or turbine between the points).
              3. **Incompressible** — $\rho$ constant.
              4. **Along a streamline** — points 1 and 2 on the same streamline.

              In general the constant changes from streamline to streamline (Fox p. 221); concept 3 shows when it does not.
            `}</Md>
          </Callout>
          <Supplement title="Where it fails in practice">
            <Md>{md`Inside boundary layers and wakes (friction matters), across pumps and turbines (shaft work), through shocks or wherever a gas changes density appreciably (Mach number above about 0.3), and in strongly unsteady flows (Fox's §6.5 treats the unsteady form, but only on the web). Outside such regions it is remarkably accurate.`}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **An energy budget per kilogram.** Each kilogram of fluid on a streamline carries three kinds of mechanical energy — pressure energy $p/\rho$, kinetic energy $V^2/2$ and potential energy $gz$ — and with no friction and no machines the total cannot change. Speeding up must be paid for by a fall in pressure or in height.

            **Heads as liquid columns.** In the head form each term is a height. Drill a small hole in the pipe wall and attach a vertical tube (a *piezometer*): the liquid rises to $p/\gamma$ above the tapping — the **hydraulic grade line**. Point a bent tube upstream (a *Pitot tube*): the liquid that stops at its mouth converts its velocity head too and rises to the **energy grade line** $p/\gamma + V^2/2g + z$.

            **"Fast means low pressure" — on one streamline.** In a horizontal venturi the throat is fastest and has the lowest pressure. Be careful extending this across streamlines: between different streamlines the rule holds only if the flow is irrotational (concept 3).
          `}</Md>
          <Compare
            items={[
              { title: 'Per unit mass (J/kg)', md: md`$\frac{p}{\rho} + \frac{V^2}{2} + gz$ — slide 11's form; natural for derivations.`, tone: 'indigo' },
              { title: 'Per unit volume (Pa)', md: md`$p + \tfrac12\rho V^2 + \rho gz$ — static + dynamic + hydrostatic pressure; natural for Pitot tubes and $\Delta p$.`, tone: 'cyan' },
              { title: 'Per unit weight (m)', md: md`$\frac{p}{\gamma} + \frac{V^2}{2g} + z = H$ — heads; natural for pipes, tanks, EGL and HGL.`, tone: 'amber' },
            ]}
          />
        </Step>

        <Step kind="visual" src={F221}>
          <Figure caption="✦ EGL and HGL along a horizontal venturi (schematic, heights not to scale). Piezometers rise to the HGL, Pitot tubes to the EGL; the gap is the velocity head V²/2g, largest at the throat.">
            <HeadLinesFigure />
          </Figure>
          <Callout kind="note" title="Fox p. 221 — the closing remark on grade lines">
            <Md>{md`The **HGL is always lower than the EGL by the distance $V^2/2g$.** The *value* of $V$ depends on the whole system (reservoir height, pipe diameter, …), but *changes* in $V$ occur **only where the diameter changes**. So in each constant-diameter length the HGL runs parallel to the EGL, and it steps down or up only at contractions and expansions — exactly what the figure shows.`}</Md>
          </Callout>
        </Step>

        <Step kind="equations" src={L11}>
          <FormulaCard id="bernoulli-streamline" />
          <FormulaCard id="bernoulli-head" />
          <Derivation
            title="Slide 11: from the streamline integral to Bernoulli"
            steps={[
              { md: md`$\displaystyle\int\frac{dp}{\rho} + \frac{V^2}{2} + gz = \text{constant}$`, why: 'slide 10: steady, inviscid, along a streamline' },
              { md: md`$\displaystyle\int\frac{dp}{\rho} = \frac{1}{\rho}\int dp = \frac{p}{\rho} + \text{const}$`, why: 'incompressible: ρ is constant' },
              { md: md`$\dfrac{p}{\rho} + \dfrac{V^2}{2} + gz = \text{constant along a streamline}$`, why: 'energy per unit mass (J/kg)' },
              { md: md`$\dfrac{p_1}{\gamma} + \dfrac{V_1^2}{2g} + z_1 = \dfrac{p_2}{\gamma} + \dfrac{V_2^2}{2g} + z_2$`, why: 'divide by g; γ = ρg; two points on the streamline' },
            ]}
          />
          <FormulaCard id="bernoulli-pressure" />
          <FormulaCard id="hgl-egl" />
          <FormulaCard id="continuity-q" />
          <Callout kind="exam" title="Exam recipe">
            <Md>{md`(1) Draw the streamline and pick points where most quantities are known (free surfaces: $p = p_{atm}$, $V \approx 0$; free jets: $p = p_{atm}$; stagnation points: $V = 0$). (2) Choose a datum for $z$. (3) Get speeds from $Q = VA$. (4) Write Bernoulli and solve. (5) State the assumptions — examiners look for them.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-inclined-reducer" />
          <ExampleCard id="ex-torricelli" />
        </Step>

        <Step kind="interactive">
          <BernoulliDuct />
        </Step>

        <Step kind="practice">
          <PracticeList concept="bernoulli" />
          <QuickCheck ids={['q-not-assumption', 'q-hgl']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Constant density turns $\int dp/\rho$ into $p/\rho$: $\frac{p}{\rho} + \frac{V^2}{2} + gz = \text{const}$ along a streamline (slide 11; Fox Eq. 6.8).`,
              md`Four conditions: steady, inviscid, incompressible, along a streamline — no pumps, turbines or friction between the two points.`,
              md`Head form $\frac{p}{\gamma} + \frac{V^2}{2g} + z = H$: pressure, velocity and elevation heads, all in metres; pressure form $p + \tfrac12\rho V^2 + \rho gz$ in pascals.`,
              md`HGL $=$ EGL $- V^2/2g$ (Fox p. 221). Velocity — and the HGL — changes only where the diameter changes; the inviscid EGL is flat.`,
              md`**Exam traps:** $\tfrac12\rho(V_2 - V_1)^2$ instead of $\tfrac12\rho(V_2^2 - V_1^2)$; mixing gauge and absolute pressures; forgetting $z$ in inclined pipes; very low predicted pressures mean cavitation, not "negative pressure".`,
            ]}
          />
        </Step>
      </Concept>

      {/* ================================================================ 3. irrotational-bernoulli */}
      <Concept id="irrotational-bernoulli">
        <Step kind="intro" src={F2212}>
          <Md>{md`
            Fox's **§6.6 Irrotational Flow** (a starred section — the book notes it can be omitted without loss of continuity) asks: when may Bernoulli link points on **different** streamlines?

            **Irrotational flow** is flow in which the fluid particles do not rotate, $\boldsymbol\omega = 0$, i.e. $\nabla\times\vb V = 0$ (Eq. 6.22; components in Eqs. 6.23 and 6.24). The only stresses that can make a particle rotate are **shear stresses**; hence an inviscid flow (zero shear stress) is irrotational **unless its particles were rotating to begin with**.

            Bernoulli's equation (6.8) holds between any two points on the **same** streamline, and in general its constant varies from streamline to streamline. If, besides being steady, incompressible and inviscid, the flow is **also irrotational**, Bernoulli applies **between any and all points**: the constant is the same for every streamline. Fox shows this by starting from Euler's equation in the form (6.9), using the vector identity, dropping the curl term (6.25), and then dotting with an **arbitrary** displacement $d\vec r$ — not necessarily along a streamline — to reach Eq. 6.26.
          `}</Md>
          <Callout kind="note" title="Fox §6.5 is web-only">
            <Md>{md`The heading just before §6.6 on Fox p. 221, *Unsteady Bernoulli Equation: Integration of Euler's Equation Along a Streamline*, is published only on the web — its content is not in the book. This course uses the steady form only.`}</Md>
          </Callout>
          <Supplement title="The same conclusion from the lecture's gradient form">
            <Md>{md`Slide 9's equation $\frac{\nabla p}{\rho} + \frac12\nabla(V^2) + g\nabla z = \vb V\times(\nabla\times\vb V)$ says it directly: if $\nabla\times\vb V = 0$ the right-hand side is zero **at every point and in every direction**, so the dot product with $d\vb s$ vanishes for any $d\vb s$ — not just one along $\vb V$.`}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Merry-go-round vs Ferris wheel.** Both carry their riders round in circles. A rider on a merry-go-round also *turns* — after half a revolution she faces the other way: that is rotational motion (a forced vortex). A Ferris-wheel gondola travels round the same circle but always stays upright — its orientation never changes: that is **irrotational** motion (a free vortex, $V = K/r$). Irrotationality is about particles **spinning**, not about streamlines being curved. (Strictly, a small cross of fluid in a free vortex does deform: its tangential arm turns one way at $K/r^2$ and its radial arm the other way at the same rate, so its **average** orientation — the particle rotation $\omega_z$ — stays zero.)

            **Why one constant?** Picture all the fluid coming from a large, calm reservoir: every particle starts with the same $B = p/\rho + V^2/2 + gz$. Along each streamline $B$ cannot change (concept 1). Across streamlines $B$ changes only through the Lamb term $\vb V\times(\nabla\times\vb V)$ — and with no shear stress nothing can ever give the particles rotation. So every streamline keeps the same $B$: one constant for the whole field.

            **What goes wrong in rotational flow.** In a forced vortex the outer streamlines are faster *and* at higher pressure (the pressure gradient must push particles inward to keep them on their circles). One constant would demand lower pressure where the speed is higher — exactly backwards.
          `}</Md>
          <Callout kind="tip">
            <Md>{md`Irrotational flow can have strongly **curved** streamlines (free vortex, flow round a cylinder), and rotational flow can have perfectly **straight** ones (the shear flow $u = ky$). Test $\nabla\times\vb V$ — never judge by the shape of the streamlines.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={F2212}>
          <Figure caption="✦ Forced vortex (left): elements turn with the flow and every circle has its own Bernoulli constant. Free vortex (right): elements have no net rotation (their arms shear equally in opposite senses; the crosses show the average orientation), ∇ × V = 0, and one constant holds everywhere outside the core.">
            <VortexFigure />
          </Figure>
          <FlowSteps
            steps={[
              { title: "Fox Eq. 6.9 — Euler's equation (steady)", md: md`$(\vb V\cdot\nabla)\vb V = -\frac1\rho\nabla p - g\hat{\mathbf k}$`, tone: 'slate' },
              { title: 'Vector identity', md: md`$(\vb V\cdot\nabla)\vb V = \tfrac12\nabla(\vb V\cdot\vb V) - \vb V\times(\nabla\times\vb V)$`, tone: 'indigo' },
              { title: 'Irrotational: ∇ × V = 0 → Eq. 6.25', md: md`$\tfrac12\nabla(V^2) = -\frac1\rho\nabla p - g\hat{\mathbf k}$ — only gradients remain`, tone: 'violet' },
              { title: 'Dot with an ARBITRARY dr', md: md`$\tfrac12d(V^2) = -\frac{dp}{\rho} - g\,dz$ for any direction`, tone: 'amber' },
              { title: 'Integrate (ρ constant) → Eq. 6.26', md: md`$\frac{p}{\rho} + \frac{V^2}{2} + gz = \text{constant}$ — between any two points`, tone: 'emerald' },
            ]}
          />
        </Step>

        <Step kind="equations" src={F2212}>
          <FormulaCard id="irrot-curl" />
          <Tabs
            tabs={[
              { label: 'Cartesian (6.23)', content: <FormulaCard id="irrot-cartesian" /> },
              { label: 'Cylindrical (6.24)', content: <FormulaCard id="irrot-cyl" /> },
            ]}
          />
          <FormulaCard id="euler-fox" />
          <FormulaCard id="euler-irrot" />
          <FormulaCard id="any-displacement" />
          <FormulaCard id="bernoulli-any" />
          <Derivation
            title="Fox pp. 221–222: Bernoulli between any two points"
            steps={[
              { md: md`$(\vb V\cdot\nabla)\vb V = -\dfrac1\rho\nabla p - g\hat{\mathbf k}$`, why: "Eq. 6.9, Euler's equation (steady, inviscid)" },
              { md: md`$(\vb V\cdot\nabla)\vb V = \tfrac12\nabla(\vb V\cdot\vb V) - \vb V\times(\nabla\times\vb V)$`, why: 'vector identity' },
              { md: md`$(\vb V\cdot\nabla)\vb V = \tfrac12\nabla(\vb V\cdot\vb V)$`, why: 'irrotational: ∇ × V = 0 (Eq. 6.22)' },
              { md: md`$\tfrac12\nabla(V^2) = -\dfrac1\rho\nabla p - g\hat{\mathbf k}$`, why: 'Eq. 6.25' },
              { md: md`$\tfrac12\nabla(V^2)\cdot d\vec r = -\dfrac1\rho\nabla p\cdot d\vec r - g\hat{\mathbf k}\cdot d\vec r$`, why: 'dot with an arbitrary dr = dx î + dy ĵ + dz k̂' },
              { md: md`$\tfrac12d(V^2) = -\dfrac{dp}{\rho} - g\,dz \;\Leftrightarrow\; \dfrac{dp}{\rho} + \tfrac12d(V^2) + g\,dz = 0$`, why: '∇f · dr = df, k̂ · dr = dz' },
              { md: md`$\dfrac{p}{\rho} + \dfrac{V^2}{2} + gz = \text{constant}$`, why: 'integrate, ρ constant — Eq. 6.26, valid between ANY two points' },
            ]}
          />
          <FormulaCard id="bernoulli-gradient" />
          <Callout kind="exam" title="Decision rule">
            <Md>{md`Two points on the **same** streamline → Bernoulli (steady, inviscid, incompressible). Two points on **different** streamlines → first show $\nabla\times\vb V = 0$ (Eq. 6.23/6.24) — or that a velocity potential exists — and quote Eq. 6.26. If the flow is rotational, Bernoulli **cannot** link them; use Euler's equation across the streamlines instead.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-vortex-pair" />
        </Step>

        <Step kind="interactive">
          <VortexCompare />
        </Step>

        <Step kind="practice">
          <PracticeList concept="irrotational-bernoulli" />
          <QuickCheck ids={['q-irrot-any', 'q-why-irrot']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Irrotational: $\nabla\times\vb V = 0$ (Fox Eq. 6.22); Cartesian $\pd{v}{x} - \pd{u}{y} = 0$ etc. (6.23), cylindrical form (6.24).`,
              md`Only shear stresses spin fluid particles, so an inviscid flow that starts without rotation stays irrotational (Fox p. 221).`,
              md`With $\nabla\times\vb V = 0$ Euler's equation contains only gradients (Eq. 6.25), so it can be dotted with **any** $d\vec r$: $\frac{p}{\rho} + \frac{V^2}{2} + gz$ is one constant for the whole field (Eq. 6.26).`,
              md`In rotational flow the constant varies across streamlines, $\nabla B = \vb V\times(\nabla\times\vb V)$; in a forced vortex the naive answer even has the wrong sign.`,
              md`**Exam trap:** judging rotation by curved streamlines. A free vortex is irrotational; a straight shear flow is rotational.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ================================================================ 4. pressure-from-potential */}
      <Concept id="pressure-from-potential">
        <Step kind="intro" src={[P2, F222]}>
          <Md>{md`
            Lecture 11, slide 2 (problem 2) puts the whole chain to work. An inviscid flow of water has the velocity potential $8xy$ (m²/s, with $x$ and $y$ in metres); the task is to find the stream function and then the pressure difference, in Pa, between the points $(0,\ 0.5)$ and $(0,\ 2)$. The slide gives the statement only — the solution below is written for this platform.

            The plan works for **any** given velocity potential:

            1. **Velocity:** $\vb V = \nabla\phi$ (course convention, Lecture 10 slide 6).
            2. **Checks:** a velocity potential exists only for irrotational flow (Fox p. 222: $\nabla\times\nabla\phi \equiv 0$, Eq. 6.28); $\nabla^2\phi = 0$ confirms incompressibility (Lecture 10 slide 7).
            3. **Stream function**, if asked: integrate $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$ (Lecture 9 slide 12).
            4. **Pressure:** irrotational ⇒ Bernoulli between **any** two points (Fox Eq. 6.26), using $V^2 = \lvert\nabla\phi\rvert^2$.
          `}</Md>
          <Callout kind="warning" title="Two sign conventions for φ">
            <Md>{md`The course defines $\vb V = +\nabla\phi$. Fox defines $\vb V = -\nabla\phi$ (Eq. 6.27), inserting the minus sign only so that $\phi$ **decreases in the flow direction** — like temperature decreasing in the direction of heat flow. Read "$\phi = 8xy$" with Fox's sign and the flow runs the other way and $\psi$ changes sign — but **speeds and pressures are unchanged**, because Bernoulli contains only $V^2$.`}</Md>
          </Callout>
          <Callout kind="note" title="Where is irrotational flow a good model? (Fox p. 222)">
            <Md>{md`Irrotationality may be a valid assumption in regions of a flow where viscous forces are negligible — for example the region outside the boundary layer in the flow over a wing, which can be analysed to find the **lift** the wing produces. The theory of irrotational flow is developed for an imaginary **ideal fluid** whose viscosity is exactly zero; since its velocity field can be described by $\phi$, this is the **potential flow** named on Lecture 10, slide 7.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **The pressure map is the speed map, upside down.** In an irrotational flow one Bernoulli constant covers everything, so (in a horizontal plane) $p = p_0 - \tfrac12\rho V^2$: wherever the fluid is fast the pressure is low, and the **highest pressure sits at a stagnation point**, where the flow stops.

            **Read the speed off the equipotentials.** $\lvert\nabla\phi\rvert = V$: where the lines of constant $\phi$ crowd together the flow is fast and the pressure is low; where they spread apart, it is slow and the pressure is high. For $\phi = 8xy$ the speed is $V = 8r$ — it grows linearly with distance from the stagnation point at the origin, so the isobars are circles round the origin and the pressure falls off as $r^2$.

            **Why the streamlines matter.** The two Lecture 11 points sit on different streamlines ($\psi = 1$ and $16$ m²/s). Without irrotationality we would have no way to connect them with Bernoulli at all.
          `}</Md>
        </Step>

        <Step kind="visual" src={P2}>
          <Figure caption={md`✦ The Lecture 11 flow $\phi = 8xy$: streamlines $\psi = 4(y^2 - x^2)$ (solid) and equipotentials (dashed) cross at right angles. The two points lie on different streamlines, $\psi = 1$ and $\psi = 16$ m²/s.`}>
            <FlowField
              x={[-2.5, 2.5]}
              y={[-1, 2.5]}
              psi={lecPsi}
              phi={lecPhi}
              psiLevels={LEC_PSI_LEVELS}
              phiLevels={LEC_PHI_LEVELS}
              equipotentials
              highlight={LEC_HL}
              markers={LEC_MARKERS}
              quiver={11}
              particles={50}
              maxHeight={340}
            />
          </Figure>
          <Figure caption={md`✦ Pressure along the $y$-axis from Bernoulli between any two points: $p - p_0 = -32\rho y^2$ (water, horizontal plane). The two Lecture 11 points differ by $128 - 8 = 120$ kPa.`}>
            <Plot
              height={240}
              x={{ label: md`$y$ along the axis $x = 0$ (m)`, domain: [0, 2.5] }}
              y={{ label: md`$p - p_0$ (kPa)`, domain: [-210, 10] }}
              series={[{ label: md`$p - p_0 = -32\rho y^2$`, fn: (y) => -32 * y * y, color: 'var(--plot-1)', width: 2.4 }]}
              marks={[
                { x: 0.5, y: -8, label: '(0, 0.5): −8 kPa', color: 'var(--plot-5)' },
                { x: 2, y: -128, label: '(0, 2): −128 kPa', color: 'var(--plot-4)' },
              ]}
              hlines={[{ y: 0, label: 'stagnation pressure p₀' }]}
            />
          </Figure>
          <FlowSteps
            steps={[
              { title: 'Given φ', md: md`$\phi = 8xy$ (m²/s)`, tone: 'slate' },
              { title: 'Velocity', md: md`$u = \phi_x = 8y,\ v = \phi_y = 8x$`, tone: 'indigo' },
              { title: 'Checks', md: md`$\nabla^2\phi = 0$ (incompressible); $\phi$ exists ⇒ irrotational`, tone: 'cyan' },
              { title: 'Stream function', md: md`$\psi = 4(y^2 - x^2) + C$ ⇒ the points lie on $\psi = 1$ and $\psi = 16$`, tone: 'violet' },
              { title: 'Bernoulli between any two points', md: md`$p_1 - p_2 = \tfrac12\rho(V_2^2 - V_1^2) = 120$ kPa`, tone: 'emerald' },
            ]}
          />
        </Step>

        <Step kind="equations" src={[P2, F222]}>
          <Tabs
            tabs={[
              {
                label: 'Course conventions',
                content: (
                  <div className="space-y-4">
                    <FormulaCard id="phi-lecture" />
                    <FormulaCard id="phi-lecture-cyl" />
                    <FormulaCard id="laplace-phi" />
                    <FormulaCard id="psi-cartesian" />
                  </div>
                ),
              },
              {
                label: "Fox's velocity potential (p. 222)",
                content: (
                  <div className="space-y-4">
                    <FormulaCard id="phi-fox" />
                    <FormulaCard id="curl-grad" />
                    <FormulaCard id="phi-fox-cartesian" />
                    <FormulaCard id="grad-cyl" />
                    <FormulaCard id="phi-fox-cyl" />
                  </div>
                ),
              },
            ]}
          />
          <FormulaCard id="pressure-from-phi" />
          <Callout kind="note" title="Fox p. 222 in one line">
            <Md>{md`Because $\nabla\times\nabla\phi \equiv 0$ for **every** $\phi$, a velocity potential exists **only** for irrotational flow — and whenever one exists, Eq. 6.26 applies between any two points.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-lec11-p2" />
          <ExampleCard id="ex-source-pressure" />
        </Step>

        <Step kind="interactive">
          <CornerPressureMap />
        </Step>

        <Step kind="practice">
          <PracticeList concept="pressure-from-potential" />
          <QuickCheck ids={['q-lec11-streamlines', 'q-sign-indep']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Recipe: $\phi \to \vb V = \nabla\phi \to$ check $\nabla^2\phi = 0 \to \psi$ (if asked) $\to$ Bernoulli between any two points with $V^2 = \lvert\nabla\phi\rvert^2$.`,
              md`A velocity potential guarantees irrotational flow (Fox Eq. 6.28), so the single-constant Bernoulli (Eq. 6.26) is always legitimate for potential flows.`,
              md`Lecture 11: $\phi = 8xy \Rightarrow \psi = 4(y^2 - x^2)$, $V = 8r$, $p = p_0 - 32\rho r^2$; $p_{(0,\,0.5)} - p_{(0,\,2)} = 120$ kPa (horizontal), $134.7$ kPa if $y$ is vertical.`,
              md`Fox's $\vb V = -\nabla\phi$ flips $\phi$ (and the $\psi$ you derive from it) but not $V^2$ or any pressure difference.`,
              md`**Exam trap:** not stating the elevation assumption — the slide is silent on gravity, so say "horizontal plane" (or include $\rho g\Delta y$).`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
